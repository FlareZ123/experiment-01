'use strict';

const assert=require('node:assert/strict');
const {runOne}=require('../agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  withInstanceScopedSimultaneousTerminalResolutionV4
}=require('./agent37-simultaneous-terminal-v4-adapter.cjs');
const {DrawPrizesEffect}=
  require('../../../vendor/twinleaf/ptcg-server/output/game/store/effects/game-effects');
const {GameWinner}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');

/**
 * Inject a second native DrawPrizesEffect for a recipient already processed
 * inside the real TAKE_SPECIFIC_PRIZES transaction, or veto that recipient's
 * original physical Prize transfer. This is a deliberately abnormal queue
 * replay, testing safety rather than modeling an ordinary game.
 *
 * @param {number} recipientId The recipient of the manually completed group.
 * @param {'duplicate'|'prevent'} intervention
 * @returns {(store:any,execute:()=>any)=>{result:any,audit:object}}
 */
function withInjectedPrizeEffect(recipientId,intervention){
  return (store,execute)=>withInstanceScopedSimultaneousTerminalResolutionV4(
    store,()=>{
      const priorReduce=store.reduceEffect;
      let injected=0;
      store.reduceEffect=function(state,effect){
        const selected=effect instanceof DrawPrizesEffect&&
          effect.player.id===recipientId;
        if(selected&&intervention==='prevent'&&injected===0){
          injected++;
          effect.preventDefault=true;
        }
        const result=priorReduce.call(store,state,effect);
        if(selected&&intervention==='duplicate'&&injected===0){
          injected++;
          const duplicate=new DrawPrizesEffect(
            effect.player,effect.prizes,effect.destination
          );
          assert.strictEqual(priorReduce.call(store,state,duplicate),state);
          assert.equal(duplicate.preventDefault,true,
            'replayed native Prize effect must be vetoed before reduction');
        }
        return result;
      };
      const result=execute();
      assert.equal(injected,1,'must exercise the selected native Prize group');
      return result;
    }
  );
}

/** @returns {object} Original pinned Store Prize-effect replay regression. */
function run(){
  const rows=[];
  for(const actorSeat of [0,1]){
    const manualRecipientId=actorSeat===0?202:101;
    const fixture={
      enemyActiveName:'Shadow Rider Calyrex VMAX CRE',
      enemyEvolutionBaseName:'Shadow Rider Calyrex V CRE',
      enemyActiveDamage:260,
      ownerPrizes:1,
      enemyPrizes:1,
      stopAfterAttack:true
    };
    const {result,audit}=runOne(actorSeat,
      withInjectedPrizeEffect(manualRecipientId,'duplicate'),
      6,true,true,true,fixture);
    assert.equal(result.finished,true);
    assert.equal(result.winner,GameWinner.DRAW);
    assert.equal(result.ownerPrizesRemaining,0);
    assert.equal(result.opponentPrizesRemaining,0);
    assert.equal(result.ownerPrizesTakenThisTurn,1);
    assert.equal(result.opponentPrizesTakenThisTurn,1);
    assert.equal(audit.simultaneousTerminalCandidate,true);
    assert.equal(audit.bothPrizeTransfersCompleted,true);
    assert.equal(audit.nativeDuplicatePrizeEffectSuppressed,1);
    assert.equal(audit.storeReduceRestored,true);
    assert.equal(audit.storeLogRestored,true);
    rows.push({
      actorSeat,
      ownerPrizesTaken:result.ownerPrizesTakenThisTurn,
      opponentPrizesTaken:result.opponentPrizesTakenThisTurn,
      guardedDuplicateEffects:audit.nativeDuplicatePrizeEffectSuppressed,
      winner:result.winner
    });

    assert.throws(()=>runOne(actorSeat,
      withInjectedPrizeEffect(manualRecipientId,'prevent'),
      6,true,true,true,fixture),
    /armed simultaneous terminal must complete second Prize transfer/,
    'invalid transfer must fail closed instead of preserving native winner');
  }
  return {
    schema:'agent37-simultaneous-terminal-v4-duplicate-and-fail-closed-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    auditedPhysicalSeats:[0,1],
    nativeDuplicateEffectsVetoed:2,
    incompleteTransfersRejected:2,
    competitivelyQualifiedGames:0,
    rows
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
