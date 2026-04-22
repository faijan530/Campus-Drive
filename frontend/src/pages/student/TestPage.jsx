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

  // 1. Memoized Values First
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

  // 2. Critical Functions (hoisted but kept here for clarity)
  async function submit(source = "MANUAL") {
    if (!test) return;
    setSubmitting(true);
    try {
      await api.post("/api/test/submit", { testId: test.id || test._id, answers: answersArray }, token);
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

  // 3. Side Effects (After hooks they depend on)
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
        submit('AUTO_SUBMIT_TAB_SWITCH'); 
      }
    };

    const handleViolation = (reason) => {
      const now = Date.now();
      if (now - violationRef.current.lastViolation > 5000) {
        violationRef.current.count++;
        violationRef.current.lastViolation = now;
        setViolations(violationRef.current.count);
        setWarning(`WARNING: Violation ${violationRef.current.count}/3 [${reason}]`);
        
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
        setQuestions(q.questions || []);
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
     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Synchronizing Atomic Clock...</p>
     </div>
  );

  if (!test) return (
    <div className="max-w-2xl mx-auto mt-20 p-16 bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] shadow-2xl text-center">
       <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">📡</div>
       <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">No Active Protocols</h2>
       <p className="text-sm font-bold text-slate-400 mt-2">The system is currently on standby. Await external signal for assessment phase.</p>
    </div>
  );

  if (needsActivation) return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -z-0"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">Ready</span>
             <h1 className="text-3xl font-black text-slate-800 tracking-tight">{test.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Allocated</div>
               <div className="text-xl font-black text-slate-800">{test.durationMinutes} Minutes</div>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Complexity Matrix</div>
               <div className="text-xl font-black text-slate-800">{test.questionCount || '??'} Modules</div>
            </div>
          </div>

          {isScheduled ? (
            <div className="p-10 bg-indigo-600 rounded-[3rem] text-center shadow-2xl shadow-indigo-200">
               <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-4">Countdown to Activation</div>
               <div className="text-6xl font-black text-white tracking-tighter">
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
              className="w-full py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl hover:bg-black transition-all active:scale-95"
            >
              Initiate Assessment Phase
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between gap-6 flex-wrap px-2">
        <div className="space-y-1">
           <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none truncate max-w-sm">{test.title}</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Encrypted Session Flow</p>
        </div>

        <div className="flex items-center gap-4">
           <div className={`p-4 rounded-2xl border text-center transition-all ${remainingMs < 300000 ? 'bg-rose-600 border-rose-500 shadow-xl shadow-rose-100' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
              <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Global Timer</div>
              <div className="text-xl font-black text-white leading-none font-mono">{msToClock(remainingMs)}</div>
           </div>
           
           <div className={`p-4 rounded-2xl border text-center transition-all ${questionRemainingMs < 30000 ? 'bg-amber-500 border-amber-400' : 'bg-white border-white shadow-xl shadow-slate-100'}`}>
              <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${questionRemainingMs < 30000 ? 'text-white/80' : 'text-slate-400'}`}>Unit {idx + 1}</div>
              <div className={`text-xl font-black leading-none font-mono ${questionRemainingMs < 30000 ? 'text-white' : 'text-slate-800'}`}>
                 {q && lockedQuestions.has(q._id) ? "LOCKED" : msToClock(questionRemainingMs)}
              </div>
           </div>

           <button 
             onClick={() => setSubmitOpen(true)}
             disabled={submitting}
             className="px-8 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
           >
             Finalize Audit
           </button>
        </div>
      </div>

      {warning && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl flex items-center gap-4 animate-shake shadow-xl shadow-rose-100">
           <span className="text-xl">🚨</span>
           <p className="text-xs font-black uppercase tracking-[0.1em]">{warning}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
           <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] min-h-[400px] flex flex-col items-center justify-center relative">
              <div className="absolute top-8 left-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">Question Module {(idx + 1).toString().padStart(2, '0')}</div>
              
              {!q ? (
                <p className="text-slate-400 font-bold">Waiting for module payload...</p>
              ) : (
                <div className="w-full space-y-10">
                   <h2 className="text-2xl font-black text-slate-800 leading-snug text-center">{q.question}</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                            selected === opt.k 
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-lg' 
                              : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                          } ${lockedQuestions.has(q._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           {selected === opt.k && <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 rounded-bl-xl flex items-center justify-center text-white text-[10px] font-black">✓</div>}
                           <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${selected === opt.k ? 'text-indigo-600' : 'text-slate-400'}`}>Protocol {opt.k}</span>
                           <span className={`text-sm font-bold block ${selected === opt.k ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>{opt.t}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}
           </div>

           <div className="flex items-center justify-between mt-8">
              <button 
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={idx === 0 || lockedQuestions.has(questions[idx - 1]?._id)}
                className="px-10 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 disabled:opacity-20 transition-all"
              >
                Previous Trace
              </button>
              <button 
                onClick={() => setIdx(Math.min(questions.length - 1, idx + 1))}
                disabled={idx >= questions.length - 1}
                className="px-10 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 disabled:opacity-20 transition-all"
              >
                Next Trace
              </button>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] uppercase">
              <h3 className="text-[11px] font-black text-slate-400 tracking-widest mb-6">Logical Index</h3>
              <div className="grid grid-cols-5 gap-3">
                 {questions.map((qq, i) => (
                    <button
                      key={qq._id}
                      onClick={() => setIdx(i)}
                      className={`h-12 rounded-xl text-xs font-black transition-all ${
                        i === idx ? 'bg-slate-900 text-white shadow-xl' :
                        answers.has(qq._id) ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        'bg-slate-50 text-slate-400 border border-slate-50 hover:border-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-black rounded-[2.5rem] text-white">
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Proctoring Status</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter italic">Active surveillance engaged. Anti-cheating protocols at 100% sensitivity level. Global session ID recorded.</p>
           </div>
        </div>
      </div>

      <Modal open={submitOpen} title="Finalize Audit" onClose={() => setSubmitOpen(false)}>
        <div className="space-y-6 p-4">
           <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Lock Session?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2">You have <span className="text-slate-800">{unansweredCount} modules</span> requiring logic input. Submission is permanent.</p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => setSubmitOpen(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100"
              >
                Return to Audit
              </button>
              <button 
                onClick={() => submit("MANUAL")}
                className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-black"
              >
                Execute Submission
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}