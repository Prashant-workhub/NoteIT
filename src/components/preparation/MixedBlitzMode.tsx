/** Mixed Blitz Mode - All Formats Combined - PHASE 1 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, Check, Target, Zap } from 'lucide-react';
import { CanonicalSubject } from '../../utils/subjectCanonicalizer';
import { Lecture, QuizQuestion } from '../../types';

interface Props { selectedSubject: CanonicalSubject; selectedLectures: Lecture[]; onBack: () => void; theme?: 'light' | 'dark'; }

type MixedItem = QuizQuestion & { format: 'mcq' | 'concept' };

export function MixedBlitzMode({ selectedSubject, selectedLectures, onBack, theme = 'light' }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);

  const items: MixedItem[] = useMemo(() => {
    const all: MixedItem[] = [];
    selectedLectures.forEach(l => {
      if (l.quiz) l.quiz.forEach(q => all.push({ id: `q-${q.question.slice(0, 10)}`, question: q.question, options: q.options, correctAnswerIndex: q.correctAnswer, explanation: q.explanation, sourceCitation: q.sourceCitation, type: 'mcq', format: 'mcq' }));
      if (l.keyConcepts) l.keyConcepts.slice(0, 2).forEach(k => all.push({ id: k.id, question: `What concept does "${k.label}" represent?`, options: [k.desc || k.label, 'Unrelated', 'Minor detail', 'Skip'], correctAnswerIndex: 0, explanation: k.label, type: 'mcq', format: 'concept' }));
    });
    if (!all.length) all.push(
      { id: 'mx1', question: `Define the central idea of ${selectedSubject.canonicalName}.`, options: ['Core principles', 'Historical trivia', 'Unrelated', 'Guess'], correctAnswerIndex: 0, explanation: 'Central ideas define the subject.', type: 'mcq', format: 'mcq' },
      { id: 'mx2', question: `Apply ${selectedSubject.canonicalName} to solve a scenario.`, options: ['Use core principles', 'Skip', 'Memorize', 'Random'], correctAnswerIndex: 0, explanation: 'Apply principles systematically.', type: 'mcq', format: 'concept' },
      { id: 'mx3', question: `Identify the weak area priority in ${selectedSubject.canonicalName}.`, options: ['Fundamentals first', 'Edge cases', 'Trivia', 'None'], correctAnswerIndex: 0, explanation: 'Fundamentals matter most.', type: 'mcq', format: 'mcq' }
    );
    return all.slice(0, 8);
  }, [selectedSubject, selectedLectures]);

  const cur = items[idx];
  const pct = items.length ? Math.round((Object.keys(answers).length / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl border bg-white text-xs font-bold flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold">Mixed Blitz {Object.keys(answers).length}/{items.length}</span></div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full"><div className="h-full bg-gradient-to-r from-blue-600 to-amber-500" style={{ width: `${pct}%` }} /></div>
      <div className="flex gap-2 overflow-x-auto pb-2">{items.map((q, i) => (<button key={q.id} onClick={() => { setIdx(i); setRevealed(false); }} className={`shrink-0 px-2 py-1 rounded text-xs font-bold ${i === idx ? 'bg-blue-600 text-white' : answers[i] !== undefined ? 'bg-green-100' : 'bg-slate-100'}`}>{i + 1}</button>))}</div>
      {cur && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-amber-500 text-white flex items-center gap-2">
            {cur.format === 'concept' ? <BookOpen className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            <div>
              <span className="text-[10px] uppercase font-bold opacity-80">{cur.format === 'concept' ? 'Concept Check' : 'MCQ Question'}</span>
              <h2 className="text-base font-black leading-tight">{cur.question}</h2>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {cur.options.map((opt, oi) => {
              const isCorrect = oi === cur.correctAnswerIndex;
              const isChosen = answers[idx] === oi;
              let cls = 'border-slate-200 bg-white hover:bg-slate-50';
              if (revealed && isCorrect) cls = 'border-green-500 bg-green-50';
              else if (revealed && isChosen && !isCorrect) cls = 'border-red-500 bg-red-50';
              else if (isChosen) cls = 'border-blue-500 bg-blue-50';
              return (
                <button key={oi} onClick={() => { if (!revealed) setAnswers(a => ({ ...a, [idx]: oi })); }} disabled={revealed} className={`w-full p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${cls}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {revealed && cur.explanation && <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm"><span className="font-bold">Explanation:</span> {cur.explanation}</div>}
          <div className="p-3 border-t flex justify-between">
            <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setRevealed(false); }} disabled={idx === 0} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Prev</button>
            {!revealed ? (
              <button onClick={() => setRevealed(true)} disabled={answers[idx] === undefined} className="px-6 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">Check</button>
            ) : (
              <button onClick={() => { if (idx < items.length - 1) { setIdx(i => i + 1); setRevealed(false); } }} className="px-6 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Next</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}