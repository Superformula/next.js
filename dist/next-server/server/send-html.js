"use strict";exports.__esModule=true;exports.sendHTML=sendHTML;var _etag=_interopRequireDefault(require("next/dist/compiled/etag"));var _fresh=_interopRequireDefault(require("next/dist/compiled/fresh"));var _utils=require("../lib/utils");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function sendHTML(req,res,html,{generateEtags,poweredByHeader}){if((0,_utils.isResSent)(res))return;const etag=generateEtags?(0,_etag.default)(html):undefined;if(poweredByHeader){res.setHeader('X-Powered-By','Next.js');}if((0,_fresh.default)(req.headers,{etag})){res.statusCode=304;res.end();return;}if(etag){res.setHeader('ETag',etag);}if(!res.getHeader('Content-Type')){res.setHeader('Content-Type','text/html; charset=utf-8');}res.setHeader('Content-Length',Buffer.byteLength(html));res.end(req.method==='HEAD'?null:html);}
//# sourceMappingURL=send-html.js.map