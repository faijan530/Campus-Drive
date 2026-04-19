import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyConversations, getMessages, postMessage, askAiAssistant } from "../../services/collaborationService.js";

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
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Socket state
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});

  const bottomRef = useRef(null);

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
          return prev;
       });
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
         if (msg.senderId._id !== user.id && msg.status !== "READ") {
            socketRef.current.emit("mark-read", { messageId: msg._id, readerId: user.id });
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

  // Add AI handling
  const [askingAi, setAskingAi] = useState(false);
  const handleAskAI = async () => {
    if (!activeConv) return;
    setAskingAi(true);
    try {
      // Create a message payload
      const payload = { content: "Hey AI, need help!" };
      const res = await askAiAssistant({ message: messages[messages.length - 1]?.content || "Hello" }, token);
      
      // Inject AI logic into local state visually, or create actual message
      // Note: we can visually render AI reply directly
      const aiMsg = { _id: Date.now(), senderId: { _id: "AI", name: "AI Assistant", role: "AI" }, content: res.reply, createdAt: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch(err) {
      console.error(err);
    } finally {
      setAskingAi(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeConv) return;
    setSending(true);
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
            content: reply
         });
         // Optimistic append, but the server will bounce back message-status-update
         // We can just rely on the server bound event or fetchMessages
      } else {
         await postMessage(activeConv._id, { content: reply }, token);
         fetchMessages(activeConv._id);
      }
      
      setReply("");
      fetchConversations(); // refresh last messages
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading messages...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      {/* Conversations List */}
      <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">My Conversations</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {conversations.map((conv) => {
            const otherParticipants = conv.participants.filter(p => p._id !== user.id);
            const title = otherParticipants.map(p => p.name).join(", ") || "Just You";
            const isActive = activeConv?._id === conv._id;
            const primaryOther = otherParticipants[0];
            const isOnline = primaryOther && onlineUsers.includes(primaryOther._id);
            const lastMessagePreview = conv.lastMessage || "No messages yet.";
            
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${isActive ? "bg-slate-50 border-l-4 border-indigo-600" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {title}
                    {primaryOther && (
                      <span className={isOnline ? "w-2 h-2 bg-emerald-500 rounded-full inline-block" : "w-2 h-2 bg-gray-300 rounded-full inline-block"}></span>
                    )}
                  </div>
                  {/* Fake unread badge, logic in Sidebar is standard, here just an example if needed, but not populated per conv here yet */}
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">{lastMessagePreview}</div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-6 text-sm text-center text-slate-500">
              No active conversations.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {activeConv.participants.filter(p => p._id !== user.id).map(p => p.name).join(", ") || "Just You"}
                </h3>
                {activeConv.participants.filter(p => p._id !== user.id).map((p) => {
                   const isOnline = onlineUsers.includes(p._id);
                   const lastTime = lastSeenMap[p._id] || p.lastSeen;
                   return (
                     <div key={p._id} className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                       <span className={isOnline ? "w-1.5 h-1.5 bg-emerald-500 rounded-full" : "w-1.5 h-1.5 bg-slate-400 rounded-full"}></span>
                       <span>{isOnline ? <span className="text-emerald-600 font-medium">Online</span> : lastTime ? `Last seen: ${formatTimeAgo(lastTime)}` : "Offline"}</span>
                     </div>
                   );
                })}
              </div>
              <button onClick={handleAskAI} className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors">
                {askingAi ? "Asking..." : "🤖 Ask AI"}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isMe = msg.senderId._id === user?.id;
                const isTeacher = msg.senderId.role === "Teacher";
                const isAI = msg.senderId.role === "AI";

                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex flex-col mb-1">
                       {!isMe && <span className="text-xs font-bold text-slate-700">{msg.senderId.name}</span>}
                       <span className={`text-[10px] ${isMe ? "text-right" : ""} text-slate-400`}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {isTeacher ? (
                      <div className="bg-amber-100 text-amber-900 border border-amber-200 p-3 rounded-2xl max-w-[80%] text-sm rounded-bl-none shadow-sm flex flex-col">
                        <strong className="block mb-1">👨‍🏫 Teacher</strong> 
                        <span>{msg.content}</span>
                        {isMe && (
                          <div className="text-[10px] text-right mt-1 opacity-70">
                            {msg.status === "SENT" ? "✔" : msg.status === "DELIVERED" ? "✔✔" : msg.status === "READ" ? <span className="text-blue-600">✔✔</span> : ""}
                          </div>
                        )}
                      </div>
                    ) : isAI ? (
                       <div className="bg-indigo-100 text-indigo-900 border border-indigo-200 p-3 rounded-2xl max-w-[80%] text-sm rounded-bl-none shadow-sm flex flex-col">
                        <span>{msg.content}</span>
                      </div>
                    ) : (
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm flex flex-col ${
                        isMe ? "bg-indigo-600 text-white rounded-br-none" 
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                      }`}>
                        <span>{msg.content}</span>
                        {isMe && (
                          <div className="text-[10px] text-right mt-1 opacity-70">
                            {msg.status === "SENT" ? "✔" : msg.status === "DELIVERED" ? "✔✔" : <span className="text-blue-300 font-bold">✔✔</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {activeConv.participants.filter(p => typingUsers.has(p._id)).map((p) => (
                 <div key={p._id} className="text-xs font-medium text-slate-500 animate-pulse">
                   {p.name} is typing...
                 </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
              <input
                type="text"
                value={reply}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 text-sm rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                disabled={sending || !reply.trim()}
                className="bg-slate-900 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <svg className="w-10 h-10 animate-spin text-slate-300 mb-2" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M12 2A10 10 0 1 0 2 12M12 2v10I2 12" /></svg>
            <p className="text-sm">Loading chats...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p className="text-sm font-semibold">No conversations available</p>
          </div>
        )}
      </div>
    </div>
  );
}
