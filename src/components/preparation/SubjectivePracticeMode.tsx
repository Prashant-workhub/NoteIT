/** Subjective Practice Mode - PHASE 1 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, FileText, Send, Target } from 'lucide-react';
import { CanonicalSubject } from '../../utils/subjectCanonicalizer';
import { Lecture } from '../../types';

interface Props { selectedSubject: CanonicalSubject; selectedLectures: Lecture[]; onBack: () => void; theme?: 'light' | 'dark'; }

interface SubjQ { id: string; question: string; marks: string; topic: string; pts: string[]; }

export function SubjectivePracticeMode({ selectedSubject, selectedLectures, onBack, theme = 'light' }: Props) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [showKey, setShowKey] = useState(false);

  const questions: SubjQ[] = useMemo(() => {
    const q: SubjQ[] = [];
    selectedLectures.forEach((l, li) => {
      if (l.keyConcepts) l.keyConcepts.forEach((k, ki) => {
        const marks = ki % 2 === 0 ? '5' : '10';
        q.push({ id: `${l.id}-${k.id}`, question: `Explain "${k.label}" in the context of ${selectedSubject.canonicalName}.`, marks, topic: k.label || selectedSubject.canonicalName, pts: [k.examples || '', k.formula || ''].filter(Boolean) });
      });
    });
    if (!q.length) q.push({ id: 'sq1', question: `Explain the fundamental concepts of ${selectedSubject.canonicalName}.`, marks: '5', topic: selectedSubject.canonicalName, pts: ['Key definitions', 'Core principles'] }, { id: 'sq2', question: `Discuss the applications of ${selectedSubject.canonicalName} in real-world scenarios.`, marks: '10', topic: selectedSubject.canonicalName, pts: ['Practical use cases', 'Industry relevance'] });
    return q.slice(0, 5);
  }, [selectedSubject, selectedLectures]);

  const cur = questions[idx];
  const pct = questions.length ? Math.round((submitted.size / questions.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl border bg-white text-xs font-bold flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold">{submitted.size}/{questions.length}</span></div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full"><div className="h-full bg-blue-600" style={{ width: `${pct}%` }} /></div>
      {cur && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div>
              <h2 className="text-base font-black">{cur.question}</h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{cur.marks} Marks</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Your Answer</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} className="w-full h-32 p-3 border rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500" placeholder="Write your detailed answer here..." />
            </div>
            {submitted.has(cur.id) && (
              <button onClick={() => setShowKey(!showKey)} className="w-full flex justify-between p-3 bg-slate-50 rounded-xl font-bold text-sm"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Evaluation Key</span>{showKey ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            )}
            {submitted.has(cur.id) && showKey && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-bold text-green-700 mb-1">Key Points to Include:</p>
                <ul className="space-y-1">{cur.pts.filter(Boolean).map((p, i) => <li key={i} className="text-sm flex items-center gap-2"><span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>{p}</li>)}</ul>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex justify-between">
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Prev</button>
            {!submitted.has(cur.id) ? (
              <button onClick={() => { setSubmitted(s => new Set([...s, cur.id])); setShowKey(true); }} className="px-6 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"><Send className="h-4 w-4" />Submit</button>
            ) : (
              <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2"><Check className="h-4 w-4" />Submitted</span>
            )}
            <button onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}