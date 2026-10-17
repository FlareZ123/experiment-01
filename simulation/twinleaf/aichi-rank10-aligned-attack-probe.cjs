'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');
const {observableState,hash:historyHash}=require('./source-state-continuity.cjs');
const {storeDataGraphFingerprint}=require('./store-data-graph-fingerprint.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));
/** @param {unknown} value */
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Observe an actual Koraidon decision on a first-AddPlayerAction source Store.
 * The observer never proposes an action, mutates gameplay, or explores the
 * opponent's hidden zones. Fingerprints deliberately include hidden cards only
 * in a non-policy diagnostic to establish paired game-source equivalence.
 *
 * @template T
 * @param {()=>T} work Execute genuine 60-versus-60 game.
 * @returns {{game:T,observations:object[]}}
 */
function observeKoraidonTurn5(work) {
  const {Store}=engine('game/store/store');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const storeDescriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDescriptor=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.ok(typeof storeDescriptor?.value==='function' &&
    typeof botDescriptor?.value==='function');
  let root=null;
  const observations=[];
  Object.defineProperty(Store.prototype,'dispatch',{
    ...storeDescriptor,value:function(action,...args) {
      if(root===null && action?.constructor?.name==='AddPlayerAction') root=this;
      return storeDescriptor.value.call(this,action,...args);
    }
  });
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...botDescriptor,value:function(state,...args) {
      const current=state.players[state.activePlayer];
      if(root===null || root.state!==state || state.turn!==5 ||
          this.client.id!==202 || current?.id!==202 ||
          current.active.getPokemonCard()?.fullName!=='Koraidon ex TEF' ||
          state.prompts.some(prompt=>prompt.result===undefined)) {
        return botDescriptor.value.call(this,state,...args);
      }
      const before={
        zones:zoneSnapshotDigest(sourceZoneSnapshot(state)),
        history:historyHash(observableState(state)),
        store:storeDataGraphFingerprint(root).digest
      };
      const action=botDescriptor.value.call(this,state,...args);
      const after={
        zones:zoneSnapshotDigest(sourceZoneSnapshot(state)),
        history:historyHash(observableState(state)),
        store:storeDataGraphFingerprint(root).digest
      };
      observations.push({
        turn:5,sourceSeat:1,action:action?.constructor?.name??null,
        attack:action?.name??null,before,after,
        policyTimeRootGraphChanged:before.store!==after.store
      });
      return action;
    }
  });
  try {
    return {game:work(),observations};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',botDescriptor);
    Object.defineProperty(Store.prototype,'dispatch',storeDescriptor);
  }
}

/** @param {object} game */
function reportGame(game) {
  return {
    winner:game.winner,finished:game.finished,endReason:game.endReason,
    turns:game.turns,actions:game.actions,firstTurnSlot:game.firstTurnSlot,
    prizesRemaining:game.prizesRemaining,
    turn5OpponentActions:game.decisionTrace
      .filter(row=>row.turnBefore===5 && row.playerSlot===1)
      .map(row=>({action:row.action,attack:row.attack??null})),
    turn5OpponentAttacks:game.attackTrace
      .filter(row=>row.turn===5&&row.seat===1)
      .map(row=>({attack:row.attack,active:row.activePokemon}))
  };
}

/**
 * Compare rank-10 Regidrago only on a frozen global turn-five board, after
 * retaining the original policy on all earlier turns and on candidate seat A.
 * This is a single dealt seed and must not feed a win-rate estimator.
 */
function main() {
  initializeCards();
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  const candidateLists=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(path.resolve(__dirname,
      '../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const results=[];
  for(const candidate of candidateLists) {
    const pair=planAichi(candidate.value,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
    const opponent=pair.opponents.find(row=>row.rank===10);
    assert.equal(pair.candidate.cards.length,60);
    assert.equal(opponent.cards.length,60);
    const common={
      deckA:pair.candidate.cards,deckB:opponent.cards,seed,maxActions:600,
      label:'same-horizon:pilot:10:0:'+candidate.id+':A',
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
      entryDrawLockCorrection:true
    };
    const control=observeKoraidonTurn5(()=>runMatch(common));
    const aligned=observeKoraidonTurn5(()=>runMatch({
      ...common,passHorizonAttack:true,passHorizonAttackSeat:1,
      passHorizonAttackTurn:5
    }));
    const repeat=observeKoraidonTurn5(()=>runMatch(common));
    assert.deepEqual(repeat,control,'Intervention altered repeated source control');
    assert.equal(control.game.firstTurnSlot,1);
    assert.equal(aligned.game.firstTurnSlot,1);
    assert.deepEqual(control.game.deckHashes,aligned.game.deckHashes);
    assert.deepEqual(
      control.game.decisionTrace.filter(row=>row.turnBefore<5),
      aligned.game.decisionTrace.filter(row=>row.turnBefore<5),
      'Turn-five-only intervention changed earlier actual root actions'
    );
    const firstControl=control.observations[0];
    const firstAligned=aligned.observations[0];
    assert.ok(firstControl&&firstAligned,
      'Expected real source Koraidon turn-five decision in both arms');
    assert.deepEqual(firstControl.before,firstAligned.before,
      'Actual same-source Store was not identical before first turn-five choice');
    results.push({
      candidate:candidate.id,
      frozenDeckHashes:[digest(common.deckA),digest(common.deckB)],
      beforeFirstTurn5DecisionIdentical:true,
      precedingActualActionsIdentical:true,
      repeatedControlIdentical:true,
      sourceControlDecision:control.observations,
      sourceAlignedDecision:aligned.observations,
      control:reportGame(control.game),aligned:reportGame(aligned.game)
    });
  }
  return {
    schema:'rank10-same-endturn-horizon-source-policy-contrast-v1',
    evidenceClass:'real-source-fixed-seed-bot-policy-counterfactual-only',
    opponentRank:10,candidatePhysicalSeat:0,candidateActuallySecond:true,
    seed,engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    changedPolicy:'opponent printed AttackTactic scores versus simulated Pass, global turn5 only',
    noAdditionalHiddenInfoAccessInResearchSelector:true,
    upstreamBotInformationSetClean:false,
    qualifiedForCompetitiveInference:false,sourceReplayMechanicsVerified:false,
    limitations:[
      'The underlying speculative Simulator may reveal hidden card order to the generic bot',
      'Source policy competence and paper rule fidelity are unqualified',
      'A repeated deterministic seed is not an independent competitive trial',
      'Extra speculative Pass evaluations can perturb policy RNG after the fork'
    ],
    findings:results
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={observeKoraidonTurn5,reportGame,main};
