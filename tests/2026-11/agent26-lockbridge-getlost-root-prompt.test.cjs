'use strict';
// Bounded developmental actor-only candidate policy regression. No native Store,
// no games, no approved worker registration, no opponent hidden-zone content.
const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const candidate = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const turnRestrictions = () => ({
  gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
  attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
  ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
  cannotUseGXAttacks:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
  evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
  stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
  specialEnergyPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
});
const pokemonRestrictions = () => ({
  cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
  blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
  onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
  attackCostIncreaseWhileActive:0,cannotRetreat:false,
  cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,
  cannotEvolveNextTurn:false
});
function card(printing, attackList = [], special = {}) {
  const vstar = printing.includes('VSTAR');
  return {
    printing,name:printing,hp:vstar?280:90,damage:0,lastPlayedOrEvolvedTurn:0,
    printed:{stage:vstar?'VSTAR':'BASIC',subtypes:vstar?['VSTAR']:['Basic'],
      types:vstar?['Dragon']:['Psychic'],retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],publicRestrictions:pokemonRestrictions(),
    evolutionPrintings:[],energies:['Psychic Energy SVE'],tools:[],
    attacks:attackList.map(([name,cost,damage]) => ({
      name,cost,damage,damageCalculation:null,text:null,gxAttack:false,barrage:false
    })),
    abilities:[],abilityDetails:[],abilitySuppressions:[],...special
  };
}
function player({active,discard=[],stadium=[],bench=[]}={}) {
  return {
    active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
    stadium,discard,lostZone:[],resolvingSupporter:[],publicHand:null,prizeSlots:[],
    publicTurnRestrictions:turnRestrictions(),handCount:0,deckCount:30,prizeCount:6
  };
}
function baseView(seat = 0) {
  return {
    actorSeat:seat,globalTurn:7,phase:2,decisionKind:'owner-root',
    pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:[],
    ownPublic:player({
      active:card('Girafarig LOT',[['Get Lost',['Colorless'],0]]),
      stadium:['Temple of Sinnoh ASR']
    }),
    opponentPublic:player({
      active:card('Regidrago VSTAR SIT',[['Apex Dragon',['Grass','Grass','Fire'],null]]),
      discard:['Megaton Blower SSP','Crispin SCR','Dialga-GX UPR','Kyurem SFA']
    }),
    ownTurnResources:{
      supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
      energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
      vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
      evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false
    },
    ownerK1:null
  };
}
function request(view, prompt = null, actions = []) {
  return {
    schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'agent26-getlost',sequence:1,role:'candidate',
    seat:view.actorSeat,observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:view,prompt,publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:actions}
  };
}
const rootActions = () => [
  {token:'attack-get-lost',kind:'attack',
    actorPrinting:'Girafarig LOT',attackName:'Get Lost',
    publicMetadata:{attackCostPayable:true}},
  {token:'pass',kind:'pass'}
];
function promptRequest(view, {
  sourcePrinting='Girafarig LOT',effectName='Get Lost',sourceZone='discard',
  ownerSeat='opponent',isOwnerVisible=true,minimumCount=2,maximumCount=2,
  printings=['Dialga-GX UPR','Crispin SCR','Megaton Blower SSP','Kyurem SFA'],
  wrongChoiceIndex=null
} = {}) {
  const choices=printings.map((printing,index)=>({
    token:'choice-'+index,kind:'card',printing,label:printing,
    publicMetadata:{
      selectionIndex:index,selectedCount:1,
      sourceZone,ownerSeat,
      isOwnerVisible:wrongChoiceIndex===index?false:isOwnerVisible
    }
  }));
  const prompt={
    schema:protocol.PROMPT_SCHEMA,actingSeat:view.actorSeat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_DISCARD',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting,effectName},choices,
    publicMetadata:{sourceZone,ownerSeat,isOwnerVisible,
      minimumCount,maximumCount,allowCancel:false,isSecret:false,
      selectionType:'card-combination'}
  };
  return request({...view,decisionKind:'owner-prompt',
    pendingPromptType:'ChooseCardsPrompt'},prompt,[]);
}
function run(req) {
  const init={role:'candidate',seat:req.seat};
  const valid=protocol.validateRequest(req,init,1,new Set());
  const worker=candidate.createPolicy({
    role:'candidate',seat:req.seat,policyVersion:candidate.POLICY_VERSION,config:{}
  });
  const response=worker.decideWithAudit(req);
  protocol.validateDecision(response.decision,valid.prompt,valid.actionTokens);
  protocol.validatePolicyAudit(response.policyAudit,req,response.decision,
    candidate.POLICY_VERSION);
  return response.decision;
}

for (const seat of [0,1]) {
  test('Get Lost visible-cut root selects native attack, actor seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(request(view,null,rootActions())),
      {kind:'select-action',token:'attack-get-lost'});
  });
  test('Get Lost opponent-public discard selects physical tokens, seat '+seat,()=>{
    const view=baseView(seat);
    const choice=run(promptRequest(view));
    assert.deepEqual(choice,
      {kind:'select-choices',tokens:['choice-2','choice-1']});
  });
  test('Get Lost duplicate physical Megaton chooses first token only, seat '+seat,()=>{
    const view=baseView(seat);
    view.opponentPublic.discard=['Megaton Blower SSP','Megaton Blower SSP',
      'Crispin SCR','Dialga-GX UPR'];
    assert.deepEqual(run(promptRequest(view,{
      printings:['Megaton Blower SSP','Megaton Blower SSP','Crispin SCR',
        'Dialga-GX UPR']
    })),{kind:'select-choices',tokens:['choice-0','choice-2']});
  });
  test('No Temple leaves root Pass rather than invented denial, seat '+seat,()=>{
    const view=baseView(seat);view.ownPublic.stadium=[];
    assert.deepEqual(run(request(view,null,rootActions())),
      {kind:'select-action',token:'pass'});
    assert.deepEqual(run(promptRequest(view)),{
      kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'
    });
  });
  test('No Megaton visible leaves root/pass unchanged, seat '+seat,()=>{
    const view=baseView(seat);
    view.opponentPublic.discard=['Crispin SCR','Dialga-GX UPR','Kyurem SFA'];
    assert.deepEqual(run(request(view,null,rootActions())),
      {kind:'select-action',token:'pass'});
  });
  test('No Crispin visible leaves root/pass unchanged, seat '+seat,()=>{
    const view=baseView(seat);
    view.opponentPublic.discard=['Megaton Blower SSP','Dialga-GX UPR'];
    assert.deepEqual(run(request(view,null,rootActions())),
      {kind:'select-action',token:'pass'});
  });
  test('Opponent has no Regidrago VSTAR leaves root unchanged, seat '+seat,()=>{
    const view=baseView(seat);
    view.opponentPublic.active=card('Iron Thorns ex TWM');
    assert.deepEqual(run(request(view,null,rootActions())),
      {kind:'select-action',token:'pass'});
  });
  test('Underworld Door action blocks root override to preserve engine, seat '+seat,()=>{
    const view=baseView(seat);
    const actions=[...rootActions(),{
      token:'underworld',kind:'use-ability',
      publicMetadata:{abilityName:'Underworld Door'}
    }];
    const chosen=run(request(view,null,actions));
    assert.notDeepEqual(chosen,{kind:'select-action',token:'attack-get-lost'});
  });
  test('Public opponent-owned card is not a general owner-owned search, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{
      sourcePrinting:'Mysterious Treasure FLI',
      effectName:'Mysterious Treasure'
    })),{kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
  test('Get Lost choice with owner-side forged metadata fails closed, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{ownerSeat:'actor'})),
      {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
  test('Get Lost concealed card fails closed, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{wrongChoiceIndex:0})),
      {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
  test('Wrong exact Girafarig printing fails back to normal policy, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{
      sourcePrinting:'Girafarig BKT'
    })),{kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
  test('Get Lost min1 underbinding rejects untrusted prompt, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{minimumCount:1})),
      {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
  test('Get Lost missing physical choice declines rather than guessing, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{
      printings:['Dialga-GX UPR','Megaton Blower SSP','Kyurem SFA']
    })),{kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'});
  });
  test('Certified source bridge Girafarig LOT 94 identity retained, seat '+seat,()=>{
    const view=baseView(seat);
    assert.deepEqual(run(promptRequest(view,{
      sourcePrinting:'Girafarig LOT 94'
    })),{kind:'select-choices',tokens:['choice-2','choice-1']});
  });
}

/* Real research-side V3 projector, with synthetic native object graph and
 * a fake exact-class ChooseCardsPrompt. Not a compiled pinned Twinleaf Store.
 * This checks source provenance + opponent-public visibility + token custody.
 */
const projection = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
for (const seat of [0,1]) {
  test('V3 projector Get Lost opponent-discard tokens map to native indices, seat '+seat,()=>{
    const printed = (fullName) => ({fullName});
    const girafarig = printed('Girafarig LOT');
    const opponentCards = [
      printed('Dialga-GX UPR'),printed('Crispin SCR'),
      printed('Megaton Blower SSP'),printed('Kyurem SFA')
    ];
    const list = cards => ({cards});
    const player = id => ({
      id,hand:list([]),deck:list([]),discard:list([]),lostzone:list([]),
      stadium:list([]),supporter:list([]),active:{cards:[],energies:list([]),tools:[]},
      bench:[],prizes:[]
    });
    const state={phase:2,players:[player('player-0'),player('player-1')]};
    state.players[seat].active.cards.push(girafarig);
    state.players[1-seat].discard.cards.push(...opponentCards);
    class ChooseCardsPrompt {
      constructor(){
        this.playerId='player-'+seat;
        this.message='CHOOSE_CARD_TO_DISCARD';
        this.cards=state.players[1-seat].discard;
        this.options={min:2,max:2};
      }
      getPerspectivePlayerId(){ return this.playerId; }
      decode(indices){return indices;}
      validate(indices){
        return Array.isArray(indices) && indices.length===2 &&
          indices.every(n=>Number.isInteger(n)&&n>=0&&n<4) &&
          indices[0]!==indices[1];
      }
    }
    const pending=new ChooseCardsPrompt();
    const projected=projection.projectPrompt({
      prompt:pending,state,actorSeat:seat,native:{},store:{},
      provenanceHook:{getPromptProvenance:()=>({
        sourceKind:'card-effect',sourceCard:girafarig,effectName:'Get Lost'
      })}
    });
    assert.equal(projected.hostOnly,false);
    assert.equal(projected.promptProjection.source.sourcePrinting,'Girafarig LOT');
    assert.equal(projected.promptProjection.publicMetadata.sourceZone,'discard');
    assert.equal(projected.promptProjection.publicMetadata.ownerSeat,'opponent');
    assert.equal(projected.promptProjection.publicMetadata.isOwnerVisible,true);
    const view=baseView(seat);
    const req=request({...view,decisionKind:'owner-prompt',
      pendingPromptType:'ChooseCardsPrompt'},projected.promptProjection,[]);
    const chosen=run(req);
    assert.deepEqual(chosen,{
      kind:'select-choices',tokens:['prompt-2','prompt-1']
    });
    const physical=chosen.tokens.map(token=>projected.choiceByToken.get(token));
    assert.deepEqual(physical,[2,1]);
    assert.deepEqual(physical.map(index=>opponentCards[index].fullName),
      ['Megaton Blower SSP','Crispin SCR']);
    assert.equal(projection.validateRawPromptResult(pending,physical,state).valid,true);
  });
}
