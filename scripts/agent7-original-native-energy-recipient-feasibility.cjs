'use strict';

const assert=require('node:assert/strict');
const {censusFromRepository}=
  require('./agent30-roster-direct-energy-census.cjs');

const VERSION='agent7-original-source-native-energy-recipient-feasibility-v1';
const TYPES=new Set(['POSSIBLE','IMPOSSIBLE','UNVERIFIED',
  'NO_PRINTED_ATTACK','PRINTING_UNRESOLVED']);

/**
 * Join authenticated original exact card-name/set entries to independent
 * exact-printing printed-attack Energy assessment. Native target display
 * does not include collector number; any same-name/set ambiguity stays
 * explicitly unverified instead of choosing an arbitrary source card.
 * @param {object} manifest Original Aichi complete source inventories.
 * @param {object[]} censusRows Exact-source per-printing research census.
 * @returns {Map<number,object>}
 */
function originalFundingIndex(manifest,censusRows){
  assert.ok(Array.isArray(manifest?.decks));
  assert.ok(Array.isArray(censusRows));
  const census=new Map(censusRows.map(row=>[
    row.rank+'|'+row.printing+'|'+row.name,row]));
  const byRank=new Map();
  for(const deck of manifest.decks){
    assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
    const pokemon=new Map(),energy=new Set(),energyNames=new Set();
    for(const card of deck.cards){
      const printing=card.name+' '+card.printing.set;
      if(card.category==='Energy'){
        energy.add(printing);
        energyNames.add(card.name);
        continue;
      }
      if(card.category!=='Pokémon')continue;
      const key=deck.rank+'|'+card.printing.set+'-'+card.printing.number+
        '|'+card.name;
      const audit=census.get(key);
      assert.ok(audit,'missing original exact-printing funding row: '+key);
      assert.ok(TYPES.has(audit.status));
      const entries=pokemon.get(printing)??[];
      entries.push({name:card.name,printing:card.printing,
        status:audit.status,attacks:audit.attacks});
      pokemon.set(printing,entries);
    }
    byRank.set(deck.rank,{pokemon,energy,energyNames,rank:deck.rank});
  }
  return byRank;
}

/**
 * Audit only actual Store-accepted Energy cards attached by the original
 * source owner, with a unique physically witnessed one-card Energy increase.
 * A printed-attack impossibility is a resource flag, NOT an undesirable-play
 * verdict: retreat, external type changes and other future actions matter.
 * This audit never reads concealed cards or guesses Energy targets.
 *
 * @param {object[]} rows Full native trial rows, unfiltered for outcome.
 * @param {object} manifest Original 60-card source manifest.
 * @param {object[]} censusRows Independent exact-printing census rows.
 * @returns {object}
 */
function auditNativeOriginalEnergyRecipients(rows,manifest,censusRows){
  assert.ok(Array.isArray(rows));
  const index=originalFundingIndex(manifest,censusRows);
  const receiptRows=[];
  const summary={nativeGames:rows.length,acceptedSourceEnergyPlays:0,
    settledUniqueTargets:0,unverifiedSourceEnergyPrintings:0,
    noUniquePhysicalTarget:0,unknownSourceRecipient:0,
    byAttackFunding:{},byRecipient:{},byRank:{},
    sourceArmsWithoutSidecar:0};
  for(const row of rows){
    const rank=row.trial?.rank??row.rank;
    const source=index.get(rank);
    assert.ok(source,'missing authenticated original source rank '+rank);
    const seat=row.sourceSeat;
    assert.ok(seat===0||seat===1);
    const events=row.nativeAcceptedTargetSidecar?.events;
    if(!Array.isArray(events)){
      summary.sourceArmsWithoutSidecar++;
      continue;
    }
    for(const event of events){
      if(event.action!=='PlayCardAction'||event.playerSlot!==seat||
         event.storeAccepted!==true)continue;
      const printing=event.declared?.ownerHandPrinting;
      if(typeof printing!=='string'||!printing.includes('Energy'))continue;
      const sourceEnergyVerified=source.energy.has(printing);
      // An Energy-named Trainer Item is not an Energy attachment. Without
      // source-60 evidence of the card category, do not count it as one.
      if(!sourceEnergyVerified){
        // Only a source-roster Energy *name* with a different printing alias
        // is uncertain. An Item named Energy Retrieval is a different type
        // and must not enter the attachment census.
        const sourceNamed=[...source.energyNames].some(name=>
          printing.startsWith(name+' '));
        if(sourceNamed&&event.publicBoardChanges?.some(change=>
          change.seat===seat&&
          (change.after?.energies?.length??0)>
          (change.before?.energies?.length??0)))
          summary.unverifiedSourceEnergyPrintings++;
        continue;
      }
      summary.acceptedSourceEnergyPlays++;
      const matched=(event.publicBoardChanges??[]).filter(change=>{
        if(change.seat!==seat||
           !['active','bench'].includes(change.position))return false;
        const before=change.before?.energies;
        const after=change.after?.energies;
        if(!Array.isArray(before)||!Array.isArray(after)||
           after.length!==before.length+1)return false;
        const n=arr=>arr.filter(c=>c===printing).length;
        return n(after)===n(before)+1;
      });
      if(matched.length!==1){
        summary.noUniquePhysicalTarget++;
        continue;
      }
      summary.settledUniqueTargets++;
      const change=matched[0],recipient=change.after.pokemon;
      const known=source.pokemon.get(recipient)??[];
      const status=known.length===1?known[0].status:
        'SOURCE_RECIPIENT_UNRESOLVED';
      if(known.length!==1)summary.unknownSourceRecipient++;
      const key=rank+'|'+recipient+'|'+change.position;
      summary.byAttackFunding[status]=(summary.byAttackFunding[status]??0)+1;
      summary.byRecipient[key]=(summary.byRecipient[key]??0)+1;
      const rankRow=summary.byRank[rank]??{accepted:0,settled:0,
        impossible:0,possible:0,unresolved:0};
      rankRow.settled++;
      if(status==='IMPOSSIBLE')rankRow.impossible++;
      else if(status==='POSSIBLE')rankRow.possible++;
      else rankRow.unresolved++;
      summary.byRank[rank]=rankRow;
      receiptRows.push({
        trialId:row.trial?.id??null,rank,sourceSeat:seat,
        sourceDealFingerprint:row.sourceDealFingerprint??null,
        nativeTargetSidecarSha256:row.nativeAcceptedTargetSidecar.sha256??null,
        actionOrdinal:event.actionOrdinal,
        turnBefore:event.turnBefore,
        energyPrinting:printing,recipient,slot:change.position,
        slotIndex:change.index,status,
        sourcePrinting:known.length===1?known[0].printing:null,
        printedAttacks:known.length===1?known[0].attacks:null
      });
    }
    const count=(summary.byRank[rank]??{accepted:0,settled:0,
      impossible:0,possible:0,unresolved:0});
    count.accepted+=(events??[]).filter(event=>
      event.action==='PlayCardAction'&&event.playerSlot===seat&&
      event.storeAccepted===true&&
      source.energy.has(event.declared?.ownerHandPrinting)).length;
    summary.byRank[rank]=count;
  }
  assert.equal(summary.settledUniqueTargets,receiptRows.length);
  return {version:VERSION,summary,receipts:receiptRows,scope:
    'Actual original-source Store-accepted physical Energy target receipts; source-60 optimistic ordinary printed-attack cost ceiling only; retreat, temporal, cost modifiers and outcome value unverified; zero competitive game qualification'};
}

/**
 * Original rank30 registration contains two candidate arms per 8 new seeds,
 * each with an original Store control and an experimental guard. Analyze
 * precisely one predeclared policy to avoid double-counting duplicate deals.
 * @param {object} matchedNativeReport Registered native paired output.
 * @param {'control'|'guarded'} arm
 * @returns {object[]}
 */
function registeredRank30Rows(matchedNativeReport,arm='control'){
  assert.ok(['control','guarded'].includes(arm));
  assert.equal(matchedNativeReport?.registration?.rank,30);
  assert.equal(matchedNativeReport?.registration?.sourceGroups,8);
  assert.equal(matchedNativeReport?.registration?.pairedGames,16);
  assert.equal(matchedNativeReport.complete?.length,8);
  const rows=matchedNativeReport.complete.flatMap(group=>group[arm].rows);
  assert.equal(rows.length,16);
  return rows;
}

if(require.main===module){
  const fs=require('node:fs');
  const path=require('node:path');
  const filepath=process.argv[2];
  assert.ok(filepath,'Provide archived native source report JSON path');
  const report=JSON.parse(fs.readFileSync(path.resolve(filepath),'utf8'));
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const census=censusFromRepository();
  const rows=report.complete?
    registeredRank30Rows(report):report.rows;
  const result=auditNativeOriginalEnergyRecipients(rows,manifest,census.rows);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,originalFundingIndex,
  auditNativeOriginalEnergyRecipients,registeredRank30Rows};
