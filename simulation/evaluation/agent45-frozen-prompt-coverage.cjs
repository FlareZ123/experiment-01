'use strict';

const assert=require('node:assert/strict');

const VERSION='agent45-frozen-prompt-coverage-v1';

/**
 * Multiset difference. Energy-card names identify printings, not physical copies.
 * @param {string[]} before
 * @param {string[]} after
 * @returns {string[]}
 */
function removedNames(before,after){
  const balance=new Map();
  for(const name of before)balance.set(name,(balance.get(name)??0)+1);
  for(const name of after)balance.set(name,(balance.get(name)??0)-1);
  const removed=[];
  for(const [name,amount] of balance){
    if(amount>0)for(let i=0;i<amount;i++)removed.push(name);
    if(amount<0)return [];
  }
  return removed;
}

/**
 * Evaluate a *public-effect shape*, never a paper-legality certificate.
 * Volt Cyclone (Iron Thorns ex TWM77) says to move one Energy from itself
 * to one Benched Pokémon. This witness sees public board deltas after a
 * native AttachEnergyPrompt, not the private prompt response or attack stack.
 * Other simultaneous opponent-side deltas are intentionally ignored.
 * @param {object} event Native accepted public-energy prompt sidecar row
 * @param {number} sourceSeat Actual source player seat (0 or 1)
 * @returns {string} One bounded result code
 */
function classifyVoltCyclonePublicMove(event,sourceSeat){
  if(event?.nativeDispatchAccepted!==true ||
     event.promptType!=='AttachEnergyPrompt' ||
     event.playerSlot!==sourceSeat ||
     ![0,1].includes(sourceSeat))return 'NO_SOURCE_NATIVE_ACCEPTANCE';
  if(!Array.isArray(event.publicChanges))return 'PUBLIC_DELTA_MISSING';
  const changed=event.publicChanges.filter(x=>x.seat===sourceSeat);
  if(changed.length!==2)return 'SOURCE_GEOMETRY_UNVERIFIED';
  const active=changed.find(x=>x.position==='active');
  const bench=changed.find(x=>x.position==='bench');
  if(!active||!bench||active.index!==0||!Number.isInteger(bench.index))
    return 'SOURCE_GEOMETRY_UNVERIFIED';
  for(const slot of [active,bench]){
    if(!slot.before||!slot.after||
       !Array.isArray(slot.before.energies)||
       !Array.isArray(slot.after.energies)||
       !Array.isArray(slot.before.tools)||
       !Array.isArray(slot.after.tools)||
       slot.before.pokemon!==slot.after.pokemon||
       JSON.stringify(slot.before.tools)!==JSON.stringify(slot.after.tools))
      return 'SOURCE_GEOMETRY_UNVERIFIED';
  }
  if(active.before.pokemon!=='Iron Thorns ex TWM'||
     !bench.before.pokemon)return 'SOURCE_PRINTING_UNVERIFIED';
  const outgoing=removedNames(active.before.energies,active.after.energies);
  const incoming=removedNames(bench.after.energies,bench.before.energies);
  if(outgoing.length!==1||incoming.length!==1||outgoing[0]!==incoming[0])
    return 'PUBLIC_ONE_ENERGY_MOVE_MISMATCH';
  return 'PUBLIC_VOLT_CYCLONE_ONE_ENERGY_MATCH';
}

/**
 * Offline-only archive audit: never feed selectedCards or these dispositions
 * to the player policy. The nativePromptChoices observer logs decisions before
 * dispatch, so an observed choice is not a settled/accepted prompt.
 * @param {object} archive Parsed frozen v1/v2 original-source native JSON
 * @returns {object} Counts and bounded evidence without claiming completeness
 */
function auditFrozenPromptCoverage(archive){
  assert.ok(Array.isArray(archive?.rows));
  const status={
    schema:VERSION,attempts:archive.rows.length,
    choiceEvents:0,chooseCards:0,selectOption:0,
    selectedWithinNativeNumericBounds:0,cancelledWithNativePermission:0,
    malformedChoiceRecords:0,unclassifiedSourceZoneChoices:0,
    acceptedAttachEnergyPrompt:0,sourceOwnedAcceptedAttachEnergyPrompt:0,
    publicVoltCycloneShapeMatches:0,otherAcceptedAttachOutcomes:{},
    byRank:{},promptPaperVerdict:'PROMPT_PAPER_UNVERIFIED',
    totalNativePromptResolutionCount:'UNKNOWN',
    fullPrintedPromptCoverage:false,competitiveQualifiedGames:0
  };
  const ids=new Set();
  for(const row of archive.rows){
    const id=row.trial?.id;
    assert.equal(typeof id,'string');
    assert.ok(!ids.has(id),'duplicate frozen native trial');
    ids.add(id);
    const rank=String(row.trial.rank);
    const rankStatus=status.byRank[rank]??={
      choiceEvents:0,acceptedAttachEnergyPrompt:0,
      publicVoltCycloneShapeMatches:0
    };
    const events=row.nativePromptChoices?.events;
    const energyEvents=row.nativeAcceptedEnergyPromptSidecar?.events;
    assert.ok(Array.isArray(events)&&Array.isArray(energyEvents),
      'missing frozen native prompt evidence sidecar');
    for(const event of events){
      status.choiceEvents++;
      rankStatus.choiceEvents++;
      if(event.kind==='SelectOptionPrompt'){
        status.selectOption++;
        continue;
      }
      if(event.kind!=='ChooseCardsPrompt'){
        status.malformedChoiceRecords++;
        continue;
      }
      status.chooseCards++;
      if(event.sourceZone==='unclassified')
        status.unclassifiedSourceZoneChoices++;
      if(Array.isArray(event.selectedCards) &&
         Number.isInteger(event.nativePromptMin)&&
         Number.isInteger(event.nativePromptMax)&&
         event.selectedCards.length>=event.nativePromptMin&&
         event.selectedCards.length<=event.nativePromptMax){
        status.selectedWithinNativeNumericBounds++;
      }else if(event.selectedCards===null &&
               event.nativePromptAllowCancel===true){
        status.cancelledWithNativePermission++;
      }else status.malformedChoiceRecords++;
    }
    for(const event of energyEvents){
      if(event.nativeDispatchAccepted!==true){
        status.otherAcceptedAttachOutcomes.NON_ACCEPTED_SIDECAR_RECORD=
          (status.otherAcceptedAttachOutcomes.NON_ACCEPTED_SIDECAR_RECORD??0)+1;
        continue;
      }
      status.acceptedAttachEnergyPrompt++;
      rankStatus.acceptedAttachEnergyPrompt++;
      const result=classifyVoltCyclonePublicMove(event,row.sourceSeat);
      if(event.playerSlot===row.sourceSeat)
        status.sourceOwnedAcceptedAttachEnergyPrompt++;
      if(result==='PUBLIC_VOLT_CYCLONE_ONE_ENERGY_MATCH'){
        status.publicVoltCycloneShapeMatches++;
        rankStatus.publicVoltCycloneShapeMatches++;
      }else status.otherAcceptedAttachOutcomes[result]=
        (status.otherAcceptedAttachOutcomes[result]??0)+1;
    }
  }
  return status;
}

module.exports={VERSION,removedNames,classifyVoltCyclonePublicMove,
  auditFrozenPromptCoverage};
