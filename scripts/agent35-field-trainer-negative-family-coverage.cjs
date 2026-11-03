'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {COST_BY_PRINT} = require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');
const {FIRST_OWNER_TURN_ONLY} = require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');
const {PRINT_RULES} = require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');
const {REMOVAL_PRINTINGS} = require('../simulation/twinleaf/agent6-public-removal-target-certificate.cjs');

const VERSION = 'agent35-field-trainer-negative-family-coverage-v1';

/**
 * Measure exact source-name+set print incidence of four independently
 * implemented *negative necessary-condition* rule families. A matching
 * family is not evidence that the Trainer is payable, effective or legal.
 * An unmatched key says nothing about whether some other policy models it.
 *
 * @param {object} source Authenticated original-source decklist archive.
 * @param {{payment:Map<string,object>,temporal:object,prize:object,removal:object}} gates
 * @returns {object} Source-roster inventory with mechanically testable counts.
 */
function surveyFieldTrainerGates(source,gates={
  payment:COST_BY_PRINT,temporal:FIRST_OWNER_TURN_ONLY,
  prize:PRINT_RULES,removal:REMOVAL_PRINTINGS
}){
  assert.ok(Array.isArray(source?.decks));
  assert.ok(gates.payment instanceof Map);
  for(const key of ['temporal','prize','removal'])
    assert.ok(gates[key] && typeof gates[key]==='object');
  const ranks = new Set();
  const sourcePrintings = new Map();
  const perDeck = [];
  let trainerCopies = 0;
  let anyFamilyCopies = 0;
  let knownPaymentCopies = 0;
  let positiveDiscardOptionCopies = 0;
  let unavoidableDiscardCopies = 0;
  let temporalCopies = 0;
  let prizeCopies = 0;
  let targetCopies = 0;
  for(const deck of source.decks){
    assert.ok(Number.isSafeInteger(deck.rank) && deck.rank>=1 && deck.rank<=32);
    assert.ok(!ranks.has(deck.rank),'Duplicate original tournament rank');
    ranks.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60,
      'Original source deck must be exactly 60 physical cards');
    const local = {rank:deck.rank,archetype:deck.archetype,
      trainerCopies:0,copiesWithAnyExactNegativeFamily:0,
      copiesWithoutTheseFourFamilies:0};
    for(const card of deck.cards){
      assert.ok(Number.isSafeInteger(card.count) && card.count>=1);
      if(card.category!=='Trainer')continue;
      assert.equal(card.printing?.language,'en');
      const key=card.name+' '+card.printing.set;
      const payment=gates.payment.get(key)??null;
      const costModes=payment?.options??[];
      const temporal=Object.hasOwn(gates.temporal,key);
      const prize=Object.hasOwn(gates.prize,key);
      const target=Object.hasOwn(gates.removal,key);
      const familyNames=[
        ...(payment?['physical-hand-payment']:[]),
        ...(temporal?['printed-turn-window']:[]),
        ...(prize?['public-prize-prerequisite']:[]),
        ...(target?['public-removal-target']:[])
      ];
      const positive=costModes.some(mode=>mode.discards>0);
      const unavoidable=costModes.length>0 &&
        costModes.every(mode=>mode.discards>0);
      trainerCopies+=card.count;
      local.trainerCopies+=card.count;
      if(familyNames.length){
        anyFamilyCopies+=card.count;
        local.copiesWithAnyExactNegativeFamily+=card.count;
      }
      if(payment)knownPaymentCopies+=card.count;
      if(positive)positiveDiscardOptionCopies+=card.count;
      if(unavoidable)unavoidableDiscardCopies+=card.count;
      if(temporal)temporalCopies+=card.count;
      if(prize)prizeCopies+=card.count;
      if(target)targetCopies+=card.count;
      const prev=sourcePrintings.get(key)??{
        printing:key,physicalCopies:0,sourceDecks:0,families:familyNames,
        hasPositiveDiscardOption:positive,
        hasUnavoidableHandDiscard:unavoidable
      };
      assert.deepEqual(prev.families,familyNames);
      prev.physicalCopies+=card.count;
      prev.sourceDecks++;
      sourcePrintings.set(key,prev);
    }
    local.copiesWithoutTheseFourFamilies=local.trainerCopies-
      local.copiesWithAnyExactNegativeFamily;
    perDeck.push(local);
  }
  const sorted=[...sourcePrintings.values()].sort((a,b)=>
    b.physicalCopies-a.physicalCopies||
    a.printing.localeCompare(b.printing));
  const uncovered=sorted.filter(entry=>entry.families.length===0);
  assert.equal(trainerCopies,anyFamilyCopies+
    uncovered.reduce((n,entry)=>n+entry.physicalCopies,0));
  return {
    version:VERSION,
    sourceArchive:source.source,
    denominator:'source decklist Trainer copies, not hands, games or legal moves',
    exactKey:'source English card name plus set, without collector or native aliases',
    negativeOnly:true,opponentHiddenInformationUsed:false,
    allMissingPaperRulesAreNotKnown:false,
    allowedConclusions:[
      'which exact source printings have one of four current negative-certificate families',
      'how many original-source physical copies those families touch'
    ],
    forbiddenConclusions:[
      'unmatched printings are unimplemented or illegal',
      'matched printings are paper playable, strategically good, or tested in native games'
    ],
    authenticatedSourceSixties:source.decks.length,
    missingOriginalRanks:[...(source.missing_full_lists??[])].map(x=>x.rank),
    sourceTrainerCopies:trainerCopies,
    sourceDistinctNameSetPrintings:sourcePrintings.size,
    copiesWithAnyExactNegativeFamily:anyFamilyCopies,
    copiesWithoutTheseFourFamilies:trainerCopies-anyFamilyCopies,
    distinctPrintingsWithAnyExactNegativeFamily:
      sorted.filter(x=>x.families.length>0).length,
    knownPaymentModeCopies:knownPaymentCopies,
    positiveDiscardOptionCopies,
    unavoidableHandDiscardCopies,
    printedTurnWindowCopies:temporalCopies,
    publicPrizePrerequisiteCopies:prizeCopies,
    publicRemovalTargetCopies:targetCopies,
    largestUnmatchedSourcePrintings:uncovered.slice(0,30),
    perDeck:perDeck.sort((a,b)=>a.rank-b.rank)
  };
}

if(require.main===module){
  const file=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
  const source=JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(surveyFieldTrainerGates(source),null,2)+'\n');
}

module.exports={VERSION,surveyFieldTrainerGates};
