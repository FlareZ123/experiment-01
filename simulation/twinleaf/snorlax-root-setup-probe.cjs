'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');

const cases=Object.freeze([
  {rank:3,sourceSeat:1,seed:81979068,reason:'two starting prompts in same physical deal'},
  {rank:3,sourceSeat:0,seed:573966525,reason:'Girafarig default and source solo counterfactual'},
  {rank:7,sourceSeat:0,seed:2128076113,reason:'Wobbuffet default four-Bench contrast'}
]);

/** Inspect all real setup Store resolutions and the resulting first-turn board. */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const rows=cases.map(c=>{
    const source=plan.opponents.find(x=>x.rank===c.rank);
    assert.equal(source?.status,'ready');
    const request={
      deckA:c.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:c.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:c.seed,maxActions:40,strictPromptValidation:true,
      isolatePolicyRandomness:true,
      snorlaxSoloOpeningSeat:c.sourceSeat,
      captureStartingBoard:true,
      label:'snorlax-root-authentication-rank'+c.rank
    };
    try{
      const game=runMatch(request);
      return {...c,ok:true,rootSetupSelections:game.rootSoloSetupSelections,
        callbackEvents:game.snorlaxSoloOpeningEvents,
        initialBoardAtFirstTurn:game.initialBoardAtFirstTurn,
        actualFirstTurnSlot:game.firstTurnSlot,
        turnVerifiedByDrawLog:game.verifiedByDrawLog,
        actions:game.actions,
        finished:game.finished,
        evidenceQualifiedForCompetitiveInference:false};
    }catch(error){
      return {...c,ok:false,error:String(error?.stack||error),
        evidenceQualifiedForCompetitiveInference:false};
    }
  });
  return {
    schema:'source-ranked-Snorlax-actual-Store-setup-prompts-v1',
    scope:'Retrospectively selected reproducible seeds, root-only setup mechanics; no win rate',
    engineRevision:plan.engineRevision,
    sourceFieldDigest:plan.manifestDigest,
    sourceRank1Digest:plan.candidateDigest,
    qualifiedCompetitiveGames:0,rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={cases,run};
