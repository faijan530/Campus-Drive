import { useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Field.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ANSWERS = ["A", "B", "C", "D"];

function isoLocal(dt) {
  if (!dt) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(
    dt.getMinutes()
  )}`;
}

function createEmptyQuestion(i) {
  return {
    id: `q${i + 1}`,
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  };
}

export default function TestAdmin() {
  const { token } = useAuth();

  const [title, setTitle] = useState("CampusDrive Evaluation Test");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startTime, setStartTime] = useState(() => isoLocal(new Date(Date.now() + 5 * 60 * 1000)));
  const [endTime, setEndTime] = useState(() => isoLocal(new Date(Date.now() + 65 * 60 * 1000)));

  const [testId, setTestId] = useState("");
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [questions, setQuestions] = useState(() => Array.from({ length: 30 }, (_, i) => createEmptyQuestion(i)));
  const [editIdx, setEditIdx] = useState(0);

  const invalidCount = useMemo(() => {
    let bad = 0;
    for (const q of questions) {
      if (!q.question?.trim() || !q.optionA?.trim() || !q.optionB?.trim() || !q.optionC?.trim() || !q.optionD?.trim() || !q.correctAnswer) {
        bad += 1;
      }
    }
    return bad;
  }, [questions]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="relative p-10 bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Assessment Architect.</h1>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">Precision evaluation & protocol configuration</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
             <div className="text-right">
                <span className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Active Test ID</span>
                <span className="block text-xs font-black text-white italic tracking-widest font-mono">{testId || "UNSET_KEY"}</span>
             </div>
          </div>
        </div>
      </div>

      {(error || info) && (
        <div className={`p-6 rounded-[2rem] border animate-bounce-in flex items-center gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${error ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'}`}>
              {error ? "⚡" : "✓"}
           </div>
           <p className="text-xs font-black uppercase tracking-widest">{error || info}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creation Hub */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 rounded-[3rem] border border-white bg-white/70 backdrop-blur-3xl shadow-xl space-y-8">
              <div className="space-y-1">
                 <h2 className="text-xl font-black text-slate-800 tracking-tight">Phase Configuration</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal & Identity Parameters</p>
              </div>

              <div className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</label>
                    <Input className="rounded-2xl py-4" value={title} onChange={(e) => setTitle(e.target.value)} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Window (Min)</label>
                    <Input className="rounded-2xl py-4" value={durationMinutes} type="number" onChange={(e) => setDurationMinutes(Number(e.target.value))} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sequence Start</label>
                    <Input className="rounded-2xl py-4" value={startTime} onChange={(e) => setStartTime(e.target.value)} type="datetime-local" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sequence Termination</label>
                    <Input className="rounded-2xl py-4" value={endTime} onChange={(e) => setEndTime(e.target.value)} type="datetime-local" />
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                   disabled={creating}
                   onClick={async () => {
                     setError(""); setInfo(""); setCreating(true);
                     try {
                       const res = await api.post("/api/test", { title, durationMinutes, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString()}, token);
                       setTestId(res.test._id || res.test.id);
                       setInfo("Test created. Add questions, then activate.");
                     } catch (err) { setError(err.message); } finally { setCreating(false); }
                   }}
                   className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl"
                 >
                   {creating ? "Processing..." : "Generate Test Node"}
                 </button>
                 <button 
                   disabled={!testId || activating}
                   onClick={async () => {
                     setError(""); setInfo(""); setActivating(true);
                     try {
                        await api.post(`/api/test/${testId}/activate`, {}, token);
                        setInfo("Test activated successfully.");
                     } catch (err) { setError(err.message); } finally { setActivating(false); }
                   }}
                   className="w-full py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-100"
                 >
                   {activating ? "Initializing..." : "Authorize Phase"}
                 </button>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">Reference Key Override</label>
                <Input className="rounded-xl py-3 text-xs italic font-mono bg-slate-50" value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="PASTE_UUID_HERE" />
              </div>
           </Card>
        </div>

        {/* Question Foundry */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="p-8 rounded-[3rem] border border-white bg-white/70 backdrop-blur-3xl shadow-xl space-y-8 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none italic">Question Foundry.</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{questions.length} Modules in current payload</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <span className="text-[9px] font-black text-slate-400 uppercase block leading-none mb-1">Status Check</span>
                       <span className={`text-xs font-black ${invalidCount > 0 ? 'text-rose-500' : 'text-emerald-500'} italic`}>{invalidCount > 0 ? `${invalidCount} Errors Detected` : 'All Systems Nominal'}</span>
                    </div>
                    <button 
                      disabled={!testId || adding || invalidCount > 0}
                      onClick={async () => {
                        setError(""); setInfo(""); setAdding(true);
                        try {
                           await api.post(`/api/test/${testId}/questions`, { questions: questions.map(q => ({ ...q, question: q.question?.trim() || ""}))}, token);
                           setInfo("Payload delivered successfully.");
                        } catch (err) { setError(err.message); } finally { setAdding(false); }
                      }}
                      className="px-8 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:grayscale"
                    >
                      {adding ? "Transmitting..." : "Upload Payload"}
                    </button>
                 </div>
              </div>

              {/* Bulk Loader */}
              <div className="p-6 bg-slate-900 rounded-[2rem] space-y-4">
                 <div className="flex justify-between items-center text-white/40 uppercase text-[9px] font-black tracking-widest">
                    <span>Bulk Payload Loader (JSON)</span>
                    <span className="italic">Standard Schema Required</span>
                  </div>
                  <textarea 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-xs font-mono text-indigo-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all h-32 custom-scrollbar"
                    placeholder='[ { "question": "Content Here...", "optionA": "...", "correctAnswer": "A" } ]'
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      if (!raw) return;
                      try {
                        const arr = JSON.parse(raw);
                        if (!Array.isArray(arr) || arr.length !== 30) throw new Error("Must be an array of exactly 30 questions");
                        const normalized = arr.map((q, i) => ({
                          id: `q${i + 1}`,
                          question: q.question || q.text || "",
                          optionA: q.optionA || q.a || "", optionB: q.optionB || q.b || "",
                          optionC: q.optionC || q.c || "", optionD: q.optionD || q.d || "",
                          correctAnswer: q.correctAnswer || "A"
                        }));
                        setQuestions(normalized);
                        setInfo("30 questions synchronized.");
                      } catch (err) { setError(err.message); }
                    }}
                  />
              </div>

              {/* Grid Selector */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                 {questions.map((q, i) => (
                    <button 
                      key={q.id}
                      onClick={() => setEditIdx(i)}
                      className={`h-11 rounded-xl text-[10px] font-black transition-all ${
                         i === editIdx ? 'bg-slate-900 text-white scale-110 shadow-xl' : 
                         (q.question?.trim() ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-300 border border-slate-100 uppercase')
                      }`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>

              {/* Module Editor */}
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-8 animate-slide-up" key={editIdx}>
                 <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="space-y-1">
                       <h3 className="text-lg font-black text-slate-800 tracking-tight italic">Module Editor #{(editIdx + 1).toString().padStart(2, '0')}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Attribute Synchronization</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-300 uppercase tracking-widest">Index: {editIdx}</div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Logical Question String</label>
                       <textarea 
                         value={questions[editIdx]?.question}
                         onChange={(e) => setQuestions(qs => qs.map((q, i) => i === editIdx ? { ...q, question: e.target.value } : q))}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all h-24"
                         placeholder="Enter question premise..."
                       />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                       {['A', 'B', 'C', 'D'].map(key => (
                         <div key={key} className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Attribute {key}</label>
                            <input 
                              value={questions[editIdx]?.[`option${key}`]}
                              onChange={(e) => setQuestions(qs => qs.map((q, i) => i === editIdx ? { ...q, [`option${key}`]: e.target.value } : q))}
                              className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-400 transition-all ${questions[editIdx].correctAnswer === key ? 'border-emerald-400 bg-emerald-50/20' : ''}`}
                            />
                         </div>
                       ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Core Resolution</label>
                          <select 
                            value={questions[editIdx].correctAnswer}
                            onChange={(e) => setQuestions(qs => qs.map((q, i) => i === editIdx ? { ...q, correctAnswer: e.target.value } : q))}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-indigo-600 uppercase tracking-widest"
                          >
                             {ANSWERS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditIdx(Math.max(0, editIdx - 1))} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-30" disabled={editIdx === 0}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                          </button>
                          <button onClick={() => setEditIdx(Math.min(29, editIdx + 1))} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-30" disabled={editIdx === 29}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
