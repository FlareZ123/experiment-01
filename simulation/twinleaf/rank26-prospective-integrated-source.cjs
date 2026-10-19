'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {firstTurnState}=require('./meloetta-rank26-firstturn-source-window.cjs');
const {initializeCards}=require('./headless.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE}=
  require('./policy-profiles.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
const {withRank26QuickBallTarget}=require('./rank26-quick-ball-target.cjs');
const {withRank26QuickBallIonoCost}=require('./rank26-quick-ball-discard.cjs');
const {withRank26DowsingHold}=require('./rank26-dowsing-hold.cjs');

const SEED_BASE=20261019;
const REPEATS=Object.freeze(Array.from({length:24},(_,i)=>i+60));
const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');

/** @param {object} game @param {number} seat @param {number} seed @param {string[]} a @param {string[]} b */
function summarize(game,seat,seed,a,b){
  assert.equal(game.seed,seed);
  assert.equal(game.engine,ENGINE);
  assert.equal(game.verifiedByDrawLog,true);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  const root=(game.decisionTrace||[]).filter(e=>
    e.playerSlot===seat&&e.turnBefore===1);
  const plays=name=>root.filter(e=>
    e.action==='PlayCardAction'&&e.card===name).length;
  return {
    actions:root.map(e=>({
      ordinal:e.actionOrdinal,kind:e.action,
      card:e.card??null,ability:e.ability??null,
      selected:e.cardSelection?.selectedCards??null
    })),
    cardCounts:{
      quickBall:plays('Quick Ball'),Meloetta:plays('Meloetta ex'),
      Dowsing:plays('Dowsing Machine'),
      Mail:plays("Trainers' Mail"),
      Cologne:plays('Canceling Cologne'),
      pump:plays('Damage Pump')
    },
    attacks:root.filter(e=>e.action==='AttackAction').length,
    opponentPrizes:root.length?root.at(-1).prizesAfter[1-seat]:null,
    terminal:game.finished===true,
    actionCapped:game.finished!==true,
    engineWinner:game.finished===true?game.winner:null
  };
}
/** @returns {object} */
function run(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const enemy=plan.opponents.find(x=>x.rank===6);
  assert.equal(source.length,60);
  assert.equal(enemy?.status,'ready');
  assert.equal(enemy.cards.length,60);
  const cases=[],seen=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(SEED_BASE,'pilot',26,repeat);
    for(const [seatLetter,seed,seat] of [
      ['A',seeds.A,0],['B',seeds.B,1]]){
      assert.ok(!seen.has(seed));
      seen.add(seed);
      const root=firstTurnState(source,enemy.cards,seat,seed);
      assert.equal(root.seed,seed);
      assert.equal(root.verifiedByDrawLog,true);
      assert.equal(root.attackerSeat,seat);
      const a=seat===0?source:enemy.cards;
      const b=seat===1?source:enemy.cards;
      const request={deckA:a,deckB:b,seed,rank26SourceSeat:seat,
        maxActions:120,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        forestSealSearchCorrection:true,
        leleEntryAbilityLockCorrection:true,entryDrawLockCorrection:true,
        label:'rank26-prospective-integrated-'+repeat+'-'+seatLetter};
      const core=()=>runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE);
      const control=withMailScout(seat,core,{starterAgnostic:true});
      const candidate=withRank26QuickBallTarget(seat,()=>
        withRank26QuickBallIonoCost(seat,()=>
          withRank26DowsingHold(seat,()=>
            withMailScout(seat,core,{starterAgnostic:true}))));
      const trial=candidate.result.result.result.result;
      assert.equal(control.result.firstTurnSlot,root.firstTurnSlot);
      assert.equal(trial.firstTurnSlot,root.firstTurnSlot);
      assert.equal(control.result.firstTurnPlayerId,trial.firstTurnPlayerId);
      assert.equal(control.result.firstDrawLogName,trial.firstDrawLogName);
      cases.push({
        repeat,seatLetter,seed,rank26Seat:seat,
        sourceActuallyFirst:root.firstTurnSlot===seat,
        opening:{sourceActive:root.attackerActive,
          sourceBench:root.attackerBench,sourceHand:root.attackerHand,
          opponentActive:root.defenderActive,
          opponentBench:root.defenderBench},
        control:summarize(control.result,seat,seed,a,b),
        candidate:summarize(trial,seat,seed,a,b),
        policies:{
          mailSelections:candidate.result.result.result.policyAudit.selections,
          meloettaChoice:candidate.audit.events,
          ionoCost:candidate.result.audit.events,
          dowsingVeto:candidate.result.result.audit.blocked
        },
        competitiveGameQualified:false
      });
    }
  }
  assert.equal(cases.length,48);
  const real=cases.filter(c=>c.sourceActuallyFirst);
  const sum={
    authenticDeals:cases.length,actualSourceFirst:real.length,
    sourceOpeningMeloetta:real.filter(c=>
      c.opening.sourceActive?.startsWith('Meloetta ex ')||
      c.opening.sourceBench.some(x=>x.startsWith('Meloetta ex '))).length,
    baselineRootMeloetta:real.filter(c=>c.control.cardCounts.Meloetta>0).length,
    variantRootMeloetta:real.filter(c=>c.candidate.cardCounts.Meloetta>0).length,
    baselineRootQuickBall:real.filter(c=>c.control.cardCounts.quickBall>0).length,
    variantRootQuickBall:real.filter(c=>c.candidate.cardCounts.quickBall>0).length,
    variantChosenMeloetta:real.filter(c=>c.policies.meloettaChoice
      .some(e=>e.kind==='chosen')).length,
    variantChosenIono:real.filter(c=>c.policies.ionoCost
      .some(e=>e.kind==='cost-chosen')).length,
    variantHeldDowsing:real.filter(c=>c.policies.dowsingVeto.length>0).length,
    baselineRootAttacks:real.filter(c=>c.control.attacks>0).length,
    variantRootAttacks:real.filter(c=>c.candidate.attacks>0).length,
    variantOppPrizeReduction:real.filter(c=>c.candidate.opponentPrizes<6).length
  };
  return {
    schema:'rank26-prospective-original-source-integrated-policy-exposure-v1',
    sourceRank:26,opponentRank:6,original60s:[60,60],
    seedProtocol:'aichi-decorrelated-slots-v3',
    seedBase:SEED_BASE,repeats:[60,83],
    printedSourceHash:plan.candidateDigest,
    engine:ENGINE,actionCap:120,
    control:'rank26-propagation-v3 + Mail-starter-v2',
    variant:'same + owner Quick Ball Meloetta + Iono cost + Dowsing hold',
    qualification:{competitiveGameWinRate:false,
      opponentCompetence:false,paperClock:false},
    summary:sum,cases
  };
}
/** @param {string} name @param {object} value */
function writeAtomic(name,value){
  const target=path.resolve(process.cwd(),name);
  const lock=target+'.lock';
  const temp=target+'.'+String(process.pid)+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,target);
  }finally{
    fs.closeSync(fd);
    fs.rmSync(lock);
    if(fs.existsSync(temp))fs.rmSync(temp);
  }
}
if(require.main===module){
  const result=run();
  writeAtomic('rank26-prospective-integrated-source.json',result);
  process.stdout.write(JSON.stringify(result.summary,null,2)+'\n');
}
module.exports={run,REPEATS,SEED_BASE};
