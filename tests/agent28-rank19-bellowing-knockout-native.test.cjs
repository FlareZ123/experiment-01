'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {PRINTING,choosePrintedBellowingPotentialKnockout}=
  require('../simulation/twinleaf/agent28-rank19-bellowing-ko-frontier.cjs');
/** @param {string} modulePath */
const load=modulePath=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',modulePath));

const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {CardList}=load('game/store/state/card-list');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {AttackAction}=load('game/store/actions/game-actions');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
const {Format}=load('game/store/card/card-types');
let nextId=28000;

/**
 * One non-shuffled, deliberately staged physical attack-root fixture.
 * Every actual Zone, Prize and attached Basic Energy is represented in the
 * original native Store; this is not a shuffled 60-card matchup.
 * @param {0|1} seat Actual owner position in State.players.
 * @param {number} defenderDamage Preexisting damage against 210 HP.
 */
function stage(seat,defenderDamage=0){
  const manager=initializeCards();
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned native card missing '+name);
    c.id=nextId++;
    return c;
  };
  const owner=new Player();owner.id=101;owner.name='source-rank19';
  const opponent=new Player();opponent.id=202;opponent.name='defender';
  const raging=card(PRINTING),lightning=card('Lightning Energy SVE'),
    fighting=card('Fighting Energy SVE');
  owner.active.cards.push(raging,lightning,fighting);
  owner.active.energies.cards.push(lightning,fighting);
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.damage=defenderDamage;
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench[0].cards.push(card('Duskull PRE'));
  // Avoid synthetic checkWinner's no-Prizes -> sudden-death zone reset.
  for(const player of [owner,opponent]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const types={
    PokemonCard:load('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:load('game/store/card/energy-card').EnergyCard,
    ...load('game/store/card/card-types'),
    PowerType:load('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  const view=actorObservation(state,seat);
  return {store,state,owner,opponent,raging,lightning,fighting,
    catalog,view,seat};
}

/**
 * Pass the attack through real Store AttackAction and answer native
 * DiscardEnergyPrompt by physical card-index targets. WaitPrompt is only
 * the engine animation suspension. Do not select a card from hidden zones.
 * @param {ReturnType<typeof stage>} x
 * @param {number[]} discardIndices Current owner Active list card indices.
 */
function settleBellowing(x,discardIndices){
  x.store.dispatch(new AttackAction(x.owner.id,'Bellowing Thunder'));
  const sequence=[];
  for(let i=0;i<20;i++){
    const p=x.store.state.prompts.find(row=>row.result===undefined);
    if(!p)break;
    const name=p.constructor.name;sequence.push(name);
    if(name==='DiscardEnergyPrompt'){
      assert.equal(p.options.min,0);
      assert.equal(p.options.max,2);
      const indices=discardIndices.map(index=>({
        from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0},
        index
      }));
      // Low-level Store.dispatch expects the *decoded*, physical transfer
      // records. The HTTP/prompt boundary normally invokes prompt.decode.
      const transfers=p.decode(indices,x.store.state);
      assert.equal(p.validate(transfers),true);
      x.store.dispatch(new ResolvePromptAction(p.id,transfers));
    }else if(name==='WaitPrompt'){
      x.store.dispatch(new ResolvePromptAction(p.id,null));
    }else{
      throw new Error('Unexpected pinned native prompt: '+name);
    }
  }
  assert.equal(x.store.hasPrompts(),false);
  return sequence;
}

test('pure printed Bellowing priority only when raw Basic-card damage crosses public remaining HP',()=>{
  const view={
    decisionKind:'owner-root',ownPublic:{
      active:{printing:PRINTING,energies:['Lightning Energy SVE','Fighting Energy SVE']},
      bench:[null,null,null,null,null]
    },
    opponentPublic:{active:{hp:210,damage:120}}
  };
  const catalog={basicEnergies:new Set(['Lightning Energy SVE','Fighting Energy SVE'])};
  const payable=[
    {name:'Burst Roar',cost:[9],damage:0},
    {name:'Bellowing Thunder',damage:70,damageCalculation:'x'}
  ];
  const decision=choosePrintedBellowingPotentialKnockout(view,catalog,payable);
  assert.equal(decision.attackName,'Bellowing Thunder');
  assert.equal(decision.rawDamage,140);
  assert.equal(decision.remainingHp,90);
  assert.equal(decision.availableBasicEnergyCards,2);
  assert.equal(choosePrintedBellowingPotentialKnockout({
    ...view,opponentPublic:{active:{hp:210,damage:0}}
  },catalog,payable),null);
  assert.equal(choosePrintedBellowingPotentialKnockout({
    ...view,ownPublic:{...view.ownPublic,active:{
      ...view.ownPublic.active,printing:'Raging Bolt SSP'}}
  },catalog,payable),null);
  assert.equal(choosePrintedBellowingPotentialKnockout(
    view,catalog,[payable[0]]),null);
});

test('pure source public count includes Benched Basic cards but excludes attached special Energy',()=>{
  const view={
    decisionKind:'owner-root',
    ownPublic:{active:{printing:PRINTING,energies:['Double Dragon Energy ROS']},
      bench:[{energies:['Lightning Energy SVE']},null,null,null,null]},
    opponentPublic:{active:{hp:60,damage:0}}
  };
  const payable=[{name:'Burst Roar'},{
    name:'Bellowing Thunder',damage:70,damageCalculation:'x'
  }];
  const catalog={basicEnergies:new Set(['Lightning Energy SVE'])};
  const decision=choosePrintedBellowingPotentialKnockout(view,catalog,payable);
  assert.equal(decision.availableBasicEnergyCards,1);
  assert.equal(decision.rawDamage,70);
  assert.equal(choosePrintedBellowingPotentialKnockout({...view,
    ownPublic:{...view.ownPublic,bench:[null,null,null,null,null]}
  },catalog,payable),null);
});

for(const seat of [0,1]){
  test('actual native rank19 owner seat '+seat+' has a payable Burst Roar first but an independent projected Bellowing KO',()=>{
    const x=stage(seat,120);
    const defaultIntent=chooseActorRootIntent(x.view,x.catalog);
    assert.deepEqual(defaultIntent,{kind:'attack',attackName:'Burst Roar'});
    const proposed=choosePrintedBellowingPotentialKnockout(x.view,x.catalog,
      x.view.ownPublic.active.attacks);
    assert.equal(proposed.attackName,'Bellowing Thunder');
    assert.equal(proposed.rawDamage,140);
    assert.equal(proposed.remainingHp,90);
  });

  test('original Store seat '+seat+' Bellowing discarded two actual Basic cards and dealt 140 before Weakness',()=>{
    const x=stage(seat,0);
    const sequence=settleBellowing(x,[1,2]);
    assert.ok(sequence.includes('DiscardEnergyPrompt'));
    assert.equal(x.opponent.active.damage,140);
    assert.ok(x.owner.discard.cards.includes(x.lightning));
    assert.ok(x.owner.discard.cards.includes(x.fighting));
    assert.equal(x.owner.active.energies.cards.length,0);
    assert.equal(x.owner.getPrizeLeft(),6);
    assert.equal(x.store.state.phase!==GamePhase.FINISHED,true);
  });
}

test('original pinned native Bellowing permits zero Basic cards discarded and thus zero damage',()=>{
  const x=stage(0,0);
  const sequence=settleBellowing(x,[]);
  assert.ok(sequence.includes('DiscardEnergyPrompt'));
  assert.equal(x.opponent.active.damage,0);
  assert.equal(x.owner.active.energies.cards.length,2);
  assert.equal(x.owner.discard.cards.length,0);
});

test('pure negative: no printed post-cost alternative means no Bellowing proposal',()=>{
  const x=stage(0,120);
  const first=x.view.ownPublic.active.attacks[0];
  assert.equal(choosePrintedBellowingPotentialKnockout(
    x.view,x.catalog,[first]),null);
});
