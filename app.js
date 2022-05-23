const app = document.getElementById('app');

// Размер игровой клетки в пикселях
const size = 25;

// Коичество строк и колонок игровго поля
const rows = 20;
const cols = 20;

// Шанс встретить мину
const mineChance = 0.2;

// Цвета
const mineFieldColor = 'red';
const emptyFieldColor = 'green';
const closedFieldColor = 'gray';


let game = startGame();

function startGame() {
    return new Game(app, size, rows, cols, mineChance, mineFieldColor, emptyFieldColor, closedFieldColor);
}

game.OnLose(() => {
    alert("Lose!")
});

game.Start();
