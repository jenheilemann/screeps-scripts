'use strict'

var Util = {

    /**
     * Clears dead creep names out of memory
     */
    clearMemory: function () {
        console.log('Clearing memory of dead creeps');

        for(var creep in Memory.creeps) {
            if ( this.isDead(creep) ) {
                delete Memory.creeps[creep];
                console.log('Clearing non-existing creep memory:', creep);
            }
        }
    },

    isDead: function (creep) {
        return !Game.creeps[creep];
    }
};

module.exports = Util
