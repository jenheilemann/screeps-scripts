'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Build extends BaseTask {
  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    if (creep.isEmpty()) {
      this.wakeParent()
      this.suicide()
      return
    }

    var constructionSite = Game.getObjectById(this.data.site)

    if (!constructionSite) {
      this.wakeParent()
      this.suicide()
      return
    }

    if (!creep.pos.inRangeTo(constructionSite, 3)) {
      this.launchChildProcess(`move_to_site`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   constructionSite.pos.toHash(),
        range: 3,
        style: 'build'
      })
      var sleepFor = Math.floor(creep.pos.findPathTo(constructionSite.pos).length*1.5)
      return this.sleep(sleepFor)
    }

    creep.build(constructionSite)
  }
}


module.exports = Build
