'use strict'

class Upgrader extends WorkerCreep {
  static role() {
    return 'upgrader'
  }

  makeDecisions() {
    if (this.renewOrRecycle(this.roomManager.spawns()[0]) !== false) {
      return
    }

    if(this.memory.upgrading && this.creep.carry.energy == 0) {
      this.memory.upgrading = false;
    }
    if(!this.memory.upgrading && this.creep.carry.energy == this.creep.carryCapacity) {
      this.memory.upgrading = true;
    }

    this.placeRoadConstructions();
    if(this.memory.upgrading) {
      return this.upgrade()
    }

    if (this.collect() === false ) {
      if (!this.roomManager.isEconomyWorking() ) {
        return this.harvest()
      }
    }
  }

}

module.exports = Upgrader
