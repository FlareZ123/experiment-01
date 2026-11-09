'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const VERSION = 'agent29-rank9-v11-physical-paired-decision-reducer-v1';

/**
 * Read-only reduction of the registered original rank-9 paired native archive.
 * An uncompleted control is censored and never classified as a loss.
 * Exact source-deal identity is checked before making any paired claim.
 * @param {object} archive Unmodified v11 Actions artifact JSON.
 * @returns {object} Paired native outcomes and evidence/qualification gates.
 */
function reduce(archive) {
  assert.equal(archive.version,
    'agent29-rank9-same-deal-bomb-to-floatstone-v11');
  assert.equal(archive.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(archive.floatV11,true);
  assert.equal(archive.v11ControlUsesFullV10SourceLine,true);
  assert.equal(archive.allDealsMatch,true);
  assert.equal(archive.actualAttempts,32);
  assert.equal(archive.pairs.length,16);
  assert.equal(archive.control.rows.length,16);
  assert.equal(archive.treatment.rows.length,16);
  const rows = archive.pairs.map((pair,index) => {
    const a = archive.control.rows[index];
    const b = archive.treatment.rows[index];
    assert.equal(pair.fullPhysicalDealEqual,true);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceDeckFingerprint,b.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,b.candidateDeckFingerprint);
    assert.deepEqual(a.trial,b.trial);
    const left=a.rootActionLedger;
    const right=b.rootActionLedger;
    assert.ok(Array.isArray(left)&&Array.isArray(right));
    const limit=Math.min(left.length,right.length);
    let firstDifferentRoot=null;
    for(let i=0;i<limit;i++) {
      if(JSON.stringify(left[i])!==JSON.stringify(right[i])) {
        firstDifferentRoot=i;
        break;
      }
    }
    if(firstDifferentRoot===null&&left.length!==right.length)
      firstDifferentRoot=limit;
    const changed=firstDifferentRoot!==null;
    const firstReplacement=changed?right[firstDifferentRoot]??null:null;
    const sourceSeat=pair.seat;
    const sourceRoots=right.filter(x=>x.playerSlot===sourceSeat);
    const firstFloat=sourceRoots.find(x=>x.action==='PlayCardAction'&&
      x.card==='Float Stone')??null;
    const firstRetreat=sourceRoots.find(x=>x.action==='RetreatAction')??null;
    const claws=sourceRoots.filter(x=>x.action==='AttackAction'&&
      x.attack==='Claw of Darkness');
    const strictClaws=(b.sourceAttackSettlement?.attacks??[])
      .filter(x=>x.attackName==='Claw of Darkness');
    const firstClaw=claws[0]??null;
    const opponentResponse=firstClaw?right.filter(x=>
      x.playerSlot!==sourceSeat&&
      x.turnBefore===firstClaw.turnBefore+1&&
      x.pendingPrompt===null).map(x=>({
        root:x.actionOrdinal,action:x.action,
        card:x.card??null,attack:x.attack??null
      })):[];
    if(changed) {
      assert.ok(firstReplacement,'Diverged pair missing treatment root');
      assert.equal(firstReplacement.action,'PlayCardAction');
      assert.equal(firstReplacement.card,'Float Stone');
      assert.equal(firstReplacement.playerSlot,sourceSeat);
      assert.equal(firstFloat?.actionOrdinal,firstReplacement.actionOrdinal);
      assert.equal(firstRetreat?.actionOrdinal,firstFloat.actionOrdinal+1);
      assert.equal(firstClaw?.actionOrdinal,firstRetreat.actionOrdinal+1);
      assert.equal(a.finished,false);
      assert.equal(b.finished,true);
      assert.equal(b.winner,sourceSeat);
      assert.equal(b.physicalZoneQualification?.physicalIntegrityQualified,true);
    }
    return {
      id:pair.id, sourceSeat, physicalDealMatched:true,
      control:{status:pair.baselineStatus,winner:pair.baselineWin,
        roots:left.length,prizes:a.finalPrizes},
      treatment:{status:pair.treatmentStatus,winner:pair.treatmentWin,
        roots:right.length,prizes:b.finalPrizes},
      firstDifferentRoot,
      changed,
      sourceFloatStoneRoot:firstFloat?.actionOrdinal??null,
      sourceRetreatRoot:firstRetreat?.actionOrdinal??null,
      sourceFirstClawRoot:firstClaw?.actionOrdinal??null,
      sourceFirstClawGlobalTurn:firstClaw?.turnBefore??null,
      sourceClawRootCount:claws.length,
      strictClawSettlementCount:strictClaws.filter(x=>x.settledPromptChain===true).length,
      firstNextTurnOpponentRoots:opponentResponse,
      nativeOriginalOwnerIntegrityQualified:
        b.physicalZoneQualification?.originalOwnerIntegrityQualified===true,
      paperCompetitiveQualified:b.qualifiesForCompetitiveInference===true
    };
  });
  const changed=rows.filter(x=>x.changed);
  assert.equal(changed.length,2);
  return {
    schema:VERSION, researchHead:archive.researchHead,
    enginePin:archive.enginePin,
    physicalPairedGroups:archive.matchedPhysicalGroups,
    actualNativeAttempts:archive.actualAttempts,
    exactMatchedPairs:rows.filter(x=>x.physicalDealMatched).length,
    identicalEntireNativeRootLedgers:rows.filter(x=>!x.changed).length,
    nativeControlTerminals:rows.filter(x=>x.control.status==='finished').length,
    nativeTreatmentTerminals:rows.filter(x=>x.treatment.status==='finished').length,
    nativeControlCaps:rows.filter(x=>x.control.status==='capped').length,
    nativeTreatmentCaps:rows.filter(x=>x.treatment.status==='capped').length,
    censoredToNativeSourceWin:changed.length,
    completedToOppositeWinnerReversals:0,
    changedPairs:changed,
    competitivelyQualifiedGames:0,
    warning:'Native capped controls are censored. Strict Claw settlement flags only 1 later attack per changed match. Bot opponent continuation and owner integrity remain unqualified.'
  };
}

module.exports={VERSION,reduce};

if(require.main===module) {
  assert.ok(process.argv[2], 'Provide an archived native v11 JSON filepath');
  process.stdout.write(JSON.stringify(reduce(JSON.parse(
    fs.readFileSync(process.argv[2],'utf8'))),null,2)+'\n');
}
