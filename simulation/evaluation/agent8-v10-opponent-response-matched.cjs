'use strict';
const assert=require('node:assert/strict');
const VERSION='agent8-v10-opponent-response-matched-v1';

/**
 * Read only publicly settled, nonprompt opponent actions in one game turn.
 * @param {object} row Full historical native attempt.
 * @param {0|1} seat Physical opponent seat.
 * @param {number} turn Global Store turn.
 * @returns {{complete:boolean,actions:Array<object>}}
 */
function opponentTurn(row,seat,turn){
  const actions=row.publicRootActions.filter(root=>
    root.playerSlot===seat&&root.turnBefore===turn&&
    root.action!=='ResolvePromptAction').map(root=>({
      action:root.action,card:root.card??null,attack:root.attack??null
    }));
  return {complete:actions.length>0&&
    actions.at(-1).action==='PassTurnAction',actions};
}

/**
 * Compare completed opponent actions under matched native physical starts.
 * Protects against false response assertions from a mere turn transition.
 * @param {object} control Full original native control receipt.
 * @param {object} treatment Full source-attack treatment receipt.
 * @returns {object}
 */
function compareMatchedOpponentTurns(control,treatment){
  assert.equal(control.attempts.length,8);
  assert.equal(treatment.attempts.length,8);
  const original=new Map(control.attempts.map(row=>[row.id,row]));
  assert.equal(original.size,8);
  const observed=[];
  for(const next of treatment.attempts){
    const prev=original.get(next.id);
    assert.ok(prev,'Unknown original source trial');
    assert.equal(prev.fullPhysicalDealFingerprint,
      next.fullPhysicalDealFingerprint,'Unmatched physical deal');
    assert.equal(prev.sourceDealFingerprint,next.sourceDealFingerprint);
    assert.equal(prev.actualStarterSeat,next.actualStarterSeat);
    const attacks=next.actualSourceAttackSettlement?.attacks??[];
    if(attacks.length===0)continue;
    assert.equal(attacks.length,1);
    const attack=attacks[0];
    assert.equal(attack.attackName,'Volt Cyclone');
    assert.equal(attack.settledPromptChain,true);
    assert.equal(attack.nextSourceSameEpochProven,true);
    assert.equal(attack.settlementCrossesClockReset,false);
    assert.equal(prev.actualSourceAttackSettlement?.declarations,0);
    assert.equal(prev.publicRootActionsTruncated,false);
    assert.equal(next.publicRootActionsTruncated,false);
    assert.equal(prev.publicRootLedgerDigestConsistent,true);
    assert.equal(next.publicRootLedgerDigestConsistent,true);
    const firstDifference=prev.publicRootActions.findIndex((root,index)=>
      JSON.stringify(root)!==JSON.stringify(next.publicRootActions[index]));
    assert.ok(firstDifference>=0);
    assert.equal(prev.publicRootActions[firstDifference].action,
      'PassTurnAction');
    assert.equal(next.publicRootActions[firstDifference].action,
      'PlayCardAction');
    assert.match(next.publicRootActions[firstDifference].card,
      /^Thunder Mountain/);
    const candidateSeat=1-next.originalSourceSeat;
    const root=next.publicRootActions.find(r=>
      r.actionOrdinal===attack.nextSourceRoot?.ordinal);
    assert.ok(root&&root.playerSlot===candidateSeat);
    assert.equal(root.action,attack.nextSourceRoot.action);
    assert.equal(root.turnBefore,attack.turnBefore+1);
    for(const offset of [1,3]){
      const turn=attack.turnBefore+offset;
      const before=opponentTurn(prev,candidateSeat,turn);
      const after=opponentTurn(next,candidateSeat,turn);
      const comparable=before.complete&&after.complete;
      observed.push({trialId:next.id,sourceAttackOrdinal:attack.actionOrdinal,
        sourceTurn:attack.turnBefore,candidateSeat,turn,
        controlActions:before.actions,treatmentActions:after.actions,
        status:!comparable?'censored':
          JSON.stringify(before.actions)===JSON.stringify(after.actions)?
            'identical':'changed'});
    }
  }
  return {schema:VERSION,originalTrials:8,
    attackingTrials:new Set(observed.map(row=>row.trialId)).size,
    comparableTurns:observed.filter(row=>row.status!=='censored').length,
    identicalTurns:observed.filter(row=>row.status==='identical').length,
    changedTurns:observed.filter(row=>row.status==='changed').length,
    censoredTurns:observed.filter(row=>row.status==='censored').length,
    competitiveGamesQualified:0,observed};
}
module.exports={VERSION,opponentTurn,compareMatchedOpponentTurns};
