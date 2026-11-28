'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {withPaleMoonTerminalEscapePolicy}=
  require('../../simulation/twinleaf/2026-11/agent34-pale-moon-policy-decorator.cjs');

const version='agent34-fake-policy-v1';
const other=[
  {token:'attack',kind:'attack',attackName:'Max Geist'},
  {token:'fog',kind:'play-card',actorPrinting:'Fog Crystal CRE'},
  {token:'door',kind:'use-ability',publicMetadata:{abilityName:'Underworld Door'}}
];
const pass={token:'pass',kind:'pass'};
const ranger={token:'ranger',kind:'play-card',actorPrinting:'Pokemon Ranger STS'};
const retreat={token:'retreat',kind:'retreat',
  publicMetadata:{targetSeat:'actor',targetZone:'bench',benchIndex:0,targetIndex:0}};
const rootView=()=>({decisionKind:'owner-root',
  ownPublic:{
    active:{publicRestrictions:{pendingPaleMoonGXKnockOut:true}},
    bench:[],publicTurnRestrictions:{alteredCreationDamage:false,usedAlteredCreation:false}
  },
  opponentPublic:{prizeCount:1},
  ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0}
});
function auditFor(request,decision){
  const choices=request.prompt?request.prompt.choices:request.actionFrontier.items;
  const selected=decision.kind==='abstain'?[]:decision.kind==='select-choices'?decision.tokens.slice():[decision.token];
  return {schema:protocol.POLICY_AUDIT_SCHEMA,policyVersion:version,
    decisionKind:request.observation.decisionKind,
    decisionType:decision.kind,selectionRuleCode:decision.kind==='abstain'?
      'ABSTAIN_POLICY_DECISION':'BASE_ROOT_PASS',
    tieBreakCode:'NONE',selectedTokens:selected,
    evaluations:choices.map(item=>({
      token:item.token,
      status:selected.includes(item.token)?'rule-selected':'not-evaluated',
      score:null,
      reasonCode:selected.includes(item.token)?
        'SELECTED_BY_POLICY_RULE':'NOT_EVALUATED_BY_SELECTED_BRANCH'
    }))
  };
}
const policy=(selectedToken='pass')=>({
  decide(){return {kind:'select-action',token:selectedToken};},
  decideWithAudit(request) {
    const decision={kind:'select-action',token:selectedToken};
    return {decision,policyAudit:auditFor(request,decision)};
  }
});
test('opt-in wrapper displaces only a terminal Pass with genuine Ranger in a rich full frontier',()=>{
  const request={observation:rootView(),actionFrontier:{items:[pass,...other,ranger]}};
  const source=policy();
  const wrapped=withPaleMoonTerminalEscapePolicy(source);
  assert.deepEqual(source.decide(request),{kind:'select-action',token:'pass'});
  assert.deepEqual(wrapped.decide(request),{kind:'select-action',token:'ranger'});
  const result=wrapped.decideWithAudit(request);
  assert.deepEqual(result.decision,{kind:'select-action',token:'ranger'});
  protocol.validatePolicyAudit(result.policyAudit,request,result.decision,version);
  assert.deepEqual(result.policyAudit.selectedTokens,['ranger']);
  assert.equal(result.policyAudit.evaluations.find(row=>row.token==='pass').status,'not-evaluated');
  assert.equal(result.policyAudit.evaluations.find(row=>row.token==='ranger').status,'rule-selected');
});
test('wrapper leaves original attacks, nonterminal passing, and ambiguous roots untouched',()=>{
  const attackRequest={observation:rootView(),actionFrontier:{items:[pass,...other,ranger]}};
  const active=withPaleMoonTerminalEscapePolicy(policy('attack'));
  const before=active.decideWithAudit(attackRequest);
  assert.deepEqual(before.decision,{kind:'select-action',token:'attack'});
  protocol.validatePolicyAudit(before.policyAudit,attackRequest,before.decision,version);
  const nonterminal={...attackRequest,observation:{...rootView(),opponentPublic:{prizeCount:2}}};
  assert.deepEqual(withPaleMoonTerminalEscapePolicy(policy()).decide(nonterminal),{kind:'select-action',token:'pass'});
  const ambig={...attackRequest,observation:{...rootView(),
    ownPublic:{...rootView().ownPublic,bench:[{printing:'Mimikyu GRI 58'}]}},
    actionFrontier:{items:[pass,...other,ranger,retreat]}};
  assert.deepEqual(withPaleMoonTerminalEscapePolicy(policy()).decide(ambig),{kind:'select-action',token:'pass'});
});
test('Guzma pending owner-switch prompt overrides abstention with real physical Bench token',()=>{
  const chosen={token:'prompt-owner',kind:'pokemon',printing:'Mimikyu GRI 58',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:4,selectionIndex:0}};
  const empty={token:'prompt-empty',kind:'empty-selection'};
  const request={observation:{
    decisionKind:'owner-prompt',
    ownPublic:{active:{publicRestrictions:{pendingPaleMoonGXKnockOut:true}},
      bench:[null,null,null,null,{printing:'Mimikyu GRI 58'}]},
    opponentPublic:{prizeCount:1}
  },prompt:{
    promptType:'ChoosePokemonPrompt',actingSeat:0,
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Guzma BUS',effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',minimumCount:0,maximumCount:1,allowCancel:false},
    choices:[chosen,empty]
  }};
  const base={decide(){return {kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'};},
    decideWithAudit(req){const decision=this.decide(req);
      return {decision,policyAudit:auditFor(req,decision)};}};
  const wrapped=withPaleMoonTerminalEscapePolicy(base);
  const result=wrapped.decideWithAudit(request);
  assert.deepEqual(result.decision,{kind:'select-choice',token:'prompt-owner'});
  protocol.validatePolicyAudit(result.policyAudit,request,result.decision,version);
  assert.deepEqual(result.policyAudit.selectedTokens,['prompt-owner']);
  assert.equal(result.policyAudit.selectionRuleCode,'PUBLIC_PALE_MOON_TERMINAL_ESCAPE');
});
test('untrusted prompt source or second legal Bench choice cannot change policy',()=>{
  const request={observation:{decisionKind:'owner-prompt',
    ownPublic:{active:{publicRestrictions:{pendingPaleMoonGXKnockOut:true}},
      bench:[{printing:'Mimikyu GRI 58'}]},
    opponentPublic:{prizeCount:1}},
    prompt:{promptType:'ChoosePokemonPrompt',
      source:{classification:'untrusted',sourceKind:'card-effect',
        sourcePrinting:'Guzma BUS',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:0,maximumCount:1,allowCancel:false},
      choices:[{token:'p',kind:'pokemon',printing:'Mimikyu GRI 58',
        publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0,selectionIndex:0}}]}
  };
  const base={decide(){return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT'};}};
  const wrapped=withPaleMoonTerminalEscapePolicy(base);
  assert.deepEqual(wrapped.decide(request),base.decide(request));
  assert.deepEqual(wrapped.decideWithAudit(request),{
    decision:base.decide(request),policyAudit:null
  });
});

test('strict multi-select VS Seeker recovery policy audit is rewritten to Ranger source token',()=>{
  const view={...rootView(),decisionKind:'owner-prompt',ownPublic:{
    ...rootView().ownPublic,discard:['Pokemon Ranger STS'],
    publicTurnRestrictions:{alteredCreationDamage:false,usedAlteredCreation:false}},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}};
  const rangerChoice={token:'prompt-ranger',kind:'card',printing:'Pokemon Ranger STS',
    publicMetadata:{sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}};
  const ionoChoice={token:'prompt-iono',kind:'card',printing:'Iono PAL',
    publicMetadata:{sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}};
  const request={observation:view,prompt:{
    promptType:'ChooseCardsPrompt',actingSeat:0,
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'VS Seeker PHF',effectName:'VS Seeker'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,
      sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false},
    choices:[ionoChoice,rangerChoice]
  }};
  const base={decide(){return {kind:'select-choices',tokens:['prompt-iono']};},
    decideWithAudit(req){const decision=this.decide(req);
      return {decision,policyAudit:auditFor(req,decision)};}};
  const wrapped=withPaleMoonTerminalEscapePolicy(base);
  assert.deepEqual(wrapped.decide(request),{kind:'select-choices',tokens:['prompt-ranger']});
  const result=wrapped.decideWithAudit(request);
  assert.deepEqual(result.decision,{kind:'select-choices',tokens:['prompt-ranger']});
  protocol.validatePolicyAudit(result.policyAudit,request,result.decision,version);
  assert.deepEqual(result.policyAudit.selectedTokens,['prompt-ranger']);
  assert.equal(result.policyAudit.evaluations.find(x=>x.token==='prompt-iono').status,'not-evaluated');
  assert.equal(result.policyAudit.evaluations.find(x=>x.token==='prompt-ranger').status,'rule-selected');
  const replay=wrapped.decideWithAudit(request);
  assert.deepEqual(replay,result,'same provenance and same source must select reproducibly');
});
test('VS Seeker terminal Pass root uses exact source Item and preserves strict audit',()=>{
  const view={...rootView(),ownPublic:{
      ...rootView().ownPublic,discard:['Pokemon Ranger STS'],
      publicTurnRestrictions:{alteredCreationDamage:false,usedAlteredCreation:false,
        itemPlayLocked:false}},
      ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,itemPlayLocked:false}};
  const request={observation:view,actionFrontier:{items:[pass,...other,
    {token:'native-seeker',kind:'play-card',actorPrinting:'VS Seeker PHF'}]}};
  const wrapped=withPaleMoonTerminalEscapePolicy(policy());
  const out=wrapped.decideWithAudit(request);
  assert.deepEqual(out.decision,{kind:'select-action',token:'native-seeker'});
  protocol.validatePolicyAudit(out.policyAudit,request,out.decision,version);
  assert.equal(out.policyAudit.selectionRuleCode,'PUBLIC_PALE_MOON_TERMINAL_ESCAPE');
});

test('Arven owner-deck Tool recovery is an opt-in selected-root plus audited multi-select',()=>{
  const active={printing:'Shadow Rider Calyrex VMAX CRE 75',
    tools:[],specialConditions:[],
    printed:{retreatCost:['Colorless','Colorless']},
    publicRestrictions:{pendingPaleMoonGXKnockOut:true,cannotRetreat:false,
      cannotRetreatNextTurn:false,cannotRetreatWhileActive:false}};
  const observation={...rootView(),ownPublic:{
    ...rootView().ownPublic,active,bench:[{printing:'Mimikyu GRI 58'}],
    deckCount:29,stadium:[],
    publicTurnRestrictions:{alteredCreationDamage:false,usedAlteredCreation:false,
      supporterPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}},
    opponentPublic:{prizeCount:1,active:{tools:[]},stadium:[],
      publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      toolPlayLocked:false,retreatedTurn:0},
    ownHand:['Arven SVI']};
  const request={observation,actionFrontier:{items:[pass,...other,
    {token:'arven-native-root',kind:'play-card',actorPrinting:'Arven SVI'}]}};
  const wrapped=withPaleMoonTerminalEscapePolicy(policy());
  const root=wrapped.decideWithAudit(request);
  assert.deepEqual(root.decision,{kind:'select-action',token:'arven-native-root'});
  protocol.validatePolicyAudit(root.policyAudit,request,root.decision,version);
  const selected={token:'tool-choice',kind:'card',printing:'Float Stone BKT',
    publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};
  const irrelevant={token:'item-choice',kind:'card',printing:'Fog Crystal CRE',
    publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};
  const promptRequest={observation:{...observation,decisionKind:'owner-prompt'},
    prompt:{promptType:'ChooseCardsPrompt',actingSeat:0,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Arven SVI',effectName:'Arven'},
      publicMetadata:{selectionType:'card-combination',
        minimumCount:0,maximumCount:2,allowCancel:false,
        sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true},
      choices:[irrelevant,selected,{token:'none',kind:'empty-selection'}]}};
  const base={
    decide(){return {kind:'select-choices',tokens:['item-choice']};},
    decideWithAudit(req){const decision=this.decide(req);
      return {decision,policyAudit:auditFor(req,decision)};}
  };
  const promptPolicy=withPaleMoonTerminalEscapePolicy(base);
  const out=promptPolicy.decideWithAudit(promptRequest);
  assert.deepEqual(out.decision,{kind:'select-choices',tokens:['tool-choice']});
  protocol.validatePolicyAudit(out.policyAudit,promptRequest,out.decision,version);
  assert.deepEqual(out.policyAudit.selectedTokens,['tool-choice']);
  assert.equal(out.policyAudit.evaluations.find(x=>x.token==='item-choice').status,'not-evaluated');
  assert.equal(out.policyAudit.evaluations.find(x=>x.token==='tool-choice').status,'rule-selected');
});
