'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {installLeleEntryAbilityLockHook}=
  require('../simulation/twinleaf/lele-entry-ability-lock-hook.cjs');
const {withOwnerWonderTagPrompts}=
  require('../simulation/twinleaf/agent8-owner-wondertag-prompt.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {TapuLeleGX}=require(path.join(base,
  'sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx'));

/**
 * Test both orders of two research-side prototype wrappers. The entry guard
 * must suppress a Rule Box Ability while active Initialization applies and
 * leave the native no-lock Wonder Tag offer intact.
 * @param {0|1} seat
 * @param {6|10} sourceOpponentRank
 * @param {'guard-first'|'owner-policy-first'} order
 * @returns {object}
 */
function witness(seat,sourceOpponentRank,order){
  const act=()=>{
    const x=stage(seat,sourceOpponentRank);
    const lele=x.owner.hand.cards.find(c=>c.fullName==='Tapu Lele-GX GRI');
    assert.ok(lele);
    const active=x.opponent.active.getPokemonCard()?.fullName;
    x.store.dispatch(new x.PlayCardAction(
      x.owner.id,x.owner.hand.cards.indexOf(lele),{
        player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
      }));
    return {seat,sourceOpponentRank,active,playedLele:
      x.owner.bench[4].getPokemonCard()===lele,
      leleLeftHand:!x.owner.hand.cards.includes(lele),
      actualPending:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)};
  };
  const before=Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  let owner;
  if(order==='guard-first'){
    const restore=installLeleEntryAbilityLockHook();
    try{owner=withOwnerWonderTagPrompts(act);}
    finally{restore();}
  }else{
    owner=withOwnerWonderTagPrompts(()=>{
      const restore=installLeleEntryAbilityLockHook();
      try{return act();}
      finally{restore();}
    });
  }
  const after=Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  assert.strictEqual(after.value,before.value,
    'Both reversible hooks must restore original native reducer');
  return {order,...owner.result,
    ownerAudit:{confirmOffers:owner.audit.confirmOffers,
      searchOffers:owner.audit.searchOffers,
      nativeAccepted:owner.audit.nativeAccepted,
      wholePolicyInformationSafe:owner.audit.wholePolicyInformationSafe},
    competitiveGamesQualified:0};
}

test('existing entry guard composes with exact owner Wonder Tag adapter in both hook orders and both seats',()=>{
  for(const order of ['guard-first','owner-policy-first']){
    for(const seat of [0,1]){
      for(const rank of [6,10]){
        const row=witness(seat,rank,order);
        console.log('AGENT1_WONDERTAG_EXISTING_GUARD_COMPOSED',
          JSON.stringify(row));
        assert.equal(row.playedLele,true);
        assert.equal(row.leleLeftHand,true);
        if(rank===6){
          assert.equal(row.active,'Iron Thorns ex TWM');
          assert.deepEqual(row.actualPending,[]);
          assert.equal(row.ownerAudit.confirmOffers,0);
        }else{
          assert.equal(row.active,'Regidrago V SIT');
          assert.deepEqual(row.actualPending,['ConfirmPrompt']);
          assert.equal(row.ownerAudit.confirmOffers,1);
        }
        assert.equal(row.ownerAudit.nativeAccepted,0);
        assert.equal(row.competitiveGamesQualified,0);
      }
    }
  }
});
