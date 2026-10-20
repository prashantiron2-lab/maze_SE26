const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile, execFileSync } = require('child_process');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const initializeDatabase = require('./config/init');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const mazeSource = path.join(__dirname, '..', 'maze_dfs.cpp');
const mazeExecutable = path.join(__dirname, '..', 'maze_dfs.exe');

const ensureMazeEngine = () => {
  if (fs.existsSync(mazeExecutable)) return;
  try {
    execFileSync('g++', ['-std=c++17', '-O2', mazeSource, '-o', mazeExecutable], {
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error('The C++ DFS engine could not be compiled. Install g++ and try again.');
  }
};

app.get('/api/maze/generate', (req, res) => {
  const rows = Number(req.query.rows || 20);
  const cols = Number(req.query.cols || 20);
  const seed = req.query.seed ? Number(req.query.seed) : Math.floor(Math.random() * 2147483647);

  if (!Number.isInteger(rows) || !Number.isInteger(cols) ||
      rows < 5 || rows > 35 || cols < 5 || cols > 35 ||
      !Number.isInteger(seed) || seed < 0) {
    return res.status(400).json({
      error: 'Rows and columns must be integers from 5 to 35, with a non-negative integer seed.',
    });
  }

  try {
    ensureMazeEngine();
  } catch (error) {
    console.error('DFS engine setup error:', error.message);
    return res.status(503).json({ error: error.message });
  }

  execFile(mazeExecutable, [String(rows), String(cols), String(seed)], { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      console.error('DFS engine error:', stderr || error.message);
      return res.status(500).json({ error: 'The C++ DFS engine failed to generate the maze.' });
    }
    try {
      return res.json(JSON.parse(stdout));
    } catch (parseError) {
      console.error('Invalid DFS engine response:', parseError.message);
      return res.status(500).json({ error: 'The C++ DFS engine returned invalid data.' });
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    if (process.env.MAZE_ONLY !== 'true') {
      await initializeDatabase();
    }
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
