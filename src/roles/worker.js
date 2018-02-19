'use strict'
const WORKER_ROLES = ['builder', 'upgrader', 'handybot']

class Worker extends GenericCreep {
  static initializeMemory(roomManager) {
    var source_id = this._findSourceWithOpenSpot(roomManager)
    var container_id = this._findContainerWithOpenSpot(source_id, roomManager)
    return {
      role: this.role(),
      source: source_id,
      container: container_id
    }
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
    var extensions = roomManager.extensions().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case extensions == 0:
        return [WORK, CARRY, MOVE, MOVE]
        break;
      case extensions == 1:
        return [WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions == 2:
        return [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions <= 5:
        return [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions <= 10:
        return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
        break;
      case extensions <= 20:
        return [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE]
        break;
      default:
        return [
          WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    }
  }
}

module.exports = Worker
