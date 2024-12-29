'use strict';

const notes = [
  'mainCanvas is the sometimes smaller than browser window play area. Default: 1920x1080)',
  'FontImage.drawText',
];

// move stuff here like border when it becomes useful for reuse, like as a debugging tool

// accessors
//   setCameraPos()
//   setCameraScale
//   setCanvasMaxSize
//   setShowWatermark
//   setMedalDisplaySize
//   setMedalDisplayTime
//   setMedalDisplaySlideTime
//   setMedalDisplayIconSize
//   setMedalsPreventUnlock
//
//   setObjectMaxSpeed
//
//   setObjectDefaultMass
//

var funcs = []

function dotat(x,y) {
  funcs.push([drawDotAt, x, y])
}

function doJAUs() {
  funcs.forEach(([f,p1,p2]) => f(p1,p2));
}

// draws a square
// pos (0,0) is center of screen
// size 1 is tile size
function drawDotAt(x,y) {
  drawRect(vec2(x,y), vec2(1), RED);
}

function drawTRS80Font()
{
  throw 'huh'
  const image = textureInfos[1].image;
  f = new FontImage(image, vec2(6,8));
  f.drawText("ABC TRS-80", vec2(0, 15), 0.5, 'center')
  return f
}






class PixelGrid extends TileLayer
{
    constructor(position, size=tileCollisionSize, tileInfo=tile(), scale=vec2(1), renderOrder=0)
    {
        super(position, size, tileInfo, scale, renderOrder);
        this.data = Array(this.size.area()).fill(false)
    }

    setData(layerPos, value, redraw=false)
    {
        if (!layerPos.arrayCheck(this.size)) throw(`PixelGrid.setData bad pos ${layerPos}`);

        this.data[(layerPos.y | 0) * this.size.x + layerPos.x | 0] = value;
        redraw && this.drawTileData(layerPos);
    }

    drawTileData(layerPos, clear=true)
    {
        const tileSize = this.tileInfo.size;
        if (clear)
        {
            const pos = layerPos.multiply(tileSize);
            this.context.clearRect(pos.x, this.canvas.height - pos.y, tileSize.x, -tileSize.y);
        }

        // draw the tile if not undefined
        const value = this.getData(layerPos);
        if (value)
        {
            const pos = layerPos.add(vec2(.5));
            drawTile(pos, vec2(1), undefined, YELLOW);
        }
    }


    
}


//=============================================================================
class Coordinate extends Vector2 {
  static scale = vec2(1);

  toString() {
    return `[${this.x},${this.y}]`
  }

  static setScale(size, y) {
    return this.scale = y ? vec2(size, y) : size.copy() 
  }

  toPos() {
    return this.multiply(Coordinate.scale);
  }
}

function coord(x, y) {
  return new Coordinate(x, y);
}
//=============================================================================








// ensure no duplication
class Snowflake extends EngineObject
{
  // world units
  static SMALL_FLAKE = true;
  static width = Snowflake.SMALL_FLAKE ? 2 : 3;
  static height = 8.0 / 3;
  static size = vec2(Snowflake.width, Snowflake.height)
  static offset = vec2(Snowflake.width, Snowflake.height).scale(0.5)
  static multiplier = vec2(Snowflake.width, Snowflake.height)
  static color = new Color(0x00, 0xde/256, 0xff/256)
  static ids = {};
  static count = 0;
  static maxFlakes = 6864;
  static protectedRect;
  static titleRect;
  static maxTries = 100;

  constructor(spos=Snowflake.randFlakePos()) {
    super(Snowflake.worldPos(spos), Snowflake.size, undefined, 0, Snowflake.color, 1000)
    this.id = spos.y * 1000 + spos.x
    Snowflake.ids[this.id] = this;
    Snowflake.count++;
  }

  static setProtectedRect(rect) {
    if (!rect) {
      Snowflake.protectedRect = undefined
      return;
    }
    Snowflake.protectedRect = rect.copy();
    Snowflake.deleteInProtectedRect(rect)
  }

  static setTitleRect(rect) {
    if (!rect) {
      Snowflake.titleRect = undefined
      return;
    }
    Snowflake.titleRect = rect.copy();
    Snowflake.deleteInProtectedRect(rect)
  }

  static deleteInProtectedRect(rect) {
    var old = Snowflake.count;
    engineObjects.forEach( (o) => {
      if (o.id && isOverlapping(rect.pos, rect.size, Snowflake.flakePos(o.pos))) {
        delete Snowflake.ids[o.id];
        o.destroy();
        Snowflake.count--;
      }
    });
  }

  static inProtectedZoneSF(point) {
    if (Snowflake.titleRect && Snowflake.titleRect && isOverlapping(Snowflake.titleRect.pos, Snowflake.titleRect.size, point))
      return true;
    if (Snowflake.protectedRect && Snowflake.protectedRect && isOverlapping(Snowflake.protectedRect.pos, Snowflake.protectedRect.size, point))
      return true;
    return false;
  }

  static maxFlakeX() {
    return Math.floor(mainCanvasSize.x / cameraScale / 3 / 2) - 1
  }

  static maxFlakeY() {
    return Math.floor(mainCanvasSize.y / cameraScale / 8 * 3 / 2) - 1
  }

  static isFilled() {
    return Snowflake.count >= Snowflake.maxFlakes;
  }

  static randFlakePos() {
    const x = Snowflake.maxFlakeX();
    const y = Snowflake.maxFlakeY();
    return vec2(randInt(-x, x), randInt(-y - 1, y + 1));
  }

  static randFlakePosUnique() {
    for(var count = Snowflake.maxTries; --count;) {
      var spos = Snowflake.randFlakePos();
      //if (!Snowflake.ids[spos.y * 1000 + spos.x] && !Snowflake.inProtectedZoneSF(Snowflake.worldPos(spos))) // killzone takes spos???
      if (!Snowflake.ids[spos.y * 1000 + spos.x] && !Snowflake.inProtectedZoneSF(spos))
        return spos;
    }
    return null;
  }

  flakePos() {
    return Snowflake.flakePos(this.pos);
  }

  // returns the center of the flake in world coordinates (trs80 pixels)
  static worldPos(flakePos) {
    return flakePos.multiply(Snowflake.multiplier).add(Snowflake.offset);
  }

  // returns the center of the flake in world coordinates (trs80 pixels)
  static flakePos(worldPos) {
    return worldPos.subtract(Snowflake.offset).divide(Snowflake.multiplier)
  }
}

//-----------------------------------------------------------------------------
class Rect {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }

  copy() {
    return new Rect(this.pos.copy(), this.size.copy())
  }
}

function anyKeyWasPressed(device=0)
{ 
  if (!inputData[device])
    return false;

  var keys = Object.keys(inputData[device]);
  for (var i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if (key.substr(0,3) == 'Key' && inputData[device][key] & 2) 
      return true;
  }
  return false;
}

