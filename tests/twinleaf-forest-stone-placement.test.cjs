'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod=name=>require(path.join(output,name));

/** @returns {object} */
function board(){
  const manager=initializeCards();
  let id=1;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);
    c.id=id++;
    return c;
  };
  const {Store}=mod('game/store/store');
  const {Player}=mod('game/store/state/player');
  const {PokemonCardList}=mod('game/store/state/pokemon-card-list');
  const {CardList}=mod('game/store/state/card-list');
  const {GamePhase}=mod('game/store/state/state');
  const {Format}=mod('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  const a=new Player(),b=new Player();
  a.id=101;b.id=202;
  const gx=card('Tapu Lele GX GRI');
  const v=card('Shadow Rider Calyrex V CRE');
  a.active.cards.push(gx);
  const slot=new PokemonCardList();
  slot.cards.push(v);
  a.bench.push(slot);
  const stone=card('Forest Seal Stone SIT');
  a.hand.cards.push(stone);
  a.deck.cards.push(card('Psychic Energy SVE'));
  b.active.cards.push(card('Dratini OBF'));
  b.deck.cards.push(card('Psychic Energy SVE'));
  for(const side of [a,b]){
    for(let k=0;k<6;k++){
      const p=new CardList();p.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(p);
    }
  }
  state.players=[a,b];
  return {state,store,a,gx,v,stone};
}

test('default generic Tool scoring attaches singleton Stone to incompatible higher-scoring Active GX',()=>{
  const f=board();
  const {AttachToolTactic}=mod('simple-bot/simple-tactics/attach-tool-tactic');
  const definitions=mod('simple-bot/simple-bot-definitions');
  const {ToolsScore}=mod('simple-bot/state-score/tools-score');
  const {PlayerType,SlotType}=mod('game/store/actions/play-card-action');
  const {CheckPokemonPowersEffect}=mod('game/store/effects/check-effects');
  const opts={scores:definitions.defaultStateScores,arbiter:definitions.defaultArbiterOptions,
    promptResolvers:definitions.allPromptResolvers};
  const tools=new ToolsScore(opts);
  const baseline=tools.getScore(f.state,f.a.id);
  f.a.active.tools.push(f.stone);
  const active=tools.getScore(f.state,f.a.id);
  f.a.active.tools.length=0;
  f.a.bench[0].tools.push(f.stone);
  const benched=tools.getScore(f.state,f.a.id);
  f.a.bench[0].tools.length=0;
  assert.equal(baseline,0);
  assert.equal(f.gx.hp,170,'Expected printed Tapu Lele GX HP');
  assert.equal(f.v.hp,210,'Expected printed Shadow Rider V HP');
  assert.equal(active,220,'Active GX has +50 generic Tool bonus');
  assert.equal(benched,210,'Benched V has no generic Tool bonus');

  const action=new AttachToolTactic(opts).useTactic(f.state,f.a);
  assert.ok(action);
  assert.equal(action.target.player,PlayerType.BOTTOM_PLAYER);
  assert.equal(action.target.slot,SlotType.ACTIVE);
  f.store.dispatch(action);
  assert.ok(f.a.active.tools.includes(f.stone));
  assert.ok(!f.a.bench[0].tools.includes(f.stone));
  const activePowers=new CheckPokemonPowersEffect(f.a,f.gx);
  f.store.reduceEffect(f.state,activePowers);
  assert.ok(!activePowers.powers.some(p=>p.name==='Star Alchemy'),
    'Forest Seal Stone on non-V GX does not grant Star Alchemy');
});

test('same printed Stone yields usable Star Alchemy when attached to eligible Benched V',()=>{
  const f=board();
  const {PlayCardAction,PlayerType,SlotType}=
    mod('game/store/actions/play-card-action');
  const {CheckPokemonPowersEffect}=mod('game/store/effects/check-effects');
  f.store.dispatch(new PlayCardAction(f.a.id,0,
    {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}));
  assert.ok(f.a.bench[0].tools.includes(f.stone));
  const powers=new CheckPokemonPowersEffect(f.a,f.v);
  f.store.reduceEffect(f.state,powers);
  assert.ok(powers.powers.some(p=>p.name==='Star Alchemy'));
});
