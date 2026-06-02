import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import "./VideoCall.css";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = ({ socket, onClose }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: { stream, userId } }
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // REFS FOR WEBRTC STATE
  // ==========================================
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pcsRef = useRef({}); // { targetSocketId: RTCPeerConnection }
  const socketRef = useRef(socket);

  // Clean up a specific peer connection
  const closePeerConnection = useCallback((socketId) => {
    if (pcsRef.current[socketId]) {
      pcsRef.current[socketId].close();
      delete pcsRef.current[socketId];
    }
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[socketId];
      return updated;
    });
  }, []);

  // Clean up all WebRTC resources
  const cleanUp = useCallback(() => {
    console.log("📹 Cleaning up video call resources...");
    
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    Object.keys(pcsRef.current).forEach((socketId) => {
      closePeerConnection(socketId);
    });

    // Notify server
    if (socketRef.current) {
      socketRef.current.emit("leave-video-call");
      
      // Clean up socket listeners
      socketRef.current.off("user-joined-video");
      socketRef.current.off("video-offer");
      socketRef.current.off("video-answer");
      socketRef.current.off("ice-candidate");
      socketRef.current.off("user-left-video");
    }
  }, [closePeerConnection]);

  // Create RTCPeerConnection
  const createPeerConnection = useCallback((targetSocketId, targetUserId) => {
    if (pcsRef.current[targetSocketId]) {
      return pcsRef.current[targetSocketId];
    }

    console.log(`📹 Creating RTCPeerConnection for peer ${targetSocketId}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcsRef.current[targetSocketId] = pc;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`📹 Connection state with ${targetSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        closePeerConnection(targetSocketId);
      }
    };

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log(`📹 Track received from peer ${targetSocketId}`);
      const remoteStream = event.streams[0];
      setRemoteStreams((prev) => ({
        ...prev,
        [targetSocketId]: {
          stream: remoteStream,
          userId: targetUserId || "Collaborator",
        },
      }));
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  }, [closePeerConnection]);

  // ==========================================
  // INITIALIZATION: GET USER MEDIA & CONFIGURE SIGNALLING
  // ==========================================
  useEffect(() => {
    socketRef.current = socket;

    const initCall = async () => {
      try {
        console.log("📹 Requesting user media streams...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: true,
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Notify server that I have joined the video call
        socket.emit("join-video-call");

        // LISTENER: Participant Joined
        socket.on("user-joined-video", async ({ socketId, userId }) => {
          console.log(`📹 Peer ${userId} (${socketId}) joined call. Initiating WebRTC handshake.`);
          const pc = createPeerConnection(socketId, userId);
          
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            socket.emit("video-offer", {
              offer,
              targetSocketId: socketId,
            });
          } catch {
            console.error("❌ Failed to create offer");
          }
        });

        // LISTENER: WebRTC Offer Received
        socket.on("video-offer", async ({ offer, senderSocketId, senderUserId }) => {
          console.log(`📹 Offer received from peer ${senderUserId} (${senderSocketId})`);
          const pc = createPeerConnection(senderSocketId, senderUserId);
          
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            socket.emit("video-answer", {
              answer,
              targetSocketId: senderSocketId,
            });
          } catch {
            console.error("❌ Failed to process offer/create answer");
          }
        });

        // LISTENER: WebRTC Answer Received
        socket.on("video-answer", async ({ answer, senderSocketId }) => {
          console.log(`📹 Answer received from peer ${senderSocketId}`);
          const pc = pcsRef.current[senderSocketId];
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch {
              console.error("❌ Failed to set remote description");
            }
          }
        });

        // LISTENER: ICE Candidate Received
        socket.on("ice-candidate", async ({ candidate, senderSocketId }) => {
          const pc = pcsRef.current[senderSocketId];
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch {
              console.error("❌ Failed to add ICE candidate");
            }
          }
        });

        // LISTENER: Participant Left Call
        socket.on("user-left-video", ({ socketId }) => {
          console.log(`📹 Peer left call: ${socketId}`);
          closePeerConnection(socketId);
        });

      } catch (err) {
        console.error("❌ Media access denied / initialization failed:", err.message);
        setError("Camera and Microphone permissions are required for video calls.");
      }
    };

    initCall();

    return () => {
      cleanUp();
    };
  }, [socket, createPeerConnection, closePeerConnection, cleanUp]);

  // ==========================================
  // CONTROLS
  // ==========================================
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const activePeersCount = Object.keys(remoteStreams).length;

  return (
    <div className="videocall-overlay glass animate-fade-in">
      <div className="videocall-header">
        <div className="title">
          <Users size={16} />
          <span>Live Video Conference</span>
          {activePeersCount > 0 && (
            <span className="badge">{activePeersCount + 1} online</span>
          )}
        </div>
      </div>

      {error ? (
        <div className="videocall-error">
          <p>{error}</p>
          <button className="error-btn" onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="video-grid-container">
            {/* Local User stream */}
            <div className="video-card local-video-card">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`video-element ${isVideoOff ? "hidden" : ""}`}
              />
              {isVideoOff && <div className="video-placeholder">Camera Off</div>}
              <div className="video-label">You</div>
            </div>

            {/* Remote participants */}
            {Object.keys(remoteStreams).map((socketId) => {
              const { stream, userId } = remoteStreams[socketId];
              return (
                <div key={socketId} className="video-card">
                  <video
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                    autoPlay
                    playsInline
                    className="video-element"
                  />
                  <div className="video-label">{userId || "Collaborator"}</div>
                </div>
              );
            })}
          </div>

          {/* Action bar controls */}
          <div className="videocall-controls">
            <button
              onClick={toggleMute}
              className={`control-btn ${isMuted ? "active" : ""}`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`control-btn ${isVideoOff ? "active" : ""}`}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button
              onClick={() => {
                cleanUp();
                onClose();
              }}
              className="control-btn hangup-btn"
              title="Leave Call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCall;
