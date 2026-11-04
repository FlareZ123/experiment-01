'use strict';

const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals,runOne,ROOT_LIMIT}=
  require('./agent2-rank3-original-fss-float-census.cjs');

const VERSION='agent2-rank3-original-fss-float-fresh-32-v1';
const SEEDS=Object.freeze(Array.from({length:16},(_,i)=>290130+i));
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/**
 * Disjoint, unselected prospective exposure audit following the eight-case
 * fixed pilot. Both physical seats, one native 260-root cap per original
 * rank3-vs-rank1 pair. No observer changes any gameplay action.
 * @returns {object[]} Frozen schedule before any game is executed.
 */
function schedule(){
  return [0,1].flatMap(candidateSeat=>SEEDS.map(seed=>({
    candidateSeat,sourceSeat:1-candidateSeat,seed,
    id:'rank3-fresh-'+candidateSeat+'-'+seed
  })));
}
function run(){
  initializeCards();
  const cards=originals();
  const saved=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const rows=schedule().map(t=>runOne(t,cards));
    const summary={
      attempted:rows.length,
      errors:rows.filter(x=>x.status==='native-error').length,
      nativeTerminals:rows.filter(x=>x.status==='native-terminal').length,
      capped:rows.filter(x=>x.status==='action-cap').length,
      ownerRootActions:rows.reduce((n,x)=>n+(x.audit?.ownerRootActions??0),0),
      orderedFssFloatRoots:rows.reduce(
        (n,x)=>n+(x.audit?.orderedPairRootActions??0),0),
      orderedFssFloatUniquePhysicalStates:rows.reduce(
        (n,x)=>n+(x.audit?.distinctOrderedPairPhysicalStates??0),0),
      fssHoldWithFloatRoots:rows.reduce(
        (n,x)=>n+(x.audit?.toolHoldRootActions??0),0),
      printedFloatCandidateRoots:rows.reduce(
        (n,x)=>n+(x.audit?.floatCandidateRootActions??0),0),
      fundedDoubleBurrowCandidateRoots:rows.reduce(
        (n,x)=>n+(x.audit?.possibleDoubleBurrowRootActions??0),0),
      imminentDeckoutCandidateRoots:rows.reduce(
        (n,x)=>n+(x.audit?.imminentDeckoutRootActions??0),0),
      competitivelyQualifiedGames:0
    };
    return {version:VERSION,
      prospectiveScheduleCommittedBeforeRunning:true,
      rank3SourceConverted60Sha256:sha(cards.source),
      rank1ReferenceConverted60Sha256:sha(cards.candidate),
      nativePinnedGitSha:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      actionLimit:ROOT_LIMIT,
      physicalCandidateSeats:[0,1],seeds:[...SEEDS],
      summary,rows,
      caveat:'32 new, disjoint native developmental original-source games with weak common policies. Repeated roots in the same game are dependent. No real-paper win-rate inference or full-field claim.'
    };
  }finally{
    for(const [key,value] of saved)
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
  }
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(data.summary.errors>0)process.exitCode=1;
}
module.exports={VERSION,SEEDS,schedule,run};
