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
const {withSourceVipAfterPass}=
  require('./rank26-first-own-vip-after-pass.cjs');

const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS=Object.freeze([
  {repeat:63,seatLetter:'A',seed:26947711},
  {repeat:63,seatLetter:'B',seed:1093191703},
  {repeat:78,seatLetter:'B',seed:3278006979},
  {repeat:80,seatLetter:'B',seed:2274498611},
  {repeat:83,seatLetter:'B',seed:2614852201}
]);
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/** @param {object} game @param {0|1} seat @param {number} seed @param {string[]} a @param {string[]} b */
function observed(game,seat,seed,a,b){
  assert.equal(game.engine,ENGINE);
  assert.equal(game.seed,seed);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,seat);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  const first=game.decisionTrace.filter(e=>
    e.playerSlot===seat && e.turnBefore===1);
  return {
    firstActions:first.map(e=>({kind:e.action,card:e.card??null,
      selected:e.cardSelection?.selectedCards??null})),
    vipPlays:first.filter(e=>e.action==='PlayCardAction' &&
      e.card==='Battle VIP Pass').length,
    rootAttacks:first.filter(e=>e.action==='AttackAction').length,
    opponentPrizes:first.length?first.at(-1).prizesAfter[1-seat]:null,
    gameFinished:game.finished===true
  };
}

/** @returns {object} Five retrospective source-deal policy falsification arms. */
function run(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const enemy=plan.opponents.find(p=>p.rank===6);
  assert.equal(source.length,60);
  assert.equal(enemy?.status,'ready');
  assert.equal(enemy.cards.length,60);
  const cases=[];
  for(const entry of SEEDS){
    const seat=entry.seatLetter==='A'?0:1;
    const generated=deriveSlotSeeds(20261019,'pilot',26,entry.repeat);
    assert.equal(entry.seed,seat===0?generated.A:generated.B);
    const root=firstTurnState(source,enemy.cards,seat,entry.seed);
    assert.equal(root.firstTurnSlot,seat);
    assert.ok(!root.attackerActive?.startsWith('Meloetta ex '));
    assert.ok(!root.attackerBench.some(x=>x.startsWith('Meloetta ex ')));
    assert.ok(!root.attackerHand.some(x=>x.startsWith('Meloetta ex ')));
    assert.ok(root.attackerHand.some(x=>x.startsWith('Battle VIP Pass ')));
    const a=seat===0?source:enemy.cards;
    const b=seat===1?source:enemy.cards;
    const request={deckA:a,deckB:b,rank26SourceSeat:seat,
      seed:entry.seed,maxActions:120,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,label:'rank26-vip-development-'+entry.seed};
    const core=()=>runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE);
    const control=withMailScout(seat,core,{starterAgnostic:true});
    const changed=withSourceVipAfterPass(seat,()=>
      withMailScout(seat,core,{starterAgnostic:true}));
    const baseline=observed(control.result,seat,entry.seed,a,b);
    const candidate=observed(changed.result.result,seat,entry.seed,a,b);
    assert.equal(baseline.vipPlays,0,
      'Published historical source-first pass no longer reproduces');
    const event=changed.policyAudit.events.find(e=>
      e.kind==='source-pass-vip-opportunity');
    assert.ok(event,'No historical source-first native VIP opportunity inspected');
    cases.push({...entry,seat,sourceOpening:{active:root.attackerActive,
      bench:root.attackerBench,hand:root.attackerHand},
      control:baseline,candidate,policy:changed.policyAudit,
      nativeVipAcceptance:event.nativeValid,
      competitiveGameQualified:false});
  }
  return {schema:'rank26-first-own-held-vip-retrospective-development-v1',
    selection:'five selected earlier registered firstturn Item-held openings; excludes performance',
    engine:ENGINE,sourceRank:26,opponentRank:6,original60s:[60,60],
    sourcePolicy:RANK26_PROPAGATION_PROFILE,
    policyVersion:'rank26-first-own-vip-after-pass-v1',
    summary:{sourceOpens:cases.length,
      nativeValidOffers:cases.filter(c=>c.nativeVipAcceptance).length,
      controlsPlayingVip:cases.reduce((n,c)=>n+c.control.vipPlays,0),
      variantsPlayingVip:cases.reduce((n,c)=>n+c.candidate.vipPlays,0),
      variantRootAttacks:cases.filter(c=>c.candidate.rootAttacks>0).length,
      variantPrizeReduction:cases.filter(c=>c.candidate.opponentPrizes<6).length},
    qualifiedCompetitiveGames:0,cases};
}

/** @param {string} name @param {object} value */
function writeAtomic(name,value){
  const target=path.resolve(process.cwd(),name);
  const lock=target+'.lock';
  const temp=target+'.'+String(process.pid)+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,target);
  } finally {
    fs.closeSync(fd);
    fs.rmSync(lock);
    if(fs.existsSync(temp))fs.rmSync(temp);
  }
}
if(require.main===module){
  const result=run();
  writeAtomic('rank26-vip-after-pass-source-pair.json',result);
  process.stdout.write(JSON.stringify(result.summary,null,2)+'\n');
}
module.exports={run,SEEDS};
