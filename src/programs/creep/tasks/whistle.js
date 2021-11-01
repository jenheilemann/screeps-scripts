'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Whistle extends BaseTask {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_CREEP_WHISTLE
  }

  main () {
    let creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    if (Math.random() > 0.7) {
      let options = WHISTLES[this.data.style]
      creep.say(options[_.random(0, options.length - 1)], true)
    }

    this.sleep(3)
  }
}

const WHISTLES = {
  scout: [
    'hum de dum',
    'oh hi',
    'how r you',
    '*whistle*',
    'la de dah',
    '🎵🎶🎵🎶',
    '😗🎶', // kissy/whistling face
    '🔍🕵️', // detective
    '🕵️🔎', // detective
    '🤔', // thinking face
    '🤓', // nerd face
  ]
}

module.exports = Whistle
