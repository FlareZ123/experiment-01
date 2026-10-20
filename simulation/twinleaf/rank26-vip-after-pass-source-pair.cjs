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
      selected:e.cardSelection?.selectedCards??null,
      ...(e.ability?{ability:e.ability}:{})})),
    vipPlays:first.filter(e=>e.action==='PlayCardAction' &&
      e.card==='Battle VIP Pass').length,
    rootAttacks:first.filter(e=>e.action==='AttackAction').length,
    opponentPrizes:first.length?first.at(-1).prizesAfter[1-seat]:null,
    gameFinished:game.finished===true
  };
}

/**
 * Extract a real, actor-owned post-Ability hand transition from the already
 * observed native decision trace. The root after the Ability provides the
 * first settled next-decision own-hand snapshot. No hidden-zone peeking.
 * @param {object} game Completed bounded native runner result.
 * @param {0|1} seat Actual physical source owner.
 * @returns {object|null} Genuine Squawk receipt, if one resolved.
 */
function ownerSquawkReceipt(game,seat) {
  const own=game.decisionTrace.filter(e=>
    e.playerSlot===seat && e.turnBefore===1);
  const root=own.find(e=>e.action==='UseAbilityAction'&&
    e.ability==='Squawk and Seize');
  if(!root)return null;
  const next=own.find(e=>e.actionOrdinal>root.actionOrdinal &&
    e.decisionHandBefore?.perspectiveSeat===seat);
  return {
    ability:root.ability,actionOrdinal:root.actionOrdinal,
    ownerHandBefore:root.decisionHandBefore?.ownHandPrintings??null,
    ownerHandAtNextDecision:next?.decisionHandBefore.ownHandPrintings??null,
    followingRoot:next?{action:next.action,card:next.card??null}:null,
    nativeAbilityTraceMatches:game.abilityTrace.some(e=>
      e.turn===1&&e.seat===seat&&e.name===root.ability),
    firstTurnOnly:true
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
  const verifyCologneFollowup=process.env.RANK26_VIP_COLOGNE_FOLLOWUP==='true';
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
    let vipThenCologne=null;
    if (verifyCologneFollowup && entry.repeat===83 && seat===1) {
      assert.ok(root.attackerHand.some(c=>c.startsWith('Canceling Cologne ')),
        'Frozen 83:B source hand must physically contain its Cologne');
      const continuation=withSourceVipAfterPass(seat,()=>
        withMailScout(seat,core,{starterAgnostic:true}),
        {followupCologne:true});
      const observedFollowup=observed(continuation.result.result,
        seat,entry.seed,a,b);
      const offer=continuation.policyAudit.events.find(e=>
        e.kind==='owner-cologne-after-vip-offer');
      const post=continuation.policyAudit.events.find(e=>
        e.kind==='owner-cologne-postcondition');
      assert.ok(offer,'No owner-visible Cologne continuation after real VIP');
      assert.equal(offer.nativeValid,true,
        'Recorded held Cologne must be a native-valid action');
      assert.equal(observedFollowup.vipPlays,1);
      assert.equal(observedFollowup.firstActions.filter(e=>
        e.kind==='PlayCardAction'&&e.card==='Canceling Cologne').length,1,
        'After VIP, the Store must settle one real Cologne Item');
      assert.equal(post?.sourceHasCologne,false);
      assert.equal(post?.sourceDiscardHasCologne,true);
      vipThenCologne={policy:continuation.policyAudit,
        observed:observedFollowup,offer,post,
        retrospectiveDevelopmentOnly:true};
      const squawkAlternative=withSourceVipAfterPass(seat,()=>
        withMailScout(seat,core,{starterAgnostic:true}),
        {followupCologne:true,preferSquawk:true});
      const squawkGame=observed(squawkAlternative.result.result,
        seat,entry.seed,a,b);
      const squawkReceipt=ownerSquawkReceipt(squawkAlternative.result.result,seat);
      const ownerSearch=squawkAlternative.policyAudit.events.find(e=>
        e.kind==='owner-deck-target');
      assert.ok(ownerSearch,'Native owner-deck VIP prompt missing in alternative');
      const actualSquawk=ownerSearch.cards.some(c=>c.startsWith('Squawkabilly ex '));
      const availableSquawk=ownerSearch.searchedSquawkAvailable===true;
      if(availableSquawk){
        assert.equal(squawkReceipt?.nativeAbilityTraceMatches,true,
          'Accepted VIP Squawk must have actual printed ability trace');
        assert.equal(squawkReceipt?.ownerHandAtNextDecision?.length,6,
          'Actual Squawk and Seize draw six must settle before next root');
      }
      assert.equal(actualSquawk,availableSquawk,
        'Priority must choose searched Squawk when available in frozen state');
      assert.ok(ownerSearch.cards.some(c=>c.startsWith('Meloetta ex ')),
        'Retain physical attacker selection in Squawk branch');
      assert.equal(squawkGame.vipPlays,1);
      const alternateCologne=squawkAlternative.policyAudit.events.find(e=>
        e.kind==='owner-cologne-postcondition');
      const alternateOffer=squawkAlternative.policyAudit.events.find(e=>
        e.kind==='owner-cologne-after-vip-offer');
      assert.ok(alternateOffer?.nativeValid===true);
      assert.equal(alternateCologne?.sourceHasCologne,false);
      assert.equal(alternateCologne?.sourceDiscardHasCologne,true);
      const secondVip=withSourceVipAfterPass(seat,()=>
        withMailScout(seat,core,{starterAgnostic:true}),
        {followupCologne:true,preferSquawk:true,followupSecondVip:true});
      const secondObserved=observed(secondVip.result.result,
        seat,entry.seed,a,b);
      const secondOffer=secondVip.policyAudit.events.find(e=>
        e.kind==='second-vip-offer');
      const secondSearch=secondVip.policyAudit.events.find(e=>
        e.kind==='second-owner-deck-target');
      const secondBoard=secondVip.policyAudit.events.find(e=>
        e.kind==='second-public-board-after');
      assert.equal(secondOffer?.nativeValid,true,
        'Real Squawk replacement hand must offer held second VIP');
      assert.ok(secondSearch,'No actual owner-deck second VIP search observed');
      assert.ok(secondBoard,'No native second VIP Bench observation');
      assert.equal(secondObserved.vipPlays,2,
        'Both physical VIP Items must settle in source first turn');
      const firstBranchPrefix=squawkGame.firstActions.map(a=>a.kind+':'+(a.card??a.ability??''));
      const followupPrefix=secondObserved.firstActions
        .slice(0,squawkGame.firstActions.length-1)
        .map(a=>a.kind+':'+(a.card??a.ability??''));
      assert.deepEqual(followupPrefix,firstBranchPrefix.slice(0,-1),
        'Second VIP must preserve source actions before formerly passed root');
      vipThenCologne.squawkSecondVipContinuation={
        policy:secondVip.policyAudit,observed:secondObserved,
        secondOffer,secondSearch,secondBoard,
        nativeKokoSearchAvailable:secondSearch.searchedKokoAvailable,
        kokoSelected:secondSearch.cards.some(c=>
          c.startsWith('Tapu Koko Prism Star ')),
        retrospectiveDevelopmentOnly:true};
      vipThenCologne.squawkAlternative={
        policy:squawkAlternative.policyAudit,
        observed:squawkGame,ownerSearch,squawkReceipt,
        squawkInOwnerDeckPrompt:availableSquawk,
        actuallyBenchedSquawk:actualSquawk,
        rootAbilities:squawkGame.firstActions.filter(a=>
          a.kind==='UseAbilityAction'),
        retrospectiveDevelopmentOnly:true
      };
    }
    cases.push({...entry,seat,sourceOpening:{active:root.attackerActive,
      bench:root.attackerBench,hand:root.attackerHand},
      control:baseline,candidate,policy:changed.policyAudit,
      nativeVipAcceptance:event.nativeValid,
      ...(vipThenCologne?{vipThenCologne}:{}),
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
    qualifiedCompetitiveGames:0,
    optionalFollowup:verifyCologneFollowup ?
      {sourceDeal:'83:B',developmentOnly:true,
        offers:cases.filter(c=>c.vipThenCologne?.offer.nativeValid).length,
        playedCologne:cases.filter(c=>c.vipThenCologne?.observed.firstActions.some(
          a=>a.kind==='PlayCardAction'&&a.card==='Canceling Cologne')).length,
        firstTurnAttacks:cases.filter(c=>c.vipThenCologne?.observed.rootAttacks>0).length,
        squawkSearchAvailable:cases.filter(c=>
          c.vipThenCologne?.squawkAlternative?.squawkInOwnerDeckPrompt).length,
        squawkSelected:cases.filter(c=>
          c.vipThenCologne?.squawkAlternative?.actuallyBenchedSquawk).length,
        squawkAbilityRoots:cases.reduce((n,c)=>n+
          (c.vipThenCologne?.squawkAlternative?.rootAbilities.length??0),0),
        squawkBranchAttackRoots:cases.filter(c=>
          c.vipThenCologne?.squawkAlternative?.observed.rootAttacks>0).length,
        secondVipNativeOffers:cases.filter(c=>
          c.vipThenCologne?.squawkSecondVipContinuation?.secondOffer.nativeValid).length,
        secondVipPhysicalPlays:cases.reduce((n,c)=>n+
          (c.vipThenCologne?.squawkSecondVipContinuation?.observed.vipPlays??0),0),
        secondVipKokoSearchAvailable:cases.filter(c=>
          c.vipThenCologne?.squawkSecondVipContinuation?.nativeKokoSearchAvailable).length,
        secondVipKokoSelected:cases.filter(c=>
          c.vipThenCologne?.squawkSecondVipContinuation?.kokoSelected).length,
        secondVipAttackRoots:cases.filter(c=>
          c.vipThenCologne?.squawkSecondVipContinuation?.observed.rootAttacks>0).length} :
      null,
    cases};
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
module.exports={run,SEEDS,ownerSquawkReceipt};
