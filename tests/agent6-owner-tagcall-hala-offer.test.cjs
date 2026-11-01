'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  TAG_CALL,GUZMA_HALA,binomial,k0AtLeastOneInDeck,
  offerOwnerTagCallHala,chooseAuthenticatedTagCallHala
}=require('../simulation/twinleaf/agent6-owner-tagcall-hala-offer.cjs');

const registered=[
  ...Array(4).fill('Iron Thorns ex TWM'),
  TAG_CALL,TAG_CALL,GUZMA_HALA,GUZMA_HALA,
  'Thunder Mountain Prism Star LOT',
  ...Array(51).fill('Other Card TEST')
];
assert.equal(registered.length,60);

/** @param {object} [options] */
function sourceView(options={}){
  return {
    actorSeat:options.seat??0,decisionKind:'owner-root',
    globalTurn:options.turn??1,
    ownHand:options.hand??[TAG_CALL,
      'Speed Lightning Energy RCL','Plumeria BUS','VS Seeker PHF',
      'Double Colorless Energy SUM','Crushing Hammer POR','Tag Call CEC'],
    ownPublic:{
      active:{name:'Iron Thorns ex',
        evolutionPrintings:['Iron Thorns ex TWM'],energies:[],tools:[]},
      bench:[null,null,null,null,null],
      stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      publicTurnRestrictions:options.publicTurnRestrictions??{},
      deckCount:46,prizeCount:6
    },
    ownTurnResources:options.turnResources??{
      supporterPlayedTurn:0,itemPlayLocked:false
    },
    opponentPublic:{active:null,bench:[],discard:[],stadium:[]},
    ownerK1:options.ownerK1??null
  };
}

test('registered first-own-turn Tag Call offer is K0 and remains unverified',()=>{
  const a=offerOwnerTagCallHala(sourceView(),registered);
  assert.equal(a.eligible,true);
  assert.deepEqual(a.action,{
    kind:'play-tag-call-hala-search',handIndex:0,
    printing:TAG_CALL,targetPrinting:GUZMA_HALA,
    nativeDispatchImplemented:false
  });
  assert.equal(a.sourceVisibility,'K0-unverified-search-target');
  assert.equal(a.targetDeckPresence.numerator,'1311');
  assert.equal(a.targetDeckPresence.denominator,'1326');
  assert.equal(a.nativeLegality,'not-probed');
  assert.equal(a.competitivelyQualified,false);
});

test('probability is exact finite hidden-pool fraction, never a known deck fact',()=>{
  assert.equal(binomial(52,2),1326n);
  assert.equal(binomial(6,2),15n);
  assert.equal(k0AtLeastOneInDeck(2,46,6).value,1311/1326);
  assert.equal(k0AtLeastOneInDeck(1,46,6).value,46/52);
  assert.equal(k0AtLeastOneInDeck(2,0,6).value,0);
  assert.equal(k0AtLeastOneInDeck(2,0,1),null);
});

test('both actual seats can make the same owner-only offer',()=>{
  const a=offerOwnerTagCallHala(sourceView({seat:0}),registered);
  const b=offerOwnerTagCallHala(sourceView({seat:1}),registered);
  assert.deepEqual(a,b);
  assert.equal(offerOwnerTagCallHala(sourceView({turn:2}),registered)
    .eligible,true);
  assert.equal(offerOwnerTagCallHala(sourceView({turn:3}),registered)
    .blocker,'outside-first-ordinary-turn');
});

test('hidden deck, Prize and opponent hand swaps do not change root',()=>{
  const a=sourceView(),b=sourceView();
  a.hiddenDeck=[GUZMA_HALA];b.hiddenDeck=[];
  a.hiddenPrize=[GUZMA_HALA];b.hiddenPrize=[];
  a.opponentHiddenHand=['Marnie SSH'];b.opponentHiddenHand=['Eri TEF'];
  assert.deepEqual(offerOwnerTagCallHala(a,registered),
    offerOwnerTagCallHala(b,registered));
});

test('Item locks and already-held G&H protect Tag Call connector',()=>{
  const a=sourceView({turnResources:{itemPlayLocked:true}});
  assert.equal(offerOwnerTagCallHala(a,registered).blocker,
    'owner-item-lock');
  const b=sourceView({publicTurnRestrictions:{itemPlayLocked:true}});
  assert.equal(offerOwnerTagCallHala(b,registered).blocker,
    'owner-item-lock');
  const c=sourceView({hand:[TAG_CALL,GUZMA_HALA]});
  assert.equal(offerOwnerTagCallHala(c,registered).blocker,
    'guzma-hala-already-held');
  assert.equal(offerOwnerTagCallHala(
    sourceView({hand:['Plumeria BUS']}),registered).blocker,
    'tag-call-not-held');
  assert.equal(offerOwnerTagCallHala(sourceView(),
    registered.slice(1)).blocker,
    'missing-verified-own-registered-60');
});

test('publicly spent copies and owner registration cannot be searched',()=>{
  const a=sourceView();
  a.ownPublic.discard=[GUZMA_HALA,GUZMA_HALA];
  assert.equal(offerOwnerTagCallHala(a,registered).blocker,
    'no-unaccounted-target-copy');
  a.ownPublic.discard=[];
  const other=[...Array(60).fill('Other Card TEST')];
  assert.equal(offerOwnerTagCallHala(a,other).blocker,
    'tag-or-target-not-in-owner-registered-60');
  a.ownPublic.lostZone=[GUZMA_HALA,GUZMA_HALA,GUZMA_HALA];
  assert.equal(offerOwnerTagCallHala(a,registered).blocker,
    'inconsistent-owner-target-custody');
});

test('authentic owner K1 absence fails closed, present bypasses K0 estimate',()=>{
  const absent=sourceView({ownerK1:{exactMembershipKnown:true,
    knownPrintings:[{printing:TAG_CALL,copies:1}]}});
  assert.equal(offerOwnerTagCallHala(absent,registered).blocker,
    'K1-target-known-absent');
  const present=sourceView({ownerK1:{exactMembershipKnown:true,
    knownPrintings:[{printing:GUZMA_HALA,copies:1}]}});
  const a=offerOwnerTagCallHala(present,registered);
  assert.equal(a.eligible,true);
  assert.equal(a.sourceVisibility,'K1-target-known-in-owner-deck');
  assert.equal(a.targetDeckPresence,null);
});

test('only accepted Tag Call origin can select own-deck G&H',()=>{
  const input={actor:{actorSeat:1,decisionKind:'owner-prompt'},
    prompt:{id:73,source:'own-deck',message:'CHOOSE_CARD_TO_HAND',
      offered:[{index:0,printing:'Guzma BUS',selectableAlone:true},
        {index:1,printing:GUZMA_HALA,selectableAlone:true}]}};
  const origin={acceptedNativeTagCall:true,actorSeat:1,
    originPrinting:TAG_CALL,ownerPromptId:73};
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,origin),
    {indices:[1]});
  assert.equal(chooseAuthenticatedTagCallHala(input,
    {...origin,actorSeat:0}),null);
  assert.equal(chooseAuthenticatedTagCallHala(input,
    {...origin,acceptedNativeTagCall:false}),null);
  assert.equal(chooseAuthenticatedTagCallHala(input,
    {...origin,originPrinting:'Ultra Ball SUM'}),null);
  assert.equal(chooseAuthenticatedTagCallHala(input,
    {...origin,ownerPromptId:74}),null);
  assert.equal(chooseAuthenticatedTagCallHala(
    {...input,prompt:{...input.prompt,source:'own-discard'}},origin),null);
});

test('authenticated two-card deck-search menu selects only G&H if allowed',()=>{
  const input={actor:{actorSeat:0,decisionKind:'owner-prompt'},
    prompt:{id:7,source:'own-deck',message:'CHOOSE_CARD_TO_HAND',
      bundles:[{printings:[GUZMA_HALA,'Guzma BUS']},
        {printings:[GUZMA_HALA]}]}};
  const origin={acceptedNativeTagCall:true,actorSeat:0,
    originPrinting:TAG_CALL,ownerPromptId:7};
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,origin),
    {printings:[GUZMA_HALA]});
  input.prompt.bundles=[{printings:['Tag Team A','Tag Team B']}];
  assert.equal(chooseAuthenticatedTagCallHala(input,origin),null);
  input.prompt.bundles=[{printings:['Tag Team A',GUZMA_HALA]}];
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,origin),
    {printings:['Tag Team A',GUZMA_HALA]});
});

test('second native TAG TEAM selection is explicit and validated',()=>{
  const input={actor:{actorSeat:0,decisionKind:'owner-prompt'},
    prompt:{id:77,source:'own-deck',message:'CHOOSE_CARD_TO_HAND',
      bundles:[{printings:[GUZMA_HALA]},
        {printings:['Cynthia & Caitlin CEC',GUZMA_HALA]},
        {printings:['Bellelba & Brycen-Man CEC',GUZMA_HALA]}]}};
  const receipt={acceptedNativeTagCall:true,actorSeat:0,
    originPrinting:TAG_CALL,ownerPromptId:77};
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,receipt),
    {printings:[GUZMA_HALA]});
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,receipt,{
    secondaryTagTeamPriority:['Cynthia & Caitlin CEC']
  }),{printings:['Cynthia & Caitlin CEC',GUZMA_HALA]});
  assert.deepEqual(chooseAuthenticatedTagCallHala(input,receipt,{
    secondaryTagTeamPriority:['Bellelba & Brycen-Man CEC']
  }),{printings:['Bellelba & Brycen-Man CEC',GUZMA_HALA]});
  assert.equal(chooseAuthenticatedTagCallHala(input,
    {...receipt,acceptedNativeTagCall:false},{
    secondaryTagTeamPriority:['Cynthia & Caitlin CEC']
  }),null);
});
