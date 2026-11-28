'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pendingPaleMoonGXKnockOut,choosePaleMoonEscapeRetreat,choosePaleMoonEscapeRanger,choosePaleMoonEscapeGuzmaRoot,choosePaleMoonEscapeGuzmaPrompt}=require('../../simulation/twinleaf/2026-11/agent34-pale-moon-escape.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {validateActorObservation}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const effect=(target,attack='Pale Moon-GX',type='knock_out')=>
  ({target,attack:{name:attack},type});
const retreat=(index=0,token='native:retreat:0')=>
  ({token,kind:'retreat',publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:index,benchIndex:index}});
const choiceView=(flag=true,bench=[{printing:'Mimikyu GRI 58'}])=>
  ({decisionKind:'owner-root',opponentPublic:{prizeCount:1},ownPublic:{
    active:{publicRestrictions:{pendingPaleMoonGXKnockOut:flag}},bench
  }});

function slot(name) {
  const card={fullName:name,name:name.split(' ').slice(0,2).join(' '),
    hp:310,stage:5,cardType:[5],retreat:[9],
    weakness:[],resistance:[],attacks:[],powers:[],tags:['VMAX']};
  return {cards:[card],getPokemonCard:()=>card,pokemonPlayedTurn:1,damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]};
}
function player(id,name) {
  const active=slot(name);
  return {id,active,bench:[],pendingEndOfTurnEffects:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]},hand:{cards:[],isPublic:false},deck:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[]})),supporterTurn:0,
    retreatedTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0};
}
test('physical exact-target projection, both seats; no hidden-zone copying',()=>{
  for(const seat of [0,1]){
    const players=[player(17,'Shadow Rider Calyrex VMAX CRE 75'),
      player(19,'Regidrago VSTAR SIT 136')];
    const owner=players[seat];
    owner.bench=[slot('Mimikyu GRI 58')];
    owner.pendingEndOfTurnEffects=[effect(owner.active),
      effect(owner.bench[0],'other attack'), effect({fake:true})];
    const enemy=players[1-seat];
    enemy.hand.cards=[{fullName:'secret card never revealed'}];
    const state={players,activePlayer:seat,turn:6,phase:2,prompts:[]};
    const view=actorObservation(state,seat);
    assert.equal(view.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,true);
    assert.equal(view.ownPublic.bench[0].publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(view.opponentPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(view.opponentPublic.handCount,1);
    assert.equal(view.opponentPublic.publicHand,null);
    assert.ok(!JSON.stringify(view).includes('secret card never revealed'));
    validateActorObservation(view,seat);
    assert.equal(pendingPaleMoonGXKnockOut({},owner.active),null);
  }
});
test('exact pending-target flag changes independently of an identical printed board',()=>{
  const state={players:[player(17,'Shadow Rider Calyrex VMAX CRE 75'),
    player(19,'Regidrago VSTAR SIT 136')],activePlayer:0,turn:6,phase:2,prompts:[]};
  const active=state.players[0].active;
  state.players[0].pendingEndOfTurnEffects=[effect(active)];
  const threatened=actorObservation(state,0);
  state.players[0].pendingEndOfTurnEffects=[];
  const safe=actorObservation(state,0);
  assert.equal(threatened.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,true);
  assert.equal(safe.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,false);
  validateActorObservation(safe,0);
});
test('stale native queued KO on Bench is not a live public Pale Moon threat',()=>{
  for(const seat of [0,1]) {
    const players=[player(17,'Shadow Rider Calyrex VMAX CRE 75'),
      player(19,'Regidrago VSTAR SIT 136')];
    const owner=players[seat];
    const moved=owner.active;
    owner.bench=[moved];
    owner.active=slot('Mimikyu GRI 58');
    owner.pendingEndOfTurnEffects=[effect(moved)];
    const state={players,activePlayer:seat,turn:6,phase:2,prompts:[]};
    const observation=actorObservation(state,seat);
    assert.equal(observation.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(observation.ownPublic.bench[0].publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(pendingPaleMoonGXKnockOut(owner,moved),false);
    validateActorObservation(observation,seat);
  }
});
test('one real native retreat token selected under pending KO and no competing attack',()=>{
  const offered=[{token:'pass',kind:'pass'},retreat(0,'retreat-action-123')];
  assert.deepEqual(choosePaleMoonEscapeRetreat(choiceView(),offered),{
    token:'retreat-action-123',reason:'PUBLIC_PALE_MOON_PENDING_KO_SINGLE_LEGAL_RETREAT'
  });
});
test('hard negatives: unknown / absent KO, no legal root, multiple benches, attacking option',()=>{
  const offered=[{token:'pass',kind:'pass'},retreat()];
  for(const flag of [null,false]){
    assert.equal(choosePaleMoonEscapeRetreat(choiceView(flag),offered),null);
  }
  assert.equal(choosePaleMoonEscapeRetreat({...choiceView(),opponentPublic:{prizeCount:2}},offered),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[{token:'pass',kind:'pass'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(true,[{},{}]),offered),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(true,[]),offered),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,{token:'attack',kind:'attack'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,{token:'fog',kind:'play-card'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,retreat()]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[{...retreat(),
    publicMetadata:{targetSeat:'opponent',targetZone:'bench',targetIndex:0,benchIndex:0}}]),null);
});

const ranger=(token='ranger1')=>({token,kind:'play-card',actorPrinting:'Pokemon Ranger STS'});
const rangerView=(flag=true)=>({decisionKind:'owner-root',opponentPublic:{prizeCount:1},ownPublic:{
  active:{publicRestrictions:{pendingPaleMoonGXKnockOut:flag}},
  publicTurnRestrictions:{alteredCreationDamage:false,usedAlteredCreation:false}},
  ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0}
});
test('Ranger removes known queued KO over Pass as an exact offered action',()=>{
  assert.deepEqual(choosePaleMoonEscapeRanger(rangerView(),[{token:'pass',kind:'pass'},ranger()]),
    {token:'ranger1',reason:'PUBLIC_PALE_MOON_PENDING_KO_ONLY_RANGER_ROOT'});
});
test('Ranger negatives: no threat, competing Trainer, retreat, Supporter use, own GX bonus',()=>{
  const offered=[{token:'pass',kind:'pass'},ranger()];
  assert.equal(choosePaleMoonEscapeRanger(rangerView(false),offered),null);
  assert.equal(choosePaleMoonEscapeRanger(rangerView(null),offered),null);
  assert.equal(choosePaleMoonEscapeRanger({...rangerView(),opponentPublic:{prizeCount:2}},offered),null);
  assert.equal(choosePaleMoonEscapeRanger(rangerView(),[...offered,
    {token:'fog',kind:'play-card',actorPrinting:'Fog Crystal CRE'}]),null);
  assert.equal(choosePaleMoonEscapeRanger(rangerView(),[...offered,{token:'retreat',kind:'retreat'}]),null);
  assert.equal(choosePaleMoonEscapeRanger(rangerView(),[{token:'pass',kind:'pass'},
    {...ranger(),actorPrinting:'Guzma BUS'}]),null);
  assert.equal(choosePaleMoonEscapeRanger({...rangerView(),
    ownTurnResources:{supporterPlayedTurn:1,supporterPlayLocked:false}},offered),null);
  assert.equal(choosePaleMoonEscapeRanger({...rangerView(),
    ownPublic:{...rangerView().ownPublic,publicTurnRestrictions:{
      alteredCreationDamage:false,usedAlteredCreation:true}}},offered),null);
});

const guzmaView=()=>({decisionKind:'owner-root',opponentPublic:{prizeCount:1,
  bench:[null,null,{printing:'Regidrago V SIT 135'},null,null]},
  ownPublic:{active:{publicRestrictions:{pendingPaleMoonGXKnockOut:true}},
  bench:[null,null,null,null,{printing:'Mimikyu GRI 58'}]},
  ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0}
});
const guzmaOffers=[{token:'pass',kind:'pass'},
  {token:'guzma-root',kind:'play-card',actorPrinting:'Guzma BUS'}];
const guzmaPrompt=(who,slot,printing)=>({
  promptType:'ChoosePokemonPrompt',
  source:{sourceKind:'card-effect',effectName:'Guzma',sourcePrinting:'Guzma BUS'},
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false},
  choices:[{token:'prompt-0',kind:'pokemon',printing,
    publicMetadata:{ownerSeat:who,targetZone:'bench',benchIndex:slot,selectionIndex:0}}]
});
test('Guzma last-Prize root and both prompt continuations use physical Bench identity',()=>{
  assert.equal(choosePaleMoonEscapeGuzmaRoot(guzmaView(),guzmaOffers).token,'guzma-root');
  const afterRoot={...guzmaView(),decisionKind:'owner-prompt'};
  assert.deepEqual(choosePaleMoonEscapeGuzmaPrompt(afterRoot,
    guzmaPrompt('opponent',2,'Regidrago V SIT 135')),
    {token:'prompt-0',reason:'PUBLIC_PALE_MOON_GUZMA_EXACT_SINGLE_BENCH_PROMPT'});
  const ownPrompt=guzmaPrompt('actor',4,'Mimikyu GRI 58');
  ownPrompt.publicMetadata.minimumCount=0;
  ownPrompt.choices.push({token:'prompt-1',kind:'empty-selection'});
  assert.deepEqual(choosePaleMoonEscapeGuzmaPrompt(afterRoot,ownPrompt),
    {token:'prompt-0',reason:'PUBLIC_PALE_MOON_GUZMA_EXACT_SINGLE_BENCH_PROMPT'});
});
test('Guzma negatives: extra options, wrong card, forged target and nonterminal threat',()=>{
  assert.equal(choosePaleMoonEscapeGuzmaRoot({...guzmaView(),opponentPublic:{...guzmaView().opponentPublic,prizeCount:2}},guzmaOffers),null);
  assert.equal(choosePaleMoonEscapeGuzmaRoot(guzmaView(),[...guzmaOffers,{token:'fog',kind:'play-card',actorPrinting:'Fog Crystal CRE'}]),null);
  assert.equal(choosePaleMoonEscapeGuzmaRoot(guzmaView(),[{token:'pass',kind:'pass'},{token:'x',kind:'play-card',actorPrinting:'Guzma GRI'}]),null);
  const base={...guzmaView(),decisionKind:'owner-prompt'};
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,guzmaPrompt('opponent',0,'Regidrago V SIT 135')),null);
  const forgedOpponentZero=guzmaPrompt('opponent',2,'Regidrago V SIT 135');
  forgedOpponentZero.publicMetadata.minimumCount=0;
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,forgedOpponentZero),null);
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,guzmaPrompt('opponent',2,'Mimikyu GRI 58')),null);
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,{...guzmaPrompt('opponent',2,'Regidrago V SIT 135'),source:{sourceKind:'card-effect',effectName:'Guzma',sourcePrinting:'Guzma GRI'}}),null);
  const multiple=guzmaPrompt('actor',4,'Mimikyu GRI 58');
  multiple.choices.push({...multiple.choices[0],token:'prompt-1'});
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,multiple),null);
});
