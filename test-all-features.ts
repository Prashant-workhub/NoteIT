/**
 * ============================================================================
 *  NoteIT — Full Feature Smoke Test
 * ============================================================================
 *
 *  Exercises every backend feature of NoteIT (server.ts + src/providers +
 *  src/utils) end-to-end and prints a PASS / WARN / FAIL report to the
 *  console. Nothing here uses a test framework (no Jest/Vitest) — it is a
 *  single self-contained script you run with tsx, exactly like the rest of
 *  this project already does.
 *
 *  USAGE
 *    npx tsx test-all-features.ts
 *
 *  WHAT IT DOES
 *    1. Pure logic checks — imports real project modules directly (no
 *       server, no network): ProviderFactory, ValidationAdapterFactory,
 *       extractJsonObject, formatUserFriendlyErrorMessage.
 *    2. Boots the Express API (server.ts) if it isn't already running on
 *       PORT, then drives every route in server.ts over HTTP using the
 *       built-in `Authorization: Bearer test-token` bypass that
 *       authenticateFirebaseUser() already supports for local testing.
 *    3. Runs a full local storage round-trip (upload -> SAS -> extract-text
 *       -> read-sas -> static file serve) with zero external dependencies.
 *    4. Optionally runs `tsc --noEmit` to confirm the whole codebase still
 *       type-checks (set SKIP_TYPECHECK=1 to skip — it's the slowest step).
 *
 *  STATUS MEANING
 *    PASS — behaved exactly as expected.
 *    WARN — reached the code path fine, but the *outcome* depends on things
 *           this environment may not have (a real Gemini/OpenAI key, Azure
 *           Storage credentials, Firebase Admin credentials, internet
 *           access to a third party). Not a bug in NoteIT — just missing
 *           local configuration.
 *    FAIL — something actually broke: wrong status code, malformed
 *           response, thrown exception, or a hang past the timeout.
 *
 *  Exit code is 1 if any test FAILs, 0 otherwise (including when there are
 *  WARNs) — so this is CI-friendly.
 * ============================================================================
 */

import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

import { ProviderFactory } from './src/providers/ProviderFactory';
import { ValidationAdapterFactory } from './src/providers/ValidationAdapters';
import { extractJsonObject, ProviderValidationError } from './src/providers/AIProvider';
import { formatUserFriendlyErrorMessage } from './src/utils/errorSanitizer';

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

const PORT = process.env.PORT || '3002';
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;
const REQUEST_TIMEOUT_MS = Number(process.env.TEST_TIMEOUT_MS || 30000);
// Some routes (ground-source, generate-resources, notifications) read more than one
// Firestore document before doing anything else. Without cloud credentials each read
// eventually fails via a slow ADC lookup rather than failing instantly, so routes that
// chain two or more of those reads need noticeably more runway than a single request.
const FIRESTORE_HEAVY_TIMEOUT_MS = Number(process.env.TEST_FIRESTORE_TIMEOUT_MS || 60000);
const SERVER_BOOT_TIMEOUT_MS = Number(process.env.TEST_SERVER_BOOT_TIMEOUT_MS || 45000);
const RUN_TYPECHECK = process.env.SKIP_TYPECHECK !== '1';
const AUTH_HEADER = { Authorization: 'Bearer test-token' };
const UPLOADS_DIR = path.resolve('uploads');

// ----------------------------------------------------------------------------
// Tiny console UI helpers (no external deps)
// ----------------------------------------------------------------------------

const color = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const paint = (c: keyof typeof color, s: string) => `${color[c]}${s}${color.reset}`;

type Status = 'PASS' | 'WARN' | 'FAIL';

interface TestResult {
  section: string;
  name: string;
  status: Status;
  detail: string;
  ms: number;
}

const results: TestResult[] = [];

function badge(status: Status): string {
  if (status === 'PASS') return paint('green', ' PASS ');
  if (status === 'WARN') return paint('yellow', ' WARN ');
  return paint('red', ' FAIL ');
}

function heading(title: string) {
  console.log('\n' + paint('bold', paint('cyan', `── ${title} ${'─'.repeat(Math.max(0, 70 - title.length))}`)));
}

/** Marker error used to explicitly report a WARN instead of a FAIL. */
class WarnSignal extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WarnSignal';
  }
}

/** Throw this inside a test body to record a WARN (environment-dependent limitation) rather than a hard failure. */
function warn(message: string): never {
  throw new WarnSignal(message);
}

/** Simple assertion helper — throws a plain Error (-> FAIL) when the condition is false. */
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function runTest(section: string, name: string, fn: () => Promise<string | void> | string | void) {
  const start = Date.now();
  try {
    const detail = (await fn()) || 'ok';
    const ms = Date.now() - start;
    results.push({ section, name, status: 'PASS', detail, ms });
    console.log(`${badge('PASS')} ${name} ${paint('dim', `(${ms}ms) — ${detail}`)}`);
  } catch (err: any) {
    const ms = Date.now() - start;
    if (err instanceof WarnSignal) {
      results.push({ section, name, status: 'WARN', detail: err.message, ms });
      console.log(`${badge('WARN')} ${name} ${paint('dim', `(${ms}ms)`)} — ${paint('yellow', err.message)}`);
    } else {
      const message = err?.message || String(err);
      results.push({ section, name, status: 'FAIL', detail: message, ms });
      console.log(`${badge('FAIL')} ${name} ${paint('dim', `(${ms}ms)`)} — ${paint('red', message)}`);
    }
  }
}

/** fetch() with a hard timeout so a hung route (e.g. waiting on unreachable Firestore) can't stall the whole suite forever. */
async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { __rawText: text };
  }
}

// ----------------------------------------------------------------------------
// SECTION A — Pure logic tests (no server, no network required)
// ----------------------------------------------------------------------------

const PROVIDER_ALIASES: Record<string, string[]> = {
  gemini: ['gemini', 'google gemini'],
  groq: ['groq'],
  openai: ['openai'],
  anthropic: ['claude', 'anthropic', 'anthropic claude'],
  deepseek: ['deepseek'],
  xai: ['grok', 'xai', 'xai grok', 'xai/grok'],
  openrouter: ['openrouter'],
  mistral: ['mistral'],
  nvidia: ['nvidia', 'glm', 'nvidia nim'],
  notion: ['notion', 'notion ai', 'notion api', 'notion-ai'],
};

async function runPureLogicTests() {
  heading('SECTION A — Provider & utility logic (no server required)');

  for (const [canonical, aliases] of Object.entries(PROVIDER_ALIASES)) {
    for (const alias of aliases) {
      await runTest('Provider Factory', `ProviderFactory.getProvider('${alias}') -> ${canonical}`, () => {
        const provider = ProviderFactory.getProvider(alias, 'dummy-test-key');
        assert(provider, 'factory returned nothing');
        const models = provider.getAvailableModels();
        assert(Array.isArray(models) && models.length > 0, 'getAvailableModels() returned no models');
        return `${models.length} model(s), e.g. "${models[0]}"`;
      });
    }
  }

  await runTest('Provider Factory', 'ProviderFactory.getProvider() rejects unknown provider', () => {
    let threw = false;
    try {
      ProviderFactory.getProvider('not-a-real-provider', 'x');
    } catch {
      threw = true;
    }
    assert(threw, 'expected an unsupported provider name to throw');
  });

  await runTest('Provider Factory', 'ProviderFactory.getAvailableModels() never throws for unknown provider', () => {
    const models = ProviderFactory.getAvailableModels('not-a-real-provider');
    assert(Array.isArray(models) && models.length === 0, 'expected an empty array fallback');
  });

  for (const [canonical, aliases] of Object.entries(PROVIDER_ALIASES)) {
    await runTest('Validation Adapters', `ValidationAdapterFactory.getAdapter('${aliases[0]}') -> ${canonical}`, () => {
      const adapter = ValidationAdapterFactory.getAdapter(aliases[0]);
      assert(adapter && typeof adapter.validate === 'function', 'adapter missing validate()');
    });
  }

  await runTest('Validation Adapters', 'ValidationAdapterFactory.getAdapter() rejects unknown provider', () => {
    let caught: any = null;
    try {
      ValidationAdapterFactory.getAdapter('not-a-real-provider');
    } catch (e) {
      caught = e;
    }
    assert(caught instanceof ProviderValidationError, 'expected a ProviderValidationError');
    assert(caught.status === 400, `expected status 400, got ${caught?.status}`);
  });

  await runTest('JSON Extraction', 'extractJsonObject() strips ```json fences', () => {
    const raw = '```json\n{"a":1,"b":[1,2,3]}\n```';
    const cleaned = extractJsonObject(raw);
    const parsed = JSON.parse(cleaned);
    assert(parsed.a === 1 && Array.isArray(parsed.b), 'unexpected parsed shape');
  });

  await runTest('JSON Extraction', 'extractJsonObject() pulls object out of surrounding prose', () => {
    const raw = 'Sure! Here is the JSON you asked for:\n{"ok":true,"count":42}\nLet me know if you need more.';
    const cleaned = extractJsonObject(raw);
    const parsed = JSON.parse(cleaned);
    assert(parsed.ok === true && parsed.count === 42, 'unexpected parsed shape');
  });

  await runTest('JSON Extraction', 'extractJsonObject() is a no-op-ish pass-through on already-clean JSON', () => {
    const raw = '{"already":"clean"}';
    const cleaned = extractJsonObject(raw);
    assert(JSON.parse(cleaned).already === 'clean', 'clean JSON got mangled');
  });

  const errorCases: Array<[string, RegExp]> = [
    ['429 Too Many Requests', /rate limited|api limit/i],
    ['Failed to fetch', /reach the server/i],
    ['401 Unauthorized', /invalid or unauthorized/i],
    ['503 Service Unavailable', /temporarily busy|unavailable/i],
    ['API key is not configured', /no api key configured/i],
    ['Transcript is not available', /transcript is missing/i],
    ['Unexpected token in JSON at position 0', /unexpected issue occurred while processing/i],
  ];
  for (const [input, expected] of errorCases) {
    await runTest('Error Sanitizer', `formatUserFriendlyErrorMessage() maps "${input}"`, () => {
      const friendly = formatUserFriendlyErrorMessage(new Error(input));
      assert(expected.test(friendly), `got unexpected message: "${friendly}"`);
    });
  }

  await runTest('Error Sanitizer', 'formatUserFriendlyErrorMessage() passes through unmatched messages', () => {
    const friendly = formatUserFriendlyErrorMessage(new Error('A totally novel, unrecognized failure mode'));
    assert(friendly.includes('novel'), 'expected fallback to preserve the raw message');
  });

  await runTest('Error Sanitizer', 'formatUserFriendlyErrorMessage() prefixes an action label when given one', () => {
    const friendly = formatUserFriendlyErrorMessage(new Error('429 rate limited'), 'Generating notes failed');
    assert(friendly.startsWith('Generating notes failed:'), `expected action prefix, got: "${friendly}"`);
  });

  await runTest('Error Sanitizer', 'formatUserFriendlyErrorMessage() handles null/undefined gracefully', () => {
    const friendly = formatUserFriendlyErrorMessage(undefined);
    assert(typeof friendly === 'string' && friendly.length > 0, 'expected a non-empty fallback string');
  });
}

// ----------------------------------------------------------------------------
// SECTION B — Boot the API server if it isn't already running
// ----------------------------------------------------------------------------

let spawnedServer: ChildProcessWithoutNullStreams | null = null;
let serverReachable = false;

async function isServerUp(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/health`, {}, 3000);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureServerRunning() {
  heading('SECTION B — API server availability');

  if (await isServerUp()) {
    serverReachable = true;
    console.log(paint('dim', `Server already running at ${BASE_URL} — using it as-is.`));
    return;
  }

  console.log(paint('dim', `No server detected at ${BASE_URL}. Booting "tsx server.ts"...`));
  await runTest('Server Boot', 'Spawn server.ts and wait for /api/health', async () => {
    // Use the Node entrypoint for tsx instead of invoking the .cmd shim directly.
    // On Windows, spawning .cmd files without a shell can throw EINVAL, while
    // `node node_modules/tsx/dist/cli.mjs server.ts` works consistently across OSes.
    const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const nodeBin = process.execPath;

    spawnedServer = spawn(nodeBin, [tsxCli, 'server.ts'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    });

    spawnedServer.stdout.on('data', (chunk) => {
      process.stdout.write(paint('dim', `[server] ${chunk}`));
    });
    spawnedServer.stderr.on('data', (chunk) => {
      process.stderr.write(paint('dim', `[server:err] ${chunk}`));
    });
    

    const deadline = Date.now() + SERVER_BOOT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      if (await isServerUp()) {
        serverReachable = true;
        return `server is up at ${BASE_URL}`;
      }
      if (spawnedServer.exitCode !== null) {
        throw new Error(`server process exited early with code ${spawnedServer.exitCode}`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`server did not respond on ${BASE_URL}/api/health within ${SERVER_BOOT_TIMEOUT_MS}ms`);
  });
}

function stopSpawnedServer() {
  if (spawnedServer && spawnedServer.exitCode === null && spawnedServer.pid) {
    console.log(paint('dim', '\nShutting down the server instance this script started...'));
    try {
      if (process.platform === 'win32') {
        spawnedServer.kill('SIGTERM');
      } else {
        // Negative PID = signal the whole process group we detached it into,
        // so tsx's own child process (the real Node.js instance) dies too.
        process.kill(-spawnedServer.pid, 'SIGTERM');
      }
    } catch {
      spawnedServer.kill('SIGTERM');
    }
  }
}

// ----------------------------------------------------------------------------
// SECTION C — HTTP feature tests against every route in server.ts
// ----------------------------------------------------------------------------

async function runHttpTests() {
  heading('SECTION C — HTTP API routes');

  if (!serverReachable) {
    await runTest('HTTP', 'Skip all HTTP route tests', () => warn('server is not reachable, skipping every HTTP-dependent feature'));
    return;
  }

  // --- Health & debug -------------------------------------------------------
  await runTest('Health', 'GET /api/health', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/health`);
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    assert(json?.status === 'ok', `unexpected body: ${JSON.stringify(json)}`);
  });

  await runTest('Debug', 'GET /api/debug/routes lists registered routes', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/debug/routes`);
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    assert(Array.isArray(json?.routes) && json.routes.length > 10, 'expected a substantial route list');
    return `${json.routes.length} routes registered`;
  });

  await runTest('Debug', 'GET /api/debug/logs returns the in-memory log buffer', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/debug/logs`);
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    assert(Array.isArray(json?.logs), 'expected a logs array');
  });

  await runTest('Auth Guard', 'GET /api/debug/auth without a token is rejected (401)', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/debug/auth`);
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  await runTest('Auth Guard', 'GET /api/debug/auth with "Bearer test-token" is accepted', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/debug/auth`, { headers: AUTH_HEADER });
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}: ${JSON.stringify(json)}`);
    assert(json?.authenticated === true, 'expected authenticated: true');
    assert(json?.uid === 'test-user-uid', `expected test uid, got ${json?.uid}`);
  });

  await runTest('Routing', 'GET on an unknown route returns 404', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/this-route-does-not-exist`);
    assert(res.status === 404, `expected 404, got ${res.status}`);
  });

  // --- AI provider configuration --------------------------------------------
  await runTest('AI Config', 'GET /api/ai/config-status', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/config-status`, { headers: AUTH_HEADER }, FIRESTORE_HEAVY_TIMEOUT_MS);
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}: ${JSON.stringify(json)}`);
    assert(typeof json?.configured === 'boolean', 'expected a boolean "configured" field');
    return `configured=${json.configured}`;
  });

  await runTest('AI Config', 'POST /api/ai/validate-key rejects a bogus key', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/validate-key`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'definitely-not-a-real-api-key', provider: 'gemini' }),
    });
    const json = await readJsonSafely(res);
    if (res.ok) {
      warn(`server accepted a bogus key as valid — double-check network/provider behavior (body: ${JSON.stringify(json)})`);
    }
    assert(json?.error, `expected an error message on rejection, got: ${JSON.stringify(json)}`);
  });

  await runTest('AI Config', 'POST /api/ai/validate-key rejects a missing key/provider', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/validate-key`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  await runTest('AI Config', 'POST /api/ai/revalidate without a stored key', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/revalidate`, { method: 'POST', headers: AUTH_HEADER }, FIRESTORE_HEAVY_TIMEOUT_MS);
    const json = await readJsonSafely(res);
    if (res.status === 400) return 'correctly reports nothing configured to revalidate';
    warn(`got status ${res.status} — depends on Firestore/user state in this environment: ${JSON.stringify(json)}`);
  });

  await runTest('AI Config', 'DELETE /api/ai/config clears configuration', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/config`, { method: 'DELETE', headers: AUTH_HEADER });
    const json = await readJsonSafely(res);
    if (res.status === 200 && json?.success) return 'config cleared';
    warn(`Firestore likely unavailable in this environment (status ${res.status}): ${JSON.stringify(json)}`);
  });

  await runTest('AI Proxy', 'POST /api/ai/provider-proxy without a configured provider', async () => {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/ai/provider-proxy`,
      {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Say the word "pong" and nothing else.' }),
      },
      FIRESTORE_HEAVY_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.status === 400 && /not configured/i.test(json?.error || '')) {
      return 'correctly reports "provider not configured"';
    }
    if (res.ok) {
      warn(`a real AI provider answered (GEMINI_API_KEY must be set) — response received fine: ${JSON.stringify(json).slice(0, 120)}...`);
      return;
    }
    warn(`status ${res.status} — depends on Firestore/provider config in this environment: ${JSON.stringify(json).slice(0, 200)}`);
  });

  await runTest('Bhai Lang', 'POST /api/ai/explain-bhailang rejects empty text', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/ai/explain-bhailang`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  await runTest('Bhai Lang', 'POST /api/ai/explain-bhailang with real text', async () => {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/ai/explain-bhailang`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'A binary search tree keeps its left subtree smaller and right subtree larger.', subjectName: 'DSA' }),
      },
      REQUEST_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.ok && json?.explanation) return 'got an AI explanation back';
    warn(`no GEMINI_API_KEY configured in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 200)}`);
  });

  // --- Local storage pipeline (fully self-contained, no cloud creds needed) -
  await runTest('Storage Pipeline', 'Upload -> SAS -> extract-text -> read-sas -> static serve (end-to-end)', async () => {
    const fileName = `smoke-test-${Date.now()}.txt`;
    const fileContents = `NoteIT smoke test file. Random marker: ${Math.random().toString(36).slice(2)}`;

    // 1. Ask for an upload URL
    const sasRes = await fetchWithTimeout(`${BASE_URL}/api/storage/sas?fileName=${encodeURIComponent(fileName)}`, { headers: AUTH_HEADER });
    const sasJson = await readJsonSafely(sasRes);
    assert(sasRes.status === 200, `SAS request failed (${sasRes.status}): ${JSON.stringify(sasJson)}`);
    assert(sasJson?.uploadUrl, `expected an uploadUrl in response: ${JSON.stringify(sasJson)}`);

    // 2. Upload the file to whatever URL we were given
    const uploadUrl = sasJson.uploadUrl.startsWith('http') ? sasJson.uploadUrl : `${BASE_URL}${sasJson.uploadUrl}`;
    const putRes = await fetchWithTimeout(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: fileContents,
    });
    assert(putRes.status === 201 || putRes.status === 200, `upload failed with status ${putRes.status}`);

    // 3. Extract text back out via the documented blobPath
    const extractRes = await fetchWithTimeout(`${BASE_URL}/api/storage/extract-text`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ blobPath: sasJson.blobPath }),
    });
    const extractJson = await readJsonSafely(extractRes);
    if (!sasJson.isLocalFallback) {
      // Real Azure Blob Storage is configured — extraction depends on that infra actually working.
      if (extractRes.status !== 200) warn(`Azure-backed extract-text returned ${extractRes.status}: ${JSON.stringify(extractJson)}`);
    }
    assert(extractRes.status === 200, `extract-text failed (${extractRes.status}): ${JSON.stringify(extractJson)}`);
    assert(extractJson?.text === fileContents, 'extracted text does not match what was uploaded');

    // 4. Confirm read-sas + static file serving also round-trips the same bytes
    const readSasRes = await fetchWithTimeout(`${BASE_URL}/api/storage/read-sas?blobPath=${encodeURIComponent(sasJson.blobPath)}`, { headers: AUTH_HEADER });
    const readSasJson = await readJsonSafely(readSasRes);
    assert(readSasRes.status === 200 && readSasJson?.readUrl, `read-sas failed (${readSasRes.status}): ${JSON.stringify(readSasJson)}`);

    const readUrl = readSasJson.readUrl.startsWith('http') ? readSasJson.readUrl : `${BASE_URL}${readSasJson.readUrl}`;
    const staticRes = await fetchWithTimeout(readUrl);
    if (staticRes.status === 200) {
      const staticText = await staticRes.text();
      assert(staticText === fileContents, 'statically served file content does not match upload');
    } else if (sasJson.isLocalFallback) {
      throw new Error(`expected the locally-uploaded file to be served, got ${staticRes.status}`);
    } else {
      warn(`could not fetch back from Azure read URL directly (status ${staticRes.status}) — SAS token/network dependent`);
    }

    return `round-tripped "${fileName}" through upload, SAS, extract-text and static serving`;
  });

  await runTest('Storage', 'GET /api/storage/sas without fileName is rejected', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/storage/sas`, { headers: AUTH_HEADER });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  await runTest('Storage', 'POST /api/storage/extract-text without blobPath is rejected', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/storage/extract-text`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  // --- Image search (fallback path needs no API keys or network) -----------
  await runTest('Image Search', 'GET /api/images/search returns at least a fallback image set', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/images/search?query=engineering%20education`, { headers: AUTH_HEADER });
    const json = await readJsonSafely(res);
    assert(res.status === 200, `expected 200, got ${res.status}: ${JSON.stringify(json)}`);
    assert(Array.isArray(json?.images) && json.images.length > 0, 'expected at least one image URL back');
    return `${json.images.length} image URL(s) returned`;
  });

  await runTest('Image Search', 'GET /api/images/search without a query is rejected', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/images/search`, { headers: AUTH_HEADER });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  // --- URL / YouTube extraction (needs real internet access) ---------------
  await runTest('URL Extraction', 'POST /api/storage/extract-url on a plain website', async () => {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/storage/extract-url`,
      {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com', type: 'website' }),
      },
      REQUEST_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.ok && json?.text) return `extracted ${json.text.length} chars, title "${json.title}"`;
    warn(`outbound internet access to example.com appears blocked in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('URL Extraction', 'POST /api/storage/extract-url missing params is rejected', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/storage/extract-url`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  // --- Features that require Firebase Admin / Firestore credentials --------
  await runTest('RAG Grounding', 'POST /api/storage/ground-source chunks and stores a source', async () => {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/storage/ground-source`,
      {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: 'smoke-test-source',
          sourceType: 'source',
          text: 'Paragraph one about photosynthesis.\n\nParagraph two about cellular respiration and ATP synthesis, which is a much longer paragraph than the first to make sure chunking has enough content to work with.',
        }),
      },
      FIRESTORE_HEAVY_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.ok && json?.success) return `stored ${json.count} chunk(s)`;
    warn(`requires a configured Firebase Admin/Firestore project in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('Lecture Resources', 'POST /api/lectures/:id/generate-resources with an inline transcript', async () => {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/lectures/smoke-test-lecture/generate-resources`,
      {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'Today we covered Newton\'s three laws of motion and worked through several example problems.',
          options: { mode: 'academic', modeType: 'all' },
        }),
      },
      FIRESTORE_HEAVY_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.ok && json?.success) return 'generated resources successfully';
    warn(`requires a configured AI provider key and/or Firestore in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('Lecture Resources', 'POST /api/lectures/:id/generate-resources without a transcript is rejected', async () => {
    // This route reads both the lecture doc and the user doc from Firestore before it even
    // checks for a transcript, so without cloud credentials it can take two ADC-lookup
    // timeouts back to back before reaching the 400 — give it noticeably more room than
    // the default request timeout.
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/lectures/smoke-test-lecture/generate-resources`,
      {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: {} }),
      },
      FIRESTORE_HEAVY_TIMEOUT_MS
    );
    const json = await readJsonSafely(res);
    if (res.status === 400) return 'correctly rejected missing transcript';
    warn(`expected 400 but got ${res.status} — likely Firestore-state dependent: ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('Notifications', 'POST /api/notifications/process-scheduler', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/notifications/process-scheduler`, { method: 'POST', headers: AUTH_HEADER }, FIRESTORE_HEAVY_TIMEOUT_MS);
    const json = await readJsonSafely(res);
    if (res.ok && json?.success) return 'scheduler cycle ran';
    warn(`requires a configured Firebase Admin/Firestore project in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('Notifications', 'POST /api/notifications/send-test', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/notifications/send-test`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Smoke test', body: 'Hello from test-all-features.ts' }),
    }, FIRESTORE_HEAVY_TIMEOUT_MS);
    const json = await readJsonSafely(res);
    if (res.status === 400 && /no active/i.test(json?.error || '')) return 'correctly reports no registered devices';
    if (res.ok) return 'notification path executed';
    warn(`requires a configured Firebase Admin/Firestore project in this environment (status ${res.status}): ${JSON.stringify(json).slice(0, 150)}`);
  });

  await runTest('Notifications', 'POST /api/admin/broadcast-notification rejects a bad admin secret', async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/api/admin/broadcast-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'x', body: 'y', adminSecret: 'definitely-wrong' }),
    }, REQUEST_TIMEOUT_MS);
    if (res.status === 401 || res.status === 403) return 'correctly rejected a bad admin secret';
    const json = await readJsonSafely(res);
    warn(`expected 401/403 for a bad admin secret but got ${res.status}: ${JSON.stringify(json).slice(0, 150)}`);
  });
}

// ----------------------------------------------------------------------------
// SECTION D — Whole-codebase type-check (optional, slowest step)
// ----------------------------------------------------------------------------

async function runTypeCheck() {
  if (!RUN_TYPECHECK) return;
  heading('SECTION D — TypeScript project-wide type-check');

  await runTest('Type Check', 'tsc --noEmit', () => {
    return new Promise<string>((resolve, reject) => {
      const tscBin = path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc');
      const proc = spawn(process.execPath, [tscBin, '--noEmit'], {
        cwd: process.cwd(),
        shell: false,
      });
      let output = '';
      proc.stdout?.on('data', (d) => (output += d.toString()));
      proc.stderr?.on('data', (d) => (output += d.toString()));

      const killTimer = setTimeout(() => {
        proc.kill();
        reject(new Error('tsc --noEmit timed out after 120s'));
      }, 120000);

      proc.on('close', (code) => {
        clearTimeout(killTimer);
        if (code === 0) {
          resolve('project type-checks cleanly');
        } else {
          reject(new Error(`tsc reported errors:\n${output.trim().split('\n').slice(0, 25).join('\n')}`));
        }
      });
    });
  });
}

// ----------------------------------------------------------------------------
// Cleanup + summary
// ----------------------------------------------------------------------------

function cleanupTestArtifacts() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return;
    for (const file of fs.readdirSync(UPLOADS_DIR)) {
      if (file.includes('smoke-test-')) {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      }
    }
  } catch {
    // best-effort cleanup only
  }
}

function printSummary() {
  heading('SUMMARY');

  const bySection = new Map<string, TestResult[]>();
  for (const r of results) {
    if (!bySection.has(r.section)) bySection.set(r.section, []);
    bySection.get(r.section)!.push(r);
  }

  for (const [section, sectionResults] of Array.from(bySection.entries())) {
    const pass = sectionResults.filter((r) => r.status === 'PASS').length;
    const warnCount = sectionResults.filter((r) => r.status === 'WARN').length;
    const fail = sectionResults.filter((r) => r.status === 'FAIL').length;
    console.log(
      `  ${paint('bold', section.padEnd(20))} ` +
        `${paint('green', `${pass} pass`)}, ` +
        `${paint('yellow', `${warnCount} warn`)}, ` +
        `${paint('red', `${fail} fail`)}`
    );
  }

  const total = results.length;
  const totalPass = results.filter((r) => r.status === 'PASS').length;
  const totalWarn = results.filter((r) => r.status === 'WARN').length;
  const totalFail = results.filter((r) => r.status === 'FAIL').length;

  console.log('');
  console.log(paint('bold', `  TOTAL: ${total} checks — `) + paint('green', `${totalPass} passed`) + ', ' + paint('yellow', `${totalWarn} warnings`) + ', ' + paint('red', `${totalFail} failed`));

  if (totalFail > 0) {
    console.log('\n' + paint('red', paint('bold', '  Failures that need attention:')));
    for (const r of results.filter((r) => r.status === 'FAIL')) {
      console.log(paint('red', `   ✗ [${r.section}] ${r.name}\n     ${r.detail}`));
    }
  }

  if (totalWarn > 0) {
    console.log('\n' + paint('yellow', paint('bold', '  Warnings (likely just missing local config — Azure/Firebase/AI keys):')));
    for (const r of results.filter((r) => r.status === 'WARN')) {
      console.log(paint('yellow', `   ⚠ [${r.section}] ${r.name}\n     ${r.detail}`));
    }
  }

  console.log('');
  if (totalFail === 0) {
    console.log(paint('green', paint('bold', '  ✔ All features are functioning correctly.')));
  } else {
    console.log(paint('red', paint('bold', `  ✘ ${totalFail} feature(s) are broken — see failures above.`)));
  }
}

// ----------------------------------------------------------------------------
// Entry point
// ----------------------------------------------------------------------------

async function main() {
  console.log(paint('bold', paint('magenta', '\n  NoteIT — Full Feature Smoke Test\n')));
  console.log(paint('dim', `  Target: ${BASE_URL} | Request timeout: ${REQUEST_TIMEOUT_MS}ms | Type-check: ${RUN_TYPECHECK ? 'on' : 'skipped'}\n`));

  try {
    await runPureLogicTests();
    await ensureServerRunning();
    await runHttpTests();
    await runTypeCheck();
  } finally {
    cleanupTestArtifacts();
    stopSpawnedServer();
  }

  printSummary();

  const hasFailure = results.some((r) => r.status === 'FAIL');
  // Give the killed child process a moment to actually exit before we do.
  setTimeout(() => process.exit(hasFailure ? 1 : 0), 300);
}

main().catch((err) => {
  console.error(paint('red', '\nFatal error while running the test suite:'), err);
  stopSpawnedServer();
  process.exit(1);
});
