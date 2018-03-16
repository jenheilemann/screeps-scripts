'use strict'

const STYLE = {
  move:    {stroke: '#ffffff', width: 0.1, opacity: 0.6},
  collect: {stroke: '#ffffff', width: 0.1, opacity: 0.6},
  collect: {stroke: '#ff33ff', width: 0.1, opacity: 0.6},
  harvest: {stroke: '#ffbb33', width: 0.1, opacity: 0.6},
  build:   {stroke: '#aaccff', width: 0.1, opacity: 0.6},
  upgrade: {stroke: '#55ff55', width: 0.1, opacity: 0.6},
  courier: {stroke: '#ffaaff', width: 0.1, opacity: 0.6},
  repair:  {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
  renew:   {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
  recycle: {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
}

class BaseRole {
  constructor(creep, room, program) {
    this.creep = creep
    this.room = room
    this.program = program
    this.source = Game.getObjectById(this.creep.memory.source)
    this.container = Game.getObjectById(this.creep.memory.container)
    this.memory = this.creep.memory
  }

  static role() {
    // override in subclasses
    throw "Creep role can't be generic!"
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

  harvest(harvestToContainer = false) {
    var container = this.container
    var pos = this.creep.pos

    if (harvestToContainer && container && !pos.isEqualTo(container)) {
      return this.creep.moveTo(container, { visualizePathStyle: STYLE['harvest']})
    }

    if(!pos.isNearTo(this.source)) {
      return this.creep.moveTo(this.source, { visualizePathStyle: STYLE['harvest']});
    }

    this.creep.harvest(this.source)
    if (harvestToContainer && container && !container.isFull() && pos.isEqualTo(container) ) {
      this.creep.drop(RESOURCE_ENERGY)
    }
  }

  placeRoadConstructions() {
    var constructionSites = this.room.constructionSites
    var towers = this.room.towers
    if (constructionSites.length < 6 && towers.length > 1) {
      this.creep.room.createConstructionSite(this.creep, STRUCTURE_ROAD)
    }
  }

  build() {
    var targets = this.room.constructionSites
    var nonRoad = targets.filter((c) => c.structureType != STRUCTURE_ROAD)

    // build non-road stuff, probably more important
    if(nonRoad.length > 0) {
      return this.buildOrMoveToTarget(nonRoad[0])
    }

    // build roads
    var roads = targets.filter((c) => c.structureType == STRUCTURE_ROAD)
    if(roads.length > 0) {
      return this.buildOrMoveToTarget(roads[0])
    }
    return false
  }

  buildOrMoveToTarget(target) {
    if(this.creep.pos.inRangeTo(target,3)) {
      this.creep.build(target)
      return true
    }
    return this.creep.moveTo(target,{ visualizePathStyle: STYLE['build'] })
  }

  collect() {
    var container = this.container

    if (!container || container.store[RESOURCE_ENERGY] < this.creep.trunkSpace) {
      return false
    }

    if (!this.creep.pos.isNearTo(container)) {
      return this.creep.moveTo(container,{visualizePathStyle: STYLE['collect']})
    }
    return this.creep.withdraw(container, RESOURCE_ENERGY)
  }

  collectAny() {
    var container = this.container

    if (!container || container.store.energy < 50) {
      container = _.max(this.room.containers, (c) => container.store.energy)
      if (!container || container.store.energy < 50) {
        return false
      }
    }

    if (!this.creep.pos.isNearTo(container)) {
      return this.creep.moveTo(container,{visualizePathStyle: STYLE['collect']})
    }
    return this.creep.withdraw(container, RESOURCE_ENERGY)
  }

  gatherDropped() {
    var energy = this.room.droppedEnergy()

    if (energy.length == 0) {
      return false
    }

    if (!this.creep.pos.isNearTo(energy[0])) {
      return this.creep.moveTo(energy[0],{visualizePathStyle: STYLE['pickup']})
    }
    return this.creep.pickup(energy[0])
  }

  refillSpawns() {
    // can't carry anything anyway, stay still
    if ( this.creep.getActiveBodyparts(CARRY) == 0) {
      return false
    }

    var addressee = Game.getObjectById(this.memory.addressee)
    if (!addressee || addressee.isFull()) {
      this.memory.addressee = null
      addressee = this.findHungryDotOrSpawn()
      if (!addressee) {
        return false
      }
      this.memory.addressee = addressee.id
    }
    return this.transferOrMoveTo(addressee)
  }

  findHungryDotOrSpawn() {
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
    var containers = this.room.openContainers.filter((c) => !c.isFull())

    if (containers.length == 0) {
      return false
    }
    return this.transferOrMoveTo(containers[0])
  }

  refillTowers(percent) {
    var towers = this.room.towers.filter((t) => t.energy/t.energyCapacity < percent)

    if (towers.length === 0) {
      return false
    }
    return this.transferOrMoveTo(_.min(towers, 'energy'))
  }

  refillStorage() {
    var storage = this.room.storage
    if (!storage || storage.isFull()) {
      return false
    }

    var available = this.container.store.energy
    if (available >= this.creep.carryCapacity*2 ||
        available > this.container.storeCapacity) {
      return this.transferOrMoveTo(storage)
    }
    return false
  }

  transferOrMoveTo(target, resource = RESOURCE_ENERGY){
    this.memory.parking = false
    if( !this.creep.pos.isNearTo(target) ) {
      return this.creep.moveTo(target, { reusePath: 10, visualizePathStyle: STYLE['courier']});
    }
    return this.creep.transfer(target, resource)
  }

  upgrade() {
    // can't carry anything anyway, stay still
    if ( this.creep.getActiveBodyparts(CARRY) == 0) {
      return false
    }

    var controller = this.room.controller
    if( !this.creep.pos.inRangeTo(controller, 3) ) {
      return this.creep.moveTo(controller, { reusePath: 10, visualizePathStyle: STYLE['upgrade']});
    }
    return this.creep.upgradeController(controller)
  }

  repair(structures) {
    var repairable

    // No repairable structures found
    if (structures.length == 0) {
      return false
    }

    if (this.memory.repairable && Game.time - this.memory.repairStarted < 25) {
      repairable = Game.getObjectById(this.memory.repairable)
      // something got destroyed, probably
      if (!repairable) {
        delete this.memory.repairable
      }
      // it doesn't need repairing any more
      if (repairable.hits/repairable.hitsMax > 0.98 ||
        !structures.includes(repairable)) {
        repairable = null
        delete this.memory.repairable
      }
    }

    if (!repairable) {
      repairable = _.min(structures,
        (s) => Math.floor(s.hits/s.hitsMax * 15) + Math.random()*0.01
      );
      this.memory.repairable = repairable.id
    }

    if(repairable) {
      this.memory.parking = false
      if(this.creep.pos.inRangeTo(repairable, 3)) {
        this.creep.repair(repairable)
      } else {
        this.creep.moveTo(repairable, {visualizePathStyle: STYLE['repair']});
        this.memory.repairStarted = Game.time
      }
      return true
    }
    return false
  }

  renewOrRecycle(spawn) {
    if (this.creep.ticksToLive < 50) {
      this.memory.renewing = true
    }
    if (CREEP_LIFE_TIME - this.creep.ticksToLive < this.ticksPerRenewal()) {
      this.memory.renewing = false
    }

    if (this.memory.renewing) {
      if (!this.creep.pos.inRangeTo(spawn, 1)) {
        return this.creep.moveTo(spawn, {visualizePathStyle: STYLE['renew']})
      }
      if (this.worthRenewing()) {
        this.creep.say('🛌💤💤') // person in bed
        return spawn.renewCreep(this.creep)
      } else {
        return spawn.recycleCreep(this.creep)
      }
    }
    return false
  }

  worthRenewing() {
    var newParts = this.constructor.orderParts(this.room, {}).length
    const PopulationManager = require('managers_population')
    var manager = new PopulationManager(this.room)
    var goal = manager.goalByRole(this.constructor.role())
    var current = (this.room.creepsByRole(this.constructor.role())).length
    if (goal < current) {
      return false
    }
    return this.creep.body.length >= newParts
  }

  ticksPerRenewal() {
    return Math.floor(600/this.creep.body.length)
  }

  moveOffRoad() {
    var parkingSpot
    if (!this.memory.parking) {
      parkingSpot = this.findParkingSpot()
      if (typeof(parkingSpot) == 'object' ) {
        this.creep.moveTo(parkingSpot)
      } else {
        this.memory.parking = false
        this.creep.move(_.shuffle([LEFT, TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT])[0])
        return this.creep.say('???')
      }
    }
    this.creep.say(`🚬`)
  }

  findParkingSpot() {
    var pos = this.creep.pos
    var current = this.creep.room.lookAt(pos)
    if (this._locationIsParkingAppropriate(current)) {
      this.memory.parking = true
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
      if (data[i].type === 'structure' && data[i].structure.structureType !== STRUCTURE_RAMPART) {
        return false
      }
      if (data[i].type === 'terrain' && data[i].terrain === 'wall'){
        return false
      }
    }
    return true
  }

}

module.exports = BaseRole
