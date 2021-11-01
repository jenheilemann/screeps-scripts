'use strict'
const BaseRole = require(`roles_base`)

class Scout extends BaseRole {
  static role() {
    return 'scout'
  }

  static orderParts(room, memory) {
    return [MOVE]
  }

  static initializeMemory(room) {
    return {
      role: this.role(),
      colony: room.name
    }
  }

  // static goalPopulation(colony) {
  //   return 1
  // }
}

module.exports = Scout
