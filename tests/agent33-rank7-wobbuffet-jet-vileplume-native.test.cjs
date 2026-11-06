'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {choosePublicJetBenchSwitch}=
  require('../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));

/**
 * Staged rank7-style board: source Active has no active-only lock, Wobbuffet
 * is on the Bench, and the opponent's Vileplume is Active. This is a rules
 * fixture, not a naturally dealt game or proof of Artazon search access.
 * @param {0|1} seat
 * @returns {object}
 */
function stageWobbuffetJet(seat){
  const x=stage(seat),manager=initializeCards();
  let uid=310000+seat*100;
  const get=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing pinned native printing '+name);
    card.id=uid++;
    return card;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.tools.cards.length=0;
  x.owner.active.cards.push(get('Snorlax PGO'));
  x.owner.bench[1].cards.length=0;
  x.owner.bench[1].energies.cards.length=0;
  x.owner.bench[1].tools.cards.length=0;
  const wobbuffet=get('Wobbuffet PHF');
  x.owner.bench[1].cards.push(wobbuffet);
  x.owner.hand.cards.length=0;
  const jet=get('Jet Energy PAL');
  const floatStone=get('Float Stone BKT');
  x.owner.hand.cards.push(jet,floatStone);
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.tools.cards.length=0;
  const vileplume=get('Vileplume AOR');
  x.opponent.active.cards.push(vileplume);
  x.state.turn=4;
  return {...x,jet,floatStone,wobbuffet,vileplume};
}

/** @param {object} x @param {object} player @param {object} pokemon @param {string} name */
function abilityStatus(x,player,pokemon,name){
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
  const power=pokemon.powers.find(p=>p.name===name);
  assert.ok(power,'Missing printed Ability '+pokemon.fullName+'/'+name);
  const check=new CheckPokemonPowersEffect(player,pokemon);
  x.store.reduceEffect(x.state,check);
  return {
    blocked:Boolean(IS_ABILITY_BLOCKED(x.store,x.state,player,pokemon,power)),
    visible:check.powers.some(p=>p.name===name)
  };
}

/**
 * Settle animation Wait prompts only. A discretionary switch prompt is not
 * silently answered by this fixture.
 * @param {object} x
 * @returns {string[]}
 */
function settleWaitPrompts(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const prompts=[];
  for(let i=0;i<16;i++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    prompts.push(prompt.constructor.name);
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Unexpected prompt needs an explicit actor-visible decision');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(x.store.hasPrompts(),false,'Unresolved native prompt');
  return prompts;
}

for(const seat of [0,1]){
  test('Jet-promoted Active Wobbuffet suppresses opposing Vileplume Item lock in seat '+seat,()=>{
    const x=stageWobbuffetJet(seat);
    const before=actorObservation(x.state,seat);
    const jetProposal=choosePublicJetBenchSwitch(before,x.catalog);
    assert.equal(jetProposal,null,
      'Current Jet frontier requires a payable positive-damage attack; Wobbuffet has no Psychic Energy');

    assert.deepEqual(abilityStatus(x,x.opponent,x.vileplume,'Irritating Pollen'),
      {blocked:false,visible:true},
      'Opponent Vileplume initially exposes its Item-lock Ability');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    x.store.dispatch(new PlayCardAction(x.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    const jetPrompts=settleWaitPrompts(x);
    assert.equal(x.owner.hand.cards.includes(x.jet),false);
    assert.equal(x.owner.active.getPokemonCard().fullName,'Wobbuffet PHF',
      'Jet Energy attachment to the Bench must force Wobbuffet Active');
    assert.equal(x.owner.active.energies.cards.includes(x.jet),true);
    assert.equal(x.owner.bench[1].getPokemonCard().fullName,'Snorlax PGO');

    assert.deepEqual(abilityStatus(x,x.opponent,x.vileplume,'Irritating Pollen'),
      {blocked:true,visible:false},
      'Active Psychic Wobbuffet suppresses the opposing non-Psychic Vileplume Ability');
    assert.deepEqual(abilityStatus(x,x.owner,x.wobbuffet,'Bide Barricade'),
      {blocked:false,visible:true},
      'Wobbuffet remains exempt from its own Ability lock');

    assert.equal(x.owner.hand.cards[0].fullName,'Float Stone BKT');
    x.store.dispatch(new PlayCardAction(x.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    settleWaitPrompts(x);
    assert.equal(x.owner.active.tools.cards.some(c=>
      c.fullName==='Float Stone BKT'),true,
      'Owner can now play an Item that Vileplume had prohibited');
    assert.equal(x.owner.hand.cards.length,0);
    assert.deepEqual(abilityStatus(x,x.opponent,x.vileplume,'Irritating Pollen'),
      {blocked:true,visible:false});
    console.log('AGENT33_NATIVE_WOBBUFFET_JET',JSON.stringify({
      seat,jetProposal,jetPrompts,
      active:x.owner.active.getPokemonCard().fullName,
      opposingVileplumeAbility:abilityStatus(x,x.opponent,x.vileplume,'Irritating Pollen'),
      ownerWobbuffetAbility:abilityStatus(x,x.owner,x.wobbuffet,'Bide Barricade'),
      floatStoneAccepted:true,staged:true,competitiveQualifiedGames:0
    }));
  });
}
