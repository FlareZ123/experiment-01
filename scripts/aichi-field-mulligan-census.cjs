'use strict';
const assert=require('node:assert/strict');
const {mulliganRace,openingValid}=require('./aichi-setup-mulligan-race.cjs');

/* All printed Pokémon in the 29 recovered original Top 32 lists. */
const PRINTINGS=new Set((
'AOR-3 AOR-30 ASC-142 ASC-152 ASC-16 ASR-133 BCR-122 BCR-63 '+
'BKP-57 BLK-44 BST-40 BUS-6 CEC-156 CEC-174 CEC-4 CEC-76 CEC-95 '+
'CES-31 CES-48 CIN-43 CRE-74 CRE-75 CRE-97 CRI-56 CRZ-105 DAA-104 '+
'DAA-60 DRX-22 FLF-75 FST-113 FST-114 FST-168 FST-185 GRI-58 '+
'GRI-60 GRI-66 JTG-114 JTG-56 LOR-136 LOR-52 LOR-58 LOT-154 LOT-94 '+
'LTR-68 MEG-104 MEG-86 MEW-16 MEW-17 NVI-48 OBF-164 PAL-153 '+
'PAL-169 PAL-97 PAR-108 PAR-116 PAR-16 PAR-17 PAR-99 PFL-83 '+
'PFL-84 PGO-55 PHF-36 PLF-4 PLF-47 PRC-121 PRC-60 PRE-35 '+
'PRE-36 PRE-37 RCL-19 ROS-21 SCR-118 SFA-47 SIT-135 SIT-136 '+
'SIT-59 SMP-217 SSH-120 SSH-132 SSP-76 SUM-104 SVI-96 TEF-120 '+
'TEF-123 TEF-78 TEF-84 TEU-123 TEU-51 TEU-53 TWM-130 TWM-131 '+
'TWM-141 TWM-77 UNB-5 UNB-57 UNB-7 UNB-81 UNM-57 UPR-100 '+
'XY-42 XYP-49 XYP-67'
).split(' '));

/* Matched against the supplied English Pokémon-card stage labels:
 * 99 ordinary printings; the remaining three promotional Basics are
 * SMP-217, XYP-49 and XYP-67. A new printing must be classified.
 */
const EVOLUTIONS=new Set((
'AOR-3 ASC-152 BCR-122 BCR-63 BKP-57 BUS-6 CEC-4 CES-48 '+
'CRE-75 FST-114 JTG-114 LOR-136 LTR-68 MEW-17 OBF-164 PAL-153 '+
'PAR-17 PFL-84 PRE-36 PRE-37 SIT-136 SUM-104 TEU-123 TWM-130 '+
'UNB-7 UNM-57'
).split(' '));

/**
 * Count only the printed Basic Pokémon in an exact source 60.
 * Unknown printed identities are fatal to prevent accidental classification.
 * @param {{cards:Array<{category:string,count:number,printing:{set:string,number:string}}>} } deck
 * @returns {number}
 */
function countBasics(deck){
  assert.ok(Array.isArray(deck.cards));
  let count=0,total=0;
  for(const card of deck.cards){
    assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
    total+=card.count;
    if(card.category!=='Pokémon')continue;
    const id=card.printing.set+'-'+card.printing.number;
    assert.ok(PRINTINGS.has(id),'Unclassified printed Pokémon: '+id);
    if(!EVOLUTIONS.has(id))count+=card.count;
  }
  assert.equal(total,60,'Published physical list must total 60');
  assert.ok(count>=1,'A playable deck needs at least one Basic');
  return count;
}

/**
 * Paper setup comparison for the fixed rank-1 60 against the 28 other
 * recovered exact Top32 60s. All probabilities are bonus opportunities,
 * before owners choose whether to draw and before normal first turns.
 * @param {{decks:Array<{rank:number,archetype:string,cards:object[]}>,missing_full_lists:Array<{rank:number}>}} manifest
 * @returns {{championBasics:number,rows:object[],summary:object}}
 */
function summarizeFieldMulligans(manifest){
  assert.equal(manifest.decks.length,29);
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  const seenRanks=new Set(),seenPrintings=new Set();
  const sources=manifest.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&!seenRanks.has(deck.rank));
    seenRanks.add(deck.rank);
    for(const c of deck.cards){
      if(c.category==='Pokémon')
        seenPrintings.add(c.printing.set+'-'+c.printing.number);
    }
    return {rank:deck.rank,archetype:deck.archetype,basics:countBasics(deck)};
  });
  assert.equal(seenPrintings.size,PRINTINGS.size,
    'Pokemon print universe changed: review subtype classification');
  const champion=sources.find(x=>x.rank===1);
  assert.ok(champion);
  const rows=sources.filter(x=>x.rank!==1)
    .sort((a,b)=>a.rank-b.rank).map(source=>{
      const race=mulliganRace(source.basics,champion.basics);
      return {...source,sourceValidSeven:openingValid(60,source.basics),
        championMayDraw:race.bBonusProbability,
        sourceMayDraw:race.aBonusProbability,
        championExpectedOffer:race.bExpectedBonus};
    });
  const mean=key=>rows.reduce((sum,row)=>sum+row[key],0)/rows.length;
  return {championBasics:champion.basics,rows,summary:{
    opponentsRecovered:rows.length,opponentsMissing:3,
    fourBasicRanks:rows.filter(x=>x.basics===4).map(x=>x.rank),
    championMayDrawMean:mean('championMayDraw'),
    sourceMayDrawMean:mean('sourceMayDraw'),
    championExpectedOfferMean:mean('championExpectedOffer')
  }};
}
module.exports={PRINTINGS,EVOLUTIONS,countBasics,summarizeFieldMulligans};
