"use strict";exports.__esModule=true;exports.interopDefault=interopDefault;exports.loadComponents=loadComponents;var _constants=require("../lib/constants");var _path=require("path");var _require=require("./require");function interopDefault(mod){return mod.default||mod;}async function loadComponents(distDir,buildId,pathname,serverless){if(serverless){const Component=await(0,_require.requirePage)(pathname,distDir,serverless);const{getStaticProps,getStaticPaths,getServerSideProps}=Component;return{Component,pageConfig:Component.config||{},getStaticProps,getStaticPaths,getServerSideProps};}const documentPath=(0,_path.join)(distDir,_constants.SERVER_DIRECTORY,_constants.CLIENT_STATIC_FILES_PATH,buildId,'pages','_document');const appPath=(0,_path.join)(distDir,_constants.SERVER_DIRECTORY,_constants.CLIENT_STATIC_FILES_PATH,buildId,'pages','_app');const DocumentMod=require(documentPath);const AppMod=require(appPath);const ComponentMod=(0,_require.requirePage)(pathname,distDir,serverless);const[buildManifest,reactLoadableManifest,Component,Document,App]=await Promise.all([require((0,_path.join)(distDir,_constants.BUILD_MANIFEST)),require((0,_path.join)(distDir,_constants.REACT_LOADABLE_MANIFEST)),interopDefault(ComponentMod),interopDefault(DocumentMod),interopDefault(AppMod)]);const{getServerSideProps,getStaticProps,getStaticPaths}=ComponentMod;return{App,Document,Component,buildManifest,reactLoadableManifest,pageConfig:ComponentMod.config||{},getServerSideProps,getStaticProps,getStaticPaths};}
//# sourceMappingURL=load-components.js.map