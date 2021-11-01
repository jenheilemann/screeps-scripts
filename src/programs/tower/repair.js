
'use strict'

/**
 * Chooses which structures the tower should repair.
 */

class Repair extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_DEFENSE
  }

  main () {
    this.room = Game.rooms[this.data.room]
    if (!this.room) {
      this.suicide()
      return
    }

    this.repairManager = this.room.repairManager
    let towers = this.room.towers
    let repairable
    for(let i in towers) {
      repairable = this.repairManager.pop()
      if (!repairable) {
        return this.sleep(13)
      }
      this.attemptRepair(towers[i], repairable)
    }
    this.sleep(13)
  }

  attemptRepair(tower, repairable) {
    console.log(repairable.priority, repairable.structure.structureType, repairable.structure.hits)

    if (repairable.priority >= REPAIR_PRIORITIES.Rotting_Rampart) {
      return this.repair(tower, repairable)
    }

    if (tower.energy/tower.energyCapacity < 0.5) {
      return this._reset(tower, repairable)
    }

    if (repairable.priority >= REPAIR_PRIORITIES.Dying_Barrier) {
      return this.repair(tower, repairable)
    }

    if (tower.energy/tower.energyCapacity < 0.8) {
      return this._reset(tower, repairable)
    }

    if (repairable.priority >= REPAIR_PRIORITIES.Structure) {
      return this.repair(tower, repairable)
    }

    if (tower.energy/tower.energyCapacity < 0.95) {
      return this._reset(tower, repairable)
    }

    this.repair(tower, repairable)
    this.sleep(5)
  }

  repair(tower, repairable) {
    if (repairable.structure.id !== this.data[tower.id]) {
      // reset the old repair process, since it won't delete automatically
      this.killChild(`repair_${tower.id}_${this.data[tower.id]}`)
    }
    this.data[tower.id] = repairable.structure.id
    this.launchChildProcess(`repair_${tower.id}_${this.data.sid}`, `tower_repair_structure`, {
      tower:  tower.id,
      repair: repairable.structure.id
    })
  }

  _reset(tower, repairable) {
    // save for emergencies
    this.repairManager.push(repairable)
    // reset the repair process, since it won't delete automatically
    this.killChild(`repair_${tower.id}_${this.data[tower.id]}`)
    delete this.data[tower.id]
  }
}

module.exports = Repair
