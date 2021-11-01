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

RoomPosition.prototype.toMemorableString = function () {
  return `${this.roomName}:${this.x}:${this.y}`
}

RoomPosition.fromMemorableString = function(string = '') {
  if (string.length == 0) {
    return
  }
  let matches = string.match(/^([EW]\d+[NS]\d+):(\d+):(\d+)$/i)
  if (matches === null) {
    return
  }
  return new RoomPosition(matches[2], matches[3], matches[1])
}

Object.defineProperties(RoomPosition.prototype, {
  onEdge: {
    get: function() {
      return this.x == 0 || this.y == 0 || this.x == 49 || this.y == 49
    },
    enumerable: false
  }
})
