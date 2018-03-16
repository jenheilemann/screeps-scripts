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

    this.launchChildProcess(`cleanup`, 'creep_tasks_cleanup', {
      cp: this.creep.name
    })

    this.room = Game.rooms[this.creep.memory.colony]
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)

    this.makeDecisions()
  }

  makeDecisions() {
    if (this.room.defcon.level > 0) {
      this.infanticide()
      this.hide()
      return this.sleep(Math.min(this.creep.ticksToLive, 13))
    }
    if (this.creep.isEmpty()) {
      if (this.collect() === false ) {
        if (!this.room.isEconomyWorking() ) {
          this.harvest()
        }
        this.sleep(Math.min(this.creep.ticksToLive, 5))
      }
      return
    }

    this.upgrade()
    this.sleep(Math.min(this.creep.ticksToLive, 5))
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
  }

  upgrade() {
    this.launchChildProcess(`creep_upgrade`, 'creep_tasks_upgrade', {
      cp: this.creep.name,
      id: this.room.controller.id
    })
  }

  hide() {
    this.launchChildProcess(`hide`, `creep_tasks_hunker`, {
      cp: this.creep.name
    })
  }
}

module.exports = Upgrader
