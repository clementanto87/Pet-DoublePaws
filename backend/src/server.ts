import app from './app';
import { connectDB } from './config/database';
import { createServer } from 'http';
import { initSocket } from './socket';

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
