'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseTreasureRootIntent,ITEM}=
  require('../simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs');

const donor='Dragapult ex TWM';
const dragonCatalog={dragonPokemonPrintings:new Set([
  donor,'Noivern ex PAF','Regidrago V SIT','Regidrago VSTAR SIT'])};

/**
 * Detached actor-only owner observation, with a deliberately absent hidden
 * deck printing inventory.
 * @param {object} options
 * @returns {object}
 */
function view({turn=3,hand=[ITEM,donor],discard=[],
  drago=true,deckCount=20,itemLock=false}={}){
  return {
    decisionKind:'owner-root',globalTurn:turn,ownHand:hand,
    ownTurnResources:{itemPlayLocked:itemLock},
    ownPublic:{
      active:{name:drago?'Regidrago VSTAR':'Iron Thorns ex'},
      bench:[null,null,null,null,null],
      discard,deckCount,
      publicTurnRestrictions:{itemPlayLocked:itemLock}
    },
    opponentPublic:{handCount:6,deckCount:27}
  };
}

test('discard a physical, as-yet-undiscarded Dragon payload from owner hand',()=>{
  const s=view();
  const r=chooseTreasureRootIntent(s,dragonCatalog);
  assert.deepEqual(r,{kind:'play-mysterious-treasure',
    handIndex:0,printing:ITEM,discardPrinting:donor,
    discardSourceIndex:1,reason:'undiscarded-dragon-attack-donor',
    searchOwnerDeckOnly:true});
});

test('a prior public donor discard suppresses duplicate payload spending',()=>{
  assert.equal(chooseTreasureRootIntent(view({discard:[donor]}),
    dragonCatalog),null);
});

test('Battle VIP Pass is protected on first own turn and disposable later',()=>{
  const hand=[ITEM,'Battle VIP Pass FST'];
  assert.equal(chooseTreasureRootIntent(view({turn:2,hand}),
    dragonCatalog),null);
  assert.equal(chooseTreasureRootIntent(view({turn:3,hand}),
    dragonCatalog).reason,'dead-first-turn-item');
});

test('dead Battle VIP Pass takes precedence over live Dragon payload',()=>{
  const s=view({hand:[donor,ITEM,'Battle VIP Pass FST']});
  const r=chooseTreasureRootIntent(s,dragonCatalog);
  assert.equal(r.discardPrinting,'Battle VIP Pass FST');
  assert.equal(r.handIndex,1);
  assert.equal(r.discardSourceIndex,2);
});

test('missing live Regidrago, Item lock, or zero deck disables search',()=>{
  assert.equal(chooseTreasureRootIntent(view({drago:false}),
    dragonCatalog),null);
  assert.equal(chooseTreasureRootIntent(view({itemLock:true}),
    dragonCatalog),null);
  assert.equal(chooseTreasureRootIntent(view({deckCount:0}),
    dragonCatalog),null);
});

test('a Regidrago VSTAR copy is preserved as an evolution requirement',()=>{
  const s=view({hand:[ITEM,'Regidrago VSTAR SIT']});
  assert.equal(chooseTreasureRootIntent(s,dragonCatalog),null);
});

test('unsupported Dragon identity cannot be inferred from untrusted names',()=>{
  const s=view({hand:[ITEM,'Unknown Dragon V BLA']});
  assert.equal(chooseTreasureRootIntent(s,dragonCatalog),null);
});

test('hidden deck, Prize and opposing hand perturbations cannot affect root',()=>{
  const a=view(),b=view();
  a.hiddenDeck=['secret A'];a.opponentPrivate={hand:['A'],prizes:['A']};
  b.hiddenDeck=['secret B'];b.opponentPrivate={hand:['B'],prizes:['B']};
  assert.deepEqual(chooseTreasureRootIntent(a,dragonCatalog),
    chooseTreasureRootIntent(b,dragonCatalog));
});

test('shared actor chooser wires the narrow Treasure root only under opt-in',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=view();
  v.actorSeat=0;
  v.phase=3;
  v.ownPublic.active={
    name:'Regidrago VSTAR',printed:{types:[]},
    energies:[],attacks:[],specialConditions:[],publicRestrictions:{}};
  v.ownPublic.publicTurnRestrictions={itemPlayLocked:false,
    attackLockTurnsRemaining:0};
  v.ownTurnResources.energyPlayLocked=true;
  const catalog={
    ...dragonCatalog,
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),basicEnergyTypes:{Lightning:4,Psychic:5},
    colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}
  };
  const baseline=chooseActorRootIntent(v,catalog,{});
  assert.equal(baseline.kind,'pass');
  const enabled=chooseActorRootIntent(v,catalog,
    {mysteriousTreasureRoot:true});
  assert.equal(enabled.kind,'play-mysterious-treasure');
  assert.equal(enabled.discardPrinting,donor);
});
