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
const {withRank26QuickBallTarget}=require('./rank26-quick-ball-target.cjs');
const {withRank26QuickBallIonoCost}=require('./rank26-quick-ball-discard.cjs');
const {CASES}=require('./rank26-quick-ball-source-pair.cjs');
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');
const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
/** @param {object} game @param {number} seat @param {number} seed @param {string[]} a @param {string[]} b */
function firstTurn(game,seat,seed,a,b){
  assert.equal(game.seed,seed);
  assert.equal(game.engine,ENGINE);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,seat);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  const trace=(game.decisionTrace||[]).filter(e=>
    e.playerSlot===seat&&e.turnBefore===1);
  return {
    rootActions:trace.map(e=>({
      ordinal:e.actionOrdinal,kind:e.action,
      card:e.card??null,ability:e.ability??null,
      selected:e.cardSelection?.selectedCards??null
    })),
    quickBallRoots:trace.filter(e=>e.action==='PlayCardAction'&&e.card==='Quick Ball').length,
    sourceAttacks:trace.filter(e=>e.action==='AttackAction').length,
    opponentPrizesAfter:trace.length?trace.at(-1).prizesAfter[1-seat]:null,
    finished:game.finished===true
  };
}
function execute(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(x=>x.rank===6);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const cases=[];
  for(const c of CASES){
    const seat=c.seat==='A'?0:1;
    const seeds=deriveSlotSeeds(20261105,'pilot',26,c.repeat);
    assert.equal(c.seed,c.seat==='A'?seeds.A:seeds.B);
    const root=firstTurnState(source,opponent.cards,seat,c.seed);
    assert.equal(root.verifiedByDrawLog,true);
    assert.equal(root.firstTurnSlot,seat);
    const a=seat===0?source:opponent.cards;
    const b=seat===1?source:opponent.cards;
    const request={
      deckA:a,deckB:b,seed:c.seed,rank26SourceSeat:seat,
      maxActions:120,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,
      label:'rank26-firstturn-quickball-cost-development-'+c.seed
    };
    const core=()=>withMailScout(seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
      {starterAgnostic:true});
    const baseline=withRank26QuickBallTarget(seat,core);
    const guarded=withRank26QuickBallTarget(seat,()=>
      withRank26QuickBallIonoCost(seat,core));
    const standard=firstTurn(baseline.result.result,seat,c.seed,a,b);
    const alternative=firstTurn(guarded.result.result.result,seat,c.seed,a,b);
    assert.equal(baseline.audit.version,guarded.audit.version);
    assert.deepEqual(baseline.audit.events.filter(e=>e.kind==='chosen'),
      guarded.audit.events.filter(e=>e.kind==='chosen'),
      'Both arms should reach same Meloetta search for these historical seeds');
    cases.push({...c,sourceSeat:seat,
      sourceHand:root.attackerHand,sourceActive:root.attackerActive,
      control:standard,candidate:alternative,
      bothMeloettaSearch:baseline.audit.events.filter(e=>e.kind==='chosen'),
      variantCostAudit:guarded.result.audit,
      qualifiedCompetitiveGame:false});
  }
  assert.equal(cases.length,4);
  const changed=cases.find(c=>c.seed===2046029502);
  assert.equal(changed.variantCostAudit.events.filter(e=>e.kind==='cost-chosen').length,1,
    'Precommitted historical opportunity did not select real Iono cost');
  return {
    schema:'rank26-quick-ball-source-cost-ACE-preservation-development-v1',
    sourceRank:26,opponentRank:6,
    selection:'Retrospective historical development cases; excludes all prospective win-rate denominators',
    engine:ENGINE,sourceCardCount:60,opponentCardCount:60,
    control:'Mail v2 + Propagation v3 + Meloetta Quick Ball search v1',
    variant:'same plus firstturn Quick Ball Iono cost v1',
    summary:{
      cases:cases.length,
      actualQuickBallRoots:cases.reduce((n,c)=>n+c.candidate.quickBallRoots,0),
      chosenIonoCosts:cases.reduce((n,c)=>n+
        c.variantCostAudit.events.filter(e=>e.kind==='cost-chosen').length,0),
      firstturnRootAttackCases:cases.filter(c=>c.candidate.sourceAttacks>0).length,
      opponentPrizeDecreaseCases:cases.filter(c=>
        c.candidate.opponentPrizesAfter!==null&&
        c.candidate.opponentPrizesAfter<6).length
    },
    qualification:{competitiveGameWinRate:false,paperClock:false,
      strongOpponentPolicy:false},cases
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(execute(),null,2)+'\n');
module.exports={execute};
