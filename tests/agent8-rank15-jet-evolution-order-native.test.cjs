'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const native=x=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',x));

/** @param {object} x */
function settle(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<24;i++){
    const p=x.state.prompts.find(q=>q.result===undefined);
    if(!p)return;
    assert.equal(p.constructor.name,'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.fail('Unsettled native prompts');
}

/** @param {0|1} seat @param {boolean} evolveBeforeMove */
function run(seat,evolveBeforeMove){
  const x=stage(seat),m=initializeCards();
  let nextId=83000+seat*100;
  const card=name=>{
    const c=m.getCardByName(name);
    assert.ok(c,name);c.id=nextId++;return c;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card('Bunnelby PRC'));
  const bench=x.owner.bench[1];
  bench.cards.length=0;
  bench.energies.cards.length=0;
  bench.cards.push(card('Buneary PFL'));
  bench.pokemonPlayedTurn=0;
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(card('Mega Lopunny ex PFL'),
    card('Jet Energy PAL'));
  x.state.turn=4;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const evolve=()=>{
    const i=x.owner.hand.cards.findIndex(c=>c.fullName==='Mega Lopunny ex PFL');
    assert.ok(i>=0);
    const at=evolveBeforeMove?SlotType.BENCH:SlotType.ACTIVE;
    const index=evolveBeforeMove?1:0;
    x.store.dispatch(new PlayCardAction(x.owner.id,i,{
      player:PlayerType.BOTTOM_PLAYER,slot:at,index
    }));
    settle(x);
    assert.equal((evolveBeforeMove?bench:x.owner.active)
      .getPokemonCard().name,'Mega Lopunny ex');
  };
  const move=()=>{
    const i=x.owner.hand.cards.findIndex(c=>c.fullName==='Jet Energy PAL');
    assert.ok(i>=0);
    x.store.dispatch(new PlayCardAction(x.owner.id,i,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    settle(x);
    assert.equal(x.owner.active.getPokemonCard().name,
      evolveBeforeMove?'Mega Lopunny ex':'Buneary');
  };
  if(evolveBeforeMove){evolve();move();}
  else{move();evolve();}
  assert.equal(x.owner.active.energies.cards[0].fullName,'Jet Energy PAL');
  const top=x.owner.active.getPokemonCard();
  const marker=x.owner.movedToActiveThisTurn.includes(top.id);
  assert.equal(marker,evolveBeforeMove);
  const before=x.opponent.active.damage;
  x.store.dispatch(new AttackAction(x.owner.id,'Gale Thrust'));
  settle(x);
  assert.equal(x.state.activePlayer,1-seat);
  return {seat,evolveBeforeMove,movementMarkerOnTop:marker,
    damage:x.opponent.active.damage-before,competitiveQualifiedGames:0};
}

for(const seat of [0,1]){
  test('original rank15 Jet evolution/move ordering, seat '+seat,()=>{
    const correctOrder=run(seat,true);
    const wrongOrder=run(seat,false);
    assert.equal(correctOrder.damage,230);
    assert.equal(wrongOrder.damage,60);
    console.log('AGENT8_NATIVE_JET_EVOLVE_ORDER',
      JSON.stringify({seat,correctOrder,wrongOrder,
        ruling:'pokemon-card.com official Wimpod to Golisopod-GX FAQ'}));
  });
}
