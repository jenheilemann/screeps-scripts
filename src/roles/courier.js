'use strict'
const BaseRole = require(`roles_base`)

class Courier extends BaseRole {
  static role() {
    return 'courier'
  }

  static orderParts(room, memory) {
    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    let numBlock = this._numPartsBlocks(room, memory)
    let partsBlock = [CARRY, CARRY, MOVE]
    let parts = []
    for (let i = numBlock - 1; i >= 0; i--) {
      parts = parts.concat(partsBlock)
    }

    return parts
  }

  static goalPopulation(room) {
    let source = this._findSourceWithOpenSpot(room)
    let neededCapacity = this._carryPerSource(room, source)
    let buildableCapacity = this._howBigCanThisTruckGet(room)
    let couriers = room.creepsByRole('courier')

    if (neededCapacity > buildableCapacity) {
      return room.sourceContainers.length * 2
    }
    return room.sourceContainers.length
  }

  static _numPartsBlocks(room, memory) {
    if (room.creepsByRole('courier').length === 0) {
      // force two sets of parts because we can only be guaranteed 300 energy.
      return 2
    }

    // Calculate the number of parts "blocks" based on spawn capacity
    let buildCapacity = this._howBigCanThisTruckGet(room)
        buildCapacity = Math.floor(buildCapacity/100)

    // Calculate the number of parts "blocks" based on needed carry capacity
    let neededCapacity = this._carryPerSource(room, memory.source)
    let carryCapacity = Math.ceil(neededCapacity/100)

    return _.min([buildCapacity, carryCapacity])
  }

  static _carryPerSource(room, source_id) {
    let containers = room.openContainers
    let source = Game.getObjectById(source_id)

    let dropoff
    if (containers.length === 0) {
      dropoff = room.spawns[0]
    } else {
      dropoff = this._furthestContainer(containers, source)
    }

    let path = source.pos.findPathTo(dropoff)
    let distance = path.length * 2 // too and from

    let harvesters = room.creepsByRole('harvester').filter((c) => c.memory.source == source_id)
    let workParts = _.sum(harvesters, (h) => h.numParts(WORK))
    let production = workParts * HARVEST_POWER

    return distance * production
  }

  static _howBigCanThisTruckGet(room) {
    // Calculate the number of part "blocks" based on spawn capacity
    let numPartBlocks = Math.floor(room.energyCapacityAvailable/150)
    // 2 CARRY parts per block, times CARRY_CAPACITY, is how big this thing gets
    return numPartBlocks * 2 * CARRY_CAPACITY
  }

  static _furthestContainer(containers, source) {
    return _.max(containers, (c) => c.pos.getRangeTo(source) )
  }
}

module.exports = Courier
