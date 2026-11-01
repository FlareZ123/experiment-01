'use strict';

const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {probeTwoSourcePainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');

/**
 * Original rank31 Radiant Alakazam SIT genuine native Ability and prompts
 * under common source-marked paper portfolio. Both physical player seats
 * use the same frozen staged 60-card-excluded fixture as Agent4's existing
 * mechanical counterexample, preserving the genuine original Store effect.
 *
 * @returns {object} Both-seat accepted and rejected prompt evidence.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    for(const sameSource of [false,true]){
      const {result,audit}=withPaperPromptContractPortfolio(()=>
        probeTwoSourcePainfulSpoons({seat,sameSource}));
      assert.equal(audit.schema,VERSION);
      assert.equal(audit.markedPainfulSpoonsPrompts,1,
        'Actual original SIT Ability must stamp its own MoveDamage prompt');
      assert.equal(result.nativeValidatorAccepted,true,
        'Pinned native validator accepts both transfer geometry variants');
      if(sameSource){
        assert.equal(result.nativeStoreError,null);
        assert.equal(result.nativePromptSettled,true);
        assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
        assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,2);
        assert.deepEqual(result.after,{active:0,bench0:10,bench1:20});
      }else{
        assert.match(result.nativeStoreError,
          /PAPER_PROMPT_INVALID:.*PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON/);
        assert.equal(result.nativePromptSettled,false);
        assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
        assert.equal(audit.vetoedBeforeDispatch,1);
        assert.deepEqual(result.after,result.before,
          'Paper-rejected two-source transfer must preserve physical damage');
      }
      assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,0,
        'A covered negative never validates every possible printed clause');
      assert.equal(audit.nativeAccepted>=1,true,
        'Animation WaitPrompt must settle by genuine native Store');
      rows.push({seat,sameSource,originalResult:result,
        audit:{schema:audit.schema,markedPainfulSpoonsPrompts:
          audit.markedPainfulSpoonsPrompts,
          statusCounts:audit.statusCounts,
          vetoedBeforeDispatch:audit.vetoedBeforeDispatch,
          nativeAccepted:audit.nativeAccepted}});
    }
  }
  const summary={
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Authentic rank31 Radiant Alakazam SIT 59',
    scope:'Actual pinned Store ability/prompts; staged board, no source-dealt game',
    originalOpponentFullSixtyUsed:false,
    competitiveQualifiedGames:0,
    rows
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={run};
