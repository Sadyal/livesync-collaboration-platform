import Document from "../modules/document/doc.model.js";

export const registerDocHandlers = (io, socket) => {

  // ==============================
  // 📄 DOCUMENT COLLABORATION
  // ==============================
  
  // LOAD & JOIN DOCUMENT ROOM
  socket.on("get-document", async (docId) => {
    try {
      if (!docId) return;

      const doc = await Document.findById(docId);

      if (!doc) {
        return socket.emit("access-denied");
      }

      const userId = socket.userId;

      const isOwner = doc.owner.toString() === userId;
      const isCollaborator = doc.collaborators
        .map((id) => id.toString())
        .includes(userId);

      if (!isOwner && !isCollaborator) {
        return socket.emit("access-denied");
      }

      socket.join(docId);
      socket.currentDoc = docId;

      socket.emit("load-document", doc.content || "");

    } catch (err) {
      console.error("❌ get-document error:", err.message);
      socket.emit("server-error");
    }
  });

  // REAL-TIME CHANGES (BROADCAST TO OTHER COLLABORATORS)
  socket.on("send-changes", (content) => {
    if (!socket.currentDoc) return;

    socket.broadcast
      .to(socket.currentDoc)
      .emit("receive-changes", content);
  });

  // SAVE DOCUMENT TO DATABASE (CONTROLLED/DEBOUNCED BY CLIENT)
  socket.on("save-document", async (data) => {
    try {
      if (!socket.currentDoc) return;

      await Document.findByIdAndUpdate(
        socket.currentDoc,
        { content: data },
        { new: false }
      );

    } catch (err) {
      console.error("❌ save-document error:", err.message);
    }
  });

  // ==============================
  // 📹 WEBRTC VIDEO CALL SIGNALING
  // ==============================

  // JOIN VIDEO CALL
  socket.on("join-video-call", () => {
    if (!socket.currentDoc) return;

    console.log(`📹 User ${socket.userId} joined video call in room ${socket.currentDoc}`);

    // Broadcast user joined to other peers in room
    socket.to(socket.currentDoc).emit("user-joined-video", {
      socketId: socket.id,
      userId: socket.userId,
    });
  });

  // RELAY WEBRTC OFFER
  socket.on("video-offer", ({ offer, targetSocketId }) => {
    io.to(targetSocketId).emit("video-offer", {
      offer,
      senderSocketId: socket.id,
      senderUserId: socket.userId,
    });
  });

  // RELAY WEBRTC ANSWER
  socket.on("video-answer", ({ answer, targetSocketId }) => {
    io.to(targetSocketId).emit("video-answer", {
      answer,
      senderSocketId: socket.id,
    });
  });

  // RELAY ICE CANDIDATES
  socket.on("ice-candidate", ({ candidate, targetSocketId }) => {
    io.to(targetSocketId).emit("ice-candidate", {
      candidate,
      senderSocketId: socket.id,
    });
  });

  // LEAVE VIDEO CALL (EXPLICIT)
  socket.on("leave-video-call", () => {
    if (!socket.currentDoc) return;

    console.log(`📹 User ${socket.userId} left video call in room ${socket.currentDoc}`);

    socket.to(socket.currentDoc).emit("user-left-video", {
      socketId: socket.id,
      userId: socket.userId,
    });
  });

  // LEAVE VIDEO CALL ON DISCONNECT (AUTOMATIC)
  socket.on("disconnect", () => {
    if (socket.currentDoc) {
      socket.to(socket.currentDoc).emit("user-left-video", {
        socketId: socket.id,
        userId: socket.userId,
      });
    }
  });
};