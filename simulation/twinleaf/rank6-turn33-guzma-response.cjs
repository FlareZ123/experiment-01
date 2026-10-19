'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile, EXPANDED_PROFILE} =
  require('./policy-profiles.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output,modulePath));
const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
const {Store} = engine('game/store/store');
const {GamePhase} = engine('game/store/state/state');
const {PlayCardAction, PlayerType, SlotType} =
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
const {RetreatAction} = engine('game/store/actions/game-actions');

/** @param {unknown} value */
const sha = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

const EXPECTED_HAND = [
  'Shadow Rider Calyrex V CRE', 'Teammates PRC', 'Raihan EVS',
  "Lillie's Clefairy ex JTG", 'Mysterious Treasure FLI',
  'Shadow Rider Calyrex VMAX CRE', 'Shadow Rider Calyrex VMAX CRE',
  'Guzma BUS'
];

/**
 * Observe one authentic original policy proposal, then optionally replace
 * that exact Pass with Guzma, choosing a publicly unpowered opposing Thorns.
 * Guzma's mandatory own switch goes to a Float Stone Trevenant & Dusknoir.
 * Retreat back to VMAX, if lawful, preserves the original Active attacker.
 *
 * Both branches use the same code revision, source lists, seed and policy.
 * Deck and Prize contents are never inspected to choose the intervention.
 *
 * @template T
 * @param {()=>T} work
 * @param {boolean} force
 * @returns {{result:T, intervention:object}}
 */
function withTurn33Guzma(work,force) {
  assert.equal(typeof work,'function');
  assert.equal(typeof force,'boolean');
  const dispatchDesc = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof dispatchDesc?.value,'function');
  assert.equal(typeof botDesc?.value,'function');

  let root=null;
  let rootOrdinal=0;
  let stage='await';
  const events=[];
  let initialHand=null;
  let initialOpponentBoard=null;
  let originalPolicyAction=null;
  let startingSupporterTurn=null;
  let proposedRngDrawCount=null;

  const dispatch=function(action,...rest) {
    if(!root && action?.constructor?.name==='AddPlayerAction') root=this;
    if(this===root) rootOrdinal++;
    return dispatchDesc.value.call(this,action,...rest);
  };

  const choose=function(state,...args) {
    const actor=state.players?.[0];
    const live=root && state===root.state &&
      this.client?.id===actor?.id &&
      state.activePlayer===0 &&
      state.phase===GamePhase.PLAYER_TURN;
    if(!live) return botDesc.value.call(this,state,...args);
    const pending=state.prompts.find(p=>
      p.playerId===actor.id && p.result===undefined);

    if(stage==='await' && rootOrdinal===227 && state.turn===33 && !pending) {
      initialHand=actor.hand.cards.map(c=>c.fullName);
      assert.deepEqual(initialHand.slice().sort(),EXPECTED_HAND.slice().sort(),
        'Wrong authentic turn33 source hand');
      const foe=state.players[1];
      assert.equal(actor.active.getPokemonCard()?.name,'Shadow Rider Calyrex VMAX');
      assert.equal(actor.active.energies.cards.length,0);
      assert.equal(actor.active.damage,140);
      assert.equal(foe.active.getPokemonCard()?.name,'Iron Thorns ex');
      assert.equal(foe.active.energies.cards.length,2);
      assert.equal(foe.bench.filter(slot=>
        slot.getPokemonCard()?.name==='Iron Thorns ex' &&
        slot.energies.cards.length===0).length,2);
      assert.equal(actor.supporterTurn,0,
        'Guzma must be an unspent Supporter on this physical turn');
      startingSupporterTurn=actor.supporterTurn;
      initialOpponentBoard={
        active:foe.active.getPokemonCard().name,
        activeEnergy:foe.active.energies.cards.map(c=>c.fullName),
        bench:foe.bench.filter(slot=>slot.getPokemonCard())
          .map(slot=>({pokemon:slot.getPokemonCard().name,
            energy:slot.energies.cards.map(c=>c.fullName)}))
      };
      const proposal=botDesc.value.call(this,state,...args);
      originalPolicyAction=proposal?.constructor?.name??null;
      assert.equal(originalPolicyAction,'PassTurnAction',
        'Authentic unmodified source did not propose Pass');
      assert.deepEqual(actor.hand.cards.map(c=>c.fullName),initialHand,
        'Observing the original bot proposal changed held cards');
      events.push({step:'original-proposal',rootOrdinal:228,
        originalAction:originalPolicyAction,forced:force});
      if(!force) {
        stage='control';
        return proposal;
      }
      const index=actor.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
      assert.ok(index>=0);
      stage='gust-opponent';
      events.push({step:'play-guzma',handIndex:index});
      return new PlayCardAction(actor.id,index,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }

    if(stage==='gust-opponent') {
      assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
        'Guzma must request an opposing Bench selection');
      const target=state.players[1].bench.find(slot=>
        slot.getPokemonCard()?.name==='Iron Thorns ex' &&
        slot.energies.cards.length===0);
      assert.ok(target,'Original source lost both unpowered Thorns');
      assert.equal(pending.validate([target],state),true,
        'The observed unpowered Thorns must be a legal Guzma target');
      stage='gust-self';
      events.push({step:'choose-unpowered-opponent',
        pokemon:target.getPokemonCard().name,
        energyCards:target.energies.cards.map(c=>c.fullName)});
      return new ResolvePromptAction(pending.id,[target]);
    }

    if(stage==='gust-self') {
      assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
        'Guzma must request a friendly Bench selection');
      const target=actor.bench.find(slot=>
        slot.getPokemonCard()?.name==='Trevenant & Dusknoir-GX');
      assert.ok(target,'No original Trevenant & Dusknoir on Bench');
      assert.ok(target.tools.cards.some(c=>c.name==='Float Stone'),
        'The proposed own pivot lacks its physical Float Stone');
      assert.equal(pending.validate([target],state),true,
        'The original own Bench pivot is not a valid Guzma target');
      stage='retreat';
      events.push({step:'choose-own-float-stone-pivot',
        pokemon:target.getPokemonCard().name});
      return new ResolvePromptAction(pending.id,[target]);
    }

    if(stage==='retreat') {
      assert.equal(pending,undefined);
      assert.equal(actor.active.getPokemonCard()?.name,'Trevenant & Dusknoir-GX');
      assert.ok(actor.active.tools.cards.some(c=>c.name==='Float Stone'));
      const vmaxIndex=actor.bench.findIndex(slot=>
        slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
      assert.ok(vmaxIndex>=0,
        'Mandatory own switch did not Bench the former Active VMAX');
      stage='finished';
      events.push({step:'free-retreat-to-original-vmax',benchIndex:vmaxIndex});
      return new RetreatAction(actor.id,vmaxIndex);
    }
    return botDesc.value.call(this,state,...args);
  };

  Object.defineProperty(Store.prototype,'dispatch',{...dispatchDesc,value:dispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...botDesc,value:choose});
  try {
    const result=work();
    assert.equal(stage,force?'finished':'control',
      'Turn33 fork did not reach the asserted source prompt sequence');
    return {result, intervention:{
      stage,rootOrdinal,initialHand,initialOpponentBoard,
      startingSupporterTurn,originalPolicyAction,events
    }};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',dispatchDesc);
  }
}

/** @returns {object} Identical-source opponent pressure and bounded reply. */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>x.rank===6);
  assert.ok(plan.candidate.cards&&source?.cards,
    'Require two actual source-resolved paper Expanded 60-card rosters');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(source.cards.length,60);
  const deckHashes=[sha(plan.candidate.cards),sha(source.cards)];
  assert.deepEqual(deckHashes,[
    'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311',
    'b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a'
  ]);

  const request={
    deckA:plan.candidate.cards,
    deckB:source.cards,
    seed:1509836216,
    maxActions:800,
    label:'pilot:6:0:champion-reference:A',
    postSuperAliasRepairIsolation:true,
    attachedToolPowerPolicy:false,
    strictPromptValidation:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };
  const run=force=>withStoreDispatchTranscript(Store,()=>
    withTurn33Guzma(()=>
      runWithResearchProfile(request,EXPANDED_PROFILE),force),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const original=run(false),forced=run(true);
  const controlGame=original.result.result;
  const forkGame=forced.result.result;
  const originalTrace=original.actionTrace;
  const forcedTrace=forced.actionTrace;
  assert.equal(controlGame.finished,true);
  assert.equal(controlGame.firstTurnSlot,0);
  assert.equal(controlGame.actions,373);
  assert.equal(controlGame.winner,1);
  assert.deepEqual(controlGame.prizesRemaining,[4,0]);
  assert.deepEqual(controlGame.deckHashes,deckHashes);
  assert.deepEqual(forkGame.deckHashes,deckHashes);
  assert.equal(forkGame.firstTurnSlot,controlGame.firstTurnSlot);
  assert.equal(forkGame.seed,request.seed);
  assert.deepEqual(original.result.intervention.initialHand,
    forced.result.intervention.initialHand);
  assert.equal(originalTrace[227].action,'PassTurnAction');
  assert.equal(forcedTrace[227].action,'PlayCardAction');
  assert.deepEqual(originalTrace.slice(0,227),forcedTrace.slice(0,227),
    'Any earlier physical action variation invalidates the matched source');
  assert.equal(originalTrace[227].zoneDigestBefore,
    forcedTrace[227].zoneDigestBefore);
  assert.equal(originalTrace[227].continuityDigestBefore,
    forcedTrace[227].continuityDigestBefore);

  /** @param {object} game */
  const gameSummary=game=>({
    observedFinished:game.finished,
    observedEngineWinner:game.finished?game.winner:null,
    globalTurns:game.turns,
    rootActions:game.actions,
    prizesRemaining:game.prizesRemaining,
    declaredAttacks:game.attackTrace.map(t=>({
      turn:t.turn,seat:t.seat,attack:t.attack
    }))
  });
  const responseEvents=trace=>trace.filter(e=>
    e.before?.turn>=33&&e.before?.turn<=35)
    .slice(0,55).map(e=>({
      rootActionOrdinal:e.step,turn:e.before.turn,
      activePlayer:e.before.activePlayer,action:e.action,
      zoneDigestBefore:e.zoneDigestBefore,
      zoneDigestAfter:e.zoneDigestAfter
    }));
  return {
    schema:'agent16-rank6-authentic-turn33-guzma-defensive-gust-v1',
    source:{
      deckRanks:[1,6],trial:request.label,seed:request.seed,
      candidateActualFirst:true,deckHashes,
      engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      researchPolicyProfile:EXPANDED_PROFILE,
      cloneProfile:'post-super-alias-repair-experimental-v2'
    },
    firstAuthenticSourceDivergenceRootOrdinal:228,
    sameSourcePrefixThroughRoot227:true,
    sourceZoneDigestAtDivergence:originalTrace[227].zoneDigestBefore,
    physicalCardContinuityDigestAtDivergence:
      originalTrace[227].continuityDigestBefore,
    sourceDecision:forced.result.intervention,
    control:gameSummary(controlGame),
    forcedGuzmaAndFreeRetreat:gameSummary(forkGame),
    opponentResponseWithinNextTwoTurns:{
      control:responseEvents(originalTrace),
      forced:responseEvents(forcedTrace)
    },
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    limitations:'One retrospectively chosen source seed, hand-held tactic fork, unvalidated paper effects and weak opponent bot. The effect of a delayed attack is tactical evidence, not a game win rate or policy-optimality proof.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={withTurn33Guzma,main};
