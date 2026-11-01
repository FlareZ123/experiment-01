'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditNativeTargetRootLinkage,rootLabelMatchesNativePrinting}=
  require('../simulation/twinleaf/native-accepted-target-store-observer.cjs');

const original=[{
  action:'PlayCardAction',playerSlot:1,turnBefore:3,
  card:'Mew V'
},{
  action:'RetreatAction',playerSlot:0,turnBefore:4,card:null
}];
const native=[{
  action:'PlayCardAction',playerSlot:1,turnBefore:3,
  declared:{ownerHandPrinting:'Mew V FST'}
},{
  action:'RetreatAction',playerSlot:0,turnBefore:4,
  declared:{ownerHandPrinting:null}
}];

test('known original-root and native-printing correspondence remains valid',()=>{
  const x=auditNativeTargetRootLinkage(original,native);
  assert.equal(x.linked,true);
  assert.equal(x.mismatchCount,0);
  assert.equal(x.rootCount,2);
  assert.equal(x.nativeCount,2);
  assert.equal(rootLabelMatchesNativePrinting('Mew V','Mew V FST'),true);
});

test('missing actual Store target record fails closed with exact cardinality',()=>{
  const x=auditNativeTargetRootLinkage(original,native.slice(0,1));
  assert.equal(x.linked,false);
  assert.equal(x.rootCount,2);
  assert.equal(x.nativeCount,1);
  assert.deepEqual(x.firstMismatches.map(row=>row.reason),[
    'root-native-cardinality-mismatch','missing-store-record']);
});

test('mismatched archived physical card print fails closed with print names',()=>{
  const rows=native.map(x=>({...x,declared:{...x.declared}}));
  rows[0].declared.ownerHandPrinting='Genesect V FST';
  const x=auditNativeTargetRootLinkage(original,rows);
  assert.equal(x.linked,false);
  assert.equal(x.firstMismatches[0].comparisons.physicalCardLabel,false);
  assert.equal(x.firstMismatches[0].archivedCardLabel,'Mew V');
  assert.equal(x.firstMismatches[0].nativePhysicalPrinting,'Genesect V FST');
});

test('turn and seat disagreements remain distinct evidence categories',()=>{
  const rows=native.map(x=>({...x,declared:{...x.declared}}));
  rows[1].turnBefore=2;rows[1].playerSlot=1;
  const x=auditNativeTargetRootLinkage(original,rows);
  assert.equal(x.linked,false);
  assert.equal(x.mismatchCount,1);
  assert.equal(x.firstMismatches[0].comparisons.turn,false);
  assert.equal(x.firstMismatches[0].comparisons.seat,false);
  assert.equal(x.firstMismatches[0].comparisons.physicalCardLabel,true);
});

test('no archived root ledger is never accepted as a zero-root match',()=>{
  const x=auditNativeTargetRootLinkage(null,[]);
  assert.equal(x.linked,false);
  assert.equal(x.firstMismatches[0].reason,'missing-postgame-root-ledger');
});

test('known Telepath public literal alias remains narrowly supported',()=>{
  assert.equal(rootLabelMatchesNativePrinting(
    'Telepathic Psychic Energy','Telepath [P] Energy M3'),true);
  assert.equal(rootLabelMatchesNativePrinting('Telepathic Psychic Energy',
    'Telepath [P] Energy DRI'),false);
});
