'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const REG_PATH=path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-v4.json');
const SHA={
  off:'1d5a7ebe7389d65d4539b473d7bfb370fac216c4dabf161a7421d7a67f068bf4',
  on:'ee45cc79147dbd49e0ea8248f8cf6aea649d3a683c4150200d73cf879b47f13c'
};
/** @param {Buffer|string} data */
function digest(data){return createHash('sha256').update(data).digest('hex');}
/** @param {{seed:number,rank5Seat:number,mode:string}} r */
function key(r){return [r.seed,r.rank5Seat,r.mode].join(':');}
/** @param {Record<string,any>} row */
function rootLedger(row){
  return row.rootActionLedger??
    row.error?.nativeAbortEvidence?.rootActionLedger??[];
}
/** @param {Record<string,any>} row */
function originalDeal(row){
  return row.initialFullPhysicalDealDigest??
    row.error?.nativeAbortEvidence?.fullPhysicalDealFingerprint?.digestSha256??null;
}
/** @param {Record<string,any>} row */
function initialTurn(row){
  return row.firstTurnSlot??
    row.error?.nativeAbortEvidence?.initialTurnOrderEvidence?.firstTurnSlot??null;
}
/** @param {Record<string,any>} doc @param {Record<string,any>} reg */
function index(doc,reg){
  assert.equal(doc.schema,'agent11-owner-resource-tutor-bilateral-v4');
  assert.equal(doc.engine,'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(doc.runGitSha,'7e4642dee046d2887830dc57005596a7976a2306');
  assert.equal(doc.registrationSha256,digest(JSON.stringify(reg)));
  assert.equal(doc.scheduledArms,64);
  assert.equal(doc.observedArms,64);
  assert.equal(doc.competitiveQualifiedGames,0);
  assert.equal(doc.rows.length,64);
  const arms=new Map(reg.arms.map(a=>[key(a),a]));
  const map=new Map();
  for(const row of doc.rows){
    const k=key(row);
    assert(!map.has(k),'duplicate arm '+k);
    const arm=arms.get(k);
    assert(arm,'unexpected arm '+k);
    for(const field of ['id','seed','rank5Seat','mode','maxActions'])
      assert.equal(row[field],arm[field],'registration diverged '+k);
    assert.equal(row.paperGameQualified,false);
    map.set(k,row);
  }
  assert.equal(map.size,64);
  return map;
}
/** @param {Record<string,any>} row */
function attackStats(row){
  const stats={cross:0,crossSettled:0,genesectDonor:0,mewDonor:0,
    noBenchedDonor:0,crossPrize:0};
  for(const event of row.publicAttackTransitions??[]){
    if(event.triggerPlayerSlot!==row.rank5Seat ||
        !(event.declarations??[]).some(d=>d.attackName==='Cross Fusion Strike'))continue;
    stats.cross++;
    const own=event.before[row.rank5Seat];
    if(own.bench.some(p=>p.name==='Genesect V'))stats.genesectDonor++;
    else if(own.bench.some(p=>p.name==='Mew V'))stats.mewDonor++;
    else stats.noBenchedDonor++;
    if(event.settled){
      stats.crossSettled++;
      stats.crossPrize+=event.beforePrizesRemaining[row.rank5Seat]-
        event.settled.prizesRemaining[row.rank5Seat];
    }
  }
  return stats;
}
/** @param {Record<string,any>} doc */
function totals(doc){
  const o={byMode:{control:{},'resource-tutor':{}},
    quickBall:0,quickBallByRank:{rank5:0,rank11:0},
    quickBallNativeTwoChoose:0,quickBallCompleteNativeChain:0,
    quickBallInAbortLedger:0,sourceRank5Cross:0,crossSettled:0,
    genesectDonor:0,mewDonor:0,noBenchedDonor:0,crossPrize:0,
    errors:[],status:{},rank5Wins:0,rank11Wins:0};
  for(const row of doc.rows){
    const status=row.nativeStatus;
    o.status[status]=(o.status[status]??0)+1;
    if(status==='native-terminal'){
      if(row.nativeWinner===row.rank5Seat)o.rank5Wins++;
      else if(row.nativeWinner===1-row.rank5Seat)o.rank11Wins++;
      else throw Error('Invalid native winner '+row.id);
    }
    if(status==='native-error'){
      assert.match(row.error?.message??'',/NO_BENCH_SLOTS_AVAILABLE/);
      const abort=row.error.nativeAbortEvidence;
      assert.equal(abort.attackName,'Call for Family');
      assert.equal(abort.attackingPokemon,'Trubbish FST');
      assert.equal(abort.preDispatchBoard[abort.actingSeat].bench.length,5);
      o.errors.push({arm:row.id,actionOrdinal:abort.actionOrdinal,
        actingSeat:abort.actingSeat});
    }
    const ledger=rootLedger(row);
    for(const a of ledger){
      if(a.card!=='Quick Ball')continue;
      o.quickBall++;
      if(status==='native-error')o.quickBallInAbortLedger++;
      o.quickBallByRank[a.playerSlot===row.rank5Seat?'rank5':'rank11']++;
      const prompt=ledger.filter(x=>x.action==='ResolvePromptAction'&&
        x.initiatingRootActionOrdinal===a.actionOrdinal);
      const counts={};
      for(const x of prompt)
        counts[x.pendingPrompt]=(counts[x.pendingPrompt]??0)+1;
      assert.equal(counts.ChooseCardsPrompt,2,'expected real discard and deck-search prompts');
      o.quickBallNativeTwoChoose++;
      if(counts.ShowCardsPrompt===1&&counts.ShuffleDeckPrompt===1&&
        counts.WaitPrompt===1)o.quickBallCompleteNativeChain++;
    }
    const cross=attackStats(row);
    o.sourceRank5Cross+=cross.cross;
    for(const k of ['crossSettled','genesectDonor','mewDonor',
      'noBenchedDonor','crossPrize'])o[k]+=cross[k];
    const m=o.byMode[row.mode];
    m[status]=(m[status]??0)+1;
  }
  return o;
}
/** @param {Record<string,any>} row */
function finalObservedTurn(row){
  if(row.nativeStatus==='native-error')
    return row.error.nativeAbortEvidence.turnBefore;
  return Math.max(0,...rootLedger(row).map(x=>x.turnAfter??0));
}
/** @param {Record<string,any>} row @param {number} beforeTurn */
function copiedPrizesBeforeTurn(row,beforeTurn){
  let total=0;
  for(const t of row.publicAttackTransitions??[]){
    if(t.turnBefore>=beforeTurn||!t.settled||
      t.triggerPlayerSlot!==row.rank5Seat||
      !(t.declarations??[]).some(d=>d.attackName==='Cross Fusion Strike'))continue;
    total+=t.beforePrizesRemaining[row.rank5Seat]-
      t.settled.prizesRemaining[row.rank5Seat];
  }
  return total;
}
/**
 * Compare unchanged original printed 60s across two manually frozen native
 * Store archives. No outcome is a paper competitive win.
 * @param {Record<string,any>} off
 * @param {Record<string,any>} on
 * @param {Record<string,any>} reg
 */
function audit(off,on,reg){
  const controls=index(off,reg),enabled=index(on,reg);
  const a=totals(off),b=totals(on);
  assert.equal(a.quickBall,0);
  assert.equal(b.quickBall,99);
  assert.equal(b.quickBallInAbortLedger,11);
  assert.deepEqual(b.quickBallByRank,{rank5:44,rank11:55});
  assert.equal(b.quickBallNativeTwoChoose,99);
  assert.equal(b.quickBallCompleteNativeChain,97);
  assert.deepEqual(a.status,{'native-terminal':13,'native-capped':41,'native-error':10});
  assert.deepEqual(b.status,{'native-terminal':6,'native-capped':45,'native-error':13});
  assert.deepEqual([a.rank5Wins,a.rank11Wins,b.rank5Wins,b.rank11Wins],[5,8,0,6]);
  assert.deepEqual([a.sourceRank5Cross,a.crossSettled,a.crossPrize],[32,30,40]);
  assert.deepEqual([b.sourceRank5Cross,b.crossSettled,b.crossPrize],[16,12,11]);
  assert.equal(controls.size,64);
  assert.equal(enabled.size,64);
  let identicalDeals=0,identicalFirstTurns=0,changedStatuses=0,
    unchangedRootTrajectories=0,matchedTermSourceCrossPrizesOff=0,
    matchedTermSourceCrossPrizesOn=0;
  const pairs=[];
  for(const [k,baseline] of controls){
    const challenger=enabled.get(k);
    assert(challenger,'missing treatment arm '+k);
    assert(originalDeal(baseline),'no full source deal evidence '+k);
    assert.equal(originalDeal(baseline),originalDeal(challenger),
      'physical deal changed '+k);
    identicalDeals++;
    assert.equal(initialTurn(baseline),initialTurn(challenger));
    identicalFirstTurns++;
    const outcomeChanged=baseline.nativeStatus!==challenger.nativeStatus||
      baseline.nativeWinner!==challenger.nativeWinner;
    if(outcomeChanged)changedStatuses++;
    const baseLedger=rootLedger(baseline),trialLedger=rootLedger(challenger);
    if(JSON.stringify(baseLedger)===JSON.stringify(trialLedger))
      unchangedRootTrajectories++;
    const horizon=Math.min(finalObservedTurn(baseline),finalObservedTurn(challenger));
    const baselineCross=copiedPrizesBeforeTurn(baseline,horizon);
    const trialCross=copiedPrizesBeforeTurn(challenger,horizon);
    matchedTermSourceCrossPrizesOff+=baselineCross;
    matchedTermSourceCrossPrizesOn+=trialCross;
    pairs.push({arm:k,commonObservedTurn:horizon,outcomeChanged,
      baselineStatus:baseline.nativeStatus,enabledStatus:challenger.nativeStatus,
      sourceCrossPrizesOff:baselineCross,sourceCrossPrizesOn:trialCross});
  }
  assert.equal(identicalDeals,64);
  assert.equal(identicalFirstTurns,64);
  assert.equal(changedStatuses,12);
  assert.equal(unchangedRootTrajectories,13);
  assert.equal(matchedTermSourceCrossPrizesOff,19);
  assert.equal(matchedTermSourceCrossPrizesOn,11);
  return {schema:'agent11-v4-quickball-exact-paired-archive-audit-v1',
    registrationSha256:off.registrationSha256,headSha:off.runGitSha,
    studyStatus:'development-only, paper-competitive games=0',
    physicalPairParity:identicalDeals,initialTurnParity:identicalFirstTurns,
    changedNativeDispositions:changedStatuses,unchangedRootTrajectories,
    quickBallDisabled:a,quickBallEnabled:b,
    postHocPairedCommonTurnCrossPrizes:{
      off:matchedTermSourceCrossPrizesOff,on:matchedTermSourceCrossPrizesOn,
      warning:'Action-root cap makes per-run prize totals incomparable; this sensitivity uses the earliest common observed turn and includes censored and errored source trajectories'
    },pairs};
}
if(require.main===module){
  assert.equal(process.argv.length,4,
    'usage: node scripts/agent11-v4-quickball-exact-paired-archive-audit.cjs baseline-extracted-v4.json enabled-extracted-v4.json');
  const reg=JSON.parse(fs.readFileSync(REG_PATH,'utf8'));
  /** @param {string} file @param {'off'|'on'} profile */
  function load(file,profile){
    const data=fs.readFileSync(file);
    assert.equal(digest(data),SHA[profile],profile+' original native archive changed');
    return JSON.parse(data.toString('utf8'));
  }
  process.stdout.write(JSON.stringify(audit(
    load(process.argv[2],'off'),load(process.argv[3],'on'),reg),null,2)+'\n');
}
module.exports={audit,originalDeal,rootLedger,finalObservedTurn};
