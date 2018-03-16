'use strict'

/**
 * Tells Builder creeps what to do.
 */

class Builder extends kernel.process {
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
      cp: this.creep.name,
      r:  false
    })

    this.room = Game.rooms[this.creep.memory.colony]
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)

    this.makeDecisions()
  }

  makeDecisions() {
    if (this.creep.isEmpty()) {
      this.getEnergy()
      return
    }

    this.buildAndRepair()
  }

  buildAndRepair() {
    if (this.repair(this.room.rottingRamparts()) === true) {
      return this.sleep(19)
    }
    if (this.build() === true) {
      return this.sleep(19)
    }

    if (this.repair(this.room.repairNeededStructures(0.95)) === true) {
      return this.sleep(19)
    }
    if (this.repair(this.room.repairNeededBarriers()) === true) {
      return this.sleep(19)
    }
    return this.park()
  }

  repair(structures, label) {
    // No repairable structures found
    if (structures.length == 0) {
      return false
    }

    var repairable = _.min(structures,
      (s) => Math.floor(s.hits/s.hitsMax * 15) + Math.random()*0.01
    )

    if(repairable) {
      this.creep.memory.parking = false
      this.killChild('repair_struture')
      this.killChild('build_struture')
      this.launchChildProcess(`repair_struture`, 'creep_tasks_repair', {
        cp:     this.data.creep,
        target: repairable.id,
      })
      return true
    }
    return false
  }

  build() {
    var targets = this.room.constructionSites
    var nonRoad = targets.filter((c) => c.structureType != STRUCTURE_ROAD)

    // build non-road stuff, probably more important
    if(nonRoad.length > 0) {
      this.creep.memory.parking = false
      this.killChild('repair_struture')
      this.launchChildProcess(`build_struture`, 'creep_tasks_build', {
        cp:   this.data.creep,
        site: nonRoad[0].id,
      })
      return true
    }

    // build roads
    var roads = targets.filter((c) => c.structureType == STRUCTURE_ROAD)
    if(roads.length > 0) {
      this.creep.memory.parking = false
      this.killChild('repair_struture')
      this.launchChildProcess(`build_road`, 'creep_tasks_build', {
        cp:   this.data.creep,
        site: roads[0].id,
      })
      return true
    }
    return false
  }

  getEnergy() {
    var dropped = _.first(this.room.droppedEnergy())
    this.creep.memory.parking = false
    if (this._canArriveInTime(dropped) && dropped.amount > this.container.store.energy) {
      this.sleep(this.creep.ticksToLive)
      return this.gatherDropped(dropped)
    }

    if (this.collect() === true) {
      this.sleep(this.creep.ticksToLive)
      return
    }

    if (this._canArriveInTime(dropped) ) {
      this.sleep(this.creep.ticksToLive)
      return this.gatherDropped(dropped)
    }

    if (!this.room.isEconomyWorking() ) {
      this.sleep(this.creep.ticksToLive)
      return this.harvest()
    }

    this.park()
  }

  harvest() {
    this.launchChildProcess(`harvest_energy`, 'creep_tasks_harvest', {
      cp:  this.data.creep,
      src: this.source.id,
    })
  }

  collect() {
    var container = this.container
    if (!container || container.store.energy < this.creep.carryCapacity) {
      return false
    }

    this.launchChildProcess(`collect_from_container`, 'creep_tasks_fill_creep', {
      cp:       this.creep.name,
      from:     container.id,
      resource: RESOURCE_ENERGY
    })
    return true
  }

  gatherDropped(resource) {
    this.launchChildProcess(`pickup_resources`, 'creep_tasks_pickup', {
      cp:      this.creep.name,
      target:  resource.id
    })
  }

  park() {
    if (!this.creep.memory.parking) {
      this.launchChildProcess(`park`, 'creep_tasks_park', {
        cp: this.creep.name
      })
    }
    this.creep.say(`🚬`)
  }

  _canArriveInTime(resource) {
    return resource && resource.ticksToFullyDecay() > this.creep.pos.getRangeTo(resource)
  }
}

module.exports = Builder
