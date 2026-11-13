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
class FakeGameError {
  constructor(message){this.message=message;}
}
class FakeSimulator {
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof FakeAttackAction) {
      if(this.state.throwUnexpectedOnAttack?.[action.name]) {
        throw new Error('unexpected simulator failure');
      }
      if(this.state.gameErrorOnAttack?.[action.name]) {
        throw new FakeGameError(this.state.gameErrorOnAttack[action.name]);
      }
      return this.state.attackResults?.[action.name];
    }
    if(action instanceof FakeRetreatAction) {
      if(this.state.activePlayer===1) {
        return this.state.opponentRetreatResults?.[action.benchIndex];
      }
      return this.state.retreatResults?.[action.benchIndex];
    }
    return undefined;
  }
}
class FakeRetreatTactic {
  constructor(options={}){this.options=options;}
  getStateScore(state){return state.baseScore??0;}
  simulateAction(state,action){
    if(action instanceof FakeRetreatAction)return state.retreatResults?.[action.benchIndex];
    return undefined;
  }
  useTactic(state){return state.baseRetreatAction;}
}

const Tactic=hoodAwareMaxGeistRetreatTacticClass(FakeRetreatTactic,{
  actionTypes:{AttackAction:FakeAttackAction,RetreatAction:FakeRetreatAction},
  Simulator:FakeSimulator,GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
  GameError:FakeGameError,GameMessage:{NOT_ENOUGH_ENERGY:'NOT_ENOUGH_ENERGY',
    UNKNOWN_ATTACK:'UNKNOWN_ATTACK',CANNOT_USE_ATTACK:'CANNOT_USE_ATTACK',
    CANNOT_ATTACK_ON_FIRST_TURN:'CANNOT_ATTACK_ON_FIRST_TURN',
    CANNOT_RETREAT:'CANNOT_RETREAT',BLOCKED_BY_EFFECT:'BLOCKED_BY_EFFECT'}
});
const pokemon=(name,attacks=[])=>({name,attacks});
const slot=card=>({getPokemonCard:()=>card});
function attackOutcome(score,responseScores=[],needsChoice=false) {
  const candidate={id:101,active:slot(pokemon('Candidate Active')),bench:[]};
  const opponent={id:202,active:slot(pokemon('Latias ex')),
    bench:responseScores.map(()=>slot(pokemon('Raging Bolt ex')))};
  const opponentRetreatResults={};
  for(let i=0;i<responseScores.length;i++) {
    opponentRetreatResults[i]={players:[candidate,opponent],baseScore:responseScores[i],prompts:[]};
  }
  return {players:[candidate,opponent],activePlayer:0,phase:'PLAYER_TURN',
    baseScore:score,opponentRetreatResults,prompts:needsChoice?[{}]:[]};
}
function board({active='Mimikyu',activeAttacks=['Filch','Copycat'],
  bench=['Shadow Rider Calyrex VMAX'],currentScores={Filch:10},
  currentResponseScores={},currentNeedsChoice={},maxGeistScores=[100],
  maxGeistResponseScores=[[]],maxGeistGameError=undefined,retreatLegal=[true],
  baseRetreatAction=undefined,baseAfterRetreat=null,throwUnexpectedOnAttack={},
  gameErrorOnAttack={}}={}) {
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
      retreatResults[i]={players:[nextPlayer,opponent],activePlayer:0,
        phase:'PLAYER_TURN',baseScore:0,
        attackResults:{'Max Geist':outcome},prompts:[],
        gameErrorOnAttack:maxGeistGameError?{'Max Geist':maxGeistGameError}:{}};
    }
  }
  if(baseAfterRetreat!==null&&baseRetreatAction) {
    retreatResults[baseRetreatAction.benchIndex]=baseAfterRetreat;
  }
  const attackResults={};
  for(const [name,score] of Object.entries(currentScores)) {
    if(score!==undefined)attackResults[name]=attackOutcome(score,
      currentResponseScores[name]??[],Boolean(currentNeedsChoice[name]));
  }
  return {players:[player,opponent],player,activePlayer:0,phase:'PLAYER_TURN',
    baseScore:0,attackResults,retreatResults,baseRetreatAction,prompts:[],
    throwUnexpectedOnAttack,gameErrorOnAttack};
}

function choose(state) {
  const tactic=new Tactic({arbiter:{},scores:{tactics:{attackBonus:100}}});
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
  const opponent={id:202,active:slot(pokemon('Latias ex')),bench:[]};
  const baseAfterRetreat={players:[otherAfterRetreat,opponent],activePlayer:0,
    phase:'PLAYER_TURN',baseScore:0,
    attackResults:{'Other attack':attackOutcome(130)},prompts:[]};
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

test('abstains when evaluating the current attack would require a player-choice prompt',()=>{
  const state=board({
    currentScores:{Filch:10},currentNeedsChoice:{Filch:true},maxGeistScores:[100]
  });
  assert.equal(choose(state),undefined);
});

test('abstains rather than treating an unexpected Simulator error as an unpayable attack',()=>{
  const state=board({
    currentScores:{Filch:10},maxGeistScores:[100],
    throwUnexpectedOnAttack:{Filch:true}
  });
  assert.equal(choose(state),undefined);
});

test('treats a known NOT_ENOUGH_ENERGY GameError as an unpayable Max Geist attack',()=>{
  const state=board({
    currentScores:{Filch:10},maxGeistScores:[100],
    maxGeistGameError:'NOT_ENOUGH_ENERGY'
  });
  assert.equal(choose(state),undefined);
});
