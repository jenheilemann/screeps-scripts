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
    let memory = klass.initializeMemory(this.room)
    let parts = klass.orderParts(this.room, memory)
    let name = this.generateName()
    let result = this.spawn.spawnCreep(parts, name, { memory: memory })

    if (result == OK) {
      console.log('Spawning creep: ', this.role, name )
      return true
    }
    return false
  }

  generateName() {
    return `${this.role.substring(0,3)}-${(Game.time % 10000).toString(36)}`
  }
}

module.exports = CreepFactory
