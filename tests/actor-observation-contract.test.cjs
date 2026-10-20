'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');

/** @param {string} fullName */
function card(fullName){
  const name=fullName.replace(/ (?:BKP|LTR|GRI|TEU|UNM|SIT|CRE|MEE|SVE)$/,'');
  return {fullName,name,hp:210,
    attacks:[{name:'Printed Attack',cost:['PSYCHIC','COLORLESS']}],
    powers:[{name:'Printed Ability'}]};
}
/** @param {string} fullName */
function pokemon(fullName){
  const c=card(fullName);
  return {getPokemonCard:()=>c,cards:[c],damage:20,
    energies:{cards:[card('Psychic Energy SVE')]},
    tools:[card('Float Stone BKT')]};
}
/** @param {string} activeName */
function player(activeName){
  return {
    active:pokemon(activeName),bench:[null,null,null,null,null].map(()=>({
      getPokemonCard:()=>null,cards:[],damage:0,
      energies:{cards:[]},tools:[]})),
    hand:{cards:[card('Battle Compressor PHF')]},
    deck:{cards:[card('Mewtwo & Mew-GX UNM')]},
    prizes:[{cards:[card('Gengar & Mimikyu-GX TEU')]}],
    discard:{cards:[card('Fog Crystal CRE')]},
    lostzone:{cards:[]},stadium:{cards:[card('Sky Field ROS')]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,usedVSTAR:false,cannotPlayItemCards:false,
    cannotPlaySupporterCards:false,cannotPlayStadiumCards:false,
    cannotPlaySpecialEnergyCards:false
  };
}
function fixture(){
  return {activePlayer:0,turn:3,phase:5,prompts:[],
    players:[player('Mewtwo & Mew-GX UNM'),player('Garbodor BKP')]};
}

test('genuine owner/public printing identities, amounts and detached shape',()=>{
  const state=fixture();
  const v=actorObservation(state,0);
  assert.equal(v.globalTurn,3);
  assert.equal(v.decisionKind,'owner-root');
  assert.deepEqual(v.ownHand,['Battle Compressor PHF']);
  assert.equal(v.ownPublic.active.printing,'Mewtwo & Mew-GX UNM');
  assert.equal(v.opponentPublic.active.printing,'Garbodor BKP');
  assert.deepEqual(v.opponentPublic.active.tools,['Float Stone BKT']);
  assert.deepEqual(v.opponentPublic.active.attacks[0].cost,
    ['PSYCHIC','COLORLESS']);
  assert.deepEqual(v.opponentPublic.handCount,1);
  assert.equal(v.opponentPublic.prizeCount,1);
  assert.ok(Object.isFrozen(v));
  assert.ok(Object.isFrozen(v.opponentPublic.active.energies));
  assert.ok(Object.isFrozen(v.ownHand));
  assert.notStrictEqual(v.ownHand,state.players[0].hand.cards);
});

test('opponent hand, deck, Prize identities and unseen order cannot affect view',()=>{
  const x=fixture(),y=fixture();
  x.players[1].hand.cards=[card('Psychic Energy SVE')];
  y.players[1].hand.cards=[card('Secret Box TWM')];
  x.players[1].deck.cards=[card('Boost Shake EVS'),card('Garbodor BKP')];
  y.players[1].deck.cards=[card('Garbodor BKP'),card('Boost Shake EVS')];
  x.players[1].prizes[0].cards=[card('Dark Patch ASR')];
  y.players[1].prizes[0].cards=[card('Mysterious Treasure FLI')];
  assert.deepEqual(actorObservation(x,0),actorObservation(y,0));
  y.players[1].active=pokemon('Garbodor LTR');
  assert.notDeepEqual(actorObservation(x,0),actorObservation(y,0),
    'Garbodor printing is publicly observable');
});

test('the actor cannot peek own physical deck or unseen Prizes at K0',()=>{
  const x=fixture(),y=fixture();
  x.players[0].deck.cards=[card('Gengar & Mimikyu-GX TEU')];
  y.players[0].deck.cards=[card('Forest Seal Stone SIT')];
  x.players[0].prizes[0].cards=[card('Mewtwo & Mew-GX UNM')];
  y.players[0].prizes[0].cards=[card('Psychic Energy SVE')];
  assert.deepEqual(actorObservation(x,0),actorObservation(y,0));
});

test('forbidden hidden-card identity reads fail under poison arrays',()=>{
  const state=fixture();
  const guarded=(count)=>new Proxy({length:count},{get(target,name){
    if(name==='length')return target.length;
    throw new Error('Forbidden concealed-zone identity access '+String(name));
  }});
  state.players[0].deck.cards=guarded(7);
  state.players[0].prizes[0].cards=guarded(2);
  state.players[1].hand.cards=guarded(3);
  state.players[1].deck.cards=guarded(32);
  state.players[1].prizes[0].cards=guarded(4);
  const view=actorObservation(state,0);
  assert.equal(view.ownPublic.deckCount,7);
  assert.equal(view.ownPublic.prizeCount,2);
  assert.equal(view.opponentPublic.handCount,3);
  assert.equal(view.opponentPublic.deckCount,32);
  assert.equal(view.opponentPublic.prizeCount,4);
});

test('authenticated K1 snapshot enters separately and stays detached',()=>{
  const state=fixture();
  const k1={epoch:2,exactMembershipKnown:true,
    knownPrintings:[{printing:'Gengar & Mimikyu-GX TEU',copies:1}],
    invalidationReason:null};
  const view=actorObservation(state,0,{ownerK1Snapshot:k1});
  assert.equal(view.ownerK1.knownPrintings[0].printing,
    'Gengar & Mimikyu-GX TEU');
  assert.ok(Object.isFrozen(view.ownerK1.knownPrintings));
  k1.knownPrintings[0].copies=33;
  assert.equal(view.ownerK1.knownPrintings[0].copies,1);
  assert.equal(actorObservation(state,0).ownerK1,null);
});

test('a prompted opponent can observe its own choice without active-turn ownership',()=>{
  const s=fixture();
  const prompt={constructor:{name:'ChooseCardsPrompt'},playerId:202,
    cards:s.players[1].deck,result:undefined};
  s.players[1].id=202;
  s.prompts=[prompt];
  const p=actorObservation(s,1);
  assert.equal(p.decisionKind,'owner-prompt');
  assert.equal(p.pendingPromptType,'ChooseCardsPrompt');
  assert.equal(p.pendingOwnerDeckSearch,true);
  assert.throws(()=>actorObservation(s,0),/prompted actor/);
});

test('a deck alias is not a deck search without a native choice prompt',()=>{
  const state=fixture();
  state.players[0].id=101;
  const hidden=new Proxy({length:4},{get(target,key){
    if(key==='length')return target.length;
    throw new Error('Illegal K0 physical deck read '+String(key));
  }});
  state.players[0].deck.cards=hidden;
  state.prompts=[{constructor:{name:'SelectPrompt'},playerId:101,
    cards:state.players[0].deck,result:undefined}];
  const alias=actorObservation(state,0);
  assert.equal(alias.decisionKind,'owner-prompt');
  assert.equal(alias.pendingPromptType,'SelectPrompt');
  assert.equal(alias.pendingOwnerDeckSearch,false);
  assert.equal(alias.ownPublic.deckCount,4);
  state.prompts[0].constructor={name:'ChooseCardsPrompt'};
  const native=actorObservation(state,0);
  assert.equal(native.pendingOwnerDeckSearch,true);
  assert.equal(native.ownPublic.deckCount,4);
});

test('all pinned public player-level card-play locks reach actor-only decisions',()=>{
  const s=fixture(),owner=s.players[0];
  const locked=[
    ['cannotPlayPokemonCards','pokemonPlayLocked'],
    ['cannotPlayPokemonWithAbilities','abilityPokemonPlayLocked'],
    ['cannotEvolvePokemonCards','evolutionPlayLocked'],
    ['cannotPlayItemCards','itemPlayLocked'],
    ['cannotPlaySupporterCards','supporterPlayLocked'],
    ['cannotPlayStadiumCards','stadiumPlayLocked'],
    ['cannotPlayToolCards','toolPlayLocked'],
    ['cannotPlayEnergyCards','energyPlayLocked'],
    ['cannotPlaySpecialEnergyCards','specialEnergyPlayLocked']
  ];
  const base=actorObservation(s,0);
  for(const [,field] of locked)assert.equal(base.ownTurnResources[field],false);
  for(const [native,field] of locked){
    owner[native]=true;
    const current=actorObservation(s,0);
    assert.equal(current.ownTurnResources[field],true);
    for(const [,other] of locked) {
      if(other!==field)assert.equal(current.ownTurnResources[other],false);
    }
    owner[native]=false;
  }
  // With the second seat active, the first player's lock flags must never
  // become owner resource flags or disclose any concealed player state.
  s.activePlayer=1;
  s.players[0].cannotPlayPokemonWithAbilities=true;
  s.players[0].cannotPlayEnergyCards=true;
  const other=actorObservation(s,1);
  for(const [,field] of locked)assert.equal(other.ownTurnResources[field],false);
});

test('actor root authentication and invalid seat are enforced',()=>{
  const s=fixture();
  assert.throws(()=>actorObservation(s,1),/Actor-only/);
  assert.throws(()=>actorObservation(s,2));
  assert.throws(()=>actorObservation(s,0,{ownerK1Snapshot:{epoch:-1,
    exactMembershipKnown:true}}));
});
