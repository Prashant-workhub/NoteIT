/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Download, Printer, ArrowRight } from 'lucide-react';

interface HandwrittenNotesViewerProps {
  lectureData: any;
  theme?: 'light' | 'dark';
  isCompiling?: boolean;
}

function cleanMarkdownText(str: string): string {
  if (!str) return '';
  return str
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[Source:\s*[^\]]+\]/g, '')
    .trim();
}

function parseMarkdownToHandwrittenSections(rawMarkdown: string) {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') {
    return { title: '', overview: '', keyPoints: [], sections: [], remember: '', examFocus: '' };
  }

  const lines = rawMarkdown.split('\n');
  let title = '';
  let overview = '';
  const keyPoints: string[] = [];
  const sections: Array<{
    title: string;
    content: string[];
    table?: Array<{ col1: string; col2: string }>;
  }> = [];
  let remember = '';
  let examFocus = '';

  let currentTitle = '';
  let currentContentLines: string[] = [];
  let currentTable: Array<{ col1: string; col2: string }> = [];

  const flushSection = () => {
    if (currentTitle || currentContentLines.length > 0 || currentTable.length > 0) {
      sections.push({
        title: cleanMarkdownText(currentTitle) || 'Key Concepts',
        content: currentContentLines.map(l => cleanMarkdownText(l)).filter(Boolean),
        table: currentTable.length > 0 ? [...currentTable] : undefined
      });
      currentTitle = '';
      currentContentLines = [];
      currentTable = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('# ') && !title) {
      title = cleanMarkdownText(line);
      continue;
    }

    if (line.startsWith('## ')) {
      const h2Text = line.replace(/^##\s+/, '').trim();

      if (/brief overview|overview|introduction/i.test(h2Text)) {
        flushSection();
        let j = i + 1;
        let ovText = '';
        while (j < lines.length && !lines[j].trim().startsWith('#')) {
          ovText += lines[j].trim() + ' ';
          j++;
        }
        overview = cleanMarkdownText(ovText);
        i = j - 1;
        continue;
      }

      if (/remember/i.test(h2Text)) {
        flushSection();
        let j = i + 1;
        let remText = '';
        while (j < lines.length && !lines[j].trim().startsWith('#')) {
          remText += lines[j].trim() + ' ';
          j++;
        }
        remember = cleanMarkdownText(remText);
        i = j - 1;
        continue;
      }

      if (/exam focus|exam/i.test(h2Text)) {
        flushSection();
        let j = i + 1;
        let efText = '';
        while (j < lines.length && !lines[j].trim().startsWith('#')) {
          efText += lines[j].trim() + ' ';
          j++;
        }
        examFocus = cleanMarkdownText(efText);
        i = j - 1;
        continue;
      }

      if (/key points/i.test(h2Text)) {
        flushSection();
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('#')) {
          const kpLine = lines[j].trim();
          if (kpLine.startsWith('- ') || kpLine.startsWith('* ')) {
            keyPoints.push(cleanMarkdownText(kpLine.replace(/^[-*]\s+/, '')));
          }
          j++;
        }
        i = j - 1;
        continue;
      }

      flushSection();
      currentTitle = h2Text;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) continue;
      const cells = line.split('|').map(c => cleanMarkdownText(c)).filter(Boolean);
      if (cells.length >= 2) {
        currentTable.push({ col1: cells[0], col2: cells[1] });
      }
      continue;
    }

    currentContentLines.push(line);
  }

  flushSection();

  return { title, overview, keyPoints, sections, remember, examFocus };
}

export const HandwrittenNotesViewer: React.FC<HandwrittenNotesViewerProps> = ({
  lectureData,
  theme = 'light',
  isCompiling = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Check compiling / processing status
  const isCompilingState = 
    isCompiling ||
    lectureData?.isGeneratingNotes ||
    lectureData?.isGeneratingSummary ||
    lectureData?.isGenerating ||
    lectureData?.isCompiling ||
    lectureData?.isProcessing ||
    lectureData?.resourceGenerationStatus === 'processing' ||
    lectureData?.resourceGenerationStatus === 'generating' ||
    lectureData?.resourceGenerationStatus === 'transcribing' ||
    lectureData?.resourceGenerationStatus === 'queued' ||
    lectureData?.status === 'transcribing' ||
    lectureData?.status === 'analyzing' ||
    lectureData?.status === 'generating' ||
    lectureData?.status === 'processing';

  // Extract raw text sources
  const rawNotesString = 
    (typeof lectureData?.notes === 'string' ? lectureData.notes : '') ||
    lectureData?.notes?.academic ||
    lectureData?.notes?.detailed ||
    (typeof lectureData?.content === 'string' ? lectureData.content : '') ||
    '';

  const parsedMarkdown = React.useMemo(() => {
    return parseMarkdownToHandwrittenSections(rawNotesString);
  }, [rawNotesString]);

  const title = cleanMarkdownText(parsedMarkdown.title || lectureData?.title || 'Lecture Study Notes');
  const overview = cleanMarkdownText(parsedMarkdown.overview || lectureData?.summary || lectureData?.notes?.overview || '');

  // Build sections list dynamically
  let sections: Array<{ title: string; content: string | string[]; table?: Array<{ col1: string; col2: string }> }> = [];

  if (parsedMarkdown.sections.length > 0) {
    sections = parsedMarkdown.sections;
  } else if (Array.isArray(lectureData?.sections) && lectureData.sections.length > 0) {
    sections = lectureData.sections.map((s: any) => ({
      title: cleanMarkdownText(s.title || s.heading || 'Topic Section'),
      content: cleanMarkdownText(s.content || s.explanation || s.summary || '')
    }));
  } else if (Array.isArray(lectureData?.notes) && lectureData.notes.length > 0) {
    sections = lectureData.notes.map((n: any) => ({
      title: cleanMarkdownText(n.title || n.heading || 'Topic Section'),
      content: typeof n.content === 'string' ? cleanMarkdownText(n.content) : (Array.isArray(n.details) ? n.details.map(cleanMarkdownText).join('. ') : JSON.stringify(n.content))
    }));
  } else if (overview) {
    sections = [{ title: 'Overview & Foundations', content: overview }];
  }

  // Key terms & formulas
  const sourceIntel = lectureData?.sourceIntelligence || {};
  const keyTerms: string[] = (sourceIntel.keyTerms || []).map(cleanMarkdownText);
  const formulas: string[] = (sourceIntel.formulas || []).map(cleanMarkdownText);
  const keyPoints: string[] = (parsedMarkdown.keyPoints || []).map(cleanMarkdownText);

  const hasNotesContent = sections.length > 0 || (overview && overview.trim().length > 0);

  // Build handwritten notes pages dynamically covering ALL real academic topics
  const pages = React.useMemo(() => {
    if (!hasNotesContent) return [];

    const pagesResult: Array<{
      pageNumber: number;
      header: string;
      items: Array<{
        title: string;
        type: 'text' | 'concept' | 'diagram' | 'formula' | 'terms' | 'bullets' | 'table' | 'remember' | 'examFocus';
        content: any;
        table?: Array<{ col1: string; col2: string }>;
      }>;
    }> = [];

    // STRICT ADMINISTRATIVE NOISE FILTER
    const noiseRegex = /co-po|course outcome|program outcome|\bco[1-6]\b|\bpo[1-6]\b|table of content|\bindex\b|syllabus|faculty|office hour|grading|prerequisites|unit details/i;
    const cleanSections = sections.filter(s => !noiseRegex.test(s.title || '') && !noiseRegex.test(Array.isArray(s.content) ? s.content.join(' ') : s.content || ''));

    const allSections = cleanSections.length > 0 ? cleanSections : [
      { title: 'Core Concepts & Overview', content: overview || 'High-yield revision sheet compiled from source material.' }
    ];

    // DETERMINISTIC PACKING: Exactly 2 concept sections per A4 sheet
    const SECTIONS_PER_PAGE = 2;
    const pageCount = Math.ceil(allSections.length / SECTIONS_PER_PAGE);

    for (let p = 0; p < pageCount; p++) {
      const pageSections = allSections.slice(p * SECTIONS_PER_PAGE, (p + 1) * SECTIONS_PER_PAGE);
      const pageItems: any[] = [];

      // Include Overview synthesis on page 1 if available
      if (p === 0 && overview && !noiseRegex.test(overview)) {
        pageItems.push({
          title: 'CORE TOPIC SYNTHESIS',
          type: 'text',
          content: overview
        });
      }

      // Include Key Points if available
      if (p === 0 && keyPoints.length > 0) {
        pageItems.push({
          title: 'KEY REVISION POINTS',
          type: 'bullets',
          content: keyPoints
        });
      }

      // Add each real academic section topic for this page
      pageSections.forEach((sec) => {
        pageItems.push({
          title: sec.title.toUpperCase(),
          type: 'concept',
          content: sec.content,
          table: sec.table
        });
      });

      // Include Remember Sticky Note on final page if present
      if (p === pageCount - 1 && parsedMarkdown.remember) {
        pageItems.push({
          title: 'REMEMBER FOR EXAMS',
          type: 'remember',
          content: parsedMarkdown.remember
        });
      }

      // Include Exam Focus Card on final page if present
      if (p === pageCount - 1 && parsedMarkdown.examFocus) {
        pageItems.push({
          title: 'EXAM FOCUS & TIP',
          type: 'examFocus',
          content: parsedMarkdown.examFocus
        });
      }

      // Include Formulas ONLY ONCE on final page if present
      if (p === pageCount - 1 && formulas.length > 0) {
        pageItems.push({
          title: 'KEY FORMULAS & EQUATIONS',
          type: 'formula',
          content: formulas
        });
      }

      // Include Key Terminology ONLY ONCE on final page if present
      if (p === pageCount - 1 && keyTerms.length > 0) {
        pageItems.push({
          title: 'KEY TERMINOLOGY',
          type: 'terms',
          content: keyTerms.slice(0, 10)
        });
      }

      const sectionNum = String(p + 1).padStart(2, '0');
      pagesResult.push({
        pageNumber: p + 1,
        header: `SECTION ${sectionNum} — ${p === 0 ? 'CONCEPTUAL FOUNDATIONS' : p === 1 ? 'ADVANCED TOPICS & ARCHITECTURE' : 'REVISION & EXAM CHEAT SHEET'}`,
        items: pageItems
      });
    }

    return pagesResult;
  }, [sections, overview, keyPoints, formulas, keyTerms, hasNotesContent, parsedMarkdown]);

  // RENDERING GATES: No preview until loaded properly
  if (isCompilingState) {
    return (
      <div className="handwritten-workspace space-y-6 select-none p-6">
        <div className="p-8 rounded-[8px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-md text-center space-y-6 max-w-2xl mx-auto my-8">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFC400] border-t-transparent animate-spin" />
            <span className="text-2xl">📝</span>
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-[4px] bg-[#1E3A8A] text-white text-[10px] font-mono font-extrabold uppercase tracking-wider border border-[#111111] shadow-paper-sm">
              COMPILING REVISION SHEET
            </span>
            <h3 className="text-lg font-heading font-extrabold text-[#111111] uppercase tracking-tight">
              AI IS COMPILING HANDWRITTEN REVISION NOTES...
            </h3>
            <p className="text-xs font-mono font-bold text-[#475569] max-w-md mx-auto leading-relaxed">
              Synthesizing A4 handwritten study sheets, concept boxes, formulas & terminology. 
              Preview will automatically display when note compilation is 100% complete.
            </p>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden border border-[#111111]">
            <div className="bg-[#2563EB] h-full animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasNotesContent || pages.length === 0) {
    return (
      <div className="handwritten-workspace space-y-6 select-none p-6">
        <div className="p-8 rounded-[8px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-3 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-[#E2E8F0] text-[#64748B] mx-auto flex items-center justify-center text-xl font-bold">
            📝
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-extrabold text-[#334155] uppercase">
              No Handwritten Notes Available Yet
            </h3>
            <p className="text-xs font-mono font-medium text-[#64748B]">
              Handwritten A4 notes have not been compiled for this lecture yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="handwritten-workspace space-y-6 select-none">
      {/* TOOLBAR CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-sm print:hidden">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-[4px] bg-[#1E3A8A] text-white text-[10px] font-mono font-extrabold uppercase tracking-wider border border-[#111111] shadow-paper-sm">
            📝 A4 HANDWRITTEN REVISION SHEET
          </span>
          <span className="text-xs font-mono font-bold text-[#666666]">
            ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'} • 210mm × 297mm A4 Canvas)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFC400] text-[#111111] text-xs font-mono font-extrabold uppercase rounded-[4px] border border-[#111111] shadow-paper-sm hover:bg-[#ffe066] cursor-pointer transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#111111] text-xs font-mono font-extrabold uppercase rounded-[4px] border border-[#111111] shadow-paper-sm hover:bg-gray-100 cursor-pointer transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* PRINT-SPECIFIC CSS STYLES */}
      <style>{`
        @font-face {
          font-family: 'HandwrittenPen';
          src: local('Kalam'), local('Caveat'), cursive;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .handwritten-a4-stack, .handwritten-a4-stack * {
            visibility: visible;
          }
          .handwritten-a4-stack {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .a4-page {
            page-break-after: always;
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* VERTICALLY SCROLLABLE A4 PAGES STACK */}
      <div ref={containerRef} className="handwritten-a4-stack space-y-10 flex flex-col items-center py-6 bg-[#0F172A] rounded-[8px] p-6 border-2 border-[#111111] overflow-x-auto">
        {pages.map((pg) => (
          <div
            key={pg.pageNumber}
            className="a4-page relative w-[210mm] min-h-[297mm] !bg-white !text-slate-900 p-[16mm] rounded-[2px] border-[5px] border-[#2563EB] shadow-2xl overflow-hidden font-handwritten select-text"
            style={{
              fontFamily: "'Kalam', 'Caveat', cursive",
              backgroundColor: '#FFFFFF',
              backgroundImage: 'linear-gradient(#FFFFFF 27px, #CBD5E1 28px)',
              backgroundSize: '100% 28px',
              lineHeight: '28px',
              color: '#0F294A'
            }}
          >
            {/* HEADER METADATA */}
            <div className="flex justify-between items-center pb-2 border-b-2 border-[#2563EB] mb-6 text-sm font-bold tracking-wide">
              <div>
                <span className="text-[#0F294A] uppercase tracking-wider text-xs font-mono font-black">{pg.header}</span>
              </div>
              <div className="text-xs font-mono font-bold text-[#475569]">
                PAGE {String(pg.pageNumber).padStart(2, '0')} OF {String(pages.length).padStart(2, '0')}
              </div>
            </div>

            {/* DOCUMENT TITLE (ON PAGE 1) */}
            {pg.pageNumber === 1 && (
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#0F294A] leading-none mb-2 decoration-wavy underline underline-offset-8">
                  {title}
                </h1>
                <div className="text-xs font-mono font-bold text-[#334155] mt-2 italic flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#2563EB]" />
                  <span>University Revision Sheet • Hand-annotated Study Notes</span>
                </div>
              </div>
            )}

            {/* PAGE SECTION CONTENT */}
            <div className="space-y-6 text-base leading-relaxed text-[#0F294A]">
              {pg.items.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {/* SECTION TITLE WITH HANDWRITTEN HIGHLIGHT */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#FFD54F] text-[#0F294A] text-lg font-extrabold shadow-sm border border-amber-400">
                      ✏ {item.title}
                    </span>
                  </div>

                  {/* ITEM CONTENT BASED ON TYPE */}
                  {(item.type === 'text' || item.type === 'concept') && (
                    <div className="pl-2 space-y-2 text-lg font-bold leading-snug text-[#0F294A]">
                      {Array.isArray(item.content) ? (
                        item.content.map((pLine: string, pIdx: number) => (
                          <p key={pIdx} className="leading-snug">
                            {pLine.startsWith('- ') || pLine.startsWith('* ') ? (
                              <span className="flex items-start gap-2">
                                <span className="text-amber-500 font-extrabold">•</span>
                                <span>{pLine.replace(/^[-*]\s+/, '')}</span>
                              </span>
                            ) : (
                              pLine
                            )}
                          </p>
                        ))
                      ) : (
                        <p className="whitespace-pre-line">{item.content}</p>
                      )}

                      {/* RENDER HANDWRITTEN TABLE IF PRESENT */}
                      {item.table && item.table.length > 0 && (
                        <div className="my-4 overflow-hidden rounded-[6px] border-2 border-[#2563EB] bg-[#FAF8F5] p-3 shadow-sm">
                          <div className="text-xs font-mono font-bold uppercase text-[#2563EB] mb-2">Structured Reference Table</div>
                          <table className="w-full text-left border-collapse text-base font-extrabold">
                            <thead>
                              <tr className="border-b-2 border-[#2563EB] bg-[#E2E8F0] text-[#0F294A]">
                                <th className="p-2 border-r border-[#CBD5E1] font-black">{item.table[0]?.col1 || 'Field'}</th>
                                <th className="p-2 font-black">{item.table[0]?.col2 || 'Value'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.table.slice(1).map((row: any, rIdx: number) => (
                                <tr key={rIdx} className="border-b border-[#CBD5E1] last:border-b-0 hover:bg-[#F1F5F9]">
                                  <td className="p-2 border-r border-[#CBD5E1] font-bold text-[#1E293B]">{row.col1}</td>
                                  <td className="p-2 font-bold text-[#0F294A]">{row.col2}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {item.type === 'remember' && (
                    <div className="my-3 p-4 rounded-[6px] border-2 border-amber-400 bg-[#FEF3C7] text-[#78350F] shadow-sm space-y-1">
                      <div className="text-xs font-mono font-black uppercase text-amber-800 tracking-wider">🧠 REMEMBER FOR EXAMS</div>
                      <p className="text-lg font-extrabold leading-snug">{item.content}</p>
                    </div>
                  )}

                  {item.type === 'examFocus' && (
                    <div className="my-3 p-4 rounded-[6px] border-2 border-blue-400 bg-[#EFF6FF] text-[#1E3A8A] shadow-sm space-y-1">
                      <div className="text-xs font-mono font-black uppercase text-blue-800 tracking-wider">🎯 EXAM FOCUS & HIGHLIGHT</div>
                      <p className="text-lg font-extrabold leading-snug">{item.content}</p>
                    </div>
                  )}

                  {item.type === 'diagram' && (
                    <div className="my-3 p-4 rounded-[6px] border-2 border-dashed border-[#2563EB] bg-[#F8FAFC]">
                      <div className="text-xs font-bold uppercase text-[#2563EB] mb-2 font-mono">Process Flow Diagram</div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
                        {Array.isArray(item.content) && item.content.map((step: string, sIdx: number) => (
                          <React.Fragment key={sIdx}>
                            <div 
                              className="p-2.5 bg-white rounded-md border-2 border-[#2563EB] shadow-sm font-extrabold text-sm flex-1 text-center"
                              style={{ backgroundColor: '#FFFFFF', color: '#0F294A' }}
                            >
                              {step}
                            </div>
                            {sIdx < item.content.length - 1 && (
                              <ArrowRight className="h-5 w-5 text-[#2563EB] shrink-0 sm:rotate-0 rotate-90" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.type === 'formula' && (
                    <div className="my-3 space-y-2">
                      {Array.isArray(item.content) && item.content.map((f: string, fIdx: number) => (
                        <div key={fIdx} className="p-3 rounded-[6px] border-2 border-[#2563EB] bg-[#F1F5F9] shadow-sm relative">
                          <span className="absolute top-1 right-2 text-[10px] font-mono text-blue-700 uppercase font-bold">Equation Box</span>
                          <div className="text-xl font-black text-[#0F294A] tracking-wider font-mono">
                            {f}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === 'terms' && (
                    <div className="flex flex-wrap gap-2 my-2 pl-2">
                      {Array.isArray(item.content) && item.content.map((term: string, tIdx: number) => (
                        <span key={tIdx} className="px-3 py-1 bg-amber-100 rounded-full border border-amber-400 text-amber-950 font-bold text-sm">
                          📌 {term}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.type === 'bullets' && (
                    <ul className="space-y-1.5 pl-2 text-lg">
                      {Array.isArray(item.content) && item.content.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-extrabold">•</span>
                          <span className="font-bold text-[#0F294A] leading-snug">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* PAGE FOOTER */}
            <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-xs font-mono font-bold text-slate-600">
              <span>NOTEIT — HANDWRITTEN STUDY ENGINE</span>
              <span>A4 PORTRAIT (210mm × 297mm)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
