"use strict";exports.__esModule=true;exports.getRedirectStatus=getRedirectStatus;exports.default=checkCustomRoutes;var pathToRegexp=_interopRequireWildcard(require("next/dist/compiled/path-to-regexp"));var _url=require("url");var _constants=require("../next-server/lib/constants");function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}const allowedStatusCodes=new Set([301,302,303,307,308]);function getRedirectStatus(route){return route.statusCode||(route.permanent?_constants.PERMANENT_REDIRECT_STATUS:_constants.TEMPORARY_REDIRECT_STATUS);}function checkRedirect(route){const invalidParts=[];let hadInvalidStatus=false;if(route.statusCode&&!allowedStatusCodes.has(route.statusCode)){hadInvalidStatus=true;invalidParts.push(`\`statusCode\` is not undefined or valid statusCode`);}if(typeof route.permanent!=='boolean'&&!route.statusCode){invalidParts.push(`\`permanent\` is not set to \`true\` or \`false\``);}return{invalidParts,hadInvalidStatus};}function checkHeader(route){const invalidParts=[];if(!Array.isArray(route.headers)){invalidParts.push('`headers` field must be an array');}else{for(const header of route.headers){if(!header||typeof header!=='object'){invalidParts.push("`headers` items must be object with { key: '', value: '' }");break;}if(typeof header.key!=='string'){invalidParts.push('`key` in header item must be string');break;}if(typeof header.value!=='string'){invalidParts.push('`value` in header item must be string');break;}}}return invalidParts;}function tryParsePath(route,handleUrl){const result={};let routePath=route;try{if(handleUrl){const parsedDestination=(0,_url.parse)(route,true);routePath=`${parsedDestination.pathname}${parsedDestination.hash||''}`;}// Make sure we can parse the source properly
result.tokens=pathToRegexp.parse(routePath);pathToRegexp.tokensToRegexp(result.tokens);}catch(err){// If there is an error show our err.sh but still show original error or a formatted one if we can
const errMatches=err.message.match(/at (\d{0,})/);if(errMatches){const position=parseInt(errMatches[1],10);console.error(`\nError parsing \`${route}\` `+`https://err.sh/zeit/next.js/invalid-route-source\n`+`Reason: ${err.message}\n\n`+`  ${routePath}\n`+`  ${new Array(position).fill(' ').join('')}^\n`);}else{console.error(`\nError parsing ${route} https://err.sh/zeit/next.js/invalid-route-source`,err);}result.error=true;}return result;}function checkCustomRoutes(routes,type){if(!Array.isArray(routes)){throw new Error(`${type}s must return an array, received ${typeof routes}.\n`+`See here for more info: https://err.sh/next.js/routes-must-be-array`);}let numInvalidRoutes=0;let hadInvalidStatus=false;const isRedirect=type==='redirect';let allowedKeys;if(type==='rewrite'||isRedirect){allowedKeys=new Set(['source','destination',...(isRedirect?['statusCode','permanent']:[])]);}else{allowedKeys=new Set(['source','headers']);}for(const route of routes){if(!route||typeof route!=='object'){console.error(`The route ${JSON.stringify(route)} is not a valid object with \`source\` and \`${type==='header'?'headers':'destination'}\``);numInvalidRoutes++;continue;}const keys=Object.keys(route);const invalidKeys=keys.filter(key=>!allowedKeys.has(key));const invalidParts=[];if(!route.source){invalidParts.push('`source` is missing');}else if(typeof route.source!=='string'){invalidParts.push('`source` is not a string');}else if(!route.source.startsWith('/')){invalidParts.push('`source` does not start with /');}if(type==='header'){invalidParts.push(...checkHeader(route));}else{let _route=route;if(!_route.destination){invalidParts.push('`destination` is missing');}else if(typeof _route.destination!=='string'){invalidParts.push('`destination` is not a string');}else if(type==='rewrite'&&!_route.destination.match(/^(\/|https:\/\/|http:\/\/)/)){invalidParts.push('`destination` does not start with `/`, `http://`, or `https://`');}}if(type==='redirect'){const result=checkRedirect(route);hadInvalidStatus=hadInvalidStatus||result.hadInvalidStatus;invalidParts.push(...result.invalidParts);}let sourceTokens;if(typeof route.source==='string'&&route.source.startsWith('/')){// only show parse error if we didn't already show error
// for not being a string
const{tokens,error}=tryParsePath(route.source);if(error){invalidParts.push('`source` parse failed');}sourceTokens=tokens;}// make sure no unnamed patterns are attempted to be used in the
// destination as this can cause confusion and is not allowed
if(typeof route.destination==='string'){if(route.destination.startsWith('/')&&Array.isArray(sourceTokens)){const unnamedInDest=new Set();for(const token of sourceTokens){if(typeof token==='object'&&typeof token.name==='number'){const unnamedIndex=new RegExp(`:${token.name}(?!\\d)`);if(route.destination.match(unnamedIndex)){unnamedInDest.add(`:${token.name}`);}}}if(unnamedInDest.size>0){invalidParts.push(`\`destination\` has unnamed params ${[...unnamedInDest].join(', ')}`);}else{const{tokens:destTokens,error:destinationParseFailed}=tryParsePath(route.destination,true);if(destinationParseFailed){invalidParts.push('`destination` parse failed');}else{const sourceSegments=new Set(sourceTokens.map(item=>typeof item==='object'&&item.name).filter(Boolean));const invalidDestSegments=new Set();for(const token of destTokens){if(typeof token==='object'&&!sourceSegments.has(token.name)){invalidDestSegments.add(token.name);}}if(invalidDestSegments.size){invalidParts.push(`\`destination\` has segments not in \`source\` (${[...invalidDestSegments].join(', ')})`);}}}}}const hasInvalidKeys=invalidKeys.length>0;const hasInvalidParts=invalidParts.length>0;if(hasInvalidKeys||hasInvalidParts){console.error(`${invalidParts.join(', ')}${invalidKeys.length?(hasInvalidParts?',':'')+` invalid field${invalidKeys.length===1?'':'s'}: `+invalidKeys.join(','):''} for route ${JSON.stringify(route)}`);numInvalidRoutes++;}}if(numInvalidRoutes>0){if(hadInvalidStatus){console.error(`\nValid redirect statusCode values are ${[...allowedStatusCodes].join(', ')}`);}console.error();throw new Error(`Invalid ${type}${numInvalidRoutes===1?'':'s'} found`);}}
//# sourceMappingURL=check-custom-routes.js.map