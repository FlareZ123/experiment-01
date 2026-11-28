'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { projectPrompt, dispatchPromptChoice } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const { promptDecision } =
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

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
      return decoded.length === 1 &&
        decoded[0].card instanceof EnergyCard &&
        this.cardList.energies.cards.includes(decoded[0].card) &&
        decoded[0].to.player === 0 &&
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
