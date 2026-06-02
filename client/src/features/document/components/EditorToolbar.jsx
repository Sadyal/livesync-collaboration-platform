import {
  Undo, Redo, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Highlighter,
  Link as LinkIcon, CheckSquare, Table as TableIcon,
  Image as ImageIcon, Subscript, Superscript
} from "lucide-react";

import "./EditorToolbar.css";

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  // ==============================
  // SAFE ACTIVE CHECK
  // ==============================
  const isActive = (name, attrs = {}) =>
    editor.isActive(name, attrs) ? "is-active" : "";

  // ==============================
  // LINK HANDLER
  // ==============================
  const setLink = () => {
    const prev = editor.getAttributes("link")?.href || "";
    const url = window.prompt("Enter URL", prev);

    if (url === null) return;

    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  // ==============================
  // IMAGE HANDLER
  // ==============================
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (!url) return;

    editor.chain().focus().setImage({ src: url }).run();
  };

  // ==============================
  // COLOR HANDLER (SAFE)
  // ==============================
  const handleColorChange = (e) => {
    const color = e.target.value;
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="tiptap-toolbar">

      {/* ================= HISTORY ================= */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="toolbar-btn"
        >
          <Undo size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="toolbar-btn"
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ================= TEXT ================= */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-btn ${isActive("heading", { level: 1 })}`}
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${isActive("heading", { level: 2 })}`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`toolbar-btn ${isActive("paragraph")}`}
        >
          P
        </button>

        {/* SAFE COLOR PICKER */}
        <input
          type="color"
          onChange={handleColorChange}
          className="toolbar-color-input"
          title="Text Color"
        />
      </div>

      <div className="toolbar-divider" />

      {/* ================= FORMATTING ================= */}
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${isActive("bold")}`}>
          <Bold size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${isActive("italic")}`}>
          <Italic size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-btn ${isActive("underline")}`}>
          <Underline size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`toolbar-btn ${isActive("strike")}`}>
          <Strikethrough size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={`toolbar-btn ${isActive("highlight")}`}>
          <Highlighter size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ================= SCRIPT ================= */}
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleSubscript().run()} className={`toolbar-btn ${isActive("subscript")}`}>
          <Subscript size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`toolbar-btn ${isActive("superscript")}`}>
          <Superscript size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ================= ALIGN ================= */}
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className="toolbar-btn">
          <AlignLeft size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className="toolbar-btn">
          <AlignCenter size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className="toolbar-btn">
          <AlignRight size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className="toolbar-btn">
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ================= LIST ================= */}
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${isActive("bulletList")}`}>
          <List size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-btn ${isActive("orderedList")}`}>
          <ListOrdered size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={`toolbar-btn ${isActive("taskList")}`}>
          <CheckSquare size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ================= MEDIA ================= */}
      <div className="toolbar-group">
        <button type="button" onClick={setLink} className="toolbar-btn">
          <LinkIcon size={16} />
        </button>

        <button type="button" onClick={addImage} className="toolbar-btn">
          <ImageIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className="toolbar-btn"
        >
          <TableIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;