'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicCatalog}=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {nativeSinglePokemonChoices}=require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');
const {MEW,GENESECT,DCE}=require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');
const {chooseDoubleMewCooldownPivot}=require('../simulation/twinleaf/agent13-double-mew-free-retreat.cjs');
const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUTPUT,p));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GameSettings}=native('game/core/game-settings');
const {Format}=native('game/store/card/card-types');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {AttackAction,PassTurnAction,RetreatAction}=native('game/store/actions/game-actions');
function stage(seat){
  const manager=initializeCards();
  let nextId=97000+1000*seat;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing exact native printing '+printing);
    c.id=nextId++;
    return c;
  };
  const owner=new Player(),opp=new Player();
  owner.id=101;owner.name='rank5-original-source';
  opp.id=202;opp.name='printed-staged-opponent';
  owner.active.cards.push(card('Mew V FST'),card(MEW));
  owner.active.pokemonPlayedTurn=1;
  const dce1=card(DCE);
  owner.active.cards.push(dce1);owner.active.energies.cards.push(dce1);
  const donor=new PokemonCardList();donor.cards.push(card(GENESECT));
  const spare=new PokemonCardList();
  spare.cards.push(card('Mew V FST'),card(MEW));
  spare.pokemonPlayedTurn=1;
  const dce2=card(DCE);
  spare.cards.push(dce2);spare.energies.cards.push(dce2);
  owner.bench.push(donor,spare);
  opp.active.cards.push(card('Lunatone OBF'));
  const secondFoe=new PokemonCardList();
  secondFoe.cards.push(card('Solrock OBF'));
  opp.bench.push(secondFoe);
  for(const p of [owner,opp]){
    for(let n=0;n<14;n++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=seat===0?[owner,opp]:[opp,owner];
  state.activePlayer=seat;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  const store=new Store({onStateChange(){}});store.state=state;
  return {store,state,owner,opp,seat,originalId:owner.active.getPokemonCard().id,
    spareId:spare.getPokemonCard().id,originalDce:dce1,spareDce:dce2};
}
function settle(x){
  const {store,state,owner}=x;
  const events=[];
  for(let i=0;i<64;i++){
    const p=state.prompts.find(p=>p.result===undefined);
    if(!p)return events;
    const kind=p.constructor.name;
    let value;
    if(kind==='ChooseAttackPrompt'){
      assert.equal(p.playerId,owner.id);
      const donor=p.cards.find(c=>c.fullName===GENESECT);
      assert.ok(donor);
      value=donor.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(value);
      assert.equal(p.validate(value),true);
    }else if(kind==='WaitPrompt')value=null;
    else if(kind==='ChoosePrizePrompt'){
      const player=state.players.find(a=>a.id===p.getPerspectivePlayerId());
      value=player.prizes.filter(p=>p.cards.length>0).slice(0,p.options.count);
      assert.equal(p.validate(value,state),true);
    }else if(kind==='ChoosePokemonPrompt'){
      const choices=nativeSinglePokemonChoices(state,p);
      assert.ok(choices.length);
      value=[choices[0].physical];
      assert.equal(p.validate(value,state),true);
    }else assert.fail('Unrecognized native prompt '+kind);
    store.dispatch(new ResolvePromptAction(p.id,value));
    events.push(kind);
  }
  assert.fail('Unfinished native prompts after 64 replies');
}
function countPrizes(owner){return owner.prizes.filter(p=>p.cards.length>0).length;}
function trial(seat){
  const x=stage(seat);
  const {store,state,owner,opp}=x;
  const receipts=[];const before=countPrizes(owner);
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  receipts.push(...settle(x));
  assert.equal(state.turn,6);
  assert.equal(countPrizes(owner),before-1);
  store.dispatch(new PassTurnAction(opp.id));
  receipts.push(...settle(x));
  assert.equal(state.turn,7);
  assert.equal(owner.active.cannotAttackNextTurn,true);
  const plan=chooseDoubleMewCooldownPivot(actorObservation(store.state,seat),publicCatalog());
  assert.equal(plan?.kind,'free-retreat');
  assert.equal(plan.benchIndex,1);
  const oldSupporter=owner.supporterTurn;
  store.dispatch(new RetreatAction(owner.id,plan.benchIndex));
  receipts.push(...settle(x));
  assert.equal(owner.active.getPokemonCard().id,x.spareId);
  assert.equal(owner.active.energies.cards[0],x.spareDce);
  assert.equal(owner.bench[1].getPokemonCard().id,x.originalId);
  assert.equal(owner.bench[1].energies.cards[0],x.originalDce);
  assert.equal(owner.supporterTurn,oldSupporter);
  assert.equal(owner.retreatedTurn,7);
  assert.equal(owner.active.cannotAttackNextTurn,false);
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  receipts.push(...settle(x));
  assert.equal(countPrizes(owner),before-2);
  console.log('AGENT13_DOUBLE_MEW_NATIVE_STAGED',JSON.stringify({
    seat,firstAndSecondNativeCopiedTechno:true,
    distinctChargedPhysicalMew:[x.originalId,x.spareId],
    retainedBothDce:true,usedOrdinaryRetreat:true,usedGuzma:false,
    spentSupporter:owner.supporterTurn!==oldSupporter,
    prizes:[before,before-1,before-2],nativePrompts:receipts,
    naturalShuffledOriginal60:false,qualifiedCompetitiveGames:0}));
}
for(const seat of [0,1])
  test('actual pinned Store charged dual-Mew attack free pivot seat '+seat,()=>trial(seat));
