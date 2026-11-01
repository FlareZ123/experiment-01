'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {study}=require('../scripts/agent25-dhelmise-any-psychic-attack-opening.cjs');
const near=(value,want)=>assert.ok(Math.abs(value-want)<1e-12,
  'Physical exact rational mismatch '+value+' != '+want);
test('8-donor fixed source v2: ordinary Basic or Telepathic Psychic doubles narrow opening window',()=>{
  const r=study();
  const first=r.scenarios[0];
  const narrow=first.strictTelepathicAndAccessibleClefairy;
  const ordinary=first.anyPsychicEnergyNoClefairyRequirement;
  assert.equal(first.sameFixedSixtyAsSourceV2,true);
  near(narrow.allAbilities.unconditional,0.07243542827872268);
  near(narrow.wobbuffet.unconditional,0.06648246339148947);
  near(ordinary.allAbilities.unconditional,0.1391061933846669);
  near(ordinary.wobbuffet.unconditional,0.12712666183547863);
  near(ordinary.silentLab.unconditional,0.12712666183547863);
  near(ordinary.allAbilities.conditionalBasicValid,0.16148675234366758);
  near(ordinary.garbotoxin.unconditional,0);
  assert.ok(ordinary.allAbilities.unconditional>narrow.allAbilities.unconditional);
  assert.equal(ordinary.allAbilities.energyCount,10);
  assert.equal(ordinary.allAbilities.clefairyCount,0);
  assert.equal(ordinary.allAbilities.requireClefairy,false);
});
test('10/12 donor hypothetical packages increase Wobbuffet/Silent Lab survival while accounting for other card cuts',()=>{
  const r=study();
  assert.deepEqual(r.scenarios.map(x=>x.hypotheticalNonDonorCardsCut),[0,2,4]);
  assert.deepEqual(r.scenarios.map(x=>x.basicCount),[14,15,16]);
  const [,ten,twelve]=r.scenarios;
  near(ten.anyPsychicEnergyNoClefairyRequirement.allAbilities.unconditional,
    0.1399158742614339);
  near(twelve.anyPsychicEnergyNoClefairyRequirement.allAbilities.unconditional,
    0.13994088132816837);
  near(ten.anyPsychicEnergyNoClefairyRequirement.wobbuffet.unconditional,
    0.13634967569256143);
  near(twelve.anyPsychicEnergyNoClefairyRequirement.wobbuffet.unconditional,
    0.1391061933846669);
  assert.ok(r.scenarios.every(x=>
    x.anyPsychicEnergyNoClefairyRequirement.garbotoxin.favorableWorlds==='0'));
  assert.equal(r.competitiveQualifiedGames,0);
  assert.equal(r.otherScenariosAreNotActualSixties,true);
});
