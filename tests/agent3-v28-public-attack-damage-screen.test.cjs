'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {screenNativeAttackDamage}=require(
  '../simulation/evaluation/agent3-v28-public-attack-damage-screen.cjs');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,
  'results/methodology/data/agent3-v28-public-ko-attacker-nominal-damage-fixture.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const run=rows=>screenNativeAttackDamage(rows,source);
const fresh=()=>structuredClone(data.observations);

test('eight public KO victims have unambiguous source-roster printed attack identities',()=>{
  const r=run(fresh());
  assert.equal(r.paperGameCertified,false);
  assert.equal(r.qualifiedCompetitiveGames,0);
  assert.deepEqual(r.rows.map(x=>x.rosterAttackerPrintedId),[
    'sv6-77','sv6-77','sv2-169','swsh10-133','swsh10-133',
    'sv8-76','sv8-76','sv8-76']);
  assert.deepEqual(r.rows.map(x=>x.unmodifiedPrintedFinalAttackDamage),
    [140,140,20,130,130,200,200,200]);
  assert.deepEqual(r.rows.map(x=>x.nominalDamageDifference),
    [0,0,160,0,230,0,0,200]);
  assert.equal(r.rows.every(x=>x.attackerStage==='Basic'),true);
  assert.deepEqual(r.rows.map(x=>x.attackerTypes),[
    ['Lightning'],['Lightning'],['Colorless'],['Colorless'],
    ['Colorless'],['Psychic'],['Psychic'],['Psychic']]);
  assert.ok(r.rows.every(x=>x.paperGameCertified===false&&
    x.exactAttackerAtNativeDeclarationObserved===false));
});

test('missing or ambiguous printed attacker in original 60 fails closed',()=>{
  const bad=fresh();bad[3].attackName='Unlisted Attack';
  assert.throws(()=>run(bad),/Ambiguous\/missing printed attacker/);
  const cloned=structuredClone(source);
  const rank11=cloned.decks.find(x=>x.rank===11);
  rank11.cards.push({...rank11.cards.find(x=>x.name==='Oranguru V')});
  assert.throws(()=>screenNativeAttackDamage(fresh(),cloned),
    /Ambiguous\/missing printed attacker/);
});

test('unknown target Energy, non-neutral print and unregistered rank fail closed',()=>{
  const wrongEnergy=fresh();
  wrongEnergy[3].publicEnergyCardsOnVictim.push({name:'Unverified Energy',set:'ZZZ'});
  assert.throws(()=>run(wrongEnergy),/Unsupported nominal attack grammar/);
  const wrongRank=fresh();wrongRank[0].registeredTrialId='2:210:B:champion-reference';
  assert.throws(()=>run(wrongRank),/Unregistered rank/);
  const wrongHP=fresh();wrongHP[4].victimPrinting.printedHp=80;
  assert.throws(()=>run(wrongHP),/Expected values to be strictly equal/);
});
