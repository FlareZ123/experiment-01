'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const rank17=require('../../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const RAI='Alolan Raichu UNM',REV='Reversal Energy PAL',UNOWN='Unown AOR';
class EnergyCard{
  constructor(name){Object.assign(this,{fullName:name,name:'Reversal Energy',
    superType:'ENERGY',energyType:'SPECIAL'})}
}
const native={
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},SlotType:{ACTIVE:0,BENCH:1},
  EnergyCard,
  ResolvePromptAction:class{constructor(id,result){this.id=id;this.result=result}}
};
function slot(name,extra=[]){
  const card=name?{name:name.split(' ').slice(0,-1).join(' '),
    fullName:name,superType:'POKEMON'}:null;
  return {cards:card?[card,...extra]:[],energies:{cards:extra},
    getPokemonCard(){return card}};
}
function setup(seat){
  const ownPlayer={
    id:100+seat,active:slot(RAI,[new EnergyCard(REV)]),
    bench:Array.from({length:5},()=>slot(null)),
    hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
  const rival={
    id:200+seat,active:slot(UNOWN),
    bench:Array.from({length:5},()=>slot(null)),
    hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
  const state={players:seat===0?[ownPlayer,rival]:[rival,ownPlayer],
    activePlayer:seat,phase:2,turn:5,prompts:[]};
  const view={
    actorSeat:seat,globalTurn:5,decisionKind:'owner-root',
    ownHand:[],ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0},
    ownPublic:{active:{printing:RAI,hp:110,damage:0,energies:[REV],
      tools:[],specialConditions:[],printed:{stage:'Stage 1'},
      publicRestrictions:{}},bench:[],stadium:[],discard:[],prizeCount:6,
      publicTurnRestrictions:{}},
    opponentPublic:{active:{printing:UNOWN,hp:60,damage:0,
      energies:[],tools:[],specialConditions:[],printed:{stage:'Basic'},
      publicRestrictions:{}},bench:[],stadium:[],prizeCount:4,
      publicTurnRestrictions:{}}
  };
  const policy=rank17.createPolicy({
    role:'opponent',seat,policyVersion:rank17.POLICY_VERSION,config:{}});
  const root={
    role:'opponent',seat,sequence:1,prompt:null,observation:view,
    actionFrontier:{items:[
      {kind:'attack',token:'rain',actorPrinting:RAI,attackName:'Electro Rain',
        publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]}
  };
  const store={state,dispatch(){throw Error('No native Store execution in this test')}};
  return {seat,ownPlayer,rival,state,view,policy,root,store};
}
function energyPrompt(f){
  class ChooseCardsPrompt{
    constructor(){
      this.playerId=f.ownPlayer.id;this.id=1;this.result=undefined;
      this.message='CHOOSE_ENERGIES_TO_DISCARD';this.cards=f.ownPlayer.active;
      this.filter={superType:'ENERGY'};
      this.options={allowCancel:false,min:0,max:1,blocked:[]};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(indices){return indices.map(index=>this.cards.cards[index])}
    validate(cards){return cards.length<=1&&cards.every(c=>c.superType==='ENERGY')}
  }
  const prompt=new ChooseCardsPrompt();
  f.state.prompts=[prompt];
  const sourceCard=f.ownPlayer.active.getPokemonCard();
  const projection=host.projectPrompt({
    prompt,state:f.state,actorSeat:f.seat,native,store:f.store,
    provenanceHook:{getPromptProvenance:()=>({
      sourceKind:'card-effect',sourceCard,effectName:'Electro Rain'
    })}
  });
  return {prompt,projection};
}
function damagePrompt(f,units=3){
  const target={player:1,slot:0,index:0};
  class PutDamagePrompt{
    constructor(){
      this.playerId=f.ownPlayer.id;this.id=1;this.result=undefined;
      this.message='CHOOSE_POKEMON_TO_DAMAGE';
      this.playerType=native.PlayerType.TOP_PLAYER;
      this.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
      this.damage=units*30;
      this.maxAllowedDamage=[{target,damage:60+this.damage}];
      this.options={allowCancel:false,blocked:[],
        allowPlacePartialDamage:false,damageMultiple:30};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(damage){return damage}
    validate(rows){return rows.reduce((n,x)=>n+x.damage,0)===this.damage&&
      rows.every(x=>x.target.player===1)}
  }
  const prompt=new PutDamagePrompt();
  f.state.prompts=[prompt];
  const sourceCard=f.ownPlayer.active.getPokemonCard();
  const projection=host.projectPrompt({
    prompt,state:f.state,actorSeat:f.seat,native,store:f.store,
    provenanceHook:{getPromptProvenance:()=>({
      sourceKind:'card-effect',sourceCard,effectName:'Electro Rain'
    })}
  });
  return {prompt,projection};
}
test('rank17 direct terminal Rain root -> discard Reversal -> 3 packet native result, both seats',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    assert.deepEqual(f.policy.decide(f.root),{kind:'select-action',token:'rain'});
    const energy=energyPrompt(f),e=energy.projection.promptProjection;
    assert.equal(e.publicMetadata.selectionType,'card-combination');
    const choice=f.policy.decide({
      role:'opponent',seat,sequence:2,prompt:e,
      observation:f.view,actionFrontier:{items:[]}
    });
    assert.equal(choice.kind,'select-choices');
    assert.equal(choice.tokens.length,1);
    assert.equal(e.choices.find(x=>x.token===choice.tokens[0]).printing,REV);
    protocol.validatePrompt(e,seat);
    protocol.validateDecision(choice,e,new Set());
    const dropped=host.dispatchPromptChoice({
      store:f.store,state:f.state,prompt:energy.prompt,actorSeat:seat,
      projection:energy.projection,decision:choice,native,dispatch:false
    });
    assert.equal(dropped.decoded.length,1);
    assert.ok(dropped.decoded[0] instanceof EnergyCard);
    f.ownPlayer.active.cards.splice(1,1);
    f.ownPlayer.active.energies.cards.splice(0,1);
    f.view.ownPublic.active.energies=[];
    const damage=damagePrompt(f,3),d=damage.projection.promptProjection;
    assert.equal(d.publicMetadata.selectionType,'damage-packets');
    const hits=f.policy.decide({role:'opponent',seat,sequence:3,
      prompt:d,observation:f.view,actionFrontier:{items:[]}});
    assert.equal(hits.kind,'select-choices');
    assert.equal(hits.tokens.length,3);
    protocol.validatePrompt(d,seat);
    protocol.validateDecision(hits,d,new Set());
    const placed=host.dispatchPromptChoice({
      store:f.store,state:f.state,prompt:damage.prompt,actorSeat:seat,
      projection:damage.projection,decision:hits,native,dispatch:false
    });
    assert.equal(placed.rawResult.length,3);
    assert.deepEqual(placed.rawResult,Array(3).fill(null).map(()=>({
      target:{player:1,slot:0,index:0},damage:30
    })));
    assert.equal(placed.decoded.reduce((n,x)=>n+x.damage,0),90);
  }
});
test('rank17 direct Rain refuses unsupported matchups, false energy payability and stale continuation',()=>{
  for(const seat of [0,1]){
    const p=setup(seat);
    p.root.actionFrontier.items[0].publicMetadata.attackCostPayable=false;
    assert.notDeepEqual(p.policy.decide(p.root),{kind:'select-action',token:'rain'});
    const f=setup(seat);
    assert.equal(f.policy.decide(f.root).token,'rain');
    const energy=energyPrompt(f);
    const bad=f.policy.decide({role:'opponent',seat,sequence:4,
      prompt:energy.projection.promptProjection,
      observation:f.view,actionFrontier:{items:[]}});
    assert.equal(bad.kind,'abstain');
    assert.equal(bad.reasonCode,'UNTRUSTED_PROMPT_SOURCE');
    const q=setup(seat);
    q.view.opponentPublic.active.tools=['Unknown protection XYZ'];
    assert.notDeepEqual(q.policy.decide(q.root),{kind:'select-action',token:'rain'});
  }
});
