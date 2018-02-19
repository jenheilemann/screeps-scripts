'use strict'

// The fixer. Repairbot. Mr. Handy. The Clamps.
// Makes sure the roads don't rot away.

class HandyBot extends WorkerCreep {
  static role() {
    return 'handybot'
  }

  makeDecisions() {
    if(this.creep.carry.energy == 0) {
      this.memory.repairing = false;
    }
    if(!this.memory.repairing && this.creep.carry.energy == this.creep.carryCapacity) {
      this.memory.repairing = true;
    }

    if(this.memory.repairing) {
      if (this.repair() === false) {
        this.moveOffRoad()
      }
      return
    }

    if (this.collect() === false){
      this.harvest()
    }
  }

}

module.exports = HandyBot
