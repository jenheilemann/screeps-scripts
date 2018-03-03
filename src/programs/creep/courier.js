'use strict'

/**
 * Tells Courier creeps what to do.
 */

class Courier extends kernel.process {
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
  }

  makeDecisions() {
    if (this.creep.isEmpty()) {
      this.creep.memory.parking = false
      this.getEnergy()
      this.sleep(this.creep.ticksToLive)
      return
    }

    if (this.deliverEnergy() !== false){
      this.creep.memory.parking = false
      this.sleep(this.creep.ticksToLive)
      return
    }
    this.park()
  }

  getEnergy() {
    var dropped = _.first(this.room.droppedEnergy())
    if (this._canArriveInTime(dropped) && dropped.amount > this.container.store.energy) {
      return this.gatherDropped(dropped)
    }

    if (this.collectAny() !== false) {
      return
    }

    if (this._canArriveInTime(dropped) ) {
      return this.gatherDropped(dropped)
    }
  }

  gatherDropped(resource) {
    this.launchChildProcess(`pickup_resources`, 'creep_tasks_pickup', {
      cp:      this.creep.name,
      target:  resource.id
    })
  }

  _canArriveInTime(resource) {
    return resource && resource.ticksToFullyDecay() > this.creep.pos.getRangeTo(resource)
  }

  collectAny() {
    var container = this.container
    if (!container || container.store.energy < 50) {
      container = _.max(this.room.containers, (c) => c.store.energy )
      if (!container || container.store.energy < 50) {
        return false
      }
    }

    this.launchChildProcess(`collect_from_container`, 'creep_tasks_fill_creep', {
      cp:   this.creep.name,
      from: container.id,
      resource: RESOURCE_ENERGY
    })
  }

  deliverEnergy() {
    // prioritize towers in emergencies!
    if (this.room.defcon.level > 0 && this.refillTowers(0.8) !== false ) {
      return true
    }

    if (this.refillSpawns() !== false){
      return true
    }
    if (this.refillTowers(0.25) !== false ) {
      return true
    }
    if (this.refillOpenContainers() !== false ) {
      return true
    }
    if (this.refillTowers(1) !== false ) {
      return true
    }
    if (this.refillStorage() !== false ) {
      return true
    }
    return false
  }

  refillSpawns() {
    var addressee = this._findHungryDotOrSpawn()
    if (!addressee) {
      return false
    }
    return this._refill(addressee)
  }

  _findHungryDotOrSpawn() {
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

  refillOpenContainers() {
    if (this.room.openContainers.length === 0) {
      return false
    }

    var container = _.min(this.room.openContainers, (c) => _.sum(c.store))

    if (!container || container.isFull()) {
      return false
    }
    return this._refill(container)
  }

  refillTowers(percent) {
    var towers = this.room.towers.filter((t) => t.energy/t.energyCapacity < percent)

    if (towers.length === 0) {
      return false
    }
    return this._refill(_.min(towers, 'energy'))
  }

  refillStorage() {
    var storage = this.room.storage
    if (!storage || storage.isFull()) {
      return false
    }

    var available = this.container.store.energy
    if (available >= this.creep.carryCapacity*2 ||
        available > this.container.storeCapacity) {
      return this._refill(storage)
    }
    return false
  }

  _refill(target){
    this.launchChildProcess(`refill`, 'creep_tasks_fill_object', {
      cp: this.creep.name,
      to: target.id,
      resource: RESOURCE_ENERGY
    })
  }

  park() {
    var parkingSpot
    if (!this.creep.memory.parking) {
      this.launchChildProcess(`park`, 'creep_tasks_park', {
        cp: this.creep.name
      })
    }
    this.creep.say(`🚬`)
  }
}

module.exports = Courier
