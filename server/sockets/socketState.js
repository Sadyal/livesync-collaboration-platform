const userSockets = new Map();

export const registerUserSocket = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
};

export const removeUserSocket = (userId, socketId) => {
  const set = userSockets.get(userId);
  if (!set) return;

  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
};

export const emitToUser = (io, userId, event, payload) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  sockets.forEach((sid) => {
    io.to(sid).emit(event, payload);
  });
};