'use strict';

import * as LittleJS from './dist/littlejs.esm.js';
import Rules from './src/rules.js';

const {tile, vec2, hsl, rgb} = LittleJS;

var game;

//-----------------------------------------------------------------------------

class Game {
  static IMAGES = ['tiles.png'];

  static BOARD_SIZE = vec2(31, 34);
  static BOARD_OFFSET = vec2(0, 5/2); // board is 5 pixels wider than high. Offset is half differene.

  static PIECE_SIZE = vec2(7, 7)
  static PIECE_OFFSET = 10;         // pieces are 10 pixels away from each other (piece width + 2 pixels padding + 1 pixel border  
  static X_TILE = 5;
  static O_TILE = 6;
  static EMPTY_TILE = 12;
  static HOVER_TILE = 13;

  static TIE_BANNER_TILE  = 10;
  static TIE_BANNER_SIZE  = vec2(21, 8);
  static TIE_BANNER_POS   = vec2(0, 5.0)

  constructor() {
    this.boardTileInfo = tile(0, Game.BOARD_SIZE);
    this.xTileInfo = tile(Game.X_TILE, Game.PIECE_SIZE);
    this.oTileInfo = tile(Game.O_TILE, Game.PIECE_SIZE);
    this.hoverTileInfo = tile(Game.HOVER_TILE, Game.PIECE_SIZE);
    this.emptyTileInfo = tile(Game.EMPTY_TILE, Game.PIECE_SIZE);
    this.drawTileInfo  = tile(Game.TIE_BANNER_TILE, Game.TIE_BANNER_SIZE);

    this.rules = new Rules
    this.tiles = [];
    this.current_player = 0
  }

  isGameOver() {
    this.state == Rules.WIN || this.state == Rules.DRAW
  }

  cellClicked(i) {
    game.tiles[i].tileInfo = game.current_player ? game.xTileInfo : game.oTileInfo
    game.rules.cells[i] = game.current_player
    game.current_player = game.current_player ? 0 : 1

    const [state, winner, cell1, cell2, cell3] = game.rules.checkWinner()
    if (state == Rules.WIN) {
      game.state = state
      game.winCell1 = game.tiles[cell1].pos
      game.winCell2 = game.tiles[cell3].pos
    } else if (state == Rules.DRAW) {
      game.state = state
      new LittleJS.EngineObject(Game.TIE_BANNER_POS, Game.TIE_BANNER_SIZE, game.drawTileInfo)
    }
  }

  drawWinLine() {
    LittleJS.drawCircle(this.winCell1, 1.5, rgb(0.8, 0.4, 0.0, 1))
    LittleJS.drawCircle(this.winCell1, 1.0, rgb(0.9, 0.6, 0.1, 1))
    LittleJS.drawCircle(this.winCell1, 0.5, rgb(1.0, 0.8, 0.3, 1))
    LittleJS.drawCircle(this.winCell2, 1.5, rgb(0.8, 0.4, 0.0, 1))
    LittleJS.drawCircle(this.winCell2, 1.0, rgb(0.9, 0.6, 0.1, 1))
    LittleJS.drawCircle(this.winCell2, 0.5, rgb(1.0, 0.8, 0.3, 1))
    LittleJS.drawLine(this.winCell1, this.winCell2, 3, rgb(0.8, 0.4, 0.0, 1))
    LittleJS.drawLine(this.winCell1, this.winCell2, 2, rgb(0.9, 0.6, 0.1, 1))
    LittleJS.drawLine(this.winCell1, this.winCell2, 1, rgb(1.0, 0.8, 0.3, 1))
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  game = new Game;

  new LittleJS.EngineObject(Game.BOARD_OFFSET, Game.BOARD_SIZE, game.boardTileInfo)

  for (let x = -1; x <= 1; ++x)
    for (let y = -1; y <= 1; ++y)
      game.tiles[x + y*3 + 4] = new LittleJS.EngineObject(vec2(x * Game.PIECE_OFFSET, y * Game.PIECE_OFFSET), Game.PIECE_SIZE, game.emptyTileInfo)

  LittleJS.setCameraScale(128/7);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {

  if (game.isGameOver()) return;

  if (LittleJS.mouseWasPressed(0)) {
    for (let i = 0; i < Rules.NUM_CELLS; ++i)
      if (game.rules.cells[i] == null)
        if (LittleJS.isOverlapping(game.tiles[i].pos, game.tiles[i].size, LittleJS.screenToWorld(LittleJS.mousePosScreen)))
          game.cellClicked(i)
  }

  for (let i = 0; i < Rules.NUM_CELLS; ++i)
    if (game.rules.cells[i] == null)
      if (LittleJS.isOverlapping(game.tiles[i].pos, game.tiles[i].size, LittleJS.screenToWorld(LittleJS.mousePosScreen)))
        game.tiles[i].tileInfo = game.hoverTileInfo;
      else
        game.tiles[i].tileInfo = game.emptyTileInfo;
}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  if (game.state == Rules.WIN)
    game.drawWinLine();
  
}

///////////////////////////////////////////////////////////////////////////////
LittleJS.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, Game.IMAGES);
