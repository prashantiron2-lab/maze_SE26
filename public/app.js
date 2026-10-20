const canvas = document.querySelector('#maze');
const context = canvas.getContext('2d');
const sizeInput = document.querySelector('#size');
const sizeValue = document.querySelector('#sizeValue');
const generateButton = document.querySelector('#generate');
const animateButton = document.querySelector('#animate');
const statusText = document.querySelector('#status');
const cellCount = document.querySelector('#cellCount');
const seedLabel = document.querySelector('#seedLabel');
let mazeData;

sizeInput.addEventListener('input', () => {
  sizeValue.textContent = `${sizeInput.value} × ${sizeInput.value}`;
});

async function generateMaze() {
  generateButton.disabled = true;
  animateButton.disabled = true;
  statusText.textContent = 'Running C++ DFS…';
  try {
    const size = Number(sizeInput.value);
    const seed = document.querySelector('#seed').value;
    const query = new URLSearchParams({ rows: size, cols: size });
    if (seed) query.set('seed', seed);
    const response = await fetch(`/api/maze/generate?${query}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Maze generation failed');
    mazeData = result;
    cellCount.textContent = result.visitedCells;
    seedLabel.textContent = `Seed: ${result.seed}`;
    statusText.textContent = 'Maze generated with DFS';
    drawMaze();
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    generateButton.disabled = false;
    animateButton.disabled = false;
  }
}

function drawMaze(highlight = new Set()) {
  if (!mazeData) return;
  const cellSize = Math.max(12, Math.floor(620 / Math.max(mazeData.rows, mazeData.cols)));
  canvas.width = mazeData.cols * cellSize + 2;
  canvas.height = mazeData.rows * cellSize + 2;
  context.fillStyle = '#0b1728';
  context.fillRect(0, 0, canvas.width, canvas.height);
  mazeData.cells.forEach((row, r) => row.forEach((cell, c) => {
    const key = `${r},${c}`;
    if (highlight.has(key)) {
      context.fillStyle = '#314d75';
      context.fillRect(1 + c * cellSize, 1 + r * cellSize, cellSize, cellSize);
    }
    if (r === 0 && c === 0) context.fillStyle = '#ffb45c';
    if (r === mazeData.rows - 1 && c === mazeData.cols - 1) context.fillStyle = '#e779a8';
    if ((r === 0 && c === 0) || (r === mazeData.rows - 1 && c === mazeData.cols - 1)) {
      context.fillRect(4 + c * cellSize, 4 + r * cellSize, cellSize - 6, cellSize - 6);
    }
    context.strokeStyle = '#87a4c9';
    context.lineWidth = 1.4;
    const x = 1 + c * cellSize;
    const y = 1 + r * cellSize;
    const walls = cell.walls;
    context.beginPath();
    if (walls[0]) { context.moveTo(x, y); context.lineTo(x + cellSize, y); }
    if (walls[1]) { context.moveTo(x + cellSize, y); context.lineTo(x + cellSize, y + cellSize); }
    if (walls[2]) { context.moveTo(x, y + cellSize); context.lineTo(x + cellSize, y + cellSize); }
    if (walls[3]) { context.moveTo(x, y); context.lineTo(x, y + cellSize); }
    context.stroke();
  }));
}

async function showTraversal() {
  if (!mazeData) return;
  animateButton.disabled = true;
  const visited = new Set();
  for (const [row, col] of mazeData.visitOrder) {
    visited.add(`${row},${col}`);
    drawMaze(visited);
    await new Promise(resolve => setTimeout(resolve, 8));
  }
  statusText.textContent = 'DFS traversal complete';
  animateButton.disabled = false;
}

generateButton.addEventListener('click', generateMaze);
animateButton.addEventListener('click', showTraversal);
generateMaze();
