/** Concept Mastery Mode - PHASE 1 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Lightbulb, Target, BookOpen } from 'lucide-react';
import { CanonicalSubject } from '../../utils/subjectCanonicalizer';
import { Lecture } from '../../types';

interface Props { selectedSubject: CanonicalSubject; selectedLectures: Lecture[]; onBack: () => void; theme?: 'light' | 'dark'; }

export function ConceptMasteryMode({ selectedSubject, selectedLectures, onBack, theme = 'light' }: Props) {
  const [idx, setIdx] = useState(0);
  const [showPoints, setShowPoints] = useState(true);
  const [done, setDone] = useState<Set<string>>(new Set());

  const cards = useMemo(() => {
    const c: any[] = [];
    selectedLectures.forEach(l => { if (l.keyConcepts) l.keyConcepts.forEach(k => c.push({ id: k.id, title: k.label, desc: k.desc || '', pts: [k.examples || ''].filter(Boolean) })); });
    if (!c.length) c.push({ id: 'c1', title: `Intro ${selectedSubject.canonicalName}`, desc: 'Core concepts', pts: ['Definitions', 'Basics'] }, { id: 'c2', title: `Core ${selectedSubject.canonicalName}`, desc: 'Key topics', pts: ['Theorems', 'Methods'] });
    return c.slice(0, 8);
  }, [selectedSubject, selectedLectures]);

  const cur = cards[idx];
  const pct = cards.length ? Math.round((done.size / cards.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl border bg-white text-xs font-bold flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold">{done.size}/{cards.length}</span></div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full"><div className="h-full bg-blue-600" style={{ width: `${pct}%` }} /></div>
      <div className="flex gap-2 overflow-x-auto pb-2">{cards.map((c, i) => (<button key={c.id} onClick={() => setIdx(i)} className={`shrink-0 px-2 py-1 rounded text-xs font-bold ${i === idx ? 'bg-blue-600 text-white' : done.has(c.id) ? 'bg-green-100' : 'bg-slate-100'}`}>{done.has(c.id) && <Check className="h-3 w-3 inline mr-1" />}{i + 1}</button>))}</div>
      {cur && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-4 bg-blue-600 text-white">
            <h2 className="text-lg font-black">{cur.title}</h2>
            <p className="text-sm text-blue-100">{cur.desc}</p>
          </div>
          <div className="p-3">
            <button onClick={() => setShowPoints(!showPoints)} className="w-full flex justify-between p-2 bg-slate-50 rounded font-bold text-sm"><span className="flex items-center gap-2"><Lightbulb className="h-4 w-4" />Key Points</span>{showPoints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            {showPoints && <ul className="mt-2 space-y-1">{cur.pts.filter(Boolean).map((p: string, i: number) => <li key={i} className="text-sm flex items-center gap-2"><span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>{p}</li>)}</ul>}
          </div>
          <div className="p-3 border-t flex justify-between">
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Prev</button>
            <button onClick={() => setDone(d => new Set([...d, cur.id]))} className={`px-4 py-1.5 rounded text-xs font-bold ${done.has(cur.id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>{done.has(cur.id) ? 'Done' : 'Mark'}</button>
            <button onClick={() => setIdx(i => Math.min(cards.length - 1, i + 1))} disabled={idx === cards.length - 1} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}