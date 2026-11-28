'use strict';
/*
 * Exact original Hood 60 / rank-1 opponent-printing decision regression.
 * This is a pure actor-view + strict-protocol test, NOT a Twinleaf game.
 * Guzma BUS115: gust opponent's Bench, then switch own Active with own Bench.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const E = 'Psychic Energy MEE 13';
const pokemon = (id, hp, n, attacks) => ({
  printing:id, hp, damage:0,
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:Array(n).fill(E), attacks, tools:[], abilities:[],
  abilitySuppressions:[]
});
const vmax = n => pokemon('Shadow Rider Calyrex VMAX CRE 75',320,n,[
  {name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}
]);
const mimikyu = n => pokemon('Mimikyu GRI 58',70,n,[
  {name:'Copycat',cost:['Psychic','Colorless'],damage:''}
]);
const board = (active,bench) => ({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:1,
  publicTurnRestrictions:{
    gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
  }
});
function make(seat, mode) {
  const bad=mode.endsWith('bad');
  const none=mode==='root-no-bench';
  const isPrompt=mode.includes('prompt');
  const own=board(bad||none?vmax(3):mimikyu(0),
    none?[]:[bad?mimikyu(0):vmax(3)]);
  const opp=board(vmax(0),[mimikyu(0),vmax(0)]);
  const owner=mode==='own-prompt-good'?'actor':'opponent';
  const choices=(owner==='actor'?own.bench:opp.bench).map((slot,i)=>({
    token:'target'+i,kind:'pokemon',printing:slot.printing,
    label:(owner==='actor'?'Your':'Opponent')+' bench '+(i+1)+': '+slot.printing,
    publicMetadata:{ownerSeat:owner,isOwnerVisible:true,targetZone:'bench',
      selectionIndex:i,selectedCount:1,selectionType:'pokemon'}
  }));
  const prompt=isPrompt?{
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChoosePokemonPrompt',description:null,
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,
      maximumCount:1,allowCancel:false,isSecret:false,targetZone:'bench'},
    choices
  }:null;
  return {
    role:'candidate',seat,publicEventReceipt:null,prompt,
    observation:{
      actorSeat:seat,decisionKind:isPrompt?'owner-prompt':'owner-root',
      pendingPromptType:isPrompt?'ChoosePokemonPrompt':null,
      ownHand:['Guzma BUS 115'],ownPublic:own,opponentPublic:opp,
      ownTurnResources:{supporterPlayedTurn:0}
    },
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
      {token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS 115',
        publicMetadata:{cardType:'supporter'}},
      {token:'pass',kind:'pass'}
    ]}
  };
}
for(const seat of [0,1]) {
  for(const [mode,want] of [
    // Unpowered forced replacement -> no same-turn KO; reject gust.
    ['root-bad','pass'],
    // Bench VMAX is funded while Active Mimikyu cannot KO -> gust wins.
    ['root-good','guzma'],
    // If no own Bench, the compulsory second clause cannot resolve.
    ['root-no-bench','guzma'],
    // On the opponent target prompt, fail closed without a funded replacement.
    ['prompt-bad',null],
    // Choose 70 HP original rank-1 Mimikyu over 320 HP VMAX.
    ['prompt-good','target0'],
    // After opponent gust, promote own paid VMAX; preserve native index.
    ['own-prompt-good','target0']
  ]) {
    test('Guzma compulsory own switch '+mode+' seat '+seat,()=>{
      const request=make(seat,mode);
      if(request.prompt)protocol.validatePrompt(request.prompt,seat);
      const {decision,policyAudit}=policy.createPolicy({role:'candidate',seat,
        policyVersion:policy.POLICY_VERSION,config:{}})
        .decideWithAudit(request);
      if(want===null)assert.equal(decision.kind,'abstain');
      else if(request.prompt)assert.deepEqual(decision,
        {kind:'select-choices',tokens:[want]});
      else assert.deepEqual(decision,{kind:'select-action',token:want});
      protocol.validateDecision(decision,request.prompt,
        new Set(['guzma','pass']));
      protocol.validatePolicyAudit(policyAudit,request,decision,
        policy.POLICY_VERSION);
    });
  }
}

for(const seat of [0,1])test(
  'Guzma false positive must yield to a complete Underworld Door root and prompt seat '+seat,
  ()=>{
    const root=make(seat,'root-bad');
    root.observation.ownHand=[E,'Guzma BUS 115'];
    root.observation.ownPublic.deckCount=26;
    root.actionFrontier.items.splice(1,0,{
      token:'underworld-door',kind:'use-ability',
      actorPrinting:'Shadow Rider Calyrex VMAX CRE 75',
      publicMetadata:{abilityName:'Underworld Door'}
    });
    const worker=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}});
    const start=worker.decideWithAudit(root);
    assert.deepEqual(start.decision,
      {kind:'select-action',token:'underworld-door'});
    protocol.validateDecision(start.decision,null,
      new Set(root.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(start.policyAudit,root,start.decision,
      policy.POLICY_VERSION);

    // The next host frontier is the combined, source-exact native-shaped
    // AttachEnergyPrompt, not fictitious separate card/Pokemon prompts.
    const target=root.observation.ownPublic.bench[0];
    const prompt={
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'AttachEnergyPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Shadow Rider Calyrex VMAX CRE 75',
        effectName:'Underworld Door'},
      choices:[{
        token:'attach-psychic-to-mimikyu',kind:'energy',printing:E,
        label:'Attach '+E+' to Bench 1: '+target.printing,
        publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
          isOwnerVisible:true,energyType:'BASIC',zone:'bench',
          benchIndex:0,choiceIndex:0,selectedCount:1}
      }],
      publicMetadata:{selectionType:'energy-attachment',
        minimumCount:1,maximumCount:1,count:1,allowCancel:false,
        sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',zone:'bench'}
    };
    const follow={
      ...root,prompt,observation:{...root.observation,
        decisionKind:'owner-prompt',pendingPromptType:'AttachEnergyPrompt'},
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
    };
    protocol.validatePrompt(prompt,seat);
    const next=worker.decideWithAudit(follow);
    assert.deepEqual(next.decision,
      {kind:'select-choice',token:'attach-psychic-to-mimikyu'});
    protocol.validateDecision(next.decision,prompt,new Set());
    protocol.validatePolicyAudit(next.policyAudit,follow,next.decision,
      policy.POLICY_VERSION);
  }
);
