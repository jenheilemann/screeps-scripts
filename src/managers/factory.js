'use strict'

class CreepFactory {

  constructor(room, role, spawn) {
    this.room = room
    this.role = role
    this.spawn = spawn
  }

  buildCreep() {
    if (this.spawn.spawning != null) {
      return false;
    }

    const klass = require(`roles_${this.role}`)
    var memory = klass.initializeMemory(this.room)
    var name = this.role.substring(0,3) + this.room.name + Game.time
    var parts = klass.orderParts(this.room, memory)
    var result = this.spawn.spawnCreep(parts, name, { memory: memory })

    if (result == OK) {
      console.log('Spawning creep: ', this.role, name )
      return true
    }
    return false
  }
}

module.exports = CreepFactory