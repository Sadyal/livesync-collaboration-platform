import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2, Save, ChevronLeft, Video, VideoOff } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { io } from "socket.io-client";

import { documentApi } from "../api";
import { ROUTES } from "../../../utils/constants";

import Button from "../../../components/common/Button";
import Loader from "../../../components/common/Loader";
import ShareModal from "../components/ShareModal";
import EditorToolbar from "../components/EditorToolbar";
import VideoCall from "../components/VideoCall";

import "./EditorUI.css";

// ==============================
// DEBOUNCE (STABLE)
// ==============================
const debounce = (fn, delay = 800) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==============================
  // STATE MANAGEMENT
  // ==============================
  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [socket, setSocket] = useState(null);

  const socketRef = useRef(null);
  const debouncedSaveRef = useRef(null);

  // ==============================
  // FETCH DOCUMENT TITLE & METRICS
  // ==============================
  const fetchDoc = useCallback(async () => {
    try {
      const res = await documentApi.getDocById(id);

      if (!res.success) throw new Error(res.message);

      setDoc(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to load document");
      navigate(ROUTES.DASHBOARD);
      return null;
    }
  }, [id, navigate]);

  // ==============================
  // SAVE CONTENT OVER SOCKETS (ALIGNED WITH SERVER)
  // ==============================
  const saveContent = useCallback((content) => {
    if (socketRef.current) {
      socketRef.current.emit("save-document", content);
    }
  }, []);

  // ==============================
  // SAVE TITLE ONLY (HTTP API)
  // ==============================
  const saveTitle = useCallback(async (title) => {
    try {
      setIsSaving(true);
      await documentApi.renameDoc(id, title);
    } catch (err) {
      console.error("Title save failed:", err.message);
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  // ==============================
  // INIT DEBOUNCE
  // ==============================
  useEffect(() => {
    debouncedSaveRef.current = debounce((content) => {
      saveContent(content);
    }, 1000);

    return () => {
      debouncedSaveRef.current = null;
    };
  }, [saveContent]);

  // ==============================
  // EDITOR INIT
  // ==============================
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();

      setDoc((prev) => {
        if (!prev) return prev;
        return { ...prev, content };
      });

      // 📡 Emit text change to other collaborators in real-time
      if (socketRef.current) {
        socketRef.current.emit("send-changes", content);
      }

      // 💾 Save to DB (debounced)
      debouncedSaveRef.current?.(content);
    },
  });

  // ==============================
  // SOCKETS SYNC (REAL-TIME EDITING)
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    console.log("🔌 Initializing socket connection to:", socketUrl);
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"], // secure transport
    });

    socketRef.current = newSocket;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    // Join document room
    newSocket.emit("get-document", id);

    // RECEIVE INITIAL CONTENT
    newSocket.on("load-document", (content) => {
      if (editor && content) {
        editor.commands.setContent(content);
      }
      setIsLoading(false);
    });

    // RECEIVE COLLABORATOR EDITS
    newSocket.on("receive-changes", (content) => {
      if (editor && content !== editor.getHTML()) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(content, false);
        try {
          editor.commands.setTextSelection({ from, to });
        } catch {
          // ignore selection errors if document changed size
        }
      }
    });

    // ACCESS DENIED
    newSocket.on("access-denied", () => {
      setError("You do not have access to this document.");
      setIsLoading(false);
    });

    // CLEANUP ON UNMOUNT
    return () => {
      console.log("🔌 Disconnecting socket connection");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [id, editor]);

  // ==============================
  // LOAD METADATA
  // ==============================
  useEffect(() => {
    const init = async () => {
      await fetchDoc();
    };
    init();
  }, [fetchDoc]);

  // ==============================
  // TITLE CHANGE
  // ==============================
  const handleTitleChange = (e) => {
    const value = e.target.value;

    setDoc((prev) => {
      if (!prev) return prev;
      return { ...prev, title: value };
    });
  };

  // ==============================
  // MANUAL SAVE (FOR TITLE)
  // ==============================
  const handleSave = async () => {
    if (!doc) return;
    await saveTitle(doc.title);
  };

  // ==============================
  // UI RENDERING STATES
  // ==============================
  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="editor-error">
        <p>{error}</p>
        <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="editor-container">

      {/* HEADER */}
      <div className="editor-header">
        <div className="left">
          <button
            className="icon-btn"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            aria-label="Back to Dashboard"
          >
            <ChevronLeft size={20} />
          </button>

          <input
            type="text"
            className="editor-title-input"
            value={doc?.title || ""}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
          />
        </div>

        <div className="right">
          <span className="save-status">
            {isSaving ? "Saving..." : "Saved"}
          </span>

          {/* 📹 WEBRTC VIDEO CALL TOGGLE */}
          <Button
            variant={isVideoCallActive ? "danger" : "secondary"}
            onClick={() => setIsVideoCallActive((prev) => !prev)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {isVideoCallActive ? <VideoOff size={16} /> : <Video size={16} />}
            <span>{isVideoCallActive ? "Leave Call" : "Video Call"}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsShareModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Share2 size={16} /> <span>Share</span>
          </Button>

          <Button 
            onClick={handleSave} 
            isLoading={isSaving}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Save size={16} /> <span>Save</span>
          </Button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="tiptap-wrapper">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <ShareModal
          docId={id}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* 📹 FLOATING WEBRTC VIDEO CONFERENCING CARD */}
      {isVideoCallActive && socket && (
        <VideoCall
          socket={socket}
          docId={id}
          onClose={() => setIsVideoCallActive(false)}
        />
      )}
    </div>
  );
};

export default Editor;