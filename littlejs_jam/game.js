'use strict';

const TEXTURE_IDX_TRS80_FONT = 1;
const FROST_TEXTURE_INDEX = 2;
const BLACK_FONT_TEXTURE_IMAGE = 3;
const YOUTUBE_ICON_TEXTURE_IMAGE = 4;
const SPRITE_SHEETS = [
  'tiles.png',
  'assets/trs80cyan.png',
  'assets/frost.png',
  'assets/trs80.png',
  'assets/youtube_icon.png',
]

const GRIDXO_ENABLED = false;
const GRID2_ENABLED = false;
const GRID3_ENABLED = false;
const GRID4_ENABLED = false;   // draws 2x3 blocks to compare against font
const GRID_SAMPLE_ENABLED = false;
const FLAKE_SIZE = vec2(3,3)
const TEXT_RES  = vec2(32, 16);
const PIXEL_RES = vec2(32*2, 16*3);
const PIXEL_RES0 = vec2(32, 16);

const FEATURE_FONT_TRS80 = false;
const FEATURE_FONT_DEFAULT = false;
const FEATURE_drawText = false
const FEATURE_CAMERA = false;
const FEATURE_OVERLAP = false;
const FEATURE_DEBUG_POINT = false;

const FEATURE_debugPoints = false;
const FEATURE_worldSpace = false;
const FEATURE_responsiveWorldSpace = false;  // draws debug objects illustrating coordinates
const FEATURE_Border = false;
const FEATURE_Medals = false;
const FEATURE_Fullscreen = false; // NOTE: can only be initiated by a user gesture

const FEATURE_FONT_TRS80_CORRECT_SIZE = false;
const FEATURE_SNOWGRID = false;
const FEATURE_SnowObjects = false;
const FEATURE_Poem = true;
const FEATURE_PoemSnow = true;
const FEATURE_Postprocess = true;
const FEATURE_Hum = true;

const POEM_TITLE = 'On a Snowy Evening ...... By Robert Frost';
const POEM_TITLE_END = 'Stopping by Woods on a Snowy Evening';
const POEM_UPPERCASE = true;
const POEM = [
  'Whose woods these are I think I know.',
  'His house is in the village though;',
  'He will not see me stopping here',
  'To watch his woods fill up with snow.',

  'My little horse must think it queer',
  'To stop without a farmhouse near',
  'Between the woods and frozen lake',
  'The darkest evening of the year.',

  'He gives his harness bells a shake',
  'To ask if there is some mistake.',
  'The only other sound\'s the sweep',
  'Of easy wind and downy flake.',

  'The woods are lovely, dark and deep,',
  'But I have promises to keep,',
  'And miles to go before I sleep,',
  'And miles to go before I sleep.',
];
const FEATURE_FlakeTest = false;
const OBIT = "Robert Frost\nMarch 26, 1874 - January 29, 1963"
const AUDIO_FILE = 'assets/snowy_evening.mp3'; // https://archive.org/details/robertfroststoppingbywoods
const HUM_FILE = 'assets/hum_a12.mp3';
const CLICK_FILE = 'assets/click.mp3';
const AUDIO_DURATION = 46; // seconds
const PROTECTED_RECT = vec2(85,6);

const FEATURE_POET_KEYER = true;
const POET_KEYER_KEYS = [
  'KeyF',
  'KeyR',
  'KeyO',
  'KeyS',
  'KeyT',
]
var nextPoetKeyerKeysIndex = 0;
var frostEggEnabled = FEATURE_POET_KEYER;

var audioTimer;
var atlas;
var f;
var snow;
var snow2;
var grid3;
var grid4;
var flake;
var fontImage;
var blackFontImage;
var mouseMedal, xMedal;
var featureBorderEnabled = true;
var snowgrid;
var currentPoemIndex;
var poemSecondsPerLine = 4;
var flakesPerSecond = 128;
var audioHasPlayed = false;
var lastY;
const fontMult = vec2(2/3, 1);

if (FEATURE_Medals) {
  setMedalDisplayTime(6);
  setMedalDisplaySlideTime(0.5);
  setMedalDisplaySize(vec2(640, 80));  // MUST BE vec2
  setMedalDisplayIconSize(50);
  setMedalsPreventUnlock(false);

  debugMedals = true;  // skips pulling medals from localStorage

  const medalId = 0;
  const medalName = 'Mouse Clicked'
  const medalDescription = 'You clicked the mouse'
  mouseMedal = new Medal(medalId, medalName, medalDescription);

  xMedal = new Medal(1, 'X Pressed', 'You pressed X', undefined, 'assets/smiley_128x128.png');

  medalsInit('Medal Init');
}

const SNOW_MEDAL_ID = 3;
const FROST_MEDAL_ID = 4;
const POETKEYER_MEDAL_ID = 5;
var snowMedal;
var frostMedal;
var poetkeyerMedal;

var frostImage;
const frostImageSize = vec2(504, 651);
const frostTileSize = frostImageSize.scale(0.15);

var ytIcon;
const ytIconImageSize = vec2(128, 128);
const ytIconTileSize = ytIconImageSize.scale(1/16);
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=j-Zcog5o_p0';

showWatermark = false

if (FEATURE_PoemSnow) {
  setMedalDisplayTime(6);
  setMedalDisplaySlideTime(0.5);
  setMedalDisplaySize(vec2(640, 80));  // MUST BE vec2
  setMedalDisplayIconSize(50);
  setMedalsPreventUnlock(false);

  debugMedals = false;  // skips pulling medals from localStorage

  const medalName = 'Frosty!'
  const medalDescription = 'You filled the screen with snow'
  snowMedal = new Medal(SNOW_MEDAL_ID, medalName, medalDescription);
  frostMedal = new Medal(FROST_MEDAL_ID, 'Robert Frost', 'You listened to On a Snowy Evening');
  poetkeyerMedal = new Medal(POETKEYER_MEDAL_ID, 'Poet Keyer!', "You typed the poet's last name");

  medalsInit('SnowyEvening');
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
  /*
  const pos = vec2();
  const tileLayer = new TileLayer(pos, tileCollisionSize);
  const tileImage0 = textureInfos[0].image;
  const tileImage1 = textureInfos[1].image;
  mainContext.drawImage(tileImage0,0,0);
  mainContext.drawImage(tileImage1,32,0);
  */
  //const data = new TileLayerData(1);
  //const imageData = mainContext.getImageData(0,0,tileImage.width,tileImage.height).data;
  //tileLayer.setData(0, data);
  //const data = new TileLayerData(1);
  //const imageData = mainContext.getImageData(0,0,tileImage.width,tileImage.height).data;
  //tileLayer.setData(0, data);

  atlas = {
    'x': tile(0),
    'o': tile(1),
  };

  if (GRIDXO_ENABLED) {
    flake = tile(vec2(0), FLAKE_SIZE)
    snow = new TileLayer(vec2(), PIXEL_RES)

    //const whiteFlakeTileData = new TileLayerData(undefined, undefined, undefined, WHITE)

    const xPos = vec2(3,4)
    const xTileData = new TileLayerData(0, 0, false, WHITE); // draws x
    snow.setData(xPos, xTileData)

    const oPos = vec2(3,5)
    const oTileData = new TileLayerData(1, 0, false, WHITE); // draws x
    snow.setData(oPos, oTileData)

    const flakePos = vec2(3,3)
    const whiteFlakeTileData = new TileLayerData(undefined, 0, false, WHITE); // draws x
    snow.setData(flakePos, whiteFlakeTileData)

    snow.redraw()
    snow.render()
  }

  if (GRID2_ENABLED) {
    // this does not work. you need a tile, undefined does not produce a rect
    snow2 = new TileLayer(vec2(), PIXEL_RES, tile(0, FLAKE_SIZE, TEXTURE_IDX_TRS80_FONT))
    const flakePos2 = vec2(2,2)
    const whiteFlakeTileData2 = new TileLayerData(2, 0, false, WHITE); // draws space white
    snow2.setData(flakePos2, whiteFlakeTileData2)
    snow2.redraw()
    snow2.render()
  }

  if (GRID3_ENABLED) {
    const TEXTURE_IDX_NULL = -1;
    const gridTileInfo = new TileInfo(vec2(), FLAKE_SIZE, TEXTURE_IDX_NULL, 0);
    grid3 = new TileLayer(vec2(), PIXEL_RES, gridTileInfo);
    grid3.name = 'grid3'
    const flakePos2 = vec2(5,3);
    const whiteFlakeTileData2 = new TileLayerData(undefined, 0, false, YELLOW); // draws space white
    grid3.setData(flakePos2, whiteFlakeTileData2)
    grid3.setData(vec2(1,0), new TileLayerData(undefined, 0, false, RED));
    grid3.redraw()
    grid3.render()
  }

  if (GRID_SAMPLE_ENABLED) {
    const pos = vec2();
    const tileLayer = new TileLayer(pos, tileCollisionSize);
    for (pos.x = tileCollisionSize.x; pos.x--;)
      for (pos.y = tileCollisionSize.y; pos.y--;) {
        const data = new TileLayerData(tileIndex, direction, mirror, color);
        tileLayer.setData(pos, data);
      }
  }

  if (GRID4_ENABLED) {
    const TEXTURE_IDX_NULL = -1;
    const gridTileInfo = new TileInfo(vec2(), FLAKE_SIZE, TEXTURE_IDX_NULL, 0);
    grid3 = new PixelGrid(vec2(), PIXEL_RES, gridTileInfo);
    grid3.name = 'PixelGrid'
    //grid3.setData(vec2(5,3), true)
    //grid3.setData(vec2(5,2), true)
    //grid3.setData(vec2(4,2), true)
    //grid3.setData(vec2(1,0), true);
    grid3.setData(vec2(31,0), true);

    const r = PIXEL_RES.x - 1
    const b = PIXEL_RES.y - 1

    grid3.setData(vec2(0, 0), true);
    grid3.setData(vec2(0, 1), true);
    grid3.setData(vec2(0, 2), true);
    grid3.setData(vec2(1, 0), true);
    grid3.setData(vec2(1, 1), true);
    grid3.setData(vec2(1, 2), true);

    grid3.setData(vec2(4, 0), true);
    grid3.setData(vec2(4, 1), true);
    grid3.setData(vec2(4, 2), true);
    grid3.setData(vec2(5, 0), true);
    grid3.setData(vec2(5, 1), true);
    grid3.setData(vec2(5, 2), true);

    grid3.setData(vec2(0, b), true);
    grid3.setData(vec2(1, b), true);
    grid3.setData(vec2(0, b-1), true);
    grid3.setData(vec2(r, 0), true);
    grid3.setData(vec2(r, 1), true);
    grid3.setData(vec2(r-1, 0), true);
    grid3.setData(vec2(r, b-1), true);
    grid3.setData(vec2(r, b-2), true);
    grid3.setData(vec2(r-1, b-1), true);

    grid3.redraw()
    grid3.render()
  }

  if (FEATURE_SNOWGRID) {
    // how do I ensure the blocks are the same size as the font?
    const TEXTURE_IDX_NULL = -1;
    const gridTileInfo = new TileInfo(vec2(), FLAKE_SIZE, TEXTURE_IDX_NULL, 0);
    const snowgridScale = vec2(3);  // font is 6 pixels, flakes are 3 pixels
    const snowgridSize  = screenToWorld(mainCanvasSize).multiply(vec2(2,3));    // size of the entire grid in flakes.
    console.log('mainCanvasSize:', mainCanvasSize)
    console.log('worldSize:', screenToWorld(mainCanvasSize))
    console.log('snowgridSize:', snowgridSize)
    var snowgridPos = vec2(0,-71)
    snowgrid = new PixelGrid(snowgridPos, PIXEL_RES, gridTileInfo, snowgridScale);
    snowgrid.name = 'SnowGrid'
    //grid3.setData(vec2(5,3), true)
    //grid3.setData(vec2(5,2), true)
    //grid3.setData(vec2(4,2), true)
    //grid3.setData(vec2(1,0), true);
    snowgrid.setData(vec2(31,0), true);

    const r = PIXEL_RES.x - 1
    const b = PIXEL_RES.y - 1

    snowgrid.setData(vec2(0, 0), true);
    snowgrid.setData(vec2(0, 1), true);
    snowgrid.setData(vec2(0, 2), true);
    snowgrid.setData(vec2(1, 0), true);
    snowgrid.setData(vec2(1, 1), true);
    snowgrid.setData(vec2(1, 2), true);

    snowgrid.setData(vec2(4, 0), true);
    snowgrid.setData(vec2(4, 1), true);
    snowgrid.setData(vec2(4, 2), true);
    snowgrid.setData(vec2(5, 0), true);
    snowgrid.setData(vec2(5, 1), true);
    snowgrid.setData(vec2(5, 2), true);

    snowgrid.setData(vec2(0, b), true);
    snowgrid.setData(vec2(1, b), true);
    snowgrid.setData(vec2(0, b-1), true);
    snowgrid.setData(vec2(r, 0), true);
    snowgrid.setData(vec2(r, 1), true);
    snowgrid.setData(vec2(r-1, 0), true);
    snowgrid.setData(vec2(r, b-1), true);
    snowgrid.setData(vec2(r, b-2), true);
    snowgrid.setData(vec2(r-1, b-1), true);

    snowgrid.redraw()
  }

  if (FEATURE_CAMERA) {
    cameraPos = vec2(128,80)
    cameraPos = PIXEL_RES.scale(0.5)
    cameraScale = 12;
  }

  if (FEATURE_FONT_TRS80 || FEATURE_FONT_TRS80_CORRECT_SIZE || FEATURE_Poem) {
    fontImage = new FontImage(textureInfos[1].image, vec2(6,8));  // pixels from image
    blackFontImage = new FontImage(textureInfos[BLACK_FONT_TEXTURE_IMAGE].image, vec2(6,8));  // pixels from image
  }

  if (FEATURE_Fullscreen && false)
     setCanvasMaxSize(vec2(4000));

  if (FEATURE_FONT_TRS80_CORRECT_SIZE || FEATURE_Border) {
    cameraScale = 4;
  }

  if (FEATURE_Poem) {
    cameraScale = 6;
  }

  if (FEATURE_SnowObjects) {
    const width = 3;
    const height = 8/3;
    const offset = vec2(width / 2, height / 3);
    const y = -8 * 8;
    for(var x = 0; x < 120; x += width * 2) {
      new Snowflake(vec2(x, y).add(offset));
      new Snowflake(vec2(x+3, y + 8/3).add(offset));
      new Snowflake(vec2(x, y + 8/3*2).add(offset));
    }

    new Snowflake(vec2(Snowflake.maxFlakeX(), Snowflake.maxFlakeY()))
    new Snowflake(vec2(Snowflake.maxFlakeX(), -Snowflake.maxFlakeY() - 1))
    new Snowflake(vec2(-Snowflake.maxFlakeX(), Snowflake.maxFlakeY()))
    new Snowflake(vec2(-Snowflake.maxFlakeX(), -Snowflake.maxFlakeY() - 1))
    console.log('max flakex', Snowflake.maxFlakeX())
    console.log('max flakey', Snowflake.maxFlakeY())
    console.log('world', Snowflake.worldPos(vec2(Snowflake.maxFlakeX(), Snowflake.maxFlakeY())));

/*
    const rows = mainCanvasSize.y / cameraScale / 6 - 2
    const cols = mainCanvasSize.x / cameraScale / 8 - 2
    for(var i = 0; i < 20; ++i) {
      const sx = randInt(-rows / 2, rows / 2)
      const sy = randInt(-cols / 2, cols / 2)
      const pos = vec2(sx * Snowflake.width, sy * Snowflake.height + Snowflake.height / 2);

      new Snowflake(pos)
    }
    */
  }

  if (FEATURE_Poem)
    currentPoemIndex = 0;

  if (FEATURE_PoemSnow) {
    const rows = mainCanvasSize.y / cameraScale / 8 - 2
    const topRow = rows / 2 + 1
    Snowflake.setTitleRect(new Rect(vec2(0, topRow * 2.8), vec2(100,6)));
    //Snowflake.setProtectedRect(new Rect(vec2(0, 1), PROTECTED_RECT));

    //setCanvasMaxSize(vec2(1400,1080));
  }

  if (FEATURE_Postprocess)
    setupPostProcess();


  if (FEATURE_Hum)
    playAudioFile(HUM_FILE, 1, true)
}

function x_randFlakePos(pos) { // move to class
  const rows = mainCanvasSize.y / cameraScale / 6 - 2
  const cols = mainCanvasSize.x / cameraScale / 8 - 2
  const sx = randInt(-rows / 2, rows / 2)
  const sy = randInt(-cols / 2, cols / 2)
  return vec2(sx, sy)
}

function flakeToWorld(pos) {
  const width = 3;
  const height = 8/3;
  const offset = vec2(width / 2, height / 3); // move to class
  return pos.add(offset)
}

var theFlake;

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    // called every frame at 60 frames per second
    // handle input and update the game state
    if (FEATURE_Medals && mouseWasPressed(2))  // 0=left, 1=middle, 2=right
      mouseMedal.unlock();
    if (FEATURE_Medals && keyWasPressed('KeyX'))
      xMedal.unlock();
    if (FEATURE_Fullscreen && keyWasPressed('KeyF'))
      toggleFullscreen()
    if (FEATURE_Fullscreen && keyWasPressed('KeyM'))
       setCanvasMaxSize(vec2(canvasMaxSize.x == 4000 ? vec2(1600,1080) : 4000));
    if (FEATURE_Border && keyWasPressed('KeyB'))
       featureBorderEnabled = !featureBorderEnabled;
    if (keyWasPressed('KeyV'))
       showWatermark = !showWatermark
    if (false && keyWasPressed('Numpad1'))
      saveCanvases = true
    if (FEATURE_SnowObjects && mouseWasPressed(1))  // 0=left, 1=middle, 2=right
      new Snowflake;

    if (FEATURE_FlakeTest) {
      if (mouseWasPressed(1))
        theFlake = new Snowflake
      if (keyWasPressed('KeyW')) theFlake.pos = theFlake.pos.add(vec2(0,1));
      if (keyWasPressed('KeyA')) theFlake.pos = theFlake.pos.add(vec2(-1,0));
      if (keyWasPressed('KeyS')) theFlake.pos = theFlake.pos.add(vec2(0,-1));
      if (keyWasPressed('KeyD')) theFlake.pos = theFlake.pos.add(vec2(1,0));
    }

    if (FEATURE_PoemSnow && mouseWasPressed(0) && Snowflake.isFilled() && !audioHasPlayed && isOverlapping(frostImage.pos, frostImage.size, mousePos)) {
      frostMedal.unlock();
      audioHasPlayed = true;
      playAudioFile(CLICK_FILE, 1, false);
      playAudioFile(AUDIO_FILE, 1, false);
      audioTimer = new Timer(AUDIO_DURATION);
    }

    if (FEATURE_PoemSnow && mouseWasPressed(0) && ytIcon && isOverlapping(ytIcon.pos, ytIcon.size, mousePos)) {
      playAudioFile(CLICK_FILE, 1, false);
      window.open(YOUTUBE_URL);
    }

    if (FEATURE_PoemSnow && audioTimer && audioTimer.elapsed()) {
      //const ytPos = screenToWorld(mainCanvasSize).subtract(vec2(ytIconTileSize.x + 8, -ytIconTileSize.y).multiply(fontMult));
      const ytPos = screenToWorld(mainCanvasSize).subtract(vec2(ytIconTileSize.x + 58, -ytIconTileSize.y));
      ytIcon = new EngineObject(ytPos, ytIconTileSize, tile(0, ytIconImageSize, YOUTUBE_ICON_TEXTURE_IMAGE, 0), 0, undefined, 1001);
      audioTimer = undefined;
    }

    if (FEATURE_POET_KEYER && frostEggEnabled) {
      //console.log(anyKeyWasPressed())
      if (keyWasPressed(POET_KEYER_KEYS[nextPoetKeyerKeysIndex])) {
        //console.log(`Pressed ${POET_KEYER_KEYS[nextPoetKeyerKeysIndex]}`)
        playAudioFile(CLICK_FILE, 1, false);
        if (++nextPoetKeyerKeysIndex >= POET_KEYER_KEYS.length) {
          frostEggEnabled = false;
          poetkeyerMedal.unlock();
          console.log('unlocked')
        }
      } else if (anyKeyWasPressed()) {
        console.log(`Reset keys d:${inputData[0]} length:${inputData[0].length} typeof:${typeof inputData[0]}`, inputData[0])
        nextPoetKeyerKeysIndex = 0;
      }
    }
}


// Coordinate systems
//   - screen                         (1900x1080)
//   - world (trs80 pixels)           (78x32)
//   - characters (trs80 char)
//   - trs80 blocks (1/6 trs80 block)

var ytIcon;

var saveCanvases = false

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    // called after physics and objects are updated
    // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
  // called before objects are rendered
  // draw any background effects that appear behind objects
  // drawTile(vec2(21,5), vec2(4.5), tile(3,128));

  //drawRect(cameraPos, vec2(100), new Color(.7,.7,.7));

//  drawTile(vec2(-20, 0), vec2(21), tile(1,32, 2));
//  drawTile(vec2(  0, 8), vec2(15), tile(1,32, 1));
//  drawTile(vec2(  0,-8), vec2(15), tile(1,32, 0));
  //f.drawText("TRS-80", vec2(1), 20, 'center')
  GRIDXO_ENABLED && snow.render();
  GRID2_ENABLED && snow2.render();

  FEATURE_OVERLAP && debugOverlap(vec2(0,0), vec2(1,1), vec2(5,0), vec2(1.5), '#ff0')

  FEATURE_DEBUG_POINT && debugPoint(vec2(1,1), '#f00');
  if (FEATURE_debugPoints) {
    debugPoint(vec2(-1,-1), '#f0f');  // negative world coordinates work fine
    debugPoint(vec2(0,0), '#0f0');
    debugPoint(vec2(1,1), '#ff0');
    debugPoint(vec2(0, -screenToWorld(mainCanvasSize).y), '#ff0');
  }

  if (FEATURE_worldSpace) {
    debugPoint(vec2(0,0), '#f00');
    debugPoint(vec2(16,16), '#0f0');
    debugPoint(vec2(-16,-16), '#00f');

    // upper-right of canvas (cameraScale 32, mainCanvasSize 1920x1080, aspect 1.77)
    //   max-x * aspect = max-y
    //   16.9  * 1.778  = 30.0
    debugPoint(vec2(30, 16.8), '#0ff');
    debugPoint(vec2(-30,-16.9), '#f0f'); // lower-left canvas (cameraScale 32)
  }

  // what is canvasFixedSize????
  if (FEATURE_responsiveWorldSpace) {
    debugPoint(vec2(0,0), '#f00');
    const x = mainCanvasSize.x / cameraScale / 2;
    const y = mainCanvasSize.y / cameraScale / 2;

    // upper-right of canvas (cameraScale 32, mainCanvasSize 1920x1080, aspect 1.77)
    //   max-x * aspect = max-y
    //   16.9  * 1.778  = 30.0
    debugPoint(vec2(x, y), '#0ff');
    debugPoint(vec2(-x,-y), '#f0f'); // lower-left canvas (cameraScale 32)

    debugLine(vec2(x,y).scale(0.98), vec2(-x,-y).scale(0.99), '#020', .05);
    debugRect(vec2(), vec2(-x,-y).scale(1.99), '#020', .025);

    // --------- modal -------------
    const modalCenter = vec2(0, 6);
    const modalWidth = 6
    const modalHeight = 3
    const titleCenter = modalCenter.add(vec2(0, 1.3));
    const titleBgCenter = titleCenter.add(vec2(0, 0.1));
    const titleHeight = 1;
    debugRect(modalCenter, vec2(modalWidth, modalHeight).scale(1.25), '#222', undefined, undefined, true)
    debugRect(modalCenter, vec2(modalWidth, modalHeight).scale(1.25), '#444', undefined, undefined, false)
    debugRect(titleBgCenter, vec2(modalWidth, titleHeight).scale(1.25), '#333', undefined, undefined, true)
    debugRect(titleBgCenter, vec2(modalWidth, titleHeight).scale(1.25), '#444', undefined, undefined, false)
    debugText(`World Coords`, titleCenter, 1, '#fff');
    debugText(`x: ${x}`, modalCenter.subtract(vec2(0,0)), 1, '#bbb');
    debugText(`y: ${y}`, modalCenter.subtract(vec2(0,1)), 1, '#bbb');
  }

  if (FEATURE_Border && featureBorderEnabled) {
    debugPoint(vec2(0,0), '#f00');
    const x = mainCanvasSize.x / cameraScale / 2;
    const y = mainCanvasSize.y / cameraScale / 2;

    // upper-right of canvas (cameraScale 32, mainCanvasSize 1920x1080, aspect 1.77)
    //   max-x * aspect = max-y
    //   16.9  * 1.778  = 30.0
    debugPoint(vec2(x, y), '#0ff');
    debugPoint(vec2(-x,-y), '#f0f'); // lower-left canvas (cameraScale 32)

    debugLine(vec2(x,y).scale(0.98), vec2(-x,-y).scale(0.99), '#020', .05);
    debugRect(vec2(), vec2(-x,-y).scale(1.99), '#020', .025);

    debugLine(vec2(0,y), vec2(0,-y), '#220', .05);
    debugLine(vec2(x,0), vec2(-x,0), '#220', .05);

    const font_size = 4

    // top left
    const tl = vec2(-x, y - font_size / 2);
    debugText(`${tl}`, tl, font_size, '#fff', 0, 0, 'monospace', 'left');
    const tl2 = tl.add(vec2(font_size/2, -font_size))
    debugText(`${tl2}`, tl2, font_size, '#777', 0, 0, 'monospace', 'left');

    // bottom left
    const bl = vec2(-x, -y + font_size / 2);  // adjustment because vertically centered
    debugText(`${bl}`, bl, font_size, '#fff', 0, 0, 'monospace', 'left');
    const bl2 = bl.add(vec2(font_size/2, font_size))
    debugText(`${bl2}`, bl2, font_size, '#777', 0, 0, 'monospace', 'left');

    // bottom right
    const br = vec2(x, -y + font_size / 2);
    debugText(`${br}`, br, font_size, '#fff', 0, 0, 'monospace', 'right');
    const br2 = br.add(vec2(-font_size/2, font_size))
    debugText(`${br2}`, br2, font_size, '#777', 0, 0, 'monospace', 'right');
  }
}

var poemIsDone = false;
///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // called after objects are rendered
    // draw effects or hud that appear above all objects
    //drawTextScreen('Hello jimu.net 4', mainCanvasSize.scale(.5).add(vec2(0,-320)), 100);
    FEATURE_drawText && drawText('Hello jimu.net 5', vec2(2,2));

    if (FEATURE_FONT_DEFAULT) {
      const font = new FontImage();
      font.drawTextScreen("DEF TRS-80", vec2(480, 150), 12);  // Default font
    }

    if (FEATURE_FONT_TRS80) {
      // the text coordinate system is neither related to the tile font size, nor my pixel TileGrid. why?
      // why is the font too big?
      fontImage.drawText("ABC TRS-80", vec2(0, 19), 0.5, true)
      fontImage.drawText( "ABC TRS-80", vec2(1, 15), 0.5, true)

      fontImage.drawText("X", vec2(2, 3), 0.45, false)
      fontImage.drawText("XXX", vec2(0, 6), 0.45, false)

      fontImage.drawText("0,0", vec2(0, 0), 1, true)
      fontImage.drawText("0,-8", vec2(0, -8), 1, true)
    }

    if (FEATURE_Poem) {
      const currentPoemIndex = Math.floor(time / poemSecondsPerLine) - 1;
      poemIsDone = currentPoemIndex >= POEM.length - 1;

      const rows = mainCanvasSize.y / cameraScale / 8 - 2
      const topRow = rows / 2 + 1
      const lineMult = 8; // from font size
      const topCenter = vec2(0, topRow * lineMult - 2)

      if (!Snowflake.isFilled()) {
        fontImage.drawTextMult(POEM_UPPERCASE? POEM_TITLE.toUpperCase() : POEM_TITLE, topCenter, fontMult, true)
        var y
        if (currentPoemIndex >= 0 && currentPoemIndex < 13) {
            y = 8;
            if (y != lastY) Snowflake.setProtectedRect(new Rect(vec2(0, 1), PROTECTED_RECT.add(vec2(10,0))));
            fontImage.drawTextMult(POEM[currentPoemIndex].toUpperCase(), vec2(0, 8), fontMult, true)
        } else if (currentPoemIndex == 13) {
            y = -2;
            if (y != lastY) Snowflake.setProtectedRect(new Rect(vec2(0, -3), PROTECTED_RECT));
            fontImage.drawTextMult(POEM[12].toUpperCase(), vec2(0,  8), fontMult, true)
            fontImage.drawTextMult(POEM[13].toUpperCase(), vec2(0, -2), fontMult, true)
        } else if (currentPoemIndex == 14) {
            y = -12;
            if (y != lastY) Snowflake.setProtectedRect(new Rect(vec2(0, -7), PROTECTED_RECT));
            fontImage.drawTextMult(POEM[12].toUpperCase(), vec2(0,   8), fontMult, true)
            fontImage.drawTextMult(POEM[13].toUpperCase(), vec2(0,  -2), fontMult, true)
            fontImage.drawTextMult(POEM[14].toUpperCase(), vec2(0, -12), fontMult, true)
        } else if (currentPoemIndex == 15) {
            y = -22;
            if (y != lastY) Snowflake.setProtectedRect(new Rect(vec2(0, -10), PROTECTED_RECT));
            fontImage.drawTextMult(POEM[12].toUpperCase(), vec2(0,   8), fontMult, true)
            fontImage.drawTextMult(POEM[13].toUpperCase(), vec2(0,  -2), fontMult, true)
            fontImage.drawTextMult(POEM[14].toUpperCase(), vec2(0, -12), fontMult, true)
            fontImage.drawTextMult(POEM[15].toUpperCase(), vec2(0, -22), fontMult, true)
        } else if (currentPoemIndex > 15) {
            if (y != lastY) Snowflake.setTitleRect();
            if (y != lastY) Snowflake.setProtectedRect();
            fontImage.drawTextMult(POEM[12].toUpperCase(), vec2(0,   8), fontMult, true)
            fontImage.drawTextMult(POEM[13].toUpperCase(), vec2(0,  -2), fontMult, true)
            fontImage.drawTextMult(POEM[14].toUpperCase(), vec2(0, -12), fontMult, true)
            fontImage.drawTextMult(POEM[15].toUpperCase(), vec2(0, -22), fontMult, true)
        }
        lastY = y;
      }
    }

    if (FEATURE_PoemSnow) {
      const rows = mainCanvasSize.y / cameraScale / 8 - 2
      const topRow = rows / 2 + 1
      const lineMult = 8; // from font size
      const topCenter = vec2(0, topRow * lineMult - 1)

      if (!Snowflake.isFilled() && time * flakesPerSecond > Snowflake.count && engineObjects.length < 12000) {
        var pos = Snowflake.randFlakePosUnique();
        if (pos) new Snowflake(pos);
      }

      if (Snowflake.isFilled()) {
        if (!frostImage) {
          snowMedal.unlock();
          frostImage = new EngineObject(vec2(), frostTileSize, tile(0, frostImageSize, FROST_TEXTURE_INDEX, 0), 0, undefined, 1001);
        }
        blackFontImage.drawTextMult(POEM_TITLE_END, vec2(0, 80), fontMult, true);
        blackFontImage.drawTextMult(OBIT, vec2(0, -55), fontMult, true);
      }
    }

    if (FEATURE_FONT_TRS80_CORRECT_SIZE) {
      cameraScale = 4;
      const lineMult = 8; // from font size
      const rowMult = 6;  // from font size
      const rows = mainCanvasSize.y / cameraScale / 8 - 2
      var cols = mainCanvasSize.x / cameraScale / 6 - 2  // only one pixel is drawn on bottom. top row missing entirely

      const topRow = rows / 2 + 1
      const bottomRow = -rows / 2

      fontImage.drawText("X",  vec2(0, lineMult * 3), 1, true)  // center breaks cell
      fontImage.drawText("XXXX",   vec2(0, lineMult * 2), 1, true)
      fontImage.drawText("XXYYXXXX", vec2(0,   8), 1, true)
      fontImage.drawText("00",   vec2(0,   0), 1, true) // vertically aligned with top
      fontImage.drawText("0,-8.", vec2(0,  -8), 1, true)
      fontImage.drawText("0,-16", vec2(0, -16), 1, true)

      var pos = vec2(0, -lineMult * 3)
      fontImage.drawText(`left-aligned ${pos}`, pos, 1, false);
      pos = vec2(rowMult * 1, -lineMult * 4)
      fontImage.drawText(`+1,-1 ${pos}`, pos, 1, false);

      var coord1 = vec2(-1, 5)
      const coordToWorld = vec2(rowMult, -lineMult)
      Coordinate.setScale(rowMult, -lineMult)
      pos = coord1.multiply(coordToWorld)
      fontImage.drawText(`coord ${coord1} ${pos}`, pos, 1, false);

      // top
      const topCenter = vec2(0, topRow * lineMult - 1)
      fontImage.drawText(`${topCenter} top?`, topCenter, 1, false);
      const top_center2 = vec2(0, (topRow - 1) * lineMult - 1)
      fontImage.drawText(`${top_center2}`, top_center2, 1, false);
      // bottom
      const bottom_center = vec2(0, bottomRow * lineMult)
      fontImage.drawText(`bottom ${bottom_center}`, bottom_center, 1, false);

      // display size
      var currentRow = 6
      pos = vec2(0, currentRow++).multiply(coordToWorld)
      fontImage.drawText(`size ${cols} X ${rows}`, pos, 1, false);

      // center, left, right coords
      var c = coord(0, currentRow);
      fontImage.drawText(`${c}`, c.toPos(), 1, false);
      c = coord(-cols/2, currentRow);
      fontImage.drawText(`${c}`, c.toPos(), 1, false);
      c = coord(cols/2 - c.toString().length + 1, currentRow++);
      fontImage.drawText(`${c}`, c.toPos(), 1, false);

      // show row
      const leftCol = -cols/2
      c = coord(leftCol, currentRow);
      const s1 = '12345678901234567890123456789012345678901234567890123456789012345678901234567890'
      const s2 = '         1         2         3         4         5         6         7         8'
      fontImage.drawText(s1, c.toPos(), 1, false);
      c = coord(leftCol, ++currentRow);
      fontImage.drawText(s2, c.toPos(), 1, false);
    }

    if (saveCanvases) {
      saveCanvases = false
      debugSaveCanvas(mainCanvas, 'mainCanvas.png')
      debugSaveCanvas(overlayCanvas, 'overlayCanvas.png')
    }
}

///////////////////////////////////////////////////////////////////////////////
// an example shader that can be used to apply a post processing effect
function setupPostProcess()
{
    const televisionShader = `
    // Simple TV Shader Code
    float hash(vec2 p)
    {
        p=fract(p*.3197);
        return fract(1.+sin(51.*p.x+73.*p.y)*13753.3);
    }
    float noise(vec2 p)
    {
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+1.),u.x),u.y);
    }
    void mainImage(out vec4 c, vec2 p)
    {
        // put uv in texture pixel space
        p /= iResolution.xy;

        // apply fuzz as horizontal offset
        const float fuzz = .0005;
        const float fuzzScale = 800.;
        const float fuzzSpeed = 9.;
        p.x += fuzz*(noise(vec2(p.y*fuzzScale, iTime*fuzzSpeed))*2.-1.);

        // init output color
        c = texture(iChannel0, p);

        // chromatic aberration
        const float chromatic = .002;
        c.r = texture(iChannel0, p - vec2(chromatic,0)).r;
        c.b = texture(iChannel0, p + vec2(chromatic,0)).b;

        // tv static noise
        const float staticNoise = .1;
        c += staticNoise * hash(p + mod(iTime, 1e3));

        // scan lines
        const float scanlineScale = 1e3;
        const float scanlineAlpha = .1;
        c *= 1. + scanlineAlpha*sin(p.y*scanlineScale);

        // black vignette around edges
        const float vignette = 2.;
        const float vignettePow = 6.;
        float dx = 2.*p.x-1., dy = 2.*p.y-1.;
        c *= 1.-pow((dx*dx + dy*dy)/vignette, vignettePow);
    }`;

    const includeOverlay = true;
    initPostProcess(televisionShader, includeOverlay);
}


///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, SPRITE_SHEETS);
