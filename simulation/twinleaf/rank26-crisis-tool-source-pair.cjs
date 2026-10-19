'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {firstTurnState}=require('./meloetta-rank26-firstturn-source-window.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
const {withRank26CrisisToolGuard}=require('./rank26-crisis-tool-guard.cjs');

const SOURCES=Object.freeze([
  {seed:4148793063,seat:1,repeat:46,subtype:'TM'},
  {seed:2818295704,seat:1,repeat:48,subtype:'TM'},
  {seed:1839183531,seat:0,repeat:49,subtype:'TM'},
  {seed:1394063981,seat:1,repeat:50,subtype:'TM'},
  {seed:49957955,seat:1,repeat:null,subtype:'FLOAT'}
]);
const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
/** @param {string[]} cards @returns {string} */
function digest(cards){
  return crypto.createHash('sha256').update(JSON.stringify(cards)).digest('hex');
}
/** @param {object} game @param {0|1} seat @param {number} seed @param {string[]} a @param {string[]} b */
function inspect(game,seat,seed,a,b){
  assert.equal(game.engine,ENGINE);
  assert.equal(game.seed,seed);
  assert.equal(game.firstTurnSlot,seat);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  const first=(game.decisionTrace||[]).filter(x=>
    x.playerSlot===seat&&x.turnBefore===1);
  const cards=first.filter(x=>x.action==='PlayCardAction').map(x=>x.card);
  return {
    totalFirstActions:first.length,
    firstCards:cards,
    crisisToolPlays:cards.filter(c=>c==='Technical Machine: Crisis Punch').length,
    floatStonePlays:cards.filter(c=>c==='Float Stone').length,
    meloettaPlays:cards.filter(c=>c==='Meloetta ex').length,
    rootAttackActions:first.filter(x=>x.action==='AttackAction').length,
    opponentPrizesAfter:first.length
      ?first[first.length-1].prizesAfter[1-seat]:null,
    selected:first.map(x=>({
      ordinal:x.actionOrdinal,kind:x.action,card:x.card??null
    })),
    finished:game.finished===true,actions:game.actions
  };
}
/** @returns {object} */
function compare(){
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const opposite=plan.opponents.find(row=>row.rank===6);
  assert.equal(source.length,60);
  assert.equal(opposite?.status,'ready');
  assert.equal(opposite.cards.length,60);
  const cases=[];
  for(const entry of SOURCES){
    const {seat,seed,subtype}=entry;
    if(entry.repeat!==null){
      const derived=deriveSlotSeeds(20261105,'pilot',26,entry.repeat);
      assert.equal(seed,seat===0?derived.A:derived.B);
    }
    const root=firstTurnState(source,opposite.cards,seat,seed);
    assert.equal(root.firstTurnSlot,seat);
    assert.equal(root.attackerSeat,seat);
    const a=seat===0?source:opposite.cards;
    const b=seat===1?source:opposite.cards;
    const request={
      deckA:a,deckB:b,rank26SourceSeat:seat,seed,
      maxActions:100,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,
      label:'rank26-crisis-tool-retrospective-source-'+seed
    };
    /** @returns {object} */
    const runner=()=>runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE);
    /** @param {()=>object} call */
    const withEarlyMail=call=>subtype==='FLOAT'
      ?withMailScout(seat,call).result:call();
    const base=inspect(withEarlyMail(runner),seat,seed,a,b);
    const guarded=withRank26CrisisToolGuard(seat,
      ()=>withEarlyMail(runner));
    const variant=inspect(guarded.result,seat,seed,a,b);
    assert.equal(guarded.policyAudit.version,
      'rank26-firstturn-crisis-tool-preservation-v1');
    if(subtype==='TM'){
      assert.ok(!root.attackerActive?.startsWith('Meloetta ex '));
      assert.ok(!root.attackerBench.some(x=>x.startsWith('Meloetta ex ')));
      assert.ok(base.crisisToolPlays>=1,
        'Historical source does not reproduce earlier TM play');
      assert.ok(guarded.policyAudit.blocked.some(x=>
        x.card.startsWith('Technical Machine: Crisis Punch')),
      'No actual firstturn unsafe TM proposal blocked');
    }else{
      assert.ok(root.attackerActive?.startsWith('Meloetta ex '));
      assert.ok(base.floatStonePlays>=1,
        'Historical source does not reproduce active-Meloetta Float Stone');
      assert.ok(guarded.policyAudit.blocked.some(x=>x.card.startsWith('Float Stone')),
        'No active Meloetta Float Stone tool veto observed');
    }
    cases.push({
      sourceSeed:seed,sourceSeat:seat,
      origin:entry.repeat===null?'independently selected historical Meloetta-active seed'
        :'selected retrospective development root from 24-cohort',
      subtype,
      opening:{
        active:root.attackerActive,bench:root.attackerBench,
        sourceHand:root.attackerHand,
        oppositeActive:root.defenderActive,oppositeBench:root.defenderBench
      },
      control:base,toolPreservation:variant,
      intercepted:guarded.policyAudit.blocked,
      competitiveGameQualified:false
    });
  }
  return {
    schema:'rank26-crisis-tool-source-guard-development-v1',
    sourceRank:26,opponentRank:6,printed60s:[60,60],
    sourcePolicy:RANK26_PROPAGATION_PROFILE,
    toolGuardVersion:'rank26-firstturn-crisis-tool-preservation-v1',
    sourceSelection:'retrospective, no rate inference',
    engineRevision:ENGINE,
    summary:{
      cases:cases.length,
      originalFirstturnTM:cases.reduce((n,x)=>n+x.control.crisisToolPlays,0),
      guardFirstturnTM:cases.reduce((n,x)=>n+x.toolPreservation.crisisToolPlays,0),
      originalFirstturnFloat:cases.reduce((n,x)=>n+x.control.floatStonePlays,0),
      guardFirstturnFloat:cases.reduce((n,x)=>n+x.toolPreservation.floatStonePlays,0),
      totalBlockedProposals:cases.reduce((n,x)=>n+x.intercepted.length,0),
      firstturnGuardAttacks:cases.filter(x=>
        x.toolPreservation.rootAttackActions>0).length,
      firstturnGuardPrizeDecrease:cases.filter(x=>
        x.toolPreservation.opponentPrizesAfter!==null&&
        x.toolPreservation.opponentPrizesAfter<6).length
    },
    qualification:{
      legalPromptValidation:true,sourceDrawLogVerified:true,
      hiddenInformationPolicySafe:true,opponentDecisionQuality:false,
      paperTimeLimit:false,competitiveGameWinRate:false
    },cases
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
module.exports={compare,SOURCES};
