import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDoubtById, resolveDoubt, getMessages, postMessage } from "../../services/collaborationService.js";

export default function DoubtDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchDoubt();
  }, [id, token]);

  const fetchDoubt = async () => {
    try {
      const res = await getDoubtById(id, token);
      setData(res);
      if (res.conversation) {
        const msgRes = await getMessages(res.conversation._id, token);
        setMessages(msgRes.messages);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !data.conversation) return;
    setSending(true);
    try {
      await postMessage(data.conversation._id, { content: reply }, token);
      setReply("");
      fetchDoubt(); // refetch to get new messages nicely populated
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveDoubt(id, token);
      fetchDoubt();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading doubt...</div>;
  if (!data || !data.doubt) return <div className="text-sm p-4 text-red-500">Doubt not found.</div>;

  const { doubt } = data;
  const canResolve = user?.id === doubt.studentId._id || user?.role === "Teacher" || user?.role === "Admin";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Doubt Info Sidebar */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <Link to="/app/collaboration/mentorship" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Back
          </Link>
          <span className={`text-xs font-bold px-2 py-1 rounded border ${
            doubt.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {doubt.status}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{doubt.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              By {doubt.studentId.name} • {new Date(doubt.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{doubt.description}</p>
          </div>
          
          <div className="flex gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">{doubt.category}</span>
            {doubt.priority === "Urgent" && <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded">Urgent</span>}
          </div>

          {doubt.status === "Open" && canResolve && (
            <button
              onClick={handleResolve}
              className="w-full mt-4 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="text-sm font-bold text-slate-800">Discussion</h3>
          <p className="text-xs text-slate-500">Teachers and the student can chat here.</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isMe = msg.senderId._id === user?.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">{msg.senderId.name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                  isMe ? "bg-indigo-600 text-white rounded-br-none" 
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {doubt.status === "Open" ? (
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 text-sm rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              disabled={sending || !reply.trim()}
              className="bg-slate-900 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-semibold text-slate-500 shrink-0">
            This doubt has been resolved. Chat is closed.
          </div>
        )}
      </div>
    </div>
  );
}
