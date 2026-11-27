'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const native={
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:0,BENCH:1},
  ResolvePromptAction:class{constructor(id,result){this.id=id;this.result=result}}
};
function slot(name){
  const card=name?{fullName:name,name}:null;
  return {cards:card?[card]:[],getPokemonCard(){return card}};
}
function player(id,actor=false){
  return {
    id,active:slot(actor?'Alolan Raichu UNM':'Shadow Rider Calyrex VMAX CRE'),
    bench:actor?Array(5).fill(null).map(()=>slot(null)):
      [slot('Dedenne-GX UNB'),slot(null),slot(null),slot(null),slot(null)],
    hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
}
function fixture(seat,hitCount=6){
  const actor=player(17+seat,true),foe=player(91+seat);
  const state={players:seat===0?[actor,foe]:[foe,actor],
    phase:2,turn:8,prompts:[]};
  const source=actor.active.getPokemonCard();
  class PutDamagePrompt {
    constructor(){
      this.id=1;this.playerId=actor.id;this.result=undefined;
      this.message='CHOOSE_POKEMON_TO_DAMAGE';
      this.playerType=native.PlayerType.TOP_PLAYER;
      this.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
      this.damage=30*hitCount;
      this.options={allowCancel:false,blocked:[],
        allowPlacePartialDamage:false,damageMultiple:30};
      this.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:320+this.damage},
        {target:{player:1,slot:1,index:0},damage:160+this.damage}
      ];
    }
    getPerspectivePlayerId(){return actor.id}
    decode(raw){return raw}
    validate(result){
      // Pinned PutDamagePrompt validates aggregate damage/targets but not
      // packet ordinals, individual 30 chunks, or duplicate physical slots.
      return result?.reduce((n,r)=>n+r.damage,0)===this.damage&&
        result.every(r=>r.target?.player===1&&[0,1].includes(r.target.slot));
    }
  }
  const prompt=new PutDamagePrompt();
  state.prompts.push(prompt);
  const store={state,dispatch(){throw Error('native Store execution not enabled in unit test')}};
  const provenance={sourceKind:'card-effect',sourceCard:source,effectName:'Electro Rain'};
  function project(){
    return host.projectPrompt({prompt,state,actorSeat:seat,native,store,
      provenanceHook:{getPromptProvenance:()=>provenance}});
  }
  const projection=project();
  const choose=(packet,zone,index=0)=>projection.promptProjection.choices.find(c=>
    c.publicMetadata.selectionIndex===packet&&
    c.publicMetadata.targetZone===zone&&
    (zone==='active'||c.publicMetadata.benchIndex===index));
  function dispatch(tokens){
    return host.dispatchPromptChoice({store,prompt,state,actorSeat:seat,
      projection,decision:{kind:'select-choices',tokens},native,dispatch:false});
  }
  return {seat,actor,foe,prompt,state,store,provenance,projection,
    project,choose,dispatch};
}
test('UNM Electro Rain: six physical packets may all hit same Pokémon, both seats',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const projected=f.projection.promptProjection;
    assert.equal(projected.source.sourcePrinting,'Alolan Raichu UNM');
    assert.equal(projected.source.effectName,'Electro Rain');
    assert.equal(projected.publicMetadata.selectionType,'damage-packets');
    assert.equal(projected.publicMetadata.minimumCount,6);
    assert.equal(projected.publicMetadata.maximumCount,6);
    assert.equal(projected.choices.length,12);
    assert.ok(projected.choices.every(x=>x.kind==='pokemon'&&
      x.publicMetadata.ownerSeat==='opponent'&&
      x.publicMetadata.amount===30));
    assert.doesNotThrow(()=>protocol.validatePrompt(projected,seat));
    const tokens=[0,1,2,3,4,5].map(packet=>f.choose(packet,'active').token);
    const done=f.dispatch(tokens);
    assert.equal(done.rawResult.length,6);
    assert.deepEqual(done.rawResult,
      Array(6).fill(null).map(()=>({target:{player:1,slot:0,index:0},damage:30})));
    assert.equal(done.decoded.reduce((n,x)=>n+x.damage,0),180);
    assert.deepEqual(done.action.result,done.decoded);
  }
});
test('packet index must not be reused even if pinned native validator accepts total damage',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,3);
    const tokens=[
      f.choose(0,'active').token,
      f.choose(0,'bench',0).token,
      f.choose(1,'active').token
    ];
    assert.equal(f.prompt.validate(tokens.map(t=>f.projection.choiceByToken.get(t))),true);
    assert.throws(()=>f.dispatch(tokens),/Electro Rain may not reuse a physical damage packet/);
  }
});
test('targets must remain occupied and source/shape must match pinned UNM',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,2);
    const tokens=[f.choose(0,'bench',0).token,f.choose(1,'active').token];
    const targetToken=tokens[0];
    const mapped=f.projection.choiceByToken.get(targetToken);
    f.projection.choiceByToken.set(targetToken,{
      packetIndex:0,target:{player:1,slot:1,index:4},damage:30
    });
    assert.throws(()=>f.dispatch(tokens),/Electro Rain packet target must remain occupied/);
    f.projection.choiceByToken.set(targetToken,mapped);
    f.prompt.options.damageMultiple=10;
    assert.throws(()=>f.project(),/Unsupported pinned Alolan Raichu Electro Rain packet prompt/);
    f.prompt.options.damageMultiple=30;
    f.provenance.effectName='Other Attack';
    assert.throws(()=>f.project(),/Unsupported pinned Alolan Raichu Electro Rain packet prompt/);
  }
});
test('large legal-looking packet frontier fails closed rather than truncating',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,6);
    f.prompt.damage=300*10;
    assert.throws(()=>f.project(),/Electro Rain packet target frontier is not bounded/);
  }
});
