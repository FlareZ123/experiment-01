'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectArchive}=require('../simulation/evaluation/rank8-stone-archive-inspector.cjs');

/** @returns {object} */
function sourceFixture() {
  const event=(actionOrdinal,turnBefore,playerSlot,action,rest={})=>
    ({actionOrdinal,turnBefore,playerSlot,action,...rest});
  const source=[
    event(158,16,1,'PlayCardAction',{card:'VS Seeker'}),
    event(161,16,1,'PlayCardAction',{card:'Arven'}),
    event(171,16,1,'PlayCardAction',{card:'Psychic Energy'}),
    event(172,16,1,'UseAbilityAction',{ability:'Star Alchemy'}),
    event(174,16,1,'ResolvePromptAction',{cardSelection:{
      sourceZone:'deck',message:'CHOOSE_CARD_TO_HAND',
      selectedCards:['Acerola BUS']
    }}),
    event(177,16,1,'AttackAction',{attack:'Max Geist',
      decisionHandBefore:{ownHandPrintings:['Acerola BUS']}}),
    event(192,18,1,'AttackAction',{attack:'Max Geist',
      decisionHandBefore:{ownHandPrintings:['Acerola BUS']}}),
    event(202,19,0,'PlayCardAction',{card:'Roxanne'}),
    event(218,20,1,'PlayCardAction',{card:'Psychic Energy',
      decisionHandBefore:{ownHandPrintings:['Psychic Energy MEE']}})
  ];
  const arm=(name,attachedToolPowerPolicy,decisionTrace)=>({
    name,attachedToolPowerPolicy,deckHashes:['a','b'],
    verifiedByDrawLog:true,firstTurnSlot:0,
    decisionTrace,prizeCounts:[6,0]
  });
  return {schema:'rank8-hood-tool-power-source-contrast-v1',
    seed:1260748957,firstRootDecisionDifference:4,
    sourceResearchRevision:'synthetic-test',
    arms:[arm('baseline',false,[]),arm('tool-power-v1',true,source)]};
}

test('time channel and actual hand-reset observations remain distinct',()=>{
  const x=inspectArchive(sourceFixture());
  assert.deepEqual(x.sameTurnBeforeSearch,{
    arvenPlayed:true,ordinaryPsychicAttachmentObserved:true
  });
  assert.equal(x.targetHandAndDisruption.lastObservedInOwnHand.ordinal,192);
  assert.equal(x.targetHandAndDisruption.opposingRoxanne.ordinal,202);
  assert.deepEqual(x.targetHandAndDisruption.firstOwnHandAfterRoxanne,{
    actionOrdinal:218,stillContainsTarget:false
  });
  assert.deepEqual(x.laterCandidateTargetPlays.toolPolicy,[]);
});

test('missing opponent disruption cannot become a claimed shuffle',()=>{
  const input=sourceFixture();
  input.arms[1].decisionTrace=input.arms[1].decisionTrace.filter(e=>
    e.actionOrdinal!==202);
  const x=inspectArchive(input);
  assert.equal(x.targetHandAndDisruption.opposingRoxanne,null);
  assert.equal(x.targetHandAndDisruption.firstOwnHandAfterRoxanne,null);
});

test('no earlier normal attachment does not imply an unobserved one',()=>{
  const input=sourceFixture();
  input.arms[1].decisionTrace=input.arms[1].decisionTrace.filter(e=>
    e.actionOrdinal!==171);
  const x=inspectArchive(input);
  assert.equal(x.sameTurnBeforeSearch.ordinaryPsychicAttachmentObserved,false);
});
