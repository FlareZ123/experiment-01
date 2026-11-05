'use strict';
const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {runSeat:runOriginalSourceTreasureNative}=
  require('./agent49-mysterious-treasure-native-probe.cjs');

/**
 * Native physical FLI113 Mysterious Treasure on each original-owner seat:
 * mandatory exact one owner-hand card to discard, then separate actual
 * Psychic/Dragon Pokemon deck search, preserving Agent49's genuine probe.
 * No policy changes, hidden opponent/Prize access or competitive games.
 * @returns {object}
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const attempt=withPaperPromptContractPortfolio(()=>
      runOriginalSourceTreasureNative(seat));
    const row=attempt.result, audit=attempt.audit;
    assert.equal(row.seat,seat);
    assert.equal(row.printing,'Mysterious Treasure FLI');
    assert.equal(row.error,null);
    assert.equal(row.post.pendingPrompt.kind,'ChooseCardsPrompt');
    assert.equal(row.post.pendingPrompt.owner,true);
    assert.equal(row.nativeEffect.costDiscarded,true);
    assert.equal(row.nativeEffect.selectedTargetInHand,true);
    assert.equal(row.nativeEffect.itemDiscarded,true);
    assert.equal(row.nativeEffect.acceptedAndMoved,true);
    assert.equal(audit.inspectedTreasurePlayCardRoots,1);
    assert.equal(audit.vetoedTreasureInsufficientRoots,0);
    assert.equal(audit.inspectedTreasurePaymentPrompts,1);
    assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
    assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
    assert.equal(audit.competitiveQualifiedGames,0);
    rows.push({seat,
      originalHandPrintings:row.pre.ownHand,
      physicallyPaidPrinting:row.nativeEffect.costPrompt.physicallySelected,
      actualSearchTarget:row.target,
      returnedSearchTargetInHand:row.nativeEffect.selectedTargetInHand,
      paidCardPhysicallyInDiscard:row.nativeEffect.costDiscarded,
      itemPhysicallyInDiscard:row.nativeEffect.itemDiscarded,
      inspectedGenuinePaymentPrompts:audit.inspectedTreasurePaymentPrompts,
      paperPromptVerified:audit.statusCounts.PAPER_PROMPT_VERIFIED,
      gameQualified:false});
  }
  const out={schema:'agent46-treasure-flI-source-native-common-paper-v1',
    portfolioVersion:VERSION,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalFieldDecksWithTreasure:10,originalPrintedCopies:37,
    originalSourcePrinting:'Mysterious Treasure FLI 113',
    nativeRealStore:true,entirePaperGameQualified:false,
    competitiveQualifiedGames:0,rows};
  console.log('AGENT46_NATIVE_TREASURE_COMMON_PAPER '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
