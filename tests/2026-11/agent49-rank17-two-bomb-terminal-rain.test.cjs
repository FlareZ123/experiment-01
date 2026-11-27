'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const rank17=require('../../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {aggregateDamageTargets}=require('../../simulation/twinleaf/electro-rain-damage-hook.cjs');

const E='Electrode-GX CES',R='Alolan Raichu UNM',
      V='Shadow Rider Calyrex VMAX CRE 75';
const ENERGY=[
  ...Array(4).fill('Reversal Energy PAL'),
  ...Array(4).fill('Counter Energy CIN'),
  ...Array(2).fill('Unit Energy LPM UPR')
];
class EnergyCard{
  constructor(fullName){Object.assign(this,{
    fullName,name:fullName,energyType:'SPECIAL',superType:'ENERGY'
  })}
}
const native={EnergyCard,EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},
  SuperType:{ENERGY:'ENERGY'},PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:0,BENCH:1},
  ResolvePromptAction:class{constructor(id,result){this.id=id;this.result=result}}
};
const slot=(fullName,energy=[])=>{
  const pokemon=fullName?{fullName,name:fullName,superType:'POKEMON'}:null;
  return {cards:pokemon?[pokemon,...energy]:[],
    energies:{cards:[...energy]},getPokemonCard(){return pokemon}};
};
const pub=(printing,energy=[],stage='Stage 1')=>({
  printing,hp:printing===V?320:printing===R?110:190,
  damage:0,energies:[...energy],tools:[],specialConditions:[],
  abilitySuppressions:[],printed:{stage},publicRestrictions:{}
});
const ability=(id,index)=>({
  kind:'use-ability',token:id,actorPrinting:E,
  publicMetadata:{abilityName:'Extra Energy Bomb',sourceZone:'bench',
    sourceIndex:index,sourceSeat:'actor',abilityLive:true}
});
function setup(seat,opponentPrizes=6){
  const owner={
    id:100+seat,active:slot(R),bench:[slot(E),slot(E),
      slot(null),slot(null),slot(null)],
    discard:{cards:ENERGY.map(s=>new EnergyCard(s))},
    hand:{cards:[]},deck:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
  const foe={
    id:200+seat,active:slot(V),bench:[slot(V),slot(null),
      slot(null),slot(null),slot(null)],
    discard:{cards:[]},deck:{cards:[]},hand:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
  const state={players:seat===0?[owner,foe]:[foe,owner],
    phase:2,turn:5,activePlayer:seat,prompts:[]};
  const view={
    actorSeat:seat,globalTurn:5,ownHand:[],
    ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0},
    ownPublic:{active:pub(R),bench:[pub(E),pub(E),null,null,null],
      discard:[...ENERGY],stadium:[],prizeCount:6,
      publicTurnRestrictions:{}},
    opponentPublic:{active:pub(V,[],'VMAX'),
      bench:[pub(V,[],'VMAX'),null,null,null,null],
      stadium:[],prizeCount:opponentPrizes,publicTurnRestrictions:{}}
  };
  const policy=rank17.createPolicy({role:'opponent',seat,
    policyVersion:rank17.POLICY_VERSION,config:{}});
  const store={state,dispatch(){throw Error('no native Store in this unit test')}};
  const decide=(sequence,prompt,items=[])=>policy.decide({
    role:'opponent',seat,sequence,observation:view,prompt,
    actionFrontier:{items}
  });
  const project=(prompt,sourceCard,effectName)=>host.projectPrompt({
    prompt,state,actorSeat:seat,native,store,
    provenanceHook:{getPromptProvenance:()=>({
      sourceKind:'card-effect',sourceCard,effectName
    })}
  });
  const settle=(prompt,projection,decision)=>host.dispatchPromptChoice({
    store,prompt,state,actorSeat:seat,projection,decision,
    native,dispatch:false
  });
  return {owner,foe,view,policy,state,store,seat,decide,project,settle};
}
function bombPrompt(f,sourceIndex){
  class AttachEnergyPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='ATTACH_ENERGY_CARDS';this.cardList=f.owner.discard;
      this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH,native.SlotType.ACTIVE];
      this.filter={superType:'ENERGY'};
      // The existing paper hook, not raw Twinleaf, sets this minimum.
      this.options={min:Math.min(5,f.owner.discard.cards.length),
        max:5,allowCancel:false,blocked:[],differentTypes:false,
        sameTarget:false,differentTargets:false,
        blockedTo:[
          ...(f.owner.active.getPokemonCard()?.fullName===E?
            [{player:0,slot:0,index:0}]:[]),
          ...[0,1].filter(i=>f.owner.bench[i].getPokemonCard()?.fullName===E)
            .map(index=>({player:0,slot:1,index}))
        ]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(raw){return raw.map(x=>({
      card:this.cardList.cards[x.index],to:x.to
    }))}
    validate(decoded){return decoded.length===5&&
      decoded.every(x=>x.card?.superType==='ENERGY')}
  }
  const prompt=new AttachEnergyPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,
    sourceIndex==='active'?f.owner.active.getPokemonCard():
      f.owner.bench[sourceIndex].getPokemonCard(),'Extra Energy Bomb')};
}
function chooseEnergy(f){
  class ChooseCardsPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='CHOOSE_ENERGIES_TO_DISCARD';
      this.cards=f.owner.active;this.filter={superType:'ENERGY'};
      this.options={min:0,max:10,allowCancel:false,blocked:[]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(indices){return indices.map(i=>this.cards.cards[i])}
    validate(decoded){return decoded.length<=10&&
      decoded.every(x=>x.superType==='ENERGY')}
  }
  const prompt=new ChooseCardsPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,
    f.owner.active.getPokemonCard(),'Electro Rain')};
}
function damagePrompt(f){
  class PutDamagePrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='CHOOSE_POKEMON_TO_DAMAGE';this.damage=660;
      this.playerType=native.PlayerType.TOP_PLAYER;
      this.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
      this.options={allowCancel:false,blocked:[],
        damageMultiple:30,allowPlacePartialDamage:false};
      this.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:900},
        {target:{player:1,slot:1,index:0},damage:900}
      ];
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows}
    validate(rows){return rows.reduce((n,x)=>n+x.damage,0)===660&&
      rows.every(x=>x.target.player===1)}
  }
  const prompt=new PutDamagePrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,
    f.owner.active.getPokemonCard(),'Electro Rain')};
}
function settleBomb(f,index,sequence){
  const b=bombPrompt(f,index),p=b.projection.promptProjection;
  assert.equal(p.publicMetadata.selectionType,'energy-transfers');
  assert.equal(p.publicMetadata.minimumCount,5);
  protocol.validatePrompt(p,f.seat);
  const decision=f.decide(sequence,p);
  assert.equal(decision.kind,'select-choices');
  assert.equal(decision.tokens.length,5);
  protocol.validateDecision(decision,p,new Set());
  const settled=f.settle(b.prompt,b.projection,decision);
  assert.equal(settled.rawResult.length,5);
  assert.equal(new Set(settled.rawResult.map(x=>x.index)).size,5);
  const recipientIsBenched=f.owner.active.getPokemonCard()?.fullName===E;
  assert.ok(settled.rawResult.every(x=>
    x.to.slot===(recipientIsBenched?native.SlotType.BENCH:native.SlotType.ACTIVE)&&
    x.to.index===0));
  const indices=settled.rawResult.map(x=>x.index);
  const selected=indices.map(i=>f.owner.discard.cards[i]);
  for(const i of indices.sort((a,b)=>b-a))f.owner.discard.cards.splice(i,1);
  const recipient=recipientIsBenched?f.owner.bench[0]:f.owner.active;
  const visible=recipientIsBenched?f.view.ownPublic.bench[0]:
    f.view.ownPublic.active;
  for(const energy of selected){
    recipient.energies.cards.push(energy);
    recipient.cards.push(energy);
    visible.energies.push(energy.fullName);
  }
  if(index==='active'){
    f.owner.active=slot(null);
    f.view.ownPublic.active=null;
  }else{
    f.owner.bench[index]=slot(null);
    f.view.ownPublic.bench[index]=null;
  }
  f.view.ownPublic.discard=f.owner.discard.cards.map(x=>x.fullName);
  f.view.opponentPublic.prizeCount-=2;
}
test('two separate paper-corrected Bombs enable 22-hit Rain against two VMAX, both seats',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    const root=[ability('bomb0',0),ability('bomb1',1),
      {kind:'pass',token:'pass'}];
    assert.deepEqual(f.decide(1,null,root),
      {kind:'select-action',token:'bomb0'});
    settleBomb(f,0,2);
    assert.equal(f.view.opponentPublic.prizeCount,4);
    // Crucial: this *actual new root* recomputes a one-Bomb terminal line
    // after the first self-KO, rather than trusting an earlier imagined hand.
    assert.deepEqual(f.decide(3,null,root.slice(1)),
      {kind:'select-action',token:'bomb1'});
    settleBomb(f,1,4);
    assert.equal(f.view.opponentPublic.prizeCount,2);
    assert.equal(f.view.ownPublic.active.energies.length,10);
    assert.equal(f.view.ownPublic.discard.length,0);
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(5,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'});
    const cardPrompt=chooseEnergy(f),cp=cardPrompt.projection.promptProjection;
    assert.equal(cp.publicMetadata.selectionType,'card-combination');
    const choose=f.decide(6,cp);
    assert.equal(choose.kind,'select-choices');
    assert.equal(choose.tokens.length,10);
    protocol.validateDecision(choose,cp,new Set());
    const discarded=f.settle(cardPrompt.prompt,cardPrompt.projection,choose);
    assert.equal(discarded.decoded.length,10);
    assert.ok(discarded.decoded.every(x=>x instanceof EnergyCard));
    f.owner.active.cards.splice(1,10);
    f.owner.active.energies.cards=[];
    f.view.ownPublic.active.energies=[];
    const damage=damagePrompt(f),dp=damage.projection.promptProjection;
    assert.equal(dp.publicMetadata.selectionType,'damage-packets');
    assert.equal(dp.publicMetadata.minimumCount,22);
    assert.equal(dp.choices.length,44);
    const hits=f.decide(7,dp);
    assert.equal(hits.kind,'select-choices');
    assert.equal(hits.tokens.length,22);
    protocol.validateDecision(hits,dp,new Set());
    const result=f.settle(damage.prompt,damage.projection,hits);
    assert.equal(result.rawResult.length,22);
    const grouped=aggregateDamageTargets(result.rawResult);
    assert.deepEqual(grouped,[
      {target:{player:1,slot:0,index:0},damage:330},
      {target:{player:1,slot:1,index:0},damage:330}
    ]);
    assert.ok(grouped.every(x=>x.damage>=320));
  }
});
test('two-Bomb branch refuses opponent fatal Prize configuration and missing second source',()=>{
  for(const seat of [0,1]){
    const bad=setup(seat,4);
    const all=[ability('bomb0',0),ability('bomb1',1),
      {kind:'pass',token:'pass'}];
    assert.notDeepEqual(bad.decide(1,null,all),
      {kind:'select-action',token:'bomb0'});
    const missing=setup(seat,6);
    assert.notDeepEqual(missing.decide(1,null,all.slice(0,1).concat(all.slice(2))),
      {kind:'select-action',token:'bomb0'});
    const stale=setup(seat,6);
    assert.equal(stale.decide(1,null,all).token,'bomb0');
    const bp=bombPrompt(stale,0).projection.promptProjection;
    const wrong=stale.decide(4,bp);
    assert.equal(wrong.kind,'abstain');
    assert.equal(wrong.reasonCode,'UNTRUSTED_PROMPT_SOURCE');
  }
});

function promotePrompt(f){
  class ChoosePokemonPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.result=undefined;
      this.message='CHOOSE_NEW_ACTIVE_POKEMON';
      this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH];
      this.options={allowCancel:false,min:1,max:1,blocked:[]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows.map(x=>f.owner.bench[x.index])}
    validate(rows){return rows.length===1&&
      f.owner.bench[rows[0].index]?.getPokemonCard()!=null}
  }
  const prompt=new ChoosePokemonPrompt();
  f.state.prompts=[prompt];
  const projection=host.projectPrompt({prompt,state:f.state,
    actorSeat:f.seat,native,store:f.store,
    provenanceHook:{getPromptProvenance:()=>null}});
  return {prompt,projection};
}
test('Active Electrode first: engine self-KO promotion then second Benched Bomb and 22 packets',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    f.owner.active=slot(E);
    f.owner.bench[0]=slot(R);
    f.view.ownPublic.active=pub(E);
    f.view.ownPublic.bench[0]=pub(R);
    const actions=[
      {kind:'use-ability',token:'bomb-active',actorPrinting:E,
        publicMetadata:{abilityName:'Extra Energy Bomb',
          sourceZone:'active',sourceIndex:0,abilityLive:true}},
      ability('bomb-bench',1),
      {kind:'pass',token:'pass'}
    ];
    assert.deepEqual(f.decide(1,null,actions),
      {kind:'select-action',token:'bomb-active'});
    settleBomb(f,'active',2);
    assert.equal(f.view.opponentPublic.prizeCount,4);
    assert.equal(f.view.ownPublic.active,null);
    assert.equal(f.view.ownPublic.bench[0].energies.length,5);
    const promote=promotePrompt(f),pp=promote.projection.promptProjection;
    assert.equal(pp.source.sourceKind,'engine');
    assert.equal(pp.source.effectName,'CHOOSE_NEW_ACTIVE_POKEMON');
    assert.equal(pp.publicMetadata.selectionType,'pokemon');
    const promoteDecision=f.decide(3,pp);
    assert.equal(promoteDecision.kind,'select-choices');
    assert.equal(promoteDecision.tokens.length,1);
    const promoted=f.settle(promote.prompt,promote.projection,promoteDecision);
    assert.deepEqual(promoted.rawResult,[{player:0,slot:1,index:0}]);
    f.owner.active=f.owner.bench[0];
    f.owner.bench[0]=slot(null);
    f.view.ownPublic.active=f.view.ownPublic.bench[0];
    f.view.ownPublic.bench[0]=null;
    assert.deepEqual(f.decide(4,null,actions.slice(1)),
      {kind:'select-action',token:'bomb-bench'});
    settleBomb(f,1,5);
    assert.equal(f.view.opponentPublic.prizeCount,2);
    assert.equal(f.view.ownPublic.active.energies.length,10);
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(6,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'});
    const cardPrompt=chooseEnergy(f);
    const pay=f.decide(7,cardPrompt.projection.promptProjection);
    assert.equal(pay.kind,'select-choices');
    assert.equal(pay.tokens.length,10);
    f.settle(cardPrompt.prompt,cardPrompt.projection,pay);
    f.owner.active.cards.splice(1,10);f.owner.active.energies.cards=[];
    f.view.ownPublic.active.energies=[];
    const dmg=damagePrompt(f),dp=dmg.projection.promptProjection;
    assert.equal(dp.publicMetadata.minimumCount,22);
    const hits=f.decide(8,dp);
    assert.equal(hits.kind,'select-choices');
    assert.equal(hits.tokens.length,22);
    const settled=f.settle(dmg.prompt,dmg.projection,hits);
    assert.deepEqual(aggregateDamageTargets(settled.rawResult),[
      {target:{player:1,slot:0,index:0},damage:330},
      {target:{player:1,slot:1,index:0},damage:330}
    ]);
  }
});
