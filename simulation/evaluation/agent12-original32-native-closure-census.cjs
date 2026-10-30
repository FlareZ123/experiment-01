'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const {attestNativeTurnClosureLineage} =
  require('./agent12-native-turn-closure-lineage.cjs');

const VERSION = 'agent12-original32-full-turn-native-closure-census-v1';
const FROZEN_JSON_SHA256 =
  'd1f0b3663121592f3cf41a022f648cacff7e99fc3b74ee05cf54cbdea26984d7';

/**
 * Reconcile every original accepted Store root from a fixed canonical
 * 32-arm archive. All arms including native root caps remain in denominator.
 * A counted transition is not a game win or evidence of paper equivalence.
 * @param {object} archive Parsed original canonical prospective scout.
 * @returns {object} Public-only, failure-inclusive turn closure receipts.
 */
function original32NativeClosures(archive){
  assert.equal(archive.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  const rows=archive.developmentResult?.rows;
  assert.ok(Array.isArray(rows));
  assert.equal(rows.length,archive.summary?.attempts);
  const armReceipts=[],sourceTerminalCardPlays=[];
  const totals={attempts:rows.length,acceptedRoots:0,
    nativeTurnEnds:0,promptClosedTurnEnds:0,
    acceptedPassRoots:0,acceptedAttackRoots:0,
    terminalCardPlays:0,ambiguousAbilityRoots:0,unboundEnds:0,
    byRootFamily:{},byTerminalPromptType:{},opponentOwnedTerminalPrompts:0};
  const seen=new Set();
  for(const row of rows){
    assert.equal(typeof row.trial?.id,'string');
    assert.ok(!seen.has(row.trial.id),'Repeated original registered arm');
    seen.add(row.trial.id);
    const ledger=row.rootActionLedger;
    assert.ok(Array.isArray(ledger));
    assert.equal(ledger.length,row.rootActionCount,
      'A capped or unfinished arm still requires full accepted-root ledger');
    const receipt=attestNativeTurnClosureLineage(ledger);
    const n=receipt.counts;
    assert.equal(n.ledgerRoots,ledger.length);
    totals.acceptedRoots+=ledger.length;
    totals.nativeTurnEnds+=n.nativeTurnEnds;
    totals.promptClosedTurnEnds+=n.promptClosedTerminals;
    totals.acceptedPassRoots+=n.byFamily.pass??0;
    totals.acceptedAttackRoots+=n.byFamily.attack??0;
    totals.terminalCardPlays+=n.byFamily['card-play']??0;
    totals.ambiguousAbilityRoots+=n.ambiguousAbilityTerminals;
    totals.unboundEnds+=n.unresolvedTerminals;
    totals.opponentOwnedTerminalPrompts+=n.opponentOwnedTerminalPrompts;
    for(const [promptType,count] of Object.entries(n.promptTerminalTypes)){
      totals.byTerminalPromptType[promptType]=
        (totals.byTerminalPromptType[promptType]??0)+count;
    }
    for(const [family,count] of Object.entries(n.byFamily)){
      totals.byRootFamily[family]=(totals.byRootFamily[family]??0)+count;
    }
    for(const closure of receipt.closures.filter(c=>c.actionFamily==='card-play')){
      sourceTerminalCardPlays.push({
        trialId:row.trial.id,rank:row.trial.rank,
        actorSeat:closure.actorSeat,
        isSourceActor:closure.actorSeat===row.sourceSeat,
        sourceActuallyFirst:row.sourceActuallyFirst,
        turn:closure.turnBefore,
        rootOrdinal:closure.initiatingRootOrdinal,
        terminalOrdinal:closure.terminalOrdinal,
        terminalPrompt:closure.terminalAction,
        cardName:closure.initiatingCardName
      });
    }
    armReceipts.push({trialId:row.trial.id,
      nativeRoots:ledger.length,nativeTurnEnds:n.nativeTurnEnds,
      passes:n.byFamily.pass??0,attacks:n.byFamily.attack??0,
      cardPlays:n.byFamily['card-play']??0,
      unbound:n.unresolvedTerminals});
  }
  assert.equal(totals.nativeTurnEnds,
    Object.values(totals.byRootFamily).reduce((a,b)=>a+b,0)+
    totals.unboundEnds,
    'Unaccounted native terminal root family; investigate before inference');
  assert.equal(totals.nativeTurnEnds,
    Object.values(totals.byTerminalPromptType).reduce((a,b)=>a+b,0)+
    totals.unboundEnds,'All turn advances must have classified prompt closure');
  return {version:VERSION,totals,armReceipts,sourceTerminalCardPlays,
    noGameStrengthClaim:true,competitiveQualifiedGames:0};
}

/**
 * Frozen original 32-arm artifact receipt; only SHA-verified extracted JSON
 * from documented GitHub Action archive may pass this source-identity gate.
 * @param {Buffer} bytes Original unmodified extracted JSON bytes.
 */
function frozenOriginal32NativeClosures(bytes){
  const hash=createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash,FROZEN_JSON_SHA256,
    'Refusing to relabel a different archive as the original 32 arms');
  return {sourceJsonSha256:hash,
    ...original32NativeClosures(JSON.parse(bytes.toString('utf8')))};
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'Supply the extracted original preregistered 32-arm JSON path');
  const results=frozenOriginal32NativeClosures(fs.readFileSync(file));
  process.stdout.write(JSON.stringify(results,null,2)+'\n');
}

module.exports={VERSION,FROZEN_JSON_SHA256,
  original32NativeClosures,frozenOriginal32NativeClosures};
