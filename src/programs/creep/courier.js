'use strict'

/**
 * Tells Courier creeps what to do.
 */

class Courier extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    this.launchChildProcess(`cleanup`, 'creep_tasks_cleanup', {
      cp: this.creep.name,
      r:  true
    })

    this.room = Game.rooms[this.creep.memory.colony]
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)

    this.makeDecisions()
  }

  makeDecisions() {
    if (this.creep.isEmpty()) {
      if (this.getEnergy() === true) {
        this.creep.memory.parking = false
        this.killChild('park')
        return this.sleep(this.creep.ticksToLive)
      }
      return this.park()
    }

    if (this.deliverEnergy() === true){
      this.creep.memory.parking = false
      this.killChild('park')
      this.sleep(this.creep.ticksToLive)
      return
    }

    if (this.deliverResources() === true) {
      this.creep.memory.parking = false
      this.killChild('park')
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

    if (this.collectAny() === true) {
      return true
    }

    if (this._canArriveInTime(dropped) ) {
      return this.gatherDropped(dropped)
    }
    return false
  }

  gatherDropped(resource) {
    this.launchChildProcess(`pickup_resources`, 'creep_tasks_pickup', {
      cp:      this.creep.name,
      target:  resource.id
    })
    return true
  }

  _canArriveInTime(resource) {
    return resource && resource.ticksToFullyDecay() > this.creep.pos.getRangeTo(resource)
  }

  collectAny() {
    var container = this.container
    if (!container || container.store.energy < 50) {
      container = _.max(this.room.sourceContainers, (c) => c.store.energy )
      if (!container || container.store.energy < 50) {
        return false
      }
    }

    this.launchChildProcess(`collect_from_container`, 'creep_tasks_fill_creep', {
      cp:   this.creep.name,
      from: container.id,
      resource: RESOURCE_ENERGY
    })
    return true
  }

  deliverEnergy() {
    if (this.creep.carry.energy === 0) {
      return false
    }

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
    if (this.refillTowers(0.91) !== false ) {
      return true
    }
    if (this.refillStorage() !== false ) {
      return true
    }
    return false
  }

  deliverResources() {
    if (this.creep.isEmpty() || _.sum(this.creep.carry) === this.creep.carry.energy ) {
      return false
    }

    let storage = this.room.storage

    if (!storage) {
      return false
    }

    this.launchChildProcess(`refill`, 'creep_tasks_fill_object', {
      cp: this.creep.name,
      to: storage.id,
      resource: _.last(Object.keys(this.creep.carry))
    })
    return true
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

    if (!container || container.isFull() || container.store.energy > 1600) {
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
        available >= this.container.storeCapacity) {
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
    if (!this.creep.memory.parking) {
      this.launchChildProcess(`park`, 'creep_tasks_park', {
        cp: this.creep.name
      })
    }
    this.creep.say(`🚬`)
  }
}

module.exports = Courier
