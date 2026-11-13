'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  hoodedDoorRecoveryEntry,hoodedDoorEffectReceipt
}=require('../../simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs');

const energy=()=>({name:'Psychic Energy',fullName:'Psychic Energy TEST'});
const item=name=>({name,fullName:name+' TEST'});

test('direct route uses the exact Psychic Energy already in hand without Items or Field Blower',()=>{
  const psychic=energy();
  const own={hand:{cards:[psychic]},discard:{cards:[]},deck:{cards:[]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'direct');
  assert.equal(entry.phase,'door');
  assert.strictEqual(entry.energyCard,psychic);
});

test('Night Stretcher route retains the exact Psychic Energy already in discard',()=>{
  const psychic=energy();
  const own={hand:{cards:[item('Night Stretcher')]},
    discard:{cards:[psychic]},deck:{cards:[]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'stretcher');
  assert.equal(entry.phase,'stretcher');
  assert.strictEqual(entry.energyCard,psychic);
});

test('Battle Compressor plus Night Stretcher route waits for a real deck prompt',()=>{
  const psychic=energy();
  const own={hand:{cards:[item('Battle Compressor'),item('Night Stretcher')]},
    discard:{cards:[]},deck:{cards:[psychic]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'compressor-stretcher');
  assert.equal(entry.phase,'compressor-choice');
  assert.equal(entry.energyCard,null);
});

test('no executable Energy route returns no recovery entry',()=>{
  const own={hand:{cards:[item('Night Stretcher')]},
    discard:{cards:[]},deck:{cards:[]}};
  assert.equal(hoodedDoorRecoveryEntry(own),null);
});

function receiptState({energyCard,deckCount=2,energyZone='bench',
  markerSpent=true,garbotoxinStillLive=true,fieldBlower=false}={}) {
  const target={energies:{cards:energyZone==='bench'?[energyCard]:[]}};
  const own={
    bench:[target],
    hand:{cards:fieldBlower?[item('Field Blower')]:[]},
    discard:{cards:energyZone==='discard'?[energyCard]:[]},
    deck:{cards:Array.from({length:deckCount},(_,i)=>({id:'drawn-'+i}))},
    prizes:[{cards:[]},{cards:[]}]
  };
  const result=hoodedDoorEffectReceipt({
    own,selectedEnergyCard:energyCard,targetBenchIndex:0,
    deckBefore:4,markerSpent,garbotoxinStillLive
  });
  return {own,result};
}

test('physical effect receipt qualifies exact attachment, draw-two and spent marker without Field Blower',()=>{
  const psychic=energy();
  const {result}=receiptState({energyCard:psychic,fieldBlower:false});
  assert.equal(result.attached,true);
  assert.equal(result.drawnTwo,true);
  assert.equal(result.markerSpent,true);
  assert.equal(result.garbotoxinStillLive,true);
  assert.equal(result.physicalConserved,true);
  assert.equal(result.fieldBlowerRetained,false);
  assert.equal(result.successfulEffect,true);
});

test('Field Blower retention is telemetry, not a success prerequisite',()=>{
  const psychic=energy();
  const absent=receiptState({energyCard:psychic,fieldBlower:false}).result;
  const present=receiptState({energyCard:psychic,fieldBlower:true}).result;
  assert.equal(absent.successfulEffect,true);
  assert.equal(present.successfulEffect,true);
  assert.equal(absent.fieldBlowerRetained,false);
  assert.equal(present.fieldBlowerRetained,true);
});

test('receipt rejects duplicate or unsettled physical Energy',()=>{
  const psychic=energy();
  const {own,result}=receiptState({energyCard:psychic});
  own.discard.cards.push(psychic);
  const duplicated=hoodedDoorEffectReceipt({
    own,selectedEnergyCard:psychic,targetBenchIndex:0,deckBefore:4,
    markerSpent:true,garbotoxinStillLive:true
  });
  assert.equal(duplicated.attached,true);
  assert.equal(duplicated.physicalConserved,false);
  assert.equal(duplicated.successfulEffect,false);
  assert.equal(result.successfulEffect,true);
});

test('receipt fails closed on incomplete draw, unspent marker or missing live lock',()=>{
  const psychic=energy();
  for(const failure of [
    {deckCount:3,markerSpent:true,garbotoxinStillLive:true},
    {deckCount:2,markerSpent:false,garbotoxinStillLive:true},
    {deckCount:2,markerSpent:true,garbotoxinStillLive:false}
  ]) {
    const {result}=receiptState({energyCard:psychic,...failure});
    assert.equal(result.successfulEffect,false);
  }
});


test('recovery aborts across turns and retries later, then repeats per own turn in either seat',()=>{
  const {
    withHoodGarbotoxinRecoveryAutonomy
  }=require('../../simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs');

  class FakeSimpleTacticsAi {
    constructor(id){this.client={id};}
    isValidAction(){return true;}
    decodeNextAction(){return {kind:'baseline'};}
  }
  class FakePlayCardAction {
    constructor(playerId,index,target){Object.assign(this,{playerId,index,target});}
  }
  class FakeResolvePromptAction {
    constructor(promptId,result){Object.assign(this,{promptId,result});}
  }
  class FakeUseAbilityAction {
    constructor(playerId,ability,target){Object.assign(this,{playerId,ability,target});}
  }
  class AttachEnergyPrompt {
    constructor(playerId,energy){
      this.id='attach-'+playerId;
      this.playerId=playerId;
      this.cardList={cards:[energy]};
      this.validate=assignment=>Array.isArray(assignment)&&
        assignment.length===1&&assignment[0].card===energy;
    }
  }
  const actionTypes={
    PlayCardAction:FakePlayCardAction,
    ResolvePromptAction:FakeResolvePromptAction,
    UseAbilityAction:FakeUseAbilityAction,
    PlayerType:{ANY:'any',BOTTOM_PLAYER:'bottom',TOP_PLAYER:'top'},
    SlotType:{BOARD:'board',ACTIVE:'active',BENCH:'bench'}
  };
  const GamePhase={PLAYER_TURN:'PLAYER_TURN'};
  const makeEnergy=id=>({name:'Psychic Energy',fullName:'Psychic Energy '+id});
  const makeSlot=(pokemon,tools=[])=>({
    tools,energies:{cards:[]},getPokemonCard(){return pokemon;}
  });

  for(const candidateSeat of [0,1]) {
    const ownId=candidateSeat===0?101:202;
    const opponentId=candidateSeat===0?202:101;
    const activePokemon={name:'Shadow Rider Calyrex VMAX',
      powers:[{name:'Underworld Door'}]};
    const benchPokemon={name:'Shadow Rider Calyrex VMAX',
      powers:[{name:'Underworld Door'}]};
    const garbodor={name:'Garbodor',powers:[{name:'Garbotoxin'}]};
    const firstEnergy=makeEnergy('first-'+candidateSeat);
    const own={
      id:ownId,
      active:makeSlot(activePokemon,[{name:'Stealthy Hood',fullName:'Stealthy Hood UNB 186'}]),
      bench:[makeSlot(benchPokemon)],
      hand:{cards:[firstEnergy]},
      discard:{cards:[]},
      deck:{cards:[{id:'d1'},{id:'d2'},{id:'d3'},{id:'d4'}]},
      prizes:[{cards:[]},{cards:[]}],
      marker:{used:false,hasMarker(){return this.used;}},
      stadium:{cards:[]}
    };
    const opponent={
      id:opponentId,
      active:makeSlot(garbodor,[{name:'Float Stone',fullName:'Float Stone BKT 137'}]),
      bench:[],hand:{cards:[]},discard:{cards:[]},deck:{cards:[]},
      prizes:[{cards:[]}],marker:{hasMarker(){return false;}},
      stadium:{cards:[]}
    };
    const state={
      players:candidateSeat===0?[own,opponent]:[opponent,own],
      activePlayer:candidateSeat,turn:1,phase:'PLAYER_TURN',prompts:[]
    };
    const ai=new FakeSimpleTacticsAi(ownId);

    const opponentAi=new FakeSimpleTacticsAi(opponentId);
    const run=withHoodGarbotoxinRecoveryAutonomy(candidateSeat,()=>{
      const abandoned=ai.decodeNextAction(state);
      assert.ok(abandoned instanceof FakeUseAbilityAction);
      assert.equal(abandoned.playerId,ownId);

      state.turn=2;
      state.activePlayer=1-candidateSeat;
      assert.deepEqual(opponentAi.decodeNextAction(state),{kind:'baseline'});

      state.turn=3;
      state.activePlayer=candidateSeat;
      const first=ai.decodeNextAction(state);
      assert.ok(first instanceof FakeUseAbilityAction);
      assert.equal(first.playerId,ownId);
      assert.equal(first.target.player,'bottom');

      state.prompts=[new AttachEnergyPrompt(ownId,firstEnergy)];
      const firstResolve=ai.decodeNextAction(state);
      assert.ok(firstResolve instanceof FakeResolvePromptAction);
      assert.equal(firstResolve.promptId,'attach-'+ownId);
      assert.equal(firstResolve.result[0].to.player,'bottom');
      own.hand.cards=own.hand.cards.filter(card=>card!==firstEnergy);
      own.bench[0].energies.cards.push(firstEnergy);
      own.deck.cards.splice(0,2);
      own.marker.used=true;
      state.prompts=[];
      assert.deepEqual(ai.decodeNextAction(state),{kind:'baseline'});
      assert.deepEqual(ai.decodeNextAction(state),{kind:'baseline'});

      const secondEnergy=makeEnergy('second-'+candidateSeat);
      own.hand.cards.push(secondEnergy);
      own.deck.cards.push({id:'d5'},{id:'d6'});
      own.marker.used=false;
      state.turn=5;

      const second=ai.decodeNextAction(state);
      assert.ok(second instanceof FakeUseAbilityAction);
      assert.equal(second.playerId,ownId);
      state.prompts=[new AttachEnergyPrompt(ownId,secondEnergy)];
      const secondResolve=ai.decodeNextAction(state);
      assert.ok(secondResolve instanceof FakeResolvePromptAction);
      own.hand.cards=own.hand.cards.filter(card=>card!==secondEnergy);
      own.bench[0].energies.cards.push(secondEnergy);
      own.deck.cards.splice(0,2);
      own.marker.used=true;
      state.prompts=[];
      assert.deepEqual(ai.decodeNextAction(state),{kind:'baseline'});
      return 'complete';
    },{SimpleTacticsAi:FakeSimpleTacticsAi,actionTypes,GamePhase});

    assert.equal(run.result,'complete');
    assert.equal(run.policyAudit.version,'hood-garbotoxin-recovery-autonomy-v5-active-or-bench-source');
    assert.equal(run.policyAudit.attemptCount,3);
    assert.equal(run.policyAudit.successfulEffectCount,2);
    assert.deepEqual(run.policyAudit.attempts.map(attempt=>attempt.turn),[1,3,5]);
    assert.equal(run.policyAudit.attempts[0].aborted,'Recovery sequence crossed a turn boundary');
    assert.equal(run.policyAudit.attempts[0].successfulEffect,false);
    assert.ok(run.policyAudit.attempts.slice(1).every(attempt=>attempt.successfulEffect));
  }
});


test('a Hooded Benched VMAX sources Underworld Door under Active Tool Jammer in both physical seats',()=>{
  const {withHoodGarbotoxinRecoveryAutonomy}=
    require('../../simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs');

  class FakeSimpleTacticsAi {
    constructor(id){this.client={id};}
    isValidAction(){return true;}
    decodeNextAction(){return {kind:'baseline'};}
  }
  class FakePlayCardAction {
    constructor(playerId,index,target){Object.assign(this,{playerId,index,target});}
  }
  class FakeResolvePromptAction {
    constructor(promptId,result){Object.assign(this,{promptId,result});}
  }
  class FakeUseAbilityAction {
    constructor(playerId,ability,target){Object.assign(this,{playerId,ability,target});}
  }
  class AttachEnergyPrompt {
    constructor(playerId,energy){
      this.id='bench-attach-'+playerId;
      this.playerId=playerId;
      this.cardList={cards:[energy]};
      this.validate=assignment=>Array.isArray(assignment)&&
        assignment.length===1&&assignment[0].card===energy;
    }
  }
  const actionTypes={
    PlayCardAction:FakePlayCardAction,
    ResolvePromptAction:FakeResolvePromptAction,
    UseAbilityAction:FakeUseAbilityAction,
    PlayerType:{ANY:'any',BOTTOM_PLAYER:'bottom',TOP_PLAYER:'top'},
    SlotType:{BOARD:'board',ACTIVE:'active',BENCH:'bench'}
  };
  const GamePhase={PLAYER_TURN:'PLAYER_TURN'};
  const makeSlot=(pokemon,tools=[])=>({
    tools,energies:{cards:[]},getPokemonCard(){return pokemon;}
  });

  for(const candidateSeat of [0,1]){
    const ownId=candidateSeat===0?101:202;
    const opponentId=candidateSeat===0?202:101;
    const energy={name:'Psychic Energy',fullName:'Psychic Energy BENCH '+candidateSeat};
    const activePokemon={name:'Shadow Rider Calyrex VMAX',
      powers:[{name:'Underworld Door'}]};
    const sourcePokemon={name:'Shadow Rider Calyrex VMAX',
      fullName:'Shadow Rider Calyrex VMAX HOODED '+candidateSeat,
      powers:[{name:'Underworld Door'}]};
    const targetPokemon={name:'Shadow Rider Calyrex VMAX',
      powers:[{name:'Underworld Door'}]};
    const garbodor={name:'Garbodor',powers:[{name:'Garbotoxin'}]};
    const own={
      id:ownId,
      active:makeSlot(activePokemon,[]),
      bench:[
        makeSlot(sourcePokemon,[{name:'Stealthy Hood',fullName:'Stealthy Hood UNB 186'}]),
        makeSlot(targetPokemon,[])
      ],
      hand:{cards:[energy]},
      discard:{cards:[]},
      deck:{cards:[{id:'d1'},{id:'d2'},{id:'d3'},{id:'d4'}]},
      prizes:[{cards:[]},{cards:[]}],
      marker:{used:new Set(),hasMarker(_,pokemon){return this.used.has(pokemon);}},
      stadium:{cards:[]}
    };
    const opponent={
      id:opponentId,
      active:makeSlot(garbodor,[{name:'Tool Jammer',fullName:'Tool Jammer BST 136'}]),
      bench:[],hand:{cards:[]},discard:{cards:[]},deck:{cards:[]},
      prizes:[{cards:[]}],marker:{hasMarker(){return false;}},
      stadium:{cards:[]}
    };
    const state={
      players:candidateSeat===0?[own,opponent]:[opponent,own],
      activePlayer:candidateSeat,turn:1,phase:'PLAYER_TURN',prompts:[]
    };
    const ai=new FakeSimpleTacticsAi(ownId);

    const run=withHoodGarbotoxinRecoveryAutonomy(candidateSeat,()=>{
      const use=ai.decodeNextAction(state);
      assert.ok(use instanceof FakeUseAbilityAction);
      assert.equal(use.playerId,ownId);
      assert.equal(use.ability,'Underworld Door');
      assert.deepEqual(use.target,{player:'bottom',slot:'bench',index:0});

      state.prompts=[new AttachEnergyPrompt(ownId,energy)];
      const resolve=ai.decodeNextAction(state);
      assert.ok(resolve instanceof FakeResolvePromptAction);
      assert.equal(resolve.promptId,'bench-attach-'+ownId);
      assert.deepEqual(resolve.result[0].to,
        {player:'bottom',slot:'bench',index:1});

      own.hand.cards=own.hand.cards.filter(card=>card!==energy);
      own.bench[1].energies.cards.push(energy);
      own.deck.cards.splice(0,2);
      own.marker.used.add(sourcePokemon);
      state.prompts=[];
      assert.deepEqual(ai.decodeNextAction(state),{kind:'baseline'});
      return 'complete';
    },{SimpleTacticsAi:FakeSimpleTacticsAi,actionTypes,GamePhase});

    assert.equal(run.result,'complete');
    assert.equal(run.policyAudit.version,'hood-garbotoxin-recovery-autonomy-v5-active-or-bench-source');
    assert.equal(run.policyAudit.attemptCount,1);
    assert.equal(run.policyAudit.successfulEffectCount,1);
    assert.equal(run.policyAudit.attempts[0].sourceZone,'bench');
    assert.equal(run.policyAudit.attempts[0].sourceIndex,0);
    assert.equal(run.policyAudit.attempts[0].sourcePrinting,sourcePokemon.fullName);
    assert.equal(run.policyAudit.attempts[0].receipt.successfulEffect,true);
  }
});
