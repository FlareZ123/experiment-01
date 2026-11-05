'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifySourceEnergyAttachment:classify}=
  require('../simulation/evaluation/agent18-source-energy-physical-custody.cjs');

const speed='Speed Lightning Energy RCL';
/** @returns {object} */
function nativeEvent(){
  return {
    action:'PlayCardAction',playerSlot:1,rootActionOrdinal:13,
    storeAccepted:true,visibility:'public-after-dispatch',
    declared:{status:'captured',ownerHandPrinting:speed,
      target:{player:2,slot:1,index:0}},
    publicBoardChanges:[{seat:1,position:'active',index:0,
      before:{pokemon:'Iron Thorns ex TWM',energies:[]},
      after:{pokemon:'Iron Thorns ex TWM',energies:[speed]}}]
  };
}
test('actual native linked source Active Speed Energy is proved',()=>{
  const result=classify(nativeEvent(),1,true);
  assert.equal(result.status,'NATIVE_SOURCE_ENERGY_ROOT_AND_BOARD_LINKED');
  assert.equal(result.acceptedRootOrdinal,13);
  assert.equal(result.destination.position,'active');
  assert.deepEqual(result.sourceEnergyAfter,[speed]);
  assert.equal(result.paperLegal,false);
});
test('accepted physical attachment survives later abort without root linkage',()=>{
  const e=nativeEvent();
  e.rootActionOrdinal=null;
  const result=classify(e,1,false);
  assert.equal(result.status,
    'NATIVE_SOURCE_ENERGY_BOARD_SETTLED_ROOT_UNLINKED');
  assert.equal(result.acceptedRootOrdinal,null);
  assert.equal(result.nativePhysicalAttachmentVerified,true);
});
test('wrong actor seat cannot claim source energy',()=>{
  const e=nativeEvent();
  e.playerSlot=0;
  assert.equal(classify(e,1,true).nativePhysicalAttachmentVerified,undefined);
});
test('wrong board seat and no physical delta both fail closed',()=>{
  const e=nativeEvent();
  e.publicBoardChanges[0].seat=0;
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
  e.publicBoardChanges[0].seat=1;
  e.publicBoardChanges[0].after.energies=[];
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
});
test('swapping a different energy is not evidence of one new attachment',()=>{
  const e=nativeEvent();
  e.publicBoardChanges[0].before.energies=['Capture Energy RCL'];
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
});
test('duplicate ambiguous board deltas cannot certify a unique recipient',()=>{
  const e=nativeEvent();
  e.publicBoardChanges.push({...e.publicBoardChanges[0],position:'bench'});
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
});
test('invalid target and unaccepted Store never certify',()=>{
  const e=nativeEvent();
  e.declared.target=null;
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
  e.declared.target={player:2,slot:1,index:0};
  e.storeAccepted=false;
  assert.equal(classify(e,1,true).status,
    'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF');
});
test('Capture Energy added alongside existing Speed counts once',()=>{
  const e=nativeEvent();
  e.declared.ownerHandPrinting='Capture Energy RCL';
  e.rootActionOrdinal=null;
  e.publicBoardChanges[0].before.energies=[speed];
  e.publicBoardChanges[0].after.energies=[speed,'Capture Energy RCL'];
  const result=classify(e,1,false);
  assert.equal(result.nativePhysicalAttachmentVerified,true);
  assert.equal(result.physicalEnergyCard,'Capture Energy RCL');
  assert.equal(result.acceptedRootOrdinal,null);
});
