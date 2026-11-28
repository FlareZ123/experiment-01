'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const E='Psychic Energy MEE 13';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const V='Shadow Rider Calyrex V CRE 74';
const DRAGO='Regidrago VSTAR SIT 136';
const MEGA='Mega Absol ex MEG 86';

function mon(printing,types,energies,attacks,hp,damage,subtypes){
  return {printing,hp,damage,printed:{
    stage:subtypes.includes('VMAX')?'VMAX':'BASIC',
    types,subtypes,weakness:[],resistance:[],retreatCost:[]
  },energies,attacks,tools:[],abilities:[],abilitySuppressions:[]};
}
function player(active,bench,prizeCount,deckCount){
  return {active,bench,prizeCount,deckCount,handCount:1,
    stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
    publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function request(seat,opts={}){
  const {deck=2,damage=150,prizes=2,enemyBench=1,hand=true,
    energy=3,enemy='VSTAR',benchPsychic=true,offerAttack=true}=opts;
  const active=mon(VMAX,['Psychic'],Array(energy).fill(E),
    [{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}],
    320,0,['VMAX']);
  const reserve=mon(V,['Psychic'],[],[],210,0,['V']);
  const other=mon(DRAGO,['Dragon'],[],[],280,damage,['VSTAR']);
  const boss=enemy==='MEGA'?
    mon(MEGA,['Darkness'],[],[],280,damage,['Basic','MEGA','ex']):other;
  const visibleBench=enemyBench?Array(enemyBench).fill(
    mon('Mimikyu GRI 58',['Psychic'],[],[],70,0,['Basic'])):[];
  const items=[
    {token:'door',kind:'use-ability',actorPrinting:VMAX,
      publicMetadata:{abilityName:'Underworld Door'}},
    ...(offerAttack?[{token:'geist',kind:'attack',attackName:'Max Geist'}]:[]),
    {token:'pass',kind:'pass'}
  ];
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:hand?[E]:[],
      ownPublic:player(active,[benchPsychic?reserve:null],prizes,deck),
      opponentPublic:player(boss,visibleBench,6,25),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}};
}
function decide(req){
  return policy.createPolicy({role:'candidate',seat:req.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
}

for(const seat of [0,1]){
  for(const [label,opts,want] of [
    ['Regidrago VSTAR 2-prize final with deck two',
      {deck:2,damage:150,prizes:2,enemyBench:1},'door'],
    ['Mega Absol ex 3-prize final with deck two',
      {deck:2,damage:150,prizes:3,enemyBench:1,enemy:'MEGA'},'door'],
    ['single Active KO terminal with four prizes left',
      {deck:2,damage:150,prizes:4,enemyBench:0},'door'],
    ['two deck cards, attack remains short of KO',
      {deck:2,damage:90,prizes:2,enemyBench:1},'geist'],
    ['two deck cards, VSTAR prizes do not finish game',
      {deck:2,damage:150,prizes:3,enemyBench:1},'geist'],
    ['two deck cards, Mega ex prizes do not finish game',
      {deck:2,damage:150,prizes:4,enemyBench:1,enemy:'MEGA'},'geist'],
    ['one deck card, policy keeps conservative deck floor',
      {deck:1,damage:150,prizes:2,enemyBench:1},'geist'],
    ['no hand Psychic, cannot pay Door',
      {deck:2,damage:150,prizes:2,enemyBench:1,hand:false},'geist'],
    ['no Psychic Bench target, cannot pay Door',
      {deck:2,damage:150,prizes:2,enemyBench:1,benchPsychic:false},'geist'],
    ['unfunded Max Geist, cannot claim same-turn win',
      {deck:2,damage:150,prizes:2,enemyBench:1,energy:2},'geist'],
    ['no native Max Geist action, no hypothetical terminal',
      {deck:2,damage:150,prizes:2,enemyBench:1,offerAttack:false},'pass'],
    ['three deck cards retains previous setup choice',
      {deck:3,damage:150,prizes:2,enemyBench:1},'door']
  ]){
    test(label+' seat '+seat,()=>{
      const req=request(seat,opts);
      const output=decide(req);
      assert.deepEqual(output.decision,{kind:'select-action',token:want});
      assert.deepEqual(output.policyAudit.selectedTokens,[want]);
      assert.deepEqual(output.policyAudit.evaluations.map(row=>row.token),
        req.actionFrontier.items.map(row=>row.token));
    });
  }

  test('terminal two-card Door root -> physical prompt -> funded Max Geist seat '+seat,()=>{
    const root=request(seat,{deck:2,damage:150,prizes:2,enemyBench:1});
    assert.equal(decide(root).decision.token,'door');
    const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'AttachEnergyPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:VMAX,effectName:'Underworld Door'},
      choices:[{token:'attach-bench0',kind:'energy',printing:E,
        label:'Attach Psychic Energy to Bench 1',
        publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
          isOwnerVisible:true,energyType:'BASIC',
          zone:'bench',benchIndex:0,choiceIndex:0,selectedCount:1}}],
      publicMetadata:{selectionType:'energy-attachment',
        minimumCount:1,maximumCount:1,count:1,allowCancel:false,
        sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',zone:'bench'}};
    protocol.validatePrompt(prompt,seat);
    const question={...root,prompt,
      observation:{...root.observation,decisionKind:'owner-prompt',
        pendingPromptType:'AttachEnergyPrompt'},
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
    const reply=decide(question);
    assert.deepEqual(reply.decision,{kind:'select-choice',token:'attach-bench0'});
    protocol.validateDecision(reply.decision,prompt,new Set());
    protocol.validatePolicyAudit(reply.policyAudit,question,reply.decision,
      policy.POLICY_VERSION);
    // The next actor-visible state is constructed, NOT a native Store settlement.
    const settled={...root,observation:{...root.observation,
      ownHand:[],
      ownPublic:{...root.observation.ownPublic,
        deckCount:0,
        bench:[{...root.observation.ownPublic.bench[0],energies:[E]}]}},
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
        {token:'geist',kind:'attack',attackName:'Max Geist'},
        {token:'pass',kind:'pass'}
      ]}};
    const finish=decide(settled);
    assert.deepEqual(finish.decision,{kind:'select-action',token:'geist'});
  });
}
