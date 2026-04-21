import { useEffect, useRef, useState } from "react";

export default function CallModal({ call, socket, onClose }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [pc, setPc] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [callStatus, setCallStatus] = useState(call.isIncoming ? "Connecting..." : "Ringing...");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    setPc(peer);

    peer.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
      setCallStatus("Active Connection");
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          to: call.from,
          candidate: event.candidate
        });
      }
    };

    const startWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: call.callType === "video",
          audio: true
        });

        if (localVideo.current) localVideo.current.srcObject = stream;
        setLocalStream(stream);
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        // If we are the caller and wait for acceptance notification from server
        // (but in this flow, the server emits "call_accepted" when receiver accepts)
        if (!call.isIncoming && call.accepted) {
           console.log("[WebRTC] Creating Offer as Caller...");
           const offer = await peer.createOffer();
           await peer.setLocalDescription(offer);
           socket.emit("call_accepted", { to: call.from, signal: offer });
        }
      } catch (err) {
        console.error("[WebRTC] Media Error:", err);
        setCallStatus("Media Error");
      }
    };

    startWebRTC();

    // 📞 Listen for Signaling
    const handleSignal = async (data) => {
       console.log("[WebRTC] Received Signal:", data);
       try {
         if (data.signal) {
           if (data.signal.type === "offer") {
             console.log("[WebRTC] Received Offer, Creating Answer...");
             await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
             const answer = await peer.createAnswer();
             await peer.setLocalDescription(answer);
             socket.emit("call_accepted", { to: call.from, signal: answer });
           } else if (data.signal.type === "answer") {
             console.log("[WebRTC] Received Answer, Setting Remote Description...");
             await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
             setCallStatus("Connected");
           }
         } else if (data.answer) {
             console.log("[WebRTC] Received Explicit Answer...");
             await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
             setCallStatus("Connected");
         }
       } catch (err) { console.error("[WebRTC] Signal Error:", err); }
    };

    const handleCandidate = async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) { console.error(err); }
    };

    const handleCallEnded = () => {
       cleanup();
       onClose();
    };

    socket.on("call_accepted", handleSignal);
    socket.on("ice_candidate", handleCandidate);
    socket.on("end_call", handleCallEnded);
    socket.on("call_rejected", handleCallEnded);

    return () => {
      socket.off("call_accepted", handleSignal);
      socket.off("ice_candidate", handleCandidate);
      socket.off("end_call", handleCallEnded);
      socket.off("call_rejected", handleCallEnded);
      cleanup();
    };
  }, [call, socket]);

  const cleanup = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (pc) {
       pc.onicecandidate = null;
       pc.ontrack = null;
       pc.close();
    }
  };

  const endCall = () => {
    socket.emit("end_call", { to: call.from });
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Call Header */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-center z-20 space-y-2">
         <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex items-center justify-center text-2xl shadow-2xl">
            {call.callType === "video" ? "🎥" : "📞"}
         </div>
         <div className="space-y-1">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{call.fromName}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">{callStatus}</p>
         </div>
      </div>

      <div className="relative w-full h-full max-w-7xl max-h-[85vh] rounded-[4rem] overflow-hidden bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5">
        {/* Remote Video (Full Screen) */}
        <video 
          ref={remoteVideo} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Small Corner) */}
        {call.callType === "video" && (
          <div className={`absolute bottom-10 right-10 w-48 h-64 bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl z-30 transition-opacity duration-300 ${isCameraOff ? "opacity-30" : "opacity-100"}`}>
            <video 
              ref={localVideo} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover mirror"
            />
            {isCameraOff && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM1 1l22 22"/></svg>
               </div>
            )}
          </div>
        )}

        {/* Floating Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
           <button 
             onClick={toggleMute}
             className={`w-16 h-16 rounded-full backdrop-blur-2xl border transition-all active:scale-90 flex items-center justify-center ${isMuted ? "bg-rose-500 border-rose-400 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
           >
              {isMuted ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17l1.42 1.42C16.14 11.96 16 11.49 16 11V5c0-1.66-1.34-3-3-3S10 3.34 10 5v.18l4.98 4.99zM3.41 2.86L2 4.27l6.59 6.59c-.31.06-.59.14-.59.14l1.41 1.41c.21 0 .42-.04.62-.12l1.48 1.48C10.74 13.9 9.4 14 9 14c-2.76 0-5-2.24-5-5H2c0 3.53 2.61 6.43 6 6.92V20h2v-3.08c.58-.08 1.14-.24 1.66-.45l.93.93c-.82.38-1.7.6-2.59.6-1.1 0-2-.9-2-2h-2c0 1.66 1.34 3 3 3s3-1.34 3-3v-.17l4.13 4.13 1.41-1.41L3.41 2.86z"/></svg>
              ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              )}
           </button>
           
           <button 
             onClick={endCall}
             className="w-24 h-24 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-[0_20px_50px_-10px_rgba(225,29,72,0.5)] hover:bg-rose-700 transition-all active:scale-95 group"
           >
              <svg className="w-10 h-10 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.12-.57.12-.22 0-.4-.03-.57-.12l-7.9-4.44c-.32-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.12.57-.12.23 0 .41.03.57.12l7.9 4.44c.32.17.53.5.53.88v9z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.41 11.59c.39.39.39 1.02 0 1.41s-1.02.39-1.41 0L12 13.41l-2.99 3.01c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41L10.59 12l-3-3c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0L12 10.59l2.99-3.01c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L13.41 12l3 2.59z"/></svg>
           </button>

           <button 
             onClick={toggleCamera}
             className={`w-16 h-16 rounded-full backdrop-blur-2xl border transition-all active:scale-90 flex items-center justify-center ${isCameraOff ? "bg-rose-500 border-rose-400 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
           >
              {isCameraOff ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM1 1l22 22"/></svg>
              ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              )}
           </button>
        </div>
      </div>

      <style>{`
        .mirror { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
