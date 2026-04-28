import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Modal from "../../components/ui/Modal.jsx";

function msToClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TestPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => new Map());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const [questionTimers, setQuestionTimers] = useState(() => new Map());
  const [lockedQuestions, setLockedQuestions] = useState(() => new Set());
  const [violations, setViolations] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const serverOffsetRef = useRef(0);
  const timerRef = useRef(null);
  const inactivityRef = useRef({ last: Date.now(), timer: null });
  const violationRef = useRef({ count: 0, lastViolation: 0 });

  const answersArray = useMemo(() => Array.from(answers.entries()).map(([questionId, selectedOption]) => ({ questionId, selectedOption })), [answers]);

  const unansweredCount = useMemo(() => {
    let u = 0;
    for (const q of questions) if (!answers.get(q._id)) u += 1;
    return u;
  }, [answers, questions]);

  const questionTimeLimit = useMemo(() => {
    if (!test || !questions.length) return 0;
    return Math.floor((test.durationMinutes * 60 * 1000) / questions.length);
  }, [test, questions]);

  const questionRemainingMs = useMemo(() => {
    if (!attempt || !questions[idx]) return 0;
    const questionStartTime = questionTimers.get(questions[idx]._id);
    if (!questionStartTime) return questionTimeLimit;
    const elapsed = currentTime + serverOffsetRef.current - questionStartTime;
    return Math.max(0, questionTimeLimit - elapsed);
  }, [attempt, questions, idx, questionTimers, questionTimeLimit, currentTime]);

  const endsAtMs = attempt?.endsAt ? new Date(attempt.endsAt).getTime() : 0;
  const remainingMs = Math.max(0, endsAtMs - (currentTime + serverOffsetRef.current));

  async function submit(source = "MANUAL") {
    if (!test) return;
    setSubmitting(true);
    try {
      await api.post("/api/test/submit", { testId: test.id || test._id, answers: answersArray, source }, token);
      navigate(source === 'MANUAL' ? '/exam/result' : '/app/profile', { replace: true });
    } catch (err) {
      setWarning(err.message || "Submit failed");
    } finally {
      setSubmitting(false);
      setSubmitOpen(false);
    }
  }

  async function sendProctoring(type, meta) {
    if (!test) return;
    try {
      const res = await api.post("/api/proctoring/event", { testId: test.id || test._id, type, meta, answers: answersArray }, token);
      if (res?.autoSubmitted) navigate("/exam/result", { replace: true });
    } catch {}
  }

  useEffect(() => {
    if (!test) return;

    const handleContextMenu = (e) => { 
      e.preventDefault(); 
      handleViolation('Restricted Action: Context Menu');
      return false; 
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) { 
        e.preventDefault(); 
        handleViolation('Restricted Action: Copy/Paste/Select');
        return false; 
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) { 
        e.preventDefault(); 
        handleViolation('Restricted Action: DevTools');
        return false; 
      }
    };

    const handleVisibilityChange = () => { 
      if (document.hidden) {
        console.warn("Anti-cheating: Tab switch detected. Initiating auto-submission.");
        sendProctoring('TAB_SWITCH', { reason: 'Tab switched while test active' });
        submit('AUTO_SUBMIT_TAB_SWITCH'); 
      }
    };

    const handleViolation = (reason) => {
      const now = Date.now();
      if (now - violationRef.current.lastViolation > 5000) {
        violationRef.current.count++;
        violationRef.current.lastViolation = now;
        setViolations(violationRef.current.count);
        setWarning(`Warning: Violation ${violationRef.current.count}/3 [${reason}]`);
        
        sendProctoring('VIOLATION', { reason, count: violationRef.current.count });
        
        if (violationRef.current.count >= 3) {
          submit('AUTO_SUBMIT_VIOLATIONS');
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [test, answersArray, submit]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (questions[idx] && !lockedQuestions.has(questions[idx]._id)) {
      const qId = questions[idx]._id;
      setQuestionTimers(prev => new Map(prev).set(qId, Date.now() + serverOffsetRef.current));
    }
  }, [idx, questions, serverOffsetRef]);

  useEffect(() => {
    if (questionRemainingMs <= 0 && questions[idx] && !lockedQuestions.has(questions[idx]._id)) {
      setLockedQuestions(prev => new Set([...prev, questions[idx]._id]));
      for (let i = idx + 1; i < questions.length; i++) {
        if (!lockedQuestions.has(questions[i]._id)) { setIdx(i); break; }
      }
    }
  }, [questionRemainingMs, idx, questions, lockedQuestions]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const active = await api.get("/api/test/active", token);
        serverOffsetRef.current = new Date(active.serverNow).getTime() - Date.now();
        if (!active.test) return;

        const serverNow = Date.now() + serverOffsetRef.current;
        const testStartTime = new Date(active.test.startTime).getTime();
        if (testStartTime > serverNow) {
          if (!cancelled) setTest(active.test);
          return;
        }

        const started = await api.post("/api/test/start", {}, token);
        if (cancelled) return;
        setTest(started.test);
        setAttempt(started.attempt);
        serverOffsetRef.current = new Date(started.serverNow).getTime() - Date.now();
        const q = await api.get(`/api/test/${started.test.id}/questions`, token);
        if (cancelled) return;
        setQuestions((q.questions || []).slice(0, 30));
      } catch (err) {
        if (!cancelled) setWarning(err.message || "Failed to load test");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!attempt?.endsAt) return;
    timerRef.current = setInterval(() => {
      const remaining = new Date(attempt.endsAt).getTime() - (Date.now() + serverOffsetRef.current);
      if (remaining <= 0) { clearInterval(timerRef.current); submit("AUTO"); }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [attempt?.endsAt]);

  const needsActivation = !attempt && test;
  const isScheduled = test?.startTime && new Date(test.startTime) > (Date.now() + serverOffsetRef.current);
  const timeUntilStart = test?.startTime ? new Date(test.startTime).getTime() - (Date.now() + serverOffsetRef.current) : 0;
  const q = questions[idx];
  const selected = q ? answers.get(q._id) : "";

  if (loading) return (
     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Assessment...</p>
     </div>
  );

  if (!test) return (
    <div className="max-w-2xl mx-auto mt-20 p-12 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
       <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-4">
         <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
       </div>
       <h2 className="text-xl font-bold text-slate-900">No Active Test</h2>
       <p className="text-sm text-slate-500 mt-2">There are currently no active assessments available for you.</p>
    </div>
  );

  if (needsActivation) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="space-y-6 text-center">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full bg-green-50 text-xs font-semibold text-green-700 border border-green-200 mb-4">Ready to Start</span>
            <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div className="text-xs font-semibold text-slate-500 mb-1">Time Allocated</div>
               <div className="text-lg font-bold text-slate-900">{test.durationMinutes} Minutes</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div className="text-xs font-semibold text-slate-500 mb-1">Questions</div>
               <div className="text-lg font-bold text-slate-900">{test.questionCount || '??'}</div>
            </div>
          </div>

          {isScheduled ? (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
               <div className="text-xs font-semibold text-slate-500 mb-2">Starts In</div>
               <div className="text-4xl font-bold text-slate-900 font-mono">
                  {Math.floor(timeUntilStart / 3600000).toString().padStart(2, '0')}:
                  {String(Math.floor((timeUntilStart % 3600000) / 60000)).padStart(2, '0')}:
                  {String(Math.floor((timeUntilStart % 60000) / 1000)).padStart(2, '0')}
               </div>
            </div>
          ) : (
            <button 
              onClick={async () => {
                await api.post(`/api/test/${test?.id || test?._id}/student-activate`, {}, token);
                window.location.reload();
              }}
              className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
           <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
           <p className="text-sm text-slate-500 mt-1">Assessment in Progress</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
           <div className={`px-4 py-2 rounded-md border flex items-center gap-3 ${remainingMs < 300000 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              <div className="text-xs font-semibold uppercase">Time Remaining</div>
              <div className="text-lg font-bold font-mono">{msToClock(remainingMs)}</div>
           </div>
           
           <div className={`px-4 py-2 rounded-md border flex items-center gap-3 ${questionRemainingMs < 30000 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-800'}`}>
              <div className="text-xs font-semibold uppercase">Question {idx + 1} Timer</div>
              <div className="text-lg font-bold font-mono">
                 {q && lockedQuestions.has(q._id) ? "LOCKED" : msToClock(questionRemainingMs)}
              </div>
           </div>

           <button 
             onClick={() => setSubmitOpen(true)}
             disabled={submitting}
             className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
           >
             Submit Test
           </button>
        </div>
      </div>

      {warning && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-3">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
           <p className="text-sm font-semibold">{warning}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm min-h-[400px] flex flex-col justify-center">
              <div className="text-sm font-semibold text-slate-500 mb-6">Question {idx + 1} of {questions.length}</div>
              
              {!q ? (
                <p className="text-slate-500">Loading question...</p>
              ) : (
                <div className="w-full space-y-8">
                   <h2 className="text-xl font-semibold text-slate-900">{q.question}</h2>
                   
                   <div className="space-y-3">
                      {[
                        { k: "A", t: q.optionA },
                        { k: "B", t: q.optionB },
                        { k: "C", t: q.optionC },
                        { k: "D", t: q.optionD }
                      ].map((opt) => (
                        <button
                          key={opt.k}
                          disabled={lockedQuestions.has(q._id)}
                          onClick={() => setAnswers(new Map(answers).set(q._id, opt.k))}
                          className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-4 ${
                            selected === opt.k 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          } ${lockedQuestions.has(q._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-sm font-bold ${
                             selected === opt.k ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-500'
                           }`}>
                             {opt.k}
                           </div>
                           <span className={`text-base font-medium ${selected === opt.k ? 'text-blue-900' : 'text-slate-700'}`}>{opt.t}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}
           </div>

           <div className="flex items-center justify-between">
              <button 
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={idx === 0 || lockedQuestions.has(questions[idx - 1]?._id)}
                className="px-6 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setIdx(Math.min(questions.length - 1, idx + 1))}
                disabled={idx >= questions.length - 1}
                className="px-6 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Questions Overview</h3>
              <div className="grid grid-cols-5 gap-2">
                 {questions.map((qq, i) => (
                    <button
                      key={qq._id}
                      onClick={() => setIdx(i)}
                      className={`h-10 rounded-md text-sm font-semibold transition-colors flex items-center justify-center ${
                        i === idx ? 'bg-slate-800 text-white' :
                        answers.has(qq._id) ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                 ))}
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Proctoring Active</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">Your activity is being monitored. Tab switching and copy/pasting are disabled and will be flagged.</p>
           </div>
        </div>
      </div>

      <Modal open={submitOpen} title="Submit Assessment" onClose={() => setSubmitOpen(false)}>
        <div className="p-2 space-y-6">
           <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Are you sure you want to submit?</h3>
              <p className="text-sm text-slate-500 mt-2">You have <span className="font-bold text-slate-800">{unansweredCount}</span> unanswered questions. Once submitted, you cannot change your answers.</p>
           </div>
           <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setSubmitOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 text-sm font-semibold border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => submit("MANUAL")}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Submit Now
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}