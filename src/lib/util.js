'use strict'

var Util = {

  /**
   * Clears dead creep names out of memory
   */
  clearMemory: function () {
    console.log('Clearing memory of dead creeps');

    for(var creep in Memory.creeps) {
      if ( this.isDead(creep) ) {
        // trigger the room to run a census this tick
        if (typeof(Memory.creeps[creep].mainRoom) == 'string') {
          Game.rooms[Memory.creeps[creep].mainRoom].memory.censusTaken = 0
        }
        delete Memory.creeps[creep];
        console.log(`Clearing non-existing creep memory: ${creep}`);
      }
    }
  },

  isDead: function (creep) {
    return !Game.creeps[creep];
  }
};

module.exports = Util
