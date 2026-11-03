'use strict';

const assert=require('node:assert/strict');

const VERSION='agent50-native-costed-trainer-hand-custody-posthoc-v1';
const COSTED=Object.freeze({
  'Quick Ball FST':Object.freeze({
    nativeName:'Quick Ball',discardCount:1,
    searchMax:1,searchCategory:'Basic Pokemon'
  }),
  'Secret Box TWM':Object.freeze({
    nativeName:'Secret Box',discardCount:3,
    searchMax:4,searchCategory:'one each Item Tool Supporter Stadium'
  }),
  'Professors Letter BKT':Object.freeze({
    nativeName:"Professor's Letter",discardCount:0,
    searchMax:2,searchCategory:'Basic Energy'
  })
});

/** Compare owner-only physical printing multisets, retaining duplicates. */
function sameCards(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)
    return false;
  const counts=new Map();
  for(const printing of a)
    counts.set(printing,(counts.get(printing)??0)+1);
  for(const printing of b){
    const available=counts.get(printing)??0;
    if(available===0)return false;
    counts.set(printing,available-1);
  }
  return [...counts.values()].every(n=>n===0);
}

/** Remove exact specified owner-hand printings or return null. */
function withoutCards(cards,spent){
  if(!Array.isArray(cards)||!Array.isArray(spent))return null;
  const remaining=cards.slice();
  for(const printing of spent){
    const index=remaining.indexOf(printing);
    if(index<0)return null;
    remaining.splice(index,1);
  }
  return remaining;
}

/** Read the acting owner's archived, already observed private hand. */
function ownerHand(row,seat){
  return row?.decisionHandBefore?.perspectiveSeat===seat?
    row.decisionHandBefore.ownHandPrintings:null;
}

/**
 * Postgame evidence only. The raw native root action itself must have actually
 * reached the Store; selected receipt linkage uses original physical owner,
 * turn, hand index, full printing, and native card display name together.
 * A native ChooseCardsPrompt is an actual prompt, but custody in the
 * discard zone is NOT recorded here. Cost is only certified as hand removal.
 *
 * @param {object} caseRow Single fixed-deal three-arm cohort.
 * @returns {object[]} Full costed-family native hand-custody audit.
 */
function costedTrainerHandAudit(caseRow){
  const treated=caseRow.results?.[1];
  const trace=treated?.game?.decisionTrace;
  const receipts=treated?.summary?.fallbackReceipts;
  assert.ok(Array.isArray(trace)&&Array.isArray(receipts));
  const used=new Set(),rows=[];
  for(const receipt of receipts){
    const spec=COSTED[receipt.printing];
    if(!spec)continue;
    const seat=receipt.seat,handIndex=receipt.handIndex;
    const candidates=trace.map((row,index)=>({row,index})).filter(({row,index})=>
      !used.has(index)&&row.action==='PlayCardAction'&&
      row.card===spec.nativeName&&row.playerSlot===seat&&
      row.turnBefore===receipt.globalTurn&&
      ownerHand(row,seat)?.[handIndex]===receipt.printing);
    const selection=candidates[0]??null;
    const evidence={
      repeat:caseRow.repeat,slot:caseRow.slot,seat,
      printing:receipt.printing,globalTurn:receipt.globalTurn,
      rootOrdinal:selection?.row?.actionOrdinal??null,
      exactNativeRootMatched:Boolean(selection),
      promptedCorrectCost:false,
      ownerHandCostConserved:false,
      deckSearchPromptMatched:false,
      ownerHandSearchConserved:false,
      selectedNativeCostCards:[],
      selectedNativeSearchCards:[],
      exactOwnerHandPromptChain:false,
      physicalDiscardZoneVerified:false,
      targetTypePaperVerified:false,
      nativeAttackPayoffVerified:false,
      competitiveQualified:false
    };
    rows.push(evidence);
    if(!selection)continue;
    used.add(selection.index);
    const start=selection.index;
    const play=selection.row;
    const afterCard=trace[start+1];
    const rootHand=ownerHand(play,seat);
    const handWithoutPlayed=withoutCards(rootHand,[receipt.printing]);
    if(!sameCards(handWithoutPlayed,ownerHand(afterCard,seat)))continue;
    let search=null;
    let beforeSearchHand=handWithoutPlayed;
    if(spec.discardCount>0){
      const cost=afterCard?.cardSelection;
      if(afterCard.action!=='ResolvePromptAction'||
         cost?.message!=='CHOOSE_CARD_TO_DISCARD'||
         cost.nativePromptMin!==spec.discardCount||
         cost.nativePromptMax!==spec.discardCount||
         cost.nativePromptAllowCancel!==false||
         !Array.isArray(cost.selectedCards)||
         cost.selectedCards.length!==spec.discardCount)continue;
      evidence.promptedCorrectCost=true;
      evidence.selectedNativeCostCards=[...cost.selectedCards];
      search=trace[start+2];
      beforeSearchHand=withoutCards(handWithoutPlayed,cost.selectedCards);
      if(!sameCards(beforeSearchHand,ownerHand(search,seat)))continue;
      evidence.ownerHandCostConserved=true;
    }else{
      evidence.promptedCorrectCost=true;
      evidence.ownerHandCostConserved=true;
      search=afterCard;
    }
    const found=search?.cardSelection;
    if(search.action!=='ResolvePromptAction'||
       found?.message!=='CHOOSE_CARD_TO_HAND'||
       found.sourceZone!=='deck'||found.sourcePlayerSlot!==seat||
       found.nativePromptMax!==spec.searchMax||
       !Array.isArray(found.selectedCards)||
       found.selectedCards.length>spec.searchMax||
       found.unmappedSelectedCards!==0)continue;
    evidence.deckSearchPromptMatched=true;
    evidence.selectedNativeSearchCards=[...found.selectedCards];
    const searchIndex=spec.discardCount>0?start+2:start+1;
    const next=trace[searchIndex+1];
    if(!sameCards([...beforeSearchHand,...found.selectedCards],
      ownerHand(next,seat)))continue;
    evidence.ownerHandSearchConserved=true;
    evidence.exactOwnerHandPromptChain=true;
  }
  return rows;
}

/** Never count correlated root appearances as independent games. */
function summarizeArchive(archive){
  assert.equal(archive?.version,'agent50-generic-owner-native-trainer-paired-v1');
  const rows=archive.cases.flatMap(costedTrainerHandAudit);
  const successes=rows.filter(x=>x.exactOwnerHandPromptChain);
  const failures=rows.filter(x=>!x.exactOwnerHandPromptChain);
  return {
    version:VERSION,originalNativeArchiveVersion:archive.version,
    sourcePhysicalCohorts:archive.physicalGroups,
    allPhysicalInitialDealsMatched:archive.fullParity,
    costedRootsObserved:rows.length,
    exactOwnerHandPromptChains:successes.length,
    unresolvedChains:failures.length,
    byPrinting:Object.fromEntries(Object.keys(COSTED).map(printing=>
      [printing,{
        observed:rows.filter(x=>x.printing===printing).length,
        confirmedHandCustody:successes.filter(x=>x.printing===printing).length
      }])),
    paperDiscardZoneCustodyVerified:false,
    printedSearchTargetTypesVerified:false,
    nativeGameQualityCertified:false,
    qualifiedPaperGames:0,
    rows
  };
}

if(require.main===module){
  const fs=require('node:fs');
  const file=process.argv[2];
  assert.ok(file,'Expected previously archived native JSON file');
  const source=JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write('AGENT50_NATIVE_TRAINER_HAND_CUSTODY '+
    JSON.stringify(summarizeArchive(source))+'\n');
}

module.exports={
  VERSION,COSTED,sameCards,withoutCards,ownerHand,
  costedTrainerHandAudit,summarizeArchive
};
