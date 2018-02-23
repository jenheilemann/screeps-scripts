'use strict'

class CreepFactory {

  constructor(roomManager, role, spawn) {
    this.roomManager = roomManager
    this.role = role
    this.spawn = spawn
  }

  buildCreep() {
    if (this.spawn.spawning != null) {
      return false;
    }

    const klass = require(`roles_${this.role}`)
    var memory = klass.initializeMemory(this.roomManager)
    var name = this.role.substring(0,3) + this.roomManager.room.name + Game.time
    var parts = klass.orderParts(this.roomManager, memory)
    var result = this.spawn.spawnCreep(parts, name, { memory: memory })

    if (result == OK) {
      console.log('Spawning creep: ', this.role, name )
      return true
    }
    return false
  }
}

module.exports = CreepFactory
