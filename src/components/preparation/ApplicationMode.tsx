/** Application Mode - Problem Solving - PHASE 1 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Cog, Lightbulb, Target, Zap } from 'lucide-react';
import { CanonicalSubject } from '../../utils/subjectCanonicalizer';
import { Lecture } from '../../types';

interface Props { selectedSubject: CanonicalSubject; selectedLectures: Lecture[]; onBack: () => void; theme?: 'light' | 'dark'; }
interface AppProblem { id: string; problem: string; steps: string[]; solution: string; difficulty: 'easy' | 'medium' | 'hard'; }

export function ApplicationMode({ selectedSubject, selectedLectures, onBack, theme = 'light' }: Props) {
  const [idx, setIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const problems: AppProblem[] = useMemo(() => {
    const p: AppProblem[] = [];
    selectedLectures.forEach(l => {
      if (l.keyConcepts) l.keyConcepts.forEach((k, ki) => {
        const diff: 'easy' | 'medium' | 'hard' = ki % 3 === 0 ? 'easy' : ki % 3 === 1 ? 'medium' : 'hard';
        p.push({ id: k.id, problem: `Apply ${k.label} to solve a practical scenario in ${selectedSubject.canonicalName}.`, steps: ['Identify the core concept', 'Map to the problem context', 'Apply the method', 'Verify the result'], solution: k.applications || `${k.label} application in practice.`, difficulty: diff });
      });
    });
    if (!p.length) p.push(
      { id: 'ap1', problem: `Solve a basic scenario using ${selectedSubject.canonicalName} fundamentals.`, steps: ['Read the problem', 'Identify key data', 'Apply formula', 'Calculate'], solution: 'Systematic application of core principles.', difficulty: 'easy' },
      { id: 'ap2', problem: `Analyze an intermediate case using ${selectedSubject.canonicalName} principles.`, steps: ['Break down components', 'Analyze relationships', 'Apply methodology', 'Validate'], solution: 'Methodical analysis and application.', difficulty: 'medium' },
      { id: 'ap3', problem: `Design a solution for an advanced problem in ${selectedSubject.canonicalName}.`, steps: ['Understand requirements', 'Design approach', 'Implement step-by-step', 'Test and verify'], solution: 'Advanced problem-solving with structured approach.', difficulty: 'hard' }
    );
    return p.slice(0, 6);
  }, [selectedSubject, selectedLectures]);

  const cur = problems[idx];
  const pct = problems.length ? Math.round((completed.size / problems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl border bg-white text-xs font-bold flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold">{completed.size}/{problems.length}</span></div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full"><div className="h-full bg-blue-600" style={{ width: `${pct}%` }} /></div>
      {cur && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-4 bg-blue-600 text-white">
            <div className="flex items-center gap-2 mb-1"><Cog className="h-5 w-5" /><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cur.difficulty === 'easy' ? 'bg-green-500 text-black' : cur.difficulty === 'medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>{cur.difficulty}</span></div>
            <h2 className="text-base font-black">{cur.problem}</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2">Approach Steps:</p>
              <ol className="space-y-2">{cur.steps.map((s, i) => <li key={i} className="flex items-center gap-2 text-sm"><span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>{s}</li>)}</ol>
            </div>
            <button onClick={() => setShowSolution(!showSolution)} className="w-full flex justify-between p-3 bg-slate-50 rounded-xl font-bold text-sm"><span className="flex items-center gap-2"><Lightbulb className="h-4 w-4" />Solution</span>{showSolution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            {showSolution && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm"><p className="font-bold text-amber-700 mb-1">Solution:</p><p>{cur.solution}</p></div>}
          </div>
          <div className="p-3 border-t flex justify-between">
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Prev</button>
            <button onClick={() => setCompleted(c => new Set([...c, cur.id]))} className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 ${completed.has(cur.id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}><Check className="h-4 w-4" />{completed.has(cur.id) ? 'Done' : 'Solved'}</button>
            <button onClick={() => setIdx(i => Math.min(problems.length - 1, i + 1))} disabled={idx === problems.length - 1} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}