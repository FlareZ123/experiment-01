'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerAudit,SCOPES,VERSION}=
  require('../simulation/evaluation/agent9-rank5-quickball-four-scope.cjs');
const {actorSpecialEnergyEnabled,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const catalog={basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  specialEnergies:new Set(),basicEnergyTypes:{},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}};
function owner(seat){return {actorSeat:seat,decisionKind:'owner-root',globalTurn:3,
  ownHand:['Quick Ball FST','Switch SVI','Switch SVI'],
  ownTurnResources:{itemPlayLocked:false,pokemonPlayLocked:false,
    energyPlayLocked:false,specialEnergyPlayLocked:false,energyPlayedTurn:0},
  ownPublic:{active:{name:'Mew V',energies:[],attacks:[],
      specialConditions:[],publicRestrictions:{}},
    bench:[null,null,null,null,null],deckCount:20,stadium:[],
    publicTurnRestrictions:{attackLockTurnsRemaining:0}},
  opponentPublic:{stadium:[]}}}
test('frozen four scopes preserve owner-only seat gating and default off',()=>{
  assert.equal(VERSION,'agent9-rank5-quickball-four-scope-causal-native-v1');
  assert.deepEqual(SCOPES,['off','source','candidate','both']);
  for(const allowedSeat of [0,1])for(const actorSeat of [0,1]){
    const live=actorSpecialEnergyEnabled(true,allowedSeat,actorSeat);
    const intent=chooseActorRootIntent(owner(actorSeat),catalog,{quickBallRoot:live});
    assert.equal(intent.kind,allowedSeat===actorSeat?'play-quick-ball':'pass');
  }
  assert.equal(actorSpecialEnergyEnabled(false,null,0),false);
  assert.equal(actorSpecialEnergyEnabled(true,null,1),true);
});
test('only real accepted physical Quick Ball printing has payment/search selections',()=>{
  const row={rootActionCount:5,rootActionLedger:[
    {playerSlot:1,action:'PlayCardAction',actionOrdinal:10,card:'Quick Ball'},
    {playerSlot:1,action:'ResolvePromptAction',actionOrdinal:11},
    {playerSlot:1,action:'ResolvePromptAction',actionOrdinal:12},
    {playerSlot:1,action:'PlayCardAction',actionOrdinal:14,card:'Mew VMAX'},
    {playerSlot:1,action:'AttackAction',actionOrdinal:15}],
  nativeAcceptedTargetSidecar:{events:[
    {playerSlot:1,action:'PlayCardAction',storeAccepted:true,
      rootActionOrdinal:10,declared:{ownerHandPrinting:'Quick Ball FST'}},
    {playerSlot:0,action:'PlayCardAction',storeAccepted:false,
      rootActionOrdinal:17,declared:{ownerHandPrinting:'Quick Ball FST'}}]},
  nativePromptChoices:{events:[
    {actorSeat:1,ordinal:11,kind:'ChooseCardsPrompt',
      sourceZone:'unclassified',selectedCards:['Secret Box TWM']},
    {actorSeat:1,ordinal:12,kind:'ChooseCardsPrompt',
      sourceZone:'deck',selectedCards:['Dedenne GX UNB']}]}};
  const a=ownerAudit(row,1);
  assert.equal(a.status,'ORIGINAL_STORE_ACCEPTED_ROOTS');
  assert.equal(a.sourceQuickBall,1);
  assert.equal(a.candidateQuickBall,0);
  assert.equal(a.sourceAttacks,1);
  assert.equal(a.sourceMewEvolutions,1);
  assert.deepEqual(a.selectedQuickBallChains[0].paymentSelections,['Secret Box TWM']);
  assert.deepEqual(a.selectedQuickBallChains[0].deckSearchSelections,['Dedenne GX UNB']);
  assert.equal(ownerAudit(null,1).status,'NATIVE_ROW_MISSING');
});
