'use strict'

class CreepManager {
  constructor(roomManager) {
    this.roomManager = roomManager
  }

  run() {
    var creeps = this.roomManager.creeps()
    var creep, role, klass, runner

    for (var i in creeps){
      creep = creeps[i]
      role = creep.memory.role
      klass = require(`roles_${role}`)

      runner = new klass(creep, this.roomManager)
      runner.makeDecisions();
    }
  }
}

module.exports = CreepManager
