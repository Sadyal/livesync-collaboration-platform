import React from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2, Clock, Calendar } from "lucide-react";
import { useDocuments } from "../hooks";

/**
 * 📄 DocCard Component
 * Renders a premium card for a single document on the dashboard.
 */
const DocCard = ({ doc }) => {
  const { deleteDoc } = useDocuments();

  const handleDocDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${doc.title || "Untitled Document"}"?`)) {
      try {
        await deleteDoc(doc._id);
      } catch (err) {
        alert("Failed to delete document");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link to={`/docs/${doc._id}`} className="doc-card-link">
      <div className="doc-card glass animate-fade-in">
        <div className="doc-card-icon-wrapper">
          <FileText size={28} className="doc-card-icon" />
        </div>
        
        <div className="doc-card-content">
          <h3 className="doc-card-title">{doc.title || "Untitled Document"}</h3>
          
          <div className="doc-card-meta">
            <span className="doc-card-time" title="Last Updated">
              <Clock size={12} style={{ marginRight: "4px" }} />
              {formatDate(doc.updatedAt)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleDocDelete} 
          className="doc-card-delete-btn" 
          title="Delete Document"
          aria-label="Delete Document"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Link>
  );
};

export default DocCard;
