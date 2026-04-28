import http from "http";
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import setupSocket from "./sockets/index.js";

const PORT = process.env.PORT || 4000;

/**
 * DB CONNECTION
 */
connectDB();

/**
 * CREATE SERVER
 */
const server = http.createServer(app);

/**
 * SOCKET SETUP
 */
setupSocket(server);

/**
 * START SERVER
 */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});