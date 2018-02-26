'use strict'

// Memory.territory

Room.getColonies = function () {
  // When respawning the first room has to be autodetected, after which
  // new colonies will need to added.
  if (!Memory.territory || Object.keys(Memory.territory).length <= 0) {
    Memory.territory = {}
    for (let roomName of Object.keys(Game.rooms)) {
      const room = Game.rooms[roomName]
      if (room.controller && room.controller.my) {
        Memory.territory[roomName] = {}
      }
    }
  }
  return Object.keys(Memory.territory)
}

Room.addColony = function (roomName) {
  if (!Memory.territory[roomName]) {
    const mineOwner = Room.getMineOwner(roomName)
    if (mineOwner && Game.rooms[mineOwner]) {
      Game.rooms[mineOwner].removeMine(roomName)
    }
    Memory.territory[roomName] = {}
    Logger.log(`Adding colony ${roomName}`)
  }
}

Room.removeColony = function (roomName) {
  if (Memory.territory && Memory.territory[roomName]) {
    delete Memory.territory[roomName]
    Logger.log(`Removing colony ${roomName}`)
  }
}
