'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeNativeTrial,summarizeArchive}=
  require('../../simulation/evaluation/2026-11/agent33-shadow-active-funding-ledger-audit.cjs');

const active=energies=>({
  printing:'Shadow Rider Calyrex VMAX CRE',
  energyCards:Array.from({length:energies},()=> 'Psychic Energy')
});
const bench=(printing,energies)=>({
  printing,energyCards:Array.from({length:energies},()=> 'Psychic Energy')
});

/** @param {string} candidate @param {number} activeEnergy */
function synthetic(candidate,activeEnergy){
  return {
    trial:{id:'7:7002:B:'+candidate,rank:7,candidateSlot:'B',
      seed:1693388692,candidateId:candidate},
    sourceDealFingerprint:'same-original-source',
    fullPhysicalDealFingerprint:'different-candidate-deal',
    finished:true,winner:candidate==='champion-reference'?1:0,turns:65,
    attackDeclarations:{source:0,candidate:
      candidate==='champion-reference'?2:0},
    finalBoard:[{active:{printing:'Girafarig LOT',energyCards:[]},bench:[]},
      {active:active(activeEnergy),bench:[
        bench('Marshadow UNB',4),bench("Lillie's Clefairy ex JTG",1)
      ]}],
    nativeAcceptedEnergyPromptSidecar:{
      events:[{
        playerSlot:1,turnBefore:31,dispatchOrdinal:127,
        publicChanges:[{
          before:{pokemon:'Marshadow UNB',energies:['Psychic Energy']},
          after:{pokemon:'Marshadow UNB',
            energies:['Psychic Energy','Psychic Energy']}
        }]
      },{
        playerSlot:0,turnBefore:30,publicChanges:[{
          after:{pokemon:'Marshadow UNB',energies:['Psychic Energy']}
        }]
      }]
    },
    nativeAcceptedTargetSidecar:{
      events:[{
        playerSlot:1,action:'PlayCardAction',turnBefore:31,
        actionOrdinal:133,
        declared:{ownerHandPrinting:'Psychic Energy MEE',
          target:{slot:2,index:3}}
      }]
    }
  };
}

test('source-owned final board is not wrongly used as candidate board',()=>{
  const r=summarizeNativeTrial(synthetic('hood-shield-v1',1));
  assert.equal(r.finalActivePsychic,1);
  assert.equal(r.finalBenchPsychic,5);
  assert.equal(r.strandedActiveVmax,true);
  assert.equal(r.nativeUnderworldPromptChoices,1);
  assert.equal(r.underworldToMarshadow,1);
  assert.deepEqual(r.manualEnergy,[{
    turn:31,ordinal:133,slot:2,index:3
  }]);
  assert.equal(r.candidateAttackDeclarations,0);
});

test('source-matched two-arm tally preserves native action and winner limits',()=>{
  const a=synthetic('champion-reference',3);
  const b=synthetic('hood-shield-v1',1);
  const report=summarizeArchive({
    actualNativeRuns:[{
      enginePin:'pinned-test',
      rows:[a]
    },{
      enginePin:'pinned-test',
      rows:[b]
    }]
  });
  assert.equal(report.counts['champion-reference'].activeVmaxAtFinal,1);
  assert.equal(report.counts['champion-reference'].strandedActiveVmaxAtFinal,0);
  assert.equal(report.counts['hood-shield-v1'].strandedActiveVmaxAtFinal,1);
  assert.equal(report.rank7b.length,2);
  assert.equal(report.competitiveQualifiedGames,0);
});

test('rejects a falsely claimed matched rank7 source deal',()=>{
  const a=synthetic('champion-reference',3);
  const b=synthetic('hood-shield-v1',1);
  b.sourceDealFingerprint='different-original-source';
  assert.throws(()=>summarizeArchive({actualNativeRuns:[
    {enginePin:'pinned-test',rows:[a]},
    {enginePin:'pinned-test',rows:[b]}
  ]}),/identical original-source deal/);
});
