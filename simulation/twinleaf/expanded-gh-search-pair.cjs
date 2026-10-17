'use strict';
const {runSourceProfilePair}=require('./expanded-source-profile-pair.cjs');
const {EXPANDED_SOURCE_PROFILE,EXPANDED_GH_SEARCH_PROFILE}=require('./policy-profiles.cjs');
function runGhSearchPair({maxActions=350}={}){
 const result=runSourceProfilePair({maxActions,profiles:[EXPANDED_SOURCE_PROFILE,EXPANDED_GH_SEARCH_PROFILE]});
 return {...result,study:'same-source GH search v2-v3 policy contrast',
  samples:result.samples.map(sample=>({...sample,
   arms:sample.arms.map(({profile,status,actions,turns,rank2EvolutionAttacks,
    rank2PlayedCards,rank2DecisionEvents,strictPromptValidation,firstTurnSlot})=>
    ({profile,status,actions,turns,rank2EvolutionAttacks,rank2PlayedCards,
      rank2DecisionEvents,strictPromptValidation,firstTurnSlot}))}))};
}
if(require.main===module)console.log(JSON.stringify(runGhSearchPair(),null,2));
module.exports={runGhSearchPair};
