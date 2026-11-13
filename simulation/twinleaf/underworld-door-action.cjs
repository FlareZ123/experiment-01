'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');

/**
 * An exact midgame action probe of the protected Underworld Door:
 * announce PowerEffect, resolve its Energy-attachment prompt and verify both
 * attachment and the two-card draw. Full-turn setup rules are outside scope.
 *
 * @param {{hood:boolean,jammer:boolean,active:boolean,sourceTool?:string,garbodorPrint?:'BKP'|'LTR',garbodorTool?:boolean,stadium?:string,wobbuffetActive?:boolean,actingSeat?:boolean,observeOwnerBeforePower?:Function,manualActiveEnergyIfV3Veto?:boolean,heldHoodBeforePower?:boolean,payHeldHoodBeforePower?:boolean}} options
 * @returns {{allowed:boolean, attached:number, drawn:number, handCount:number}}
 */
function underworldDoorAction(options) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PowerEffect } = engine('game/store/effects/game-effects');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const { AttachEnergyPrompt } = engine('game/store/prompts/attach-energy-prompt');
  const { PlayerType, SlotType } = engine('game/store/actions/play-card-action');

  const manager = initializeCards();
  const get = fullname => {
    const value = manager.getCardByName(fullname);
    assert.ok(value, 'Pinned engine card missing ' + fullname);
    return value;
  };
  const locker = new Player();
  locker.id = 101;
  if (options.garbodorPrint) {
    locker.active.cards.push(get('Shadow Rider Calyrex V CRE'));
    if (options.jammer) locker.active.tools.push(get('Tool Jammer BST'));
    const garbodorSlot = new PokemonCardList();
    garbodorSlot.cards.push(get('Trubbish BKP'), get('Garbodor ' + options.garbodorPrint));
    if (options.garbodorTool !== false) {
      garbodorSlot.tools.push(get('Stealthy Hood UNB'));
    }
    locker.bench.push(garbodorSlot);
  } else {
    locker.active.cards.push(get('Iron Thorns ex TWM'));
    if (options.jammer) locker.active.tools.push(get('Tool Jammer BST'));
  }

  if (options.stadium) locker.stadium.cards.push(get(options.stadium));

  const player = new Player();
  player.id = 202;
  const vmaxSlot = new PokemonCardList();
  vmaxSlot.cards.push(get('Shadow Rider Calyrex V CRE'));
  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  vmaxSlot.cards.push(vmax);
  assert.ok(!(options.hood && options.sourceTool),
    'Source VMAX can have only one Pokémon Tool');
  if (options.hood) vmaxSlot.tools.push(get('Stealthy Hood UNB'));
  if (options.sourceTool) vmaxSlot.tools.push(get(options.sourceTool));

  const other = new PokemonCardList();
  other.cards.push(get('Shadow Rider Calyrex V CRE'));
  if (options.wobbuffetActive) {
    const wobSlot = new PokemonCardList();
    wobSlot.cards.push(get('Wobbuffet PHF'));
    player.active = wobSlot;
    player.bench.push(vmaxSlot, other);
  } else if (options.active) {
    player.active = vmaxSlot;
    player.bench.push(other);
  } else {
    player.active = other;
    player.bench.push(vmaxSlot);
  }
  const psychic = get('Psychic Energy SVE');
  player.hand.cards.push(psychic);
  let heldHood=null;
  if(options.heldHoodBeforePower){
    assert.equal(options.hood,false,
      'Physical held Hood test must begin with the Bench Tool slot free');
    heldHood=get('Stealthy Hood UNB');
    player.hand.cards.push(heldHood);
  }
  player.deck.cards.push(get('Psychic Energy SVE'), get('Psychic Energy SVE'));
  const initialDeck = player.deck.cards.length;

  // This staged state is already in a midgame turn. Give both sides real
  // nonempty Prize zones before dispatch: otherwise native checkState()
  // interprets two empty Prize zones as a tied game and initiates sudden death,
  // sweeping the newly attached Energy into the deck.
  const { CardList } = engine('game/store/state/card-list');
  for (const participant of [locker, player]) {
    participant.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(get('Psychic Energy SVE'));
      return prize;
    });
  }

  const state = new State();
  state.players = [locker, player];
  if (options.actingSeat) state.activePlayer = 1;
  const store = new Store({onStateChange() {}});
  store.state = state;
  const target = player.bench[0];
  if (options.observeOwnerBeforePower) {
    assert.equal(options.actingSeat, true,
      'Owner observation requires the acting owner physical seat');
    assert.equal(typeof options.observeOwnerBeforePower, 'function');
    const priorPhase = state.phase;
    state.phase = GamePhase.PLAYER_TURN;
    const {actorObservation} = require('./actor-observation-contract.cjs');
    try {
      options.observeOwnerBeforePower(actorObservation(state, 1));
    } finally {
      state.phase = priorPhase;
    }
  }

  let hoodPayment=null;
  if(options.payHeldHoodBeforePower){
    assert.equal(options.actingSeat,true,'Only genuine actor can pay Hood');
    assert.ok(heldHood,'Real in-hand Hood is required');
    state.phase=GamePhase.PLAYER_TURN;
    state.activePlayer=1;
    state.turn=2;
    const {PlayCardAction}=engine('game/store/actions/play-card-action');
    const handIndex=player.hand.cards.indexOf(heldHood);
    const previousHand=player.hand.cards.length;
    const settled=store.dispatch(new PlayCardAction(player.id,handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    const owner=settled.players.find(item=>item.id===player.id);
    assert.ok(owner,'Native action must settle in the genuine owner state');
    hoodPayment={
      actualPhysicalToolAttached:owner.bench[0].tools.includes(heldHood),
      actualPhysicalToolLeavesHand:!owner.hand.cards.includes(heldHood),
      handBefore:previousHand,
      handAfter:owner.hand.cards.length,
      sourceBenchToolCount:owner.bench[0].tools.length,
      pendingPrompts:settled.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)
    };
    assert.equal(hoodPayment.actualPhysicalToolAttached,true);
    assert.equal(hoodPayment.actualPhysicalToolLeavesHand,true);
  }

  const promptsBeforeUnderworld = state.prompts.filter(
    prompt => prompt.result === undefined).map(prompt => prompt.id);
  const powerCheck = new CheckPokemonPowersEffect(player, vmax);
  store.reduceEffect(state, powerCheck);
  const powerListed = powerCheck.powers.some(p => p.name === 'Underworld Door');
  let manualFallback = null;
  if (options.manualActiveEnergyIfV3Veto) {
    assert.equal(options.actingSeat, true, 'Manual fallback owner must be acting');
    state.activePlayer = 1;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 2;
    const {actorObservation} = require('./actor-observation-contract.cjs');
    const {classifyNeutralThornsVeto} = require(
      './2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
    const decision = classifyNeutralThornsVeto(
      actorObservation(state, 1), {
        kind:'use-underworld-door',
        sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
        position:options.active?'active':'bench',
        benchIndex:0
      });
    assert.equal(decision.veto, true,
      'Cannot demonstrate fallback without a proven public Ability veto');
    const {PlayCardAction} = engine('game/store/actions/play-card-action');
    const before=player.active.energies.cards.length;
    const previousHand=player.hand.cards.length;
    const settled = store.dispatch(new PlayCardAction(player.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const recipient = settled.players.find(candidate => candidate.id === player.id);
    assert.ok(recipient,'Native Store must retain the original acting owner');
    const attachedPhysicalCard = recipient.active.energies.cards.includes(psychic);
    const leftPhysicalHand = !recipient.hand.cards.includes(psychic);
    manualFallback = {
      decisionReason:decision.reason,
      attachedPhysicalCard,
      leftPhysicalHand,
      activeEnergiesBefore:before,
      activeEnergiesAfter:recipient.active.energies.cards.length,
      handCountBefore:previousHand,
      handCountAfter:recipient.hand.cards.length,
      nativePlayCardAccepted:attachedPhysicalCard && leftPhysicalHand,
      pendingNativePromptsAfterAttachment:
        settled.prompts.filter(prompt => prompt.result === undefined)
          .map(prompt => prompt.constructor.name)
    };
  }

  if(manualFallback){
    assert.equal(powerListed,false,
      'Actual pinned Store must find Underworld suppressed under visible Thorns');
    return {allowed:false,powerListed,
      blockedReason:'policy-veto-without-announcing-underworld',
      blockedStack:null,attached:0,drawn:0,
      handCount:player.hand.cards.length,manualFallback,...(hoodPayment?{hoodPayment}:{})};
  }

  let allowed = true;
  let blockedReason;
  let blockedStack;
  try {
    store.reduceEffect(state, new PowerEffect(player, vmax.powers[0], vmax, vmaxSlot));
  } catch (error) {
    allowed = false;
    blockedReason = String(error.message);
    blockedStack = String(error.stack).split('\n').slice(0, 8);
    assert.ok(/BLOCKED|CANNOT_USE_POWER|UNKNOWN_POWER/.test(String(error.message)),
      'Unexpected Ability failure: ' + String(error.message));
  }
  if (!allowed) {
    assert.deepEqual(
      state.prompts.filter(p => p.result === undefined).map(p => p.id),
      promptsBeforeUnderworld,
      'Blocked Underworld must not create additional unresolved prompts');
    return { allowed, powerListed, blockedReason, blockedStack, attached: 0, drawn: 0, handCount: player.hand.cards.length, ...(manualFallback?{manualFallback}:{}), ...(hoodPayment?{hoodPayment}:{}) };
  }

  const pending = state.prompts.find(p => p.result === undefined);
  assert.ok(pending instanceof AttachEnergyPrompt, 'Underworld Door must request Energy attachment');
  store.dispatch(new ResolvePromptAction(pending.id, [{
    to: {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0},
    card: psychic
  }]));
  return {
    allowed,
    powerListed,
    attached: target.energies.cards.filter(c => c.name === 'Psychic Energy').length,
    drawn: initialDeck - player.deck.cards.length,
    handCount: player.hand.cards.length,
    ...(hoodPayment?{hoodPayment}:{})
  };
}

/** @returns {object} Deterministic raw source and patched effect traces. */
function runTest() {
  const cases = [
    {hood:true,jammer:false,active:false,allowed:true},
    {hood:true,jammer:true,active:false,allowed:true},
    {hood:true,jammer:true,active:true,allowed:false},
    {hood:false,jammer:true,active:false,allowed:false},
    {hood:false,jammer:false,active:false,wobbuffetActive:true,allowed:false},
    {hood:false,jammer:true,active:false,wobbuffetActive:true,allowed:false},
    {hood:false,jammer:false,active:false,wobbuffetActive:true,actingSeat:true,allowed:true},
    {hood:false,jammer:true,active:false,wobbuffetActive:true,actingSeat:true,allowed:true},
    {hood:true,jammer:false,active:false,garbodorPrint:'BKP',allowed:true},
    {hood:true,jammer:true,active:false,garbodorPrint:'BKP',allowed:true},
    {hood:false,jammer:true,active:false,garbodorPrint:'BKP',allowed:false},
    {hood:true,jammer:false,active:false,garbodorPrint:'LTR',allowed:true},
    {hood:false,jammer:false,active:false,garbodorPrint:'BKP',allowed:false},
    {hood:false,jammer:false,active:false,garbodorPrint:'LTR',allowed:false},
    {hood:false,jammer:false,active:false,garbodorPrint:'BKP',garbodorTool:false,allowed:true},
    {hood:true,jammer:false,active:false,stadium:'Path to the Peak CRE',allowed:false},
    {hood:true,jammer:true,active:false,stadium:'Jamming Tower TWM',allowed:false}
  ];
  const restore = installToolJammerHook();
  try {
    return cases.map(row => {
      const result = underworldDoorAction(row);
      assert.equal(result.allowed, row.allowed, JSON.stringify(row));
      assert.equal(result.attached, row.allowed ? 1 : 0, JSON.stringify(row));
      assert.equal(result.drawn, row.allowed ? 2 : 0, JSON.stringify(row));
      assert.equal(result.handCount, row.allowed ? 2 : 1, JSON.stringify(row));
      return {...row, result};
    });
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind:'midgame-underworld-door-full-action',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:runTest()
  }, null, 2));
}

module.exports = {underworldDoorAction, runTest};
