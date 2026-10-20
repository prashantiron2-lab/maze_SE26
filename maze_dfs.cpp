#include <iostream>
#include <random>
#include <vector>

struct Cell {
    bool walls[4] = {true, true, true, true}; // up, right, down, left
};

struct Position {
    int row;
    int col;
};

int main(int argc, char* argv[]) {
    const int rows = argc > 1 ? std::stoi(argv[1]) : 20;
    const int cols = argc > 2 ? std::stoi(argv[2]) : 20;
    const unsigned int seed = argc > 3
        ? static_cast<unsigned int>(std::stoul(argv[3]))
        : std::random_device{}();

    if (rows < 5 || rows > 35 || cols < 5 || cols > 35) {
        std::cerr << "Rows and columns must be between 5 and 35.\n";
        return 1;
    }

    const int rowMove[4] = {-1, 0, 1, 0};
    const int colMove[4] = {0, 1, 0, -1};
    const int opposite[4] = {2, 3, 0, 1};
    std::vector<Cell> maze(rows * cols);
    std::vector<bool> visited(rows * cols, false);
    std::vector<Position> stack;
    std::vector<Position> visitOrder;
    std::mt19937 generator(seed);

    auto index = [cols](int row, int col) { return row * cols + col; };
    auto inside = [rows, cols](int row, int col) {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    };

    stack.push_back({0, 0});
    visited[0] = true;
    visitOrder.push_back({0, 0});

    while (!stack.empty()) {
        Position current = stack.back();
        std::vector<int> available;

        for (int direction = 0; direction < 4; direction++) {
            int nextRow = current.row + rowMove[direction];
            int nextCol = current.col + colMove[direction];
            if (inside(nextRow, nextCol) &&
                !visited[index(nextRow, nextCol)]) {
                available.push_back(direction);
            }
        }

        if (available.empty()) {
            stack.pop_back();
            continue;
        }

        std::uniform_int_distribution<int> pick(0,
            static_cast<int>(available.size()) - 1);
        int direction = available[pick(generator)];
        int nextRow = current.row + rowMove[direction];
        int nextCol = current.col + colMove[direction];

        maze[index(current.row, current.col)].walls[direction] = false;
        maze[index(nextRow, nextCol)].walls[opposite[direction]] = false;
        visited[index(nextRow, nextCol)] = true;
        stack.push_back({nextRow, nextCol});
        visitOrder.push_back({nextRow, nextCol});
    }

    maze[0].walls[0] = false;
    maze[index(rows - 1, cols - 1)].walls[2] = false;

    std::cout << "{\"rows\":" << rows
              << ",\"cols\":" << cols
              << ",\"seed\":" << seed
              << ",\"visitedCells\":" << visitOrder.size()
              << ",\"cells\":[";
    for (int row = 0; row < rows; row++) {
        if (row > 0) std::cout << ",";
        std::cout << "[";
        for (int col = 0; col < cols; col++) {
            if (col > 0) std::cout << ",";
            const Cell& cell = maze[index(row, col)];
            std::cout << "{\"walls\":["
                      << (cell.walls[0] ? 1 : 0) << ","
                      << (cell.walls[1] ? 1 : 0) << ","
                      << (cell.walls[2] ? 1 : 0) << ","
                      << (cell.walls[3] ? 1 : 0) << "]}";
        }
        std::cout << "]";
    }
    std::cout << "],\"visitOrder\":[";
    for (size_t i = 0; i < visitOrder.size(); i++) {
        if (i > 0) std::cout << ",";
        std::cout << "[" << visitOrder[i].row << "," << visitOrder[i].col << "]";
    }
    std::cout << "]}\n";
}
