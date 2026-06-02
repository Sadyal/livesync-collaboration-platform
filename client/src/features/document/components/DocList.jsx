import React from "react";
import DocCard from "./DocCard";
import { FileEdit, Info } from "lucide-react";

/**
 * 📄 DocList Component
 * Renders a grid of documents or an empty state placeholder.
 */
const DocList = ({ docs }) => {
  if (!docs || docs.length === 0) {
    return (
      <div className="doc-empty-state glass animate-fade-in">
        <div className="empty-icon-wrapper">
          <FileEdit size={48} className="empty-icon" />
        </div>
        <h2>No Documents Yet</h2>
        <p>Get started by creating your very first document above!</p>
      </div>
    );
  }

  return (
    <div className="doc-grid">
      {docs.map((doc) => (
        <DocCard key={doc._id} doc={doc} />
      ))}
    </div>
  );
};

export default DocList;
