'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const source = require('../results/aichi-2026/full-decklists.json').decks.find(d => d.rank === 26);
const counts = Object.fromEntries(source.cards.map(c => [c.name, c.count]));
const originals = {
  'Squawkabilly ex':'PAL:169', 'Meloetta ex':'BLK:44',
  'Tapu Koko ♢':'TEU:51', Exeggcute:'PLF:4',
  'Risky Ruins':'MEG:127', 'Damage Pump':'LOR:156',
  'Battle Compressor':'PHF:92', 'Lightning Energy':'MEE:12',
  'Double Colorless Energy':'SUM:136', 'Float Stone':'BKT:137',
  'Technical Machine: Crisis Punch':'PAF:90'
};
const hp = {'Squawkabilly ex':160,'Meloetta ex':200,'Tapu Koko ♢':130,Exeggcute:30};

/**
 * Hypothetical legal-access fixture. It models source board/zone transitions;
 * actual hand, search, Prize visibility, Store prompts, and policy are UNMODELED.
 * @param {number} opponentBenchCount
 */
function constructedLine(opponentBenchCount = 0) {
  const supply = new Map(Object.entries(counts));
  const bench = [], discard = [], lost = [], trace = [];
  let serial = 0, opponentPrizes = 6, maxBench = 0, pumpCount = 0;
  function spend(name, n = 1) {
    assert.ok((supply.get(name) ?? 0) >= n, 'original resource '+name+' x'+n);
    supply.set(name,supply.get(name)-n);
  }
  function physical(name) {return {id:++serial,name,damage:0,energy:[],tool:null};}
  // Source has Squawkabilly Active from setup, so Risky Ruins did not touch it.
  spend('Squawkabilly ex');
  const starter = physical('Squawkabilly ex');
  let active = starter;
  spend('Risky Ruins');
  spend('Battle Compressor');
  spend('Lightning Energy',2);
  discard.push(physical('Lightning Energy'),physical('Lightning Energy'));
  function place(name,recover=false) {
    assert.ok(['Meloetta ex','Tapu Koko ♢','Exeggcute'].includes(name),
      'source fixture only benches confirmed non-Darkness Basics');
    let card;
    if(recover) {
      const index = discard.findIndex(p=>p.name===name);
      assert.ok(index>=0,'same physical Exeggcute returned by Propagation');
      card=discard.splice(index,1)[0];
      assert.equal(card.damage,0,'damage clears after KO');
    } else {spend(name);card=physical(name);}
    assert.ok(bench.length<5,'Bench limit');
    card.damage=20; // Risky Ruins: placement during turn after Stadium played
    bench.push(card);
    maxBench=Math.max(maxBench,bench.length);
    trace.push({action:'Bench',name,id:card.id,damage:card.damage});
    return card;
  }
  function pump(donor,recipients) {
    assert.ok(bench.includes(donor),'single in-play donor');
    assert.ok(recipients.length>=1&&recipients.length<=2);
    assert.ok(recipients.every(p=>p!==donor&&bench.includes(p)));
    assert.ok(donor.damage>=10*recipients.length);
    spend('Damage Pump');
    pumpCount++;
    donor.damage-=10*recipients.length;
    for(const recipient of recipients)recipient.damage+=10;
    trace.push({action:'Damage Pump',donor:donor.name,
      targets:recipients.map(p=>p.name),count:recipients.length});
    // KO check after fully resolved Item effect.
    for(const pokemon of [...bench]) {
      if(pokemon.damage<hp[pokemon.name])continue;
      bench.splice(bench.indexOf(pokemon),1);
      pokemon.damage=0;
      discard.push(pokemon);
      opponentPrizes--;
      trace.push({action:'self-KO',name:pokemon.name,id:pokemon.id,prizes:opponentPrizes});
    }
  }
  function returnEggs() {return [place('Exeggcute',true),place('Exeggcute',true)];}
  const melo=place('Meloetta ex'),koko=place('Tapu Koko ♢');
  let a=place('Exeggcute'),b=place('Exeggcute');
  const physicalEggs=[a.id,b.id].sort();
  pump(melo,[a,b]); // two KOs and two counter units from Meloetta
  [a,b]=returnEggs();
  pump(koko,[a,b]); // two more KOs from Tapu Koko
  [a,b]=returnEggs();
  pump(b,[a]); // third Pump: Egg B lends one counter to Egg A
  assert.equal(b.damage,10);
  assert.equal(opponentPrizes,1);
  assert.ok(bench.includes(b));
  assert.deepEqual([a.id,b.id].sort(),physicalEggs,'two recycled physical cards');
  assert.ok(bench.includes(koko)&&bench.includes(melo));
  for(const target of [melo,b]) {
    const lightning=discard.findIndex(c=>c.name==='Lightning Energy');
    assert.ok(lightning>=0);
    target.energy.push(discard.splice(lightning,1)[0]);
  }
  bench.splice(bench.indexOf(koko),1);
  lost.push(koko);
  trace.push({action:'Dance of the Ancients',targets:[melo.name,b.name]});
  spend('Double Colorless Energy'); // sole manual Energy attachment
  melo.energy.push({name:'Double Colorless Energy',units:2});
  spend('Float Stone');
  starter.tool='Float Stone'; // removes printed one-Energy retreat
  spend('Technical Machine: Crisis Punch');
  melo.tool='Technical Machine: Crisis Punch';
  bench.splice(bench.indexOf(melo),1);
  bench.push(starter);
  active=melo;
  const energyUnits=melo.energy.reduce((n,c)=>n+(c.units??1),0);
  assert.ok(energyUnits>=3);
  assert.equal(active.name,'Meloetta ex');
  assert.equal(opponentPrizes,1);
  trace.push({action:'Crisis Punch',damage:280,energyUnits,opponentBenchCount,
    conditionalSoloWin:opponentBenchCount===0});
  return {trace,opponentPrizes,maxBench,pumpCount,bench,active,lost,
    conditionalSoloWin:opponentBenchCount===0,physicalEggs};
}

test('original rank26 printed sixty contains actual unown-free resources',()=>{
  assert.ok(source);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  for(const [name,printing] of Object.entries(originals)){
    const row=source.cards.find(c=>c.name===name);
    assert.ok(row,name);
    assert.equal(row.printing.set+':'+row.printing.number,printing);
  }
  assert.equal(counts['Exeggcute'],2);
  assert.ok(counts['Damage Pump']>=3);
  assert.ok(counts['Lightning Energy']>=2);
});

test('paper ledger: three one-donor Pumps yield 2+2+1 KOs with no Unown',()=>{
  const r=constructedLine();
  assert.equal(r.pumpCount,3);
  assert.equal(r.opponentPrizes,1);
  assert.equal(r.maxBench,4);
  assert.equal(r.conditionalSoloWin,true);
  assert.deepEqual(r.trace.filter(x=>x.action==='Damage Pump')
    .map(x=>[x.donor,x.count]),[['Meloetta ex',2],['Tapu Koko ♢',2],['Exeggcute',1]]);
  const ko=r.trace.filter(x=>x.action==='self-KO');
  assert.equal(ko.length,5);
  assert.ok(ko.every(x=>x.name==='Exeggcute'));
  assert.ok(ko.every(x=>r.physicalEggs.includes(x.id)));
  assert.equal(r.trace.filter(x=>x.name==='Unown').length,0);
  assert.equal(r.lost[0].name,'Tapu Koko ♢');
  assert.equal(r.trace.at(-1).energyUnits,3);
  assert.equal(r.bench.length,2);
  console.log('AGENT50_UNOWNLESS_LINE',JSON.stringify({
    fivePhysicalSelfKOs:ko.map(x=>x.id),pumpUses:r.pumpCount,
    donorSequence:['Meloetta ex','Tapu Koko ♢','Exeggcute'],
    maxBench:r.maxBench,opponentPrizes:r.opponentPrizes,
    conditionalSoloWin:r.conditionalSoloWin,
    evidence:'constructed card-text ledger only; native Store unverified'
  }));
});

test('opposing Bench survives even if identical conditional attack settles',()=>{
  const r=constructedLine(1);
  assert.equal(r.conditionalSoloWin,false);
  assert.equal(r.opponentPrizes,1);
  assert.equal(r.trace.at(-1).damage,280);
});
