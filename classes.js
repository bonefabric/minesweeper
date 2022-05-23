class Game {

    _gameField;
    _size;
    _rows;
    _cols;

    _mineChance;

    _mineFieldColor;
    _emptyFieldColor;
    _closedFieldColor;

    _mineFields;
    _emptyFields;
    _closedFields;
    _markedFields;

    _ctx;

    _loseCallback;

    constructor(gameField,
                size,
                rows,
                cols,
                mineChance,
                mineFieldColor,
                emptyFieldColor,
                closedFieldColor) {
        this._gameField = gameField;
        this._size = size;
        this._rows = rows;
        this._cols = cols;
        this._mineChance = mineChance;
        this._mineFieldColor = mineFieldColor;
        this._emptyFieldColor = emptyFieldColor;
        this._closedFieldColor = closedFieldColor;

        this._ctx = gameField.getContext('2d');

        this._mineFields = [];
        this._emptyFields = [];
        this._closedFields = [];
        this._markedFields = [];
    }

    Start() {
        this.#setGameFieldSize();
        this.#generateAllFields();
        this.#addGameFieldClickHandler();
    }

    OnLose(callback) {
        this._loseCallback = callback;
    }

    #gameLogics(e) {
        if (e.button === 0) {
            this.#openClosedFields(this.#getClickedRow(e), this.#getClickedCol(e));
        } else if (e.button === 2) {
            this.#markField(this.#getClickedRow(e), this.#getClickedCol(e));
        }
    }

    #render() {
        this.#renderMineFields();
        this.#renderEmptyFields();
        this.#renderClosedFields();
        this.#renderMarkedFields();
    }

    #renderMineFields() {
        this._ctx.fillStyle = this._mineFieldColor;
        this._mineFields.forEach(mine => {
            this._ctx.fillRect(mine.getRow() * this._size,
                mine.getCol() * this._size,
                this._size,
                this._size);
        });
    }

    #renderEmptyFields() {
        this._emptyFields.forEach(field => {
            this._ctx.fillStyle = this._emptyFieldColor;

            this._ctx.fillRect(field.getRow() * this._size,
                field.getCol() * this._size,
                this._size,
                this._size);

            this._ctx.fillStyle = 'white';
            this._ctx.fillText(field.getHelpNumber(),
                field.getRow() * this._size + this._size / 2,
                field.getCol() * this._size + this._size / 2);
        });


    }

    #renderClosedFields() {
        this._ctx.fillStyle = this._closedFieldColor;
        this._closedFields.forEach(field => {
            this._ctx.fillRect(field.getRow() * this._size,
                field.getCol() * this._size,
                this._size,
                this._size);
        });
    }

    #renderMarkedFields() {
        this._ctx.fillStyle = 'blue';
        this._markedFields.forEach(field => {
            this._ctx.fillRect(field.getRow() * this._size,
                field.getCol() * this._size,
                this._size,
                this._size);
        });
    }

    #setGameFieldSize() {
        this._gameField.setAttribute('width', this._size * this._rows);
        this._gameField.setAttribute('height', this._size * this._cols);
    }

    #addGameFieldClickHandler() {
        this._gameField.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        this._gameField.addEventListener('mouseup', (e) => {
            this.#gameLogics(e);
            this.#render();
        });
    }

    #generateAllFields() {
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                if (Math.random() < this._mineChance) {
                    this._mineFields.push(new MineField(row, col));
                } else {
                    this._emptyFields.push(new EmptyField(row, col));
                }
                this._closedFields.push(new ClosedField(row, col));
            }
        }

        this._mineFields.forEach(mine => {
            const neighbourFields = this._emptyFields.filter(emptyField => {
                return (Math.abs(emptyField.getRow() - mine.getRow()) +
                    Math.abs(emptyField.getCol() - mine.getCol()) < 2) || (
                    Math.abs(emptyField.getRow() - mine.getRow()) === 1 &&
                    Math.abs(emptyField.getCol() - mine.getCol()) === 1
                )
            });
            neighbourFields.forEach(field => {
                if (field instanceof EmptyField) {
                    field.incrementHelpNumber();
                }
            });
        });
    }

    #getClickedCol(e) {
        return Math.floor((e.clientY - this._gameField.getBoundingClientRect().top) / this._size);
    }

    #getClickedRow(e) {
        return Math.floor((e.clientX - this._gameField.getBoundingClientRect().left) / this._size);
    }

    #openClosedFields(row, col) {
        const closedField = this._closedFields.find(field => field.getRow() === row &&
            field.getCol() === col);

        if (typeof closedField !== 'object') {
            return;
        }

        const mineField = this._mineFields.find(field => {
            return field.getRow() === row && field.getCol() === col;
        })

        if (typeof mineField === 'object' && typeof this._loseCallback === 'function') {
            this.#loose();
            this._loseCallback();
            this.#restart();
            return;
        }

        this._closedFields = this._closedFields.filter(field => {
            return !(field.getRow() === row && field.getCol() === col);
        });

        const openField = this._emptyFields.find(field => {
            return field.getRow() === row && field.getCol() === col;
        })

        if (typeof openField !== 'object' || !(openField instanceof EmptyField)) return;

        if (openField.getHelpNumber() === 0) {
            const neighbourFields = this._emptyFields.filter(field => {
                return (Math.abs(field.getRow() - closedField.getRow()) +
                    Math.abs(field.getCol() - closedField.getCol()) < 2) || (
                    Math.abs(field.getRow() - closedField.getRow()) === 1 &&
                    Math.abs(field.getCol() - closedField.getCol()) === 1
                )
            });
            neighbourFields.forEach(field => this.#openClosedFields(field.getRow(), field.getCol()));
        }
    }

    #markField(row, col) {
        const markedField = this._markedFields.find(field => {
            return field.getRow() === row && field.getCol() === col;
        });

        if (typeof markedField === 'object') {
            this._markedFields = this._markedFields.filter(field => {
                return !(field.getRow() === row && field.getCol() === col);
            });
            return;
        }

        const closedField = this._closedFields.find(field => {
            return field.getRow() === row && field.getCol() === col;
        });

        if (typeof closedField !== 'object' || !(closedField instanceof ClosedField)) {
            return;
        }

        this._markedFields.push(new MarkedField(row, col));
    }

    #loose() {
        this._closedFields = [];
        this.#renderMineFields();
    }

    #restart() {
        this._mineFields = [];
        this._emptyFields = [];
        this._closedFields = [];
        this._markedFields = [];
        this.#generateAllFields();
    }
}

class Field {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }
}

class EmptyField extends Field {
    constructor(row, col) {
        super(row, col);
        this.helpNumber = 0;
    }

    getHelpNumber() {
        return this.helpNumber;
    }

    incrementHelpNumber() {
        this.helpNumber++;
    }
}

class MineField extends Field {
}

class ClosedField extends Field {
}

class MarkedField extends Field {
}
