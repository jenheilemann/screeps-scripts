'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class CleanUp extends BaseTask {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_CREEP_CLEAN
  }

  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.isFull()) {
      return this.sleep(7)
    }

    let resource = this.findResource()
    if ( resource ) {
      this.creep.pickup(resource)
      if (resource.amount >= this.creep.trunkSpace) {
        this.wakeParent()
        return this.sleep(7)
      }
      return this.sleep(3)
    }

    let tombstone = this.findTombstone()
    if ( tombstone ) {
      let rType = this.data.r ? _.last(Object.keys(tombstone.store)) : RESOURCE_ENERGY
      this.creep.withdraw(tombstone, rType)
      if (tombstone.store[rType] >= this.creep.trunkSpace) {
        this.wakeParent()
        return this.sleep(7)
      }
      return this.sleep(3)
    }

    this.sleep(3)
  }

  findResource() {
    let pos = this.creep.pos
    let resources = this.creep.room.lookForAtArea(LOOK_RESOURCES,pos.y-1,pos.x-1,pos.y+1,pos.x+1, true)

    if (resources.length > 0) {
      return resources[0].resource
    }
    return false
  }

  findTombstone() {
    if (typeof(LOOK_TOMBSTONES) === 'undefined') {
      return false
    }
    let pos = this.creep.pos
    let tombstones = this.creep.room.lookForAtArea(LOOK_TOMBSTONES,pos.y-1,pos.x-1,pos.y+1,pos.x+1, true)

    if (tombstones.length > 0 && _.sum(tombstones[0].tombstone.store) > 0) {
      return tombstones[0].tombstone
    }
    return false
  }
}


module.exports = CleanUp
