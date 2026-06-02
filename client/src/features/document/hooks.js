import { useState, useEffect, useCallback } from "react";
import { documentApi } from "./api";

/**
 * 📄 custom hook to manage documents on the dashboard
 */
export const useDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH ALL DOCUMENTS
  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentApi.getAllDocs();
      // Ensure it is an array
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load documents:", err.message);
      setError(err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // CREATE DOCUMENT
  const createDoc = useCallback(async () => {
    setError(null);
    try {
      const newDoc = await documentApi.createDoc();
      // Refetch documents to sync the list
      await fetchDocs();
      return newDoc; // returns { id }
    } catch (err) {
      console.error("Failed to create document:", err.message);
      throw err;
    }
  }, [fetchDocs]);

  // DELETE DOCUMENT (Optimistic updates for buttery-smooth feel)
  const deleteDoc = useCallback(async (id) => {
    setError(null);
    // Optimistic UI update
    setDocs((prev) => prev.filter((d) => d._id !== id));
    try {
      await documentApi.deleteDoc(id);
    } catch (err) {
      console.error("Failed to delete document:", err.message);
      // Rollback or refetch on failure
      fetchDocs();
      throw err;
    }
  }, [fetchDocs]);

  return {
    docs,
    isLoading,
    error,
    createDoc,
    deleteDoc,
    refreshDocs: fetchDocs,
  };
};
