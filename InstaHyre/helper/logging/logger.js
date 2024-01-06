const winston = require('winston');
const { LEVEL } = require('triple-beam');
const expressWinston = require('express-winston');
const _ = require('lodash');
const rTracer = require('cls-rtracer');

const {  format } = require('winston');
const { SPLAT } = require('triple-beam');
const { isObject } = require('lodash');

function formatObject(param) {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

const handleMessageKeyAndAxiosError = (info, splat) => {
  const newInfo = { ...info };
  delete info.level;
  let handleMessageKey = false;
  for (let key in newInfo) {
    if (key != 'message' && key != 'level') {
      delete newInfo[key];
      handleMessageKey = true;
    }
  }
  newInfo.message = info.message;
  if (info.isAxiosError && info.isAxiosError == true) {
    if(info.config && info.config.url)  newInfo.message += ', url = ' + info.config.url;
    if (info.response && info.response.data) {
      if (isObject(info.response.data)) {
        newInfo.message += ', Response = ' + JSON.stringify(info.response.data);
      }
      else {
        newInfo.message += ', Response = ' + info.response.data;
      }
    }
  }
  else if(handleMessageKey && splat.length == 0) {
    newInfo.message = JSON.stringify(info);
  }
  return newInfo;
};

// Ignore log messages if they have { private: true }
const all = format((info) => {
  const splat = info[SPLAT] || [];
  for (let key in info) {
    if (key != 'message' && key != 'level') {
      info = handleMessageKeyAndAxiosError(info, splat);
      break;   
    }
  }
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.traceId = rTracer.id();
  info.message = `${message} ${rest}`;
  return info;
});


const middlewareAll = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.traceId = rTracer.id();
  info.message = `${message} ${rest}`;
  return info;
});

/*
 * Refer to the logging standard:
 * https://rupeek.atlassian.net/wiki/spaces/A2/pages/2212921385/Standard+Logging+Format
 *
 * We must reshape Winston's `info` object to the desired format:
 * { "rpk":
 *   {
 *    "log" : { ... }, <- nest some top-level keys under the "log" key
 *    "req" : { ... }, <- move request info up, from inside of `meta`
 *    "res" : { ... }  <- move response info up, from inside of `meta`
 *   }
 * }
 *
 * As we process the `info` object, we also clean up redundant and/or sensitive
 * information at each step. This is done by custom Winston formatters, where
 * each formatter is responsible for one part of the final payload.
 */

//
// CUSTOM FORMATTERS
//

/**
 A custom formatter that adds standard information about the log payload itself.
 Always sequence this early in the chain of custom formatters, to make log type
 info available for later formatters.
*/
const commonLogInfoFormatter = winston.format((info, options) => {
  const topLevelKeysToRemapWhenPresent = [
    'level', 'timestamp', 'message', 'line', 'file', 'threadID',
  ];

  const logInfoToNest = _.chain(info)
    .pick(topLevelKeysToRemapWhenPresent)
    .merge({ type: options.type })
    .value();

  return _.chain(info)
    .merge({ log: logInfoToNest })
    .omit(topLevelKeysToRemapWhenPresent)
    .value();
});

/**
 A custom formatter that lifts up request and response information from
 under the `meta` key, and puts it at the top level of the info object.
 Before returning the updated info object, we also clean up sensitive keys
 from the request part, and we remove the now-redundant meta map.
 */
const middlewareRequestResponseFormatter = winston.format((info) => (
  _.chain(info)
    .merge(
      {
        req: _.get(info, 'meta.req'),
        res: _.get(info, 'meta.res'),
      },
    )
    .omit([ // remove sensitive as well as unnecessary or redundant info
      'meta',
      'req.headers.cookie',
      'req.headers["x-auth-token"]',
      'req.headers["x-consumer-profile"]',
    ])
    .value()
));

/**
 A custom formatter to package the fully-processed info object into
 the 'rpk' log object expected by our logging standard.
 We must sequence this formatter toward the very end of the chain of
 custom formatters, just before writing out the log as JSON.
 */
const packageAsRpkPayloadFormatter = winston.format((info) => ({
  [LEVEL]: info[LEVEL], // ensure we return a proper Winston info object
  rpk: info,
}));

const JWT_TOKEN_REGEX_STRING = 'JWT [A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*';
const BASIC_TOKEN_REGEX_STRING = 'Basic [A-Za-z0-9\\+=]*';

const logMaskingRegex = new RegExp(
  `(?<![a-zA-Z0-9.])((${JWT_TOKEN_REGEX_STRING})|(${BASIC_TOKEN_REGEX_STRING}))(?![a-zA-Z0-9.])`,
  'g',
);

const maskStringForLogs = (stringToMask, noOfCharsToLeftUnMasked) => {
  const maskedString = stringToMask
    .substring(0, stringToMask.length - noOfCharsToLeftUnMasked)
    .replace(/[0-9]/g, '9')
    .replace(/[a-zA-Z]/g, '*');
  const unmaskedString = stringToMask.substring(stringToMask.length - noOfCharsToLeftUnMasked);
  return maskedString + unmaskedString;
};

const maskPII = (textBefore) => {
  return textBefore
    .replace(logMaskingRegex, (piiData) => maskStringForLogs(piiData, 4))
    .trim();
};

const maskLogs = format((info) => {
  const rpkLogs = info.rpk;
  const rpkLogsString = JSON.stringify(rpkLogs);
  const maskedRpkLogsString = maskPII(rpkLogsString);
  info.rpk = JSON.parse(maskedRpkLogsString);
  return info;
});

//
// MIDDLEWARE LOGGER
//

exports.middlewareLogger = expressWinston.logger({
  format: winston.format.combine(
    middlewareAll(),
    winston.format.timestamp(),
    commonLogInfoFormatter({ type: 'access' }), // always do at beginning
    middlewareRequestResponseFormatter(),
    packageAsRpkPayloadFormatter(), // always do toward end
    maskLogs(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
  expressFormat: true,
  requestWhitelist: [...expressWinston.requestWhitelist, 'body'],
  responseWhitelist: [...expressWinston.responseWhitelist, 'body'],
});

//
// APPLICATION LOGGER
//

exports.logger = winston.createLogger({
  format: winston.format.combine(
    all(),
    winston.format.timestamp(),
    commonLogInfoFormatter({ type: 'app' }), // always do at beginning
    packageAsRpkPayloadFormatter(), // always do toward end
    maskLogs(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
