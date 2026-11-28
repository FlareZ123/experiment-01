'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { projectPrompt, dispatchPromptChoice } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const { promptDecision } =
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');
const { describeEffect } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');

function fixture({ seat = 0, energyNames = [
  'Double Colorless Energy SUM', 'Speed Lightning Energy RCL'
], activeOffboardEnergy = false } = {}) {
  class EnergyCard {
    constructor(fullName) {
      this.fullName = fullName;
      this.name = fullName.split(' Energy')[0] + ' Energy';
      this.superType = 'ENERGY';
      this.energyType = 'SPECIAL';
    }
  }
  class ResolvePromptAction {
    constructor(id, result) { this.id = id; this.result = result; }
  }
  class AttachEnergyPrompt {
    constructor(playerId, cardList) {
      this.id = 42;
      this.playerId = playerId;
      this.message = 'ATTACH_ENERGY_TO_BENCH';
      this.cardList = cardList;
      this.playerType = 0;
      this.slots = [1];
      this.filter = {superType:'ENERGY'};
      this.options = {allowCancel:false,min:1,max:1};
      this.result = undefined;
    }
    getPerspectivePlayerId() { return this.playerId; }
    decode(raw) {
      if (!Array.isArray(raw)) throw Error('Bad raw transfer');
      return raw.map(entry => ({
        card: this.cardList.cards[entry.index],
        to: entry.to
      }));
    }
    validate(decoded) {
      if (decoded.length === 0) return this.options.min === 0;
      return decoded.length === 1 &&
        decoded[0].card instanceof EnergyCard &&
        this.cardList.energies.cards.includes(decoded[0].card) &&
        decoded[0].to.player === this.playerType &&
        decoded[0].to.slot === 1 &&
        decoded[0].to.index === 0;
    }
  }
  const native = {
    EnergyCard,
    EnergyType:{SPECIAL:'SPECIAL',BASIC:'BASIC'},
    SuperType:{ENERGY:'ENERGY'},
    PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
    SlotType:{BENCH:1},
    ResolvePromptAction
  };
  const thorns = {
    name:'Iron Thorns ex',fullName:'Iron Thorns ex TWM',
    set:'TWM',setNumber:'77'
  };
  const benchThorns = {
    name:'Iron Thorns ex',fullName:'Iron Thorns ex TWM',
    set:'TWM',setNumber:'77'
  };
  const energies = energyNames.map(name => new EnergyCard(name));
  const active = {
    cards:[thorns,...energies],
    energies:{cards:activeOffboardEnergy ? [] : energies.slice()},
    tools:[],
    getPokemonCard(){return thorns;}
  };
  const benchSlot = {
    cards:[benchThorns],energies:{cards:[]},tools:[],
    getPokemonCard(){return benchThorns;}
  };
  const actor = {
    id:seat, hand:{cards:[]},deck:{cards:[]},
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},active,bench:[benchSlot]
  };
  const other = {
    id:1-seat,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    active:{cards:[],energies:{cards:[]},tools:[]},bench:[]
  };
  const prompt = new AttachEnergyPrompt(actor.id,active);
  const state = {
    phase:2, players:seat===0 ? [actor,other] : [other,actor],
    prompts:[prompt]
  };
  const provenanceHook = {
    getPromptProvenance(){
      return {sourceKind:'card-effect',sourceCard:thorns,effectName:'Volt Cyclone'};
    }
  };
  return {native,actor,active,state,prompt,provenanceHook};
}

function runProjection(f) {
  return projectPrompt({
    prompt:f.prompt,state:f.state,actorSeat:f.actor.id,
    native:f.native,store:{reduceEffect(){}},provenanceHook:f.provenanceHook
  });
}

test('Volt Cyclone paired physical seats: native-valid choices, worker choice, decoded mandatory transfer',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat});
    const projected=runProjection(f);
    assert.equal(projected.hostOnly,false);
    const p=projected.promptProjection;
    assert.equal(p.source.effectName,'Volt Cyclone');
    assert.equal(p.publicMetadata.selectionType,'energy-attachment');
    assert.equal(p.publicMetadata.sourceZone,'active');
    assert.equal(p.choices.length,2);
    assert.equal(projected.choiceByToken.size,2);
    const chosen=promptDecision({
      prompt:p,
      observation:{ownPublic:{
        bench:[{printing:'Iron Thorns ex TWM 77',energies:[],damage:0}]
      }}
    });
    assert.deepEqual(chosen,{kind:'select-choice',token:'prompt-1'});
    const store={state:f.state,dispatch(){throw Error('no live Store dispatch in local test');}};
    const continued=dispatchPromptChoice({
      store,prompt:f.prompt,state:f.state,actorSeat:seat,
      projection:projected,decision:chosen,native:f.native,dispatch:false
    });
    assert.equal(continued.rawResult.length,1);
    assert.equal(continued.rawResult[0].index,2); // physical card index in Active slot
    assert.deepEqual(continued.rawResult[0].to,{player:0,slot:1,index:0});
    assert.equal(continued.decoded[0].card.fullName,'Speed Lightning Energy RCL');
    assert.ok(continued.action instanceof f.native.ResolvePromptAction);
    assert.equal(f.active.energies.cards.length,2); // no premature state mutation
  }
});

test('Volt Cyclone one attached Energy remains a legal compulsory transfer',()=>{
  const f=fixture({energyNames:['Double Colorless Energy SUM']});
  const p=runProjection(f).promptProjection;
  assert.equal(p.choices.length,1);
  const chosen=promptDecision({
    prompt:p,
    observation:{ownPublic:{bench:[{printing:'Iron Thorns ex TWM 77',energies:[],damage:0}]}}
  });
  assert.deepEqual(chosen,{kind:'select-choice',token:'prompt-0'});
});

test('Volt Cyclone fail-closed source, nonmatching native shape and phantom energy',()=>{
  const spoof=fixture();
  spoof.provenanceHook.getPromptProvenance=()=>({
    sourceKind:'card-effect',sourceCard:spoof.actor.active.getPokemonCard(),
    effectName:'Handheld Fan'
  });
  assert.throws(()=>runProjection(spoof),error=>
    error.code==='UNSUPPORTED_ATTACH_ENERGY_PROMPT_SOURCE');
  const shape=fixture();
  shape.prompt.filter.energyType='BASIC';
  assert.throws(()=>runProjection(shape),error=>
    error.code==='UNSUPPORTED_VOLT_CYCLONE_ATTACH_ENERGY_SHAPE');
  const phantom=fixture({activeOffboardEnergy:true});
  assert.throws(()=>runProjection(phantom),error=>
    error.code==='NO_VALID_VOLT_CYCLONE_ENERGY_TRANSFER');
});


function fanFixture({seat=0, energyNames=['Double Colorless Energy SUM'], hasBench=true}={}) {
  const f=fixture({seat,energyNames:[]});
  const fan={name:'Handheld Fan',fullName:'Handheld Fan TWM',
    set:'TWM',setNumber:'150'};
  f.actor.active.tools.push(fan);
  const opponent=f.state.players[1-seat];
  const attacker={name:'Shadow Rider Calyrex VMAX',
    fullName:'Shadow Rider Calyrex VMAX CRE',set:'CRE',setNumber:'75'};
  const energies=energyNames.map(name=>new f.native.EnergyCard(name));
  opponent.active={
    cards:[attacker,...energies],energies:{cards:energies},tools:[],
    getPokemonCard(){return attacker;}
  };
  const lele={name:'Tapu Lele-GX',fullName:'Tapu Lele-GX GRI'};
  opponent.bench=hasBench?[{
    cards:[lele],energies:{cards:[]},tools:[],
    getPokemonCard(){return lele;}
  }]:[];
  f.prompt=new f.prompt.constructor(seat,opponent.active);
  f.prompt.playerType=1; // TOP_PLAYER relative to defending Tool owner
  f.prompt.options.min=0;
  f.state.prompts=[f.prompt];
  f.provenanceHook.getPromptProvenance=()=>({
    sourceKind:'card-effect',sourceCard:fan,effectName:'Handheld Fan'
  });
  return f;
}

test('Handheld Fan pinned reducer origin is the Tool, not the opposing attack name',()=>{
  const fan={name:'Handheld Fan',set:'TWM',setNumber:'150',fullName:'Handheld Fan TWM'};
  class AfterDamageEffect {
    constructor(){this.attack={name:'Max Geist'};}
  }
  const described=describeEffect(fan,new AfterDamageEffect());
  assert.equal(described.effectName,'Handheld Fan');
  assert.equal(described.sourceCard,fan);
  const ordinary=describeEffect({name:'Other Tool'},new AfterDamageEffect());
  assert.equal(ordinary.effectName,'Max Geist'); // narrow source exception
});

test('Handheld Fan both seats: exact opposing Energy-to-Bench transfer is decoded, not actor-owned Energy',()=>{
  for(const seat of [0,1]){
    const f=fanFixture({seat});
    const projection=runProjection(f);
    const p=projection.promptProjection;
    assert.equal(p.source.sourcePrinting,'Handheld Fan TWM');
    assert.equal(p.source.effectName,'Handheld Fan');
    assert.equal(p.publicMetadata.ownerSeat,'opponent');
    assert.equal(p.choices.length,2); // one assignment plus legal []
    assert.equal(p.choices[0].kind,'energy');
    assert.equal(p.choices[1].kind,'empty-selection');
    const chosen=promptDecision({
      prompt:p,
      observation:{opponentPublic:{
        bench:[{printing:'Tapu Lele-GX GRI 60',energies:[],damage:0}]
      }}
    });
    assert.deepEqual(chosen,{kind:'select-choice',token:'prompt-0'});
    const continued=dispatchPromptChoice({
      store:{state:f.state,dispatch(){throw Error('no dispatch');}},
      prompt:f.prompt,state:f.state,actorSeat:seat,
      projection,decision:chosen,native:f.native,dispatch:false
    });
    assert.deepEqual(continued.rawResult[0].to,{player:1,slot:1,index:0});
    assert.equal(continued.decoded[0].card.fullName,'Double Colorless Energy SUM');
    assert.ok(!f.actor.active.energies.cards.includes(continued.decoded[0].card));
  }
});

test('Handheld Fan zero-source native [] and shape/source negative controls',()=>{
  const zero=fanFixture({energyNames:[]});
  const projected=runProjection(zero);
  const p=projected.promptProjection;
  assert.equal(p.choices.length,1);
  assert.equal(p.choices[0].kind,'empty-selection');
  const chosen=promptDecision({
    prompt:p,observation:{opponentPublic:{bench:[{printing:'Tapu Lele-GX GRI 60',energies:[]}]}}
  });
  assert.deepEqual(chosen,{kind:'select-choice',token:'prompt-0'});
  const continued=dispatchPromptChoice({
    store:{state:zero.state,dispatch(){throw Error('no dispatch');}},
    prompt:zero.prompt,state:zero.state,actorSeat:0,
    projection:projected,decision:chosen,native:zero.native,dispatch:false
  });
  assert.deepEqual(continued.rawResult,[]);
  const shape=fanFixture();
  shape.prompt.playerType=0;
  assert.throws(()=>runProjection(shape),e=>
    e.code==='UNSUPPORTED_HANDHELD_FAN_ATTACH_ENERGY_SHAPE');
  const unattached=fanFixture();
  unattached.actor.active.tools.length=0;
  assert.throws(()=>runProjection(unattached),e=>
    e.code==='PROMPT_SOURCE_NOT_ACTOR_VISIBLE');
  const noBench=fanFixture({hasBench:false});
  assert.equal(runProjection(noBench).promptProjection.choices[0].kind,'empty-selection');
});
