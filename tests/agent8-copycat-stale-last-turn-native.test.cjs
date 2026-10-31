'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const native=x=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',x));

function settle(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let n=0;n<30;n++){
    const p=x.state.prompts.find(t=>t.result===undefined);
    if(!p)return;
    assert.equal(p.constructor.name,'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.fail('Native prompt did not settle');
}

/** @param {0|1} seat @param {boolean} interveningPass */
function copycat(seat,interveningPass){
  const x=stage(seat),manager=initializeCards();
  let id=94000+seat*100;
  const make=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);c.id=id++;return c;
  };
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(make('Mimikyu GRI'));
  const psychicA=make('Psychic Energy SVE');
  const psychicB=make('Psychic Energy SVE');
  x.opponent.active.cards.push(psychicA,psychicB);
  x.opponent.active.energies.cards.push(psychicA,psychicB);
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  x.store.dispatch(new AttackAction(x.owner.id,'Gnaw'));
  settle(x);
  assert.equal(x.state.activePlayer,1-seat);
  const actualLast=x.state.playerLastAttack[x.owner.id]?.attack.name;
  assert.equal(actualLast,'Gnaw');
  if(interveningPass){
    x.store.dispatch(new PassTurnAction(x.opponent.id));
    settle(x);
    assert.equal(x.state.activePlayer,seat);
    x.store.dispatch(new PassTurnAction(x.owner.id));
    settle(x);
    assert.equal(x.state.activePlayer,1-seat);
  }
  const before=x.owner.active.damage;
  x.store.dispatch(new AttackAction(x.opponent.id,'Copycat'));
  settle(x);
  return {seat,interveningPass,damage:x.owner.active.damage-before,
    storedOpponentAttack:actualLast,turn:x.state.turn};
}

for(const seat of [0,1]){
  test('native rank1 Mimikyu Copycat may reuse stale opponent attack, seat '+seat,()=>{
    const immediate=copycat(seat,false);
    const afterPass=copycat(seat,true);
    assert.equal(immediate.damage,10);
    assert.equal(afterPass.damage,10,
      'Diagnostic currently expects stale native attack to persist');
    console.log('AGENT8_STALE_COPYCAT_NATIVE',
      JSON.stringify({seat,immediate,afterPass,
        paperLastTurnAllowed:false,competitiveQualifiedGames:0}));
  });
}
