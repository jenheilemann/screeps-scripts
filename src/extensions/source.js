'use strict'

Source.prototype.container = function () {
  var container, containers
  this.initializeMemory();

  if (typeof(this.memory.container) != 'string' && Game.time - this.memory.containerSearch > 17) {
    this.memory.containerSearch = Game.time
    containers = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}})
    for (var i in containers) {
      if (this.pos.isNearTo(containers[i])) {
        container = containers[i]
        this.memory.container = container.id
        break;
      }
    }
  }

  container = Game.getObjectById(this.memory.container)

  // The container must have been destroyed
  if (!container) {
    delete this.memory.container
    return new StructureNull()
  }
  return container
}

Source.prototype.initializeMemory = function() {
  if (!Memory.sources) {
    Memory.sources = {}
  }

  if (!Memory.sources[this.id]) {
    Memory.sources[this.id] = {
      containerSearch: 0
    }
  }

  this.memory = Memory.sources[this.id]
}
