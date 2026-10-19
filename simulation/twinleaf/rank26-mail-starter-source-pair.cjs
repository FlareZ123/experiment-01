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

// These four cases were identified retrospectively in the 24-case
// preregistered cohort. They are development fixtures, not held-out trials.
const SOURCE_CASES=Object.freeze([
  {repeat:43,seat:'A',seed:2046029502},
  {repeat:46,seat:'A',seed:4158340325},
  {repeat:48,seat:'B',seed:2818295704},
  {repeat:49,seat:'A',seed:1839183531}
]);

/** @param {string[]} cards @returns {string} */
function digest(cards){
  return crypto.createHash('sha256').update(JSON.stringify(cards)).digest('hex');
}

/** @param {object} game @param {0|1} seat @param {number} seed @param {string[]} a @param {string[]} b */
function inspect(game,seat,seed,a,b){
  assert.equal(game.seed,seed);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,seat);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  const first=(game.decisionTrace||[]).filter(action=>
    action.playerSlot===seat&&action.turnBefore===1);
  const mail=first.filter(action=>
    action.action==='PlayCardAction'&&action.card==="Trainers' Mail");
  const resolutions=first.filter(action=>
    action.action==='ResolvePromptAction').map(action=>({
      ordinal:action.actionOrdinal,
      selected:action.cardSelection?.selectedCards??null
    }));
  return {
    actions:first.map(action=>({
      ordinal:action.actionOrdinal,
      kind:action.action,
      card:action.card??null,
      ability:action.ability??null
    })),
    mailRoots:mail.length,
    mailStoreCount:game.cardsPlayedBySeat[seat]["Trainers' Mail"]||0,
    sourceRootAttackActions:first.filter(action=>
      action.action==='AttackAction').length,
    sourceOpponentPrizesAfter:first.length
      ?first[first.length-1].prizesAfter[1-seat]:null,
    promptResolutions:resolutions,
    finished:game.finished===true,
    actionCapped:game.finished!==true,
    engineWinner:game.finished===true?game.winner:null
  };
}

/** @returns {object} */
function compare(){
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(row=>row.rank===6);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const cases=[];
  for(const entry of SOURCE_CASES){
    const seat=entry.seat==='A'?0:1;
    const generated=deriveSlotSeeds(20261105,'pilot',26,entry.repeat);
    assert.equal(entry.seed,entry.seat==='A'?generated.A:generated.B);
    const root=firstTurnState(source,opponent.cards,seat,entry.seed);
    assert.equal(root.firstTurnSlot,seat);
    assert.equal(root.attackerSeat,seat);
    assert.ok(!root.attackerActive?.startsWith('Meloetta ex '));
    assert.ok(!root.attackerBench.some(x=>x.startsWith('Meloetta ex ')));
    assert.ok(root.attackerHand.some(x=>x.startsWith("Trainers' Mail ")));
    assert.ok(!root.attackerHand.some(x=>
      x.startsWith('Risky Ruins ')||x.startsWith('Canceling Cologne ')));
    assert.equal(root.defenderActive?.startsWith('Iron Thorns ex '),true);
    const a=seat===0?source:opponent.cards;
    const b=seat===1?source:opponent.cards;
    const request={
      deckA:a,deckB:b,rank26SourceSeat:seat,seed:entry.seed,
      maxActions:120,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      forestSealSearchCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,
      label:'rank26-mail-starter-development-'+entry.repeat+'-'+entry.seat
    };
    const baseline=withMailScout(seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
    const extended=withMailScout(seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
    {starterAgnostic:true});
    const control=inspect(baseline.result,seat,entry.seed,a,b);
    const candidate=inspect(extended.result,seat,entry.seed,a,b);
    assert.equal(baseline.policyAudit.version,'rank26-mail-scout-v1');
    assert.equal(extended.policyAudit.version,'rank26-mail-scout-starter-agnostic-v2');
    assert.equal(baseline.policyAudit.selections.length,0);
    assert.ok(extended.policyAudit.selections.length>=1,
      'Expected new owner-hand first-turn Mail branch never selected');
    assert.ok(candidate.mailRoots>control.mailRoots,
      'No new actual source-root Mail PlayCardAction reached engine');
    assert.ok(candidate.mailStoreCount>control.mailStoreCount,
      'Selected action did not increase genuine source Store Mail use');
    cases.push({
      ...entry,rank26Seat:seat,
      opening:{
        rank26Active:root.attackerActive,
        rank26Bench:root.attackerBench,
        ownerHand:root.attackerHand,
        thornsActive:root.defenderActive,
        thornsBench:root.defenderBench
      },
      control,
      candidate,
      selectedMail:extended.policyAudit.selections,
      controlMail:baseline.policyAudit.selections,
      qualifiedForCompetitiveInference:false
    });
  }
  assert.equal(cases.length,4);
  return {
    schema:'rank26-starter-agnostic-mail-source-development-v1',
    sourceRank:26,opponentRank:6,sourceRegistered60s:[60,60],
    physicalSourceStartsVerified:true,seedProtocol:'aichi-decorrelated-slots-v3',
    sourceCohort:'20261105/pilot/rank26 repeats43A,46A,48B,49A',
    sourceSeedSelection:'retrospective cases from prior 24-deal training cohort',
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePolicy:RANK26_PROPAGATION_PROFILE,
    baselinePolicy:'rank26-mail-scout-v1',
    candidatePolicy:'rank26-mail-scout-starter-agnostic-v2',
    summary:{
      cases:cases.length,
      sourceRealFirstTurnV1Mail:cases.reduce((n,c)=>n+c.control.mailRoots,0),
      sourceRealFirstTurnV2Mail:cases.reduce((n,c)=>n+c.candidate.mailRoots,0),
      casesWithV2Mail:cases.filter(c=>c.candidate.mailRoots>0).length,
      casesWithSourceRootAttackV2:cases.filter(c=>
        c.candidate.sourceRootAttackActions>0).length,
      casesWithOpponentPrizeReductionV2:cases.filter(c=>
        c.candidate.sourceOpponentPrizesAfter!==null&&
        c.candidate.sourceOpponentPrizesAfter<6).length
    },
    competitiveGameQualified:false,
    notes:[
      'Retrospective source-first hand-visible policy-development cases only',
      'No hidden cards are used by the policy; root hand is post-hoc provenance',
      'Mail root choices and Store outcomes do not establish an optimal policy',
      'No official timed matches or tournament-strength win-rate qualification'
    ],
    cases
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
module.exports={compare,SOURCE_CASES};
