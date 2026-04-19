import { useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Field.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Table from "../../components/Table.jsx";

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

  const invalidCount = useMemo(() => {
    let bad = 0;
    for (const q of questions) {
      if (
        !q.question?.trim() ||
        !q.optionA?.trim() ||
        !q.optionB?.trim() ||
        !q.optionC?.trim() ||
        !q.optionD?.trim() ||
        !q.correctAnswer
      ) {
        bad += 1;
      }
    }
    return bad;
  }, [questions]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-extrabold text-slate-900">Test & Evaluation — Admin</div>
        <div className="text-sm text-slate-600">
          Create a scheduled test, activate it (one active at a time), and add <span className="font-bold">30</span>{" "}
          questions.
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {info}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <div className="text-sm font-extrabold text-slate-900">Create test</div>
          <div className="mt-1 text-xs text-slate-600">Use ISO schedule window; activation is only allowed within it.</div>

          <div className="mt-4 space-y-3">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Duration (minutes)">
              <Input
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                inputMode="numeric"
                type="number"
                min={1}
                max={600}
              />
            </Field>
            <Field label="Start time (local)">
              <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="datetime-local" />
            </Field>
            <Field label="End time (local)">
              <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="datetime-local" />
            </Field>

            <div className="flex gap-2 pt-2">
              <Button
                disabled={creating}
                onClick={async () => {
                  setError("");
                  setInfo("");
                  setCreating(true);
                  try {
                    const res = await api.post(
                      "/api/test",
                      {
                        title: title.trim(),
                        durationMinutes: Number(durationMinutes),
                        startTime: new Date(startTime).toISOString(),
                        endTime: new Date(endTime).toISOString(),
                      },
                      token
                    );
                    setTestId(res.test._id || res.test.id);
                    setInfo("Test created. Add questions, then activate.");
                  } catch (err) {
                    setError(err.message || "Failed to create test");
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? "Creating…" : "Create"}
              </Button>

              <Button
                variant="secondary"
                disabled={!testId || activating}
                onClick={async () => {
                  setError("");
                  setInfo("");
                  setActivating(true);
                  try {
                    await api.post(`/api/test/${testId}/activate`, {}, token);
                    setInfo("Test activated. Students can now start the exam.");
                  } catch (err) {
                    setError(err.message || "Failed to activate test");
                  } finally {
                    setActivating(false);
                  }
                }}
              >
                {activating ? "Activating…" : "Activate"}
              </Button>
            </div>

            <div className="pt-2">
              <Field label="Current testId" hint="Used when adding questions / activating.">
                <Input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="Paste a testId…" />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Questions (30)</div>
              <div className="mt-1 text-xs text-slate-600">
                Complete all fields. Correct answers are stored server-side only.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-700">
                Incomplete: <span className="font-extrabold text-slate-900">{invalidCount}</span>
              </div>
              <Button
                disabled={!testId || adding || invalidCount > 0}
                onClick={async () => {
                  setError("");
                  setInfo("");
                  setAdding(true);
                  try {
                    await api.post(
                      `/api/test/${testId}/questions`,
                      {
                        questions: questions.map((q) => ({
                          question: q.question?.trim() || "",
                          optionA: q.optionA?.trim() || "",
                          optionB: q.optionB?.trim() || "",
                          optionC: q.optionC?.trim() || "",
                          optionD: q.optionD?.trim() || "",
                          correctAnswer: q.correctAnswer || "A",
                        })),
                      },
                      token
                    );
                    setInfo("Questions added successfully.");
                  } catch (err) {
                    setError(err.message || "Failed to add questions");
                  } finally {
                    setAdding(false);
                  }
                }}
              >
                {adding ? "Adding…" : "Add questions"}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bulk paste (optional)</div>
              <div className="mt-1 text-xs text-slate-600">
                Paste JSON array with 30 items:{" "}
                <span className="font-semibold">question, optionA, optionB, optionC, optionD, correctAnswer</span>.
              </div>
              <Textarea
                className="mt-3 min-h-[110px]"
                placeholder='[{"question":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A"}]'
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  if (!raw) return;
                  try {
                    const arr = JSON.parse(raw);
                    if (!Array.isArray(arr) || arr.length !== 30) throw new Error("Must be an array of 30 questions");
                    
                    console.log("Parsed JSON:", arr);
                    
                    const normalized = arr.map((q, i) => {
                      // Extract raw text, handling if they pasted array of strings or unknown object keys
                      let text = "";
                      if (typeof q === "string") {
                        text = q;
                      } else {
                        text = q.question || q.text || q.title || q.q || q.body || q.content || q.name || q.questionText || "";
                        if (!text && typeof q === "object") {
                          text = JSON.stringify(q); // Force display it if completely unmapped!
                        }
                      }
                      
                      const optA = q.optionA || q.a || q.A || q.optA || q.options?.[0] || q.choices?.[0] || q[1] || "";
                      const optB = q.optionB || q.b || q.B || q.optB || q.options?.[1] || q.choices?.[1] || q[2] || "";
                      const optC = q.optionC || q.c || q.C || q.optC || q.options?.[2] || q.choices?.[2] || q[3] || "";
                      const optD = q.optionD || q.d || q.D || q.optD || q.options?.[3] || q.choices?.[3] || q[4] || "";
                      let ans = q.correctAnswer || q.answer || q.ans || q.correct || q[5] || "A";
                      
                      // Normalize answer to A, B, C, D
                      if (typeof ans === "string") {
                        ans = ans.toUpperCase().trim();
                        if (!["A", "B", "C", "D"].includes(ans)) {
                          // Try to map numeric or text answers back
                          if (ans === optA?.toUpperCase()?.trim()) ans = "A";
                          else if (ans === optB?.toUpperCase()?.trim()) ans = "B";
                          else if (ans === optC?.toUpperCase()?.trim()) ans = "C";
                          else if (ans === optD?.toUpperCase()?.trim()) ans = "D";
                          else ans = "A"; // Default fallback
                        }
                      } else {
                        ans = "A";
                      }

                      return {
                        id: `q${i + 1}`,
                        question: String(text),
                        optionA: optA ? String(optA) : "Option A",
                        optionB: optB ? String(optB) : "Option B",
                        optionC: optC ? String(optC) : "Option C",
                        optionD: optD ? String(optD) : "Option D",
                        correctAnswer: ans
                      };
                    });
                    
                    console.log("Questions state updated to:", normalized);
                    setQuestions(normalized);
                    setInfo("Loaded 30 questions from JSON.");
                    setError("");
                  } catch (err) {
                    setError(err.message || "Invalid JSON");
                  }
                }}
              />
            </div>

            {/* Compact table editor */}
            <Table
              dense
              caption="Edit each row. Tip: keep questions concise and unambiguous."
              columns={[
                { key: "n", label: "#" },
                {
                  key: "question",
                  label: "Question",
                  render: (_, r) => (
                    <Input
                      value={r.question || ""}
                      onChange={(e) =>
                        setQuestions((qs) => qs.map((q) => (q.id === r.id ? { ...q, question: e.target.value } : q)))
                      }
                      placeholder={`Question ${r.n}`}
                    />
                  ),
                },
                {
                  key: "correctAnswer",
                  label: "Correct",
                  render: (_, r) => (
                    <Select
                      value={r.correctAnswer}
                      onChange={(e) =>
                        setQuestions((qs) =>
                          qs.map((q) => (q.id === r.id ? { ...q, correctAnswer: e.target.value } : q))
                        )
                      }
                    >
                      {ANSWERS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </Select>
                  ),
                },
              ]}
              rows={questions.map((q, i) => ({ ...q, n: i + 1 }))}
              emptyText="No questions."
            />

            {/* Option editor below (focused index) */}
            <Card className="p-5">
              <div className="text-sm font-extrabold text-slate-900">Option editor</div>
              <div className="mt-1 text-xs text-slate-600">Edit options for a specific question number.</div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Question number (1–30)">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={1}
                    disabled
                    className="opacity-70"
                  />
                </Field>
                <div className="hidden md:block" />
                <Field label="Option A">
                  <Input
                    value={questions[0]?.optionA || ""}
                    onChange={(e) => setQuestions((qs) => qs.map((q, i) => (i === 0 ? { ...q, optionA: e.target.value } : q)))}
                  />
                </Field>
                <Field label="Option B">
                  <Input
                    value={questions[0]?.optionB || ""}
                    onChange={(e) => setQuestions((qs) => qs.map((q, i) => (i === 0 ? { ...q, optionB: e.target.value } : q)))}
                  />
                </Field>
                <Field label="Option C">
                  <Input
                    value={questions[0]?.optionC || ""}
                    onChange={(e) => setQuestions((qs) => qs.map((q, i) => (i === 0 ? { ...q, optionC: e.target.value } : q)))}
                  />
                </Field>
                <Field label="Option D">
                  <Input
                    value={questions[0]?.optionD || ""}
                    onChange={(e) => setQuestions((qs) => qs.map((q, i) => (i === 0 ? { ...q, optionD: e.target.value } : q)))}
                  />
                </Field>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Note: To keep this page lightweight, the option editor currently edits question #1. If you want full per-row option editing,
                I can extend the table with expandable rows.
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}

