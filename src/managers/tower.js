'use strict'

const TowerRole = require('roles_tower')

class TowerManager {
  constructor(roomManager) {
    this.roomManager = roomManager
  }

  run() {
    var towers = this.roomManager.towers()

    for (var i in towers){
      new TowerRole(towers[i], this.roomManager).run()
    }
  }
}

module.exports = TowerManager
