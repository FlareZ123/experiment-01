'use strict';
/**
 * Composition smoke: full source-60 certified source-print map -> strict
 * actor/prompt/frontier admission -> actual combined candidate policy.
 *
 * The native IDs in this test deliberately emulate the old native names
 * (name + set without card number) from the resolver. The source decks ARE
 * the exact repository candidate Hood 60 and authenticated rank-10 60.
 * This is not the pinned native resolver, Store, driver SHA or completed game.
 * Physical action/prompt tokens remain unchanged on both seat permutations.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const bridge=require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const candidate=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const candidateDeck=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const fullField=require('../../results/aichi-2026/full-decklists.json');
const opponentDeck=fullField.decks.find(d=>d.rank===10);
const E='Psychic Energy SVE 5', V='Shadow Rider Calyrex V CRE';
const VMAX='Shadow Rider Calyrex VMAX CRE', REG='Regidrago V SIT';
const M='Marshadow UNB',FOG='Fog Crystal CRE',MIM='Mimikyu GRI';
const src=(name,set,number)=>name+' '+set+' '+number;
// The pinned V3 resolver's only two approved fallback printings:
// source MEE 13 → native SVE 5, source ASC 196 → native SFA 61.
// Other mock native IDs remain test-only name+set aliases.
const nativeOrdered60=deck=>deck.cards.flatMap(c=>{
  const id=c.name==='Psychic Energy'&&c.printing.set==='MEE'&&
    String(c.printing.number)==='13' ? 'Psychic Energy SVE 5' :
    c.name==='Night Stretcher'&&c.printing.set==='ASC'&&
    String(c.printing.number)==='196' ? 'Night Stretcher SFA 61' :
    c.name+' '+c.printing.set;
  return Array(c.count).fill(id);
});
const restrictions=()=>({
  gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
  attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
  ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
  cannotUseGXAttacks:false,pokemonPlayLocked:false,
  abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
  itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,
  toolPlayLocked:false,energyPlayLocked:false,
  specialEnergyPlayLocked:false,
  stadiumAndToolHaveNoEffectTurnsRemaining:0
});
const pokemonRestrictions=()=>({
  cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
  blockedAttackNameNextTurn:null,
  blockedAttackNameUntilLeavesActive:null,
  onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
  attackCostIncreaseWhileActive:0,cannotRetreat:false,
  cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,
  cannotEvolveNextTurn:false
});
function pokemon(printing,hp,types,energy=0,{attacks=[],abilities=[]}={}){
  const stage=printing===VMAX?'VMAX':'BASIC';
  return {
    printing,name:printing,hp,damage:0,lastPlayedOrEvolvedTurn:0,
    printed:{stage,subtypes:stage==='VMAX'?['VMAX']:['Basic'],
      types,retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],publicRestrictions:pokemonRestrictions(),
    evolutionPrintings:[],energies:Array(energy).fill(E),tools:[],
    attacks:attacks.map(a=>({
      name:a.name,cost:a.cost,damage:a.damage,
      damageCalculation:null,text:null,gxAttack:false,barrage:false
    })),
    abilities,abilityDetails:abilities.map(name=>({
      name,powerType:'ABILITY',text:null
    })),
    abilitySuppressions:abilities.map(abilityName=>({
      abilityName,suppressed:null,reasonCode:null,sourcePrinting:null
    }))
  };
}
const vmax=(energy=3)=>pokemon(VMAX,320,['Psychic'],energy,{
  abilities:['Underworld Door'],
  attacks:[{name:'Max Geist',
    cost:['Colorless','Colorless','Colorless'],damage:'10+'}]
});
const player=(active,bench=[],handCount=1)=>({
  active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
  stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  publicHand:null,prizeSlots:[],publicTurnRestrictions:restrictions(),
  handCount,deckCount:26,prizeCount:6
});
const turnResources=()=>({
  supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
  energyPlayedTurn:false,stadiumPlayedTurn:false,
  stadiumUsedTurn:false,vstarUsed:false,pokemonPlayLocked:false,
  abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
  itemPlayLocked:false,supporterPlayLocked:false,
  stadiumPlayLocked:false,toolPlayLocked:false,
  energyPlayLocked:false,specialEnergyPlayLocked:false
});
function make(seat,mode){
  const opponent=player(pokemon(REG,220,['Dragon']),[],4);
  const active=vmax(mode==='lethal'?3:1);
  const bench=mode==='lethal'?
    [pokemon(M,80,['Psychic'],3)]:
    mode==='door'?[pokemon(MIM,70,['Psychic'])]:[];
  const hand=mode==='lethal'?[E]:mode==='second-v'?[V]:
    mode==='door'?[E]:[];
  const own=player(active,bench,hand.length);
  const obs={
    actorSeat:seat,globalTurn:7,phase:2,
    decisionKind:['fog','door'].includes(mode)?'owner-prompt':'owner-root',
    pendingPromptType:mode==='fog'?'ChooseCardsPrompt':
      mode==='door'?'AttachEnergyPrompt':null,
    pendingOwnerDeckSearch:mode==='fog',ownHand:hand,
    ownPublic:own,opponentPublic:opponent,
    ownTurnResources:turnResources(),ownerK1:null
  };
  let actions=[{token:'pass',kind:'pass'}],prompt=null,want=null;
  if(mode==='lethal'){
    actions=[
      {token:'native-attach',kind:'play-card',actorPrinting:E,
        targetPrinting:VMAX,publicMetadata:{
          targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true}},
      {token:'native-attack',kind:'attack',attackName:'Max Geist'},
      {token:'pass',kind:'pass'}
    ];
    want={kind:'select-action',token:'native-attach'};
  }else if(mode==='second-v'){
    actions=[
      {token:'native-bench-v',kind:'play-card',actorPrinting:V,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}},
      {token:'pass',kind:'pass'}
    ];
    want={kind:'select-action',token:'native-bench-v'};
  }else if(mode==='fog'){
    actions=[];
    prompt={
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:FOG,effectName:'Fog Crystal'},
      choices:[
        {token:'native-basic-v',kind:'card',printing:V,label:V,
          publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
            isOwnerVisible:true,selectionIndex:0,selectedCount:1}},
        {token:'native-psychic',kind:'card',printing:E,label:E,
          publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
            isOwnerVisible:true,selectionIndex:1,selectedCount:1}},
        {token:'native-none',kind:'empty-selection',
          label:'Choose no cards',publicMetadata:{selectedCount:0}}
      ],
      publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,minimumCount:0,maximumCount:1,
        allowCancel:false,isSecret:false,selectionType:'card-combination'}
    };
    want={kind:'select-choices',tokens:['native-basic-v']};
  }else if(mode==='door'){
    actions=[];
    prompt={
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'AttachEnergyPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:VMAX,effectName:'Underworld Door'},
      choices:[{
        token:'native-door-to-mimikyu',kind:'energy',printing:E,
        label:'Attach '+E+' to Bench 1: '+MIM,
        publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
          isOwnerVisible:true,energyType:'BASIC',zone:'bench',
          benchIndex:0,choiceIndex:0,selectedCount:1}
      }],
      publicMetadata:{selectionType:'energy-attachment',
        minimumCount:1,maximumCount:1,count:1,allowCancel:false,
        sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',zone:'bench'}
    };
    want={kind:'select-choice',token:'native-door-to-mimikyu'};
  } else throw Error('BAD_MODE');
  return {obs,actions,prompt,want};
}
for(const seat of [0,1])for(const mode of ['lethal','second-v','fog','door'])
  test('source 60 bridge→candidate '+mode+' physical seat '+seat,()=>{
    const fixture=make(seat,mode);
    const maps=[null,null];
    maps[seat]=bridge.buildSourcePrintingMap(
      candidateDeck,nativeOrdered60(candidateDeck));
    assert.equal(maps[seat].get('Psychic Energy SVE 5'),
      'Psychic Energy MEE 13');
    assert.equal(maps[seat].get('Night Stretcher SFA 61'),
      'Night Stretcher ASC 196');
    maps[1-seat]=bridge.buildSourcePrintingMap(
      opponentDeck,nativeOrdered60(opponentDeck));
    const parts=bridge.projectAdmittedWorkerParts({
      observation:fixture.obs,prompt:fixture.prompt,
      publicEventReceipt:null,
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
        items:fixture.actions}
    },maps,protocol);
    assert.equal(parts.observation.ownPublic.active.printing,
      'Shadow Rider Calyrex VMAX CRE 75');
    assert.equal(parts.observation.opponentPublic.active.printing,
      'Regidrago V SIT 135');
    assert.deepEqual(parts.actionFrontier.items.map(x=>x.token),
      fixture.actions.map(x=>x.token));
    if(mode==='lethal')
      assert.equal(parts.observation.ownHand[0],'Psychic Energy MEE 13');
    if(mode==='fog')
      assert.equal(parts.prompt.choices[0].printing,
        'Shadow Rider Calyrex V CRE 74');
    if(mode==='door')
      assert.equal(parts.prompt.source.sourcePrinting,
        'Shadow Rider Calyrex VMAX CRE 75');
    const request={
      schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'bridge-'+mode+'-'+seat,sequence:1,role:'candidate',
      seat,observationSchema:protocol.OBSERVATION_SCHEMA,...parts
    };
    const init={schema:protocol.INIT_SCHEMA,type:'init',
      role:'candidate',seat,policyVersion:candidate.POLICY_VERSION,
      bundleSha256:'a'.repeat(64),config:{}};
    const validated=protocol.validateRequest(request,init,1,new Set());
    const {decision,policyAudit}=candidate.createPolicy({
      role:'candidate',seat,policyVersion:candidate.POLICY_VERSION,
      config:{}
    }).decideWithAudit(request);
    assert.deepEqual(decision,fixture.want);
    protocol.validateDecision(decision,validated.prompt,validated.actionTokens);
    protocol.validatePolicyAudit(policyAudit,request,decision,
      candidate.POLICY_VERSION);
  });

for(const candidateSeat of [0,1])for(const mode of ['lethal','door'])
  test('four native host adapters→combined candidate '+mode+' seat '+candidateSeat,()=>{
    // Exercise the actual adapter composition surface used by the V3 fixture:
    // observer before SHA; frontier/prompt projected after native construction;
    // token-to-native-object custody retained by original dispatch methods.
    const fixture=make(candidateSeat,mode);
    const realRootAction=Object.freeze({kind:'NativeAction',seat:candidateSeat,
      nativeIdentity:'opaque-action-'+mode+'-'+candidateSeat});
    const realPromptAction=Object.freeze({kind:'NativePromptResponse',
      seat:candidateSeat,nativeIdentity:'opaque-prompt-'+mode+'-'+candidateSeat});
    const native={observe(state,seat){
      assert.equal(state.token,'state-owned');
      assert.equal(seat,candidateSeat);
      return fixture.obs;
    }};
    const rootToken=fixture.actions.find(x=>x.kind!=='pass')?.token??'pass';
    const physicalFrontier={
      buildNativeActionFrontier(){
        return {actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
          items:fixture.actions},
          actionByToken:new Map([[rootToken,realRootAction]])};
      },
      dispatchSelectedNativeAction({frontier,token}){
        return frontier.actionByToken.get(token);
      }
    };
    const physicalPrompt={
      projectPrompt(){
        return {hostOnly:false,promptProjection:fixture.prompt,
          choiceByToken:new Map(
            fixture.prompt?fixture.prompt.choices.map(x=>[x.token,realPromptAction]):[])
        };
      },
      dispatchPromptChoice({projection,decision}){
        const token=decision.token??decision.tokens?.[0];
        return projection.choiceByToken.get(token);
      },
      resolveHostOnlyPrompt(){return {hostOnly:true};}
    };
    const wrapped=bridge.createCertifiedV3RoleAdapters({
      native,protocol,candidateSeat,opponentSeat:1-candidateSeat,
      candidateSourceDeck:candidateDeck,opponentSourceDeck:opponentDeck,
      candidateNativeOrdered60:nativeOrdered60(candidateDeck),
      opponentNativeOrdered60:nativeOrdered60(opponentDeck),
      actionFrontier:physicalFrontier,promptProjection:physicalPrompt,
      eventReceipt:()=>null
    });
    const state={token:'state-owned'};
    const sourceObservation=wrapped.native.observe(state,candidateSeat);
    assert.ok(Object.isFrozen(sourceObservation));
    assert.equal(sourceObservation.ownPublic.active.printing,
      'Shadow Rider Calyrex VMAX CRE 75');
    assert.equal(fixture.obs.ownPublic.active.printing,VMAX,
      'original native observation unchanged');

    const root=wrapped.actionFrontier.buildNativeActionFrontier({
      state,actorSeat:candidateSeat});
    assert.deepEqual(root.actionFrontier.items.map(x=>x.token),
      fixture.actions.map(x=>x.token));
    assert.equal(root.actionByToken.get(rootToken),realRootAction);

    // V3 invokes promptProjection only for an actual pending native prompt.
    // Root turns with null prompt do not call the native prompt projector.
    const projected=mode==='door'
      ?wrapped.promptProjection.projectPrompt({
        state,actorSeat:candidateSeat,prompt:fixture.prompt
      })
      :{promptProjection:null};
    if(mode==='door'){
      assert.equal(projected.promptProjection.source.sourcePrinting,
        'Shadow Rider Calyrex VMAX CRE 75');
      assert.deepEqual(projected.promptProjection.choices.map(x=>x.token),
        fixture.prompt.choices.map(x=>x.token));
    }else assert.equal(projected.promptProjection,null);

    const parts={
      observation:sourceObservation,prompt:projected.promptProjection,
      publicEventReceipt:wrapped.eventReceipt(state,candidateSeat),
      actionFrontier:root.actionFrontier
    };
    const request={
      schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'four-adapter-'+mode+'-'+candidateSeat,sequence:1,
      role:'candidate',seat:candidateSeat,
      observationSchema:protocol.OBSERVATION_SCHEMA,...parts
    };
    const init={schema:protocol.INIT_SCHEMA,type:'init',
      role:'candidate',seat:candidateSeat,
      policyVersion:candidate.POLICY_VERSION,
      bundleSha256:'a'.repeat(64),config:{}};
    const admitted=protocol.validateRequest(request,init,1,new Set());
    const response=candidate.createPolicy({role:'candidate',
      seat:candidateSeat,policyVersion:candidate.POLICY_VERSION,
      config:{}}).decideWithAudit(request);
    assert.deepEqual(response.decision,fixture.want);
    protocol.validateDecision(response.decision,
      admitted.prompt,admitted.actionTokens);
    protocol.validatePolicyAudit(response.policyAudit,request,
      response.decision,candidate.POLICY_VERSION);
    if(mode==='lethal')
      assert.equal(wrapped.actionFrontier.dispatchSelectedNativeAction({
        frontier:root,token:response.decision.token}),realRootAction,
        'source projection must not fabricate/replace native Action');
    else
      assert.equal(wrapped.promptProjection.dispatchPromptChoice({
        projection:projected,decision:response.decision}),realPromptAction,
        'source projection must not fabricate/replace physical prompt result');
  });

test('entire authenticated 29-original-source field has complete bridge maps in both seats',()=>{
  const decks=fullField.decks;
  assert.equal(decks.length,29);
  const ranks=decks.map(x=>x.rank).sort((a,b)=>a-b);
  assert.deepEqual([23,25,28].filter(r=>ranks.includes(r)),[]);
  const candidateIds=nativeOrdered60(candidateDeck);
  assert.equal(candidateIds.length,60);
  for(const original of decks){
    const opponentIds=nativeOrdered60(original);
    assert.equal(opponentIds.length,60);
    const opponentMap=bridge.buildSourcePrintingMap(original,opponentIds);
    const candidateMap=bridge.buildSourcePrintingMap(candidateDeck,candidateIds);
    // Each original row must retain its exact set + card number even when
    // V3's approved MEE/ASC proxy changes the native printed identifier.
    let i=0;
    for(const row of original.cards){
      const full=row.name+' '+row.printing.set+' '+row.printing.number;
      assert.equal(opponentMap.get(opponentIds[i]),full,
        'field rank '+original.rank+' source printing lost');
      i+=row.count;
    }
    for(const seat of [0,1]){
      const maps=seat===0?[candidateMap,opponentMap]:
        [opponentMap,candidateMap];
      const probe={
        actorSeat:seat,ownHand:[candidateIds[0]],
        ownPublic:null,opponentPublic:null
      };
      const view=bridge.projectSourcePrintings(probe,null,maps).observation;
      assert.equal(view.ownHand[0],'Shadow Rider Calyrex V CRE 74');
      assert.equal(maps[seat].get('Psychic Energy SVE 5'),
        'Psychic Energy MEE 13');
    }
  }
});
