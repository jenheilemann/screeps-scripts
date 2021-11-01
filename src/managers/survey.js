'use strict'

class Survey {
  constructor(){}

  add(room) {
    Logger.audit(`Surveyor caching data in ${this._key(room.name)}`)
    let cached = sos.lib.cache.get(this._key(room.name), {refresh: false}) || {}
    let roomSurvey = new RoomSurveyFactory(room).build(cached)
    sos.lib.cache.set(this._key(room.name), roomSurvey, {
      persist: true,
      maxttl: ONE_WEEK
    })
    return roomSurvey
  }

  fetch(room) {
    if (typeof(room) === 'object') {
      room = room.name
    }

    let cached = sos.lib.cache.get(this._key(room), {refresh: false})
    if (!cached) {
      return new RoomSurvey({up: 0, n: room})
    }
    return new RoomSurvey(cached)
  }

  _key(name) {
    return `surveys.${name}`
  }
}

class RoomSurveyFactory {
  constructor(room) {
    this.room = room
  }

  build(cachedData = {}) {
    let data = cachedData
    data.up = Game.time

    if (!cachedData.name) {
      data.n = this.room.name
      data.so = this._fetchSources()
      data.mi = this._fetchMineral()
      data.t = this._determineType(data.sources)
    }
    data.nb = this._fetchNeighbors()
    data.ow = this.room.controller ? this.room.controller.owner.username : null
    data.cr = this._fetchCreeps()
    data.st = this._fetchStructures()
    data.co = this._fetchConstructionSites()

    return new RoomSurvey(data)
  }

  _fetchSources() {
    return _.map(this.room.find(FIND_SOURCES), (s) => {
        return {id: s.id, pos: s.pos.toMemorableString()}
      })
  }

  _fetchMineral() {
    let mineral = this.room.find(FIND_MINERALS)[0]
    if (mineral) {
      return {
        id: mineral.id,
        pos: mineral.pos.toMemorableString(),
        mt: mineral.mineralType,
        am: mineral.mineralAmount,
        de: mineral.density
      }
    }
  }

  _fetchNeighbors() {
    let exits = Game.map.describeExits(this.room.name)
    return _(exits).
      map((v, k) => {
        return {r: v, d: parseInt(k)}
      }).
      filter((v) => Game.map.isRoomAvailable(v.r)).value()
  }

  _fetchCreeps() {
    return _(this.room.find(FIND_HOSTILE_CREEPS)).
      map((c) => {
        return {
          id: c.id,
          n: c.name,
          b: _.map(c.body, (p) => p.type),
          bst: _.any(c.body, (p) => p.boost !== undefined ),
          hits: c.hits,
          health: Math.round(c.hits/c.hitsMax * 100) / 100
        }
      }).value()
  }

  _fetchStructures() {
    return _(this.room.allStructures).
      map((s) => {
        return {
          id: s.id,
          pos: s.pos.toMemorableString(),
          tp: SHORT_STRUCTURE_TYPES[s.structureType],
          ac: s.isActive(),
          ow: s.owner ? s.owner.username : undefined
        }
      }).
      groupBy((s) => s.tp)
  }

  _fetchConstructionSites() {
    return _(this.room.constructionSites).
      map((s) => {
        return {
          id: s.id,
          tp: SHORT_STRUCTURE_TYPES[s.structureType],
          pos: s.pos.toMemorableString(),
          pro: s.progress,
          ow: s.owner ? s.owner.username : undefined
        }
      }).
      groupBy((s) => s.tp)
  }

  _determineType(sources) {
    if (this.room.controller) {
      return ROOM_TYPES.Normal
    }

    let hostileStructures = this.room.hostileStructuresByType
    if (sources.length > 2) {
      // either a SourceKeeper room or Center of a sector
      if (hostileStructures[STRUCTURE_KEEPER_LAIR]) {
        return ROOM_TYPES.SourceKeeper
      }
      return ROOM_TYPES.Center
    }

    if (hostileStructures[STRUCTURE_TERMINAL]) {
      return ROOM_TYPES.Intersection
    }
    return ROOM_TYPES.Highway
  }
}

const SURVEY_KEYS = {
  up : 'updated',
  n  : 'name',
  so : 'sources',
  mi : 'mineral',
  t  : 'type',
  nb : 'neighbors',
  ow : 'owner',
  cr : 'creeps',
  st : 'structures',
  co : 'constructionSites',
  tp : 'structureType',
  ac : 'active',
  pro: 'progress',
  b  : 'body',
  bst: 'boosted',
  r  : 'room',
  d  : 'dir',
  am : 'mineralAmount',
  mt : 'mineralType',
  de : 'density',
  id : 'id',
  pos: 'pos'
}


class RoomSurvey {
  constructor(data) {
    this._inflate(data, this)
    this.controller = this.structures.controller.length > 0 ? this.structures.controller[0] : undefined
  }

  _inflate(data, obj) {
    let k, val
    for (k in data) {
      val = data[k]

      switch (true) {
        case k === 't':
          val = Object.keys(ROOM_TYPES)[val]
          break;
        case k === 'tp':
          val = Object.keys(SHORT_STRUCTURE_TYPES)[val]
          break;
        case k === 'pos':
          val = RoomPosition.fromMemorableString(val)
          break;
        case val.constructor === Array:
          for (var i = val.length - 1; i >= 0; i--) {
            val[i] = this._inflate(val[i], {})
          }
          break;
        case typeof(val) === 'object':
          val = this._inflate(data[k], {})
          break;
        default:
          // do nothing
      }

      obj[SURVEY_KEYS[k]] = val
    }
    return obj
  }
}

module.exports = Survey
