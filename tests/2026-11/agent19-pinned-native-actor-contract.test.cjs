'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const observe=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const rank3=require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');
const rank6=require('../../simulation/evaluation/2026-11/agent39-rank6-iron-thorns-opponent-policy.cjs');

// Pinned Twinleaf a9905a76 CardType: Psychic=5, Dark=7,
// Colorless=9, Fairy=10, Dragon=11. Stage: Basic=2, VMAX=5, VSTAR=6.
const card=fullName=>({fullName});
function pokemon({fullName,name,hp,stage,tags,types,retreat=[9],weakness=[],
  resistance=[],energies=[],damage=0,attacks=[],powers=[]}) {
  const p={fullName,name,hp,stage,tags,cardType:types,retreat,
    weakness,resistance,attacks,powers};
  // No p.subtypes: pinned PokemonCard has Stage and public Card.tags instead.
  return {cards:[p],getPokemonCard(){return p},damage,pokemonPlayedTurn:1,
    abilityLockActivationOrder:0,energies:{cards:energies.map(card)},
    tools:[],specialConditions:[]};
}
const empty=()=>({cards:[],getPokemonCard(){return null},
  damage:0,energies:{cards:[]},tools:[],specialConditions:[]});
function player(id,own) {
  const active=own?pokemon({
    fullName:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    hp:320,stage:5,tags:['VMAX'],types:[5],retreat:[9,9],
    weakness:[{type:7}],resistance:[{type:6,value:-30}],
    energies:Array(5).fill('Psychic Energy SVE'),
    powers:[{name:'Underworld Door',powerType:2,text:'attach and draw'}],
    attacks:[{name:'Max Geist',damage:10,damageCalculation:'+',
      cost:[9,9,9],text:'10+30 per Psychic Energy',gxAttack:false,barrage:false}]
  }):pokemon({
    fullName:'Regidrago VSTAR SIT',name:'Regidrago VSTAR',
    hp:280,stage:6,tags:['VSTAR'],types:[11],retreat:[9,9,9],damage:120,
    powers:[{name:'Legacy Star',powerType:2,text:'recover cards'}],
    attacks:[{name:'Apex Dragon',damage:0,cost:[1,1,2],
      text:'copy from discard',gxAttack:false,barrage:false}]
  });
  const bench=own?[]:[pokemon({
    fullName:'Regidrago V SIT',name:'Regidrago V',hp:220,
    stage:2,tags:['V'],types:[11],weakness:[{type:10}],attacks:[]
  })];
  // Access to any concealed Prize identity causes a hard failure.
  const hidden=()=>({get fullName(){throw Error('Concealed Prize identity accessed')}});
  return {id,active,bench:[...bench,...Array(5-bench.length).fill(null).map(empty)],
    stadium:{cards:own?[card('Path to the Peak CRE')]:[],stadiumDirection:null},
    discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
    hand:{cards:own?[card('Fog Crystal CRE')]:[],isPublic:false},
    deck:{cards:[]},prizes:Array.from({length:own?2:6},()=>({
      cards:[hidden()],faceUpPrize:false})),
    usedGX:false,usedVSTAR:false,legacyEnergyUsed:false,
    ignoreAttackCostCardTypes:[9],stadiumAndToolHaveNoEffectTurnsRemaining:0,
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:false,
    stadiumPlayedTurn:false,stadiumUsedTurn:false};
}
for(const seat of [0,1]){
 test('pinned actual Stage/Tag and numeric CardType actor projection, physical seat '+seat,()=>{
  const state={players:[0,1].map(i=>player(i,i===seat)),
    activePlayer:seat,turn:4,phase:2,prompts:[]};
  const v=observe.actorObservation(state,seat);
  assert.deepEqual(v.ownPublic.active.printed.types,['Psychic']);
  assert.deepEqual(v.ownPublic.active.printed.subtypes,['VMAX','V']);
  assert.equal(v.ownPublic.active.printed.stage,'VMAX');
  assert.equal(v.opponentPublic.active.printed.stage,'VSTAR');
  assert.equal(v.opponentPublic.bench[0].printed.stage,'BASIC');
  assert.deepEqual(v.ownPublic.active.printed.retreatCost,['Colorless','Colorless']);
  assert.deepEqual(v.ownPublic.active.printed.weakness,[{type:'Darkness',value:2}]);
  assert.deepEqual(v.ownPublic.active.printed.resistance,[{type:'Fighting',value:-30}]);
  assert.deepEqual(v.ownPublic.active.attacks[0].cost,['Colorless','Colorless','Colorless']);
  assert.deepEqual(v.opponentPublic.active.printed.subtypes,['VSTAR','V']);
  assert.deepEqual(v.opponentPublic.active.printed.types,['Dragon']);
  assert.deepEqual(v.opponentPublic.bench[0].printed.subtypes,['Basic','V']);
  assert.deepEqual(v.opponentPublic.bench[0].printed.weakness,[{type:'Fairy',value:2}]);
  assert.deepEqual(v.ownPublic.publicTurnRestrictions.ignoreAttackCostCardTypes,['Colorless']);
  assert.equal(v.ownPublic.prizeSlots.every(slot=>slot.printing===undefined),true);
  assert.doesNotThrow(()=>protocol.validateActorObservation(v,seat));
  assert.equal(Object.isFrozen(v),true);

  // Strict worker request admission is run on the exact real-shaped projected
  // state. This is a no-game contract check, not native action construction.
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[
   {token:'fog',kind:'play-card',actorPrinting:'Fog Crystal CRE',publicMetadata:{}},
   {token:'hit',kind:'attack',attackName:'Max Geist'},
   {token:'pass',kind:'pass'}
  ]};
  const msg={schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'pinned-'+seat,sequence:0,role:'candidate',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,observation:v,
    prompt:null,publicEventReceipt:null,actionFrontier:frontier};
  const init={role:'candidate',seat,policyVersion:'not-two-profile',
    config:{}};
  const allowed=protocol.validateRequest(msg,init,0,new Set());
  assert.deepEqual([...allowed.actionTokens].sort(),['fog','hit','pass']);
  assert.deepEqual(protocol.validateDecision({kind:'select-action',token:'hit'},
    null,allowed.actionTokens),{kind:'select-action',token:'hit'});

  // This decision-sensitive predicate is true after canonicalization and
  // false for the previous raw numeric projection; actual policy behavior
  // is separately tested on the Agent46 successor branch.
  const cost=v.ownPublic.active.attacks[0].cost;
  const isFunded=v.ownPublic.active.printed.types.includes('Psychic')&&
    cost.every(c=>c==='Colorless'||c==='Psychic')&&
    v.ownPublic.active.energies.length>=cost.length;
  assert.equal(isFunded,true);
  const beforeFix=JSON.parse(JSON.stringify(v));
  beforeFix.ownPublic.active.printed.types=[5];
  beforeFix.ownPublic.active.attacks[0].cost=[9,9,9];
  assert.equal(beforeFix.ownPublic.active.printed.types.includes('Psychic'),false);
  assert.equal(beforeFix.ownPublic.active.attacks[0].cost.every(c=>
    c==='Colorless'||c==='Psychic'),false);
 });
}


for(const seat of [0,1]){
 test('native BASIC Stage flips a real rank3 Snorlax policy from Handiwork to Penny, seat '+seat,()=>{
  const own=player(seat,true);
  const other=player(1-seat,false);
  own.active=pokemon({fullName:'Snorlax PGO 55',name:'Snorlax',
    hp:150,stage:2,tags:[],types:[9],retreat:[9,9,9,9],damage:70});
  own.hand.cards=[card('Penny SVI 183'),card("Team Rocket's Handiwork FCO 112")];
  own.deck.cards=Array.from({length:20},(_,i)=>card('owner deck '+i));
  other.deck.cards=Array.from({length:30},(_,i)=>card('opponent deck '+i));
  const state={players:seat===0?[own,other]:[other,own],
    activePlayer:seat,turn:4,phase:2,prompts:[]};
  const view=observe.actorObservation(state,seat);
  assert.equal(view.ownPublic.active.printed.stage,'BASIC');
  assert.equal(view.ownPublic.active.damage,70);
  assert.deepEqual(view.ownPublic.active.printed.subtypes,['Basic']);
  assert.doesNotThrow(()=>protocol.validateActorObservation(view,seat));
  const actions=[
    {token:'penny',kind:'play-card',actorPrinting:'Penny SVI 183',publicMetadata:{}},
    {token:'handi',kind:'play-card',actorPrinting:"Team Rocket's Handiwork FCO 112",publicMetadata:{}},
    {token:'pass',kind:'pass'}
  ];
  const root={role:'opponent',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:{items:actions}};
  const policy=rank3.createPolicy({role:'opponent',seat,
    policyVersion:rank3.POLICY_VERSION,config:{}});
  assert.equal(rank3.scoreAction(actions[0],root),90);
  assert.equal(rank3.scoreAction(actions[1],root),65);
  assert.deepEqual(policy.decide(root),{kind:'select-action',token:'penny'});
  // Exact previous native numeric Stage (=2) did not satisfy the rank3
  // policy's "printed.stage === 'BASIC'" premise. Demonstrate the actual
  // game-action error, not merely a projection-shape mismatch.
  const rawOld=JSON.parse(JSON.stringify(view));
  rawOld.ownPublic.active.printed.stage=2;
  const previous={...root,observation:rawOld};
  assert.equal(rank3.scoreAction(actions[0],previous),0);
  assert.deepEqual(policy.decide(previous),{kind:'select-action',token:'handi'});
 });
}


for(const seat of [0,1]){
 test('native Fairy type flips rank6 Wondrous-vs-Beach Stadium decision, seat '+seat,()=>{
  const own=player(seat,true),other=player(1-seat,false);
  own.active=pokemon({fullName:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    hp:230,stage:2,tags:['ex'],types:[4]});
  own.hand.cards=[card('Wondrous Labyrinth TEU 158'),card('Tropical Beach BWP 50')];
  own.deck.cards=Array.from({length:20},(_,i)=>card('owner deck '+i));
  own.stadium.cards=[];
  // Pinned Gardevoir-GX BUS is a Fairy Pokémon (CardType.FAIRY=10).
  other.active=pokemon({fullName:'Gardevoir-GX BUS',name:'Gardevoir-GX',
    hp:230,stage:4,tags:['GX'],types:[10],energies:[
      'Fairy Energy SVE','Double Colorless Energy FCO'
    ]});
  other.deck.cards=Array.from({length:30},(_,i)=>card('opponent deck '+i));
  const state={players:seat===0?[own,other]:[other,own],
    activePlayer:seat,turn:4,phase:2,prompts:[]};
  const view=observe.actorObservation(state,seat);
  assert.deepEqual(view.opponentPublic.active.printed.types,['Fairy']);
  assert.equal(view.opponentPublic.active.printed.stage,'STAGE_2');
  assert.doesNotThrow(()=>protocol.validateActorObservation(view,seat));
  const actions=[
    {token:'wondrous',kind:'play-card',actorPrinting:'Wondrous Labyrinth TEU 158',publicMetadata:{}},
    {token:'beach',kind:'play-card',actorPrinting:'Tropical Beach BWP 50',publicMetadata:{}},
    {token:'pass',kind:'pass'}
  ];
  const root={role:'opponent',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:{items:actions}};
  const policy=rank6.createPolicy({role:'opponent',seat,
    policyVersion:rank6.POLICY_VERSION,config:{}});
  assert.equal(rank6.scoreAction(actions[0],root),0);
  assert.equal(rank6.scoreAction(actions[1],root),85);
  assert.deepEqual(policy.decide(root),{kind:'select-action',token:'beach'});
  const rawOld=JSON.parse(JSON.stringify(view));
  rawOld.opponentPublic.active.printed.types=[10];
  const previous={...root,observation:rawOld};
  assert.equal(rank6.scoreAction(actions[0],previous),95);
  assert.deepEqual(policy.decide(previous),{kind:'select-action',token:'wondrous'});
 });
}

// Genuine pinned-card shape: fullName excludes the collector number, while
// public name / set / setNumber together establish the selected printing.
// This is a host -> strict protocol -> source-bound worker unit boundary,
// not a pinned Store/game or a full policy competence receipt.
const nativeFrontier=require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
for(const seat of [0,1]){
  test('rank3 real-native printing fields reach Penny decision and exclude alternate art, seat '+seat,()=>{
    class NativeTrainer {}
    const trainer=(name,set,setNumber,fullName=name+' '+set)=>
      Object.assign(new NativeTrainer(),{name,set,setNumber,fullName});
    const own=player(seat,true),other=player(1-seat,false);
    own.active=pokemon({fullName:'Snorlax PGO',name:'Snorlax',hp:150,
      stage:2,tags:[],types:[9],retreat:[9,9,9,9],damage:70});
    Object.assign(own.active.cards[0],{set:'PGO',setNumber:'55'});
    own.hand.cards=[
      trainer('Penny','SVI','183'),
      trainer("Team Rocket's Handiwork",'FCO','112')
    ];
    own.deck.cards=Array.from({length:20},(_,i)=>card('owner deck '+i));
    other.deck.cards=Array.from({length:30},(_,i)=>card('opponent deck '+i));
    const state={players:seat===0?[own,other]:[other,own],
      activePlayer:seat,turn:4,phase:2,prompts:[]};
    const view=observe.actorObservation(state,seat);
    assert.deepEqual(view.ownHand,['Penny SVI 183',
      "Team Rocket's Handiwork FCO 112"]);
    assert.equal(view.ownPublic.active.printing,'Snorlax PGO 55');
    const makeItem=(i,token)=>nativeFrontier.projectNativeAction(
      {type:'PLAY_CARD_ACTION',handIndex:i},state,seat,
      {TrainerCard:NativeTrainer},token);
    const penny=makeItem(0,'penny'),handi=makeItem(1,'handi');
    assert.equal(penny.actorPrinting,'Penny SVI 183');
    assert.equal(handi.actorPrinting,"Team Rocket's Handiwork FCO 112");
    const pass={token:'pass',kind:'pass'};
    const frontier={schema:protocol.FRONTIER_SCHEMA,items:[penny,handi,pass]};
    const message={schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'native-printing-'+seat,sequence:0,role:'opponent',seat,
      observationSchema:protocol.OBSERVATION_SCHEMA,observation:view,
      prompt:null,publicEventReceipt:null,actionFrontier:frontier};
    const allowed=protocol.validateRequest(message,{role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}},0,new Set());
    const root={role:'opponent',seat,observation:view,prompt:null,
      publicEventReceipt:null,actionFrontier:frontier};
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const chosen=policy.decide(root);
    assert.deepEqual(chosen,{kind:'select-action',token:'penny'});
    assert.deepEqual(protocol.validateDecision(chosen,null,allowed.actionTokens),chosen);
    // Same English name and set, DIFFERENT native collector number: never
    // promote SVI 239 to the exact source's SVI 183 even though fullName
    // and name share prefixes.
    own.hand.cards[0]=trainer('Penny','SVI','239','Penny2 SVI');
    const altView=observe.actorObservation(state,seat);
    const altPenny=makeItem(0,'penny');
    assert.equal(altPenny.actorPrinting,'Penny SVI 239');
    const altRoot={...root,observation:altView,
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[altPenny,handi,pass]}};
    assert.equal(rank3.scoreAction(altPenny,altRoot),0);
    assert.deepEqual(policy.decide(altRoot),{kind:'select-action',token:'handi'});
    // Missing printed number is an unqualified engine key, not a license
    // to attribute the source's exact collector number from its name.
    own.hand.cards[0]=trainer('Penny','SVI',null);
    const missingView=observe.actorObservation(state,seat);
    const missingPenny=makeItem(0,'penny');
    assert.equal(missingPenny.actorPrinting,'Penny SVI');
    const missingRoot={...root,observation:missingView,
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[missingPenny,handi,pass]}};
    assert.equal(rank3.scoreAction(missingPenny,missingRoot),0);
    assert.deepEqual(policy.decide(missingRoot),{kind:'select-action',token:'handi'});
  });
}
