'use strict'

class BaseRole {
  static role() {
    // override in subclasses
    throw "Creep role can't be generic!"
  }

  static orderParts(room, memory) {
    throw "Override in specific role subclass!"
  }

  static initializeMemory(room) {
    var source_id = this._findSourceWithOpenSpot(room)
    var source = Game.getObjectById(source_id)
    var container_id = source.container().id
    return {
      role: this.role(),
      source: source_id,
      container: container_id,
      colony: room.name
    }
  }

  // usually just the same role, but can be overriden in subclasses.
  // this allows things like the worker group of creeps to share a pot of
  // containers.
  static comparisonRoles() {
    return [this.role()]
  }

  static similarCreeps(rm) {
    return _.filter(rm.colonyCreeps, (c) => this.comparisonRoles().includes(c.memory.role))
  }

  static _findSourceWithOpenSpot(room) {
    var creeps = this.similarCreeps(room)
    var sources = _.map(room.sources, 'id')
    var count = {}
    for (var i in sources) {
      count[sources[i]] = _.filter(creeps, (h) => h.memory.source == sources[i]).length
    }

    return Object.keys(count).sort(function(a,b){return count[a] - count[b]})[0]
  }
}

module.exports = BaseRole
