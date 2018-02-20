'use strict'

const STYLE = {
  move:    { visualizePathStyle: {stroke: '#ffffff', width: 0.3}},
  collect: { visualizePathStyle: {stroke: '#ffffff', width: 0.3}},
  harvest: { visualizePathStyle: {stroke: '#ffbb33', width: 0.3}},
  build:   { visualizePathStyle: {stroke: '#aaccff', width: 0.3}},
  upgrade: { visualizePathStyle: {stroke: '#55ff55', width: 0.3}},
  courier: { visualizePathStyle: {stroke: '#ffaaff', width: 0.3}},
  repair:  { visualizePathStyle: {stroke: '#aaaaff', width: 0.3}},
}

class Generic {

  constructor(creep, roomManager) {
    this.creep = creep
    this.roomManager = roomManager
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)
    this.memory = this.creep.memory
  }

  static role() {
    // override in subclasses
    throw "Creep role can't be generic!"
  }

  static initializeMemory(roomManager) {
    var source_id = this._findSourceWithOpenSpot(roomManager)
    var source = Game.getObjectById(source_id)
    var container_id = source.container().id
    return {
      role: this.role(),
      source: source_id,
      container: container_id,
      mainRoom: roomManager.room.name
    }
  }

  // usually just the same role, but can be overriden in subclasses.
  // this allows things like the worker group of creeps to share a pot of
  // containers.
  static comparisonRoles() {
    return [this.role()]
  }

  static similarCreeps(rm) {
    return _.filter(rm.creeps(), (c) => this.comparisonRoles().includes(c.memory.role))
  }

  static _findSourceWithOpenSpot(roomManager) {
    var creeps = this.similarCreeps(roomManager)
    var sources = _.map(roomManager.sources(), 'id')
    var count = {}
    for (var i in sources) {
      count[sources[i]] = _.filter(creeps, (h) => h.memory.source == sources[i]).length
    }

    return Object.keys(count).sort(function(a,b){return count[a] - count[b]})[0]
  }

  harvest(harvestToContainer = false) {
    var container = this.container
    var pos = this.creep.pos

    if (harvestToContainer && container && !pos.isEqualTo(container)) {
      return this.creep.moveTo(container, STYLE['harvest'])
    }

    if(!pos.isNearTo(this.source)) {
      return this.creep.moveTo(this.source, STYLE['harvest']);
    }

    this.creep.harvest(this.source)
    if (harvestToContainer && container && !container.isFull() && pos.isEqualTo(container) ) {
      this.creep.drop(RESOURCE_ENERGY)
    }
  }

  placeRoadConstructions() {
    var constructionSites = this.roomManager.constructionSites();
    if (constructionSites.length < 6) {
      this.creep.room.createConstructionSite(this.creep, STRUCTURE_ROAD)
    }
  }

  build() {
    var targets = this.roomManager.constructionSites()
    var nonRoad = targets.filter((c) => c.structureType != STRUCTURE_ROAD)

    // build non-road stuff, probably more important
    if(nonRoad.length > 0) {
      return this.buildOrMoveToTarget(nonRoad[0])
    }

    // build roads
    var roads = targets.filter((c) => c.structureType == STRUCTURE_ROAD)
    if(road.length > 0) {
      return this.buildOrMoveToTarget(roads[0])
    }
    return false
  }

  buildOrMoveToTarget(target) {
    if(this.creep.pos.inRangeTo(target,3)) {
      this.creep.build(target)
      return true
    }
    return this.creep.moveTo(target, STYLE['build'])
  }

  collect() {
    var container = this.container
    var trunkSpace = this.creep.carryCapacity - _.sum(this.creep.carry)

    if (!container || container.store[RESOURCE_ENERGY] < trunkSpace) {
      return false
    }

    this.memory.parking = false
    if (!this.creep.pos.isNearTo(container)) {
      return this.creep.moveTo(container, STYLE['collect'])
    }
    return this.creep.withdraw(container, RESOURCE_ENERGY)
  }

  refillSpawns() {
    // can't carry anything anyway, stay still
    if ( this.creep.getActiveBodyparts(CARRY) == 0) {
      return false
    }

    var targets = this.roomManager.energyHogs()
    var dots = targets.filter((s) => s.structureType === STRUCTURE_EXTENSION)
    if(dots.length > 0) {
      return this.transferOrMoveTo(dots[0])
    }
    var spawns = targets.filter((s) => s.structureType === STRUCTURE_SPAWN )
    if (spawns.length > 0) {
      return this.transferOrMoveTo(spawns[0])
    }
    return false
  }

  refillOpenContainers() {
    var containers = this.roomManager.openContainers().filter((c) => !c.isFull())

    if (containers.length < 0) {
      return false
    }
    return this.transferOrMoveTo(containers[0])
  }

  transferOrMoveTo(target){
    this.memory.parking = false
    if( this.creep.pos.isNearTo(target) ) {
      return this.creep.transfer(target, RESOURCE_ENERGY)
    }
    return this.creep.moveTo(target, STYLE['courier']);
  }

  upgrade() {
    // can't carry anything anyway, stay still
    if ( this.creep.getActiveBodyparts(CARRY) == 0) {
      return false
    }

    var controller = this.roomManager.controller()
    if( !this.creep.pos.inRangeTo(controller, 3) ) {
      return this.creep.moveTo(controller, STYLE['upgrade']);
    }
    return this.creep.upgradeController(controller)
  }

  repair() {
    var structures, repairable
    if (!this.memory.repairable || Game.time - this.memory.repairStarted > 120 ) {
      structures = this.roomManager.repairNeededStructures(0.95).concat(
                   this.roomManager.repairNeededBarriers())

      // No repairable structures found
      if (structures.length == 0) {
        return false
      }

      repairable = _.shuffle(structures)[0]
      this.memory.repairable = repairable.id
      this.memory.repairStarted = Game.time
    } else {
      repairable = Game.getObjectById(this.memory.repairable)
      // something got destroyed, probably
      if (!repairable) {
        delete this.memory.repairable
        return false
      }
      // it doesn't need repairing any more
      if (repairable.hits/repairable.hitsMax > 0.98) {
        delete this.memory.repairable
        return false
      }
    }
    if(repairable) {
      this.memory.parking = false
      if(this.creep.pos.inRangeTo(repairable, 3)) {
        this.creep.repair(repairable)
      } else {
        this.creep.moveTo(repairable, STYLE['repair']);
      }
      return true
    }
    return false
  }

  moveOffRoad() {
    var parkingSpot
    if (!this.memory.parking) {
      parkingSpot = this.findParkingSpot()
      if (typeof(parkingSpot) == 'object' ) {
        this.creep.moveTo(parkingSpot)
        this.memory.parking = true
      } else {
        this.memory.parking = false
        this.creep.move(_.shuffle([LEFT, TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT])[0])
      }
      return this.creep.say('???')
    }
    this.creep.say(`🚬`)
  }

  findParkingSpot() {
    var pos = this.creep.pos
    var current = this.creep.room.lookAt(pos)
    if (this._locationIsParkingAppropriate(current)) {
        return pos;
    }

    var area = this.creep.room.lookAtArea(pos.y-1,pos.x-1,pos.y+1,pos.x+1);
    for (var y in area) {
      for (var x in area[y]) {
        if (this._locationIsParkingAppropriate(area[y][x]) === true) {
          return new RoomPosition(x,y,this.creep.room.name)
        }
      }
    }
    return false
  }

  _locationIsParkingAppropriate(data) {
    for (var i in data) {
      if (data[i].type === 'creep' && data[i].creep.id !== this.creep.id) {
        return false
      }
      if (data[i].type === 'structure') {
        return false
      }
      if (data[i].type === 'terrain' && data[i].terrain === 'wall'){
        return false
      }
    }
    return true
  }

}

module.exports = Generic
