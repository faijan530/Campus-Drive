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

    socket.on("message-status-update", (msg) => {
      setMessages((prev) => prev.map((m) => (m.tempId === msg.tempId || m._id === msg._id ? { ...m, ...msg } : m)));
    });

    socket.on("message-read", (msg) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, status: "READ" } : m)));
    });

    // 📞 Call Events
    socket.on("incoming_call", (data) => {
       console.log("[Signal] Incoming Call Request:", data);
       setIncomingCall(data);
    });

    socket.on("call_accepted", (data) => {
       console.log("[Signal] Call Accepted notification received:", data);
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

  if (loading) return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-500">Loading messages...</div>;

  const filtered = conversations.filter((c) => {
    const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-white border-t border-slate-200 overflow-hidden text-sm">
      
      {/* ── Chat Sidebar (Conversations) ── */}
      <aside className={`h-full md:w-80 lg:w-96 border-r border-slate-200 flex-col bg-white shrink-0 ${activeConv ? "hidden md:flex" : "flex w-full"}`}>
        <div className="p-4 border-b border-slate-200 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">Messaging</h1>
            <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-md transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
          <div className="relative group">
            <input type="text" placeholder="Search messages" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
            const isActive = activeConv?._id === c._id;
            const isOnline = p && onlineUsers.some((id) => id.toString() === p._id.toString());
            const unread = c.unreadCount?.[user.id] > 0;
            return (
              <div key={c._id} onClick={() => handleOpenChat(c)} className={`flex items-center gap-3 p-4 cursor-pointer border-b border-slate-100 transition-colors ${isActive ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <img src={p?.avatar || `https://ui-avatars.com/api/?name=${p?.name}&background=random`} className="w-full h-full object-cover" alt="" />
                  </div>
                  {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-sm truncate ${unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>{p?.name}</p>
                    <p className="text-xs text-slate-500">{c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : ""}</p>
                  </div>
                  <p className={`text-sm truncate ${unread ? "font-semibold text-slate-800" : "text-slate-500"}`}>{p?._id.toString() === user.id.toString() ? "You: " : ""}{c.lastMessage || "Start a conversation"}</p>
                </div>
                {unread && <div className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{c.unreadCount[user.id]}</div>}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Chat Window (Main Thread) ── */}
      <main key={activeConv?._id || "empty"} className={`flex-1 h-full flex-col bg-white relative ${activeConv ? "flex" : "hidden md:flex"}`}>
        {activeConv ? (
          <>
            <header className="bg-white border-b border-slate-200 flex items-center p-4 gap-4 shrink-0 shadow-sm z-10">
              <button onClick={() => setActiveConv(null)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
              <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0">
                <img src={activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name || "U")}&background=random`} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-base">{activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                   {(() => {
                      const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
                      const isOnline = other && onlineUsers.some((id) => id.toString() === other._id.toString());
                      return (
                         <>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-slate-300"}`}></div>
                            <span className="text-xs text-slate-500">{isOnline ? "Active now" : `Last seen ${formatTimeAgo(lastSeenMap[other?._id?.toString()] || other?.lastSeen)}`}</span>
                         </>
                      );
                   })()}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPendingCall({ type: 'video' })} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                <button onClick={() => setPendingCall({ type: 'audio' })} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
              {messages.map((m, i) => {
                const isMe = m.senderId?._id?.toString() === user?.id?.toString();
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2.5 max-w-[85%] md:max-w-[70%] shadow-sm ${isMe ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200"}`}>
                      <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                        <span className="text-[10px]">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <div className="flex -space-x-1">
                            {m.status === "SENT" ? (
                              <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            ) : (
                              <>
                                <svg className={`w-3.5 h-3.5 ${m.status === "READ" ? "text-blue-200" : "text-white/70"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                                <svg className={`w-3.5 h-3.5 ${m.status === "READ" ? "text-blue-200" : "text-white/70"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeConv.participants.filter(p => typingUsers.has(p._id.toString())).map(p => (
                <div key={p._id} className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 w-fit flex gap-1 items-center shadow-sm text-slate-500">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              ))}
              <div ref={bottomRef} className="h-2" />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex gap-2 items-end bg-slate-100 border border-transparent rounded-2xl px-2 py-2 focus-within:bg-white focus-within:border-blue-500 transition-colors">
                 <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                 </button>
                 <textarea 
                    value={reply} 
                    onChange={handleTyping} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} 
                    placeholder="Write a message..." 
                    className="flex-1 max-h-32 min-h-[40px] bg-transparent text-sm text-slate-800 placeholder:text-slate-500 outline-none resize-none py-2"
                    rows={1}
                 />
                 <button onClick={handleSend} disabled={sending || !reply.trim()} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 disabled:text-white transition-colors shrink-0 mb-0.5 mr-0.5">
                    <svg className="w-4 h-4 ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6">
               <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Messages</h2>
            <p className="text-slate-500 text-sm max-w-sm">Select a conversation or start a new one to connect with your network.</p>
          </div>
        )}
      </main>

      {/* 📞 Call Interfaces */}
      {pendingCall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                {pendingCall.type === 'video' ? '🎥' : '📞'}
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-1">Start {pendingCall.type} call</h3>
             <p className="text-sm text-slate-500 mb-8">with {activeConv.participants.find(p => p._id.toString() !== user.id.toString())?.name}</p>
             <div className="flex gap-3">
                <button onClick={() => setPendingCall(null)} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => initiateCallRequest(pendingCall.type)} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors">Call</button>
             </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center border-t-4 border-blue-600">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse">
              {incomingCall.callType === "video" ? "🎥" : "📞"}
            </div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Incoming Call</p>
            <h3 className="text-xl font-bold text-slate-900 mb-8">{incomingCall.fromName}</h3>
            
            <div className="flex gap-3">
              <button onClick={() => { socketRef.current.emit("call_rejected", { to: incomingCall.from }); setIncomingCall(null); }} className="flex-1 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-md hover:bg-red-100 transition-colors">Decline</button>
              <button onClick={() => { 
                socketRef.current.emit("call_accepted", { to: incomingCall.from, fromName: user.name });
                setActiveCall({ ...incomingCall, isIncoming: true, accepted: true });
                setIncomingCall(null); 
              }} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors">Accept</button>
            </div>
          </div>
        </div>
      )}
      
      {activeCall && <CallModal call={activeCall} socket={socketRef.current} onClose={() => setActiveCall(null)} />}
    </div>
  );
}
