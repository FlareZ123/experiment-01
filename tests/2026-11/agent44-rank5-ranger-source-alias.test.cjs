'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {rootLabelMatchesNativePrinting,auditNativeTargetRootLinkage}=
  require('../../simulation/twinleaf/native-accepted-target-store-observer.cjs');

test('original rank5 official Ranger versus native STS alias is exact',()=>{
  assert.equal(rootLabelMatchesNativePrinting('Pokémon Ranger','Pokemon Ranger STS'),true);
  assert.equal(rootLabelMatchesNativePrinting('Pokémon Ranger','Pokemon Ranger POK'),false);
  assert.equal(rootLabelMatchesNativePrinting('Pokémon Ranger','Pokemon Ranger'),false);
  assert.equal(rootLabelMatchesNativePrinting('Pokemon Ranger','Pokemon Ranger STS'),true);
  assert.equal(rootLabelMatchesNativePrinting('Pokémon Ranger','Pokémon Ranger STS'),true);
  assert.equal(rootLabelMatchesNativePrinting('Pokémon Ranger','Poke Ranger STS'),false);
});

test('native root target linkage accepts the matching genuine Ranger Store event',()=>{
  const root={actionOrdinal:170,action:'PlayCardAction',
    playerSlot:1,turnBefore:37,card:'Pokémon Ranger'};
  const record={action:'PlayCardAction',playerSlot:1,turnBefore:37,
    declared:{ownerHandPrinting:'Pokemon Ranger STS'}};
  const ok=auditNativeTargetRootLinkage([root],[record]);
  assert.deepEqual({linked:ok.linked,mismatchCount:ok.mismatchCount,
    rootCount:ok.rootCount,nativeCount:ok.nativeCount},
  {linked:true,mismatchCount:0,rootCount:1,nativeCount:1});
  assert.equal(auditNativeTargetRootLinkage([root],[{
    ...record,turnBefore:38
  }]).linked,false,
  'Correct printed identity never overrides a mismatched native turn');
  assert.equal(auditNativeTargetRootLinkage([root],[{
    ...record,declared:{ownerHandPrinting:'Pokemon Ranger POK'}
  }]).linked,false,
  'No fuzzy suffix or generic name normalization is permitted');
});
