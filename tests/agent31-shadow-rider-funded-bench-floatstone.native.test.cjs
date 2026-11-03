'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicCatalog}=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {chooseFundedShadowRiderFloatStone:choose}=
  require('../simulation/twinleaf/agent31-shadow-rider-funded-bench-floatstone.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=n=>require(path.join(root,n));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {RetreatAction,AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {CheckRetreatCostEffect}=native('game/store/effects/check-effects');
const {Format}=native('game/store/card/card-types');

/** Stage a genuine Store with all visible Energy and physical Tool. */
function stage(seat){
  const manager=initializeCards();
  let cardId=931000+seat*1000;
  const card=printing=>{
    const x=manager.getCardByName(printing);
    assert.ok(x,'Missing printed '+printing);
    x.id=cardId++;
    return x;
  };
  const owner=new Player(),foe=new Player();
  owner.id=311;foe.id=312;
  owner.name='source';foe.name='defender';
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  foe.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  foe.bench=Array.from({length:5},()=>new PokemonCardList());
  foe.bench[0].cards.push(card('Duskull PRE'));
  const attach=(slot,n)=>{
    for(let i=0;i<n;i++){
      const energy=card('Psychic Energy MEE');
      slot.cards.push(energy);
      slot.energies.cards.push(energy);
    }
  };
  attach(owner.active,1);
  attach(owner.bench[0],6);
  owner.hand.cards.push(card('Float Stone BKT'));
  for(const player of [owner,foe]){
    for(let i=0;i<10;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,foe]:[foe,owner];
  state.activePlayer=seat;
  state.turn=11;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,foe,seat};
}
for(const seat of [0,1])test('native Funded VMAX Float Stone rescue seat '+seat,()=>{
  const x=stage(seat),catalog=publicCatalog();
  const before=actorObservation(x.state,seat);
  const first=choose(before,catalog);
  assert.equal(first?.kind,'attach-emergency-floatstone');
  assert.equal(first.handIndex,0);
  assert.equal(first.benchIndex,0);
  x.store.dispatch(new PlayCardAction(x.owner.id,first.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(x.owner.active.tools[0]?.fullName,'Float Stone BKT');
  assert.equal(x.owner.hand.cards.length,0);
  const cost=new CheckRetreatCostEffect(x.owner);
  x.store.reduceEffect(x.state,cost);
  assert.equal(cost.cost.length,0);
  const second=choose(actorObservation(x.state,seat),catalog);
  assert.equal(second?.kind,'retreat-emergency-floatstone');
  x.store.dispatch(new RetreatAction(x.owner.id,second.benchIndex));
  assert.equal(x.owner.active.getPokemonCard()?.fullName,
    'Shadow Rider Calyrex VMAX CRE');
  assert.equal(x.owner.active.energies.cards.length,6);
  assert.equal(x.owner.bench[0].energies.cards.length,1);
  assert.equal(x.owner.bench[0].tools[0]?.fullName,'Float Stone BKT');
  const defenderBefore=x.foe.active.damage;
  x.store.dispatch(new AttackAction(x.owner.id,'Max Geist'));
  for(let i=0;i<12;i++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(x.store.hasPrompts(),false);
  assert.ok(x.foe.active.damage>defenderBefore,
    'A genuine native Max Geist must deal damage after promotion');
  console.log('AGENT31_FUNDED_VMAX_NATIVE',JSON.stringify({
    seat,toolPaid:true,retreatPaid:true,
    sourceAttackerEnergies:x.owner.active.energies.cards.length,
    defenderDelta:x.foe.active.damage-defenderBefore,
    paperCompetitiveGameQualified:false
  }));
});
