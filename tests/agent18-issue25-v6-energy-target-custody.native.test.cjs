'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {summarizeSourcePanel}=
  require('../simulation/evaluation/agent18-issue25-source-root-custody.cjs');
const {classifySourceEnergyAttachment}=
  require('../simulation/evaluation/agent18-source-energy-physical-custody.cjs');

const ENERGY=['Speed Lightning Energy RCL','Capture Energy RCL',
  'Double Colorless Energy SUM','Spiky Energy JTG'];

/** Read-only physical publicly visible attachment change after Store acceptance.
 * @param {object} event Native Store accepted target action.
 * @param {number} seat Actual original source physical seat.
 * @returns {object} Post-dispatch physical target evidence, possibly incomplete.
 */
function sourceEnergyTarget(event,seat) {
  const printing=event?.declared?.ownerHandPrinting??null;
  const changes=(event?.publicBoardChanges??[])
    .filter(c=>c?.seat===seat).map(c=>{
      const before=c.before?.energies??[];
      const after=c.after?.energies??[];
      return {position:c.position,index:c.index,
        pokemonBefore:c.before?.pokemon??null,
        pokemonAfter:c.after?.pokemon??null,
        energyBefore:before,energyAfter:after,
        printedEnergyAdded:after.filter((name,i)=>
          after.slice(0,i+1).filter(a=>a===name).length >
          before.filter(a=>a===name).length)
      };
    });
  return {
    rootActionOrdinal:event.rootActionOrdinal??null,
    nativeStoreAccepted:event.storeAccepted===true,
    sourceSeat:seat,
    playedPrinting:printing,
    observedTarget:event.declared?.target??null,
    printedTargetObserved:event.declared?.status==='captured',
    postDispatchVisibility:event.visibility??null,
    physicalOwnerBoardChanges:changes,
    physicalEnergyAddedToSource:changes.some(c=>
      c.printedEnergyAdded.includes(printing))
  };
}

test('original source Special Energy native target/board custody under shared eight-arm treatment',()=>{
  const executed=runMirroredIssue25V6({
    runner:opts=>runDevelopment({...opts,
      bilateralSpecialEnergyRoot:true,nativeAcceptedTargets:true})
  });
  const rows=executed.rawDevelopment?.rows??[];
  const source=summarizeSourcePanel(rows);
  const entries=rows.map((row,i)=>{
    const native=source.attempts[i];
    const sidecar=row.status==='engine-error'?
      row.nativeAcceptedTargetSidecarAbort:
      row.nativeAcceptedTargetSidecar;
    const sourceSeat=native.sourceSeat;
    const events=(sidecar?.events??[])
      .filter(e=>e.playerSlot===sourceSeat &&
        e.action==='PlayCardAction'&&
        ENERGY.includes(e.declared?.ownerHandPrinting));
    return {
      id:native.id,disposition:native.disposition,
      actualSourceSeat:sourceSeat,
      sourceRootIntegrity:native.status,
      nativeSidecarStatus:sidecar?.schema??null,
      rootedTargetLedgerLinkage:sidecar?.rootOrdinalLinked??null,
      nativeTargetEventsTotal:sidecar?.observedTargetActions??null,
      sourceSpecialEnergyAcceptedTargets:
        events.map(e=>sourceEnergyTarget(e,sourceSeat)),
      sourcePhysicalAttachments:events.map(e=>
        classifySourceEnergyAttachment(
          e,sourceSeat,sidecar?.rootOrdinalLinked===true)),
      originalSourceAttackCount:native.observedSourceAttacks??null,
      paperPhysicalAttachmentCertified:false,
      competitiveGamesQualified:0
    };
  });
  const result={
    schema:'agent18-issue25-native-special-energy-target-custody-v1',
    policyEntry:executed.manifest.policyEntryPoint,
    sourceIndependent:executed.manifest.actualRunnerConfirmedOption,
    originalRegisteredIds:executed.diagnostic.registered,
    observedEightSourceRootLedgers:source.observedAttempts,
    sourceNativeTargetRecords:entries,
    paperGameQualified:false,
    competitiveGamesQualified:0
  };
  console.log('AGENT18_V6_NATIVE_SPECIAL_ENERGY_TARGETS',
    JSON.stringify(result));
  const all=entries.flatMap(e=>e.sourcePhysicalAttachments);
  const linked=all.filter(r=>
    r.status==='NATIVE_SOURCE_ENERGY_ROOT_AND_BOARD_LINKED');
  const unlinked=all.filter(r=>
    r.status==='NATIVE_SOURCE_ENERGY_BOARD_SETTLED_ROOT_UNLINKED');
  assert.ok(linked.some(r=>r.physicalEnergyCard==='Speed Lightning Energy RCL'&&
    r.destination.pokemon==='Iron Thorns ex TWM'&&
    r.destination.position==='active'&&r.acceptedRootOrdinal===13),
    'Original rank6 first-turn root13 must physically attach Speed to Active');
  assert.ok(unlinked.some(r=>r.physicalEnergyCard==='Capture Energy RCL'&&
    r.destination.pokemon==='Iron Thorns ex TWM'&&
    r.destination.position==='active'),
    'Aborted original must retain Store-accepted Capture attachment without inventing root linkage');
  assert.equal(all.filter(r=>r.nativePhysicalAttachmentVerified).length,3);
  assert.equal(rows.length,8);
  assert.equal(source.observedAttempts,8);
  assert.equal(new Set(entries.map(e=>e.id)).size,8);
  assert.equal(executed.manifest.actualRunnerConfirmedOption,true);
  assert.equal(executed.manifest.releaseQualified,false);
  assert.equal(result.competitiveGamesQualified,0);
});
