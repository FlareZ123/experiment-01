'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const HOOK_PATH = path.resolve(__dirname,
  '../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs');
const BOX = 'Secret Box TWM';
const FOG = 'Fog Crystal CRE';
const VIP = 'Battle VIP Pass FST';
const CARRIER = 'Rescue Carrier EVS';

/** @param {string} fullName @returns {object} */
function card(fullName) {
  return {fullName, name: fullName, superType:'OTHER', energyType:null};
}

class AddPlayerAction {}
class PassTurnAction {}
class PlayCardAction {
  /** @param {number} playerId @param {number} handIndex */
  constructor(playerId, handIndex) {
    this.playerId = playerId;
    this.handIndex = handIndex;
  }
}
class ResolvePromptAction {
  /** @param {string} id @param {object[]} selected */
  constructor(id, selected) {
    this.id = id;
    this.selected = selected;
  }
}
class AttackAction {
  /** @param {number} playerId @param {string} attackName */
  constructor(playerId, attackName) {
    this.playerId = playerId;
    this.attackName = attackName;
  }
}
class ChooseCardsPrompt {
  /** @param {object} owner @param {object} zone @param {string} message @param {object} options */
  constructor(owner, zone, message, options) {
    this.id = message + ':' + String(options?.maxItems ?? 'payment');
    this.playerId = owner.id;
    this.cards = zone;
    this.message = message;
    this.options = options;
    this.result = undefined;
  }
  /** @param {object[]} selected @returns {boolean} */
  validate(selected) {
    if (!Array.isArray(selected)) return false;
    if (this.options.min === 3)
      return selected.length === 3 &&
        selected.every(c => this.cards.cards.includes(c));
    // A restricted optional deck search accepts an empty selection.
    return selected.length <= 1 &&
      selected.every(c => this.cards.cards.includes(c));
  }
}
class SimpleTacticsAi {
  /** @param {number} id */
  constructor(id) {this.client = {id};}
  /** @returns {PassTurnAction} */
  decodeNextAction() {return new PassTurnAction();}
}

/**
 * A read-only test-double of two owner search boundaries. It tests the actual
 * hook source with an injected pure actor observation and fake Store, without
 * claiming to run pinned Twinleaf or to authenticate a game.
 *
 * @param {{hasFog:boolean,hasBasic:boolean}} options
 * @returns {{run:Function,owner:object,headless:object,hook:object}}
 */
function fixture({hasFog, hasBasic}) {
  const owner = {
    id:101,
    hand:{cards:[card(BOX),card(VIP),card(VIP),
      card(CARRIER),card(CARRIER)]},
    deck:{cards:hasFog?[card(FOG)]:[]},
    discard:{cards:[]},
    supporter:{cards:[]},
    active:{energies:{cards:[]}},
    prizes:[{cards:[1,2,3,4,5,6]}]
  };
  if (hasBasic) owner.deck.cards.push({
    fullName:'Psychic Energy MEE',name:'Psychic Energy',
    superType:'ENERGY',energyType:'BASIC'
  });
  const state = {
    players:[owner,{id:102}],activePlayer:0,turn:14,prompts:[]
  };
  const observation = () => ({
    decisionKind:'owner-root',globalTurn:14,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownTurnResources:{
      itemPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:0
    },
    ownPublic:{
      active:{printing:'Unown AOR',energies:[],attacks:[
        {name:'Hidden Power',cost:[9],damage:10,gxAttack:false}
      ],specialConditions:[]},
      publicTurnRestrictions:{itemPlayLocked:false}
    },
    opponentPublic:{active:{printing:'Trubbish FST',hp:70,damage:60}}
  });
  class Store {
    constructor() {this.state = state;}
    /** @param {object} action */
    dispatch(action) {
      const kind = action.constructor.name;
      if (kind === 'AddPlayerAction') return null;
      if (kind === 'PlayCardAction') {
        const played = owner.hand.cards.splice(action.handIndex,1)[0];
        assert.ok(played);
        owner.supporter.cards.push(played);
        if (played.fullName === BOX) {
          state.prompts = [new ChooseCardsPrompt(owner,
            {cards:owner.hand.cards},'CHOOSE_CARD_TO_DISCARD',
            {min:3,max:3})];
        } else if (played.fullName === FOG) {
          state.prompts = [new ChooseCardsPrompt(owner,owner.deck,
            'CHOOSE_CARD_TO_HAND',{min:0,maxBasicEnergies:1})];
        } else throw Error('Unexpected fake card play');
        return null;
      }
      if (kind === 'ResolvePromptAction') {
        const pending = state.prompts[0];
        assert.ok(pending?.validate(action.selected));
        if (pending.message === 'CHOOSE_CARD_TO_DISCARD') {
          for (const c of action.selected) {
            owner.hand.cards.splice(owner.hand.cards.indexOf(c),1);
            owner.discard.cards.push(c);
          }
          state.prompts = [new ChooseCardsPrompt(owner,owner.deck,
            'CHOOSE_CARD_TO_HAND',{min:0,maxItems:1})];
        } else {
          for (const c of action.selected) {
            owner.deck.cards.splice(owner.deck.cards.indexOf(c),1);
            owner.hand.cards.push(c);
          }
          state.prompts = [];
        }
        return null;
      }
      throw Error('Unexpected test-double action: '+kind);
    }
  }
  const fakeNative = name => {
    if (name === 'simple-bot/simple-tactics-ai')
      return {SimpleTacticsAi};
    if (name === 'game/store/store') return {Store};
    if (name === 'game/store/actions/play-card-action')
      return {PlayCardAction,PlayerType:{ANY:1},
        SlotType:{BOARD:1,ACTIVE:2}};
    if (name === 'game/store/actions/resolve-prompt-action')
      return {ResolvePromptAction};
    if (name === 'game/store/actions/game-actions')
      return {AttackAction};
    if (name === 'game/store/card/card-types')
      return {EnergyType:{BASIC:'BASIC'},
        SuperType:{ENERGY:'ENERGY'},
        CardType:{PSYCHIC:5,COLORLESS:9}};
    throw Error('Unknown fake native dependency: '+name);
  };
  const original = fs.readFileSync(HOOK_PATH,'utf8');
  const local = {exports:{}};
  const localRequire = name => {
    if (name === './actor-observation-contract.cjs')
      return {actorObservation:observation};
    if (name === './agent4-secret-box-paper-payment-hook.cjs')
      return {secretBoxPaymentNegative:()=>null};
    return require(name);
  };
  // Compile the actual registered hook source, substituting only the isolated
  // test-double observation/payment dependencies.
  new Function('require','module','__dirname',original)(
    localRequire,local,path.dirname(HOOK_PATH));
  const hook = local.exports;
  const headless = {
    runMatch() {
      const nativeStore = new Store();
      const ai = new SimpleTacticsAi(owner.id);
      nativeStore.dispatch(new AddPlayerAction());
      for (let i=0;i<10;i++) {
        const action=ai.decodeNextAction(state);
        assert.ok(!(action instanceof PassTurnAction),
          'The paid-Box plan prematurely passed in the fixture');
        nativeStore.dispatch(action);
      }
      throw Error('Expected a bounded owner-deck search failure');
    }
  };
  return {
    hook,headless,owner,
    run:() => hook.withOwnerOneEnergyBoxKo(
      ()=>headless.runMatch(),{headless,native:fakeNative}
    )
  };
}

test('no deck Fog: physical Box payment succeeds, handler then throws',()=>{
  const f=fixture({hasFog:false,hasBasic:false});
  assert.throws(f.run,error=>{
    assert.match(error.message,
      /Original owner deck has no native-selectable Fog Crystal/);
    assert.equal(error.agent43Audit.candidatePlans,1);
    assert.equal(error.agent43Audit.paperPaymentsAccepted,1);
    assert.equal(error.agent43Audit.physicalBoxSearches,0);
    assert.equal(error.agent43Audit.competitiveGamesQualified,0);
    return true;
  });
  assert.equal(f.owner.discard.cards.filter(c=>c.fullName===VIP).length,2);
  assert.equal(f.owner.discard.cards.filter(c=>c.fullName===CARRIER).length,1);
});

test('Fog in deck but no Basic: later search throws after paid retrieval',()=>{
  const f=fixture({hasFog:true,hasBasic:false});
  assert.throws(f.run,error=>{
    assert.match(error.message,
      /Owner Fog Crystal search cannot select Basic Psychic/);
    assert.equal(error.agent43Audit.paperPaymentsAccepted,1);
    assert.equal(error.agent43Audit.physicalBoxSearches,1);
    assert.equal(error.agent43Audit.physicalFogSearches,0);
    assert.equal(error.agent43Audit.competitiveGamesQualified,0);
    return true;
  });
  assert.ok(f.owner.supporter.cards.some(c=>c.fullName===FOG));
  assert.equal(f.owner.deck.cards.length,0);
});
