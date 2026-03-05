/**
 * Office Pathfinder — A* pathfinding on collision map
 * Ported from pixel_office pathfinding.ts (simplified — zone/flow/accessibility removed)
 */

/* eslint-disable no-unused-vars */

var officePathfinder = {
  grid: [],
  gridW: 0,
  gridH: 0,

  async init(bgW, bgH) {
    var TILE = OFFICE.TILE_SIZE;
    var img = await loadOfficeImage('/public/office/map/office_collision.webp?t=' + Date.now());
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    this.gridW = Math.ceil(bgW / TILE);
    this.gridH = Math.ceil(bgH / TILE);

    var scaleX = canvas.width / bgW;
    var scaleY = canvas.height / bgH;

    this.grid = [];
    for (var gy = 0; gy < this.gridH; gy++) {
      this.grid[gy] = [];
      for (var gx = 0; gx < this.gridW; gx++) {
        var px = Math.floor((gx + 0.5) * TILE * scaleX);
        var py = Math.floor((gy + 0.5) * TILE * scaleY);
        var idx = (py * canvas.width + px) * 4;
        this.grid[gy][gx] = data[idx + 3] < 128; // transparent = walkable
      }
    }
    console.log('[OfficePathfinder] Grid: ' + this.gridW + 'x' + this.gridH);
  },

  isWalkable(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= this.gridW || gy >= this.gridH) return false;
    return this.grid[gy][gx];
  },

  findNearestWalkable(gx, gy) {
    for (var r = 1; r < 10; r++) {
      for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
          if (this.isWalkable(gx + dx, gy + dy)) return { x: gx + dx, y: gy + dy };
        }
      }
    }
    return { x: gx, y: gy };
  },

  findPath(startX, startY, endX, endY) {
    var TILE = OFFICE.TILE_SIZE;
    if (this.gridW === 0) return [{ x: endX, y: endY }];

    var sgx = Math.max(0, Math.min(this.gridW - 1, Math.floor(startX / TILE)));
    var sgy = Math.max(0, Math.min(this.gridH - 1, Math.floor(startY / TILE)));
    var egx = Math.max(0, Math.min(this.gridW - 1, Math.floor(endX / TILE)));
    var egy = Math.max(0, Math.min(this.gridH - 1, Math.floor(endY / TILE)));

    if (!this.isWalkable(sgx, sgy)) {
      var ns = this.findNearestWalkable(sgx, sgy);
      sgx = ns.x; sgy = ns.y;
    }
    if (!this.isWalkable(egx, egy)) {
      var ne = this.findNearestWalkable(egx, egy);
      egx = ne.x; egy = ne.y;
    }
    if (sgx === egx && sgy === egy) return [{ x: endX, y: endY }];

    // A* search
    var openSet = [];
    var closedSet = {};
    var h0 = Math.abs(sgx - egx) + Math.abs(sgy - egy);
    openSet.push({ x: sgx, y: sgy, g: 0, h: h0, f: h0, parent: null });

    var dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];

    while (openSet.length > 0) {
      openSet.sort(function (a, b) { return a.f - b.f; });
      var current = openSet.shift();
      var key = current.x + ',' + current.y;

      if (current.x === egx && current.y === egy) {
        // reconstruct
        var path = [];
        var node = current;
        while (node) {
          path.unshift({ x: node.x * TILE + 16, y: node.y * TILE + 16 });
          node = node.parent;
        }
        path.shift(); // remove start
        if (path.length > 0) {
          path[path.length - 1] = { x: endX, y: endY };
        }
        return path;
      }

      closedSet[key] = true;

      for (var i = 0; i < dirs.length; i++) {
        var dx = dirs[i][0], dy = dirs[i][1];
        var nx = current.x + dx, ny = current.y + dy;
        if (!this.isWalkable(nx, ny) || closedSet[nx + ',' + ny]) continue;

        var cost = (dx !== 0 && dy !== 0) ? 1.4 : 1;
        var g = current.g + cost;
        var h = Math.abs(nx - egx) + Math.abs(ny - egy);
        var f = g + h;

        var existing = null;
        for (var j = 0; j < openSet.length; j++) {
          if (openSet[j].x === nx && openSet[j].y === ny) { existing = openSet[j]; break; }
        }
        if (!existing) {
          openSet.push({ x: nx, y: ny, g: g, h: h, f: f, parent: current });
        } else if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      }

      if (Object.keys(closedSet).length > 2000) break;
    }

    return [{ x: endX, y: endY }];
  },
};
