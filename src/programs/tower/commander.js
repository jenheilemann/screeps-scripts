
'use strict'

/**
 * Runs the towers that protect and repair the room.
 */

class Commander extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_DEFENSE
  }

  main () {
    this.tower = Game.getObjectById(this.data.tower)
    if (!this.tower) {
      return this.suicide()
    }

    if (this.tower.energy == 0) {
      return
    }

    this.room = this.tower.room

    var enemies = this.room.enemies
    if (enemies.length > 0 && this.attack(enemies) === true) {
      return this.sleep(10)
    }

    var creeps = this.room.friendlies
    var hurt = _.min(creeps, (c) => c.hits/c.hitsMax)
    if (creeps.length > 0 && hurt !== null && this.heal(hurt)) {
      return this.sleep(5)
    }

    // reset the repair child, since it's valueable to re-focus every so often
    this.killChild('repair')

    if (this.repair(this.room.rottingRamparts) === true) {
      return this.sleep(5)
    }

    if (this.tower.energy/this.tower.energyCapacity < 0.5) {
      // save for emergencies
      return this.sleep(5)
    }

    if (this.repair(this.room.repairNeededStructures(0.05)) === true) {
      return this.sleep(5)
    }
    if (this.repair(this.room.repairNeededBarriers(0.01)) === true) {
      return this.sleep(5)
    }

    if (this.tower.energy/this.tower.energyCapacity < 0.8) {
      // save for emergencies
      return this.sleep(5)
    }

    if (this.repair(this.room.repairNeededStructures(0.75)) === true) {
      return this.sleep(5)
    }
    if (this.repair(this.room.repairNeededBarriers()) === true) {
      return this.sleep(5)
    }

    this.sleep(5)
  }

  attack(enemies) {
    var closest = _.min(enemies, (e) => this.tower.pos.getRangeTo(e) )
    if (this.tower.pos.getRangeTo(closest) <= TOWER_FALLOFF_RANGE) {
      this.launchChildProcess('attack_closest', `tower_defend`, {
        'tower': this.tower.id,
        'enemy': closest.id
      })
      return true
    }
    return false
  }

  heal(hurt) {
    if (hurt.hits < hurt.hitsMax) {
      this.launchChildProcess('heal', `tower_heal`, {
        'tower': this.tower.id,
        'hurt': hurt.id
      })
      return true
    }
    return false
  }

  repair(structures) {
    var repairable

    // No repairable structures found
    if (structures.length === 0) {
      return false
    }

    var repairable = _.min(structures,
      (s) => Math.floor(s.hits/s.hitsMax * 15) + Math.random()*0.01)

    if(repairable) {
      this.launchChildProcess('repair', `tower_repair`, {
        'tower': this.tower.id,
        'repair': repairable.id
      })
      return true
    }
    return false
  }
}

module.exports = Commander
