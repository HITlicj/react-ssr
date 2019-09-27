
const colors = require('colors');

exports.log = function (logEntry) {
  let logFuncs = {
      error: function (message, rest) {
          console.error.bind(console, '[ERROR] '.red + message).apply(console, rest)
      },
      info: function (message, rest) {
          console.info.bind(console, '[INFO] '.green + message).apply(console, rest)
      },
      hint: function (message, rest) {
          console.info.bind(console, ('[HINT] ' + message).blue).apply(console, rest)
      },
      warn: function (message, rest) {
          console.warn.bind(console, '[WARNING] '.yellow + message).apply(console, rest)
      },
      debug: function (message, rest) {
          console.log.bind(console, ('[DEBUG] ' + message).cyan).apply(console, rest)
      },
      default: function (message, rest) {
          console.log.bind(console, message).apply(console, rest)
      }
  }
  let typeAndMessage;
  if (typeof logEntry === 'string') {
      typeAndMessage = logEntry
      logEntry = []
  } else {
      typeAndMessage = logEntry.shift()
  }
  let parts = typeAndMessage.split(':'), type = 'default', message
  if (parts.length === 1) {
      message = parts[0]
  } else if (!logFuncs[parts[0]]) {
      message = typeAndMessage
  } else {
      type = parts.shift()
      message = parts.join(':')
  }

  logFuncs[type](message, logEntry)
};

exports.logs = function (logs) {
  logs.map(function (logEntry) {
      exports.log(logEntry)
  })
};
