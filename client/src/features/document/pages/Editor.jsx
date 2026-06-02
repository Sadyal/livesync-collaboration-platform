import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2, Save, ChevronLeft } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { documentApi } from "../api";
import { ROUTES } from "../../../utils/constants";

import Button from "../../../components/common/Button";
import Loader from "../../../components/common/Loader";
import ShareModal from "../components/ShareModal";
import EditorToolbar from "../components/EditorToolbar";

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

  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const debouncedSaveRef = useRef(null);

  // ==============================
  // FETCH DOCUMENT
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
  // SAVE CONTENT (SEPARATE LOGIC)
  // ==============================
  const saveContent = useCallback(async (content) => {
    try {
      await documentApi.updateContent(id, content); // ✅ separate endpoint recommended
    } catch (err) {
      console.error("Content save failed:", err.message);
    }
  }, [id]);

  // ==============================
  // SAVE TITLE ONLY
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

        const updated = { ...prev, content };

        // ✅ debounce content save
        debouncedSaveRef.current?.(content);

        return updated;
      });
    },
  });

  // ==============================
  // LOAD DOCUMENT
  // ==============================
  useEffect(() => {
    const init = async () => {
      const data = await fetchDoc();

      if (data) {
        setTimeout(() => {
          editor?.commands.setContent(data.content || "");
        }, 0);
      }

      setIsLoading(false);
    };

    if (editor) init();
  }, [editor, fetchDoc]);

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
  // MANUAL SAVE
  // ==============================
  const handleSave = async () => {
    if (!doc) return;

    await saveTitle(doc.title);
  };

  // ==============================
  // UI STATES
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

          <Button
            variant="secondary"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 size={16} /> Share
          </Button>

          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={16} /> Save
          </Button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="tiptap-wrapper">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {/* SHARE */}
      {isShareModalOpen && (
        <ShareModal
          docId={id}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Editor;