'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const worker=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const V='Shadow Rider Calyrex V CRE 74';
function mon(printing,{hp=320,damage=0,types=['Psychic'],subtypes=['Basic'],
   energies=[],abilities=[],attacks=[]}={}){
  return {name:printing.split(' CRE')[0],printing,hp,damage,
    printed:{stage:subtypes.includes('VMAX')?'VMAX':'Basic',subtypes,types,
      weakness:[],resistance:[],retreatCost:['Colorless']},
    energies,tools:[],abilities,abilitySuppressions:[],attacks};
}
function player(active,bench,prizeCount,deckCount,handCount=2){
  return {active,bench,stadium:[],discard:[],lostZone:[],handCount,prizeCount,
    deckCount,resolvingSupporter:[],
    publicTurnRestrictions:{vstarUsed:false,gxUsed:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function make(seat,opts={}){
  const {energy=3,deck=2,damage=150,prizes=2,enemy='VSTAR',
    bench=true,handEnergy=true,offerAttack=true,offerDraw=true,
    ability=true,nativeSource=true,unmodeled=false,enemyBench=1}=opts;
  const active=mon(VMAX,{hp:320,types:['Psychic'],subtypes:['VMAX','V'],
    energies:Array(energy).fill(E),abilities:ability?['Underworld Door']:[],
    attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
      damage:10,damageCalculation:'+'}]});
  const ourBench=bench?[mon(V,{hp:210,types:['Psychic'],subtypes:['Basic','V']})]:[];
  const opponent=enemy==='MEGA'?
    mon('Mega Absol ex MEG 86',{hp:280,damage,types:['Darkness'],
      subtypes:['Basic','MEGA','ex']}):
    enemy==='LEGACY'?
      mon('M Gardevoir-EX STS 79',{hp:210,damage,types:['Fairy'],
        subtypes:['MEGA','EX']}):
      mon('Regidrago VSTAR SIT 136',{hp:280,damage,types:['Dragon'],
        subtypes:['VSTAR','V']});
  const other=mon('Mimikyu GRI 58',{hp:70,types:['Psychic']});
  const hand=[...(handEnergy?[E]:[]),...(offerDraw?["Lillie's Determination MEG 119"]:[])];
  const items=[
    {kind:'use-ability',token:'door',actorPrinting:VMAX,
      publicMetadata:{abilityName:'Underworld Door',
        sourceSeat:nativeSource?'actor':'opponent',sourceZone:'active'}},
    ...(offerAttack?[{kind:'attack',token:'geist',attackName:'Max Geist',
      publicMetadata:{hasUnmodeledModifier:unmodeled}}]:[]),
    ...(offerDraw?[{kind:'play-card',token:'draw',
      actorPrinting:"Lillie's Determination MEG 119",
      publicMetadata:{cardType:'supporter'}}]:[]),
    {kind:'pass',token:'pass'}
  ];
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',phase:2,globalTurn:6,
      ownHand:hand,ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:player(active,ourBench,prizes,deck,hand.length),
      opponentPublic:player(opponent,Array(enemyBench).fill(other),6,25,0)},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}};
}
function decide(req){
  return worker.createPolicy({role:'candidate',seat:req.seat,
    policyVersion:worker.POLICY_VERSION,config:{}}).decideWithAudit(req);
}
function attachPrompt(seat){
  return {schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_TO_BENCH',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:VMAX,effectName:'Underworld Door'},
    choices:[
      {token:'attach',kind:'energy',printing:E,
        publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
          isOwnerVisible:true,energyType:'BASIC',zone:'bench',
          benchIndex:0,choiceIndex:0,selectedCount:1}},
      {token:'cancel',kind:'cancel',label:'Cancel selection'}],
    publicMetadata:{selectionType:'energy-attachment',count:2,
      minimumCount:1,maximumCount:1,allowCancel:true,
      sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
      energyType:'BASIC',zone:'bench'}
  };
}
for(const seat of [0,1]){
  for(const [label,opts,want] of [
    ['exact two-card Door makes VSTAR final two-Prize Max Geist',
      {deck:2,energy:3,damage:150,prizes:2},'door'],
    ['two-card Door makes modern Mega ex final three-Prize KO',
      {deck:2,energy:3,damage:150,prizes:3,enemy:'MEGA'},'door'],
    ['legacy Mega-EX gives only two Prizes and is not terminal at three',
      {deck:2,energy:3,damage:80,prizes:3,enemy:'LEGACY'},'draw'],
    ['already-paid four-energy Max Geist wins before Lillie or Door',
      {deck:2,energy:4,damage:150,prizes:2},'geist'],
    ['only opponent Active left: knockout wins without taking all prizes',
      {deck:2,energy:3,damage:150,prizes:4,enemyBench:0},'door'],
    ['three-card deck retains previous nonterminal draw-first ordering',
      {deck:3,energy:3,damage:150,prizes:2},'draw'],
    ['three prizes left versus VSTAR does not finish',
      {deck:2,energy:3,damage:150,prizes:3},'draw'],
    ['no hand Basic Psychic disables exceptional Door',
      {deck:2,energy:3,damage:150,prizes:2,handEnergy:false},'draw'],
    ['no Benched Psychic recipient disables exceptional Door',
      {deck:2,energy:3,damage:150,prizes:2,bench:false},'draw'],
    ['two attached Psychic means Max Geist currently unpayable',
      {deck:2,energy:2,damage:150,prizes:2},'draw'],
    ['one deck card keeps original conservative draw floor',
      {deck:1,energy:3,damage:150,prizes:2},'draw'],
    ['no native Max Geist root action: no fabricated win',
      {deck:2,energy:3,damage:150,prizes:2,offerAttack:false},'draw'],
    ['unmodeled Max Geist modifier: no fake terminal choice',
      {deck:2,energy:3,damage:150,prizes:2,unmodeled:true},'draw'],
    ['no native-owned Door source: preserve other legal action',
      {deck:2,energy:3,damage:150,prizes:2,nativeSource:false},'draw'],
    ['suppressed Underworld Door not used',
      {deck:2,energy:3,damage:150,prizes:2,ability:false},'draw'],
    ['Max Geist still 30 short despite Door: conserve deck',
      {deck:2,energy:3,damage:90,prizes:2},'draw']
  ]){
    test(label+' seat '+seat,()=>{
      const req=make(seat,opts);
      const x=decide(req);
      assert.deepEqual(x.decision,{kind:'select-action',token:want});
      assert.deepEqual(x.policyAudit.selectedTokens,[want]);
      assert.deepEqual(x.policyAudit.evaluations.map(row=>row.token),
        req.actionFrontier.items.map(item=>item.token));
    });
  }
  test('native-shaped Door physical recipient then constructed final attack seat '+seat,()=>{
    const root=make(seat,{deck:2,energy:3,damage:150,prizes:2});
    assert.equal(decide(root).decision.token,'door');
    const prompt=attachPrompt(seat);
    protocol.validatePrompt(prompt,seat);
    const question={...root,prompt,
      observation:{...root.observation,decisionKind:'owner-prompt',
        pendingPromptType:'AttachEnergyPrompt'}};
    const reply=decide(question);
    assert.deepEqual(reply.decision,{kind:'select-choice',token:'attach'});
    protocol.validateDecision(reply.decision,prompt,new Set());
    protocol.validatePolicyAudit(reply.policyAudit,question,reply.decision,
      worker.POLICY_VERSION);
    // Different crafted actor-visible state, not actual Store settlement.
    const next={...root,observation:{...root.observation,
      ownHand:["Lillie's Determination MEG 119"],
      ownPublic:{...root.observation.ownPublic,deckCount:0,
        bench:[{...root.observation.ownPublic.bench[0],energies:[E]}]}},
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
        items:[{token:'geist',kind:'attack',attackName:'Max Geist'},
          {token:'pass',kind:'pass'}]}};
    assert.deepEqual(decide(next).decision,{kind:'select-action',token:'geist'});
  });
}
