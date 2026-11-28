'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pendingPaleMoonGXKnockOut,choosePaleMoonEscapeRetreat,choosePaleMoonEscapeRanger,choosePaleMoonEscapeGuzmaRoot,choosePaleMoonEscapeGuzmaPrompt,rescuePaleMoonTerminalPass,choosePaleMoonFloatStonePreparation,knownNoPrizeAwardOnPaleMoonKO,terminalPaleMoonPrizeRisk,preferredPaleMoonDiscardSupporter,choosePaleMoonVSSeekerPreparation,choosePaleMoonVSSeekerPrompt}=require('../../simulation/twinleaf/2026-11/agent34-pale-moon-escape.cjs');
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
  source:{classification:'actor-choice',sourceKind:'card-effect',effectName:'Guzma',sourcePrinting:'Guzma BUS'},
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
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,{...guzmaPrompt('opponent',2,'Regidrago V SIT 135'),source:{classification:'actor-choice',sourceKind:'card-effect',effectName:'Guzma',sourcePrinting:'Guzma GRI'}}),null);
  const multiple=guzmaPrompt('actor',4,'Mimikyu GRI 58');
  multiple.choices.push({...multiple.choices[0],token:'prompt-1'});
  assert.equal(choosePaleMoonEscapeGuzmaPrompt(base,multiple),null);
});

test('terminal Pass override rescues despite meaningful other native roots',()=>{
  const other=[
    {token:'attack-no-win',kind:'attack',attackName:'Max Geist'},
    {token:'arven',kind:'play-card',actorPrinting:'Arven SVI'},
    {token:'ability-door',kind:'use-ability',abilityName:'Underworld Door'}
  ];
  const base=[{token:'pass',kind:'pass'},...other];
  const rangerChoices=[...base,ranger('ranger')];
  assert.deepEqual(rescuePaleMoonTerminalPass(rangerView(),rangerChoices,'pass'),{
    token:'ranger',reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_OVERRIDE',
    selectedSourceReason:'PUBLIC_PALE_MOON_PENDING_KO_ONLY_RANGER_ROOT'
  });
  const retreatChoices=[...base,retreat(0,'retreat')];
  assert.deepEqual(rescuePaleMoonTerminalPass(choiceView(),retreatChoices,'pass'),{
    token:'retreat',reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_OVERRIDE',
    selectedSourceReason:'PUBLIC_PALE_MOON_PENDING_KO_SINGLE_LEGAL_RETREAT'
  });
  const guzmaChoices=[...base,...guzmaOffers.slice(1)];
  assert.deepEqual(rescuePaleMoonTerminalPass(guzmaView(),guzmaChoices,'pass'),{
    token:'guzma-root',reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_OVERRIDE',
    selectedSourceReason:'PUBLIC_PALE_MOON_LAST_PRIZE_ONLY_GUZMA_ROOT'
  });
});
test('terminal Pass override does not preempt an original winning attack or choose between rescues',()=>{
  const base=[{token:'pass',kind:'pass'},{token:'attack',kind:'attack'}];
  assert.equal(rescuePaleMoonTerminalPass(choiceView(),[...base,retreat()],'attack'),null);
  assert.equal(rescuePaleMoonTerminalPass(choiceView(),[...base,retreat()],'unmatched'),null);
  assert.equal(rescuePaleMoonTerminalPass(choiceView(false),[...base,retreat()],'pass'),null);
  assert.equal(rescuePaleMoonTerminalPass({...choiceView(),opponentPublic:{prizeCount:2}},[...base,retreat()],'pass'),null);
  assert.equal(rescuePaleMoonTerminalPass(choiceView(),[...base,retreat(),retreat(0,'second')],'pass'),null);
  const v={...rangerView(),ownPublic:{...rangerView().ownPublic,bench:[{printing:'Mimikyu GRI 58'}]},
    opponentPublic:{prizeCount:1,bench:[{printing:'Regidrago V SIT 135'}]}};
  assert.equal(rescuePaleMoonTerminalPass(v,[...base,ranger(),{token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS'}],'pass'),null);
  assert.equal(rescuePaleMoonTerminalPass(rangerView(),[...base,ranger(),{...base[0],token:'extra-pass'}],'pass'),null);
});

const floatStoneItem=(zone='active',token='stone')=>({
  token,kind:'play-card',actorPrinting:'Float Stone BKT',targetPrinting:'Shadow Rider Calyrex VMAX CRE 75',
  publicMetadata:{targetSeat:'actor',targetZone:zone,targetIndex:0}
});
const stoneView=()=>({
  decisionKind:'owner-root',
  ownPublic:{
    active:{printing:'Shadow Rider Calyrex VMAX CRE 75',
      printed:{retreatCost:['Colorless','Colorless']},tools:[],specialConditions:[],
      publicRestrictions:{pendingPaleMoonGXKnockOut:true,cannotRetreat:false,
        cannotRetreatNextTurn:false,cannotRetreatWhileActive:false}},
    bench:[{printing:'Mimikyu GRI 58'}],stadium:[],
    publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}
  },
  opponentPublic:{prizeCount:1,active:{tools:[]},stadium:[],
    publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}},
  ownTurnResources:{retreatedTurn:0,toolPlayLocked:false}
});
test('late-game Float Stone then genuine Retreat is a two-root safe terminal-Pass counterline',()=>{
  const root=[passLike(),{token:'ability',kind:'use-ability'},floatStoneItem()];
  function passLike(){return {token:'pass',kind:'pass'};}
  const prepared=choosePaleMoonFloatStonePreparation(stoneView(),root);
  assert.deepEqual(prepared,{token:'stone',
    reason:'PUBLIC_PALE_MOON_FLOAT_STONE_PREPARE_ZERO_RETREAT'});
  assert.deepEqual(rescuePaleMoonTerminalPass(stoneView(),root,'pass'),{
    token:'stone',reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_PREPARATION',
    selectedSourceReason:'PUBLIC_PALE_MOON_FLOAT_STONE_PREPARE_ZERO_RETREAT'
  });
  const next={...stoneView(),ownPublic:{...stoneView().ownPublic,
    active:{...stoneView().ownPublic.active,tools:['Float Stone BKT']}}};
  const after= [passLike(),retreat(0,'now-free-retreat')];
  assert.equal(rescuePaleMoonTerminalPass(next,after,'pass')?.token,'now-free-retreat');
});
test('Float Stone root rejects active locks, disabled Tools, invalid targets and no Bench',()=>{
  const base=stoneView();
  const root=[{token:'pass',kind:'pass'},floatStoneItem()];
  const mod=(ownPublic,opponentPublic,resources)=>({
    ...base,ownPublic:{...base.ownPublic,...ownPublic},
    opponentPublic:{...base.opponentPublic,...opponentPublic},
    ownTurnResources:{...base.ownTurnResources,...resources}
  });
  assert.equal(choosePaleMoonFloatStonePreparation(
    mod({active:{...base.ownPublic.active,tools:['Forest Seal Stone SIT']}},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({bench:[]},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({stadium:['Jamming Tower TWM']},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({},{
    active:{tools:['Tool Jammer BST']}},null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({
    publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:1}},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({},null,{retreatedTurn:1}),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({},null,{toolPlayLocked:true}),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({
    active:{...base.ownPublic.active,specialConditions:['asleep']}},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(mod({
    active:{...base.ownPublic.active,publicRestrictions:{
      ...base.ownPublic.active.publicRestrictions,cannotRetreat:true}}},null,null),root),null);
  assert.equal(choosePaleMoonFloatStonePreparation(base,[root[0],floatStoneItem('bench')]),null);
  assert.equal(choosePaleMoonFloatStonePreparation(base,[...root,floatStoneItem('active','second')]),null);
  assert.equal(rescuePaleMoonTerminalPass({...base,opponentPublic:{
    ...base.opponentPublic,prizeCount:2}},root,'pass'),null);
});

test('paper Prize-denial removes false terminal premise, but multi-Prize targets still lose',()=>{
  const basic={...rangerView(),ownPublic:{...rangerView().ownPublic,
    active:{...rangerView().ownPublic.active,printing:'Mimikyu GRI 58',tools:['Life Dew PLF']}}};
  assert.equal(knownNoPrizeAwardOnPaleMoonKO(basic),true);
  assert.equal(terminalPaleMoonPrizeRisk(basic),false);
  const options=[{token:'pass',kind:'pass'},ranger()];
  assert.equal(rescuePaleMoonTerminalPass(basic,options,'pass'),null);
  const max={...basic,ownPublic:{...basic.ownPublic,
    active:{...basic.ownPublic.active,printing:'Shadow Rider Calyrex VMAX CRE 75'}}};
  assert.equal(knownNoPrizeAwardOnPaleMoonKO(max),false);
  assert.equal(terminalPaleMoonPrizeRisk(max),true);
  assert.equal(rescuePaleMoonTerminalPass(max,options,'pass')?.token,'ranger1');
  for(const doll of ['Lillie\'s Poké Doll CEC','Snorlax Doll PAR',
    'Robo Substitute Team Flare Gear PHF','Shedinja DRX 48']) {
    const v={...rangerView(),ownPublic:{...rangerView().ownPublic,
      active:{...rangerView().ownPublic.active,printing:doll}}};
    assert.equal(terminalPaleMoonPrizeRisk(v),false,doll);
  }
  const shedinjaTool={...basic,ownPublic:{...basic.ownPublic,
    active:{...basic.ownPublic.active,tools:['Shedinja LOT']}}};
  assert.equal(terminalPaleMoonPrizeRisk(shedinjaTool),false);
  const legacy={...rangerView(),ownPublic:{...rangerView().ownPublic,
    active:{...rangerView().ownPublic.active,printing:'Mimikyu GRI 58',
      energies:['Legacy Energy TWM']}}};
  assert.equal(terminalPaleMoonPrizeRisk(legacy),true,
    'Legacy Energy only reduces Prizes on KO by attack damage, not KO effect');
});

const seekerView=()=>({
  ...rangerView(),
  ownPublic:{...rangerView().ownPublic,discard:['Pokemon Ranger STS'],
    publicTurnRestrictions:{...rangerView().ownPublic.publicTurnRestrictions,itemPlayLocked:false}},
  ownTurnResources:{...rangerView().ownTurnResources,itemPlayLocked:false}
});
const seekerPrompt=()=>({
  promptType:'ChooseCardsPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'VS Seeker PHF',effectName:'VS Seeker'},
  publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,
    allowCancel:false,sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true},
  choices:[{token:'recovered-ranger',kind:'card',printing:'Pokemon Ranger STS',
    publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}},
    {token:'other',kind:'card',printing:'Iono PAL',
      publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}}]
});
test('VS Seeker source-dealt chain: Pass→Item→owned discard prompt→Ranger root',()=>{
  const root=[{token:'pass',kind:'pass'},{token:'seeker',kind:'play-card',
    actorPrinting:'VS Seeker PHF'},{token:'attack',kind:'attack'}];
  const view=seekerView();
  assert.equal(preferredPaleMoonDiscardSupporter(view),'Pokemon Ranger STS');
  assert.equal(choosePaleMoonVSSeekerPreparation(view,root)?.token,'seeker');
  assert.deepEqual(rescuePaleMoonTerminalPass(view,root,'pass'),{
    token:'seeker',reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_PREPARATION',
    selectedSourceReason:'PUBLIC_PALE_MOON_VS_SEEKER_PREPARE_DISCARD_SUPPORTER'});
  const promptView={...view,decisionKind:'owner-prompt'};
  assert.deepEqual(choosePaleMoonVSSeekerPrompt(promptView,seekerPrompt()),{
    tokens:['recovered-ranger'],reason:'PUBLIC_PALE_MOON_VS_SEEKER_RANGER_GUZMA_PROMPT'});
  const next={...view,ownPublic:{...view.ownPublic,discard:[]},
    ownHand:['Pokemon Ranger STS']};
  const finale=[root[0],ranger('native-ranger')];
  assert.equal(rescuePaleMoonTerminalPass(next,finale,'pass')?.token,'native-ranger');
});
test('VS Seeker rejects wrong provenance, concealed prompt and unavailable Supporter',()=>{
  const root=[{token:'pass',kind:'pass'},
    {token:'seeker',kind:'play-card',actorPrinting:'VS Seeker PHF'}];
  const view=seekerView();
  assert.equal(choosePaleMoonVSSeekerPreparation({...view,ownPublic:{
    ...view.ownPublic,discard:[]}},root),null);
  assert.equal(choosePaleMoonVSSeekerPreparation({...view,ownTurnResources:{
    ...view.ownTurnResources,supporterPlayedTurn:1}},root),null);
  assert.equal(choosePaleMoonVSSeekerPreparation({...view,ownTurnResources:{
    ...view.ownTurnResources,itemPlayLocked:true}},root),null);
  const pv={...view,decisionKind:'owner-prompt'};
  const actual=seekerPrompt();
  assert.equal(choosePaleMoonVSSeekerPrompt(pv,{...actual,
    source:{...actual.source,sourcePrinting:'Computer Search BCR'}}),null);
  assert.equal(choosePaleMoonVSSeekerPrompt(pv,{...actual,
    publicMetadata:{...actual.publicMetadata,isOwnerVisible:false}}),null);
  assert.equal(choosePaleMoonVSSeekerPrompt(pv,{...actual,
    publicMetadata:{...actual.publicMetadata,sourceZone:'deck'}}),null);
  assert.equal(choosePaleMoonVSSeekerPrompt(pv,{...actual,
    choices:actual.choices.filter(item=>item.printing!=='Pokemon Ranger STS')}),null);
  const guzma={...view,ownPublic:{...view.ownPublic,discard:['Guzma BUS'],
    bench:[{printing:'Mimikyu GRI 58'}]},
    opponentPublic:{...view.opponentPublic,bench:[{printing:'Regidrago V SIT'}]}};
  assert.equal(preferredPaleMoonDiscardSupporter(guzma),'Guzma BUS');
});
