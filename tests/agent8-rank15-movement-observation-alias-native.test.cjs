'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(root,p));

/**
 * Two identical face-up, actor-observed boards with distinct tracked
 * Bench-to-Active histories. The history marker is STAGED, not obtained
 * through a natural shuffled matchup. Independent real-Guzma native
 * regression verifies that this marker can arise from genuine play.
 * @param {0|1} seat
 * @param {boolean} moved
 */
function fork(seat,moved){
  const x=stage(seat),manager=initializeCards();
  let id=70000+seat*1000;
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Missing native card '+name);
    value.id=id++;
    return value;
  };
  const p=manager.getAllCards().filter(c=>
    c.name==='Mega Lopunny ex'&&c.set==='PFL'&&
    String(c.setNumber)==='84');
  assert.equal(p.length,1,'Exact original PFL #84 required');
  const b=manager.getAllCards().filter(c=>
    c.name==='Buneary'&&c.set==='PFL'&&
    String(c.setNumber)==='83');
  assert.equal(b.length,1,'Exact original PFL #83 required');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card(b[0].fullName),card(p[0].fullName));
  x.owner.active.energies.cards.push(card('Grass Energy MEE'));
  x.owner.hand.cards.length=0;
  x.owner.bench[1].cards.length=0;
  x.owner.bench[1].cards.push(card('Bunnelby PRC'));
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  x.state.turn=4;
  const pokemon=x.owner.active.getPokemonCard();
  assert.ok(Array.isArray(x.owner.movedToActiveThisTurn));
  if(moved)x.owner.movedToActiveThisTurn.push(pokemon.id);
  assert.equal(x.owner.movedToActiveThisTurn.includes(pokemon.id),moved);
  const view=actorObservation(x.state,seat);
  assert.equal(view.decisionKind,'owner-root');
  const damageBefore=x.opponent.active.damage;
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  x.store.dispatch(new AttackAction(x.owner.id,'Gale Thrust'));
  for(let i=0;i<24&&x.state.turn===4;i++){
    const prompt=x.state.prompts.find(q=>q.result===undefined);
    assert.ok(prompt,'Unsettled native Gale Thrust');
    assert.equal(prompt.constructor.name,'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(x.state.turn,5);
  return {view,damage:x.opponent.active.damage-damageBefore,moved};
}

for(const seat of [0,1]){
  test('rank15 owner observation aliases native move history, seat '+seat,()=>{
    const still=fork(seat,false);
    const moved=fork(seat,true);
    assert.deepEqual(still.view,moved.view,
      'Current detached actor view omits publicly observable same-turn movement');
    assert.equal(still.damage,60);
    assert.equal(moved.damage,230);
    assert.equal(still.moved,false);
    assert.equal(moved.moved,true);
    console.log('RANK15_PUBLIC_HISTORY_ALIAS',
      JSON.stringify({seat,sameOwnerObservation:true,
        stationaryDamage:still.damage,movedDamage:moved.damage,
        historyProvenance:'explicit staged native marker',
        competitiveQualifiedGames:0}));
  });
}
