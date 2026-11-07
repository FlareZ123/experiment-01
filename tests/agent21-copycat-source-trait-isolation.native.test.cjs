'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probeAttackOrder}=
  require('../simulation/twinleaf/agent8-mimikyu-burrow-native.cjs');
const {installMimikyuCopycatSourceTraitIsolationHook}=
  require('../simulation/twinleaf/agent21-copycat-source-trait-isolation.cjs');

for(const sourceSeat of [0,1]){
  for(const [firstAttack,secondAttack] of [
    ['Rototiller','Burrow'],
    ['Burrow','Rototiller']
  ]){
    for(const copycatChoice of ['engine','second']){
      test('Mimikyu Copycat isolates Bunnelby Ω Barrage source trait: '+
          sourceSeat+' '+firstAttack+'/'+secondAttack+' '+copycatChoice,()=>{
        const isolationEvents=[];
        const restore=installMimikyuCopycatSourceTraitIsolationHook({
          onIsolation:event=>isolationEvents.push(event)
        });
        try{
          let result,error;
          try{
            result=probeAttackOrder(
              sourceSeat,firstAttack,secondAttack,copycatChoice
            );
          }catch(caught){
            error=caught;
          }
          assert.ok(isolationEvents.length>0,
            'Source-trait hook did not see a Barrage power: '+JSON.stringify(isolationEvents));
          assert.equal(isolationEvents[0].sourceCardName,'Bunnelby');
          if(error)throw error;
          const expected=copycatChoice==='second'?secondAttack:firstAttack;
          assert.equal(result.copycatExecutedAttack,expected);
          assert.equal(result.adapterOverrideApplied,copycatChoice==='second');
          assert.deepEqual(result.historyAttackNames,[firstAttack,secondAttack]);
          assert.deepEqual(result.unresolvedPrompts,[]);
          assert.ok(!result.copycatPrompts.includes('ConfirmPrompt'),
            'Copied attack must not inherit Ω Barrage');
          assert.ok(!result.copycatPrompts.includes('ChooseAttackPrompt'),
            'Copied attack must not open another Barrage attack choice');
          if(expected==='Burrow'){
            assert.equal(result.sourceDeckDelta,-2);
            assert.equal(result.sourceDiscardDelta,1);
            assert.equal(result.sourceHandDelta,1);
            assert.equal(result.sourceTopMovedToDiscard,true);
            assert.equal(result.sourceNextTopMovedToHand,true);
            assert.equal(result.mimikyuDeckDelta,0);
            assert.equal(result.mimikyuRecoverySelected,false);
          }else{
            assert.equal(result.sourceDeckDelta,-1);
            assert.equal(result.sourceDiscardDelta,0);
            assert.equal(result.sourceHandDelta,1);
            assert.equal(result.sourceTopMovedToHand,true);
            assert.equal(result.mimikyuDeckDelta,1);
            assert.equal(result.mimikyuDiscardDelta,-1);
            assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
            assert.equal(result.mimikyuRecoverySelected,true);
          }
        }finally{
          restore();
        }
      });
    }
  }
}
