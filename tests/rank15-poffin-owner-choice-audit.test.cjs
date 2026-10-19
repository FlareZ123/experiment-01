'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const {auditRank15PoffinChoice} =
  require('../scripts/rank15-poffin-owner-choice-audit.cjs');

/**
 * Small excerpt derived from the compiled Store archive at CI 39335486263.
 * This is a data-only fixture, not an independent simulator execution.
 */
function excerpt() {
  const empty = ['Budew ASC', 'Eldegoss V RCL', null, null, null];
  const placed = ['Budew ASC', 'Eldegoss V RCL', 'Budew ASC', 'Buneary M2', null];
  const evolved = ['Budew ASC', 'Eldegoss V RCL', 'Budew ASC',
    'Mega Lopunny ex M2', null];
  const stageCounts = {oddish:2, gloom:2, aor:2, bus:1};
  const root = (rootOrdinal, action, previousPrompt, selectedPrintedCards,
    before, after, extra={}) => ({
      rootOrdinal, action, previousPrompt, selectedPrintedCards,
      sourceCard:null, promptWasOwnDeck:false, ownerSearchStageCounts:null,
      before:{bench:before}, after:{bench:after}, ...extra
    });
  return {
    schema:'rank15-retrospective-true-source-paid-tm-poffin-fork-v2',
    sourceRank:15,sourceSeat:1,seed:3050400820,
    identicalOriginalPrepolicyPhysicalDeal:true,
    qualifications:{competitiveGamesQualified:0},
    sourceInitialPrizeGate:{beforeTakingPrizesEligible:true,
      oddishPrized:0,gloomPrized:0,aorPrized:0,busPrized:0},
    original:{actualRootPoffinItemPlays:0,nativeEvolutionDeclarations:0},
    poffinAlternative:{actualRootPoffinItemPlays:1,nativeEvolutionDeclarations:1},
    policyAttempts:[{valid:true,freeBench:3,
      ownerHand:['Buddy-Buddy Poffin TEF','Tag Call CEC']}],
    originalRootChoiceWindow:[
      root(127,'PlayCardAction',null,[],empty,empty,
        {sourceCard:'Buddy-Buddy Poffin TEF'}),
      root(128,'ResolvePromptAction','ChooseCardsPrompt',
        ['Budew ASC','Buneary M2'],empty,placed,
        {promptWasOwnDeck:true,ownerSearchStageCounts:stageCounts}),
      root(141,'AttackAction',null,[],placed,placed),
      root(142,'ResolvePromptAction','ChoosePokemonPrompt',
        ['Buneary M2'],placed,placed),
      root(143,'ResolvePromptAction','ChooseCardsPrompt',
        ['Mega Lopunny ex M2'],placed,evolved,
        {promptWasOwnDeck:true,ownerSearchStageCounts:stageCounts})
    ]
  };
}

test('recorded K1 search had two selectable Oddish but chose other Basics',()=>{
  const result=auditRank15PoffinChoice(excerpt());
  assert.equal(result.physicallyAvailableOddishNotChosen,true);
  assert.deepEqual(result.sourceOwnDeckAvailable,
    {oddish:2,gloom:2,aor:2,bus:1});
  assert.deepEqual(result.observerRootOrdinals,
    {poffinPlay:127,poffinSearch:128,evolutionAttack:141,
      tmTargetChoice:142,stage1Search:143});
  assert.equal(result.competitivePolicyQualified,false);
});

test('fails closed when physical Prize/deal provenance changes',()=>{
  const x=excerpt();x.sourceInitialPrizeGate.oddishPrized=1;
  assert.throws(()=>auditRank15PoffinChoice(x));
});

test('requires genuine root Item and attack evidence',()=>{
  const x=excerpt();x.originalRootChoiceWindow.splice(0,1);
  assert.throws(()=>auditRank15PoffinChoice(x));
  const y=excerpt();y.originalRootChoiceWindow.splice(2,1);
  assert.throws(()=>auditRank15PoffinChoice(y));
});

test('foreign prompt cannot masquerade as own K1 search',()=>{
  const x=excerpt();x.originalRootChoiceWindow[1].promptWasOwnDeck=false;
  assert.throws(()=>auditRank15PoffinChoice(x));
});

test('checks physical availability and selected native response separately',()=>{
  const x=excerpt();x.originalRootChoiceWindow[1].ownerSearchStageCounts.oddish=0;
  assert.throws(()=>auditRank15PoffinChoice(x));
  const y=excerpt();y.originalRootChoiceWindow[1].selectedPrintedCards[0]='Oddish UNB';
  assert.throws(()=>auditRank15PoffinChoice(y));
});

test('complete immutable native archive reproduces excerpt when supplied',
  {skip:!process.env.RANK15_NATIVE_POFFIN_JSON},()=>{
    const native=JSON.parse(fs.readFileSync(
      process.env.RANK15_NATIVE_POFFIN_JSON,'utf8'));
    const result=auditRank15PoffinChoice(native);
    assert.equal(result.physicallyAvailableOddishNotChosen,true);
  });
