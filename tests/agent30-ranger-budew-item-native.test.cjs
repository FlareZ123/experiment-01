'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Compiled pinned native module. */
const native=name=>require(path.join(OUTPUT,name));

/**
 * Replay a real printed Itchy Pollen attack and opponent response window.
 * Each seat uses the actual engine turn transition, genuine owner hand, and
 * original printed Supporter and Item actions. This staged setup does not
 * certify a natural opening or full game outcome.
 * @param {0|1} seat Attacking Budew's physical seat.
 * @param {boolean} withAbilityLock Whether opposing continuing Ability applies.
 */
function run(seat,withAbilityLock){
  const x=stage(seat);
  const manager=initializeCards();
  let nextId=710000+100*seat+10000*Number(withAbilityLock);
  /** @param {string} name Exact physical printing. */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing native printed card '+name);
    c.id=nextId++;
    return c;
  };
  const budew=card('Budew ASC');
  assert.equal(budew.set,'ASC');
  assert.equal(String(budew.setNumber),'16');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(budew);
  if(withAbilityLock){
    const v=x.owner.bench[2];
    v.cards.push(card('Oddish UNB'),card('Gloom UNB'),card('Vileplume AOR'));
  }
  const ranger=card('Pokemon Ranger STS');
  const fog=card('Fog Crystal CRE');
  x.opponent.hand.cards.unshift(ranger,fog);
  x.state.turn=4;
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  x.store.dispatch(new AttackAction(x.owner.id,'Itchy Pollen'));
  const waits=[];
  for(let n=0;n<24;n++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(x.store.state.activePlayer===1-seat&&
       x.store.state.phase===x.GamePhase.PLAYER_TURN&&!pending)break;
    assert.ok(pending,'Expected mandatory native turn transition');
    assert.equal(pending.constructor.name,'WaitPrompt');
    waits.push(pending.constructor.name);
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(x.store.state.activePlayer,1-seat);
  assert.equal(x.store.state.phase,x.GamePhase.PLAYER_TURN);
  assert.equal(x.opponent.cannotPlayItemCards,true);
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  assert.throws(()=>x.store.dispatch(new PlayCardAction(x.opponent.id,1,target)),
    e=>typeof e?.message==='string' && /CANNOT_PLAY_THIS_CARD|BLOCKED/i.test(e.message));
  assert.strictEqual(x.opponent.hand.cards[0],ranger);
  assert.strictEqual(x.opponent.hand.cards[1],fog);
  assert.equal(x.opponent.supporterTurn,0);
  x.store.dispatch(new PlayCardAction(x.opponent.id,0,target));
  assert.equal(x.opponent.supporterTurn,1);
  assert.equal(x.opponent.cannotPlayItemCards,false);
  assert.equal(x.opponent.hand.cards.includes(ranger),false);
  assert.equal(x.opponent.hand.cards.includes(fog),true);
  if(withAbilityLock){
    assert.throws(()=>x.store.dispatch(
      new PlayCardAction(x.opponent.id,0,target)),
    e=>typeof e?.message==='string' && /CANNOT_PLAY_THIS_CARD|BLOCKED/i.test(e.message));
    assert.equal(x.opponent.hand.cards.includes(fog),true);
    return {seat,withAbilityLock,blockedBeforeRanger:true,
      rangerAccepted:true,itemStillBlockedByAbility:true,
      nativeWaitPrompts:waits.length,competitiveQualifiedGames:0};
  }
  x.store.dispatch(new PlayCardAction(x.opponent.id,0,target));
  const prompt=x.store.state.prompts.find(p=>p.result===undefined);
  assert.ok(prompt,'Accepted Fog Crystal must expose the search choice');
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  const psychic=x.opponent.deck.cards.find(c=>c.name==='Psychic Energy');
  assert.ok(psychic,'Staged original native deck has a Psychic Energy');
  assert.equal(prompt.validate([psychic]),true);
  x.store.dispatch(new ResolvePromptAction(prompt.id,[psychic]));
  const observed=[];
  for(let i=0;i<16;i++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const type=pending.constructor.name;
    assert.ok(['ShowCardsPrompt','ShuffleDeckPrompt','WaitPrompt'].includes(type),
      'Unexpected follow-on owner prompt '+type);
    observed.push(type);
    const answer=type==='ShowCardsPrompt'?true:
      type==='ShuffleDeckPrompt'?
        Array.from({length:x.opponent.deck.cards.length},(_,j)=>j):null;
    x.store.dispatch(new ResolvePromptAction(pending.id,answer));
  }
  assert.ok(x.opponent.hand.cards.includes(psychic),
    'Actual searched physical Energy must reach owner hand');
  assert.equal(x.opponent.hand.cards.includes(fog),false);
  return {seat,withAbilityLock,blockedBeforeRanger:true,
    rangerAccepted:true,itemSearchResolved:true,
    searchedPhysicalPrinting:psychic.fullName,
    nativeWaitPrompts:waits.length,postSearchPrompts:observed,
    competitiveQualifiedGames:0};
}

for(const seat of [0,1]){
  for(const ability of [false,true]){
    test('native Ranger then Item under printed Budew, seat '+seat+
      ' ability-based Item restriction '+ability,()=>{
      const verdict=run(seat,ability);
      console.log('AGENT30_NATIVE_RANGER_ITEM',JSON.stringify(verdict));
      assert.equal(verdict.rangerAccepted,true);
    });
  }
}

module.exports={run};
