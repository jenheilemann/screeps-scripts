if (Game.cpu.bucket < 500) {
  throw new Error(`Extremely low bucket (${Game.cpu.bucket}) - aborting script run at top level`)
  return
}

require('version')
require('constants')

/* Enable QOS Logger */
const QosLogger = require('thirdparty_qos_logger')
const Notify = require('thirdparty_notify')
global.Logger = new QosLogger(Notify)
const QosKernel = require('thirdparty_qos_kernel')

const Survey = require('managers_survey')
global.Surveyor = new Survey()

/* Add "sos library" - https://github.com/ScreepsOS/sos-library */
global.SOS_LIB_PREFIX = 'thirdparty_'
require('thirdparty_sos_lib')

/* Add "creep talk" library - https://github.com/screepers/creeptalk */
const language = require('thirdparty_creeptalk_emoji')
require('thirdparty_creeptalk')({
  'public': false,
  'language': language
})

// Various extensions to the base game objects
require(`extensions_construction_site`)
require(`extensions_creep`)
require(`extensions_resource`)
require(`extensions_room`)
require(`extensions_room_position`)
require(`extensions_source`)
require(`extensions_structure`)
require(`extensions_structure_container`)
require(`extensions_structure_extension`)
require(`extensions_structure_spawn`)
require(`extensions_structure_tower`)
require(`extensions_structure_storage`)
global.StructureNull = require(`extensions_structure_null`)

// courtesy of @warinternal Aug 2016 & @semperrabbit Mar 2018
global.ex   = (x) => JSON.stringify(x, null, 2)
global.goid = Game.getObjectById
global.r    = (rName) => Game.rooms[rName]

module.exports.loop = function () {
  if (Game.cpu.bucket < 500) {
    if (Game.cpu.limit !== 0) {
      Logger.fatal('Extremely low bucket - aborting script run at start of loop')
    }
    return
  }
  const kernel = new QosKernel(Notify)
  kernel.start()
  kernel.run()
  kernel.shutdown()
}
