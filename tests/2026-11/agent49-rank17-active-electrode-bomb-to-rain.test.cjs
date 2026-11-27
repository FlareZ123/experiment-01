'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const rank17=require('../../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Electrode-GX CES',R='Alolan Raichu UNM',
  P='Reversal Energy PAL',U='Unown AOR';
class EnergyCard{
  constructor(){Object.assign(this,{fullName:P,name:'Reversal Energy',
    superType:'ENERGY',energyType:'SPECIAL'})}
}
const native={EnergyCard,EnergyType:{SPECIAL:'SPECIAL',BASIC:'BASIC'},
  SuperType:{ENERGY:'ENERGY'},
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:0,BENCH:1},
  ResolvePromptAction:class{constructor(id,result){this.id=id;this.result=result}}
};
const slot=(name,extra=[])=>{
  const card=name?{fullName:name,name,superType:'POKEMON'}:null;
  return {cards:card?[card,...extra]:[],energies:{cards:extra},
    getPokemonCard(){return card}};
};
const viewSlot=(printing,energies=[],stage='Stage 1')=>({
  printing,hp:printing===E?190:printing===U?60:110,damage:0,energies,
  tools:[],specialConditions:[],abilitySuppression:[],
  printed:{stage},publicRestrictions:{}
});
function setup(seat,enemyPrizes=4){
  const owner={id:40+seat,active:slot(E),
    bench:[slot(R),slot(null),slot(null),slot(null),slot(null)],
    discard:{cards:[new EnergyCard()]},deck:{cards:[]},
    hand:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},prizes:[]};
  const enemy={id:90+seat,active:slot(U),
    bench:Array(5).fill(null).map(()=>slot(null)),
    discard:{cards:[]},deck:{cards:[]},hand:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},prizes:[]};
  const state={players:seat===0?[owner,enemy]:[enemy,owner],
    activePlayer:seat,phase:2,turn:5,prompts:[]};
  const view={actorSeat:seat,globalTurn:5,decisionKind:'owner-root',
    ownHand:[],ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0},
    ownPublic:{active:viewSlot(E,[]),bench:[viewSlot(R,[]),null,null,null,null],
      discard:[P],stadium:[],prizeCount:6,publicTurnRestrictions:{}},
    opponentPublic:{active:viewSlot(U,[],'Basic'),
      bench:[],stadium:[],prizeCount:enemyPrizes,publicTurnRestrictions:{}}
  };
  const policy=rank17.createPolicy({
    role:'opponent',seat,policyVersion:rank17.POLICY_VERSION,config:{}});
  const store={state,dispatch(){throw Error('No real pinned Store in unit test')}};
  const decide=(sequence,prompt,items=[])=>policy.decide({
    role:'opponent',seat,sequence,prompt,observation:view,
    actionFrontier:{items}
  });
  const project=(prompt,sourceCard,effectName)=>host.projectPrompt({
    prompt,state,actorSeat:seat,native,store,
    provenanceHook:{getPromptProvenance:()=>sourceCard?
      {sourceKind:'card-effect',sourceCard,effectName}:null}
  });
  const settle=(prompt,projection,decision)=>host.dispatchPromptChoice({
    store,state,prompt,actorSeat:seat,projection,decision,native,dispatch:false
  });
  return {seat,view,policy,owner,enemy,state,store,decide,project,settle};
}
function bombPrompt(f){
  class AttachEnergyPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.message='ATTACH_ENERGY_CARDS';
      this.result=undefined;this.cardList=f.owner.discard;
      this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH,native.SlotType.ACTIVE];
      this.filter={superType:'ENERGY'};
      this.options={allowCancel:false,min:0,max:5,blocked:[],
        blockedTo:[{player:0,slot:0,index:0}],differentTypes:false,
        sameTarget:false,differentTargets:false};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows.map(r=>({to:r.to,card:this.cardList.cards[r.index]}))}
    validate(rows){return rows.length<=5&&rows.every(r=>r.card?.superType==='ENERGY')}
  }
  const prompt=new AttachEnergyPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,f.owner.active.getPokemonCard(),'Extra Energy Bomb')};
}
function promotePrompt(f){
  class ChoosePokemonPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.message='CHOOSE_NEW_ACTIVE_POKEMON';
      this.result=undefined;this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH];
      this.options={min:1,max:1,allowCancel:false,blocked:[]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows.map(r=>f.owner.bench[r.index])}
    validate(rows){return rows.length===1&&rows[0]?.cards?.length>0}
  }
  const prompt=new ChoosePokemonPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,null,null)};
}
function discardPrompt(f){
  class ChooseCardsPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='CHOOSE_ENERGIES_TO_DISCARD';this.cards=f.owner.active;
      this.filter={superType:'ENERGY'};
      this.options={allowCancel:false,min:0,max:1,blocked:[]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows.map(i=>this.cards.cards[i])}
    validate(cards){return cards.length<=1&&cards.every(c=>c.superType==='ENERGY')}
  }
  const prompt=new ChooseCardsPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,f.owner.active.getPokemonCard(),'Electro Rain')};
}
function rainPrompt(f){
  class PutDamagePrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='CHOOSE_POKEMON_TO_DAMAGE';
      this.playerType=native.PlayerType.TOP_PLAYER;
      this.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
      this.damage=90;this.options={allowCancel:false,
        blocked:[],allowPlacePartialDamage:false,damageMultiple:30};
      this.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:150}
      ];
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(r){return r}
    validate(rows){return rows.reduce((n,x)=>n+x.damage,0)===90}
  }
  const prompt=new PutDamagePrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,f.owner.active.getPokemonCard(),'Electro Rain')};
}
test('one active Electrode Bomb -> Raichu promotion -> terminal Rain, both seats',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceSeat:'actor',
        sourceZone:'active',sourceIndex:0,abilityLive:true}};
    assert.deepEqual(f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'bomb'});
    const b=bombPrompt(f),bp=b.projection.promptProjection;
    assert.equal(bp.publicMetadata.selectionType,'energy-transfers');
    const bs=f.decide(2,bp);
    assert.equal(bs.kind,'select-choices');
    assert.equal(bs.tokens.length,1);
    const br=f.settle(b.prompt,b.projection,bs);
    assert.deepEqual(br.rawResult,
      [{index:0,to:{player:0,slot:1,index:0}}]);
    // Model the pinned self-KO transition (opponent takes two Prizes), then
    // the pinned check-effect reducer's exact engine-only promotion prompt.
    const attached=f.owner.discard.cards.splice(0,1)[0];
    f.owner.bench[0].cards.push(attached);
    f.owner.bench[0].energies.cards.push(attached);
    f.owner.active=slot(null);
    f.view.ownPublic.active=null;
    f.view.ownPublic.bench[0].energies=[P];
    f.view.ownPublic.discard=[];
    f.view.opponentPublic.prizeCount=2;
    const next=promotePrompt(f),np=next.projection.promptProjection;
    assert.equal(np.source.sourceKind,'engine');
    assert.equal(np.source.effectName,'CHOOSE_NEW_ACTIVE_POKEMON');
    const newActive=f.decide(3,np);
    assert.equal(newActive.kind,'select-choices');
    assert.equal(newActive.tokens.length,1);
    const promoted=f.settle(next.prompt,next.projection,newActive);
    assert.deepEqual(promoted.rawResult,[{player:0,slot:1,index:0}]);
    f.owner.active=f.owner.bench[0];f.owner.bench[0]=slot(null);
    f.view.ownPublic.active=viewSlot(R,[P]);
    f.view.ownPublic.bench[0]=null;
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(4,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'});
    const energy=discardPrompt(f),ep=energy.projection.promptProjection;
    const eDecision=f.decide(5,ep);
    assert.equal(eDecision.kind,'select-choices');
    assert.equal(eDecision.tokens.length,1);
    assert.equal(ep.choices.find(c=>c.token===eDecision.tokens[0]).printing,P);
    f.settle(energy.prompt,energy.projection,eDecision);
    f.owner.active.cards.splice(1,1);f.owner.active.energies.cards.splice(0,1);
    f.view.ownPublic.active.energies=[];
    const damage=rainPrompt(f),dp=damage.projection.promptProjection;
    assert.equal(dp.publicMetadata.selectionType,'damage-packets');
    const dDecision=f.decide(6,dp);
    assert.equal(dDecision.kind,'select-choices');
    assert.equal(dDecision.tokens.length,3);
    protocol.validateDecision(dDecision,dp,new Set());
    const hit=f.settle(damage.prompt,damage.projection,dDecision);
    assert.deepEqual(hit.rawResult,
      Array(3).fill(null).map(()=>({target:{player:1,slot:0,index:0},damage:30})));
    assert.equal(hit.decoded.reduce((n,x)=>n+x.damage,0),90);
  }
});
test('Bomb line does not execute when self-KO would award opponent final Prizes',()=>{
  for(const seat of [0,1]){
    const f=setup(seat,2);
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceSeat:'actor',
        sourceZone:'active',sourceIndex:0,abilityLive:true}};
    assert.notDeepEqual(f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'bomb'});
  }
});
