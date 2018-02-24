'use strict'

class Tower {
  constructor(tower, roomManager) {
    this.tower = tower
    this.roomManager = roomManager
    this.memory = this._initializeMemory()
  }

  run() {
    var enemies = this.roomManager.enemies()
    var creeps = this.roomManager.creeps()
    var hurt = _.min(creeps, (c) => c.hits/c.hitsMax)

    if (enemies.length > 0) {
      return this.tower.attack(_.min(enemies, 'hits'))
    }

    if (creeps.length > 0 && hurt !== null && hurt.hits < hurt.hitsMax) {
      console.log('healing hurt:', hurt)
      return this.tower.heal(hurt)
    }

    if (this.repair(this.roomManager.rottingRamparts()) !== false) {
      return
    }
    if (this.repair(this.roomManager.repairNeededStructures(0.05)) !== false) {
      return
    }
    if (this.repair(this.roomManager.repairNeededBarriers(0.01)) !== false) {
      return
    }

    if (this.tower.energy/this.tower.energyCapacity < 0.5) {
      // save for emergencies
      return
    }

    if (this.repair(this.roomManager.repairNeededStructures(0.95)) !== false) {
      return
    }
    if (this.repair(this.roomManager.repairNeededBarriers()) !== false) {
      return
    }
  }

  repair(structures) {
    var repairable

    // No repairable structures found
    if (structures.length === 0) {
      return false
    }

    if (this.memory.repairable && Game.time - this.memory.repairStarted < 5) {
      repairable = Game.getObjectById(this.memory.repairable)
      // something got destroyed, probably
      if (!repairable) {
        delete this.memory.repairable
      }

      // it doesn't need repairing any more
      // or something more urgent needs repair
      if (repairable.hits/repairable.hitsMax > 0.98 ||
        !structures.includes(repairable)) {
        repairable = null
        delete this.memory.repairable
      }
    }

    if (!repairable) {
      repairable = _.min(structures,
        (s) => Math.floor(s.hits/s.hitsMax * 15) + Math.random()*0.01
      );
      this.memory.repairable = repairable.id
      this.memory.repairStarted = Game.time
    }

    if(repairable) {
      this.tower.repair(repairable)
      return true
    }
    return false
  }

  _initializeMemory() {
    if (!Memory.towers) {
      Memory.towers = {}
    }

    if (!Memory.towers[this.tower.id]) {
      Memory.towers[this.tower.id] = {
        repairStarted: 0
      }
    }

    return Memory.towers[this.tower.id]
  }
}

module.exports = Tower
