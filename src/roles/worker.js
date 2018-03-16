'use strict'
const BaseRole = require(`roles_base`)
const WORKER_ROLES = ['builder', 'upgrader']

class Worker extends BaseRole {
  static initializeMemory(room) {
    var base = super.initializeMemory(room)
    base.container = this._findContainerWithOpenSpot(base.source, room)
    return base
  }

  static comparisonRoles() {
    return WORKER_ROLES
  }

  static _findContainerWithOpenSpot(source_id, room) {
    // containers next to sources
    var sourceContainers = room.sourceContainers
    // containers NOT next to sources, we want to prefer these
    var openContainers = room.openContainers

    if (openContainers.length > 0) {
      var creeps = this.similarCreeps(room)
      var count = {}
      for (var i in openContainers) {
        // Get a count of creeps assigned to each container
        count[openContainers[i].id] = _.filter(creeps, (w) => w.memory.container == openContainers[i].id).length
      }
      // Using container ids, sort by the smallest->largest, then grab the first
      return Object.keys(count).sort(function(a,b){return count[a] - count[b]})[0]
    }

    var source = Game.getObjectById(source_id)
    return source.container().id
  }

  static orderParts(room, memory) {
    var extensions = Math.floor(room.extensions.length/2)
    var spawns = room.spawns.length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    var totalCapacity = spawns*300 + extensions*50
    var numBlocks = _.min([Math.floor(totalCapacity/200), 16])
    var partsBlock = [WORK, CARRY, MOVE]
    var parts = []

    for (var i = numBlocks - 1; i >= 0; i--) {
      parts = parts.concat(partsBlock)
    }

    return parts
  }
}

module.exports = Worker
