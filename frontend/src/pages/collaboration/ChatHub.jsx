import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyConversations, getMessages, postMessage, askAiAssistant, openConversation } from "../../services/collaborationService.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function formatTimeAgo(dateInput) {
  if (!dateInput) return "Unknown";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
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

  // Socket state
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});

  const bottomRef = useRef(null);

  // Force re-render every minute so "just now" updates visually
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchConversations();

    // Socket Initialization
    const socket = io(BASE_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user-online", user.id);
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("last-seen-update", (dataMap) => {
       setLastSeenMap(dataMap);
    });

    socket.on("receive-message", (msg) => {
       setMessages(prev => {
          // Add if not exists
          if (!prev.find(m => m._id === msg._id)) {
             return [...prev, msg];
          }
          return prev;
       });
       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socket.on("message-status-update", (msg) => {
       setMessages(prev => {
          const idx = prev.findIndex(m => m._id === msg._id || (m.tempId && m.tempId === msg.tempId));
          if (idx !== -1) {
             const updated = [...prev];
             updated[idx] = msg;
             return updated;
          }
          return [...prev, msg];
       });
       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socket.on("message-read", (readMsg) => {
       setMessages(prev => prev.map(m => m._id === readMsg._id ? { ...m, status: "READ" } : m));
    });

    socket.on("user-offline", ({ userId, lastSeen }) => {
       setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
       setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    socket.on("typing", (senderId) => {
      setTypingUsers(prev => new Set(prev).add(senderId));
    });

    socket.on("stop-typing", (senderId) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(senderId);
        return newSet;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user.id]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
    }
  }, [activeConv, token]);

  useEffect(() => {
    if (activeConv && socketRef.current && messages.length > 0) {
      messages.forEach(msg => {
         // Skip AI messages, check if strictly opposite sender
         if (msg.senderId._id !== user.id && msg.senderId.role !== "AI" && msg.status !== "READ") {
            // Also skip numeric temporary IDs
            if (typeof msg._id === "string" && msg._id.length > 15) {
               socketRef.current.emit("mark-read", { messageId: msg._id, readerId: user.id });
            }
         }
      });
    }
  }, [messages, activeConv, user.id]);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations(token);
      setConversations(res.conversations);
      
      // Auto-select first chat if none is active
      if (res.conversations.length > 0) {
        setActiveConv(prev => {
          if (!prev) return res.conversations[0];
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async (conv) => {
    setActiveConv(conv);
    if (conv.unreadCount && conv.unreadCount[user.id] > 0) {
      try {
        await openConversation(conv._id, token);
        setConversations(prev => prev.map(c => 
          c._id === conv._id ? { ...c, unreadCount: { ...c.unreadCount, [user.id]: 0 } } : c
        ));
      } catch (err) {
        console.error("Error resetting unread count", err);
      }
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await getMessages(convId, token);
      setMessages(res.messages);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (e) => {
    setReply(e.target.value);
    if (!activeConv || !socketRef.current) return;
    const otherParticipants = activeConv.participants.filter(p => p._id !== user.id);
    otherParticipants.forEach(p => {
       socketRef.current.emit("typing", { senderId: user.id, receiverId: p._id });
    });

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
       otherParticipants.forEach(p => {
         socketRef.current.emit("stop-typing", { senderId: user.id, receiverId: p._id });
       });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeConv) return;
    setSending(true);
    
    const currentReply = reply;
    setReply("");
    
    // Optimistic UI Append
    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      tempId,
      senderId: { _id: user.id, name: user.name, role: user.role },
      content: currentReply,
      createdAt: new Date(),
      status: "SENDING"
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const otherParticipants = activeConv.participants.filter(p => p._id !== user.id);
      otherParticipants.forEach(p => {
         socketRef.current?.emit("stop-typing", { senderId: user.id, receiverId: p._id });
      });

      if (socketRef.current) {
         socketRef.current.emit("send-message", {
            conversationId: activeConv._id,
            senderId: user.id,
            receiverId: otherParticipants[0]?._id,
            content: currentReply,
            tempId
         });
         // Optimistic append, but the server will bounce back message-status-update
         // We can just rely on the server bound event or fetchMessages
      } else {
         await postMessage(activeConv._id, { content: currentReply }, token);
         fetchMessages(activeConv._id);
      }
      
      fetchConversations(); // refresh last messages
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const other = c.participants.find(p => p._id !== user.id) || c.participants[0];
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading messages...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-scale-in">
      {/* Premium Sidebar */}
      <div className="md:col-span-1 border-r border-slate-100 flex flex-col bg-[#F7F9FC]">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Chats</h1>
            <div className="flex gap-2">
               <button className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all text-slate-400 hover:text-indigo-600 active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-[1.25rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all shadow-sm group-focus-within:shadow-xl group-focus-within:-translate-y-0.5"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-2 mt-4">
          {filteredConversations.map((c) => {
            const otherUser = c.participants.find(p => p._id !== user.id) || c.participants[0];
            const isActive = activeConv?._id === c._id;
            const isOnline = otherUser && onlineUsers.includes(otherUser._id);
            
            return (
              <div
                key={c._id}
                onClick={() => handleOpenChat(c)}
                className={`group flex items-center gap-4 p-4 cursor-pointer rounded-[1.5rem] transition-all duration-500 relative ${
                  isActive 
                  ? "bg-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/20 translate-x-1" 
                  : "hover:bg-indigo-50/40 hover:translate-x-1 active:scale-[0.98]"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden transition-all duration-500 group-hover:rotate-3 ${isActive ? "ring-2 ring-indigo-500 ring-offset-4 shadow-lg" : "border-2 border-white shadow-md"}`}>
                    <img
                      src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`}
                      className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                      alt={otherUser?.name}
                    />
                  </div>
                  {isOnline && <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-4 border-white rounded-full online-glow shadow-md"></span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className={`font-bold text-[15px] truncate transition-colors ${isActive ? "text-indigo-600" : "text-slate-700"}`}>
                      {otherUser?.name || "Just You"}
                    </p>
                    <p className="text-[10px] font-black text-slate-300 tracking-tighter uppercase">
                      {c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : ""}
                    </p>
                  </div>
                  <p className={`text-xs truncate font-medium ${isActive ? "text-slate-500" : "text-slate-400"} opacity-90`}>
                    {c.lastMessage || "Click to start chatting"}
                  </p>
                </div>

                {c.unreadCount?.[user.id] > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-100 animate-bounce">
                    {c.unreadCount[user.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ultra-Premium Chat Area */}
      <div className="md:col-span-3 flex flex-col bg-[#F9FBFF] relative overflow-hidden">
        {/* Animated Background blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-[100px] pointer-events-none delay-1000 animate-pulse"></div>
        
        {activeConv ? (
          <>
            {/* Header - Glassmorphism v2 */}
            <div className="px-8 py-5 border-b border-white bg-white/60 backdrop-blur-3xl sticky top-0 z-40 flex justify-between items-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-5">
                <div className="relative group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-6">
                    <img
                      src={activeConv.participants.find(p => p._id !== user.id)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participants.find(p => p._id !== user.id)?.name || "U")}&background=F5F3FF&color=7C3AED&bold=true`}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                  </div>
                  {onlineUsers.includes(activeConv.participants.find(p => p._id !== user.id)?._id) && 
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full online-glow shadow-md"></span>
                  }
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                    {activeConv.participants.find(p => p._id !== user.id)?.name || "Just You"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${onlineUsers.includes(activeConv.participants.find(p => p._id !== user.id)?._id) ? "text-emerald-500 animate-pulse" : "text-slate-300"}`}>
                      {onlineUsers.includes(activeConv.participants.find(p => p._id !== user.id)?._id) ? "Live Now" : "Currently Offline"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {[
                  { id: 'video', icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
                  { id: 'call', icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                  { id: 'more', icon: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" }
                ].map((btn) => (
                  <button key={btn.id} className="w-12 h-12 flex items-center justify-center bg-white/40 hover:bg-white shadow-sm hover:shadow-md text-slate-400 hover:text-indigo-600 rounded-2xl transition-all active:scale-90 border border-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={btn.icon}/></svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar z-20 relative">
              {messages.map((msg, index) => {
                const isMe = msg.senderId._id === user?.id;
                const isFirst = index === 0 || messages[index - 1].senderId._id !== msg.senderId._id;

                return (
                  <div key={msg._id || index} className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isFirst ? "mt-8" : "mt-1.5"} animate-slide-up group`} style={{ animationDelay: `${index * 20}ms` }}>
                    <div className={`px-6 py-4 max-w-[75%] shadow-sm relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                       isMe ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[2rem] rounded-tr-none shadow-indigo-200/40" 
                       : "bg-white text-slate-700 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-slate-200/10"
                    }`}>
                      <p className="leading-relaxed font-semibold text-[15px] whitespace-pre-wrap">{msg.content}</p>
                      
                      <div className={`flex items-center justify-end gap-2 mt-3 pt-2 border-t ${isMe ? "border-white/10" : "border-slate-50"}`}>
                        <span className={`text-[10px] font-black tracking-widest ${isMe ? "text-white/60" : "text-slate-300"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        {isMe && (
                           <div className="flex items-center">
                              {msg.status === "SENDING" ? (
                                <svg className="w-3.5 h-3.5 text-white/50 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : msg.status === "READ" ? (
                                <svg className="w-4.5 h-4.5 text-emerald-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                              ) : (
                                <svg className={`w-4.5 h-4.5 ${msg.status === "DELIVERED" ? "text-white/80" : "text-white/30"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                              )}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {activeConv.participants.filter(p => typingUsers.has(p._id)).map((p) => (
                 <div key={p._id} className="ml-5 flex items-center gap-4 py-4 animate-fade-in">
                    <div className="flex gap-2 bg-white/80 backdrop-blur shadow-sm border border-white rounded-full p-2.5 px-5">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{p.name}</span>
                 </div>
              ))}
              <div ref={bottomRef} className="h-16" />
            </div>

            {/* Hyper-Modern Input Bar */}
            <div className="px-8 py-6 bg-white/60 backdrop-blur-3xl border-t border-white/40 sticky bottom-0 z-40">
              <form onSubmit={handleSend} className="flex items-center gap-5 max-w-5xl mx-auto">
                <div className="flex gap-2">
                  {[
                    { id: 'emoji', icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { id: 'plus', icon: "M12 4v16m8-8H4" }
                  ].map((btn) => (
                    <button key={btn.id} type="button" className="w-12 h-12 flex items-center justify-center bg-white shadow-inner hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={btn.icon}/></svg>
                    </button>
                  ))}
                </div>
                
                <div className="flex-1 bg-white border-2 border-slate-50 focus-within:border-indigo-500/20 rounded-[1.75rem] px-8 py-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05)] transition-all flex items-center">
                  <input
                    type="text"
                    value={reply}
                    onChange={handleTyping}
                    placeholder="Enter message..."
                    className="flex-1 outline-none text-[16px] font-bold text-slate-600 bg-transparent placeholder-slate-300"
                  />
                </div>

                <button
                  disabled={sending || !reply.trim()}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[1.75rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 disabled:grayscale disabled:opacity-40 transition-all shrink-0"
                >
                  <svg className="w-7 h-7 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-center relative px-8">
            <div className="w-56 h-56 bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] rounded-[3rem] flex items-center justify-center mb-12 ring-2 ring-indigo-50 animate-bounce transition-all duration-1000" style={{ animationDuration: '4s' }}>
               <svg className="w-24 h-24 text-indigo-500 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.19-.19.51-.19.71 0l1.77 1.77c.19.19.19.51 0 .71L7.87 14H6zm12 0h-7.5l2-2H18v2z"/></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">Collaboration Hub</h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-loose text-base font-semibold">Ready to move faster? Select a chat and start building the future together.</p>
          </div>
        )}
      </div>
    </div>
  );
}
