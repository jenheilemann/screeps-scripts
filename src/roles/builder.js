'use strict'

class Builder extends WorkerCreep {
  static role() {
    return 'builder'
  }

  makeDecisions() {
    if(this.creep.memory.building && this.creep.carry.energy == 0) {
      this.creep.memory.building = false;
    }
    if(!this.creep.memory.building && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory.building = true;
    }

    if(this.creep.memory.building) {
      if (this.build() === false && this.repair() === false) {
        this.moveOffRoad()
      }
      return
    }

    if (this.collect() === false) {
      this.harvest()
    }
  }

}

module.exports = Builder
