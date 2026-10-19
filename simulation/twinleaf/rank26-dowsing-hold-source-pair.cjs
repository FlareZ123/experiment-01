'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {firstTurnState}=require('./meloetta-rank26-firstturn-source-window.cjs');
const {initializeCards}=require('./headless.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE}=require('./policy-profiles.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
const {withRank26QuickBallTarget}=require('./rank26-quick-ball-target.cjs');
const {withRank26QuickBallIonoCost}=require('./rank26-quick-ball-discard.cjs');
const {withRank26DowsingHold}=require('./rank26-dowsing-hold.cjs');
const {CASES}=require('./rank26-quick-ball-source-pair.cjs');
function extract(game,seat){
  const t=game.decisionTrace.filter(x=>x.turnBefore===1&&x.playerSlot===seat);
  return {actions:t.map(x=>({ordinal:x.actionOrdinal,kind:x.action,
    card:x.card??null,selected:x.cardSelection?.selectedCards??null})),
    dowsing:t.filter(x=>x.action==='PlayCardAction'&&x.card==='Dowsing Machine').length,
    attacks:t.filter(x=>x.action==='AttackAction').length,
    opposingPrizes:t.length?t.at(-1).prizesAfter[1-seat]:null};
}
function run(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const aichi=plan.candidate.cards;
  const thorns=plan.opponents.find(x=>x.rank===6);
  assert.equal(aichi.length,60);
  assert.equal(thorns?.cards?.length,60);
  const cases=[];
  for(const x of CASES){
    const seat=x.seat==='A'?0:1;
    const seeds=deriveSlotSeeds(20261105,'pilot',26,x.repeat);
    assert.equal(x.seed,x.seat==='A'?seeds.A:seeds.B);
    const root=firstTurnState(aichi,thorns.cards,seat,x.seed);
    assert.equal(root.verifiedByDrawLog,true);
    assert.equal(root.firstTurnSlot,seat);
    const a=seat===0?aichi:thorns.cards,b=seat===1?aichi:thorns.cards;
    const request={deckA:a,deckB:b,seed:x.seed,
      rank26SourceSeat:seat,maxActions:120,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true};
    const core=()=>withMailScout(seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
      {starterAgnostic:true});
    const withCost=fn=>withRank26QuickBallTarget(seat,()=>
      withRank26QuickBallIonoCost(seat,fn));
    const original=withCost(core);
    const guarded=withCost(()=>withRank26DowsingHold(seat,core));
    const baseGame=original.result.result.result;
    const heldGame=guarded.result.result.result.result;
    assert.equal(baseGame.firstTurnSlot,seat);
    assert.equal(heldGame.firstTurnSlot,seat);
    assert.equal(baseGame.verifiedByDrawLog,true);
    assert.equal(heldGame.verifiedByDrawLog,true);
    assert.deepEqual(baseGame.deckHashes,heldGame.deckHashes);
    const base=extract(baseGame,seat),held=extract(heldGame,seat);
    assert.deepEqual(base.actions.filter(t=>t.ordinal<=25),
      held.actions.filter(t=>t.ordinal<=25));
    cases.push({...x,seat,base,held,hold:guarded.result.result.audit});
  }
  const singled=cases.find(x=>x.seed===2046029502);
  assert.equal(singled.base.dowsing,1);
  assert.equal(singled.held.dowsing,0);
  assert.ok(singled.hold.blocked.length>=1);
  return {schema:'rank26-authentic-dowsing-hold-development-v1',
    status:'historical development; not a competitive performance trial',
    sourceRank:26,opponentRank:6,sourceDeckCards:60,opponentDeckCards:60,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    summary:{cases:cases.length,
      baselineDowsing:cases.reduce((n,c)=>n+c.base.dowsing,0),
      guardedDowsing:cases.reduce((n,c)=>n+c.held.dowsing,0),
      vetoes:cases.reduce((n,c)=>n+c.hold.blocked.length,0),
      attacks:cases.filter(c=>c.held.attacks>0).length,
      prizeDecreases:cases.filter(c=>c.held.opposingPrizes<6).length},
    competitiveGameQualified:false,cases};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
