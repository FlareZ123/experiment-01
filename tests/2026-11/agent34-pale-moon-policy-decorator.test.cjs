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
  const selected=decision.kind==='abstain'?[]:[decision.token];
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
