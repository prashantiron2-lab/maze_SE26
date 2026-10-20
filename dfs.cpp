
#include <SFML/Graphics.hpp>
#include <iostream>

using namespace std;

// Maze dimensions
const int ROWS = 20;
const int COLS = 20;
const int MAX_SIZE = ROWS * COLS;

const float CELL_SIZE = 28.0f;
const float OFFSET_X = 30.0f;
const float OFFSET_Y = 30.0f;

// Direction numbers:
// 0 = Up, 1 = Right, 2 = Down, 3 = Left

int rowMove[4] = {-1, 0, 1, 0};
int colMove[4] = {0, 1, 0, -1};

// Maze cell
struct Cell {
    bool visited;
    bool walls[4];
};

// Custom stack element
struct Position {
    int row;
    int col;
};

// Custom stack implemented using an array
struct Stack {
    Position data[MAX_SIZE];
    int topIndex;

    Stack() {
        topIndex = -1;
    }

    bool isEmpty() {
        return topIndex == -1;
    }

    bool isFull() {
        return topIndex == MAX_SIZE - 1;
    }

    void push(int r, int c) {
        if (!isFull()) {
            topIndex++;
            data[topIndex].row = r;
            data[topIndex].col = c;
        }
    }

    void pop() {
        if (!isEmpty()) {
            topIndex--;
        }
    }

    Position top() {
        return data[topIndex];
    }
};

// Fixed-size maze array
Cell maze[ROWS][COLS];

// Custom pseudo-random number generator
unsigned int randomSeed = 123456789;

unsigned int myRandom() {
    randomSeed = randomSeed * 1103515245u + 12345u;
    return (randomSeed / 65536u) % 32768u;
}

// Reset every cell and its walls
void initializeMaze() {
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            maze[r][c].visited = false;

            for (int d = 0; d < 4; d++) {
                maze[r][c].walls[d] = true;
            }
        }
    }
}

// Check whether a cell is inside the maze
bool isInside(int r, int c) {
    return r >= 0 && r < ROWS &&
           c >= 0 && c < COLS;
}

// Count unvisited neighbours
int countNeighbours(int r, int c) {
    int count = 0;

    for (int d = 0; d < 4; d++) {
        int nr = r + rowMove[d];
        int nc = c + colMove[d];

        if (isInside(nr, nc) &&
            !maze[nr][nc].visited) {
            count++;
        }
    }

    return count;
}

// Find the selected unvisited neighbour
int chooseNeighbour(int r, int c, int choice) {
    for (int d = 0; d < 4; d++) {
        int nr = r + rowMove[d];
        int nc = c + colMove[d];

        if (isInside(nr, nc) &&
            !maze[nr][nc].visited) {

            if (choice == 0) {
                return d;
            }

            choice--;
        }
    }

    return -1;
}

// Remove the wall between two adjacent cells
void removeWall(int r, int c, int d) {
    int nr = r + rowMove[d];
    int nc = c + colMove[d];

    maze[r][c].walls[d] = false;

    // Opposite direction is two positions away
    int opposite = (d + 2) % 4;

    maze[nr][nc].walls[opposite] = false;
}

// DFS maze generation using our own stack
void generateMaze() {
    initializeMaze();

    Stack st;

    maze[0][0].visited = true;
    st.push(0, 0);

    while (!st.isEmpty()) {
        Position current = st.top();

        int r = current.row;
        int c = current.col;

        int total = countNeighbours(r, c);

        if (total > 0) {
            // Choose a random unvisited neighbour
            int choice = myRandom() % total;

            int direction =
                chooseNeighbour(r, c, choice);

            if (direction != -1) {
                int nr = r + rowMove[direction];
                int nc = c + colMove[direction];

                removeWall(r, c, direction);

                maze[nr][nc].visited = true;

                st.push(nr, nc);
            }
        }
        else {
            // No unvisited neighbours: backtrack
            st.pop();
        }
    }

    // Entrance and exit openings
    maze[0][0].walls[0] = false;
    maze[ROWS - 1][COLS - 1].walls[2] = false;
}

// Draw a white line using SFML
void drawLine(sf::RenderWindow& window,
              float x1, float y1,
              float x2, float y2) {

    sf::Vertex line[2];

    line[0].position = sf::Vector2f(x1, y1);
    line[0].color = sf::Color::White;

    line[1].position = sf::Vector2f(x2, y2);
    line[1].color = sf::Color::White;

    window.draw(line, 2, sf::PrimitiveType::Lines);
}

// Display the maze graphically
void displayMaze(sf::RenderWindow& window) {
    sf::RectangleShape background(
        sf::Vector2f(
            COLS * CELL_SIZE,
            ROWS * CELL_SIZE
        )
    );

    background.setPosition(
        sf::Vector2f(OFFSET_X, OFFSET_Y)
    );

    background.setFillColor(sf::Color::Black);
    window.draw(background);

    // Draw each existing wall
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            float x = OFFSET_X + c * CELL_SIZE;
            float y = OFFSET_Y + r * CELL_SIZE;

            if (maze[r][c].walls[0]) {
                drawLine(window, x, y,
                         x + CELL_SIZE, y);
            }

            if (maze[r][c].walls[1]) {
                drawLine(window, x + CELL_SIZE, y,
                         x + CELL_SIZE, y + CELL_SIZE);
            }

            if (maze[r][c].walls[2]) {
                drawLine(window, x, y + CELL_SIZE,
                         x + CELL_SIZE, y + CELL_SIZE);
            }

            if (maze[r][c].walls[3]) {
                drawLine(window, x, y,
                         x, y + CELL_SIZE);
            }
        }
    }
}

int main() {
    generateMaze();

    sf::RenderWindow window(
        sf::VideoMode(sf::Vector2u(950, 800)),
        "Maze Generation using DFS"
    );

    window.setFramerateLimit(60);

    while (window.isOpen()) {
        while (const auto event = window.pollEvent()) {
            if (event->is<sf::Event::Closed>()) {
                window.close();
            }

            if (const auto* key =
                    event->getIf<sf::Event::KeyPressed>()) {

                if (key->code == sf::Keyboard::Key::Escape) {
                    window.close();
                }

                if (key->code == sf::Keyboard::Key::R) {
                    // Change seed to create a different maze
                    randomSeed += 7919u;
                    generateMaze();
                }
            }
        }

        window.clear(sf::Color(58, 151, 218));

        displayMaze(window);

        window.display();
    }

    return 0;
}
