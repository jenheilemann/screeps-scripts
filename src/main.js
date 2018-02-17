
require('version')
if(!Memory.SCRIPT_VERSION || Memory.SCRIPT_VERSION != SCRIPT_VERSION) {
    Memory.SCRIPT_VERSION = SCRIPT_VERSION
    console.log('New code uploded: ' + SCRIPT_VERSION)
}

module.exports.loop = function () {
    if (Game.time % 13 == 5) {
        console.log('Loop is running!')
    }
}
