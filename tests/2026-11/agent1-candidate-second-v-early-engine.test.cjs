'use strict';
/*
 * Fixed Hood 60: 4 Shadow Rider V CRE74 + 4 VMAX CRE75.
 * An already-established V (including the evolved VMAX) must not suppress
 * the second Basic V root; two engines unlock a second future Underworld Door.
 * True native offers are assumed. This is not a played native game.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const E='Psychic Energy MEE 13';
const poke=id=>({
  printing:id,hp:210,damage:0,
  printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],abilities:[],abilitySuppressions:[],attacks:[]
});
const board=(active,bench)=>({
  active:poke(active),bench:bench.map(poke),stadium:[],discard:[],
  lostZone:[],resolvingSupporter:[],deckCount:30,handCount:1,
  publicTurnRestrictions:{
    gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
  }
});
function request(seat,{name,active,bench=[],opponent='Shadow Rider Calyrex VMAX CRE 75',
  compete=false}){
  const actions=[{token:'bench-second-v',kind:'play-card',actorPrinting:V,
    publicMetadata:{targetSeat:'actor',targetZone:'bench'}}];
  if(compete)actions.push({token:'bench-mimikyu',kind:'play-card',
    actorPrinting:'Mimikyu GRI 58',
    publicMetadata:{targetSeat:'actor',targetZone:'bench'}});
  actions.push({token:'pass',kind:'pass'});
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:compete?[V,'Mimikyu GRI 58']:[V],
      ownPublic:board(active,bench),opponentPublic:board(opponent,[]),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:actions}
  };
}
const cases=[
  {name:'initial Basic V required',active:'Mimikyu GRI 58',
    want:'bench-second-v'},
  {name:'one Basic V Active requires backup',active:V,
    want:'bench-second-v'},
  {name:'one VMAX Active requires next engine',active:VMAX,
    want:'bench-second-v'},
  {name:'one VMAX with a filler Bench still wants next engine',
    active:VMAX,bench:['Marshadow UNB 81'],want:'bench-second-v'},
  {name:'two engine slots already enough',active:VMAX,bench:[V],
    want:'pass'},
  {name:'preserve last ordinary Bench position',active:VMAX,
    bench:Array(4).fill('Marshadow UNB 81'),want:'pass'},
  {name:'matchup Mimikyu outranks second V',active:V,compete:true,
    opponent:'Regidrago VSTAR SIT 136',want:'bench-mimikyu'}
];
for(const seat of [0,1])for(const example of cases)
  test(example.name+' seat '+seat,()=>{
    const req=request(seat,example);
    const result=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}})
      .decideWithAudit(req);
    assert.deepEqual(result.decision,{kind:'select-action',
      token:example.want});
    protocol.validateDecision(result.decision,null,
      new Set(req.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(result.policyAudit,req,result.decision,
      policy.POLICY_VERSION);
  });

const FOG='Fog Crystal CRE 140';
const TREASURE='Mysterious Treasure FLI 113';
const QUICK='Quick Ball FST 237';
function fundedRoot(seat,tutor,options={}) {
  const own=board(VMAX,options.bench??[]);
  own.active.energies=Array(4).fill(E);
  own.handCount=options.hand?.length??2;
  const hand=options.hand??[tutor,VMAX];
  const actions=[{token:'tutor',kind:'play-card',actorPrinting:tutor,
    publicMetadata:{cardType:'item'}}];
  if(options.benchV)actions.push({
    token:'bench',kind:'play-card',actorPrinting:V,
    publicMetadata:{targetSeat:'actor',targetZone:'bench'}
  });
  actions.push({token:'pass',kind:'pass'});
  return {
    role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:hand,ownPublic:own,
      opponentPublic:board(VMAX,[]),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:actions}
  };
}
for(const seat of [0,1]) {
  test('Fog Crystal -> source Basic V -> play second V causal policy chain seat '+seat,()=>{
    const req=fundedRoot(seat,FOG);  // existing VMAX + VMAX-only hand
    const worker=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}});
    const root=worker.decideWithAudit(req);
    assert.deepEqual(root.decision,{kind:'select-action',token:'tutor'});
    protocol.validateDecision(root.decision,null,
      new Set(req.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(root.policyAudit,req,root.decision,
      policy.POLICY_VERSION);

    // Genuine source-printed Fog search: Basic Psychic versus Psychic Energy.
    // Native search/hand mutation is represented by the explicitly supplied
    // next actor-visible view; no claim of Store dispatch is made.
    const cardChoice=(token,printing,index)=>({
      token,kind:'card',printing,label:printing,
      publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectionIndex:index,selectedCount:1}
    });
    const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:FOG,effectName:'Fog Crystal'},
      choices:[cardChoice('v',V,0),cardChoice('energy',E,1),
        {token:'none',kind:'empty-selection',
          label:'Choose no items',publicMetadata:{selectedCount:0}}],
      publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,minimumCount:0,maximumCount:1,
        allowCancel:false,isSecret:false,selectionType:'card-combination'}
    };
    protocol.validatePrompt(prompt,seat);
    const follow={...req,prompt,
      observation:{...req.observation,decisionKind:'owner-prompt',
        pendingPromptType:'ChooseCardsPrompt',ownHand:[VMAX]},
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
    };
    const selected=worker.decideWithAudit(follow);
    assert.deepEqual(selected.decision,
      {kind:'select-choices',tokens:['v']});
    protocol.validateDecision(selected.decision,prompt,new Set());
    protocol.validatePolicyAudit(selected.policyAudit,follow,
      selected.decision,policy.POLICY_VERSION);

    const after=fundedRoot(seat,FOG,{hand:[VMAX,V],benchV:true});
    after.actionFrontier.items=after.actionFrontier.items.filter(
      item=>item.token!=='tutor'); // Fog was consumed by native search
    const benched=worker.decideWithAudit(after);
    assert.deepEqual(benched.decision,
      {kind:'select-action',token:'bench'});
    protocol.validateDecision(benched.decision,null,
      new Set(after.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(benched.policyAudit,after,
      benched.decision,policy.POLICY_VERSION);
  });

  for(const tutor of [TREASURE,QUICK])test(
    tutor+' can seek second engine if discard-capable seat '+seat,()=>{
      const req=fundedRoot(seat,tutor,{hand:[tutor,E,VMAX]});
      const out=policy.createPolicy({role:'candidate',seat,
        policyVersion:policy.POLICY_VERSION,config:{}})
        .decideWithAudit(req);
      assert.deepEqual(out.decision,{kind:'select-action',token:'tutor'});
      protocol.validateDecision(out.decision,null,
        new Set(req.actionFrontier.items.map(x=>x.token)));
      protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
        policy.POLICY_VERSION);
    });

  for(const [label,bench,hand,want] of [
    ['already two engines',[V],[FOG,VMAX],'pass'],
    ['no reserve Bench slot',Array(4).fill('Marshadow UNB 81'),
      [FOG,VMAX],'pass'],
    ['second V already in hand',[],[FOG,V],'bench']
  ])test('second-V tutor opportunity control '+label+' seat '+seat,()=>{
    const req=fundedRoot(seat,FOG,{
      bench,hand,benchV:label==='second V already in hand'
    });
    const out=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}})
      .decideWithAudit(req);
    assert.deepEqual(out.decision,{kind:'select-action',token:want});
    protocol.validateDecision(out.decision,null,
      new Set(req.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
      policy.POLICY_VERSION);
  });
}
