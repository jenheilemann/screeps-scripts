'use strict'

class CreepFactory {

  constructor(roomManager, role) {
    this.roomManager = roomManager
    this.role = role
  }

  buildCreep() {
    var spawn = this.roomManager.room.find(FIND_MY_SPAWNS)[0]

    if (spawn.spawning != null) {
      return false;
    }

    const klass = require(`roles_${this.role}`)
    var memory = klass.initializeMemory(this.roomManager)
    var name = this.role.substring(0,3) + this.roomManager.room.name + Game.time
    var parts = klass.orderParts(this.roomManager, memory)

    if (spawn.spawnCreep(parts, name, { memory: memory }) == OK) {
      return true
    }
    return false
  }
}

module.exports = CreepFactory
