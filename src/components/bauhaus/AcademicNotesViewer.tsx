/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles, Check, AlertTriangle, HelpCircle, Layers, Lightbulb, Target, Flame, ExternalLink } from 'lucide-react';
import { ensureGfgTagsInMarkdown } from '../../services/gemini';

interface AcademicNotesViewerProps {
  content: string | Record<string, string> | any[];
  mode?: string;
  theme?: 'light' | 'dark';
  isCompiling?: boolean;
}

/**
 * Strips timestamp and source tags like [Source: Timestamp 00:08] or [00:08] or [Source: Page 3]
 * to produce clean, textbook-quality notes without visual clutter.
 */
export function cleanNotesTimestamps(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\[Source:\s*Timestamp\s*\d{1,2}:\d{2}\]/gi, '')
    .replace(/\[Source:\s*Page\s*\d+\]/gi, '')
    .replace(/\[Source:\s*[^\]]+\]/gi, '')
    .replace(/\[\d{1,2}:\d{2}\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Automatically structures raw un-synthesized document text or transcripts
 * into clean, textbook-grade academic sections with headers and bullet points.
 */
export function autoStructureRawText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // If text already contains Markdown headers, return as-is
  if (/^#{1,3}\s+/m.test(text)) {
    return text;
  }

  let cleaned = text.replace(/\r\n/g, '\n').trim();

  // Strip leading file name noise e.g. "Class Content Unit 2.docx Unit 2 "
  cleaned = cleaned.replace(/^(Class Content |Document |File |Unit \d+[\.a-z0-9_\-\s]*)+/i, '');

  const sentences = cleaned.split(/(?<=[.!?])\s+|\n+/);
  const structuredLines: string[] = [];

  structuredLines.push(`# Structured Academic Study Notes`);
  structuredLines.push(`## Overview & Core Concepts`);

  sentences.forEach((sentence) => {
    const s = sentence.trim();
    if (!s) return;

    if (s.includes(':') && !s.toLowerCase().startsWith('http')) {
      const parts = s.split(/:\s*/);
      const label = parts[0].trim();
      const body = parts.slice(1).join(': ').trim();
      if (label.length > 2 && label.length < 50) {
        structuredLines.push(`* **${label}**: ${body}`);
        return;
      }
    }

    if (/^(•|-|\*|▪)\s*/.test(s)) {
      structuredLines.push(`* ${s.replace(/^(•|-|\*|▪)\s*/, '')}`);
      return;
    }

    if (s.length < 70 && /^[A-Z0-9\s\-\(\)\.,]+$/.test(s)) {
      structuredLines.push(`### ${s}`);
      return;
    }

    structuredLines.push(s);
  });

  return structuredLines.join('\n\n');
}

/**
 * Render Markdown content cleanly with Bauhaus aesthetics,
 * properly formatted headings, tables, callouts, formulas, and bullet points.
 */
export const AcademicNotesViewer: React.FC<AcademicNotesViewerProps> = ({
  content,
  mode = 'academic',
  theme = 'light',
  isCompiling = false
}) => {
  if (isCompiling) {
    return (
      <div className="p-8 rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--panel-bg)] shadow-paper-sm text-center space-y-4 my-6 font-sans">
        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#FFC400] border-t-transparent animate-spin" />
          <BookOpen className="h-6 w-6 text-[var(--text-primary)]" />
        </div>
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded bg-[#FFC400] text-[#111111] text-[10px] font-mono font-extrabold uppercase border border-[#111111]">
            COMPILING STUDY NOTES
          </span>
          <h4 className="text-sm font-heading font-extrabold text-[var(--text-primary)] uppercase">
            Formatting Academic Notes & Structure...
          </h4>
          <p className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            Full textbook notes are being processed. Preview will load automatically when complete.
          </p>
        </div>
      </div>
    );
  }

  // Normalize content into a single clean string
  let rawText = '';
  if (typeof content === 'string') {
    rawText = content;
  } else if (Array.isArray(content)) {
    rawText = content.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const t = item.title ? `# ${item.title}\n` : '';
        const c = item.content || item.text || item.explanation || '';
        return `${t}${c}`;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');
  } else if (content && typeof content === 'object') {
    rawText = content[mode] || content.academic || content.detailed || content.quick || Object.values(content)[0] || '';
  }

  const structuredText = autoStructureRawText(cleanNotesTimestamps(rawText));
  const cleanedText = ensureGfgTagsInMarkdown(structuredText);

  if (!cleanedText.trim()) {
    return (
      <div className="text-center py-12 border border-dashed border-[#111111] rounded-[6px] bg-white p-6 space-y-3 font-sans">
        <BookOpen className="h-8 w-8 text-[#666666] mx-auto animate-pulse" />
        <p className="text-xs font-mono font-bold text-[#666666]">No study notes available for this section.</p>
      </div>
    );
  }

  // Parse lines to build structured academic layout
  const lines = cleanedText.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTableRows: string[][] = [];
  let isInsideTable = false;
  let keyCounter = 0;

  const renderFormattedInlineText = (text: string) => {
    // Process markdown links [Text](url), inline bold **Text**, code/math `code` or $math$
    let formatted: React.ReactNode[] = [];
    const parts = text.split(/(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|`[^`]+`|\$[^\$]+\$)/g);

    parts.forEach((part, idx) => {
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
        if (linkMatch) {
          const linkText = linkMatch[1];
          const linkHref = linkMatch[2].trim();

          const lowerHref = linkHref.toLowerCase();
          const isGfgLink = lowerHref === 'gfg' || lowerHref.startsWith('gfg:') || lowerHref.startsWith('gfg_') || lowerHref.includes('geeksforgeeks');

          if (isGfgLink) {
            let gfgUrl = '';
            let cleanQuery = linkText;

            const urlMatch = linkHref.match(/https?:\/\/[^\s\)]+/i);
            if (urlMatch) {
              gfgUrl = urlMatch[0];
            } else {
              const queryTerm = linkHref.includes(':') ? linkHref.substring(linkHref.indexOf(':') + 1) : linkText;
              cleanQuery = (queryTerm || linkText).trim().replace(/^(gfg:?|geeksforgeeks:?)/i, '').trim();
              gfgUrl = cleanQuery
                ? `https://www.geeksforgeeks.org/search/?gq=${encodeURIComponent(cleanQuery)}`
                : 'https://www.geeksforgeeks.org';
            }

            formatted.push(
              <a
                key={idx}
                href={gfgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#2F8D46] dark:text-[#4ADE80] hover:underline bg-[#2F8D46]/10 px-1.5 py-0.5 rounded text-[11px] font-sans no-underline transition-colors mx-0.5 cursor-pointer group"
                title={urlMatch ? `Open "${linkText}" on GeeksforGeeks` : `Look up "${cleanQuery}" on GeeksforGeeks`}
              >
                <span>{linkText}</span>
                <span className="text-[9px] font-mono font-bold bg-[#2F8D46] text-white px-1 rounded group-hover:bg-[#257338] transition-colors flex items-center gap-0.5">
                  GFG ↗
                </span>
              </a>
            );
          } else {
            formatted.push(
              <a
                key={idx}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 font-sans"
              >
                {linkText}
              </a>
            );
          }
          return;
        }
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        // Highlight specific labels like Definition:, Given:, Result:, Formula: or [HIGH WEIGHTAGE]
        if (/^(\[?🔥\s*HIGH WEIGHTAGE\]?|\[?⭐\s*EXAM PRIORITY\]?|HIGH WEIGHTAGE|EXAM PRIORITY)/i.test(inner)) {
          formatted.push(
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FF4D4D] text-white font-mono font-extrabold text-[10px] uppercase border border-[#111111] shadow-paper-sm mr-1 my-0.5">
              🔥 HIGH WEIGHTAGE
            </span>
          );
        } else if (/^(Definition|Key Idea|Important|Formula|Given|Process|Result|Example|Where|Common Confusion):/i.test(inner)) {
          formatted.push(
            <span key={idx} className="inline-block px-1.5 py-0.5 rounded-[3px] bg-[#FFC400] text-[#111111] font-mono font-extrabold text-[11px] uppercase tracking-wide mr-1 border border-[#111111] shadow-paper-sm">
              {inner}
            </span>
          );
        } else {
          formatted.push(
            <strong key={idx} className="font-extrabold text-[#111111] dark:text-white font-sans">
              {inner}
            </strong>
          );
        }
      } else if ((part.startsWith('`') && part.endsWith('`')) || (part.startsWith('$') && part.endsWith('$'))) {
        const inner = part.slice(1, -1);
        formatted.push(
          <code key={idx} className="px-1.5 py-0.5 rounded-[3px] bg-[var(--panel-bg)] text-[#111111] font-mono text-[11px] font-bold border border-[var(--border-main)] mx-0.5">
            {inner}
          </code>
        );
      } else {
        formatted.push(part);
      }
    });

    return formatted;
  };

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headerRow = currentTableRows[0];
      const dataRows = currentTableRows.slice(1).filter(r => !r.every(c => c.replace(/[-:\s]/g, '') === ''));

      elements.push(
        <div key={`table-${keyCounter++}`} className="my-5 overflow-x-auto rounded-[6px] border border-[#111111] bg-white text-[#111111] shadow-paper-sm font-sans">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFC400] text-[#111111] border-b border-[#111111]">
                {headerRow.map((col, cIdx) => (
                  <th key={cIdx} className="p-3 font-mono font-extrabold uppercase tracking-wider border-r border-[#111111] last:border-r-0">
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 font-medium text-[#111111] border-r border-[#111111] last:border-r-0">
                      {renderFormattedInlineText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      currentTableRows = [];
      isInsideTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table line processing
    if (line.startsWith('|') && line.endsWith('|')) {
      isInsideTable = true;
      const cells = line.slice(1, -1).split('|');
      currentTableRows.push(cells);
      continue;
    } else if (isInsideTable) {
      flushTable();
    }

    if (!line) {
      continue;
    }

    // Header 1: Document Title (# Title)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      const titleText = line.replace(/^#\s+/, '');
      elements.push(
        <div key={`h1-${keyCounter++}`} className="pb-3 mb-4 border-b border-[#111111] bg-[#F6F2EA] p-4 rounded-[6px] shadow-paper-sm border border-[#111111] font-sans">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#FFC400] text-[#111111] font-mono text-[9px] font-extrabold uppercase border border-[#111111] shadow-paper-sm">
              STRUCTURED STUDY NOTES
            </span>
          </div>
          <h1 className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#111111] leading-snug">
            {titleText}
          </h1>
        </div>
      );
    }
    // Header 2: Special Callouts (Remember, Exam Focus, Common Confusion) or Major Concept (## 01 — ...)
    else if (line.startsWith('## ')) {
      const h2Text = line.replace(/^##\s+/, '');

      if (h2Text.includes('🧠 Remember') || h2Text.toLowerCase().includes('remember')) {
        elements.push(
          <div key={`remember-${keyCounter++}`} className="mt-6 mb-3 p-4 rounded-[6px] border border-[#111111] bg-[#FFC400]/15 text-[#111111] shadow-paper-sm font-sans">
            <div className="flex items-center gap-2 border-b border-[#111111] pb-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-[#111111] fill-[#FFC400]" />
              <h2 className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] font-mono">
                🧠 REMEMBER (QUICK REVISION)
              </h2>
            </div>
          </div>
        );
      } else if (h2Text.includes('🎯 Exam Focus') || h2Text.toLowerCase().includes('exam focus')) {
        elements.push(
          <div key={`exam-${keyCounter++}`} className="mt-6 mb-3 p-4 rounded-[6px] border border-[#111111] bg-[#19B56B]/15 text-[#111111] shadow-paper-sm font-sans">
            <div className="flex items-center gap-2 border-b border-[#111111] pb-1.5 mb-2">
              <Target className="h-4 w-4 text-[#19B56B]" />
              <h2 className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] font-mono">
                🎯 EXAM FOCUS & HIGH-YIELD TOPICS
              </h2>
            </div>
          </div>
        );
      } else if (h2Text.includes('⚠️ Common Confusion') || h2Text.toLowerCase().includes('common confusion')) {
        elements.push(
          <div key={`confusion-${keyCounter++}`} className="mt-6 mb-3 p-4 rounded-[6px] border border-[#111111] bg-[#FF4D4D]/15 text-[#111111] shadow-paper-sm font-sans">
            <div className="flex items-center gap-2 border-b border-[#111111] pb-1.5 mb-2">
              <AlertTriangle className="h-4 w-4 text-[#FF4D4D]" />
              <h2 className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] font-mono">
                ⚠️ COMMON CONFUSION & DISTINCTIONS
              </h2>
            </div>
          </div>
        );
      } else if (h2Text.includes('🔥') || h2Text.toLowerCase().includes('teacher') || h2Text.toLowerCase().includes('high-weightage')) {
        elements.push(
          <div key={`teacher-callouts-${keyCounter++}`} className="mt-6 mb-3 p-4 rounded-[6px] border border-[#111111] bg-[#FFC400]/25 text-[#111111] shadow-paper-sm font-sans">
            <div className="flex items-center gap-2 border-b border-[#111111] pb-1.5 mb-2">
              <Flame className="h-4 w-4 text-[#FF4D4D] fill-[#FF4D4D]" />
              <h2 className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] font-mono">
                🔥 TEACHER'S SPOKEN CALLOUTS & HIGH-WEIGHTAGE TOPICS
              </h2>
            </div>
          </div>
        );
      } else {
        elements.push(
          <div key={`h2-${keyCounter++}`} className="mt-6 mb-2.5 pt-2.5 border-t border-[#111111]/20 font-sans">
            <h2 className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] dark:text-white flex items-center gap-2 font-mono border-b border-[#111111] pb-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FFC400] border border-[#111111] inline-block shrink-0" />
              <span>{h2Text}</span>
            </h2>
          </div>
        );
      }
    }
    // Header 3: Subheadings (### Definition, ### Explanation, ### Formula, etc.)
    else if (line.startsWith('### ')) {
      const h3Text = line.replace(/^###\s+/, '');
      elements.push(
        <h3 key={`h3-${keyCounter++}`} className="font-heading text-xs font-bold text-[#111111] dark:text-white mt-3 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-wide">
          <span className="text-[#FFC400]">▪</span>
          <span>{h3Text}</span>
        </h3>
      );
    }
    // Lists: Bullet points (* or -)
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      const itemText = line.replace(/^[*\-]\s+/, '');
      elements.push(
        <li key={`li-${keyCounter++}`} className="ml-4 pl-1 text-xs font-sans font-normal text-[#111111] dark:text-gray-200 leading-relaxed mb-1.5 list-disc">
          {renderFormattedInlineText(itemText)}
        </li>
      );
    }
    // Numbered lists (1. 2. 3.)
    else if (/^\d+\.\s+/.test(line)) {
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${keyCounter++}`} className="flex items-start gap-2.5 my-2 ml-1 text-xs font-sans">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#FFC400] text-[#111111] font-mono font-extrabold border border-[#111111] text-[10px] shrink-0">
              {numMatch[1]}
            </span>
            <div className="font-normal text-[#111111] dark:text-gray-200 leading-relaxed pt-0.5">
              {renderFormattedInlineText(numMatch[2])}
            </div>
          </div>
        );
      }
    }
    // Standard Paragraph
    else {
      elements.push(
        <p key={`p-${keyCounter++}`} className="text-xs font-sans font-normal text-[#111111] dark:text-gray-200 leading-relaxed mb-3">
          {renderFormattedInlineText(line)}
        </p>
      );
    }
  }

  // Text selection highlight state for Ask Doubt feature (Phase 8 & Safeguards #2 & #7)
  const [selectedText, setSelectedText] = React.useState<string>('');
  const [popupPos, setPopupPos] = React.useState<{ x: number; y: number } | null>(null);

  const handleMouseUp = React.useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text.length >= 3) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPopupPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 8
        });
        return;
      }
    }
    setPopupPos(null);
  }, []);

  const handleAskDoubtClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedText) {
      window.dispatchEvent(
        new CustomEvent('noteit_open_ask_doubt', {
          detail: { selectedText }
        })
      );
      setPopupPos(null);
    }
  };

  // Ensure lingering tables are rendered
  if (isInsideTable) {
    flushTable();
  }

  return (
    <div 
      onMouseUp={handleMouseUp}
      className="academic-notes-container space-y-2 selection:bg-[#FFC400] selection:text-[#111111] relative"
    >
      {elements}

      {/* FLOATING CONTEXTUAL 'ASK THIS AS DOUBT' POPUP (PHASE 8 & SAFEGUARD #7) */}
      {popupPos && selectedText && (
        <div
          style={{ left: `${popupPos.x}px`, top: `${popupPos.y}px` }}
          onClick={handleAskDoubtClick}
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-1 px-3 py-1.5 rounded-[6px] bg-[#FFC400] text-[#111111] font-mono font-extrabold text-xs border-2 border-[#111111] shadow-paper-md flex items-center gap-1.5 cursor-pointer animate-pulse hover:bg-[#ffe066] transition-all"
        >
          <HelpCircle size={14} />
          <span>🤔 Ask this as doubt</span>
        </div>
      )}
    </div>
  );
};
