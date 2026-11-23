'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const path = require('node:path');
const { stage } = require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const { initializeCards } = require('../../simulation/twinleaf/headless.cjs');
const { installUnderworldDoorPsychicRecipientHook } =
  require('../../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
const loadNative = name => require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', name));

const { Store } = require('../../vendor/twinleaf/ptcg-server/output/game/store/store');
const { State, GamePhase } = require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const { Player } = require('../../vendor/twinleaf/ptcg-server/output/game/store/state/player');
const { ConfirmPrompt } = require('../../vendor/twinleaf/ptcg-server/output/game/store/prompts/confirm-prompt');
const { ResolvePromptAction } = require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');

const {
  projectPrompt,
  dispatchPromptChoice
} = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {
  cloneNativeValidationGraph,
  buildNativeActionFrontier
} = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const {
  createValidationRandomScope,
  seededRandom
} = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');
const {
  createKnownCapFreeActionEnumerator,
  EXPECTED_ENGINE_PIN
} = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');


function makeFixture(groupSize) {
  const state = new State();
  state.phase = GamePhase.SETUP;
  state.activePlayer = 0;

  const actor = new Player();
  actor.id = 101;
  const opponent = new Player();
  opponent.id = 202;
  state.players = [actor, opponent];

  const liveStore = new Store({ onStateChange() {} });
  liveStore.state = state;

  const prompt = new ConfirmPrompt(actor.id, 'GO_FIRST');
  const group = [prompt];
  if (groupSize === 2) {
    group.push(new ConfirmPrompt(opponent.id, 'GO_FIRST'));
  }

  let liveContinuationCalls = 0;
  liveStore.prompt(state, group, () => {
    liveContinuationCalls += 1;
  });

  return { state, liveStore, prompt, group, getLiveContinuationCalls: () => liveContinuationCalls };
}

for (const groupSize of [1, 2]) {
  test('pinned Twinleaf Store validates and settles an unresolved ConfirmPrompt in an isolated Store (group size ' + groupSize + ')', () => {
    const fixture = makeFixture(groupSize);
    const originalState = cloneNativeValidationGraph(fixture.state);
    const originalPromptGroups = fixture.liveStore.promptItems.map(item => item.ids.slice());
    const validationGroupSizes = [];
    let validationContinuationCalls = 0;
    const validationStores = [];

    class ObservedValidationStore extends Store {
      constructor(handler) {
        super(handler);
        validationStores.push(this);
      }

      prompt(state, prompts, then) {
        const group = Array.isArray(prompts) ? prompts : [prompts];
        validationGroupSizes.push(group.length);
        return super.prompt(state, prompts, (...args) => {
          validationContinuationCalls += 1;
          return then(...args);
        });
      }
    }

    const native = {
      Store: ObservedValidationStore,
      ResolvePromptAction
    };
    const projection = projectPrompt({
      prompt: fixture.prompt,
      state: fixture.state,
      actorSeat: 0,
      native
    });

    const prepared = dispatchPromptChoice({
      store: fixture.liveStore,
      prompt: fixture.prompt,
      state: fixture.state,
      actorSeat: 0,
      projection,
      decision: { kind: 'select-choice', token: 'prompt-0' },
      native,
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema, 'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);

    assert.deepEqual(validationGroupSizes, [groupSize],
      'the isolated Store must preserve the original native continuation-group membership');
    assert.equal(validationStores.length, 1);
    const clonedPrompt = validationStores[0].state.prompts.find(item =>
      item.playerId === fixture.prompt.playerId && item.message === 'GO_FIRST');
    assert.ok(clonedPrompt);
    assert.equal(clonedPrompt.result, true,
      'the real pinned Store must apply ResolvePromptAction to the cloned prompt');
    assert.equal(validationContinuationCalls, groupSize === 1 ? 1 : 0,
      'only the isolated no-op continuation may run when its complete prompt group is resolved');

    assert.deepEqual(fixture.state, originalState,
      'prompt validation must not mutate the original native state graph');
    assert.deepEqual(fixture.liveStore.promptItems.map(item => item.ids), originalPromptGroups,
      'prompt validation must not mutate the live Store continuation queue');
    assert.equal(fixture.prompt.result, undefined,
      'prompt validation must not resolve the live native prompt');
    assert.equal(fixture.getLiveContinuationCalls(), 0,
      'prompt validation must not execute the live game continuation');
  });
}

test('Underworld Door AttachEnergyPrompt clone validation uses the cloned prompt/card graph', () => {
  const manager = initializeCards();
  const x = stage(0);
  let id = 87000;
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, name);
    result.id = id++;
    return result;
  };

  const psychic = x.owner.bench[0];
  const offType = x.owner.bench[1];
  psychic.cards.length = 0;
  psychic.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  offType.cards.length = 0;
  offType.cards.push(card('Dialga-GX UPR'));
  x.owner.hand.cards.length = 0;
  const energy = card('Psychic Energy SVE');
  x.owner.hand.cards.push(energy);
  x.owner.deck.cards.length = 0;
  for (let i = 0; i < 4; i++) x.owner.deck.cards.push(card('Psychic Energy SVE'));

  const { UseAbilityAction } = loadNative('game/store/actions/game-actions');
  const { PlayerType, SlotType } = loadNative('game/store/actions/play-card-action');
  const { CheckPokemonTypeEffect } = loadNative('game/store/effects/check-effects');
  const { EnergyCard } = loadNative('game/store/card/energy-card');
  const { CardType, EnergyType, SuperType } = loadNative('game/store/card/card-types');
  const { AttachEnergyPrompt } = loadNative('game/store/prompts/attach-energy-prompt');
  const originalPromptValidate = AttachEnergyPrompt.prototype.validate;
  const restore = installUnderworldDoorPsychicRecipientHook();

  try {
    x.store.dispatch(new UseAbilityAction(x.owner.id, 'Underworld Door', {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
    }));
    let pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));
    pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'AttachEnergyPrompt');

    const sourceCard = psychic.cards.find(item =>
      item.fullName === 'Shadow Rider Calyrex VMAX CRE');
    const nativeBindings = {
      Store, ResolvePromptAction, PlayerType, SlotType,
      CheckPokemonTypeEffect, EnergyCard, CardType, EnergyType, SuperType
    };
    const provenanceHook = {
      getPromptProvenance: () => ({
        sourceKind: 'card-effect', sourceCard, effectName: 'Underworld Door'
      })
    };
    const projection = projectPrompt({
      prompt: pending, state: x.state, actorSeat: 0,
      native: nativeBindings, store: x.store, provenanceHook
    });
    const energyChoice = projection.promptProjection.choices.find(choice =>
      choice.kind === 'energy');
    assert.ok(energyChoice, 'the owner-visible prompt must expose the physical Basic Psychic Energy');
    assert.deepEqual(pending.underworldDoorAllowedBenchIndices, [0]);
    assert.equal(pending.validate([{
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      index: 0,
      card: energy
    }]), false, 'a non-Psychic Bench target must remain rejected');

    const originalState = cloneNativeValidationGraph(x.state);
    const originalPromptGroups = x.store.promptItems.map(item => item.ids.slice());
    const prepared = dispatchPromptChoice({
      store: x.store, prompt: pending, state: x.state, actorSeat: 0,
      projection,
      decision: { kind: 'select-choice', token: energyChoice.token },
      native: nativeBindings,
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema,
      'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);
    assert.deepEqual(x.state, originalState,
      'clone validation must not mutate the live Underworld Door state');
    assert.deepEqual(x.store.promptItems.map(item => item.ids), originalPromptGroups,
      'clone validation must not mutate the live Underworld Door continuation queue');
    assert.equal(pending.result, undefined,
      'clone validation must leave the live AttachEnergyPrompt unresolved');
    assert.equal(x.owner.hand.cards.includes(energy), true);
    assert.equal(psychic.energies.cards.includes(energy), false);

    x.store.dispatch(prepared.action);
    assert.equal(psychic.energies.cards.includes(energy), true);
    assert.equal(offType.energies.cards.includes(energy), false);
    assert.equal(x.owner.deck.cards.length, 2);
    assert.equal(x.owner.hand.cards.length, 2);
    assert.equal(x.state.prompts.filter(prompt => prompt.result === undefined).length, 0);
    assert.equal(restore.isRestored, false,
      'the hook remains installed through live native prompt settlement');
  } finally {
    restore();
    assert.equal(restore.isRestored, true);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  }
});



test('Underworld hook preserves native Blaziken Firestarter AttachEnergyPrompt validation', () => {
  const manager = initializeCards();
  const x = stage(0);
  let id = 88000;
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, name);
    result.id = id++;
    return result;
  };

  const blaziken = card('Blaziken DRM');
  const fireEnergy = card('Fire Energy SVE');
  x.owner.bench[0].cards.length = 0;
  x.owner.bench[0].cards.push(blaziken);
  x.owner.discard.cards.length = 0;
  x.owner.discard.cards.push(fireEnergy);

  const { UseAbilityAction } = loadNative('game/store/actions/game-actions');
  const { PlayerType, SlotType } = loadNative('game/store/actions/play-card-action');
  const { AttachEnergyPrompt } = loadNative('game/store/prompts/attach-energy-prompt');
  const originalPromptValidate = AttachEnergyPrompt.prototype.validate;
  const restore = installUnderworldDoorPsychicRecipientHook();

  try {
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate,
      'the Underworld hook must not replace the shared AttachEnergyPrompt prototype validator');

    x.store.dispatch(new UseAbilityAction(x.owner.id, 'Firestarter', {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
    }));
    let pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));

    pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.ok(pending instanceof AttachEnergyPrompt);
    assert.strictEqual(pending.cardList, x.owner.discard,
      'Firestarter must source its Energy from discard, not the Underworld hand');
    assert.equal(Object.prototype.hasOwnProperty.call(pending, 'validate'), false,
      'a non-Underworld prompt must retain the native inherited validator');

    const originalState = cloneNativeValidationGraph(x.state);
    const originalPromptGroups = x.store.promptItems.map(item => item.ids.slice());
    const rawFirestarterChoice = {
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      index: 0
    };
    const projection = {
      promptProjection: {
        choices: [
          { token: 'prompt-0', kind: 'energy', label: 'Fire Energy SVE' },
          { token: 'prompt-1', kind: 'cancel', label: 'Cancel selection' }
        ],
        publicMetadata: {
          selectionType: 'energy-payment', energyCount: 1, count: 1, allowCancel: true
        }
      },
      choiceByToken: new Map([
        ['prompt-0', rawFirestarterChoice],
        ['prompt-1', null]
      ])
    };
    const prepared = dispatchPromptChoice({
      store: x.store, prompt: pending, state: x.state, actorSeat: 0,
      projection,
      decision: { kind: 'select-choices', tokens: ['prompt-0'] },
      native: { Store, ResolvePromptAction },
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema,
      'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);
    assert.deepEqual(x.state, originalState,
      'non-Underworld cloned prompt validation must not mutate the live Store state');
    assert.deepEqual(x.store.promptItems.map(item => item.ids), originalPromptGroups,
      'non-Underworld cloned prompt validation must preserve the live continuation queue');
    assert.equal(pending.result, undefined,
      'non-Underworld cloned prompt validation must leave the live prompt unresolved');
    assert.equal(x.owner.discard.cards.includes(fireEnergy), true);
    assert.equal(x.owner.bench[1].energies.cards.includes(fireEnergy), false);
    assert.equal(pending.validate([{
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      card: fireEnergy
    }]), true, 'a native-valid non-Underworld Firestarter selection must remain valid');

    x.store.dispatch(prepared.action);
    assert.equal(x.owner.bench[1].energies.cards.includes(fireEnergy), true);
    assert.equal(x.owner.discard.cards.includes(fireEnergy), false);
    assert.equal(x.store.state.prompts.filter(prompt => prompt.result === undefined).length, 0);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  } finally {
    restore();
    assert.equal(restore.isRestored, true);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  }
});


function nativeFrontierBindings(){
  const cardActions=loadNative('game/store/actions/play-card-action');
  const gameActions=loadNative('game/store/actions/game-actions');
  const promptActions=loadNative('game/store/actions/resolve-prompt-action');
  const {ActionEnumerator}=loadNative('advanced-bot/action-enumerator');
  const {Simulator}=loadNative('game/bots/simulator');
  const {WaitPrompt}=loadNative('game/store/prompts/wait-prompt');
  const {PokemonCard}=loadNative('game/store/card/pokemon-card');
  const {EnergyCard}=loadNative('game/store/card/energy-card');
  const {TrainerCard}=loadNative('game/store/card/trainer-card');
  const {GameError}=loadNative('game/game-error');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition,SuperType}=
    loadNative('game/store/card/card-types');
  return {
    cardActions,gameActions,ActionEnumerator,Simulator,
    PlayerType:cardActions.PlayerType,SlotType:cardActions.SlotType,
    PokemonCard,EnergyCard,TrainerCard,GameError,Stage,TrainerType,
    SpecialCondition,EnergyType,CardType,SuperType,
    ResolvePromptAction:promptActions.ResolvePromptAction,WaitPrompt
  };
}

function buildDeterministicNativeFrontier(x,native,seed,enumerator){
  const withValidationRandom=createValidationRandomScope({
    ambientRandom:Math.random,
    physicalRandom:seededRandom(seed)
  });
  return withValidationRandom(()=>buildNativeActionFrontier({
    state:x.state,actorSeat:0,native,enumerator
  }));
}

function settleStarAlchemy(x,native){
  for(let step=0;step<16;step++){
    const pending=x.state.prompts.find(prompt=>prompt.result===undefined);
    if(!pending)break;
    let result;
    switch(pending.constructor.name){
      case 'WaitPrompt':
        result=null;
        break;
      case 'ChooseCardsPrompt': {
        const energy=x.owner.deck.cards.find(card=>
          card.fullName==='Psychic Energy SVE');
        assert.ok(energy,'Star Alchemy fixture must retain a searchable Basic Psychic Energy');
        result=[energy];
        break;
      }
      case 'ShuffleDeckPrompt':
        result=Array.from({length:x.owner.deck.cards.length},(_,index)=>index);
        break;
      case 'ShowCardsPrompt':
        result=true;
        break;
      default:
        throw new Error('Unexpected Star Alchemy prompt: '+pending.constructor.name);
    }
    x.store.dispatch(new native.ResolvePromptAction(pending.id,result));
  }
  assert.equal(x.state.prompts.some(prompt=>prompt.result===undefined),false,
    'Star Alchemy fixture must settle every real Store prompt');
  assert.equal(x.owner.usedVSTAR,true,
    'the first real Star Alchemy use must consume the VSTAR allowance');
}

test('native action frontier keeps first Star Alchemy use but rejects the deferred spent-VSTAR use',()=>{
  const x=stage(0);
  const manager=initializeCards();
  const native=nativeFrontierBindings();
  let id=91000;
  const card=name=>{
    const template=manager.getCardByName(name);
    assert.ok(template,'Pinned native printing unavailable: '+name);
    const result=cloneNativeValidationGraph(template);
    result.id=id++;
    return result;
  };
  x.owner.bench[0].cards.length=0;
  x.owner.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  const stone=card('Forest Seal Stone SIT');
  x.owner.hand.cards.push(stone);
  const stoneHandIndex=x.owner.hand.cards.indexOf(stone);
  x.store.dispatch(new native.cardActions.PlayCardAction(x.owner.id,stoneHandIndex,{
    player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:0
  }));
  const isStarAlchemy=action=>action?.type==='USE_ABILITY_ACTION'&&
    action.name==='Star Alchemy'&&action.target?.slot===native.SlotType.BENCH&&
    action.target?.index===0;
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  assert.ok(enumerator.enumerate(x.state,x.owner,x.owner.id).some(isStarAlchemy),
    'the native enumerator must expose the unspent Forest Seal Stone ability');
  const beforeUnspent=cloneNativeValidationGraph(x.state);
  const unspentCandidates=enumerator.enumerate(x.state,x.owner,x.owner.id).filter(isStarAlchemy);
  const unspent=buildDeterministicNativeFrontier(x,native,0x13572468,enumerator);
  assert.ok([...unspent.actionByToken.values()].some(isStarAlchemy),
    'the first legal Star Alchemy use must survive cloned WaitPrompt validation');
  assert.deepEqual(x.state,beforeUnspent,
    'frontier validation must leave the live Store unchanged');
  const unspentClone=new native.Simulator(cloneNativeValidationGraph(x.state));
  unspentClone.store.dispatch(unspentCandidates[0]);
  let unspentWait=unspentClone.store.state.prompts.find(prompt=>
    prompt instanceof native.WaitPrompt&&prompt.result===undefined);
  assert.ok(unspentWait,'first Star Alchemy use must create the native animation WaitPrompt');
  unspentClone.store.dispatch(new native.ResolvePromptAction(unspentWait.id,null));
  assert.ok(unspentClone.store.state.prompts.some(prompt=>
    prompt.result===undefined&&prompt.constructor.name==='ChooseCardsPrompt'),
    'settling one WaitPrompt must stop at the first actual Star Alchemy choice prompt');

  x.store.dispatch(new native.gameActions.UseAbilityAction(x.owner.id,'Star Alchemy',{
    player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:0
  }));
  settleStarAlchemy(x,native);
  const spentCandidates=enumerator.enumerate(x.state,x.owner,x.owner.id).filter(isStarAlchemy);
  assert.ok(spentCandidates.length>0,
    'the pinned enumerator must expose the spent action so deferred Store validation is exercised');
  const beforeSpent=cloneNativeValidationGraph(x.state);
  const spentClone=new native.Simulator(cloneNativeValidationGraph(x.state));
  let spentWaitResolved=false;
  assert.throws(()=>{
    spentClone.store.dispatch(spentCandidates[0]);
    const wait=spentClone.store.state.prompts.find(prompt=>
      prompt instanceof native.WaitPrompt&&prompt.result===undefined);
    assert.ok(wait,'spent Star Alchemy must first create its animation WaitPrompt');
    spentWaitResolved=true;
    spentClone.store.dispatch(new native.ResolvePromptAction(wait.id,null));
  },error=>error instanceof native.GameError&&error.message==='LABEL_VSTAR_USED',
  'the second Star Alchemy use must fail specifically in the deferred native PowerEffect');
  assert.equal(spentWaitResolved,true);
  const spent=buildDeterministicNativeFrontier(x,native,0x24681357,enumerator);
  assert.equal([...spent.actionByToken.values()].some(isStarAlchemy),false,
    'the spent Star Alchemy action must be rejected after its cloned WaitPrompt resolves');
  assert.deepEqual(x.state,beforeSpent,
    'spent-ability clone validation must not mutate the live Store');
});

test('native action frontier preserves both source-specific Underworld Door markers through Simulator cloning',()=>{
  const x=stage(0);
  const manager=initializeCards();
  const native=nativeFrontierBindings();
  let id=92000;
  const card=name=>{
    const template=manager.getCardByName(name);
    assert.ok(template,'Pinned native printing unavailable: '+name);
    const result=cloneNativeValidationGraph(template);
    result.id=id++;
    return result;
  };
  for(const index of [0,2]){
    x.owner.bench[index].cards.length=0;
    x.owner.bench[index].cards.push(
      card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE')
    );
  }
  x.owner.bench[1].cards.length=0;
  x.owner.bench[1].cards.push(card('Dialga-GX UPR'));
  x.owner.hand.cards.length=0;
  for(let i=0;i<5;i++)x.owner.hand.cards.push(card('Psychic Energy SVE'));
  x.owner.deck.cards.length=0;
  for(let i=0;i<8;i++)x.owner.deck.cards.push(card('Psychic Energy SVE'));
  const AttachEnergyPrompt=loadNative('game/store/prompts/attach-energy-prompt').AttachEnergyPrompt;
  const restore=installUnderworldDoorPsychicRecipientHook();
  const resolveDoor=(sourceIndex,targetIndex)=>{
    x.store.dispatch(new native.gameActions.UseAbilityAction(x.owner.id,'Underworld Door',{
      player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:sourceIndex
    }));
    let pending=x.state.prompts.find(prompt=>prompt.result===undefined);
    assert.ok(pending instanceof native.WaitPrompt,
      'each Underworld Door use must begin with its real native WaitPrompt');
    x.store.dispatch(new native.ResolvePromptAction(pending.id,null));
    pending=x.state.prompts.find(prompt=>prompt.result===undefined);
    assert.ok(pending instanceof AttachEnergyPrompt,
      'each Underworld Door use must continue to its real native AttachEnergyPrompt');
    const handIndex=x.owner.hand.cards.findIndex(item=>
      item.fullName==='Psychic Energy SVE');
    assert.ok(handIndex>=0,'a physical Basic Psychic Energy must remain in hand');
    const energy=x.owner.hand.cards[handIndex];
    const result=[{
      to:{player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:targetIndex},
      index:handIndex,card:energy
    }];
    assert.equal(pending.validate(result),true,
      'the source-specific Underworld Door prompt must accept its Psychic Bench target');
    x.store.dispatch(new native.ResolvePromptAction(pending.id,result));
    assert.equal(x.owner.bench[targetIndex].energies.cards.includes(energy),true,
      'the physical Psychic Energy must move to the selected Bench Pokémon');
  };
  try{
    resolveDoor(0,2);
    resolveDoor(2,0);
    const sourceA=x.owner.bench[0].getPokemonCard();
    const sourceB=x.owner.bench[2].getPokemonCard();
    assert.notStrictEqual(sourceA,sourceB,
      'the two physical VMAX sources must be distinct card objects');
    assert.equal(typeof sourceA.UNDERWORLD_DOOR_MARKER,'string');
    assert.equal(typeof sourceB.UNDERWORLD_DOOR_MARKER,'string');
    assert.equal(x.owner.marker.hasMarker(sourceA.UNDERWORLD_DOOR_MARKER,sourceA),true,
      'the first VMAX must retain its own spent Door marker');
    assert.equal(x.owner.marker.hasMarker(sourceB.UNDERWORLD_DOOR_MARKER,sourceB),true,
      'the second VMAX must retain its own spent Door marker');
    assert.ok(x.owner.hand.cards.filter(item=>item.fullName==='Psychic Energy SVE').length>=3,
      'repeat-source validation must retain enough Basic Psychic Energy to reach the marker guard');
    const repeatDoorInClone=sourceIndex=>{
      const simulator=new native.Simulator(cloneNativeValidationGraph(x.state));
      const player=simulator.store.state.players[0];
      const otherIndex=sourceIndex===0?2:0;
      const source=player.bench[sourceIndex].getPokemonCard();
      const otherSource=player.bench[otherIndex].getPokemonCard();
      const liveSource=x.owner.bench[sourceIndex].getPokemonCard();
      assert.equal(player.marker.hasMarker(source.UNDERWORLD_DOOR_MARKER,source),true,
        'the cloned marker must be keyed to this cloned VMAX object');
      assert.equal(player.marker.hasMarker(source.UNDERWORLD_DOOR_MARKER,otherSource),false,
        'the first VMAX marker must not transfer to the other cloned VMAX');
      assert.equal(player.marker.hasMarker(source.UNDERWORLD_DOOR_MARKER,liveSource),false,
        'the cloned marker source must not retain the live card object identity');
      let waitResolved=false;
      assert.throws(()=>{
        simulator.store.dispatch(new native.gameActions.UseAbilityAction(player.id,'Underworld Door',{
          player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:sourceIndex
        }));
        const wait=simulator.store.state.prompts.find(prompt=>
          prompt instanceof native.WaitPrompt&&prompt.result===undefined);
        assert.ok(wait,'a repeated source must reach the native Ability-animation WaitPrompt');
        waitResolved=true;
        simulator.store.dispatch(new native.ResolvePromptAction(wait.id,null));
      },error=>error instanceof native.GameError&&error.message==='POWER_ALREADY_USED',
      'a repeated source must fail specifically at its own deferred marker guard');
      assert.equal(waitResolved,true,
        'source-specific marker rejection must occur after resolving the cloned WaitPrompt');
    };
    repeatDoorInClone(0);
    repeatDoorInClone(2);
    const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
    const rawDoors=enumerator.enumerate(x.state,x.owner,x.owner.id)
      .filter(action=>action.type==='USE_ABILITY_ACTION'&&action.name==='Underworld Door');
    assert.deepEqual(rawDoors.map(action=>action.target.index).sort((a,b)=>a-b),[0,2],
      'the regression must exercise both source-specific native Door candidates');
    const built=buildDeterministicNativeFrontier(x,native,0x10293847,enumerator);
    const remainingDoors=[...built.actionByToken.values()].filter(action=>
      action.type==='USE_ABILITY_ACTION'&&action.name==='Underworld Door');
    assert.equal(remainingDoors.length,0,
      'neither spent VMAX Door action may survive cloned Store marker validation');
    assert.ok(built.diagnostics.preflightRejectedCount>=2,
      'both source-specific spent Door actions must be rejected by the physical marker preflight');
  }finally{
    restore();
    assert.equal(restore.isRestored,true);
  }
});
