'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  VERSION,ownerSnapshot,withShadowMistOwnerPassWitness,
  summarizeShadowMistPasses
}=require('../simulation/twinleaf/agent7-shadowmist-owner-lock-witness.cjs');

const player=(id,hand,options={})=>({
  id,hand:{cards:hand.map(fullName=>({fullName,canPlay:()=>true}))},
  active:{energies:{cards:[]}},bench:[],
  cannotPlaySpecialEnergyCards:false,cannotPlayStadiumCards:false,
  cannotPlayItemCards:false,cannotPlaySupporterCards:false,
  energyPlayedTurn:-1,...options
});
const source=()=>player(102,[
  'Speed Lightning Energy RCL','Spiky Energy JTG',
  'Thunder Mountain Prism Star LOT','Crushing Hammer POR','Guzma BUS'
],{
  cannotPlaySpecialEnergyCards:true,cannotPlayStadiumCards:true,
  energyPlayedTurn:1
});

test('actual owner card categories and player-level lock flags are redacted',()=>{
  const p=ownerSnapshot(source(),3,1);
  assert.equal(p.knownRank6SpecialEnergyHeld,2);
  assert.equal(p.knownRank6StadiumHeld,1);
  assert.equal(p.knownRank6TrainerResponsesHeld,2);
  assert.equal(p.knownRank6CrushingHammerHeld,1);
  assert.equal(p.nativeCrushingHammerPreliminaryCanPlay,null);
  assert.equal(p.nativeSpecialEnergyPlayLocked,true);
  assert.equal(p.nativeStadiumPlayLocked,true);
  assert.equal(p.normalEnergyAttachmentUsed,false);
  assert.equal(p.exactHeldPrintingsArchived,false);
  assert.equal(JSON.stringify(p).includes('Spiky Energy JTG'),false);
  assert.equal(JSON.stringify(p).includes('Guzma BUS'),false);
});

test('genuine Store Pass observer preserves native dispatch and restores prototype',()=>{
  class AddPlayerAction{}
  class PassTurnAction{}
  class Store{
    constructor(){this.state={phase:2,turn:3,activePlayer:1,
      players:[],prompts:[]};}
    dispatch(action){
      if(action instanceof AddPlayerAction){
        if(this.state.players.length===0)this.state.players=[player(101,[],
          {active:{energies:{cards:[{fullName:'Psychic Energy MEE'}]}}})];
        else this.state.players.push(source());
      }
      return action;
    }
  }
  const before=Store.prototype.dispatch;
  const payload=withShadowMistOwnerPassWitness(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AddPlayerAction());
    const action=new PassTurnAction();
    assert.strictEqual(store.dispatch(action),action);
    return 'unchanged';
  },{Store,GamePhase:{PLAYER_TURN:2}});
  assert.equal(payload.result,'unchanged');
  assert.strictEqual(Store.prototype.dispatch,before);
  assert.equal(payload.audit.physicalStores,1);
  assert.equal(payload.audit.games[0].passes.length,1);
  assert.equal(payload.audit.games[0].passes[0].turn,3);
  assert.equal(payload.audit.games[0].passes[0].nativeSpecialEnergyPlayLocked,true);
  assert.equal(payload.audit.games[0].passes[0].nativeCrushingHammerPreliminaryCanPlay,true);
  assert.equal(payload.audit.games[0].passes[0].opponentPublicEnergyCardCount,1);
});

test('native observer always restores Store method after a thrown error',()=>{
  class Store{dispatch(){return null;}}
  const original=Store.prototype.dispatch;
  assert.throws(()=>withShadowMistOwnerPassWitness(()=>{
    throw new Error('native-abort');
  },{Store,GamePhase:{PLAYER_TURN:2}}),/native-abort/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

function root(n,turn,seat,action,attack=null){
  return {actionOrdinal:n,turnBefore:turn,playerSlot:seat,action,attack};
}
const roots=[
  root(0,2,0,'AttackAction','Shadow Mist'),
  root(1,2,0,'ResolvePromptAction'),
  root(2,3,1,'ResolvePromptAction'),
  root(3,3,1,'PassTurnAction'),
  root(4,4,0,'AttackAction','Shadow Mist'),
  root(5,5,1,'PlayCardAction'),
  root(6,5,1,'PassTurnAction')
];
const row={trial:{id:'6:synthetic:A:champion-reference'},
  sourceSeat:1,status:'returned-unqualified',rootActionLedger:roots};
const ownerPass=turn=>ownerSnapshot(source(),turn,1);
const audit={games:[{passes:[ownerPass(3),ownerPass(5)]}]};

test('accepted attack followed by source Pass is distinguished from source card play',()=>{
  const result=summarizeShadowMistPasses([row],audit);
  assert.equal(result.version,VERSION);
  assert.equal(result.arms[0].shadowMistReplyWindows.length,2);
  assert.equal(result.arms[0].shadowMistNextTurnSourcePasses,1);
  assert.equal(result.arms[0].shadowMistReplyWindows[0].sourceFirstReplyOrdinal,3);
  assert.equal(result.arms[0].shadowMistReplyWindows[0]
    .sourcePassLockWitness.knownRank6SpecialEnergyHeld,2);
  assert.equal(result.arms[0].shadowMistReplyWindows[1].sourceFirstReplyAction,
    'PlayCardAction');
  assert.equal(result.arms[0].shadowMistReplyWindows[1]
    .sourcePassLockWitness,null);
  assert.equal(result.competitivelyQualifiedGames,0);
});

test('unmatched Store count, missing source snapshot and bad root ordinal fail closed',()=>{
  assert.throws(()=>summarizeShadowMistPasses([row],{games:[]}));
  assert.throws(()=>summarizeShadowMistPasses([row],
    {games:[{passes:[]}]}),/one actual owner snapshot/);
  const altered={...row,rootActionLedger:roots.map((v,i)=>
    i===4?{...v,actionOrdinal:9}:v)};
  assert.throws(()=>summarizeShadowMistPasses([altered],audit),/complete native/);
});
