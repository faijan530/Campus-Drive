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
    } catch (err) { console.error(err); } finally { setSending(false); }
  };

  // WebRTC confirmation state
  const [pendingCall, setPendingCall] = useState(null);

  const initiateCall = async (type) => {
    if (!activeConv || !socketRef.current) return;
    const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
    
    // Close confirmation
    setPendingCall(null);
    
    // Initializing Peer Connection
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    
    socketRef.current.emit("call-user", { to: other._id.toString(), offer, callType: type, fromInfo: { id: user.id, name: user.name } });
    setActiveCall({ from: other._id, fromName: other.name, callType: type, isIncoming: false, offer });
    
    // Cleanup temporary stream as CallModal handles its own
    stream.getTracks().forEach((t) => t.stop());
    peer.close();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;

  const filtered = conversations.filter((c) => {
    const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden text-sm">
      
      {/* ── WhatsApp Vertical Rail (Desktop Only) ── */}
      <nav className="hidden md:flex w-[64px] flex-col items-center py-4 bg-[#F0F2F5] border-r border-slate-200 gap-6 shrink-0">
         <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg></button>
         <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
         <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></button>
         <div className="mt-auto flex flex-col gap-4 items-center">
            <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-indigo-500 transition-all" alt="" />
         </div>
      </nav>

      {/* ── Chat List (Conversation Sidebar) ── */}
      <aside className={`h-full md:w-[350px] border-r border-slate-100 flex-col bg-white shrink-0 ${activeConv ? "hidden md:flex" : "flex w-full"}`}>
        <div className="p-4 border-b border-slate-50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Chats</h1>
            <div className="flex gap-4 text-slate-500">
               <button><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
               <button><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg></button>
            </div>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100/50 rounded-lg text-xs font-medium focus:outline-none focus:bg-white border-b-2 border-transparent focus:border-indigo-500 transition-all" />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map((c) => {
            const p = c.participants.find((pa) => pa._id.toString() !== user.id.toString()) || c.participants[0];
            const isActive = activeConv?._id === c._id;
            const isOnline = p && onlineUsers.some((id) => id.toString() === p._id.toString());
            return (
              <div key={c._id} onClick={() => handleOpenChat(c)} className={`flex items-center gap-4 p-3 px-4 cursor-pointer border-b border-slate-50 transition-all ${isActive ? "bg-[#F0F2F5]" : "hover:bg-[#F5F6F6]"}`}>
                <div className="relative shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                    <img src={p?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`} className="w-full h-full object-cover" alt="" />
                  </div>
                  {isOnline && <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col py-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-slate-800 text-[15px] truncate leading-tight tracking-tight">{p?.name}</p>
                    <p className={`text-[10px] font-bold ${c.unreadCount?.[user.id] > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : ""}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-[13px] truncate ${c.unreadCount?.[user.id] > 0 ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                      {c.lastMessage || "Click to start chatting"}
                    </p>
                    {c.unreadCount?.[user.id] > 0 && <div className="bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full ml-2 px-1">{c.unreadCount[user.id]}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Chat Window ── */}
      <main key={activeConv?._id || "empty"} className={`flex-1 h-full flex-col bg-[#F0F2F5] relative ${activeConv ? "flex" : "hidden md:flex"}`}>
        {activeConv ? (
          <>
            <header className="sticky top-0 z-10 bg-[#F0F2F5] flex items-center p-3 px-4 gap-3 shrink-0">
              <button onClick={() => setActiveConv(null)} className="md:hidden p-1 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
              <img src={activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate text-[15px] leading-tight">
                  {activeConv.participants.find((p) => p._id.toString() !== user.id.toString())?.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-none">
                  {(() => {
                    const other = activeConv.participants.find((p) => p._id.toString() !== user.id.toString());
                    const isOnline = other && onlineUsers.some((id) => id.toString() === other._id.toString());
                    if (isOnline) return <span className="text-emerald-600 font-bold">online</span>;
                    const lSeen = lastSeenMap[other?._id?.toString()] || other?.lastSeen;
                    return lSeen ? `last seen ${formatTimeAgo(lSeen)}` : "offline";
                  })()}
                </p>
              </div>
              <div className="flex gap-4 text-slate-500">
                <button onClick={() => setPendingCall({ type: 'video' })} className="p-2 hover:bg-slate-200 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                <button onClick={() => setPendingCall({ type: 'audio' })} className="p-2 hover:bg-slate-200 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>
                <button className="p-2 hover:bg-slate-200 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[#E5DDD5] bg-opacity-40 custom-scrollbar" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}>
              {messages.map((m, i) => {
                const isMe = m.senderId?._id?.toString() === user?.id?.toString();
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`px-2.5 py-1.5 max-w-[85%] md:max-w-[65%] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] rounded-lg relative ${isMe ? "bg-[#D9FDD3]" : "bg-white"}`}>
                      <p className="text-[14.2px] text-[#111b21] leading-[19px] whitespace-pre-wrap">{m.content}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5 ml-8 h-4 relative">
                        <span className="text-[11px] text-[#667781] uppercase">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        {isMe && <div className="flex -space-x-1">{m.status === "READ" ? <><svg className="w-4 h-4 text-[#53bdeb]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg><svg className="w-4 h-4 text-[#53bdeb]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></> : <svg className={`w-4 h-4 ${m.status === "DELIVERED" ? "text-[#8696a0]" : "text-[#8696a0]/50"}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeConv.participants.filter(p => typingUsers.has(p._id.toString())).map(p => (
                <div key={p._id} className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 w-fit flex gap-1 items-center shadow-sm"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-100"></span><span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-200"></span><span className="text-[10px] font-bold text-emerald-600 ml-1">typing...</span></div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>
            <div className="sticky bottom-0 bg-[#F0F2F5] p-2 md:p-3 px-4 flex gap-4 items-center shrink-0">
              <div className="flex gap-4 text-slate-500">
                 <button className="hover:text-slate-700 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
                 <button className="hover:text-slate-700 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg></button>
              </div>
              <input type="text" value={reply} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && handleSend(e)} placeholder="Type a message" className="flex-1 px-4 py-2.5 bg-white rounded-lg text-[15px] outline-none shadow-sm" />
              <button onClick={handleSend} disabled={sending || !reply.trim()} className="text-slate-500 hover:text-emerald-600 transition-all disabled:opacity-30">
                {reply.trim() ? <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F0F2F5] border-b-4 border-emerald-500">
            <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa699P6f9ST.png" className="w-64 mb-10 opacity-80" alt="" />
            <h2 className="text-3xl font-light text-[#41525d] mb-4">WhatsApp Web</h2>
            <p className="text-[14px] text-[#667781] max-w-lg leading-relaxed">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
            <div className="mt-auto flex items-center gap-2 text-[14px] text-[#8696a0]"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg> End-to-end encrypted</div>
          </div>
        )}
      </main>

      {/* 📞 Call Interfaces */}
      {pendingCall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-sm w-full text-center space-y-8 animate-bounce-in">
             <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto">
                {pendingCall.type === 'video' ? '🎥' : '📞'}
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800">Start {pendingCall.type} call?</h3>
                <p className="text-sm text-slate-400 font-medium mt-2">Connecting with {activeConv.participants.find(p => p._id.toString() !== user.id.toString())?.name}</p>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setPendingCall(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl">Cancel</button>
                <button onClick={() => initiateCall(pendingCall.type)} className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100">Start Call</button>
             </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mx-auto">{incomingCall.callType === "video" ? "🎥" : "📞"}</div>
            <h3 className="font-bold text-slate-800">{incomingCall.fromName}</h3>
            <div className="flex gap-2"><button onClick={() => { socketRef.current.emit("reject-call", { to: incomingCall.from }); setIncomingCall(null); }} className="flex-1 py-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-full">Reject</button><button onClick={() => { setActiveCall({ ...incomingCall, isIncoming: true }); setIncomingCall(null); }} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-full">Answer</button></div>
          </div>
        </div>
      )}
      {activeCall && <CallModal call={activeCall} socket={socketRef.current} onClose={() => setActiveCall(null)} />}
    </div>
  );
}
