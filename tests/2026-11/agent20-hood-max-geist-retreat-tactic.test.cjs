'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  hoodAwareMaxGeistRetreatTacticClass
}=require('../../simulation/twinleaf/hood-aware-max-geist-retreat-tactic.cjs');

class FakeAttackAction {
  constructor(clientId,name){this.clientId=clientId;this.name=name;}
}
class FakeRetreatAction {
  constructor(clientId,benchIndex){this.clientId=clientId;this.benchIndex=benchIndex;}
}
class FakePassTurnAction {
  constructor(clientId){this.clientId=clientId;}
}
class FakeRetreatTactic {
  constructor(options={}){this.options=options;}
  getStateScore(state){return state.baseScore??0;}
  simulateAction(state,action){
    if(action instanceof FakeAttackAction) {
      return state.attackResults?.[action.name];
    }
    if(action instanceof FakePassTurnAction) {
      return state.afterPassState;
    }
    if(action instanceof FakeRetreatAction) {
      return state.retreatResults?.[action.benchIndex]??
        state.opponentRetreatResults?.[action.benchIndex];
    }
    return undefined;
  }
  useTactic(state){return state.baseRetreatAction;}
}

const Tactic=hoodAwareMaxGeistRetreatTacticClass(FakeRetreatTactic,{
  actionTypes:{AttackAction:FakeAttackAction,RetreatAction:FakeRetreatAction,
    PassTurnAction:FakePassTurnAction}
});
const pokemon=(name,attacks=[])=>({name,attacks});
const slot=card=>({getPokemonCard:()=>card});
function attackOutcome(score,responseScores=[]) {
  const candidate={id:101,active:slot(pokemon('Candidate Active')),bench:[]};
  const opponent={id:202,active:slot(pokemon('Latias ex')),
    bench:responseScores.map(()=>slot(pokemon('Raging Bolt ex')))};
  const opponentRetreatResults={};
  for(let i=0;i<responseScores.length;i++) {
    opponentRetreatResults[i]={players:[candidate,opponent],baseScore:responseScores[i]};
  }
  return {players:[candidate,opponent],winner:null,afterPassState:{
    players:[candidate,opponent],baseScore:score,opponentRetreatResults
  }};
}
function board({active='Mimikyu',activeAttacks=['Filch','Copycat'],
  bench=['Shadow Rider Calyrex VMAX'],currentScores={Filch:10},
  currentResponseScores={},maxGeistScores=[100],maxGeistResponseScores=[[]],
  retreatLegal=[true],baseRetreatAction=undefined,baseAfterRetreat=null}={}) {
  const player={id:101,active:slot(pokemon(active,activeAttacks.map(name=>({name})))),
    bench:bench.map(name=>slot(pokemon(name,name==='Shadow Rider Calyrex VMAX'?
      [{name:'Max Geist'}]:[{name:'Other attack'}])))};
  const opponent={id:202,active:slot(pokemon('Latias ex')),bench:[]};
  const retreatResults={};
  for(let i=0;i<bench.length;i++) {
    if(retreatLegal[i]) {
      const nextPlayer={...player,active:player.bench[i],
        bench:player.bench.map((b,j)=>j===i?player.active:b)};
      const outcome=attackOutcome(maxGeistScores[i],maxGeistResponseScores[i]??[]);
      retreatResults[i]={players:[nextPlayer,opponent],baseScore:0,
        attackResults:{'Max Geist':outcome}};
    }
  }
  if(baseAfterRetreat!==null&&baseRetreatAction) {
    retreatResults[baseRetreatAction.benchIndex]=baseAfterRetreat;
  }
  const attackResults={};
  for(const [name,score] of Object.entries(currentScores)) {
    if(score!==undefined)attackResults[name]=attackOutcome(score,currentResponseScores[name]??[]);
  }
  return {players:[player,opponent],player,baseScore:0,
    attackResults,retreatResults,baseRetreatAction};
}

function choose(state) {
  const tactic=new Tactic({scores:{tactics:{attackBonus:100}}});
  return tactic.useTactic(state,state.player);
}

test('promotes a Benched Shadow Rider VMAX only when simulated Max Geist beats the current Active attack after opponent response',()=>{
  const state=board({currentScores:{Filch:10,Copycat:undefined},maxGeistScores:[100]});
  const action=choose(state);
  assert.ok(action instanceof FakeRetreatAction);
  assert.equal(action.clientId,101);
  assert.equal(action.benchIndex,0);
});

test('does not promote when Max Geist is not actually payable in the simulated state',()=>{
  const state=board({currentScores:{Filch:10},maxGeistScores:[undefined]});
  assert.equal(choose(state),undefined);
});

test('keeps the current Active when its best simulated attack scores higher',()=>{
  const state=board({currentScores:{Filch:10,Copycat:120},maxGeistScores:[100]});
  assert.equal(choose(state),undefined);
});

test('preserves a better retreat and attack line selected by the native tactic',()=>{
  const baseRetreatAction=new FakeRetreatAction(101,1);
  const otherAfterRetreat={id:101,active:slot(pokemon('Other Pokémon',[{name:'Other attack'}])),bench:[]};
  const baseAfterRetreat={players:[otherAfterRetreat],baseScore:0,
    attackResults:{'Other attack':attackOutcome(130)}};
  const state=board({
    bench:['Other Pokémon','Shadow Rider Calyrex VMAX'],
    currentScores:{Filch:10},maxGeistScores:[undefined,100],
    baseRetreatAction,baseAfterRetreat
  });
  assert.strictEqual(choose(state),baseRetreatAction);
});

test('chooses the highest-scoring legal Max Geist promotion among multiple VMAX',()=>{
  const state=board({
    bench:['Shadow Rider Calyrex VMAX','Shadow Rider Calyrex VMAX'],
    currentScores:{Filch:10},maxGeistScores:[80,140],retreatLegal:[true,true]
  });
  const action=choose(state);
  assert.ok(action instanceof FakeRetreatAction);
  assert.equal(action.benchIndex,1);
});

test('falls back when retreat itself is not legal',()=>{
  const state=board({currentScores:{Filch:10},maxGeistScores:[100],retreatLegal:[false]});
  assert.equal(choose(state),undefined);
});

test('ignores a Bench Pokémon that is not Shadow Rider Calyrex VMAX',()=>{
  const state=board({bench:['Other Pokémon'],currentScores:{Filch:10},maxGeistScores:[200]});
  assert.equal(choose(state),undefined);
});

test('can compare a charged Bench VMAX even when another VMAX is already Active',()=>{
  const state=board({
    active:'Shadow Rider Calyrex VMAX',activeAttacks:['Max Geist'],
    bench:['Shadow Rider Calyrex VMAX'],currentScores:{'Max Geist':20},
    maxGeistScores:[120]
  });
  const action=choose(state);
  assert.ok(action instanceof FakeRetreatAction);
  assert.equal(action.benchIndex,0);
});

test('rejects a Max Geist line when a legal opponent retreat erases its score advantage',()=>{
  const state=board({
    currentScores:{Filch:10},currentResponseScores:{Filch:[10]},
    maxGeistScores:[100],maxGeistResponseScores:[[5]]
  });
  assert.equal(choose(state),undefined);
});

test('keeps Max Geist when it remains superior after the opponent retreat response',()=>{
  const state=board({
    currentScores:{Filch:10},currentResponseScores:{Filch:[10]},
    maxGeistScores:[100],maxGeistResponseScores:[[30]]
  });
  const action=choose(state);
  assert.ok(action instanceof FakeRetreatAction);
  assert.equal(action.benchIndex,0);
});
