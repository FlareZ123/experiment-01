'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {firstTurnState} = require('./meloetta-rank26-firstturn-source-window.cjs');
const {initializeCards} = require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE, runWithResearchProfile} =
  require('./policy-profiles.cjs');
const {withMailScout} = require('./rank26-mail-recovery.cjs');
const {withRank26QuickBallTarget} = require('./rank26-quick-ball-target.cjs');

const CASES = Object.freeze([
  {repeat:43,seat:'A',seed:2046029502},
  {repeat:46,seat:'A',seed:4158340325},
  {repeat:48,seat:'B',seed:2818295704},
  {repeat:49,seat:'A',seed:1839183531}
]);
const ENGINE = 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const digest = cards => crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/** @param {object} game @param {0|1} seat @param {number} seed @param {string[]} a @param {string[]} b */
function inspect(game, seat, seed, a, b) {
  assert.equal(game.seed, seed);
  assert.equal(game.engine, ENGINE);
  assert.equal(game.verifiedByDrawLog, true);
  assert.equal(game.firstTurnSlot, seat);
  assert.equal(game.researchPolicyProfile, RANK26_PROPAGATION_PROFILE);
  assert.deepEqual(game.deckHashes, [digest(a), digest(b)]);
  const roots = (game.decisionTrace || []).filter(e =>
    e.playerSlot === seat && e.turnBefore === 1);
  return {
    actions: roots.map(e => ({
      ordinal:e.actionOrdinal, action:e.action,
      card:e.card || null, ability:e.ability || null,
      selected:e.cardSelection?.selectedCards || null
    })),
    actualQuickBallRoots: roots.filter(e =>
      e.action === 'PlayCardAction' && e.card === 'Quick Ball').length,
    actualRootAttacks: roots.filter(e => e.action === 'AttackAction').length,
    opponentPrizesAfter: roots.length
      ? roots.at(-1).prizesAfter[1-seat] : null,
    turns: game.turns,
    finished: game.finished === true,
    terminalWinner: game.finished === true ? game.winner : null
  };
}

function execute() {
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const enemy=plan.opponents.find(row=>row.rank===6);
  assert.equal(source.length,60);
  assert.equal(enemy?.status,'ready');
  assert.equal(enemy.cards.length,60);
  const cases=[];
  for (const entry of CASES) {
    const seat=entry.seat==='A'?0:1;
    const seeds=deriveSlotSeeds(20261105,'pilot',26,entry.repeat);
    assert.equal(entry.seed,entry.seat==='A'?seeds.A:seeds.B);
    const root=firstTurnState(source,enemy.cards,seat,entry.seed);
    assert.equal(root.verifiedByDrawLog,true);
    assert.equal(root.firstTurnSlot,seat);
    assert.ok(!root.attackerActive?.startsWith('Meloetta ex '));
    assert.ok(!root.attackerBench.some(x=>x.startsWith('Meloetta ex ')));
    const a=seat===0?source:enemy.cards;
    const b=seat===1?source:enemy.cards;
    const request={
      deckA:a,deckB:b,seed:entry.seed,rank26SourceSeat:seat,
      maxActions:120,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,
      label:'rank26-quickball-target-development-'+entry.seed
    };
    const baseline=withMailScout(seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
      {starterAgnostic:true});
    const changed=withRank26QuickBallTarget(seat,()=>
      withMailScout(seat,()=>
        runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
        {starterAgnostic:true}));
    const control=inspect(baseline.result,seat,entry.seed,a,b);
    const candidate=inspect(changed.result.result,seat,entry.seed,a,b);
    assert.equal(baseline.policyAudit.version,
      changed.result.policyAudit.version,
      'Only Quick Ball prompt preference may differ between arms');
    cases.push({
      ...entry,sourceSeat:seat,
      sourceActive:root.attackerActive,
      sourceBench:root.attackerBench,
      sourceOwnerHand:root.attackerHand,
      control,candidate,
      promptPolicy:changed.audit,
      qualifiedCompetitiveGame:false
    });
  }
  const summary={
    developmentCases:cases.length,
    quickBallRootCases:cases.filter(c=>c.candidate.actualQuickBallRoots>0).length,
    quickBallRoots:cases.reduce((sum,c)=>sum+c.candidate.actualQuickBallRoots,0),
    targetedMeloetta:cases.reduce((sum,c)=>sum+
      c.promptPolicy.events.filter(e=>e.kind==='chosen').length,0),
    unavailableSearches:cases.reduce((sum,c)=>sum+
      c.promptPolicy.events.filter(e=>
        e.kind==='unavailable-or-ineligible').length,0),
    rootAttackCases:cases.filter(c=>c.candidate.actualRootAttacks>0).length,
    opponentPrizeReductionCases:cases.filter(c=>
      c.candidate.opponentPrizesAfter!==null &&
      c.candidate.opponentPrizesAfter<6).length
  };
  return {
    schema:'rank26-quick-ball-attacker-prompt-development-v1',
    selection:'Four retrospective Mail-resource opportunities drawn from original prospective 24; no prospective win-rate sample',
    sourceRank:26,opponentRank:6,sourcePrintedCards:60,opponentPrintedCards:60,
    engine:ENGINE,
    policyControl:'rank26 Mail-starter-v2 plus source Propagation-v3',
    policyVariant:'same plus rank26 owner Quick Ball Meloetta preference-v1',
    sourceFirstVerified:true,summary,cases,
    qualification:{competitiveGameWinRate:false,paperClock:false,
      completeFirstturnAttack:false,competentOpposingPolicy:false}
  };
}
if (require.main===module)
  process.stdout.write(JSON.stringify(execute(),null,2)+'\n');
module.exports={execute,CASES};
