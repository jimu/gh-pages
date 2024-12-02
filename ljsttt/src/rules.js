'use strict';

class Rules {
  static WIN  = Symbol('win');
  static DRAW = Symbol('draw');
  static PLAY = Symbol('play');
  static NUM_CELLS = 9;
  static WIN_STATES = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6],
  ];

  constructor() {
    this.cells = Array(Rules.NUM_CELLS).fill(null);
  }

  // returns [state, winning-player-index, win-cell1, win-cell2, win-cell3]
  checkWinner() {
    for (let i = 0; i < Rules.WIN_STATES.length; ++i) {
      const [a,b,c] = Rules.WIN_STATES[i];
      if (this.cells[a] != null && this.cells[a] == this.cells[b] && this.cells[a] == this.cells[c])
        return [Rules.WIN, this.cells[a], a, b, c];
    }

    for (let i = 0; i < this.cells.length; ++i)
      if (this.cells[i] == null)
        return [Rules.PLAY];

    return [Rules.DRAW];
  }
}

export default Rules
