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

function performanceTone(msRemaining) {
  const fiveMin = 5 * 60 * 1000;
  return msRemaining <= fiveMin ? "amber" : "neutral";
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

  // Anti-cheating measures
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable copy/paste shortcuts
    const handleKeyDown = (e) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        return false;
      }
      // Block Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    // Detect tab switching and window focus loss
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab switched');
      }
    };

    const handleBlur = () => {
      handleViolation('Window lost focus');
    };

    // Detect mouse leaving window
    const handleMouseLeave = () => {
      handleViolation('Mouse left window');
    };

    // Handle violations
    const handleViolation = (reason) => {
      const now = Date.now();
      if (now - violationRef.current.lastViolation > 5000) { // 5 second cooldown
        violationRef.current.count++;
        violationRef.current.lastViolation = now;
        setViolations(violationRef.current.count);
        
        setWarning(`⚠️ Violation ${violationRef.current.count}: ${reason}. Max violations: 3`);
        
        // Auto-submit after 3 violations
        if (violationRef.current.count >= 3) {
          submit('AUTO_SUBMIT_VIOLATIONS');
        }
        
        // Send violation to backend
        sendProctoring('VIOLATION', { reason, count: violationRef.current.count });
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Request fullscreen
    const requestFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          // Fallback if fullscreen is denied
          console.warn('Fullscreen denied');
        });
      }
    };

    // Try to enter fullscreen on mount
    requestFullscreen();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Auto-refresh for scheduled tests
  useEffect(() => {
    if (!test || !test.startTime || attempt) return;

    const startTime = new Date(test.startTime).getTime();
    const currentTime = Date.now() + serverOffsetRef.current;
    const timeUntilStart = startTime - currentTime;

    // If test is scheduled for future, set up auto-refresh
    if (timeUntilStart > 0) {
      const refreshInterval = setInterval(() => {
        const newCurrentTime = Date.now() + serverOffsetRef.current;
        const newTimeUntilStart = startTime - newCurrentTime;
        
        if (newTimeUntilStart <= 0) {
          // Test should start now, refresh the page
          clearInterval(refreshInterval);
          window.location.reload();
        }
      }, 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [test?.startTime, attempt, serverOffsetRef.current]);

  // Real-time countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate per-question time limit (total duration / number of questions)
  const questionTimeLimit = useMemo(() => {
    if (!test || !questions.length) return 0;
    return Math.floor((test.durationMinutes * 60 * 1000) / questions.length);
  }, [test, questions]);

  // Calculate remaining time for current question
  const questionRemainingMs = useMemo(() => {
    if (!attempt || !questions[idx]) return 0;
    const questionStartTime = questionTimers.get(questions[idx]._id);
    if (!questionStartTime) return questionTimeLimit;
    
    const elapsed = currentTime + serverOffsetRef.current - questionStartTime;
    return Math.max(0, questionTimeLimit - elapsed);
  }, [attempt, questions, idx, questionTimers, questionTimeLimit, currentTime]);

  const endsAtMs = attempt?.endsAt ? new Date(attempt.endsAt).getTime() : 0;
  const remainingMs = Math.max(0, endsAtMs - (currentTime + serverOffsetRef.current));
  const unansweredCount = useMemo(() => {
    let u = 0;
    for (const q of questions) {
      if (!answers.get(q._id)) u += 1;
    }
    return u;
  }, [answers, questions]);

  const answersArray = useMemo(
    () => Array.from(answers.entries()).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    })),
    [answers]
  );

  // Start timer for current question
  useEffect(() => {
    if (questions[idx] && !lockedQuestions.has(questions[idx]._id)) {
      const questionId = questions[idx]._id;
      setQuestionTimers(prev => {
        const newTimers = new Map(prev);
        newTimers.set(questionId, Date.now() + serverOffsetRef.current);
        return newTimers;
      });
    }
  }, [idx, questions, serverOffsetRef]);

  // Check for question time expiration
  useEffect(() => {
    if (questionRemainingMs <= 0 && questions[idx] && !lockedQuestions.has(questions[idx]._id)) {
      // Lock current question
      setLockedQuestions(prev => new Set([...prev, questions[idx]._id]));
      
      // Auto-advance to next available question
      for (let i = idx + 1; i < questions.length; i++) {
        if (!lockedQuestions.has(questions[i]._id)) {
          setIdx(i);
          break;
        }
      }
    }
  }, [questionRemainingMs, idx, questions, lockedQuestions]);

  async function sendProctoring(type) {
    if (!test) return;
    try {
      const res = await api.post(
        "/api/proctoring/event",
        { testId: test.id || test._id, type, meta: { page: "TestPage" }, answers: answersArray },
        token
      );
      if (res?.autoSubmitted) navigate("/exam/result", { replace: true });
    } catch {
      // keep exam UX stable even if proctoring logging fails
    }
  }

  async function submit(source = "MANUAL") {
    if (!test) return;
    setSubmitting(true);
    try {
      await api.post(
        "/api/test/submit",
        {
          testId: test.id || test._id,
          answers: answersArray,
        },
        token
      );
      
      // Navigate to dashboard instead of result page for terminated tests
      if (source === 'WINDOW_LEAVE' || source === 'AUTO_SUBMIT_VIOLATIONS') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/exam/result', { replace: true });
      }
    } catch (err) {
      setWarning(err.message || "Submit failed");
    } finally {
      setSubmitting(false);
      setSubmitOpen(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const active = await api.get("/api/test/active", token);
        serverOffsetRef.current = new Date(active.serverNow).getTime() - Date.now();
        if (!active.test) {
          if (!cancelled) setTest(null);
          return;
        }

        const serverNow = Date.now() + serverOffsetRef.current;
        const testStartTime = new Date(active.test.startTime).getTime();
        
        // Check if test is scheduled for future
        if (testStartTime > serverNow) {
          // Don't start yet - just set test data to show waiting card
          if (!cancelled) {
            setTest(active.test);
            setAttempt(null); // No attempt yet
          }
          return;
        }

        // Start attempt only if scheduled time has passed
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
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Timer tick + auto-submit on timeout
  useEffect(() => {
    if (!attempt?.endsAt) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = new Date(attempt.endsAt).getTime() - (Date.now() + serverOffsetRef.current);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        submit("AUTO");
      }
    }, 500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.endsAt]);

  // Proctoring: tab switch
  useEffect(() => {
    function onVis() {
      if (document.hidden) {
        setWarning("You left the test window.");
        sendProctoring("TAB_SWITCH");
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, answersArray]);

  // Proctoring: inactivity (no mouse/keyboard)
  useEffect(() => {
    function bump() {
      inactivityRef.current.last = Date.now();
    }
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);

    inactivityRef.current.timer = setInterval(() => {
      const idleMs = Date.now() - inactivityRef.current.last;
      if (idleMs > 30_000) {
        setWarning("Inactivity detected.");
        sendProctoring("INACTIVITY");
        inactivityRef.current.last = Date.now();
      }
    }, 2_000);

    return () => {
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      if (inactivityRef.current.timer) clearInterval(inactivityRef.current.timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, answersArray]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (attempt) {
        e.preventDefault();
        e.returnValue = '';
        submit('WINDOW_LEAVE');
      }
    };
    const handlePageHide = () => { if (attempt) submit('WINDOW_LEAVE'); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', () => { if (document.hidden) handlePageHide(); });
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handlePageHide);
    };
  }, [attempt]);

  // Show test card immediately when activated, but handle start time logic
  const needsActivation = !attempt && test;
  const isScheduled = test?.startTime && new Date(test.startTime) > (Date.now() + serverOffsetRef.current);
  const timeUntilStart = test?.startTime ? new Date(test.startTime).getTime() - (Date.now() + serverOffsetRef.current) : 0;
  const q = questions[idx];
  const selected = q ? answers.get(q._id) : "";
  const tone = performanceTone(remainingMs);

  if (loading) return <div className="text-sm font-semibold text-slate-700">Loading exam…</div>;

  if (!test) {
    return (
      <Card className="p-6">
        <div className="text-lg font-extrabold text-slate-900">No active test</div>
        <div className="mt-2 text-sm text-slate-600">When an exam is activated, it will appear here.</div>
      </Card>
    );
  }

  // Show activated test card - with countdown if scheduled, or ready to start
  if (needsActivation) {
    return (
      <Card className="p-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
            <span className="text-lg font-extrabold text-slate-900">{test.title}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-500">Duration</div>
              <div className="text-sm font-extrabold text-slate-900">{test.durationMinutes} minutes</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-500">Total Questions</div>
              <div className="text-sm font-extrabold text-slate-900">{test.questionCount || '—'}</div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">Schedule</div>
            <div className="text-sm text-slate-700">
              Start: <span className="font-semibold">{new Date(test.startTime).toLocaleString()}</span>
            </div>
            <div className="text-sm text-slate-700">
              End: <span className="font-semibold">{new Date(test.endTime).toLocaleString()}</span>
            </div>
          </div>
          
          {isScheduled ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⏰</span>
                  <span className="text-sm font-extrabold text-amber-900">Test Starting In</span>
                </div>
                <div className="text-3xl font-bold text-amber-900 text-center py-2">
                  {Math.floor(timeUntilStart / 3600000).toString().padStart(2, '0')}:
                  {String(Math.floor((timeUntilStart % 3600000) / 60000)).padStart(2, '0')}:
                  {String(Math.floor((timeUntilStart % 60000) / 1000)).padStart(2, '0')}
                </div>
                <div className="text-xs text-amber-700 text-center">
                  Test will be available at {new Date(test.startTime).toLocaleTimeString()}
                </div>
              </div>
              
              <Button disabled className="w-full opacity-50 cursor-not-allowed">
                ⏳ Waiting for scheduled time...
              </Button>
              
              <div className="text-xs text-slate-500 space-y-1">
                <p>• Do not close this page - test will appear automatically when time arrives</p>
                <p>• Keep this tab open and active</p>
                <p>• Ensure stable internet connection</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-extrabold text-emerald-900">Test is Ready to Start!</span>
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  Click the button below to begin your exam
                </div>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const endpoint = `/api/test/${test?.id || test?._id}/student-activate?v=${Date.now()}`;
                    await api.post(endpoint, {}, token);
                    window.location.reload();
                  } catch (err) {
                    setWarning(err.message || "Failed to start test");
                  }
                }}
                className="w-full"
              >
                🚀 Start Test Now
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active test</div>
            <div className="text-lg font-extrabold text-slate-900 truncate">{test.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-900"}`}>
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-600">Overall</div>
                <div>{msToClock(remainingMs)}</div>
              </div>
            </div>
            <div className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${questionRemainingMs <= 60000 ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-900"}`}>
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-600">Question {idx + 1}</div>
                <div>{q && lockedQuestions.has(q._id) ? "LOCKED" : msToClock(questionRemainingMs)}</div>
              </div>
            </div>
            {violations > 0 && (
              <div className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${violations >= 3 ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-600">Violations</div>
                  <div>{violations}/3</div>
                </div>
              </div>
            )}
            <Button onClick={() => setSubmitOpen(true)} disabled={submitting}>Submit</Button>
          </div>
        </div>

        {warning ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{warning}</div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
            ⚠️ Anti-cheating enabled: Tab switching, copying, or dev tools will be monitored. 3 violations = auto-submit.
          </div>
        )}

        <Card className="p-6">
          {!q ? (
            <div className="text-sm text-slate-700">No questions loaded.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question {idx + 1} / {questions.length}</div>
              </div>
              <div className="text-base font-extrabold text-slate-900 leading-snug">{q.question}</div>

              <div className="space-y-2">
                {[
                  { key: "A", text: q.optionA },
                  { key: "B", text: q.optionB },
                  { key: "C", text: q.optionC },
                  { key: "D", text: q.optionD }
                ].map((option) => (
                  <label key={option.key} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${selected === option.key ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50/60"} ${lockedQuestions.has(q._id) ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input 
                      type="radio" 
                      name="opt" 
                      className="mt-1" 
                      checked={selected === option.key} 
                      onChange={() => {
                        const newAnswers = new Map(answers);
                        newAnswers.set(q._id, option.key);
                        setAnswers(newAnswers);
                      }} 
                      disabled={lockedQuestions.has(q._id)} 
                    />
                    <div className="text-sm font-semibold text-slate-800">
                      <span className="font-extrabold text-slate-900 mr-2">{option.key}.</span>
                      {option.text}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" disabled={idx === 0 || lockedQuestions.has(questions[idx - 1]?._id)} onClick={() => setIdx(Math.max(0, idx - 1))}>Previous</Button>
                <Button variant="secondary" disabled={idx >= questions.length - 1} onClick={() => setIdx(Math.min(questions.length - 1, idx + 1))}>Next</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((qq, i) => {
            const a = answers.get(qq._id);
            const isCurrent = i === idx;
            return (
              <button
                key={qq._id}
                className={`w-9 h-9 rounded-lg border text-sm font-extrabold ${
                  isCurrent ? "border-slate-900 bg-slate-900 text-white" : a ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
                onClick={() => setIdx(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <Modal
          open={submitOpen}
          title="Submit test"
          description="You are about to submit. You cannot edit after submit."
          onClose={() => (!submitting ? setSubmitOpen(false) : null)}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-700">
                Unanswered: <span className="font-extrabold text-slate-900">{unansweredCount}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={submitting} onClick={() => setSubmitOpen(false)}>Cancel</Button>
                <Button disabled={submitting} onClick={() => submit("MANUAL")}>
                  {submitting ? "Submitting…" : "Final submit"}
                </Button>
              </div>
            </div>
          }
        >
          <div className="text-sm text-slate-700">
            Review your answers. If time runs out, system will auto-submit.
          </div>
        </Modal>
      </div>
    </>
  );
}
   