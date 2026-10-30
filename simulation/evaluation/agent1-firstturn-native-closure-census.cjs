'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent1-first-own-turn-native-closure-census-v1';

/**
 * Independently reconcile postdecision owner-hand receipts to accepted Store
 * root rows. This is an evidence-quality audit, never a player policy.
 * @param {object} scout Original unchanged-Store development archive.
 * @returns {object} All-attempt census, including errors and incomplete rows.
 */
function firstTurnNativeClosureCensus(scout){
  assert.equal(scout?.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  const rows=scout.developmentResult?.rows;
  assert.ok(Array.isArray(rows));
  assert.equal(rows.length,scout.summary?.attempts);
  const counts={
    attempted:rows.length,engineErrors:0,observedPass:0,
    observedNativeNonpass:0,incomplete:0
  };
  const receipts=[];
  for(const row of rows){
    const id=row.trial?.id;
    assert.equal(typeof id,'string');
    if(row.status!==undefined){
      counts.engineErrors++;
      receipts.push({id,status:'engine-error',reason:row.status});
      continue;
    }
    const aff=row.sourceFirstOwnedAffordances;
    assert.equal(aff?.schema,'agent1-source-first-owned-affordances-v2');
    assert.equal(aff.sourceActuallyFirst,row.sourceActuallyFirst);
    assert.equal(aff.sourceFirstOwnTurn,row.sourceActuallyFirst?1:2);
    assert.ok(aff.sourceSeat===0||aff.sourceSeat===1);
    const ledger=row.rootActionLedger;
    assert.ok(Array.isArray(ledger));
    assert.equal(row.rootActionCount,ledger.length);
    const first=ledger[aff.firstRootOrdinal];
    if(aff.firstOwnHand){
      assert.ok(first);
      assert.equal(first.actionOrdinal,aff.firstRootOrdinal);
      assert.equal(first.playerSlot,aff.sourceSeat);
      assert.equal(first.turnBefore,aff.sourceFirstOwnTurn);
      assert.equal(first.action,aff.firstRootAction);
    }
    const receipt={id,status:aff.status,sourceActuallyFirst:aff.sourceActuallyFirst,
      sourceSeat:aff.sourceSeat,firstRootOrdinal:aff.firstRootOrdinal,
      firstTurnClosure:aff.terminalKind,
      terminalOrdinal:aff.terminalPassRootOrdinal??aff.nativeTurnClosure?.ordinal??null};
    if(aff.status==='incomplete'){
      assert.equal(aff.terminalKind,null);
      counts.incomplete++;
    }else{
      assert.equal(aff.status,'observed');
      assert.ok(aff.firstOwnHand);
      if(aff.terminalKind==='pass'){
        counts.observedPass++;
        assert.ok(aff.terminalPassOwnHand);
        assert.equal(aff.nativeTurnClosure,null);
        const terminal=ledger[aff.terminalPassRootOrdinal];
        assert.ok(terminal);
        assert.equal(terminal.actionOrdinal,aff.terminalPassRootOrdinal);
        assert.equal(terminal.playerSlot,aff.sourceSeat);
        assert.equal(terminal.turnBefore,aff.sourceFirstOwnTurn);
        assert.equal(terminal.action,'PassTurnAction');
      }else{
        assert.equal(aff.terminalKind,'native-nonpass-turn-end');
        counts.observedNativeNonpass++;
        assert.equal(aff.terminalPassRootOrdinal,null);
        assert.equal(aff.terminalPassOwnHand,null);
        const end=aff.nativeTurnClosure;
        assert.ok(end);
        const native=ledger[end.ordinal];
        assert.ok(native);
        assert.equal(native.actionOrdinal,end.ordinal);
        assert.equal(native.playerSlot,aff.sourceSeat);
        assert.equal(native.turnBefore,aff.sourceFirstOwnTurn);
        assert.equal(native.turnAfter,aff.sourceFirstOwnTurn+1);
        assert.equal(native.action,end.action);
        assert.notEqual(native.action,'PassTurnAction');
        assert.ok(end.ordinal>=aff.firstRootOrdinal);
        const firstTurnSlice=ledger.slice(aff.firstRootOrdinal,end.ordinal+1);
        assert.ok(firstTurnSlice.every(r=>r.turnBefore===aff.sourceFirstOwnTurn),
          'Native closure improperly crosses a Store turn or reset boundary');
        assert.ok(!firstTurnSlice.some(r=>r.playerSlot===aff.sourceSeat&&
          r.action==='PassTurnAction'));
        receipt.nativeEndAction=end.action;
        receipt.initiatingRootActionOrdinal=end.initiatingRootActionOrdinal;
      }
    }
    receipts.push(receipt);
  }
  assert.equal(counts.attempted,
    counts.engineErrors+counts.observedPass+counts.observedNativeNonpass+
    counts.incomplete);
  return {schema:VERSION,registrationBlob:scout.registrationBlob,
    counts,receipts,competitiveQualifiedGames:0,
    limitation:'Accepted Store turn closure and actor-owned first hand only. No action legality, tactical quality, paper-clock or win-rate certification.'};
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'Usage: node agent1-firstturn-native-closure-census.cjs <scout.json>');
  const result=firstTurnNativeClosureCensus(JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={VERSION,firstTurnNativeClosureCensus};
