import API from "../../utils/axios";
import { API_ENDPOINTS } from "../../utils/constants";

// ==========================================
// DOCUMENT SERVICE (Production Grade)
// ==========================================
export const documentApi = {

  // ===============================
  // GET ALL DOCUMENTS
  // ===============================
  getAllDocs: async () => {
    const res = await API.get(API_ENDPOINTS.DOCS.GET_ALL);

    if (!res?.success) {
      throw new Error(res?.message || "Failed to fetch documents");
    }

    return res.data;
  },

  // ===============================
  // GET DOCUMENT BY ID
  // ===============================
  getDocById: async (id) => {
    if (!id) throw new Error("Document ID is required");

    const res = await API.get(API_ENDPOINTS.DOCS.GET_BY_ID(id));

    if (!res?.success) {
      throw new Error(res?.message || "Failed to fetch document");
    }

    return res.data;
  },

  // ===============================
  // CREATE DOCUMENT
  // ===============================
  createDoc: async () => {
    const res = await API.post(API_ENDPOINTS.DOCS.CREATE);

    if (!res?.success) {
      throw new Error(res?.message || "Failed to create document");
    }

    return res.data;
  },

  // ===============================
  // RENAME DOCUMENT (TITLE ONLY)
  // ===============================
  renameDoc: async (id, title) => {
    if (!id) throw new Error("Document ID is required");
    if (!title) throw new Error("Title is required");

    const res = await API.patch(
      API_ENDPOINTS.DOCS.RENAME(id),
      { title }
    );

    if (!res?.success) {
      throw new Error(res?.message || "Failed to rename document");
    }

    return res.data;
  },

  // ===============================
  // SHARE DOCUMENT
  // ===============================
  shareDoc: async (id, email) => {
    if (!id) throw new Error("Document ID is required");
    if (!email) throw new Error("Email is required");

    const res = await API.post(
      API_ENDPOINTS.DOCS.SHARE(id),
      { email }
    );

    if (!res?.success) {
      throw new Error(res?.message || "Failed to share document");
    }

    return res.data;
  },

  // ===============================
  // DELETE DOCUMENT
  // ===============================
  deleteDoc: async (id) => {
    if (!id) throw new Error("Document ID is required");

    const res = await API.delete(
      API_ENDPOINTS.DOCS.DELETE(id)
    );

    if (!res?.success) {
      throw new Error(res?.message || "Failed to delete document");
    }

    return res.data;
  },
};