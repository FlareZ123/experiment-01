'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy,VERSION}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {VERSION:ARBITRATION}=
  require('../simulation/twinleaf/agent41-owner-root-arbitration.cjs');
const {VERSION:QUICK}=
  require('../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs');
const {VERSION:PUBLIC_SPECIAL}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');

function profile(opts={}){
  class FakeBot{decodeNextAction(){return null;}}
  class FakeStore{dispatch(){return true;}}
  class PlayCardAction{}
  const classes={
    SimpleTacticsAi:FakeBot,Store:FakeStore,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction:class{},PassTurnAction:class{}},
    getCatalog:()=>({}),
    ...opts
  };
  const originalBot=FakeBot.prototype.decodeNextAction;
  const originalDispatch=FakeStore.prototype.dispatch;
  const out=withActorOnlyRootPolicy(()=>55,classes);
  assert.equal(out.result,55);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,originalBot);
  assert.strictEqual(FakeStore.prototype.dispatch,originalDispatch);
  return out.audit;
}

test('combining Quick Ball with arbiter preserves both version identifiers',()=>{
  const audit=profile({quickBallRoot:true,terminalArbitration:true,
    publicContextSpecialEnergy:true});
  assert.ok(audit.version.startsWith(VERSION+'+'));
  assert.ok(audit.version.includes(ARBITRATION));
  assert.ok(audit.version.includes(QUICK));
  assert.ok(audit.version.includes(PUBLIC_SPECIAL));
  assert.equal(audit.terminalArbitrationOptIn,true);
  assert.equal(audit.terminalArbitration.ownerRoots,0);
  assert.equal(audit.competitiveGameQualified,false);
});

test('disabled arbitration leaves the original version and audit shape',()=>{
  const audit=profile({terminalArbitration:false,quickBallRoot:false,
    publicContextSpecialEnergy:false});
  assert.equal(audit.version,VERSION);
  assert.equal(Object.hasOwn(audit,'terminalArbitrationOptIn'),false);
  assert.equal(Object.hasOwn(audit,'terminalArbitration'),false);
});

test('enabling Quick Ball alone retains root provenance without extra profile',()=>{
  const audit=profile({quickBallRoot:true,terminalArbitration:false});
  assert.equal(audit.version,VERSION+'+'+QUICK);
});
