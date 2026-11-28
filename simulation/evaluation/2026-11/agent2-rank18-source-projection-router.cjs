'use strict';
/**
 * Explicitly configured, **default-off** composition of two pinned source
 * extension projectors. This is not the default headless runner integration.
 * Caller must elect it for original Aichi rank18 with the exact source-60
 * Git blob and pinned Twinleaf revision.
 *
 * No vendor edits, automatic globals, action dispatches, state mutations,
 * hidden Prize reads, or scenario-dependent fallback.
 */
const shared=require('./agent36-prompt-projection.cjs');
const mot=require('./agent2-rank18-motivate-projection.cjs');
const heavy=require('./agent2-rank18-heavy-ball-projection.cjs');
const {SOURCE_RANK,SOURCE_BLOB_SHA1}=require('./agent2-rank18-regidrago-opponent-policy.cjs');
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ROUTER_VERSION='agent2-rank18-exact-source-router-v1';
function configureRank18SourceProjection({
 rank,sourceBlobSha1,enginePin,
 enableMotivate=false,enableHeavyBall=false,
 baseProjector=shared
}={}){
 if(rank!==SOURCE_RANK||sourceBlobSha1!==SOURCE_BLOB_SHA1||
    enginePin!==ENGINE_PIN)
   throw Error('R18_SOURCE_PROJECTION_IDENTITY_MISMATCH');
 if(typeof enableMotivate!=='boolean'||typeof enableHeavyBall!=='boolean'||
    typeof baseProjector?.projectPrompt!=='function'||
    typeof baseProjector?.makeSource!=='function'||
    typeof baseProjector?.validateRawPromptResult!=='function')
   throw Error('R18_SOURCE_PROJECTION_CONFIG_INVALID');
 const settings=Object.freeze({
  schema:ROUTER_VERSION,rank,sourceBlobSha1,enginePin,
  enableMotivate,enableHeavyBall
 });
 return Object.freeze({
  settings,
  projectPrompt(options={}){
   const type=options.prompt?.constructor?.name;
   // Exact source checks, prompt ownership and native-shaped validation
   // happen in the individual projectors. Unrelated prompts always delegate.
   const extra={...options,testProjectionApi:baseProjector};
   if(type==='AttachEnergyPrompt'&&enableMotivate)
    return mot.projectMotivatePrompt(extra);
   if(type==='ChooseCardsPrompt'&&enableHeavyBall)
    return heavy.projectHeavyBallPrompt(extra);
   return baseProjector.projectPrompt(options);
  }
 });
}
module.exports={ROUTER_VERSION,ENGINE_PIN,configureRank18SourceProjection};
