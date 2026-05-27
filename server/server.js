require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./src/config/db');
const healthRoutes = require('./src/routes/health.routes');
const authRoutes = require('./src/routes/auth.routes');
const leadRoutes = require('./src/routes/lead.routes');
const aiRoutes = require('./src/routes/ai.routes');
const quotationRoutes = require('./src/routes/quotation.routes');
const taskRoutes = require('./src/routes/task.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] Listening on http://localhost:${PORT}`);
      console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
