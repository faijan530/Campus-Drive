import { useEffect, useRef, useState } from "react";

export default function CallModal({ call, socket, onClose }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [pc, setPc] = useState(null);
  const [stream, setStream] = useState(null);
  const [callStatus, setCallStatus] = useState("Initializing...");

  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    setPc(peer);

    peer.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
      setCallStatus("Connected");
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: call.from,
          candidate: event.candidate
        });
      }
    };

    const startMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: call.callType === "video",
          audio: true
        });

        if (localVideo.current) {
           localVideo.current.srcObject = userStream;
        }
        setStream(userStream);

        userStream.getTracks().forEach((track) => {
          peer.addTrack(track, userStream);
        });

        if (call.isIncoming) {
          await peer.setRemoteDescription(new RTCSessionDescription(call.offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", { to: call.from, answer });
        } else {
          // Caller side: we already sent offer in ChatHub, but let's re-verify logic
          // Actually, ChatHub creates the offer. So here we just wait for answer.
        }
      } catch (err) {
        console.error("Media error:", err);
        setCallStatus("Media Access Denied");
      }
    };

    startMedia();

    const handleAnswer = async ({ answer }) => {
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus("Connected");
      } catch (err) { console.error(err); }
    };

    const handleCandidate = async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) { console.error(err); }
    };

    const handleEnded = () => {
      cleanup();
      onClose();
    };

    socket.on("call-accepted", handleAnswer);
    socket.on("ice-candidate", handleCandidate);
    socket.on("call-ended", handleEnded);
    socket.on("call-rejected", handleEnded);

    return () => {
      socket.off("call-accepted", handleAnswer);
      socket.off("ice-candidate", handleCandidate);
      socket.off("call-ended", handleEnded);
      socket.off("call-rejected", handleEnded);
      cleanup();
    };
  }, [call, socket]);

  const cleanup = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (pc) pc.close();
  };

  const endCall = () => {
    socket.emit("end-call", { to: call.from });
    handleEnded();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 left-10 flex items-center gap-4 text-white z-20">
         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">📞</div>
         <div>
            <h2 className="text-xl font-black uppercase tracking-widest">{call.fromName || "Collaborator"}</h2>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{callStatus}</p>
         </div>
      </div>

      <div className="relative w-full h-full max-w-6xl max-h-[80vh] rounded-[3rem] overflow-hidden bg-black shadow-2xl border border-white/5">
        <video 
          ref={remoteVideo} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {call.callType === "video" && (
          <div className="absolute bottom-10 right-10 w-48 h-64 bg-slate-800 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl z-20">
            <video 
              ref={localVideo} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover mirror"
            />
          </div>
        )}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30">
           <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
           </button>
           <button 
             onClick={endCall}
             className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl shadow-rose-900/40 hover:bg-rose-700 transition-all active:scale-95 group"
           >
              <svg className="w-8 h-8 rotate-[135deg] group-hover:rotate-0 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.12-.57.12-.22 0-.4-.03-.57-.12l-7.9-4.44c-.32-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.12.57-.12.23 0 .41.03.57.12l7.9 4.44c.32.17.53.5.53.88v9z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.41 11.59c.39.39.39 1.02 0 1.41s-1.02.39-1.41 0L12 13.41l-2.99 3.01c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41L10.59 12l-3-3c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0L12 10.59l2.99-3.01c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L13.41 12l3 2.59z"/></svg>
           </button>
           <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
           </button>
        </div>
      </div>

      <style>{`
        .mirror { transform: scaleX(-1); }
      `}</style>
    </div>
  );
}
