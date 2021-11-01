'use strict'

const Queue = require('lib_queue')

class RepairManager {
  constructor(room) {
    this.room = room
    this.repairables = new Queue(this._fetchRepairables(), 'randomizedPriority')
  }

  pop() {
    return this.repairables.pop()
  }

  push(repairable){
    this.repairables.push(repairable)
  }

  _fetchRepairables() {
    let cache = sos.lib.cache.getOrUpdate(`room.${this.room.name}.repairables`,
      function() {
        let structures = this.room.repairNeededStructures(0.75)
        let barriers = this.room.repairNeededBarriers()
        let combined = structures.concat(barriers)
        return _.map(combined, 'id')
      }.bind(this),
      { maxttl: 73, persist: true, refresh: false}
    )
    return _(cache).map((id) => Game.getObjectById(id)).
            filter((s) => s !== null && s.hits < s.hitsMax).
            map((s) => new Repairable(s)).value()
  }
}

class Repairable {
  constructor(structure) {
    this.structure = structure
    this.priority = this._calculatePriority()
  }

  randomizedPriority() {
    if (!this._randomizedPriority) {
      this._randomizedPriority = this.priority - this.hitsPercent() + Math.random()
    }
    return this._randomizedPriority
  }

  hitsPercent() {
    return this.structure.hits/this.structure.hitsMax
  }

  _calculatePriority() {
    if (this.structure.isRampart() && this.structure.hits < 600) {
      return REPAIR_PRIORITIES.Rotting_Rampart
    }

    if (this.structure.isBarrier()) {
      if (this.hitsPercent() < 0.005) {
        return REPAIR_PRIORITIES.Dying_Barrier
      }
      return REPAIR_PRIORITIES.Barrier
    }

    if (this.hitsPercent() < 0.05) {
      return REPAIR_PRIORITIES.Dying_Structure
    }
    return REPAIR_PRIORITIES.Structure
  }
}

module.exports = RepairManager
