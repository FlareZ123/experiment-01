'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {withMemoryDiveLockGuard}=
  require('../../simulation/twinleaf/agent50-relicanth-memory-dive-ability-lock-hook.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/** @param {0|1} seat @param {boolean} muk */
function stage(seat,muk){
  const cm=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const card=name=>{
    const c=cm.getCardByName(name);
    assert.ok(c,'Missing native '+name);
    return c;
  };
  const owner=new Player(),other=new Player();
  owner.id=93011;other.id=93012;
  for(const p of [owner,other])
    p.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.active.cards.push(card('Lillipup CEC'),card('Herdier SUM'),
    card('Stoutland BCR'));
  owner.bench[0].cards.push(card('Relicanth TEF'));
  if(muk)owner.bench[1].cards.push(card('Alolan Grimer SUM'),
    card('Alolan Muk SUM'));
  other.active.cards.push(card('Genesect V FST'));
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[owner,other]:[other,owner];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  return {store,state,owner};
}

/** @param {object} fixture */
function attackNames(fixture){
  const {CheckPokemonAttacksEffect}=native('game/store/effects/check-effects');
  const effect=new CheckPokemonAttacksEffect(fixture.owner);
  fixture.store.reduceEffect(fixture.state,effect);
  return effect.attacks.map(a=>a.name);
}
for(const seat of [0,1]){
  test('paper Memory Dive correctly disappears under own Muk without suppressing other cases, seat '+seat,()=>{
    const originalWithMuk=attackNames(stage(seat,true));
    assert.ok(originalWithMuk.includes('Baby-Doll Eyes'),
      'Pinned unpatched Relicanth must reproduce the known Ability lock omission');
    const guardedWithMuk=withMemoryDiveLockGuard(()=>
      attackNames(stage(seat,true)));
    assert.ok(!guardedWithMuk.result.includes('Baby-Doll Eyes'));
    assert.ok(guardedWithMuk.audit.blocked>=1);
    assert.equal(guardedWithMuk.audit.restored,true);

    const guardedWithoutMuk=withMemoryDiveLockGuard(()=>
      attackNames(stage(seat,false)));
    assert.ok(guardedWithoutMuk.result.includes('Baby-Doll Eyes'));
    assert.ok(guardedWithoutMuk.audit.allowed>=1);
    assert.equal(guardedWithoutMuk.audit.restored,true);

    assert.ok(attackNames(stage(seat,true)).includes('Baby-Doll Eyes'),
      'Restored native manager must retain original behavior outside scope');
    console.log('AGENT50_RELICANTH_MUK_NATIVE '+JSON.stringify({
      seat,unpatchedImproperBabyDollEyes:true,
      correctedUnderMuk:false,
      correctedWithoutMuk:true,
      restored:true,competitiveQualifiedGames:0
    }));
  });
}
