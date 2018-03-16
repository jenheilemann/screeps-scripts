'use strict'

RoomPosition.prototype.toHash = function () {
  return { x: this.x, y: this.y, r: this.roomName }
}

RoomPosition.fromHash = function(hash = {}) {
  if (hash.x === undefined || hash.y === undefined || hash.r === undefined) {
    return
  }
  return new RoomPosition(hash.x, hash.y, hash.r)
}

Object.defineProperties(RoomPosition.prototype, {
  onEdge: {
    get: function() {
      return this.x == 0 || this.y == 0 || this.x == 49 || this.y == 49
    },
    enumerable: false
  }
})
