'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {promptPrefix,auditNativePreForkSelections}=
  require('../simulation/evaluation/agent50-native-prompt-before-attack-diff.cjs');

/** @returns {object} */
function packet(){
  const event=(ordinal,selectedCards)=>({ordinal,kind:'ChooseCardsPrompt',
    sourceZone:'hand',sourcePlayerSlot:0,selectedCards,
    selectedIndices:null,sourceZoneCardCountBefore:7});
  const row=(events)=>({trial:{id:'11:0:A:champion-reference'},
    nativePromptChoices:{events}});
  return {pairs:[{id:'11:0:A:champion-reference',
      samePhysicalInput:true,firstRootDifference:{
        baseline:{action:'AttackAction',actionOrdinal:46,playerSlot:0},
        treatment:{action:'AttackAction',actionOrdinal:46,playerSlot:0}}}],
    raw:{
      baseline:{rows:[row([event(3,['Tapu Lele-GX GRI']),event(18,null),
        event(52,['A card after fork'])])]},
      treatment:{rows:[row([event(3,['Tapu Lele-GX GRI']),event(18,null),
        event(52,['A different card after fork'])])]}
    }};
}

test('equal postgame selected-card prefix excludes later game changes',()=>{
  const output=auditNativePreForkSelections(packet());
  assert.equal(output.originalAttemptPairs,1);
  assert.equal(output.reportedPromptPrefixParityCases,1);
  assert.equal(output.fullyNamedReportedPromptPrefixCases,0);
  assert.equal(output.cases[0].status,
    'known-prompt-prefix-matched-with-unnamed-selections');
  assert.equal(output.cases[0].firstDivergenceWasSameActorAttack,true);
  assert.equal(output.cases[0].baseline.count,2);
  assert.equal(output.cases[0].baseline.unknownNames,1);
  assert.equal(output.competitiveQualifiedGames,0);
});

test('a different selected printing before attack invalidates prefix parity',()=>{
  const source=packet();
  source.raw.treatment.rows[0].nativePromptChoices.events[0].selectedCards=
    ['Different Pokémon'];
  const result=auditNativePreForkSelections(source);
  assert.equal(result.reportedPromptPrefixParityCases,0);
  assert.equal(result.cases[0].status,
    'reported-physical-prompt-prefix-diverged');
});

test('fully named equal pre-fork records grant only named-receipt parity',()=>{
  const source=packet();
  for(const side of ['baseline','treatment'])
    source.raw[side].rows[0].nativePromptChoices.events[1].selectedCards=
      ['Mimikyu GRI'];
  const result=auditNativePreForkSelections(source);
  assert.equal(result.fullyNamedReportedPromptPrefixCases,1);
  assert.equal(result.cases[0].status,'all-named-prompt-prefix-matched');
  assert.equal(result.cases[0].competitiveGameQualified,false);
});

test('missing native prompt evidence cannot masquerade as equal prefix',()=>{
  const source=packet();
  delete source.raw.treatment.rows[0].nativePromptChoices;
  const result=auditNativePreForkSelections(source);
  assert.equal(result.cases[0].equalReportedPrefix,false);
  assert.equal(result.cases[0].status,'missing-original-prompt-sidecar');
});

test('duplicate original native prompt ordinals are refused',()=>{
  const record={events:[
    {ordinal:4,kind:'ChooseCardsPrompt',selectedCards:['a']},
    {ordinal:4,kind:'ChooseCardsPrompt',selectedCards:['b']}]}
  assert.throws(()=>promptPrefix(record,46),/Duplicate/);
});
