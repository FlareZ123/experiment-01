'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {withPaperDuskullComeAndGetYou}=require(
  '../../simulation/twinleaf/2026-11/agent21-duskull-come-and-get-you-paper-hook.cjs');

const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native=file=>require(path.join(base,file));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {Duskull}=native(
  'sets/10-scarlet-and-violet/set-shrouded-fable/duskull');

/** Genuine pinned Store with source-identified Duskull PRE and owner discard.
 * The Board is staged; this is not a natural original-Aichi deal or a full 60.
 * @param {0|1} seat
 * @param {{benchCount?:number,discardCount?:number,handCount?:number}} options
 */
function stage(seat,options={}){
  const {benchCount=5,discardCount=1,handCount=0}=options;
  const pool=initializeCards();
  let next=2100000+1000*seat;
  const card=name=>{
    const c=pool.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);
    c.id=next++;
    return c;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=211;opponent.id=212;
  owner.active.cards.push(card('Duskull PRE'));
  const energy=card('Psychic Energy MEE');
  owner.active.cards.push(energy);
  owner.active.energies.cards.push(energy);
  for(let i=0;i<benchCount;i++){
    const slot=new PokemonCardList();
    slot.cards.push(card('Unown AOR'));
    owner.bench.push(slot);
  }
  while(owner.bench.length<5)owner.bench.push(new PokemonCardList());
  for(let i=0;i<discardCount;i++)
    owner.discard.cards.push(card('Duskull PRE'));
  for(let i=0;i<handCount;i++)
    owner.hand.cards.push(card('Duskull PRE'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  for(const player of [owner,opponent]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<10;i++)
      player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=49;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {seat,owner,opponent,store,state};
}

function availablePrompt(state){
  return state.prompts.find(p=>p.result===undefined);
}
function resolveWaitPrompts(x){
  for(let i=0;i<8&&availablePrompt(x.state)?.constructor.name==='WaitPrompt';i++){
    const p=availablePrompt(x.state);
    x.store.dispatch(new ResolvePromptAction(p.id,null));
  }
}

/** Original full-Bench native failure, corrected inert attack, both seats. */
for(const seat of [0,1]){
  test('real native full-Bench Duskull PRE permits an inert attack, seat '+seat,()=>{
    const original=stage(seat);
    assert.equal(original.owner.hand.cards.length,0);
    assert.equal(original.owner.discard.cards.filter(c=>c.name==='Duskull').length,1);
    assert.throws(()=>original.store.dispatch(
      new AttackAction(original.owner.id,'Come and Get You')),
    error=>error?.message==='CANNOT_USE_POWER');

    const before=Object.getOwnPropertyDescriptor(
      Duskull.prototype,'reduceEffect');
    const x=stage(seat);
    const got=withPaperDuskullComeAndGetYou(()=>{
      x.store.dispatch(new AttackAction(x.owner.id,'Come and Get You'));
      return {discard:x.owner.discard.cards.filter(c=>c.name==='Duskull').length,
        occupied:x.owner.bench.filter(b=>b.cards.length>0).length};
    });
    assert.equal(got.result.discard,1);
    assert.equal(got.result.occupied,5);
    assert.equal(got.audit.observedAttacks,1);
    assert.equal(got.audit.emptyBenchSlots,1);
    assert.equal(got.audit.choicePrompts,0);
    assert.strictEqual(Duskull.prototype.reduceEffect,before.value,
      'research hook must restore the exact pinned reducer');
    console.log('AGENT21_DUSKULL_FULL_BENCH_NATIVE',JSON.stringify({
      seat,rawError:'CANNOT_USE_POWER',correctedAccepted:true,
      printing:'Duskull PRE',occupiedBench:5,paperQualifiedGames:0
    }));
  });

  test('real native Duskull PRE picks a physical Duskull from discard, seat '+seat,()=>{
    const x=stage(seat,{benchCount:4,discardCount:1});
    const target=x.owner.discard.cards[0];
    const got=withPaperDuskullComeAndGetYou(()=>{
      x.store.dispatch(new AttackAction(x.owner.id,'Come and Get You'));
      resolveWaitPrompts(x);
      const prompt=availablePrompt(x.state);
      assert.ok(prompt);
      assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
      assert.equal(prompt.options.min,0);
      assert.equal(prompt.options.max,1);
      assert.equal(prompt.validate([target]),true);
      x.store.dispatch(new ResolvePromptAction(prompt.id,[target]));
      return {
        discarded:x.owner.discard.cards.includes(target),
        benched:x.owner.bench.some(slot=>slot.cards.includes(target)),
        usedTurn:x.owner.bench.find(slot=>slot.cards.includes(target))?.pokemonPlayedTurn,
        physicalId:target.id
      };
    });
    assert.deepEqual(got.result,{
      discarded:false,benched:true,usedTurn:49,physicalId:target.id});
    assert.equal(got.audit.choicePrompts,1);
    assert.equal(got.audit.selectedPhysicalDuskull,1);
    console.log('AGENT21_DUSKULL_DISCARD_BENCH_NATIVE',JSON.stringify({
      seat,physicalCardId:target.id,source:'discard',destination:'bench',
      paperQualifiedGames:0
    }));
  });
}

test('with zero discard targets, the optional attack stays payable and inert',()=>{
  const x=stage(0,{benchCount:4,discardCount:0});
  const {audit}=withPaperDuskullComeAndGetYou(()=>
    x.store.dispatch(new AttackAction(x.owner.id,'Come and Get You')));
  assert.equal(audit.observedAttacks,1);
  assert.equal(audit.noEligibleDiscard,1);
  assert.equal(audit.choicePrompts,0);
});

test('composed shared paper-semantics v2 accepts full-Bench Duskull and restores hooks',()=>{
  const {withPaperSemanticsProfileV2Duskull,VERSION}=require(
    '../../simulation/twinleaf/2026-11/agent21-paper-semantics-profile-v2-duskull.cjs');
  const original=Duskull.prototype.reduceEffect;
  const x=stage(0,{benchCount:5,discardCount:1});
  const options={
    celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true,
    duskullComeAndGetYou:true
  };
  const {result,audit}=withPaperSemanticsProfileV2Duskull(()=>{
    x.store.dispatch(new AttackAction(x.owner.id,'Come and Get You'));
    return {active:x.owner.active.getPokemonCard()?.name,
      occupied:x.owner.bench.filter(slot=>slot.cards.length>0).length};
  },options);
  assert.equal(result.active,'Duskull');
  assert.equal(result.occupied,5);
  assert.equal(audit.profile,VERSION);
  assert.equal(audit.enabled.duskullComeAndGetYou,true);
  assert.equal(audit.duskullComeAndGetYou.observedAttacks,1);
  assert.equal(audit.duskullComeAndGetYou.emptyBenchSlots,1);
  assert.equal(audit.coreProfile.profile,'agent19-composed-paper-semantics-profile-v1');
  assert.equal(audit.paperQualifiedCompetitiveGames,0);
  assert.strictEqual(Duskull.prototype.reduceEffect,original);
});

test('composed shared profile leaves original Duskull error when reducer remains off',()=>{
  const {withPaperSemanticsProfileV2Duskull}=require(
    '../../simulation/twinleaf/2026-11/agent21-paper-semantics-profile-v2-duskull.cjs');
  const x=stage(1,{benchCount:5,discardCount:1});
  assert.throws(()=>withPaperSemanticsProfileV2Duskull(()=>{
    x.store.dispatch(new AttackAction(x.owner.id,'Come and Get You'));
  },{duskullComeAndGetYou:false}),err=>err?.message==='CANNOT_USE_POWER');
});
