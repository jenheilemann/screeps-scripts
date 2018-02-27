'use strict'

RoomPosition.prototype.toHash = function () {
  return { x: this.x, y: this.y, r: this.roomName }
}
