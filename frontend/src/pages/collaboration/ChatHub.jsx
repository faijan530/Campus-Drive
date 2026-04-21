import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyConversations, getMessages, postMessage, openConversation } from "../../services/collaborationService.js";
import CallModal from "../../components/call/CallModal.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function formatTimeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);
  if (diffInSec < 60) return "now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m`;
  const diffInHr = Math.floor(diffInMin / 60);
  if (diffInHr < 24) return `${diffInHr}h`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatHub() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time state
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  
  // Call States
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [pendingCall, setPendingCall] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const socket = io(BASE_URL);
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("user-online", user.id));
    socket.on("online-users", setOnlineUsers);
    
    socket.on("receive-message", (msg) => {
      setMessages((prev) => (!prev.find((m) => m._id === msg._id) ? [...prev, msg] : prev));
      scrollToBottom();
    });

    socket.on("user-offline", ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("typing", (id) => setTypingUsers((prev) => new Set(prev).add(id)));
    socket.on("stop-typing", (id) => setTypingUsers((prev) => { const n = new Set(prev); n.delete(id); return n; }));

    // 📞 Call Events
    socket.on("incoming_call", (data) => {
       console.log("[Signal] Incoming Call Request:", data);
       setIncomingCall(data);
    });

    socket.on("call_accepted", (data) => {
       console.log("[Signal] Call Accepted notification received:", data);
       // Caller side: Receiver has accepted, we transition to CallModal
       setActiveCall((prev) => {
          if (!prev) return null;
          return { ...prev, accepted: true };
       });
    });

    socket.on("call_rejected", () => {
       console.log("[Signal] Call Rejected");
       setIncomingCall(null);
       setActiveCall(null);
       setPendingCall(null);
    });

    socket.on("end_call", () => {
       console.log("[Signal] Call Ended");
       setIncomingCall(null);
       setActiveCall(null);
    });

    return () => socket.disconnect();
  }, [token, user.id]);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv._id);
  }, [activeConv, token]);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations(token);
      setConversations(res.conversations || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await getMessages(id, token);
      setMessages(res.messages || []);
      scrollToBottom();
    } catch (err) { console.error(err); }
  };

  const handleOpenChat = async (conv) => {
    setMessages([]);
    setActiveConv(conv);
    if (conv.unreadCount?.[user.id] > 0) {
      try {
        await openConversation(conv._id, token);
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: { ...c.unreadCount, [user.id]: 0 } } : c))
        );
      } catch (err) { console.error(err); }
    }
  };

  const handleTyping = (e) => {
    setReply(e.target.value);
    if (!activeConv || !socketRef.current) return;
    const others = activeConv.participants.filter((p) => p._id.toString() !== user.id.toString());
    others.forEach((p) => socketRef.current.emit("typing", { senderId: user.id.toString(), receiverId: p._id.toString() }));
    clearTimeout(window.tOut);
    window.tOut = setTimeout(() => {
      others.forEach((p) => socketRef.current.emit("stop-typing", { senderId: user.id.toString(), receiverId: p._id.toString() }));
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeConv) return;
    const content = reply;
    setReply("");
    setSending(true);
    const tempId = Date.now().toString();
    setMessages((prev) => [...prev, { _id: tempId, tempId, senderId: { _id: user.id, name: user.name }, content, createdAt: new Date(), status: "SENDING" }]);
    scrollToBottom();
    try {
      const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
      socketRef.current?.emit("send-message", { conversationId: activeConv._id, senderId: user.id.toString(), receiverId: other?._id?.toString(), content, tempId });
      fetchConversations();
    } catch (err) { console.error(err); } finally { setSending(false); }
  };

  // 📞 Initiate Call Request (Step 1)
  const initiateCallRequest = (type) => {
    if (!activeConv || !socketRef.current) return;
    const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
    
    // Emit call_user (Signal)
    socketRef.current.emit("call_user", {
       to: other._id.toString(),
       callType: type,
       fromInfo: { id: user.id, name: user.name }
    });

    // Show "Calling..." state
    setActiveCall({
       from: other._id,
       fromName: other.name,
       callType: type,
       isIncoming: false,
       status: "Calling..."
    });
    setPendingCall(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse bg-[#0F172A] text-white">INITIALIZING PROTOCOL...</div>;

  const filtered = conversations.filter((c) => {
    const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#0F172A] overflow-hidden text-sm">
      
      {/* ── Vertical Rail (Desktop) ── */}
      <nav className="hidden md:flex w-[72px] flex-col items-center py-6 bg-slate-900 border-r border-white/5 gap-8 shrink-0">
         <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">CD.</div>
         <button className="p-3 text-indigo-400 bg-indigo-500/10 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg></button>
         <button className="p-3 text-white/20 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></button>
         <button className="p-3 text-white/20 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
         <div className="mt-auto flex flex-col items-center gap-6 pb-2">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} className="w-10 h-10 rounded-2xl border border-white/10" alt="" />
         </div>
      </nav>

      {/* ── Chat Sidebar (Conversations) ── */}
      <aside className={`h-full md:w-[400px] border-r border-white/5 flex-col bg-slate-900 shrink-0 ${activeConv ? "hidden md:flex" : "flex w-full"}`}>
        <div className="p-6 border-b border-white/5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Messages.</h1>
            <button className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
          <div className="relative group">
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/5 rounded-2xl text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 transition-all" />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map((c) => {
            const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
            const isActive = activeConv?._id === c._id;
            const isOnline = p && onlineUsers.some((id) => id.toString() === p._id.toString());
            return (
              <div key={c._id} onClick={() => handleOpenChat(c)} className={`flex items-center gap-4 p-5 cursor-pointer border-b border-white/[0.02] transition-all ${isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}>
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={p?.avatar || `https://ui-avatars.com/api/?name=${p?.name}&background=random`} className="w-full h-full object-cover" alt="" />
                  </div>
                  {isOnline && <span className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-black text-white text-[15px] truncate">{p?.name}</p>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : ""}</p>
                  </div>
                  <p className="text-[12px] text-white/40 truncate font-bold leading-tight">{p?._id.toString() === user.id.toString() ? "You: " : ""}{c.lastMessage || "Start a connection"}</p>
                </div>
                {c.unreadCount?.[user.id] > 0 && <div className="bg-indigo-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-500/40">{c.unreadCount[user.id]}</div>}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Chat Window (Main Thread) ── */}
      <main key={activeConv?._id || "empty"} className={`flex-1 h-full flex-col bg-[#0F172A] relative ${activeConv ? "flex" : "hidden md:flex"}`}>
        {activeConv ? (
          <>
            <header className="sticky top-0 z-10 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex items-center p-4 px-6 gap-4 shrink-0 shadow-2xl">
              <button onClick={() => setActiveConv(null)} className="md:hidden p-2 text-white/40 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
              <img src={activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name || "U")}&background=random`} className="w-12 h-12 rounded-2xl border border-white/10" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-white truncate text-lg tracking-tight">{activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   {(() => {
                      const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
                      const isOnline = other && onlineUsers.some((id) => id.toString() === other._id.toString());
                      return (
                         <>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-white/10"}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{isOnline ? "Active Core" : `Last seen ${formatTimeAgo(lastSeenMap[other?._id?.toString()] || other?.lastSeen)}`}</span>
                         </>
                      );
                   })()}
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setPendingCall({ type: 'video' })} className="w-12 h-12 bg-white/5 hover:bg-indigo-600/20 text-white/40 hover:text-indigo-400 rounded-2xl flex items-center justify-center transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                <button onClick={() => setPendingCall({ type: 'audio' })} className="w-12 h-12 bg-white/5 hover:bg-emerald-600/20 text-white/40 hover:text-emerald-400 rounded-2xl flex items-center justify-center transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_top,#1E293B,transparent)]">
              {messages.map((m, i) => {
                const isMe = m.senderId?._id?.toString() === user?.id?.toString();
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`px-6 py-4 max-w-[85%] md:max-w-[65%] shadow-2xl relative ${isMe ? "bg-indigo-600 text-white rounded-[2rem] rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-[2rem] rounded-tl-none border border-white/5"}`}>
                      <p className="text-[14px] md:text-[15px] font-bold leading-relaxed">{m.content}</p>
                      <div className="flex items-center justify-end gap-2 mt-2 opacity-30">
                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <div className="flex -space-x-1">{m.status === "READ" ? <><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></> : <svg className={`w-4 h-4 ${m.status === "DELIVERED" ? "text-white" : "text-white/40"}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeConv.participants.filter(p => typingUsers.has(p._id.toString())).map(p => (
                <div key={p._id} className="bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 w-fit flex gap-1.5 items-center animate-bounce-in"><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Decoding message...</span></div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>

            <div className="sticky bottom-0 p-6 md:p-8 shrink-0 flex gap-4 items-center bg-gradient-to-t from-[#0F172A] to-transparent">
              <div className="flex-1 relative group">
                 <input type="text" value={reply} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && handleSend(e)} placeholder="Send encrypted transmission..." className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[2.5rem] text-[15px] font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 focus:border-indigo-500/50 transition-all shadow-2xl" />
                 <button className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg></button>
              </div>
              <button onClick={handleSend} disabled={sending || !reply.trim()} className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] active:scale-90 disabled:opacity-30 disabled:grayscale transition-all"><svg className="w-7 h-7 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0F172A]">
            <div className="w-32 h-32 bg-indigo-600/10 rounded-[3rem] flex items-center justify-center shadow-2xl mb-10 group animate-pulse">
               <svg className="w-12 h-12 text-indigo-500 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Select Transmission.</h2>
            <p className="text-white/20 text-sm font-bold max-w-sm uppercase tracking-[0.3em] leading-loose">Establish a secure end-to-end encrypted connection from the identity sidebar.</p>
          </div>
        )}
      </main>

      {/* 📞 Call Interfaces (WhatsApp-like Confirmation) */}
      {pendingCall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] max-w-sm w-full text-center space-y-10 animate-bounce-in">
             <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl border border-indigo-500/20 animate-pulse">
                {pendingCall.type === 'video' ? '🎥' : '📞'}
             </div>
             <div>
                <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">Initiate {pendingCall.type}?</h3>
                <p className="text-xs text-white/30 font-black uppercase tracking-[0.3em] mt-4">Connecting with {activeConv.participants.find(p => p._id.toString() !== user.id.toString())?.name}</p>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setPendingCall(null)} className="flex-1 py-5 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-white/10 transition-all">Abort</button>
                <button onClick={() => initiateCallRequest(pendingCall.type)} className="flex-1 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">Confirm Call</button>
             </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-xl p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-2xl max-w-sm w-full text-center space-y-10 animate-bounce-in">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto border border-emerald-500/20 animate-bounce">
              {incomingCall.callType === "video" ? "🎥" : "📞"}
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-4">Incoming Transmission</p>
              <h3 className="text-3xl font-black text-white tracking-tighter italic">{incomingCall.fromName}</h3>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { socketRef.current.emit("call_rejected", { to: incomingCall.from }); setIncomingCall(null); }} className="flex-1 py-5 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] hover:bg-rose-500/20 transition-all">Reject</button>
              <button onClick={() => { 
                socketRef.current.emit("call_accepted", { to: incomingCall.from, fromName: user.name });
                setActiveCall({ ...incomingCall, isIncoming: true, accepted: true });
                setIncomingCall(null); 
              }} className="flex-1 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all">Authorize</button>
            </div>
          </div>
        </div>
      )}
      
      {activeCall && <CallModal call={activeCall} socket={socketRef.current} onClose={() => setActiveCall(null)} />}
    </div>
  );
}
