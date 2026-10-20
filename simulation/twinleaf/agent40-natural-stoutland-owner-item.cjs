'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {SEED,SOURCE_SEAT,OWNER_SEAT,ORIGINAL_HAND,ORIGINAL_LEDGER_SHA256,replayArm}=
  require('./agent40-natural-sentinel-owner-carmine.cjs');
const HELD_ITEM='Mysterious Treasure FLI';

/** @returns {object} */
function runAudit(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const a=manifest.decks.find(x=>x.rank===2);
  const b=manifest.decks.find(x=>x.rank===1);
  assert.equal(a?.cardIds.length,60);
  assert.equal(b?.cardIds.length,60);
  const original=replayArm(false,a.cardIds,b.cardIds);
  assert.equal(original.error,null);
  assert.equal(original.firstChoice?.originalBotAction,'PassTurnAction');
  assert.equal(original.windowNativeOrdinal,98);
  assert.deepEqual(original.firstChoice.ownerView.ownerHand,ORIGINAL_HAND);
  assert.equal(original.game?.rootLedgerSHA256,ORIGINAL_LEDGER_SHA256);
  const item=replayArm(true,a.cardIds,b.cardIds,{target:HELD_ITEM});
  assert.deepEqual(item.firstChoice?.ownerView,original.firstChoice.ownerView);
  assert.equal(item.windowNativeOrdinal,98);
  assert.equal(item.actionAtOriginalWindow,'PlayCardAction');
  assert.equal(item.nativeAttempt?.playedPrintedCard,HELD_ITEM);
  const attempt=item.nativeAttempt;
  return {
    schema:'agent40-natural-stoutland-owner-held-item-root-v1',
    seed:SEED,sourceSeat:SOURCE_SEAT,ownerSeat:OWNER_SEAT,
    sourceRank:2,opponentRank:1,targetItem:HELD_ITEM,
    retrospectiveSelectedState:true,
    expectedOriginalRootLedgerSHA256:ORIGINAL_LEDGER_SHA256,
    original,item,
    realNativeRootAccepted:attempt.status==='accepted',
    physicallyRemovedHeldItemOnRoot:attempt.status==='accepted'&&
      attempt.physicallyInHandBefore===true&&
      attempt.physicallyInHandAfter===false,
    completedCardSearchEffectProven:false,
    competitivelyQualifiedGames:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={HELD_ITEM,runAudit};
