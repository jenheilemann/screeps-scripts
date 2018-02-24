'use strict'
const GenericCreep = require(`roles_generic`)
const WORKER_ROLES = ['builder', 'upgrader']

class Worker extends GenericCreep {
  static initializeMemory(roomManager) {
    var base = super.initializeMemory(roomManager)
    base.container = this._findContainerWithOpenSpot(base.source, roomManager)
    return base
  }

  static comparisonRoles() {
    return WORKER_ROLES
  }

  static _findContainerWithOpenSpot(source_id, roomManager) {
    // containers next to sources
    var sourceContainers = _.map(roomManager.sources(), (s) => s.container() )
    // containers NOT next to sources, we want to prefer these
    var openContainers = _.filter(roomManager.containers(), (c) => !sourceContainers.includes(c))

    if (openContainers.length > 0) {
      var creeps = this.similarCreeps(roomManager)
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

  static orderParts(roomManager, memory) {
    var extensions = Math.floor(roomManager.extensions().length/2)
    var spawns = roomManager.spawns().length

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
