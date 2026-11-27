'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const rank9=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');

const ELECTRODE='Electrode-GX CES',MEGA='Mega Absol ex M1L',SABLEYE='Sableye V SSH',
  PRISM='Prism Energy ASC',OPP='Shadow Rider Calyrex VMAX CRE';
class EnergyCard{
  constructor(fullName){Object.assign(this,{fullName,superType:'ENERGY',energyType:'SPECIAL',name:'Prism Energy'})}
}
const native={
  EnergyCard,
  EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},SuperType:{ENERGY:'ENERGY'},
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},SlotType:{ACTIVE:0,BENCH:1},
  ResolvePromptAction:class{constructor(id,result){this.id=id;this.result=result}}
};
const card=(printing,hp,stage='Basic')=>({
  printing,hp,damage:0,energies:[],tools:[],specialConditions:[],
  publicRestrictions:{},abilitySuppressions:[],
  printed:{stage,subtypes:[stage],weakness:[],resistance:[]}
});
const elect=()=>card(ELECTRODE,190,'Stage 1');
const megar=()=>card(MEGA,280);
const sableye=()=>card(SABLEYE,170);
function view(seat,prizes=3){
  const active=megar(),opponent=card(OPP,320,'VMAX');
  opponent.printed.weakness=[{type:'Darkness',value:'×2'}];
  return {
    actorSeat:seat,globalTurn:5,phase:2,
    ownHand:[],
    ownPublic:{active,bench:[elect(),sableye(),null,null,null],
      discard:[PRISM,PRISM,PRISM],stadium:[],prizeCount:3,
      publicTurnRestrictions:{}},
    opponentPublic:{active:opponent,bench:[],prizeCount:prizes,stadium:[]},
    ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0}
  };
}
const nativeSlot=(name,poke=null)=>{
  const c=name?poke??{fullName:name,name:name}:null;
  return {cards:c?[c]:[],energies:{cards:[]},getPokemonCard(){return c}};
};
function projectedPrompt(seat) {
  const id=seat===0?41:62;
  const sourceCard={fullName:ELECTRODE,name:'Electrode-GX'};
  const owner={
    id,active:nativeSlot(MEGA),
    bench:[nativeSlot(ELECTRODE,sourceCard),nativeSlot(SABLEYE),
      nativeSlot(null),nativeSlot(null),nativeSlot(null)],
    discard:{cards:[new EnergyCard(PRISM),new EnergyCard(PRISM),new EnergyCard(PRISM)]},
    hand:{cards:[]},deck:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},prizes:[]
  };
  const other={
    id:id+1,active:nativeSlot(OPP),
    bench:Array(5).fill(null).map(()=>nativeSlot(null)),
    discard:{cards:[]},hand:{cards:[]},deck:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
  const state={players:seat===0?[owner,other]:[other,owner],
    activePlayer:seat,phase:2,turn:5,prompts:[]};
  class AttachEnergyPrompt {
    constructor(){
      this.playerId=id;this.id=1;this.result=undefined;
      this.message='ATTACH_ENERGY_CARDS';this.cardList=owner.discard;
      this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH,native.SlotType.ACTIVE];
      this.filter={superType:native.SuperType.ENERGY};
      this.options={allowCancel:false,min:0,max:5,blocked:[],
        blockedTo:[{player:0,slot:1,index:0}],
        differentTypes:false,sameTarget:false,differentTargets:false};
    }
    getPerspectivePlayerId(){return id}
    decode(raw){return raw.map(x=>({card:owner.discard.cards[x.index],to:x.to}))}
    validate(result){return result.length<=5&&result.every(x=>x.card?.superType==='ENERGY')}
  }
  const prompt=new AttachEnergyPrompt();state.prompts.push(prompt);
  const provenance={sourceKind:'card-effect',sourceCard,effectName:'Extra Energy Bomb'};
  const store={state,dispatch(){throw Error('No native Store dispatch in this test')}};
  const projection=host.projectPrompt({prompt,state,actorSeat:seat,native,store,
    provenanceHook:{getPromptProvenance:()=>provenance}});
  return {prompt,state,projection,store,seat};
}
const makePolicy=seat=>rank9.createPolicy({
  role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
});
const root=(seat,view,seq=1)=>({
  role:'opponent',seat,sequence:seq,observation:view,prompt:null,
  actionFrontier:{items:[
    {kind:'use-ability',token:'bomb',actorPrinting:ELECTRODE,
      publicMetadata:{abilityName:'Extra Energy Bomb',sourceZone:'bench',sourceIndex:0}},
    {kind:'pass',token:'pass'}
  ]}
});

test('rank9 native names: valid Bomb root -> exact host multi-transfer -> decoded transfer array',()=>{
  for(const seat of [0,1]){
    const p=makePolicy(seat),v=view(seat),r=root(seat,v);
    const rootDecision=p.decide(r);
    assert.deepEqual(rootDecision,{kind:'select-action',token:'bomb'});
    const live=projectedPrompt(seat);
    const projection=live.projection.promptProjection;
    assert.equal(projection.publicMetadata.selectionType,'energy-transfers');
    const promptDecision=p.decide({role:'opponent',seat,sequence:2,observation:v,
      prompt:projection,actionFrontier:{items:[]}});
    assert.equal(promptDecision.kind,'select-choices');
    assert.equal(promptDecision.tokens.length,3);
    protocol.validatePrompt(projection,seat);
    protocol.validateDecision(promptDecision,projection,new Set());
    const settled=host.dispatchPromptChoice({
      store:live.store,prompt:live.prompt,state:live.state,
      actorSeat:seat,projection:live.projection,
      decision:promptDecision,native,dispatch:false});
    assert.equal(settled.rawResult.length,3);
    assert.equal(new Set(settled.rawResult.map(x=>x.index)).size,3);
    assert.ok(settled.rawResult.every(x=>x.to.player===0&&x.to.slot===0));
    assert.ok(settled.decoded.every(x=>x.card instanceof EnergyCard));
  }
});

test('rank9 rejects stale transfer and does not Bomb when self-KO loses the match',()=>{
  for(const seat of [0,1]){
    const p=makePolicy(seat),v=view(seat);
    assert.equal(p.decide(root(seat,v)).token,'bomb');
    const live=projectedPrompt(seat);
    const bad=p.decide({role:'opponent',seat,sequence:4,observation:v,
      prompt:live.projection.promptProjection,actionFrontier:{items:[]}});
    assert.equal(bad.kind,'abstain');
    assert.equal(bad.reasonCode,'UNTRUSTED_PROMPT_SOURCE');
    const lose=view(seat,2),pol=makePolicy(seat);
    const noBomb=pol.decide(root(seat,lose));
    assert.notDeepEqual(noBomb,{kind:'select-action',token:'bomb'});
  }
});

test('active CES self-KO: Bomb transfers then genuinely engine-sourced owner promotion, both seats',()=>{
  for(const seat of [0,1]){
    const p=makePolicy(seat),v=view(seat);
    v.ownPublic.active=elect();
    v.ownPublic.bench=[megar(),sableye(),null,null,null];
    const ra=root(seat,v);
    ra.actionFrontier.items[0].publicMetadata.sourceZone='active';
    ra.actionFrontier.items[0].publicMetadata.sourceIndex=0;
    assert.deepEqual(p.decide(ra),{kind:'select-action',token:'bomb'});
    const live=projectedPrompt(seat);
    const owner=live.state.players[seat];
    const currentActive=owner.active;
    owner.active=owner.bench[0];
    owner.bench[0]=currentActive;
    live.prompt.options.blockedTo=[{player:0,slot:0,index:0}];
    const bomb=host.projectPrompt({
      prompt:live.prompt,state:live.state,actorSeat:seat,native,store:live.store,
      provenanceHook:{getPromptProvenance:()=>({
        sourceKind:'card-effect',sourceCard:owner.active.getPokemonCard(),
        effectName:'Extra Energy Bomb'
      })}
    });
    const transfer=p.decide({role:'opponent',seat,sequence:2,
      observation:v,prompt:bomb.promptProjection,actionFrontier:{items:[]}});
    assert.equal(transfer.kind,'select-choices');
    assert.equal(transfer.tokens.length,3);
    const checked=host.dispatchPromptChoice({store:live.store,prompt:live.prompt,
      state:live.state,actorSeat:seat,projection:bomb,decision:transfer,native,
      dispatch:false});
    assert.equal(checked.rawResult.length,3);
    assert.ok(checked.rawResult.every(x=>x.to.slot===native.SlotType.BENCH&&
      x.to.index===0));
    // Model the next pinned check-effect reducer's documented post-KO state,
    // *not* a substitute for a native complete Store execution.
    live.state.prompts.splice(0);
    owner.active=nativeSlot(null);
    class ChoosePokemonPrompt {
      constructor(){
        this.id=1;this.playerId=owner.id;this.message='CHOOSE_NEW_ACTIVE_POKEMON';
        this.result=undefined;this.playerType=native.PlayerType.BOTTOM_PLAYER;
        this.slots=[native.SlotType.BENCH];this.options={
          min:1,max:1,allowCancel:false,blocked:[]
        };
      }
      getPerspectivePlayerId(){return owner.id}
      decode(raw){return raw.map(t=>owner.bench[t.index])}
      validate(decoded){return decoded.length===1&&decoded.every(x=>x.cards.length>0)}
    }
    const promotion=new ChoosePokemonPrompt();live.state.prompts.push(promotion);
    const promoteHost=host.projectPrompt({
      prompt:promotion,state:live.state,actorSeat:seat,native,store:live.store,
      provenanceHook:{getPromptProvenance:()=>null}
    });
    assert.equal(promoteHost.promptProjection.source.sourceKind,'engine');
    assert.equal(promoteHost.promptProjection.source.effectName,
      'CHOOSE_NEW_ACTIVE_POKEMON');
    const after={...v,ownPublic:{...v.ownPublic,active:null,
      bench:[{...megar(),energies:[PRISM,PRISM,PRISM]},sableye(),null,null,null]}};
    const promotionDecision=p.decide({role:'opponent',seat,sequence:3,
      observation:after,prompt:promoteHost.promptProjection,actionFrontier:{items:[]}});
    assert.equal(promotionDecision.kind,'select-choices');
    assert.equal(promotionDecision.tokens.length,1);
    const promotionSettlement=host.dispatchPromptChoice({
      store:live.store,state:live.state,prompt:promotion,actorSeat:seat,
      projection:promoteHost,decision:promotionDecision,native,dispatch:false});
    assert.deepEqual(promotionSettlement.rawResult,
      [{player:0,slot:1,index:0}]);
    assert.equal(promotionSettlement.decoded[0],owner.bench[0]);

    // The allowlist must not silently treat an ordinary non-KO source as
    // an engine promotion merely because the message looks familiar.
    const bogus=new ChoosePokemonPrompt();
    owner.active=nativeSlot(MEGA);live.state.prompts=[bogus];
    assert.throws(()=>host.projectPrompt({prompt:bogus,state:live.state,
      actorSeat:seat,native,store:live.store,
      provenanceHook:{getPromptProvenance:()=>null}}),
      /Prompt has no trusted card-effect or allowlisted engine source/);
  }
});
