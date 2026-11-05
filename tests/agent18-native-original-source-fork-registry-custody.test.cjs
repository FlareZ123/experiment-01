'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {validateOriginalSourceForkRoots:audit}=
  require('../simulation/evaluation/agent18-native-original-source-fork-registry-custody.cjs');
const h=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const before={action:'WaitForPlayerAction',playerSlot:0,turnBefore:1};
const pass={action:'PassTurnAction',playerSlot:1,turnBefore:3};
const tape=[before,pass];
const initial=()=>({id:'6:100:A:champion-reference',
  originalSourceSeat:1,publicRootActions:tape,
  publicRootActionsTruncated:false,publicRootActionCount:tape.length,
  publicRootLedgerDigestConsistent:true,
  publicRootLedgerSha256Computed:h(tape),
  publicRootLedgerSha256Reported:h(tape),
  fullPhysicalDealFingerprint:'f'.repeat(64),
  sourceDealFingerprint:'s'.repeat(64)});
const entry=()=>({key:'hypothesis',sourceRegistration:initial().id,
  sourceSeat:1,sourceTurn:3,sourcePassRootOrdinal:1,
  preRootSha256:h([before]),
  fullPhysicalDealSha256:'f'.repeat(64),
  sourceDealSha256:'s'.repeat(64)});
test('verified pretreatment Pass requires accepted Store tape and physical custody',()=>{
  const result=audit({attempts:[initial()]},{entries:[entry()]});
  assert.equal(result.expectedEntries,1);
  assert.equal(result.verifiedEntries,1);
  assert.equal(result.allIndexedOriginalPassesVerified,true);
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.previouslyTestedEffectsIndependentlyReverified,false);
});
test('tampered accepted action fails close even if reported ledger hash is stale',()=>{
  const changed=initial();
  changed.publicRootActions=[before,{...pass,action:'PlayCardAction'}];
  assert.equal(audit({attempts:[changed]},{entries:[entry()]})
    .entries[0].reason,'INCOMPLETE_OR_BAD_ORIGINAL_NATIVE_LEDGER');
});
test('correct tape cannot rescue incorrect source seat',()=>{
  const changed=initial();changed.originalSourceSeat=0;
  assert.equal(audit({attempts:[changed]},{entries:[entry()]})
    .entries[0].reason,'SOURCE_SEAT_OR_PHYSICAL_DEAL_MISMATCH');
});
test('incorrect original Pass turn or player is rejected',()=>{
  const changed=entry();changed.sourceTurn=2;
  assert.equal(audit({attempts:[initial()]},{entries:[changed]})
    .entries[0].reason,'ROOT_NOT_GENUINE_SOURCE_OWNER_PASS');
});
test('correct physical deal with wrong pre-root history hash is rejected',()=>{
  const changed=entry();changed.preRootSha256='0'.repeat(64);
  assert.equal(audit({attempts:[initial()]},{entries:[changed]})
    .entries[0].reason,'PRETREATMENT_ACCEPTED_ROOT_PREFIX_MISMATCH');
});
test('missing source arm and duplicate source arms retain distinct errors',()=>{
  const a=audit({attempts:[]},{entries:[entry()]});
  assert.equal(a.entries[0].reason,'MISSING_OR_DUPLICATE_ORIGINAL_SOURCE_ARM');
  const b=audit({attempts:[initial(),initial()]},{entries:[entry()]});
  assert.equal(b.entries[0].reason,'MISSING_OR_DUPLICATE_ORIGINAL_SOURCE_ARM');
});
