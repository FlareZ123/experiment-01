'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(BASE,p));
const JET='Jet Energy PAL';
const ATTACK='Reckless Charge';

/**
 * Use existing genuine Store staging, then create one printed Bench-switch
 * root and no concealed-card action overrides. The staged pair is a mechanical
 * positive control, not a naturally dealt source matchup.
 * @param {0|1} seat
 * @returns {object}
 */
function stageJet(seat){
  const x=stage(seat),manager=initializeCards();
  let uid=200000+seat*100;
  const make=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing pinned native card '+name);
    card.id=uid++;
    return card;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(make('Dratini OBF'));
  x.owner.bench[1].cards.length=0;
  x.owner.bench[1].energies.cards.length=0;
  x.owner.bench[1].cards.push(make('Doduo MEW'));
  x.owner.hand.cards.length=0;
  const jet=make(JET);
  x.owner.hand.cards.push(jet);
  x.state.turn=4;
  return {...x,jet};
}

/**
 * Settle non-decision Wait prompts. A new mandatory switch choice must be
 * implemented explicitly rather than delegated to an opaque generic bot.
 * @param {object} x
 * @returns {string[]}
 */
function settleWaitPrompts(x){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const types=[];
  for(let i=0;i<24;i++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    types.push(prompt.constructor.name);
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Unexpected native prompt requires its own actor-visible selector');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(x.store.hasPrompts(),false,'Unresolved native prompts');
  return types;
}

for(const seat of [0,1]){
  test('real Jet switch and next printed attack settle in physical seat '+seat,()=>{
    const x=stageJet(seat);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {AttackAction,PassTurnAction}=
      native('game/store/actions/game-actions');
    const before=actorObservation(x.state,seat);
    const baseline=chooseActorRootIntent(before,x.catalog,{});
    const proposal=chooseActorRootIntent(before,x.catalog,
      {jetBenchSwitchRoot:true});
    assert.equal(baseline.kind,'pass');
    assert.equal(proposal.kind,'attach-special-energy');
    assert.equal(proposal.printing,JET);
    assert.equal(proposal.slot,'bench');
    assert.equal(proposal.index,1);
    assert.equal(proposal.handIndex,0);
    assert.equal(proposal.plannedAttackName,ATTACK);
    const oldOpponentHand=x.opponent.hand.cards.slice();
    x.store.dispatch(new PlayCardAction(x.owner.id,proposal.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}));
    const attachmentPrompts=settleWaitPrompts(x);
    assert.equal(x.owner.hand.cards.includes(x.jet),false);
    assert.equal(x.owner.active.getPokemonCard().fullName,'Doduo MEW',
      'Jet native attachment must move target Bench Pokémon to Active');
    assert.equal(x.owner.bench[1].getPokemonCard().fullName,'Dratini OBF',
      'Prior Active must occupy the switched Bench index');
    assert.equal(x.owner.active.energies.cards.includes(x.jet),true);
    assert.deepEqual(x.opponent.hand.cards,oldOpponentHand);
    assert.equal(x.state.activePlayer,seat);
    const next=chooseActorRootIntent(actorObservation(x.state,seat),
      x.catalog,{publicContextSpecialEnergy:true,jetBenchSwitchRoot:true});
    assert.equal(next.kind,'attack');
    assert.equal(next.attackName,ATTACK);
    const damageBefore=x.opponent.active.damage;
    const ownDamageBefore=x.owner.active.damage;
    x.store.dispatch(new AttackAction(x.owner.id,next.attackName));
    const attackPrompts=settleWaitPrompts(x);
    assert.equal(x.opponent.active.damage-damageBefore,30,
      'Native printed Doduo Reckless Charge must deal 30 damage');
    assert.equal(x.owner.active.damage-ownDamageBefore,10,
      'Native printed self-damage must also resolve');
    assert.equal(x.state.activePlayer,1-seat,
      'Attack ends owner turn and permits opponent response');
    x.store.dispatch(new PassTurnAction(x.opponent.id));
    settleWaitPrompts(x);
    assert.equal(x.state.activePlayer,seat,'Opponent turn passes back to owner');
    console.log('AGENT40_NATIVE_JET',JSON.stringify({
      seat,proposal,attachmentPrompts,attackPrompts,
      ownerActive:x.owner.active.getPokemonCard().fullName,
      ownerBench:x.owner.bench[1].getPokemonCard().fullName,
      nativeDamage:x.opponent.active.damage-damageBefore,
      nativeSelfDamage:x.owner.active.damage-ownDamageBefore,
      opponentTurnPassed:true,competitiveQualifiedGames:0
    }));
  });
}
