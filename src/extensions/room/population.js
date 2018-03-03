'use strict'

Object.defineProperty(Room.prototype, 'colonyCreeps', {
  get: function () {
    let cached = sos.lib.cache.get(`${this.name}.colonyCreeps`)
    let creeps = {}
    let refreshCache = false

    if (cached && !_.isEmpty(cached)) {
      _.each(cached, function(name) {
        var creep = Game.creeps[name]
        if (creep) {
          creeps[name] = creep
        } else {
          refreshCache = true
        }
      })
    }

    if (_.isEmpty(creeps) || refreshCache) {
      _.each(_.filter(Game.creeps, (c) => c.memory.colony === this.name), function(c) {
        creeps[c.name] = c
      })
      sos.lib.cache.set(`${this.name}.colonyCreeps`, Object.keys(creeps), {
        maxttl: 23,
        persist: true
      })
    }

    return creeps
  }
})

Object.defineProperty(Room.prototype, 'friendlies', {
  get: function () {
    let cached = sos.lib.cache.get(`${this.name}.friendlies`)
    let creeps = {}
    let refreshCache = false

    if (cached && !_.isEmpty(cached)) {
      _.each(cached, function(name) {
        var creep = Game.creeps[name]
        if (creep) {
          creeps[name] = creep
        } else {
          refreshCache = true
        }
      })
    }

    if (_.isEmpty(creeps) || refreshCache) {
      _.each(this.find(FIND_MY_CREEPS), function(c) {
        creeps[c.name] = c
      })
      sos.lib.cache.set(`${this.name}.friendlies`, Object.keys(creeps), {
        maxttl: 79,
        persist: true
      })
    }

    return creeps
  }
})

Room.prototype.creepsByRole = function(role) {
  var creeps = this.cache.remember('creepsByRole', function(self){
    return _.groupBy(self.colonyCreeps, (c) => c.memory.role)
  }, [this]);
  return creeps[role] || []
}

Object.defineProperty(Room.prototype, 'enemies', {
  get: function () {
    return this.cache.remember('enemies', function(self) {
      return self.find(FIND_CREEPS, { filter: { my: false }})
    }, [this])
  }
})
