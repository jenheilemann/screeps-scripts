'use strict'

global.LOG_FATAL = 5
global.LOG_ERROR = 4
global.LOG_WARN = 3
global.LOG_INFO = 2
global.LOG_DEBUG = 1
global.LOG_TRACE = 0

const ERROR_COLORS = {
  '5': '#ff0066',
  '4': '#e65c00',
  '3': '#809fff',
  '2': '#999999',
  '1': '#737373',
  '0': '#666666',
  'highlight': '#ffff00'
}

class Logger {
  constructor (notifier) {
    this.defaultLogGroup = 'default'
    this.notifier = notifier
  }

  log (message, severity = 3, group = false, tags = []) {
    if (!group) {
      group = this.defaultLogGroup
    }

    if (group !== 'default') {
      message = `[${Game.shard.name}] ${group}: ${message}`
    } else {
      message = `[${Game.shard.name}] ${message}`
    }

    if (severity >= LOG_ERROR) {
      this.notifier(message, 500)
    }

    if (Memory.loglevel && Memory.loglevel > severity) {
      return
    }

    let attributes = ''
    let tag
    if (tags) {
      for (tag in tags) { // jshint ignore:line
        attributes += ` ${tag}="${tags[tag]}"`
      }
    }
    attributes += ` group="${group}"`
    attributes += ` severity="${severity}"`
    attributes += ` tick="${Game.time}"`
    message = `<font color="${ERROR_COLORS[severity]}"${attributes}>${message}</font>`
    console.log(message)
  }

  trace(message, group = false, tags = []) { this.log(message, LOG_TRACE, group, tags) }
  debug(message, group = false, tags = []) { this.log(message, LOG_DEBUG, group, tags) }
  info (message, group = false, tags = [])  { this.log(message, LOG_INFO, group, tags) }
  warn (message, group = false, tags = [])  { this.log(message, LOG_WARN, group, tags) }
  error(message, group = false, tags = []) { this.log(message, LOG_ERROR, group, tags) }
  fatal(message, group = false, tags = []) { this.log(message, LOG_FATAL, group, tags) }

  logData (data, severity, group) {
    try {
      this.log(JSON.stringify(data), severity, group)
    } catch (err) {
      this.log('Unable to log data due to circular dependency', severity, group)
    }
  }

  highlight (message) {
    return this.log(message, 'highlight', false, {
      'type': 'highlight'
    })
  }

  highlightData (data) {
    return this.highlight(JSON.stringify(data))
  }
}

module.exports = Logger
