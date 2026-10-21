'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerRecoverySnapshot,withOwnedTurnRootReadObserver}=
  require('../simulation/twinleaf/agent23-source-owner-turn7-read-observer.cjs');
function view(){
  const pok=(printing,energies=[],tools=[])=>({
    printing,damage:0,energies,tools,attacks:[
      {name:'Attack',cost:[7,7],damage:100}],
    printed:{retreatCost:[9,9,9]}
  });
  return {
    decisionKind:'owner-root',globalTurn:7,actorSeat:0,
    ownHand:['Float Stone BKT','Guzma BUS','Crobat V DAA'],
    ownPublic:{
      active:pok('Garbodor BKP'),
      bench:[pok('Mega Absol ex MEG',['Darkness Energy MEE'])],
      discard:['Float Stone BKT']
    },
    opponentPublic:{active:pok('Lunatone OBF')},
    ownTurnResources:{
      supporterPlayedTurn:0,retreatedTurn:0,energyPlayedTurn:5
    }
  };
}
test('owner-visible recovery census preserves 3-E Garbodor and public discard',()=>{
  const result=ownerRecoverySnapshot(view());
  assert.equal(result.heldRecoveryPrintings['Float Stone BKT'],1);
  assert.equal(result.heldRecoveryPrintings['Guzma BUS'],1);
  assert.equal(result.heldRecoveryPrintings['Escape Rope BST'],0);
  assert.equal(result.publicDiscardFloatStone,1);
  assert.deepEqual(result.active.retreatCost,[9,9,9]);
  assert.deepEqual(result.active.tools,[]);
  assert.equal(result.benched[0].energies.length,1);
  assert.equal(result.opponentHandIdentityInspected,false);
});
test('one eligible live owner root is observed with unchanged selected action',()=>{
  class PassTurnAction {}
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(){return new PassTurnAction();}
  }
  const original=Bot.prototype.decodeNextAction;
  const sameState={turn:7,activePlayer:0,prompts:[],
    players:[{id:101},{id:202}]};
  const priorView=view();
  const ownSource=structuredClone(sameState);
  const headless={runMatch(){
    const bot=new Bot();
    const before=bot.decodeNextAction({...sameState,turn:5});
    const real=bot.decodeNextAction(sameState);
    return {before:before.constructor.name,real:real.constructor.name};
  }};
  const originalRun=headless.runMatch;
  const observed=withOwnedTurnRootReadObserver(Bot,()=>headless.runMatch(),{
    seat:0,turn:7
  },{headless,makeObservation:()=>priorView});
  assert.deepEqual(observed.result,{before:'PassTurnAction',
    real:'PassTurnAction'});
  assert.equal(observed.observationAudit.matchCalls,1);
  assert.equal(observed.observationAudit.seenRoots,1);
  assert.equal(observed.observationAudit.hookErrors,0);
  assert.equal(observed.observationAudit.boundedRoots.length,1);
  assert.equal(observed.observationAudit.boundedRoots[0].root.turn,7);
  assert.equal(observed.observationAudit.boundedRoots[0].nativeChosenAction,
    'PassTurnAction');
  assert.deepEqual(sameState,ownSource);
  assert.strictEqual(headless.runMatch,originalRun);
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
test('failed read is explicitly counted without changing native decision',()=>{
  class Bot{
    constructor(){this.client={id:202};}
    decodeNextAction(){return {type:'native-original'};}
  }
  const state={turn:7,activePlayer:1,prompts:[],
    players:[{id:101},{id:202}]};
  const headless={runMatch:()=>new Bot().decodeNextAction(state)};
  const observed=withOwnedTurnRootReadObserver(Bot,
    ()=>headless.runMatch(),{seat:1,turn:7},{
      headless,makeObservation:()=>{throw Error('bad actor state');}
    });
  assert.equal(observed.result.type,'native-original');
  assert.equal(observed.observationAudit.hookErrors,1);
  assert.match(observed.observationAudit.boundedRoots[0].observationError,
    /bad actor state/);
});
test('observer always restores original hooks if native game throws',()=>{
  class Bot{decodeNextAction(){return null;}}
  const original=Bot.prototype.decodeNextAction;
  const headless={runMatch(){throw Error('engine failed');}};
  const before=headless.runMatch;
  assert.throws(()=>withOwnedTurnRootReadObserver(Bot,
    ()=>headless.runMatch(),{seat:0,turn:7},{headless}),
  /engine failed/);
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
  assert.strictEqual(headless.runMatch,before);
});
