'use strict'
const BaseRole = require(`roles_base`)

class Courier extends BaseRole {
  static role() {
    return 'courier'
  }

  static orderParts(room, memory) {
    var extensions = Math.floor(room.extensions.length/2)
    var spawns = room.spawns.length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    var totalCapacity = spawns*300 + extensions*50
    var numBlock = _.min([Math.floor(totalCapacity/150), 16])

    if (room.creepsByRole('courier').length === 0) {
      // force two sets of parts because we can only be guaranteed 300 energy.
      numBlock = 2
    }

    var partsBlock = [CARRY, CARRY, MOVE]
    var parts = []
    for (var i = numBlock - 1; i >= 0; i--) {
      parts = parts.concat(partsBlock)
    }

    return parts
  }
}

module.exports = Courier
