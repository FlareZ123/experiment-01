'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const {basePrizeFromRules:award,frozenPrizeNameHeuristic:old,
  normalizedPromoNumber,auditPrizeField}=require('../../simulation/evaluation/2026-11/agent25-prize-rule-source-audit.cjs');
const load=id=>JSON.parse(fs.readFileSync(path.join(ROOT,'resources/cards/en',id+'.json'),'utf8'));
const sets=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/sets/en.json'),'utf8'));
const card=(id,number,name)=>{
  const r=load(id).filter(c=>String(c.number)===String(number)&&c.name===name);
  assert.equal(r.length,1,'expected exact source '+id+'/'+number+'/'+name);
  return r[0];
};
test('two-rule modern Mega Dragonite overrides 2-Prize ex with 3-Prize Mega',()=>{
  const c=card('me2pt5','152','Mega Dragonite ex');
  assert.equal(c.rules.length,2);
  assert.equal(award(c),3);
  assert.equal(old(c.name),2);
});
test('original rank8 Mega Absol print 3 Prizes, Dedenne-GX 2',()=>{
  assert.equal(award(card('me1','86','Mega Absol ex')),3);
  assert.equal(award(card('sm10','57','Dedenne-GX')),2);
});
test('three other 2026 modern Mega classes from exact pool have 3 prizes',()=>{
  const a=card('me2','84','Mega Lopunny ex');
  const b=card('me1','104','Mega Kangaskhan ex');
  assert.equal(award(a),3);assert.equal(award(b),3);
});
test('VSTAR original Aichi prints have 2 Prizes, but current name score 1',()=>{
  for(const [id,num,name] of [
    ['swsh12','136','Regidrago VSTAR'],
    ['swsh11','136','Hisuian Goodra VSTAR']]){
    assert.equal(award(card(id,num,name)),2);
    assert.equal(old(name),1);
  }
});
test('old XY Mega EX never inherits modern Mega ex 3-Prize rule',()=>{
  const c=card('xy6','76','M Rayquaza-EX');
  assert.equal(award(c),2);
});
test('TAG TEAM 3, VMAX 3, V 2, ordinary 1',()=>{
  assert.equal(award(card('smp','SM217','Trevenant & Dusknoir-GX')),3);
  assert.equal(award(card('swsh6','75','Shadow Rider Calyrex VMAX')),3);
  assert.equal(award(card('swsh6','74','Shadow Rider Calyrex V')),2);
  assert.equal(award(card('sm2','58','Mimikyu')),1);
});
test('SMP source number resolves exact promo-prefixed native catalogue number',()=>{
  assert.deepEqual(normalizedPromoNumber('SMP','217'),['SM217','217']);
  assert.deepEqual(normalizedPromoNumber('XYP','42'),['XY42','42']);
});
const row=(name,set,number,count)=>({category:'Pokémon',name,count,
  printing:{set,number,language:'en'}});
const filler=count=>({category:'Trainer',count,name:'Not audited',
  printing:{set:'PRC',number:'141',language:'en'}});
const make=(rank,cards)=>({rank,cards:[...cards,filler(60-cards.reduce((n,c)=>n+c.count,0))]});
test('source audit detects exact rule miscounts in two full-60 printed fixtures',()=>{
  const decks=[make(8,[row('Mega Absol ex','MEG','86',2),row('Dedenne-GX','UNB','57',1)]),
    make(14,[row('Regidrago VSTAR','SIT','136',3),
      row('Mega Dragonite ex','ASC','152',1),row('Hisuian Goodra VSTAR','LOR','136',1)])];
  const a=auditPrizeField({decks,sets,loadSet:load});
  assert.equal(a.opponentLists,2);
  assert.equal(a.sourcePokemonRows,5);
  assert.equal(a.matchedRows,5);
  assert.equal(a.unresolvedRows,0);
  assert.equal(a.mismatchedRows,4);
  assert.equal(a.mismatchedCopies,7);
  assert.deepEqual(a.affectedRanks,[8,14]);
  assert.equal(a.rows.find(r=>r.name==='Dedenne-GX').printedPrizeAward,2);
});
test('missing original printing remains unresolved, never silently guessed',()=>{
  const decks=[make(5,[row('Card not found in source','CRE','9876',1)])];
  const a=auditPrizeField({decks,sets,loadSet:load});
  assert.equal(a.unresolvedRows,1);
  assert.equal(a.rows[0].printedPrizeAward,null);
  assert.equal(a.rows[0].status,'missing');
});
test('wrong source sixty fails closed before assessing prizes',()=>{
  assert.throws(()=>auditPrizeField({decks:[{rank:2,cards:[row('Mimikyu','GRI','58',1)]}],sets,loadSet:load}),
    /NOT_AUTHENTIC_ORIGINAL_60/);
});
