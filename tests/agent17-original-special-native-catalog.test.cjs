'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=require('../results/aichi-2026/full-decklists.json');
const {BASIC_ENERGIES}=require('../scripts/aichi-source-root-coverage.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

test('frozen original 29-source Special Energy native printing availability',()=>{
  const manager=initializeCards();
  const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {EnergyCard}=require(path.join(base,'game/store/card/energy-card'));
  const {EnergyType}=require(path.join(base,'game/store/card/card-types'));
  const native=manager.getAllCards().filter(card=>
    card instanceof EnergyCard&&card.energyType===EnergyType.SPECIAL);
  const nativeNames=new Set(native.map(card=>card.fullName));
  assert.ok(nativeNames.has('Double Dragon Energy ROS'));
  const unique=new Map();
  for(const deck of source.decks){
    for(const card of deck.cards){
      if(card.category!=='Energy'||BASIC_ENERGIES.has(card.name))continue;
      const printing=card.name+' '+card.printing.set;
      const old=unique.get(printing)??{printing,name:card.name,copies:0,ranks:[]};
      old.copies+=card.count;
      old.ranks.push(deck.rank);
      unique.set(printing,old);
    }
  }
  const rows=[...unique.values()].sort((a,b)=>
    a.printing.localeCompare(b.printing)).map(row=>{
    const sameNameNative=native.filter(card=>card.name===row.name)
      .map(card=>card.fullName);
    return {...row,nativeExact:nativeNames.has(row.printing),
      alternateNativePrintings:sameNameNative.filter(name=>
        name!==row.printing).slice(0,8)};
  });
  const exactCopies=rows.filter(r=>r.nativeExact)
    .reduce((n,r)=>n+r.copies,0);
  const missingCopies=rows.filter(r=>!r.nativeExact)
    .reduce((n,r)=>n+r.copies,0);
  assert.equal(exactCopies+missingCopies,118);
  assert.equal(source.decks.length,29);
  console.log('AGENT17_ORIGINAL_SPECIAL_NATIVE_PRINT_CENSUS',
    JSON.stringify({sourceCount:29,
      specialPrintings:rows.length,
      sourceSpecialCopies:118,
      exactNativeCopies:exactCopies,
      nativeUnresolvedCopies:missingCopies,
      rows
    }));
});
