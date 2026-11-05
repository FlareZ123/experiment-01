'use strict';

/**
 * Verify a native accepted owner's Energy placement from publicly visible
 * pre/post Store board states. Independent of native card-id internals,
 * registered trial seat, hand position, and simulator winner fields.
 * Complete paper legality and full-game strength remain unverified.
 *
 * @param {object} event Read-only physical target sidecar event.
 * @param {0|1} actualSourceSeat Native verified original owner physical seat.
 * @param {boolean} ordinalLinked Entire sidecar root-ordinal linkage status.
 * @returns {object} Fail-closed physical evidence classification.
 */
function classifySourceEnergyAttachment(event,actualSourceSeat,ordinalLinked) {
  const failed=reason=>({
    status:'NO_NATIVE_PHYSICAL_ATTACHMENT_PROOF',reason,
    paperLegal:false,competitiveGameQualified:false
  });
  if(actualSourceSeat!==0&&actualSourceSeat!==1)
    return failed('unverified-native-source-seat');
  const printing=event?.declared?.ownerHandPrinting;
  if(event?.action!=='PlayCardAction'||event.playerSlot!==actualSourceSeat||
      event.storeAccepted!==true||typeof printing!=='string'||
      event.declared?.status!=='captured'||
      event.visibility!=='public-after-dispatch')
    return failed('missing-accepted-visible-source-card-target');
  if(!event.declared?.target||!['player','slot','index'].every(k=>
      Number.isSafeInteger(event.declared.target[k])))
    return failed('missing-native-physical-target-geometry');
  if(!Array.isArray(event.publicBoardChanges))
    return failed('missing-native-postdispatch-board');
  const eligible=event.publicBoardChanges.filter(change=>{
    if(change?.seat!==actualSourceSeat||
       !['active','bench'].includes(change.position)||
       !Number.isSafeInteger(change.index)||
       typeof change.before?.pokemon!=='string'||
       change.before.pokemon!==change.after?.pokemon||
       !Array.isArray(change.before.energies)||
       !Array.isArray(change.after.energies))
      return false;
    const oldCounts=new Map();
    for(const energy of change.before.energies)
      oldCounts.set(energy,(oldCounts.get(energy)??0)+1);
    const newCounts=new Map();
    for(const energy of change.after.energies)
      newCounts.set(energy,(newCounts.get(energy)??0)+1);
    if((newCounts.get(printing)??0)!==(oldCounts.get(printing)??0)+1)
      return false;
    return [...new Set([...oldCounts.keys(),...newCounts.keys()])]
      .every(name=>name===printing||
        oldCounts.get(name)===newCounts.get(name));
  });
  if(eligible.length!==1)return failed('missing-or-ambiguous-source-energy-delta');
  const change=eligible[0];
  const linked=ordinalLinked===true&&
    Number.isSafeInteger(event.rootActionOrdinal);
  return {
    status:linked?'NATIVE_SOURCE_ENERGY_ROOT_AND_BOARD_LINKED':
      'NATIVE_SOURCE_ENERGY_BOARD_SETTLED_ROOT_UNLINKED',
    physicalEnergyCard:printing,
    sourceSeat:actualSourceSeat,
    destination:{position:change.position,index:change.index,
      pokemon:change.after.pokemon},
    acceptedRootOrdinal:linked?event.rootActionOrdinal:null,
    sourceEnergyBefore:[...change.before.energies],
    sourceEnergyAfter:[...change.after.energies],
    nativePhysicalAttachmentVerified:true,
    paperLegal:false,competitiveGameQualified:false
  };
}
module.exports={classifySourceEnergyAttachment};
