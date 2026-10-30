'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicSpecialAttackPayable}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
const {energyUnits}=
  require('../simulation/twinleaf/actor-energy-payability.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));

/** @param {string} pokemonPrinting @param {string} energyPrinting @param {0|1} [seat] */
function staged(pokemonPrinting,energyPrinting,seat=0){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const {GamePhase}=native('game/store/state/state');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,
    PowerType,SpecialCondition
  });
  let id=83000;
  const card=name=>{
    const item=manager.getCardByName(name);
    assert.ok(item,'Native original printing unavailable: '+name);
    item.id=id++;
    return item;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=103;opponent.id=204;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  if(pokemonPrinting==='Alolan Raichu UNM')
    owner.active.cards.push(card('Pikachu LOR'));
  owner.active.cards.push(card(pokemonPrinting));
  owner.hand.cards.push(card(energyPrinting));
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,catalog,seat,card};
}

/** @param {string} pokemon @param {string} energy @param {0|1} [seat] */
function accepted(pokemon,energy,seat=0){
  const {store,state,owner,catalog}=staged(pokemon,energy,seat);
  const v=actorObservation(state,seat);
  const intent=chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true
  });
  assert.ok(intent);
  assert.equal(intent.kind,'attach-special-energy');
  assert.equal(intent.printing,energy);
  assert.equal(intent.slot,'active');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const handBefore=owner.hand.cards.length;
  store.dispatch(new PlayCardAction(owner.id,intent.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.hand.cards.length,handBefore-1);
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===energy));
  assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
  return {state,owner,catalog,seat};
}

test('pinned Store accepts actor-selected DDE on a real Dragon',()=>{
  const {state,owner,catalog}=accepted('Regidrago V SIT',
    'Double Dragon Energy ROS');
  assert.ok(catalog.dragonPokemonPrintings.has('Regidrago V SIT'));
  const after=actorObservation(state,0);
  const celestial=after.ownPublic.active.attacks.find(
    a=>a.name==='Celestial Roar');
  assert.ok(celestial);
  assert.equal(publicSpecialAttackPayable(after,catalog,
    after.ownPublic.active,celestial),true);
  assert.equal(owner.active.energies.cards.length,1);
});

test('rank4 UPR Unit Energy is gated by actual pinned CardManager printing',()=>{
  const manager=initializeCards();
  const variants=['Unit Energy LightningPsychicMetal UPR',
    'Unit Energy LPM UPR'];
  const present=variants.find(name=>manager.getCardByName(name));
  const available=manager.getAllCards().filter(c=>
    c.fullName?.includes('Unit Energy')).map(c=>c.fullName);
  console.log('NATIVE_UNIT_ENERGY_PRINTINGS:',JSON.stringify(available));
  const context={isBasic:true,isEvolution:false,isDragon:false,
    hasRuleBox:false,behindOnPrizes:false};
  assert.deepEqual(
    energyUnits('Unit Energy LPM UPR',context),
    energyUnits('Unit Energy LightningPsychicMetal UPR',context)
  );
  if(!present){
    console.log('NATIVE_UNSUPPORTED_PRINTING: Unit Energy UPR; '+
      'pure numeric policy cannot create a native card');
    assert.ok(variants.every(name=>!manager.getCardByName(name)));
    return;
  }
  const {state,catalog}=accepted('Pikachu LOR',present);
  const after=actorObservation(state,0);
  assert.ok(after.ownPublic.active.energies.includes(present));
  assert.equal(catalog.specialEnergies.has(present),true);
});

test('genuine Store accepts owner-only Double Dragon in physical seat B',()=>{
  const {state,owner,catalog,seat}=accepted('Regidrago V SIT',
    'Double Dragon Energy ROS',1);
  assert.equal(seat,1);
  assert.equal(state.players[1],owner);
  const after=actorObservation(state,1);
  assert.ok(after.ownPublic.active.energies.includes('Double Dragon Energy ROS'));
  assert.equal(after.opponentPublic.active.name,'Bunnelby');
  const celery=after.ownPublic.active.attacks.find(x=>x.name==='Celestial Roar');
  assert.ok(celery);
  assert.equal(publicSpecialAttackPayable(after,catalog,
    after.ownPublic.active,celery),true);
});


for(const energy of ['Reversal Energy PAL','Counter Energy CIN']){
  test('rank4 exact source attached '+energy+' behind on Prizes',()=>{
    const manager=initializeCards();
    if(!manager.getCardByName(energy)){
      console.log('NATIVE_UNSUPPORTED_ORIGINAL_SPECIAL',energy);
      return;
    }
    const {store,state,owner,catalog}=staged(
      'Alolan Raichu UNM',energy);
    state.players[1].prizes.splice(4);
    const {buildPublicPokemonProfileIndex}=
      require('../simulation/twinleaf/agent10-original-printing-energy-flags.cjs');
    catalog.publicPokemonProfileIndex=buildPublicPokemonProfileIndex(
      path.resolve(__dirname,'..'));
    const v=actorObservation(state,0);
    assert.equal(v.ownPublic.active.name,'Alolan Raichu');
    assert.equal(v.ownPublic.active.evolutionPrintings.length,2);
    assert.equal(v.ownPublic.prizeCount,6);
    assert.equal(v.opponentPublic.prizeCount,4);
    const intent=chooseActorRootIntent(v,catalog,{
      publicContextSpecialEnergy:true
    });
    assert.deepEqual(intent,{
      kind:'attach-special-energy',printing:energy,handIndex:0,
      slot:'active',index:0
    });
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    store.dispatch(new PlayCardAction(owner.id,intent.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(owner.active.energies.cards.some(c=>c.fullName===energy));
    const after=actorObservation(state,0);
    const electric=after.ownPublic.active.attacks.find(a=>
      a.name==='Electric Ball');
    assert.ok(electric);
    assert.equal(publicSpecialAttackPayable(after,catalog,
      after.ownPublic.active,electric),
    energy==='Reversal Energy PAL');
  });
}

// Share the existing pinned-native Energy regression gate with Plumeria denial.
require('./agent4-plumeria-pinned-native.test.cjs');
require('./agent4-plumeria-headless-native.test.cjs');


test('both-seat authentic printed Thunder cost blocks pointless Bench attachment',()=>{
  const {choosePublicContextSpecialEnergy}=
    require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
  for(const seat of [0,1]){
    const {store,state,owner,catalog,card}=staged(
      'Iron Thorns ex TWM','Speed Lightning Energy RCL',seat);
    const stadium=card('Thunder Mountain Prism Star LOT');
    const doubleColorless=()=>card('Double Colorless Energy SUM');
    owner.stadium.cards.push(stadium);
    // Use only printed rank6 quantities: three of four Speed Lightning
    // (two Active and one in hand) and its single DCE on the Bench.
    owner.active.energies.cards.push(card('Speed Lightning Energy RCL'),
      card('Speed Lightning Energy RCL'));
    owner.bench[0].cards.push(card('Iron Thorns ex TWM'));
    owner.bench[0].energies.cards.push(doubleColorless());
    const v=actorObservation(state,seat);
    const attacker=v.ownPublic.active;
    const bench=v.ownPublic.bench[0];
    assert.ok(attacker&&bench);
    const strike=attacker.attacks.find(a=>a.name==='Volt Cyclone');
    const benchStrike=bench.attacks.find(a=>a.name==='Volt Cyclone');
    assert.ok(strike&&benchStrike,'Real rank6 printed attack must exist');
    assert.equal(publicSpecialAttackPayable(v,catalog,attacker,strike),true);
    assert.equal(publicSpecialAttackPayable(v,catalog,bench,benchStrike),true);
    assert.equal(choosePublicContextSpecialEnergy(v,catalog),null);
    const first=chooseActorRootIntent(v,catalog,{
      publicContextSpecialEnergy:true
    });
    assert.deepEqual(first,{kind:'attack',attackName:'Volt Cyclone'});
    // The zero attack-gap gain is NOT zero game value: authentic Speed
    // Lightning still draws two on attachment to this Lightning Pokémon.
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const beforeDeck=owner.deck.cards.length;
    const beforeHand=owner.hand.cards.length;
    assert.equal(beforeHand,1);
    assert.equal(beforeDeck>=2,true);
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    assert.ok(owner.bench[0].energies.cards.some(e=>
      e.fullName==='Speed Lightning Energy RCL'));
    assert.equal(owner.hand.cards.length,2,
      'Speed Lightning should draw two after consuming the hand Energy');
    assert.equal(owner.deck.cards.length,beforeDeck-2);
  }
});

test('Temple of Sinnoh suppresses Speed Lightning on-attach draw but not attachment',()=>{
  for(const seat of [0,1]){
    const {store,state,owner,card,catalog}=staged('Iron Thorns ex TWM',
      'Speed Lightning Energy RCL',seat);
    owner.stadium.cards.push(card('Temple of Sinnoh ASR'));
    const oldHand=owner.hand.cards.length,oldDeck=owner.deck.cards.length;
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(owner.hand.cards.length,oldHand-1);
    assert.equal(owner.deck.cards.length,oldDeck);
    const v=actorObservation(state,seat);
    assert.ok(v.ownPublic.active.energies.includes('Speed Lightning Energy RCL'));
    const strike=v.ownPublic.active.attacks.find(a=>a.name==='Volt Cyclone');
    assert.ok(strike);
    assert.equal(publicSpecialAttackPayable(v,catalog,v.ownPublic.active,strike),
      false,'Temple attached Energy must supply Colorless');
  }
});

test('Temple of Sinnoh prevents Capture search and Jet switch in both seats',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  for(const seat of [0,1]){
    const cap=staged('Iron Thorns ex TWM','Capture Energy RCL',seat);
    cap.owner.stadium.cards.push(cap.card('Temple of Sinnoh ASR'));
    cap.owner.deck.cards.push(cap.card('Bunnelby PRC'));
    const initialDeck=cap.owner.deck.cards.length;
    cap.store.dispatch(new PlayCardAction(cap.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(cap.owner.active.energies.cards.some(c=>
      c.fullName==='Capture Energy RCL'));
    assert.equal(cap.owner.deck.cards.length,initialDeck);
    assert.ok(cap.owner.bench.every(slot=>slot.cards.length===0));
    assert.equal(cap.state.prompts.filter(p=>p.result===undefined).length,0);
    const jet=staged('Iron Thorns ex TWM','Jet Energy PAL',seat);
    jet.owner.stadium.cards.push(jet.card('Temple of Sinnoh ASR'));
    jet.owner.bench[0].cards.push(jet.card('Bunnelby PRC'));
    jet.store.dispatch(new PlayCardAction(jet.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    assert.equal(jet.owner.active.getPokemonCard().name,'Iron Thorns ex');
    assert.equal(jet.owner.bench[0].getPokemonCard().name,'Bunnelby');
    assert.ok(jet.owner.bench[0].energies.cards.some(c=>
      c.fullName==='Jet Energy PAL'));
    assert.equal(jet.state.prompts.filter(p=>p.result===undefined).length,0);
  }
});

test('Temple of Sinnoh suppresses Telepath Psychic Bench-search trigger',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  for(const seat of [0,1]){
    const fixture=staged('Mewtwo & Mew-GX UNM',
      'Telepath [P] Energy M3',seat);
    const {store,state,owner,card}=fixture;
    owner.stadium.cards.push(card('Temple of Sinnoh ASR'));
    owner.deck.cards.push(card('Mewtwo & Mew-GX UNM'));
    const beforeDeck=owner.deck.cards.length;
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(owner.active.energies.cards.some(c=>
      c.fullName==='Telepath [P] Energy M3'));
    assert.equal(owner.deck.cards.length,beforeDeck);
    assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
    assert.ok(owner.bench.every(slot=>slot.cards.length===0));
  }
});
