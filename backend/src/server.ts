import app from './app';
import { connectDB } from './config/database';
import { createServer } from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

void start().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
