'use strict';

const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {runRank31RoxieSpoons}=
  require('./agent4-rank31-roxie-koffing-spoons-native.cjs');

/**
 * Authentic original rank31 printings Roxie CEC, Koffing CEC and
 * Radiant Alakazam SIT on a prepared live native Store board.
 * The common source-marked portfolio vetoes illegal two-source transfers
 * after Roxie and Blow-Away Bomb, before physical Prize inflation.
 * @returns {object} Reproduced both-seat native paper contract result.
 */
function run(){
  const cases=[];
  for(const seat of [0,1]){
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      runRank31RoxieSpoons(false,seat,false));
    assert.equal(audit.schema,VERSION);
    assert.deepEqual(result.afterBomb,[10,10,190]);
    assert.equal(result.allowed,true,
      'Native prompt validator considers split-source response legal');
    assert.match(result.rejected,
      /PAPER_PROMPT_INVALID:.*PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON/);
    assert.equal(result.promptPending,true);
    assert.equal(result.physicalKoffingDiscarded,true);
    assert.equal(result.roxieDiscarded,true);
    assert.equal(result.roxieDrawnThree,true);
    assert.equal(result.victimInDiscard,false,
      'Paper veto preserves victim at 190/210 damage');
    assert.equal(result.prizesTaken,0,
      'Unsettled printed-invalid ability cannot take two real Prizes');
    assert.equal(audit.markedPainfulSpoonsPrompts,1);
    assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
    assert.equal(audit.vetoedBeforeDispatch,1);
    assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
    assert.ok(audit.nativeAccepted>0,
      'Actual Roxie and Koffing native prompt resolutions must settle');
    cases.push({seat,playedOriginalPrintings:[
      'Roxie CEC 205','Koffing CEC 76','Radiant Alakazam SIT 59'],
      result,audit:{schema:audit.schema,
        markedPainfulSpoonsPrompts:audit.markedPainfulSpoonsPrompts,
        statusCounts:audit.statusCounts,
        nativeAccepted:audit.nativeAccepted,
        vetoedBeforeDispatch:audit.vetoedBeforeDispatch}});
  }
  const out={enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:31,stagedOriginalPrintingChain:true,
    nativeFullSourceGame:false,competitiveQualifiedGames:0,cases};
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={run};
