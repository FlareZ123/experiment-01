'use strict';

const {runPairedRootOpportunity,POLICY}=
  require('./agent16-box-root-prospective-paired.cjs');

const VERSION='agent16-box-root-prospective-32-fresh-source-deals-v2';
const SEEDS=Object.freeze([
  2194842395,1652844705,1324014603,943655972,
  2132701007,3115794491,1227521590,445613953,
  704284584,916836079,3557758789,365279176,
  1890927909,1024244327,649578262,1429625805,
  1722555698,3120327949,2638729204,2658656383,
  3441347680,473218179,2499226413,1123575175,
  3533977981,968371655,2564685281,3274383596,
  4003915275,3731506136,3612963407,3542294831
]);
const FRAME=Object.freeze(SEEDS.map((seed,i)=>Object.freeze({
  rank:i<16?6:11,
  repeat:301+i,
  candidateSlot:i%2===0?'A':'B',
  seed,
  candidateId:'new-moon-lockbreaker-v1',
  id:[i<16?6:11,301+i,i%2===0?'A':'B',
    'new-moon-lockbreaker-v1'].join(':')
})));
/**
 * Fresh source deals selected before inspection, with explicit normal policy
 * versus opt-in Secret Box root decision. Each original-source physical
 * stream and fixed 60 is identical within a paired comparison. Only action
 * opportunities and native status are evidence; zero competitive games.
 */
function runExtended(){
  const result=runPairedRootOpportunity(FRAME,POLICY);
  return {...result,version:VERSION,qualifiedCompetitiveGames:0};
}
if(require.main===module){
  console.log('AGENT16_EXTENDED_BOX_ROOT_OPPORTUNITY',JSON.stringify(runExtended()));
}
module.exports={VERSION,SEEDS,FRAME,runExtended};
