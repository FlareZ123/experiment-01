'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseNaturalEvolutionIntent}=
  require('../simulation/twinleaf/agent1-actor-evolution-frontier.cjs');
const out=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(out,name));

/** @param {0|1} seat */
function rank15SourceHandEvolution(seat){
  const x=stage(seat),all=initializeCards();
  const original=(name,number)=>{
    const cards=all.getAllCards().filter(c=>
      c.name===name&&c.set==='PFL'&&String(c.setNumber)===number);
    assert.equal(cards.length,1);
    const result=all.getCardByName(cards[0].fullName);
    assert.ok(result);
    result.id=900001+seat*100+Number(number);
    return result;
  };
  const basic=original('Buneary','83'),mega=original('Mega Lopunny ex','84');
  assert.equal(mega.fullName,'Mega Lopunny ex M2');
  x.owner.bench[0].cards.push(basic);
  x.owner.bench[0].pokemonPlayedTurn=2;
  x.owner.hand.cards.push(mega);
  x.state.turn=4;
  const view=actorObservation(x.state,seat);
  const intent=chooseNaturalEvolutionIntent(view,x.catalog);
  assert.ok(intent,'Exact source Mega Lopunny must be a staged legal evolution');
  assert.equal(intent.kind,'evolve-pokemon');
  assert.equal(intent.printing,'Mega Lopunny ex M2');
  assert.equal(intent.slot,'bench');
  assert.equal(intent.index,0);
  const index=x.owner.hand.cards.findIndex(c=>c.fullName===intent.printing);
  assert.equal(index,intent.handIndex);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  x.store.dispatch(new PlayCardAction(x.owner.id,index,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}));
  const physical=x.owner.bench[0].cards.map(c=>c.fullName);
  assert.deepEqual(physical,['Buneary M2','Mega Lopunny ex M2']);
  assert.equal(x.owner.hand.cards.some(c=>c===mega),false);
  assert.equal(x.state.turn,4);
  return {seat,printing:intent.printing,stage:mega.stage,settled:physical};
}
for(const seat of [0,1]){
  test('original rank15 PFL84 stage1 natural evolution via real Store, seat '+seat,()=>{
    const row=rank15SourceHandEvolution(seat);
    assert.equal(row.settled.length,2);
    console.log('RANK15_PFL_SOURCE_NATURAL_EVOLUTION',JSON.stringify({
      ...row,competitiveQualifiedGames:0
    }));
  });
}
