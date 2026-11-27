'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {projectPrompt}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {projectRank29RevealedHandPrompt}=require(
  '../../simulation/evaluation/2026-11/agent4-rank29-revealed-hand-projection.cjs');
const rank29Projection=require(
  '../../simulation/evaluation/2026-11/agent4-rank29-prompt-projection-adapter.cjs');
const rank29Policy=require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

class ChooseCardsPrompt{
  constructor(id,hand,sourceCard){
    this.playerId=id;
    this.cards=hand;
    this.sourceCard=sourceCard;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.options={min:0,max:2,allowCancel:false,isSecret:false};
    this.result=undefined;
  }
  getPerspectivePlayerId(){return this.playerId;}
  decode(selected){return selected;}
  validate(selected){
    if(!Array.isArray(selected)||selected.length>2)return false;
    return selected.every(c=>{
      if(this.sourceCard.fullName.startsWith('Eri '))
        return /VS Seeker|Unfair Stamp|Fog Crystal/i.test(c.fullName);
      if(this.sourceCard.fullName.startsWith('Sidney '))
        return /Double Colorless Energy|Sky Field|Float Stone/i.test(c.fullName);
      return /Psychic Energy|Double Colorless Energy/i.test(c.fullName);
    });
  }
}
function player(id){
  return {id,
    hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    active:null,bench:[],prizes:[]};
}
function physical({seat=0,source='Eri TEF',hiddenCards=[
  'Unfair Stamp TWM 165','VS Seeker PHF 109','Iono PAL 185'
]}={}){
  const players=[player(37),player(59)];
  const src={fullName:source};
  players[seat].supporter.cards.push(src);
  players[1-seat].hand.cards.push(...hiddenCards.map(fullName=>({fullName})));
  const prompt=new ChooseCardsPrompt(players[seat].id,players[1-seat].hand,src);
  const state={phase:2,players};
  const provenanceHook={getPromptProvenance(p){
    if(p!==prompt)throw Error('INVALID_PROVENANCE_OBJECT');
    return {sourceKind:'card-effect',sourceCard:src,effectName:source.split(' ')[0]};
  }};
  return {prompt,state,actorSeat:seat,native:{},provenanceHook};
}

test('production projection rejects identical private Eri prompt without authentic reveal bridge',()=>{
  for(const seat of [0,1]){
    const f=physical({seat});
    assert.throws(()=>projectPrompt(f),/not visible to the acting player/);
    assert.notEqual(f.state.players[1-seat].hand.isPublic,true);
  }
});

test('exact authentic Eri projection uses production code to show only native-valid Items',()=>{
  for(const seat of [0,1]){
    const f=physical({seat});
    const hand=f.state.players[1-seat].hand;
    const result=projectRank29RevealedHandPrompt({
      ...f,baseProjectPrompt:projectPrompt
    });
    protocol.validatePrompt(result.promptProjection,seat);
    assert.equal(hand.isPublic,undefined);
    assert.equal(result.promptProjection.publicMetadata.ownerSeat,'opponent');
    assert.equal(result.promptProjection.publicMetadata.isOwnerVisible,true);
    assert.equal(result.promptProjection.publicMetadata.maximumCount,2);
    assert.deepEqual(result.promptProjection.choices.filter(c=>c.kind==='card')
      .map(c=>c.printing),['Unfair Stamp TWM 165','VS Seeker PHF 109']);
    assert.equal(result.promptProjection.choices.length,3);
    assert.equal(result.choiceByToken.size,3);
    assert.equal(result.rank29RevealedHandEvidence.eligibleNativeCards,2);
  }
});

test('Sidney and Team Skull project only cards their physical validators admit',()=>{
  for(const [source,names,expected] of [
    ['Sidney FST 241',['Sky Field ROS 89','Iono PAL 185',
      'Float Stone BKT 137','Iron Thorns ex TWM 77'],['Sky Field ROS 89','Float Stone BKT 137']],
    ['Team Skull Grunt SUM',['Psychic Energy SVE 5','Iono PAL 185',
      'Double Colorless Energy SUM 136'],['Psychic Energy SVE 5','Double Colorless Energy SUM 136']]
  ])for(const seat of [0,1]){
    const f=physical({seat,source,hiddenCards:names});
    const result=projectRank29RevealedHandPrompt({
      ...f,baseProjectPrompt:projectPrompt
    });
    protocol.validatePrompt(result.promptProjection,seat);
    assert.deepEqual(result.promptProjection.choices.filter(c=>c.kind==='card')
      .map(c=>c.printing),expected);
    assert.equal(f.state.players[1-seat].hand.isPublic,undefined);
  }
});

test('native zero legal target returns only explicit empty selection with maximumCount zero',()=>{
  const f=physical({hiddenCards:['Iono PAL 185','Shadow Rider Calyrex V CRE 74']});
  const result=projectRank29RevealedHandPrompt({...f,baseProjectPrompt:projectPrompt});
  protocol.validatePrompt(result.promptProjection,0);
  assert.equal(result.promptProjection.publicMetadata.maximumCount,0);
  assert.deepEqual(result.promptProjection.choices.map(c=>c.kind),['empty-selection']);
  assert.equal(result.choiceByToken.size,1);
});

test('native legal filtering handles duplicate printed Items without conflating tokens',()=>{
  const f=physical({hiddenCards:['VS Seeker PHF 109','VS Seeker PHF 109',
    'Double Colorless Energy SUM 136']});
  const result=projectRank29RevealedHandPrompt({...f,baseProjectPrompt:projectPrompt});
  protocol.validatePrompt(result.promptProjection,0);
  const cards=result.promptProjection.choices.filter(c=>c.kind==='card');
  assert.equal(cards.length,2);
  assert.notEqual(cards[0].token,cards[1].token);
  assert.notEqual(cards[0].publicMetadata.selectionIndex,cards[1].publicMetadata.selectionIndex);
});

test('source identity or physical prompt owner mismatch never makes private hand public',()=>{
  for(const mutate of [
    f=>{f.prompt.cards={cards:f.state.players[1].hand.cards};},
    f=>{f.prompt.playerId=1000;},
    f=>{f.state.players[0].supporter.cards=[];},
    f=>{f.prompt.message='CHOOSE_TOP_DECK_CARD';}
  ]){
    const f=physical();
    mutate(f);
    assert.throws(()=>projectRank29RevealedHandPrompt({
      ...f,baseProjectPrompt:projectPrompt
    }));
    assert.equal(f.state.players[1].hand.isPublic,undefined);
  }
});

test('rank29 projection is a real drop-in canonical dependency with unmodified dispatch API',()=>{
  const original=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
  assert.notEqual(rank29Projection.projectPrompt,original.projectPrompt);
  for(const name of ['dispatchPromptChoice','resolveHostOnlyPrompt',
    'createIsolatedValidationPromptStore']){
    assert.equal(rank29Projection[name],original[name]);
  }
  const f=physical();
  const result=rank29Projection.projectPrompt(f);
  protocol.validatePrompt(result.promptProjection,0);
  assert.equal(result.promptProjection.choices.filter(x=>x.kind==='card').length,2);
  assert.equal(f.state.players[1].hand.isPublic,undefined);
});

function publicPlayer(){
  return {
    active:null,bench:[null,null,null,null,null],stadium:[],discard:[],
    lostZone:[],resolvingSupporter:[],publicHand:null,prizeSlots:null,
    handCount:4,deckCount:32,prizeCount:6,
    publicTurnRestrictions:{
      gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
      attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
      ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
      cannotUseGXAttacks:false,pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
      itemPlayLocked:false,supporterPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:0
    }
  };
}
function turnResources(){
  return {
    supporterPlayedTurn:1,retreatedTurn:false,extraTurnActive:false,
    energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
    vstarUsed:false,pokemonPlayLocked:false,
    abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
    itemPlayLocked:false,supporterPlayLocked:false,
    stadiumPlayLocked:false,toolPlayLocked:false,
    energyPlayLocked:false,specialEnergyPlayLocked:false
  };
}
function actorRequest(projected,seat){
  return {
    schema:protocol.REQUEST_SCHEMA,requestId:'reveal-1',
    sequence:1,role:'opponent',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:{
      actorSeat:seat,globalTurn:3,phase:2,
      decisionKind:'owner-prompt',
      pendingPromptType:'ChooseCardsPrompt',
      pendingOwnerDeckSearch:false,ownHand:[],
      ownPublic:publicPlayer(),opponentPublic:publicPlayer(),
      ownTurnResources:turnResources(),ownerK1:null
    },
    actionFrontier:null,prompt:projected.promptProjection,
    publicEventReceipt:null
  };
}

test('actual projector → filtered worker request → rank29 decision resolves Eri across both physical seats',()=>{
  for(const seat of [0,1]){
    const f=physical({seat,source:'Eri TEF'});
    const projected=rank29Projection.projectPrompt(f);
    const request=actorRequest(projected,seat);
    protocol.validateRequest(request);
    const policy=rank29Policy.createPolicy({
      role:'opponent',seat,policyVersion:rank29Policy.POLICY_VERSION,config:{}
    });
    const decision=policy.decide(request);
    protocol.validateDecision(decision,request);
    assert.equal(decision.kind,'select-choices');
    assert.equal(decision.tokens.length,2);
    const selected=decision.tokens.map(token=>
      request.prompt.choices.find(choice=>choice.token===token).printing);
    assert.deepEqual(selected,['Unfair Stamp TWM 165','VS Seeker PHF 109']);
    assert.equal(f.state.players[1-seat].hand.isPublic,undefined);
  }
});

test('actual projected Sidney and Skull revealed hand triggers rank29 legal choices with real protocol',()=>{
  for(const [source,names] of [
    ['Sidney FST 241',['Sky Field ROS 89','Double Colorless Energy SUM 136','Iono PAL 185']],
    ['Team Skull Grunt SUM',['Psychic Energy SVE 5','Double Colorless Energy SUM 136','Iono PAL 185']]
  ]){
    const f=physical({source,hiddenCards:names});
    const projected=rank29Projection.projectPrompt(f);
    const request=actorRequest(projected,0);
    protocol.validateRequest(request);
    const decision=rank29Policy.createPolicy({
      role:'opponent',seat:0,policyVersion:rank29Policy.POLICY_VERSION,config:{}
    }).decide(request);
    protocol.validateDecision(decision,request);
    assert.equal(decision.kind,'select-choices');
    assert.equal(decision.tokens.length,2);
    const selected=decision.tokens.map(token=>
      request.prompt.choices.find(choice=>choice.token===token).printing);
    assert.deepEqual(selected,source.startsWith('Sidney')?
      ['Double Colorless Energy SUM 136','Sky Field ROS 89']:
      ['Psychic Energy SVE 5','Double Colorless Energy SUM 136']);
  }
});
