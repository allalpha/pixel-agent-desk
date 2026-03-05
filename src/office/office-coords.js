/**
 * Office Coords — Parse office_xy.webp and office_laptop.webp for coordinates
 * Ported from pixel_office coordinateParser.ts
 */

/* eslint-disable no-unused-vars */

var officeCoords = {
  idle: [],
  desk: [],
  laptopSpots: [],
};

async function parseMapCoordinates(bgW, bgH) {
  var img = await loadOfficeImage('/public/office/map/office_xy.webp?t=' + Date.now());
  var canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  var scaleX = bgW / canvas.width;
  var scaleY = bgH / canvas.height;

  var THRESHOLD = 80;
  var TILE = OFFICE.TILE_SIZE;
  var tempIdle = [];
  var tempDesk = [];
  var tempMeeting = [];
  var seenGrid = {};

  function colorMatch(r, g, b, tr, tg, tb) {
    return Math.abs(r - tr) < THRESHOLD && Math.abs(g - tg) < THRESHOLD && Math.abs(b - tb) < THRESHOLD;
  }

  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      var idx = (y * canvas.width + x) * 4;
      var r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a < 128) continue;

      var mapX = x * scaleX;
      var mapY = y * scaleY;
      var gx = Math.floor(mapX / TILE);
      var gy = Math.floor(mapY / TILE);
      var key = gx + ',' + gy;

      if (seenGrid[key]) continue;
      seenGrid[key] = true;

      var finalX = gx * TILE + 16;
      var finalY = gy * TILE + 32;

      if (colorMatch(r, g, b, 0, 255, 0) || colorMatch(r, g, b, 0, 0, 0)) {
        tempIdle.push({ x: finalX, y: finalY });
      } else if (colorMatch(r, g, b, 0, 0, 255)) {
        tempDesk.push({ x: finalX, y: finalY });
      } else if (colorMatch(r, g, b, 255, 255, 0)) {
        tempMeeting.push({ x: finalX, y: finalY });
      }
    }
  }

  var globalId = 0;
  officeCoords.desk = [];
  officeCoords.idle = [];

  tempDesk.forEach(function (p) {
    officeCoords.desk.push({ x: p.x, y: p.y, id: globalId++, type: 'desk' });
  });
  tempMeeting.forEach(function (p) {
    officeCoords.desk.push({ x: p.x, y: p.y, id: globalId++, type: 'meeting' });
  });
  tempIdle.forEach(function (p) {
    officeCoords.idle.push({ x: p.x, y: p.y, id: globalId++, type: 'idle' });
  });

  console.log('[OfficeCoords] Desks: ' + officeCoords.desk.length + ', Idle: ' + officeCoords.idle.length);
  return officeCoords;
}

async function parseObjectCoordinates(bgW, bgH) {
  var img = await loadOfficeImage('/public/office/ojects/office_laptop.webp?t=' + Date.now());
  var canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  var scaleX = bgW / canvas.width;
  var scaleY = bgH / canvas.height;

  var THRESHOLD = 80;
  var TILE = OFFICE.TILE_SIZE;
  var spots = [];
  var seenGrid = {};

  function colorMatch(r, g, b, tr, tg, tb) {
    return Math.abs(r - tr) < THRESHOLD && Math.abs(g - tg) < THRESHOLD && Math.abs(b - tb) < THRESHOLD;
  }

  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      var idx = (y * canvas.width + x) * 4;
      var r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a < 128) continue;

      var dir = null;
      if (colorMatch(r, g, b, 255, 128, 0)) dir = 'left';
      else if (colorMatch(r, g, b, 0, 255, 255)) dir = 'down';
      else if (colorMatch(r, g, b, 255, 0, 255)) dir = 'up';
      else if (colorMatch(r, g, b, 0, 0, 255)) dir = 'right';
      else continue;

      var mapX = x * scaleX;
      var mapY = y * scaleY;
      var gx = Math.floor(mapX / TILE);
      var gy = Math.floor(mapY / TILE);
      var key = gx + ',' + gy;
      if (seenGrid[key]) continue;
      seenGrid[key] = true;

      spots.push({ x: gx * TILE, y: gy * TILE, dir: dir });
    }
  }

  console.log('[OfficeCoords] Laptops: ' + spots.length);
  officeCoords.laptopSpots = spots;
  return spots;
}
