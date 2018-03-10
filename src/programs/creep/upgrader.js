'use strict'

/**
 * Tells Upgrader creeps what to do.
 */

class Upgrader extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.creep]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    this.room = Game.rooms[this.creep.memory.colony]
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)

    this.makeDecisions()
    this.sleep(this.creep.ticksToLive)
  }

  makeDecisions() {
    if (this.creep.isEmpty()) {
      if (this.collect() === false ) {
        if (!this.room.isEconomyWorking() ) {
          return this.harvest()
        }
      }
      return
    }

    this.upgrade()
  }

  collect() {
    if (!this.container || this.container.store[RESOURCE_ENERGY] < this.creep.trunkSpace) {
      return false
    }

    this.launchChildProcess(`collect_from_container`, 'creep_tasks_fill_creep', {
      cp:   this.creep.name,
      from: this.container.id,
      resource: RESOURCE_ENERGY
    })
  }

  harvest() {
    this.launchChildProcess(`harvest_energy`, 'creep_tasks_harvest', {
      cp:  this.data.creep,
      src: this.source.id,
    })
    var sleepFor = creep.carryCapacity == 0 ? creep.ticksToLive : creep.ticksToFull
    return this.sleep(sleepFor)
  }

  upgrade() {
    this.launchChildProcess(`creep_upgrade`, 'creep_tasks_upgrade', {
      cp: this.creep.name,
      id: this.room.controller.id
    })
  }
}

module.exports = Upgrader
