'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  preflight,classifySourceRow,characterizeMode,run
} = require('../simulation/evaluation/agent36-rank5-trainer-policy-native-v1.cjs');

/** @param {object} trial @param {string[]} printings */
function row(trial,printings) {
  const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
  const accepted = printings.map(ownerHandPrinting => ({
    storeAccepted: true, playerSlot:sourceSeat, action:'PlayCardAction',
    declared:{ownerHandPrinting}
  }));
  return {
    trial,sourceSeat,sourceDealFingerprint:'registered-source-'+trial.id,
    rootActionLedger: accepted.map(event=>({
      playerSlot:event.playerSlot,action:'PlayCardAction'})),
    rootActionCount:printings.length,actionCount:printings.length,
    nativeAcceptedTargetSidecar:{events:accepted},
    status:'action-limit',endReason:'root-action-limit',
    attackDeclarations:{source:0},competitiveQualified:false
  };
}

test('preflight pins fresh source physical seeds, source roster and both fixed candidate IDs',()=>{
  const registration=preflight();
  assert.equal(registration.registeredGroups.length,4);
  assert.equal(new Set(registration.registeredGroups.map(g=>g.seed)).size,4);
  assert.equal(registration.modes.baseline.options.actorNaturalEvolutionRoot,true);
  assert.equal(registration.modes.sourceTrainerComposite.options.actorGenesectFusionDrawRoot,true);
  assert.equal(registration.modes.sourceTrainerComposite.options.sourceScopedQuickBallRoot,true);
  assert.equal(registration.totalExpectedArms,16);
});

test('rank5 source actual printed Quick Ball is a Trainer; Pokémon and DCE are distinguished',()=>{
  const trial={rank:5,candidateSlot:'A',candidateId:'champion-reference',id:'5:0:A:champion-reference'};
  const classified=classifySourceRow(row(trial,[
    'Quick Ball FST','Mew V FST','Double Colorless Energy SUM'
  ]));
  assert.equal(classified.nativeCardPlaysCertified,true);
  assert.equal(classified.acceptedSourceTrainerPlays,1);
  assert.deepEqual(classified.sourceCardClassCounts,
    {pokemon:1,energy:1,trainer:1});
});

test('foreign reprint from outside exact original roster cannot be counted as source Trainer',()=>{
  const trial={rank:5,candidateSlot:'B',candidateId:'new-moon-lockbreaker-v1',id:'5:0:B:new-moon-lockbreaker-v1'};
  const classified=classifySourceRow(row(trial,['Quick Ball SSH']));
  assert.equal(classified.nativeCardPlaysCertified,false);
  assert.equal(classified.acceptedSourceTrainerPlays,null);
  assert.match(classified.sourceClassificationError,/Unrecognized source printing/);
});

test('whole two-candidate paired experiment retains an unchanged source deal and reports Trainer delta without inventing wins',()=>{
  const result=run({runDevelopment: options=>{
    const activated=options.sourceScopedQuickBallRoot===true;
    assert.equal(options.registeredTrials.length,8);
    return {
      attempted:8,rows:options.registeredTrials.map(trial=>
        row(trial,activated?['Mew V FST','Quick Ball FST']:
          ['Mew V FST']))
    };
  }});
  assert.equal(result.allRegisteredAttempts,16);
  assert.equal(result.modes.baseline.count.acceptedOriginalSourceTrainerPlays,0);
  assert.equal(result.modes.sourceTrainerComposite.count.acceptedOriginalSourceTrainerPlays,8);
  assert.equal(result.paired.length,8);
  assert.equal(result.paired.filter(x=>x.exactSameSourcePhysicalDeal).length,8);
  assert.equal(result.paired.reduce((n,x)=>n+x.sourceTrainerDelta,0),8);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.estimatedFieldWinRate,null);
});

test('a batch error remains a recorded missing denominator rather than eight invented losses',()=>{
  const result=run({runDevelopment: options=>{
    if(options.sourceScopedQuickBallRoot) throw Error('test admission abort');
    return {attempted:8,rows:options.registeredTrials.map(trial=>
      row(trial,['Mew V FST']))};
  }});
  assert.equal(result.modes.sourceTrainerComposite.count.scheduled,8);
  assert.equal(result.modes.sourceTrainerComposite.count.nativeAttemptsVerified,null);
  assert.equal(result.modes.sourceTrainerComposite.raw,null);
  assert.equal(result.paired.every(x=>x.sourceTrainerDelta===null),true);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('eight fixtures with one source Trainer each yield eight accepted physical Trainer plays',()=>{
  const trials=preflight().registeredGroups.flatMap(group=>
    ['champion-reference','new-moon-lockbreaker-v1'].map(candidateId=>
      ({...group,candidateId,id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')})));
  const outcome=characterizeMode({rows:trials.map(trial=>
    row(trial,['Quick Ball FST']))});
  assert.equal(outcome.sourceClassified,8);
  assert.equal(outcome.acceptedOriginalSourceTrainerPlays,8);
  assert.equal(outcome.unclassifiedOrAborted,0);
});
