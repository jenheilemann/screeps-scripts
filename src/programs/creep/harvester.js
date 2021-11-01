'use strict'

/**
 * Tells harvester creeps what to do.
 */

class Harvester extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    this.room = Game.rooms[this.creep.memory.colony]
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = this.source.container()
    this.memory = this.creep.memory

    this.makeDecisions()
    this.sleep(this.creep.ticksToLive)
  }

  makeDecisions() {
    if(!this.creep.canCarry()) {
      return this.harvest(true)
    }

    if(this.creep.isEmpty()) {
      var numCouriers = this.room.creepsByRole('courier').length
      var overContainer = numCouriers > 0 && !this.container.isNull()
      return this.harvest(overContainer)
    }

    if (this.refillSpawns() === false){
      this.upgrade()
    }
  }

  harvest(toContainer = false) {
    this.launchChildProcess(`farm`, 'creep_tasks_farm', {
      cp:  this.creep.name,
      cn:  this.container.id,
      src: this.source.id,
      toC: toContainer
    })
  }

  refillSpawns() {
    var addressee = this.findHungryDotOrSpawn()
    if (!addressee) {
      return false
    }
    this.launchChildProcess(`refill_spawn`, 'creep_tasks_fill_object', {
      cp: this.creep.name,
      to: addressee.id,
      resource: RESOURCE_ENERGY
    })
  }

  findHungryDotOrSpawn() {
    var dot = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_EXTENSION && !s.isFull() && s.isActive()
    })
    if (dot) {
      return dot
    }

    var spawn = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_SPAWN && !s.isFull() && s.isActive()
    })
    return spawn
  }

  upgrade() {
    this.launchChildProcess(`upgrade`, 'creep_tasks_upgrade', {
      cp: this.creep.name,
      id: this.room.controller.id
    })
  }
}

module.exports = Harvester
