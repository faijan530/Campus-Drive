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
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const socket = io(BASE_URL);
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("user-online", user.id));
    socket.on("online-users", setOnlineUsers);
    socket.on("last-seen-update", setLastSeenMap);
    socket.on("receive-message", (msg) => {
      setMessages((prev) => (!prev.find((m) => m._id === msg._id) ? [...prev, msg] : prev));
      scrollToBottom();
    });
    socket.on("message-status-update", (msg) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m._id === msg._id || (m.tempId && m.tempId === msg.tempId));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = msg;
          return updated;
        }
        return [...prev, msg];
      });
      scrollToBottom();
    });
    socket.on("message-read", (readMsg) =>
      setMessages((prev) => prev.map((m) => (m._id === readMsg._id ? { ...m, status: "READ" } : m)))
    );
    socket.on("user-offline", ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });
    socket.on("typing", (id) => setTypingUsers((prev) => new Set(prev).add(id)));
    socket.on("stop-typing", (id) =>
      setTypingUsers((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      })
    );
    socket.on("incoming-call", setIncomingCall);
    socket.on("call-rejected", () => { setIncomingCall(null); setActiveCall(null); });
    socket.on("call-ended", () => { setIncomingCall(null); setActiveCall(null); });
    return () => socket.disconnect();
  }, [token, user.id]);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv._id);
  }, [activeConv, token]);

  useEffect(() => {
    if (activeConv && socketRef.current && messages.length > 0) {
      messages.forEach((msg) => {
        if (msg.senderId._id !== user.id && msg.senderId.role !== "AI" && msg.status !== "READ") {
          if (typeof msg._id === "string" && msg._id.length > 15) {
            socketRef.current.emit("mark-read", { messageId: msg._id.toString(), readerId: user.id.toString() });
          }
        }
      });
    }
  }, [messages, activeConv, user.id]);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations(token);
      setConversations(res.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await getMessages(id, token);
      setMessages(res.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenChat = async (conv) => {
    setActiveConv(conv);
    if (conv.unreadCount?.[user.id] > 0) {
      try {
        await openConversation(conv._id, token);
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: { ...c.unreadCount, [user.id]: 0 } } : c))
        );
      } catch (err) {
        console.error(err);
      }
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
    setMessages((prev) => [
      ...prev,
      { _id: tempId, tempId, senderId: { _id: user.id, name: user.name }, content, createdAt: new Date(), status: "SENDING" },
    ]);
    scrollToBottom();
    try {
      const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
      socketRef.current?.emit("send-message", {
        conversationId: activeConv._id,
        senderId: user.id.toString(),
        receiverId: other?._id?.toString(),
        content,
        tempId,
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const initiateCall = async (type) => {
    if (!activeConv || !socketRef.current) return;
    const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.emit("call-user", { to: other._id.toString(), offer, callType: type, fromInfo: { id: user.id, name: user.name } });
    setActiveCall({ from: other._id, fromName: other.name, callType: type, isIncoming: false, offer });
    stream.getTracks().forEach((t) => t.stop());
    peer.close();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;

  const filtered = conversations.filter((c) => {
    const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen w-full flex flex-col md:grid md:grid-cols-4 bg-white overflow-hidden text-sm">
      
      {/* ── Chat List (Sidebar) ─────────────────── */}
      <div className={`md:col-span-1 border-r border-slate-100 flex flex-col bg-white h-full ${activeConv ? "hidden md:block" : "block"}`}>
        <div className="p-4 border-b border-slate-50">
          <h1 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Chats</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-full text-xs font-bold focus:outline-none border border-transparent focus:border-indigo-100"
            />
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map((c) => {
            const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
            const isActive = activeConv?._id === c._id;
            const isOnline = p && onlineUsers.some((id) => id.toString() === p._id.toString());
            return (
              <div
                key={c._id}
                onClick={() => handleOpenChat(c)}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-50 transition-all ${isActive ? "bg-indigo-50/50" : "hover:bg-slate-50 active:bg-slate-100"}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={p?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`}
                    className="w-12 h-12 rounded-full border border-slate-100 shadow-sm"
                    alt=""
                  />
                  {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-bold text-slate-800 truncate">{p?.name}</p>
                    <p className="text-[10px] font-bold text-slate-300">{c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : ""}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-semibold">{c.lastMessage || "Click to message"}</p>
                </div>
                {c.unreadCount?.[user.id] > 0 && (
                  <div className="bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ml-1">
                    {c.unreadCount[user.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chat Window (Main Area) ─────────────── */}
      <div className={`md:col-span-3 flex flex-col bg-[#F9F9F9] relative h-full ${activeConv ? "block" : "hidden md:block"}`}>
        {activeConv ? (
          <>
            {/* Mobile Header (Sticky) */}
            <header className="sticky top-0 z-10 bg-white border-b flex items-center p-3 gap-3 shrink-0 shadow-sm">
              <button 
                onClick={() => setActiveConv(null)} 
                className="md:hidden p-1 text-slate-400 hover:text-indigo-600 transition-transform active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img
                src={activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`}
                className="w-10 h-10 rounded-full border"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 tracking-tight truncate">
                  {activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {(() => {
                    const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
                    const isOnline = other && onlineUsers.some((id) => id.toString() === other._id.toString());
                    if (isOnline) return <span className="text-emerald-500">Online</span>;
                    const lSeen = lastSeenMap[other?._id?.toString()] || other?.lastSeen;
                    return <span className="text-slate-400">Last seen {formatTimeAgo(lSeen) || "recently"}</span>;
                  })()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => initiateCall('video')} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                <button onClick={() => initiateCall('audio')} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>
              </div>
            </header>

            {/* Messages Thread (Properly Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 md:space-y-4 custom-scrollbar">
              {messages.map((m, i) => {
                const isMe = m.senderId?._id?.toString() === user?.id?.toString();
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2 md:px-5 md:py-3 max-w-[85%] md:max-w-[70%] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none" : "bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100"}`}>
                      <p className="text-[13px] md:text-base font-medium break-words leading-relaxed">{m.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                        <span className="text-[9px] font-black">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <div className="flex -space-x-1">{m.status === "READ" ? <><svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg><svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></> : <svg className={`w-3 h-3 ${m.status === "DELIVERED" ? "text-white" : "text-white/40"}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeConv.participants.filter(p => typingUsers.has(p._id.toString())).map(p => (
                <div key={p._id} className="flex items-center gap-1 ml-2 opacity-60 animate-pulse"><div className="flex gap-0.5"><span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-100"></span><span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-200"></span></div><span className="text-[9px] font-bold">typing...</span></div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Box (Sticky at bottom) */}
            <div className="sticky bottom-0 bg-white p-2 md:p-4 border-t flex gap-2 items-center">
              <button className="hidden md:flex p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg></button>
              <input
                type="text"
                value={reply}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
                placeholder="Message"
                className="flex-1 px-4 py-2 md:py-3.5 bg-slate-50 rounded-full border border-slate-100 text-[13px] md:text-base font-medium text-slate-700 outline-none transition-all shadow-inner focus:bg-white"
              />
              <button
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="w-10 h-10 md:w-14 md:h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-40 transition-all"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-6">
              <svg className="w-10 h-10 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-800">Choose a chat</h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">Start a conversation from the sidebar.</p>
          </div>
        )}
      </div>

      {/* Call Overlays */}
      {incomingCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-xs w-full text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mx-auto">
              {incomingCall.callType === "video" ? "🎥" : "📞"}
            </div>
            <h3 className="font-bold text-slate-800">{incomingCall.fromName}</h3>
            <div className="flex gap-2">
              <button onClick={() => { socketRef.current.emit("reject-call", { to: incomingCall.from }); setIncomingCall(null); }} className="flex-1 py-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-full">Reject</button>
              <button onClick={() => { setActiveCall({ ...incomingCall, isIncoming: true }); setIncomingCall(null); }} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">Answer</button>
            </div>
          </div>
        </div>
      )}
      {activeCall && <CallModal call={activeCall} socket={socketRef.current} onClose={() => setActiveCall(null)} />}
    </div>
  );
}
