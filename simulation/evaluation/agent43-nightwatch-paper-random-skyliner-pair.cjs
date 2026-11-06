'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {withPaperRandomDirectNightWatch}=
  require('../twinleaf/agent43-nightwatch-paper-random-resolver.cjs');

const VERSION='agent43-selected-original-skyliner-paper-random-night-watch-v1';
const SOURCE_SEED=3792360798;
const RANK3_SEAT=0;
const ENTROPY_SEEDS=[20261106,20261107,20261108,20261109];
const EXPECTED={
  rank3:'72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f',
  rank1:'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311',
  fullDeal:'02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a',
  rank3Deal:'37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46'
};
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/** @param {object} game @param {object|null} audit @param {number|null} entropySeed */
function project(game,audit,entropySeed){
  const root=game.rootActionLedger??[];
  const attackRoots=root.filter(x=>x.action==='AttackAction');
  const firstNightWatch=root.find(x=>x.attackName==='Night Watch' ||
    (x.action==='AttackAction'&&x.detail?.attackName==='Night Watch'));
  const cutoff=firstNightWatch?.actionOrdinal??219;
  return {
    entropySeed,mode:game.mode??null,status:game.status,error:game.error??null,
    winner:game.winner??null,globalTurns:game.globalTurns??null,
    rootCount:game.rootCount??null,rootLedgerSha256:game.rootLedgerSha256??null,
    fullDealSha256:game.fullDealSha256??null,
    rank3DealSha256:game.rank3DealSha256??null,
    actualFirstSeat:game.actualFirstSeat??null,
    rank1AttackCount:game.rank1AttackCount??null,
    rank3AttackCount:game.rank3AttackCount??null,
    nightWatchNamedRoots:attackRoots.filter(x=>
      JSON.stringify(x).includes('Night Watch')).length,
    beforeHistoricalFirstNightWatchRootSha256:digest(root.filter(x=>
      Number.isInteger(x.actionOrdinal)&&x.actionOrdinal<219)),
    randomSamples:audit?.samples??[],
    randomizedPromptCount:audit?.samples?.length??0,
    promptPatchRestored:audit?.restored??null,
    nativeTerminal:game.nativeTerminal??null,
    qualifiedGames:0,
    historicallySelectedOriginalSourceCase:true,
    fullRootLedger:root
  };
}

/** @returns {object} A/B frozen same-original-deal diagnostic, never win-rate data. */
function run(){
  initializeCards();
  const decks=originals();
  if(digest(decks.source)!==EXPECTED.rank3 ||
    digest(decks.candidate)!==EXPECTED.rank1)
    throw new Error('Frozen 60 card inventory differs from original registration');
  const trial={
    id:'agent43-paper-random-original-skyliner-native',
    seed:SOURCE_SEED,rank3Seat:RANK3_SEAT,
    mode:'bilateral-skyliner-free-retreat',
    energyRecipient:true,captureAttackTrace:true
  };
  const before=project(runArm({...trial,id:trial.id+'-baseline'},decks),null,null);
  const variants=ENTROPY_SEEDS.map(seed=>{
    const observed=withPaperRandomDirectNightWatch(()=>
      runArm({...trial,id:trial.id+'-entropy-'+seed},decks),{seed});
    return project(observed.result,observed.audit,seed);
  });
  const arms=[before,...variants];
  const dealConserved=arms.every(x=>
    x.fullDealSha256===EXPECTED.fullDeal &&
    x.rank3DealSha256===EXPECTED.rank3Deal);
  const startSeatConserved=arms.every(x=>
    x.actualFirstSeat===before.actualFirstSeat);
  const patchRestored=variants.every(x=>x.promptPatchRestored===true);
  const sampled=variants.reduce((n,x)=>n+x.randomizedPromptCount,0);
  const outcome={
    version:VERSION,pinnedUpstream:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    frozenOriginalRank3Sha256:EXPECTED.rank3,
    frozenOriginalRank1Sha256:EXPECTED.rank1,
    sourceSeed:SOURCE_SEED,rank3Seat:RANK3_SEAT,
    treatmentEntropySeeds:ENTROPY_SEEDS,
    historicalWinnerKnownBeforeDiagnostic:true,
    prerequisiteFullDealMatched:dealConserved,
    actualStartingSeatMatched:startSeatConserved,
    originalTreatmentNativeWinnerReproduced:
      before.status==='native-terminal'&&before.winner===1,
    restoredEveryPromptHook:patchRestored,
    sampledDirectNightWatchPromptCount:sampled,
    simulatedCompetitivelyQualifiedGames:0,
    compareOnlyOnePreviouslySelectedPhysicalSourceDeal:true,
    arms,
    limitations:[
      'Paper-random response covers direct Trevenant & Dusknoir-GX SMP Night Watch only',
      'Uniform index sampling is under an independent seeded diagnostic PRNG, with no paper table execution proof',
      'All trajectories reuse one previously selected physical source deal; not independent games',
      'Opponent policy, other printed effect fidelity and the 25-minute match clock remain unqualified'
    ]
  };
  if(!dealConserved||!startSeatConserved||!patchRestored)
    throw Object.assign(new Error('Original physical deal or prompt restoration invariant failed'),
      {evidence:outcome});
  return outcome;
}

/** Commit an output file atomically with an exclusive lock when requested. */
function writeLockedAtomic(filename,packet){
  const dest=path.resolve(filename),lock=dest+'.lock';
  const temp=dest+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temp,JSON.stringify(packet,null,2)+'\n','utf8');
    fs.renameSync(temp,dest);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if(require.main===module){
  try{
    const outcome=run();
    if(process.env.AGENT43_NIGHTWATCH_OUTPUT)
      writeLockedAtomic(process.env.AGENT43_NIGHTWATCH_OUTPUT,outcome);
    process.stdout.write(JSON.stringify({
      version:outcome.version,
      frozenSamePhysicalSourceDeal:outcome.prerequisiteFullDealMatched,
      originalTreatmentNativeWinnerReproduced:
        outcome.originalTreatmentNativeWinnerReproduced,
      arms:outcome.arms.map(({entropySeed,status,winner,globalTurns,
        rank1AttackCount,rank3AttackCount,randomizedPromptCount,
        promptPatchRestored,nightWatchNamedRoots})=>({
        entropySeed,status,winner,globalTurns,
        rank1AttackCount,rank3AttackCount,
        randomizedPromptCount,promptPatchRestored,nightWatchNamedRoots
      })),
      simulatedCompetitivelyQualifiedGames:0
    })+'\n');
    if(!outcome.originalTreatmentNativeWinnerReproduced||
      !outcome.prerequisiteFullDealMatched)
      process.exitCode=1;
  }catch(error){
    if(error.evidence&&process.env.AGENT43_NIGHTWATCH_OUTPUT)
      writeLockedAtomic(process.env.AGENT43_NIGHTWATCH_OUTPUT,error.evidence);
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'diagnostic-failed',
      error:String(error?.stack??error).slice(0,4500),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,SOURCE_SEED,ENTROPY_SEEDS,EXPECTED,run};
