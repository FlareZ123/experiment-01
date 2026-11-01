'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const m=require('../scripts/agent11-thorns-solo-basic-envelope.cjs');
function close(a,b){assert.ok(Math.abs(a-b)<1e-10,a+' vs '+b);}
test('four-Basic source valid hand contains one Thorns most often',()=>{
  close(m.soloEnvelope(14).singleThornsInValidSeven,0.8417535034135825);
});
test('14 Basic champion, maximum opponent bonus, later natural draws',()=>{
  for(const [d,v] of [0.8384336373122205,0.7909152869628031,
    0.7452269722008887,0.701332760579477,0.6591967196515683].entries())
    close(m.soloEnvelope(14,d).forcedSoloBasicLower,v);
});
test('17 Basic New Moon, maximum opponent bonus, later natural draws',()=>{
  for(const [d,v] of [0.8399356911751023,0.7923593022884503,
    0.7466140924915329,0.7026641293373498,0.6604734803789015].entries())
    close(m.soloEnvelope(17,d).forcedSoloBasicLower,v);
});
test('all three exact Thorns original source 60s are required',()=>{
  const original={decks:[6,24,29].map(rank=>({rank,cards:[
    {category:'Pokémon',name:'Iron Thorns ex',count:4,
      printing:{set:'TWM',number:'77'}},
    {category:'Trainer',name:'Filler',count:56}
  ]}))};
  assert.doesNotThrow(()=>m.verifyThornsSources(original));
  original.decks[1].cards[0].printing.number='78';
  assert.throws(()=>m.verifyThornsSources(original));
});
