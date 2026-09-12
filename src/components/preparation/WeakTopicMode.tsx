/** Weak Topic Fix Mode - Targeted Drill - PHASE 1 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, Target, AlertTriangle } from 'lucide-react';
import { CanonicalSubject } from '../../utils/subjectCanonicalizer';
import { Lecture, QuizQuestion } from '../../types';

interface Props { selectedSubject: CanonicalSubject; selectedLectures: Lecture[]; onBack: () => void; theme?: 'light' | 'dark'; }

export function WeakTopicMode({ selectedSubject, selectedLectures, onBack, theme = 'light' }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);

  const questions: QuizQuestion[] = useMemo(() => {
    const qs: QuizQuestion[] = [];
    selectedLectures.forEach(l => {
      if (l.weakTopics) l.weakTopics.forEach(wt => {
        qs.push({ id: wt.id, question: `What is the key concept in ${wt.topicName}?`, options: [`${wt.topicName} core understanding`, `${wt.topicName} is minor`, 'Unrelated topic', 'Skip it'], correctAnswerIndex: 0, explanation: wt.aiDiagnosis || `Focus on ${wt.topicName}.`, type: 'mcq' });
      });
    });
    if (!qs.length) qs.push(
      { id: 'wq1', question: `Core concept priority in ${selectedSubject.canonicalName}?`, options: ['Fundamental principles', 'Edge cases only', 'Historical dates', 'Random facts'], correctAnswerIndex: 0, explanation: 'Fundamentals are always tested.', type: 'mcq' },
      { id: 'wq2', question: `Best approach for ${selectedSubject.canonicalName} problems?`, options: ['Systematic method', 'Guessing', 'Skip them', 'Memorize only'], correctAnswerIndex: 0, explanation: 'A systematic approach yields better results.', type: 'mcq' }
    );
    return qs.slice(0, 8);
  }, [selectedSubject, selectedLectures]);

  const cur = questions[idx];
  const pct = questions.length ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl border bg-white text-xs font-bold flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="text-xs font-bold">Weak Topic Drill</span></div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full"><div className="h-full bg-amber-500" style={{ width: `${pct}%` }} /></div>
      <div className="flex gap-2 overflow-x-auto pb-2">{questions.map((q, i) => (<button key={q.id} onClick={() => { setIdx(i); setRevealed(false); }} className={`shrink-0 px-2 py-1 rounded text-xs font-bold ${i === idx ? 'bg-blue-600 text-white' : answers[i] !== undefined ? 'bg-green-100' : 'bg-slate-100'}`}>{i + 1}</button>))}</div>
      {cur && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-4 bg-amber-600 text-white">
            <h2 className="text-base font-black">{cur.question}</h2>
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
          {revealed && cur.explanation && <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm"><span className="font-bold">Explanation:</span> {cur.explanation}</div>}
          <div className="p-3 border-t flex justify-between">
            <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setRevealed(false); }} disabled={idx === 0} className="px-3 py-1.5 border rounded text-xs font-bold disabled:opacity-50">Prev</button>
            {!revealed ? (
              <button onClick={() => setRevealed(true)} disabled={answers[idx] === undefined} className="px-6 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">Check Answer</button>
            ) : (
              <button onClick={() => { if (idx < questions.length - 1) { setIdx(i => i + 1); setRevealed(false); } }} className="px-6 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Next</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}