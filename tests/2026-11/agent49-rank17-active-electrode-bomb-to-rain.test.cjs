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
function bombPrompt(f,sourceZone='active',sourceIndex=0){
  class AttachEnergyPrompt{
    constructor(){
      this.id=1;this.playerId=f.owner.id;this.message='ATTACH_ENERGY_CARDS';
      this.result=undefined;this.cardList=f.owner.discard;
      this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH,native.SlotType.ACTIVE];
      this.filter={superType:'ENERGY'};
      this.options={allowCancel:false,min:0,max:5,blocked:[],
        blockedTo:[{player:0,slot:sourceZone==='active'?0:1,index:sourceIndex}],differentTypes:false,
        sameTarget:false,differentTargets:false};
    }
    getPerspectivePlayerId(){return this.playerId}
    decode(rows){return rows.map(r=>({to:r.to,card:this.cardList.cards[r.index]}))}
    validate(rows){return rows.length<=5&&rows.every(r=>r.card?.superType==='ENERGY')}
  }
  const prompt=new AttachEnergyPrompt();f.state.prompts=[prompt];
  const sourceCard=sourceZone==='active'?f.owner.active.getPokemonCard():
    f.owner.bench[sourceIndex].getPokemonCard();
  return {prompt,projection:f.project(prompt,sourceCard,'Extra Energy Bomb')};
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
    validate(cards){return cards.length<=this.options.max&&cards.every(c=>c.superType==='ENERGY')}
  }
  const prompt=new ChooseCardsPrompt();f.state.prompts=[prompt];
  return {prompt,projection:f.project(prompt,f.owner.active.getPokemonCard(),'Electro Rain')};
}
function rainPrompt(f,configure=()=>{}){
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
    validate(rows){return rows.reduce((n,x)=>n+x.damage,0)===this.damage}
  }
  const prompt=new PutDamagePrompt();configure(prompt);f.state.prompts=[prompt];
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

test('one Benched Electrode Bomb -> funded Active Raichu -> Rain, no promotion required',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    f.owner.active=slot(R);f.owner.bench[0]=slot(E);
    f.view.ownPublic.active=viewSlot(R);
    f.view.ownPublic.bench[0]=viewSlot(E);
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceSeat:'actor',
        sourceZone:'bench',sourceIndex:0,abilityLive:true}};
    assert.deepEqual(f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'bomb'});
    const b=bombPrompt(f,'bench'),bp=b.projection.promptProjection;
    assert.equal(bp.publicMetadata.selectionType,'energy-transfers');
    const bs=f.decide(2,bp);
    assert.equal(bs.kind,'select-choices');
    const br=f.settle(b.prompt,b.projection,bs);
    assert.deepEqual(br.rawResult,[{index:0,to:{player:0,slot:0,index:0}}]);
    const attached=f.owner.discard.cards.splice(0,1)[0];
    f.owner.active.cards.push(attached);
    f.owner.active.energies.cards.push(attached);
    f.owner.bench[0]=slot(null);
    f.view.ownPublic.active.energies=[P];
    f.view.ownPublic.bench[0]=null;
    f.view.ownPublic.discard=[];
    f.view.opponentPublic.prizeCount=2;
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(3,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'});
    const e=discardPrompt(f),ep=e.projection.promptProjection;
    const es=f.decide(4,ep);
    assert.equal(es.kind,'select-choices');
    assert.equal(es.tokens.length,1);
    f.settle(e.prompt,e.projection,es);
    f.owner.active.cards.splice(1,1);
    f.owner.active.energies.cards.splice(0,1);
    f.view.ownPublic.active.energies=[];
    const d=rainPrompt(f),dp=d.projection.promptProjection;
    const ds=f.decide(5,dp);
    assert.equal(ds.kind,'select-choices');
    assert.equal(ds.tokens.length,3);
    const settlement=f.settle(d.prompt,d.projection,ds);
    assert.equal(settlement.rawResult.length,3);
    assert.ok(settlement.rawResult.every(x=>x.damage===30&&
      x.target.slot===0));
  }
});

test('CES48 native min:0 and reversible paper-hook min:mandatory both project identically',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    const b=bombPrompt(f),p=b.prompt;
    const first=b.projection.promptProjection;
    assert.equal(first.publicMetadata.minimumCount,1);
    assert.equal(first.publicMetadata.maximumCount,1);
    // simulation/twinleaf/electrode-gx-energy-hook.cjs mutates this exact
    // native prompt options.min to the available-energy mandatory count.
    p.options.min=1;
    const patched=f.project(p,f.owner.active.getPokemonCard(),'Extra Energy Bomb');
    const projected=patched.promptProjection;
    assert.equal(projected.publicMetadata.minimumCount,1);
    assert.equal(projected.publicMetadata.maximumCount,1);
    assert.deepEqual(projected.choices.map(x=>x.publicMetadata),
      first.choices.map(x=>x.publicMetadata));
    // Extra Energy Bomb allows *neither* an arbitrary smaller positive
    // minimum nor one larger than the live eligible discard.
    p.options.min=2;
    assert.throws(()=>f.project(p,f.owner.active.getPokemonCard(),'Extra Energy Bomb'),
      /Unsupported pinned Electrode-GX Extra Energy Bomb prompt shape/);
  }
});
test('Electro Rain packet output is compatible with existing target aggregation paper hook',()=>{
  const {aggregateDamageTargets}=require('../../simulation/twinleaf/electro-rain-damage-hook.cjs');
  for(const seat of [0,1]){
    const f=setup(seat);
    f.owner.active=slot(R,[new EnergyCard()]);
    // First construct the native-shaped prompt for a one-Pokemon board,
    // then expand the same test state and target allowance together.
    const d=rainPrompt(f);
    f.enemy.bench[0]=slot('Dedenne-GX UNB');
    d.prompt.maxAllowedDamage.push({
      target:{player:1,slot:1,index:0},damage:200
    });
    const projection=f.project(d.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const p=projection.promptProjection;
    assert.equal(p.choices.length,6);
    const token=(ordinal,zone)=>p.choices.find(c=>
      c.publicMetadata.selectionIndex===ordinal&&
      c.publicMetadata.targetZone===zone)?.token;
    const decision={kind:'select-choices',tokens:[
      token(0,'active'),token(1,'bench'),token(2,'bench')
    ]};
    const settled=f.settle(d.prompt,projection,decision);
    assert.equal(settled.rawResult.length,3);
    const grouped=aggregateDamageTargets(settled.rawResult);
    assert.deepEqual(grouped,[
      {target:{player:1,slot:0,index:0},damage:30},
      {target:{player:1,slot:1,index:0},damage:60}
    ]);
    assert.equal(grouped.reduce((n,x)=>n+x.damage,0),90);
  }
});



test('two distinct Benched Electrode Bombs replan after first self-KO and deliver terminal Rain packets',()=>{
  const C='Counter Energy CIN',T='Shadow Rider Calyrex VMAX CRE';
  class CounterCard extends EnergyCard{
    constructor(){super();this.fullName=C;this.name='Counter Energy';}
  }
  for(const seat of [0,1]){
    const f=setup(seat,6);
    f.owner.active=slot(R);
    f.owner.bench[0]=slot(E);f.owner.bench[1]=slot(E);
    f.owner.discard.cards=[...Array.from({length:4},()=>new EnergyCard()),
      ...Array.from({length:4},()=>new CounterCard())];
    f.enemy.active=slot(T);f.enemy.bench[0]=slot(T);
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.ownPublic.active=viewSlot(R);
    f.view.ownPublic.bench=[viewSlot(E),viewSlot(E),null,null,null];
    f.view.ownPublic.discard=f.owner.discard.cards.map(c=>c.fullName);
    f.view.opponentPublic.active=vmax();
    f.view.opponentPublic.bench=[vmax()];
    f.view.opponentPublic.prizeCount=6;
    const source=index=>({kind:'use-ability',token:'bomb-'+index,actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceSeat:'actor',
        sourceZone:'bench',sourceIndex:index,abilityLive:true}});
    const first=f.decide(1,null,[source(0),source(1),{kind:'pass',token:'pass'}]);
    assert.deepEqual(first,{kind:'select-action',token:'bomb-0'});
    const attach=(sourceIndex,seq)=>{
      const b=bombPrompt(f,'bench',sourceIndex);
      const p=b.projection.promptProjection;
      const decision=f.decide(seq,p);
      assert.equal(decision.kind,'select-choices');
      protocol.validateDecision(decision,p,new Set());
      const settled=f.settle(b.prompt,b.projection,decision);
      const original=f.owner.discard.cards;
      const used=new Set(settled.rawResult.map(x=>x.index));
      const moved=settled.rawResult.map(x=>original[x.index]);
      assert.equal(used.size,moved.length,'one physical card per transfer');
      for(const [i,card] of original.entries())if(used.has(i)){
        f.owner.active.cards.push(card);f.owner.active.energies.cards.push(card);
      }
      f.owner.discard.cards=original.filter((_,i)=>!used.has(i));
      f.view.ownPublic.active.energies=f.owner.active.energies.cards.map(x=>x.fullName);
      f.view.ownPublic.discard=f.owner.discard.cards.map(x=>x.fullName);
      f.owner.bench[sourceIndex]=slot(null);
      f.view.ownPublic.bench[sourceIndex]=null;
      f.view.opponentPublic.prizeCount-=2;
      return moved.length;
    };
    assert.equal(attach(0,2),5);
    const second=f.decide(3,null,[source(1),{kind:'pass',token:'pass'}]);
    assert.deepEqual(second,{kind:'select-action',token:'bomb-1'},
      'the second self-KO must be selected from the actual post-first-KO actor state');
    assert.equal(attach(1,4),3);
    assert.equal(f.view.opponentPublic.prizeCount,2);
    assert.equal(f.owner.active.energies.cards.length,8);
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(5,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'});
    const e=discardPrompt(f);e.prompt.options.max=8;
    const ep=f.project(e.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const es=f.decide(6,ep.promptProjection);
    assert.equal(es.kind,'select-choices');
    assert.equal(es.tokens.length,7,'18 Lightning units require seven chosen special Energy cards');
    protocol.validateDecision(es,ep.promptProjection,new Set());
    const paid=f.settle(e.prompt,ep,es);
    assert.equal(paid.rawResult.length,7);
    const used=new Set(paid.rawResult);
    f.owner.active.cards=f.owner.active.cards.filter((_,i)=>!used.has(i));
    f.owner.active.energies.cards=f.owner.active.cards.slice(1);
    f.view.ownPublic.active.energies=f.owner.active.energies.cards.map(c=>c.fullName);
    const d=rainPrompt(f,p=>{
      p.damage=540;
      p.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:540},
        {target:{player:1,slot:1,index:0},damage:540}
      ];
    });
    const dp=d.projection;
    const ds=f.decide(7,dp.promptProjection);
    assert.equal(ds.kind,'select-choices');
    assert.equal(ds.tokens.length,18);
    protocol.validateDecision(ds,dp.promptProjection,new Set());
    const damage=f.settle(d.prompt,dp,ds);
    assert.equal(damage.rawResult.length,18);
    assert.equal(damage.rawResult.reduce((n,x)=>n+x.damage,0),540);
    assert.ok(damage.rawResult.some(x=>x.target.slot===0));
    assert.ok(damage.rawResult.some(x=>x.target.slot===1));
  }
});

test('two-Bomb window refuses to initiate if opponent would win from double self-KO',()=>{
  const T='Shadow Rider Calyrex VMAX CRE',C='Counter Energy CIN';
  for(const seat of [0,1]){
    const f=setup(seat,4);
    f.view.ownPublic.active=viewSlot(R);
    f.view.ownPublic.bench=[viewSlot(E),viewSlot(E),null,null,null];
    f.view.ownPublic.discard=[...Array(4).fill(P),...Array(4).fill(C)];
    f.view.opponentPublic.active={...viewSlot(T,[],'VMAX'),hp:320,damage:60};
    f.view.opponentPublic.bench=[{...viewSlot(T,[],'VMAX'),hp:320,damage:60}];
    const xs=[0,1].map(i=>({kind:'use-ability',token:'bomb-'+i,actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceZone:'bench',sourceIndex:i,abilityLive:true}}));
    assert.notDeepEqual(f.decide(1,null,xs),{kind:'select-action',token:'bomb-0'});
    assert.notDeepEqual(f.decide(1,null,xs),{kind:'select-action',token:'bomb-1'});
  }
});



test('second self-KO is refused when new public protection invalidates the first forecast',()=>{
  const T='Shadow Rider Calyrex VMAX CRE',C='Counter Energy CIN';
  for(const seat of [0,1]){
    const f=setup(seat,6);
    f.owner.active=slot(R);
    f.owner.bench[0]=slot(E);f.owner.bench[1]=slot(E);
    f.owner.discard.cards=[...Array.from({length:4},()=>new EnergyCard()),
      ...Array.from({length:4},()=>Object.assign(new EnergyCard(),
        {fullName:C,name:'Counter Energy'}))];
    f.view.ownPublic.active=viewSlot(R);
    f.view.ownPublic.bench=[viewSlot(E),viewSlot(E),null,null,null];
    f.view.ownPublic.discard=[...Array(4).fill(P),...Array(4).fill(C)];
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.opponentPublic.active=vmax();
    f.view.opponentPublic.bench=[vmax()];
    const src=i=>({kind:'use-ability',token:'bomb-'+i,actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:'bench',sourceIndex:i,abilityLive:true}});
    assert.deepEqual(f.decide(1,null,[src(0),src(1)]),
      {kind:'select-action',token:'bomb-0'});
    const native=bombPrompt(f,'bench',0);
    const decision=f.decide(2,native.projection.promptProjection);
    assert.equal(decision.kind,'select-choices');
    assert.equal(decision.tokens.length,5);
    // A first transfer has settled, its Electrode self-KO gives two Prizes.
    f.view.ownPublic.active.energies=[...Array(4).fill(P),C];
    f.view.ownPublic.discard=[C,C,C];
    f.view.ownPublic.bench[0]=null;
    f.view.opponentPublic.prizeCount=4;
    // A public protection event means the original two-Bomb terminal
    // forecast must not force the second self-KO without re-evaluation.
    f.view.opponentPublic.active.publicDamageEffects={
      prevention:'all',effectsPrevention:'none',reduction:0
    };
    const next=f.decide(3,null,[src(1)]);
    assert.equal(next.kind,'abstain');
    assert.notDeepEqual(next,{kind:'select-action',token:'bomb-1'});
  }
});



test('Active Electrode first self-KO promotes funded Raichu, then second Benched Bomb, both seats',()=>{
  const C='Counter Energy CIN',T='Shadow Rider Calyrex VMAX CRE';
  for(const seat of [0,1]){
    const f=setup(seat,6);
    f.owner.active=slot(E);
    f.owner.bench[0]=slot(R);f.owner.bench[1]=slot(E);
    f.owner.discard.cards=[...Array.from({length:4},()=>new EnergyCard()),
      ...Array.from({length:4},()=>Object.assign(new EnergyCard(),
        {fullName:C,name:'Counter Energy'}))];
    f.enemy.active=slot(T);f.enemy.bench[0]=slot(T);
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.ownPublic.active=viewSlot(E);
    f.view.ownPublic.bench=[viewSlot(R),viewSlot(E),null,null,null];
    f.view.ownPublic.discard=f.owner.discard.cards.map(c=>c.fullName);
    f.view.opponentPublic.active=vmax();
    f.view.opponentPublic.bench=[vmax()];
    const source=(index,zone)=>({kind:'use-ability',token:'bomb-'+zone,
      actorPrinting:E,publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:zone,sourceIndex:index,abilityLive:true}});
    const first=f.decide(1,null,[source(0,'active'),source(1,'bench')]);
    assert.deepEqual(first,{kind:'select-action',token:'bomb-active'});
    const b=bombPrompt(f,'active');
    const bs=f.decide(2,b.projection.promptProjection);
    assert.equal(bs.kind,'select-choices');assert.equal(bs.tokens.length,5);
    const br=f.settle(b.prompt,b.projection,bs);
    assert.equal(br.rawResult.length,5);
    assert.ok(br.rawResult.every(x=>x.to.slot===1&&x.to.index===0));
    const usedFirst=new Set(br.rawResult.map(x=>x.index));
    const movedFirst=br.rawResult.map(x=>f.owner.discard.cards[x.index]);
    for(const card of movedFirst){
      f.owner.bench[0].cards.push(card);f.owner.bench[0].energies.cards.push(card);
    }
    f.owner.discard.cards=f.owner.discard.cards.filter((_,i)=>!usedFirst.has(i));
    f.owner.active=slot(null);f.view.ownPublic.active=null;
    f.view.ownPublic.bench[0].energies=movedFirst.map(x=>x.fullName);
    f.view.ownPublic.discard=f.owner.discard.cards.map(x=>x.fullName);
    f.view.opponentPublic.prizeCount=4;
    const promotion=promotePrompt(f),pp=promotion.projection.promptProjection;
    assert.equal(pp.source.effectName,'CHOOSE_NEW_ACTIVE_POKEMON');
    const promotionDecision=f.decide(3,pp);
    assert.equal(promotionDecision.kind,'select-choices');
    assert.deepEqual(f.settle(promotion.prompt,promotion.projection,promotionDecision).rawResult,
      [{player:0,slot:1,index:0}]);
    f.owner.active=f.owner.bench[0];f.owner.bench[0]=slot(null);
    f.view.ownPublic.active=viewSlot(R,movedFirst.map(x=>x.fullName));
    f.view.ownPublic.bench[0]=null;
    const second=f.decide(4,null,[source(1,'bench')]);
    assert.deepEqual(second,{kind:'select-action',token:'bomb-bench'});
    const bb=bombPrompt(f,'bench',1),bp=bb.projection.promptProjection;
    const secondDecision=f.decide(5,bp);
    assert.equal(secondDecision.kind,'select-choices');
    assert.equal(secondDecision.tokens.length,3);
    const settled=f.settle(bb.prompt,bb.projection,secondDecision);
    assert.equal(settled.rawResult.length,3);
    assert.ok(settled.rawResult.every(x=>x.to.slot===0));
    const secondUsed=new Set(settled.rawResult.map(x=>x.index));
    const movedSecond=settled.rawResult.map(x=>f.owner.discard.cards[x.index]);
    for(const card of movedSecond){
      f.owner.active.cards.push(card);f.owner.active.energies.cards.push(card);
    }
    f.owner.discard.cards=f.owner.discard.cards.filter((_,i)=>!secondUsed.has(i));
    f.owner.bench[1]=slot(null);f.view.ownPublic.bench[1]=null;
    f.view.ownPublic.active.energies=f.owner.active.energies.cards.map(c=>c.fullName);
    f.view.ownPublic.discard=f.owner.discard.cards.map(c=>c.fullName);
    f.view.opponentPublic.prizeCount=2;
    const attack={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(6,null,[attack]),{kind:'select-action',token:'rain'});
    const ep=discardPrompt(f);ep.prompt.options.max=8;
    const eProjection=f.project(ep.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const ed=f.decide(7,eProjection.promptProjection);
    assert.equal(ed.kind,'select-choices');assert.equal(ed.tokens.length,7);
    protocol.validateDecision(ed,eProjection.promptProjection,new Set());
    const paid=f.settle(ep.prompt,eProjection,ed);
    assert.equal(paid.rawResult.length,7);
    const spent=new Set(paid.rawResult);
    f.owner.active.cards=f.owner.active.cards.filter((_,i)=>!spent.has(i));
    f.owner.active.energies.cards=f.owner.active.cards.slice(1);
    f.view.ownPublic.active.energies=f.owner.active.energies.cards.map(c=>c.fullName);
    const dp=rainPrompt(f,p=>{
      p.damage=540;
      p.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:540},
        {target:{player:1,slot:1,index:0},damage:540}
      ];
    });
    const hits=f.decide(8,dp.projection.promptProjection);
    assert.equal(hits.kind,'select-choices');assert.equal(hits.tokens.length,18);
    protocol.validateDecision(hits,dp.projection.promptProjection,new Set());
    const resolved=f.settle(dp.prompt,dp.projection,hits);
    assert.equal(resolved.rawResult.length,18);
    const sum=resolved.rawResult.reduce((n,x)=>n+x.damage,0);
    assert.equal(sum,540);
    const act=resolved.rawResult.filter(x=>x.target.slot===0).length;
    const bench=resolved.rawResult.filter(x=>x.target.slot===1).length;
    assert.equal(act,9);assert.equal(bench,9);
  }
});



test('nonterminal Active-Electrode Bomb converts into an actual three-Prize VMAX knockout, both seats',()=>{
  const C='Counter Energy CIN',T='Shadow Rider Calyrex VMAX CRE';
  for(const seat of [0,1]){
    const f=setup(seat,6);
    f.owner.active=slot(E);f.owner.bench[0]=slot(R);
    f.owner.discard.cards=[...Array.from({length:4},()=>new EnergyCard()),
      Object.assign(new EnergyCard(),{fullName:C,name:'Counter Energy'})];
    f.enemy.active=slot(T);f.enemy.bench[0]=slot(T);
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.ownPublic.active=viewSlot(E);
    f.view.ownPublic.bench=[viewSlot(R),null,null,null,null];
    f.view.ownPublic.discard=f.owner.discard.cards.map(x=>x.fullName);
    f.view.opponentPublic.active=vmax();f.view.opponentPublic.bench=[vmax()];
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:'active',sourceIndex:0,abilityLive:true}};
    assert.deepEqual(f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'bomb'},
      'a profitable three-Prize conversion may proceed although it is not yet game-terminal');
    const ap=bombPrompt(f,'active'),bp=ap.projection.promptProjection;
    const choice=f.decide(2,bp);
    assert.equal(choice.kind,'select-choices');
    assert.equal(choice.tokens.length,5);
    const moved=f.settle(ap.prompt,ap.projection,choice);
    assert.equal(moved.rawResult.length,5);
    assert.ok(moved.rawResult.every(x=>x.to.slot===1&&x.to.index===0));
    const physical=moved.rawResult.map(row=>f.owner.discard.cards[row.index]);
    for(const e of physical){
      f.owner.bench[0].cards.push(e);f.owner.bench[0].energies.cards.push(e);
    }
    f.owner.discard.cards=[];
    f.owner.active=slot(null);f.view.ownPublic.active=null;
    f.view.ownPublic.bench[0].energies=physical.map(e=>e.fullName);
    f.view.ownPublic.discard=[];
    f.view.opponentPublic.prizeCount=4;
    const promotion=promotePrompt(f),promoted=f.decide(3,promotion.projection.promptProjection);
    assert.equal(promoted.kind,'select-choices');
    assert.deepEqual(f.settle(promotion.prompt,promotion.projection,promoted).rawResult,
      [{player:0,slot:1,index:0}]);
    f.owner.active=f.owner.bench[0];f.owner.bench[0]=slot(null);
    f.view.ownPublic.active=viewSlot(R,physical.map(e=>e.fullName));
    f.view.ownPublic.bench[0]=null;
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(4,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'},
      'post-KO actual active root must independently revalidate the funded attack');
    const discard=discardPrompt(f);discard.prompt.options.max=5;
    const ep=f.project(discard.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const ed=f.decide(5,ep.promptProjection);
    assert.equal(ed.kind,'select-choices');
    assert.equal(ed.tokens.length,3,'three Reversal cards provide nine Lightning units');
    const payment=f.settle(discard.prompt,ep,ed);
    assert.equal(payment.rawResult.length,3);
    const removed=new Set(payment.rawResult);
    f.owner.active.cards=f.owner.active.cards.filter((_,i)=>!removed.has(i));
    f.owner.active.energies.cards=f.owner.active.cards.slice(1);
    f.view.ownPublic.active.energies=f.owner.active.energies.cards.map(x=>x.fullName);
    const dp=rainPrompt(f,p=>{
      p.damage=270;p.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:270},
        {target:{player:1,slot:1,index:0},damage:270}
      ];
    });
    const hits=f.decide(6,dp.projection.promptProjection);
    assert.equal(hits.kind,'select-choices');assert.equal(hits.tokens.length,9);
    protocol.validateDecision(hits,dp.projection.promptProjection,new Set());
    const resolved=f.settle(dp.prompt,dp.projection,hits);
    assert.equal(resolved.rawResult.length,9);
    assert.ok(resolved.rawResult.every(x=>x.target.slot===0&&x.damage===30),
      'the one-Bomb pressure plan knocks out one three-Prize VMAX, not both');
    assert.equal(f.view.opponentPublic.prizeCount,4,
      'the opponent retains four Prizes after the one self-KO');
    assert.equal(f.view.ownPublic.prizeCount,6,
      'our own Prizes are taken only after native damage settlement, not guessed earlier');
  }
});



test('already-funded nonterminal Electro Rain chooses three-Prize KO without a needless Bomb',()=>{
  const T='Shadow Rider Calyrex VMAX CRE';
  for(const seat of [0,1]){
    const f=setup(seat,4);
    const energies=Array.from({length:3},()=>new EnergyCard());
    f.owner.active=slot(R,energies);f.owner.bench[0]=slot(E);
    f.enemy.active=slot(T);f.enemy.bench[0]=slot(T);
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.ownPublic.active=viewSlot(R,[P,P,P]);
    f.view.ownPublic.bench=[viewSlot(E),null,null,null,null];
    f.view.ownPublic.discard=[];
    f.view.opponentPublic.active=vmax();f.view.opponentPublic.bench=[vmax()];
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:'bench',sourceIndex:0,abilityLive:true}};
    const decision=f.decide(1,null,[rain,bomb,{kind:'pass',token:'pass'}]);
    assert.deepEqual(decision,{kind:'select-action',token:'rain'},
      'a funded three-Prize attack must not self-KO an otherwise unused Electrode');
    const e=discardPrompt(f);e.prompt.options.max=3;
    const ep=f.project(e.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const ed=f.decide(2,ep.promptProjection);
    assert.equal(ed.kind,'select-choices');assert.equal(ed.tokens.length,3);
    const payment=f.settle(e.prompt,ep,ed);
    assert.equal(payment.rawResult.length,3);
    f.owner.active.cards=[f.owner.active.getPokemonCard()];
    f.owner.active.energies.cards=[];f.view.ownPublic.active.energies=[];
    const d=rainPrompt(f,p=>{
      p.damage=270;p.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:270},
        {target:{player:1,slot:1,index:0},damage:270}
      ];
    });
    const hits=f.decide(3,d.projection.promptProjection);
    assert.equal(hits.kind,'select-choices');assert.equal(hits.tokens.length,9);
    protocol.validateDecision(hits,d.projection.promptProjection,new Set());
    const settled=f.settle(d.prompt,d.projection,hits);
    assert.equal(settled.rawResult.length,9);
    assert.ok(settled.rawResult.every(row=>row.damage===30&&row.target.slot===0));
    assert.equal(f.view.opponentPublic.prizeCount,4,'no own self-KO changed the opponent Prize count');
  }
});



test('nonterminal three-Prize Bomb pressure is suppressed at opponent four Prizes',()=>{
  const T='Shadow Rider Calyrex VMAX CRE',C='Counter Energy CIN';
  for(const seat of [0,1]){
    const f=setup(seat,4);
    f.view.ownPublic.active=viewSlot(E);
    f.view.ownPublic.bench=[viewSlot(R),null,null,null,null];
    f.view.ownPublic.discard=[P,P,P,P,C];
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.opponentPublic.active=vmax();f.view.opponentPublic.bench=[vmax()];
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:'active',sourceIndex:0,abilityLive:true}};
    const decision=f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]);
    assert.notDeepEqual(decision,{kind:'select-action',token:'bomb'});
    assert.equal(decision.kind,'abstain',
      'a merely positive 3-Prize swing is not admitted with opponent near the win threshold');
  }
});



test('nonterminal three-Prize conversion preserves attached Electrode Energy or Tool',()=>{
  const T='Shadow Rider Calyrex VMAX CRE',C='Counter Energy CIN';
  for(const seat of [0,1])for(const resource of ['energy','tool']){
    const f=setup(seat,6),e=viewSlot(E);
    if(resource==='energy')e.energies=[P];
    else e.tools=['Stealthy Hood UNB'];
    f.view.ownPublic.active=e;
    f.view.ownPublic.bench=[viewSlot(R),null,null,null,null];
    f.view.ownPublic.discard=[P,P,P,P,C];
    const vmax=()=>({...viewSlot(T,[],'VMAX'),hp:320,damage:60});
    f.view.opponentPublic.active=vmax();f.view.opponentPublic.bench=[vmax()];
    const bomb={kind:'use-ability',token:'bomb',actorPrinting:E,
      publicMetadata:{abilityName:'Extra Energy Bomb',
        sourceZone:'active',sourceIndex:0,abilityLive:true}};
    const decision=f.decide(1,null,[bomb,{kind:'pass',token:'pass'}]);
    assert.notDeepEqual(decision,{kind:'select-action',token:'bomb'},
      'a nonterminal self-KO must account for loss of attached Active Electrode resources');
    assert.equal(decision.kind,'abstain');
  }
});



test('paid Rain nonterminal two-Prize KOs cover exact Regidrago V/VSTAR and Iron Thorns ex',()=>{
  const targetCases=[
    ['Regidrago VSTAR SIT',280,10,'VSTAR'],
    ['Regidrago V SIT',220,10,'Basic'],
    ['Iron Thorns ex TWM',230,20,'Basic']
  ];
  for(const seat of [0,1])for(const [name,hp,damage,stage] of targetCases){
    const f=setup(seat,4);
    const energies=Array.from({length:3},()=>new EnergyCard());
    f.owner.active=slot(R,energies);
    f.enemy.active=slot(name);f.enemy.bench[0]=slot(name);
    f.view.ownPublic.active=viewSlot(R,[P,P,P]);
    f.view.ownPublic.bench=[null,null,null,null,null];
    f.view.ownPublic.discard=[];
    const slotView=old=>({...viewSlot(name,[],stage),hp,damage:old});
    f.view.opponentPublic.active=slotView(damage);
    f.view.opponentPublic.bench=[slotView(0)];
    const rain={kind:'attack',token:'rain',actorPrinting:R,
      attackName:'Electro Rain',publicMetadata:{attackCostPayable:true}};
    assert.deepEqual(f.decide(1,null,[rain,{kind:'pass',token:'pass'}]),
      {kind:'select-action',token:'rain'},
      'source-bound nonterminal two-Prize targets must have an actually supported attack');
    const e=discardPrompt(f);e.prompt.options.max=3;
    const ep=f.project(e.prompt,f.owner.active.getPokemonCard(),'Electro Rain');
    const ed=f.decide(2,ep.promptProjection);
    assert.equal(ed.kind,'select-choices');assert.equal(ed.tokens.length,3);
    const settled=f.settle(e.prompt,ep,ed);
    assert.equal(settled.rawResult.length,3);
    f.owner.active.cards=[f.owner.active.getPokemonCard()];
    f.owner.active.energies.cards=[];f.view.ownPublic.active.energies=[];
    const d=rainPrompt(f,p=>{
      p.damage=270;p.maxAllowedDamage=[
        {target:{player:1,slot:0,index:0},damage:270},
        {target:{player:1,slot:1,index:0},damage:270}
      ];
    });
    const hits=f.decide(3,d.projection.promptProjection);
    assert.equal(hits.kind,'select-choices');assert.equal(hits.tokens.length,9);
    protocol.validateDecision(hits,d.projection.promptProjection,new Set());
    const resolution=f.settle(d.prompt,d.projection,hits);
    assert.equal(resolution.rawResult.length,9);
    assert.ok(resolution.rawResult.every(row=>row.target.slot===0&&row.damage===30));
    assert.ok(hp-damage<=270&&hp>0);
  }
});
