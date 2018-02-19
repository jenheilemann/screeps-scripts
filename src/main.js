if(Game.time % 5 == 3) { console.log(`CPU bucket: ${Game.cpu.bucket}`) }
if (Game.cpu.bucket < 500) {
  throw new Error(`Extremely low bucket (${Game.cpu.bucket}) - aborting script run at top level`)
  return
}

require('version')
if(!Memory.SCRIPT_VERSION || Memory.SCRIPT_VERSION != SCRIPT_VERSION) {
  Memory.SCRIPT_VERSION = SCRIPT_VERSION
  console.log('New code uploded: ' + SCRIPT_VERSION)
}

/* Add "creep talk" library - https://github.com/screepers/creeptalk */
const language = require('thirdparty_creeptalk_emoji')
require('thirdparty_creeptalk')({
  'public': true,
  'language': language
})

// Various extensions to the base game objects
require(`extensions_structure`)
global.StructureNull = require(`extensions_structure_null`)
require(`extensions_source`)

global.GenericCreep = require(`roles_generic`)

global.util = require('lib_util')
const RoomManager = require('managers_room')

module.exports.loop = function () {
  if(Game.time % 5 == 3) { console.log(`CPU bucket: ${Game.cpu.bucket}`) }
  if (Game.cpu.bucket < 500) {
    if (Game.cpu.limit !== 0) {
      throw new Error(`Extremely low bucket (${Game.cpu.bucket}) - aborting script run at start of loop`)
    }
    return
  }
  if (Game.time % 13 == 5) {
    global.util.clearMemory();
  }

  for (var roomname in Game.rooms) {
    new RoomManager(Game.rooms[roomname]).run()
  }
}
