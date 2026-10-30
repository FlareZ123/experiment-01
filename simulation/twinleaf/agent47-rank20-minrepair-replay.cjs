'use strict';

const {withMinimumAttachEnergySelection}=require('./agent47-minimum-attach-energy-hook.cjs');
const {main}=require('./agent47-rank20-apex-natural-audit.cjs');

/**
 * Post-hoc, failure-inclusive replay of the frozen original 24 rank20 pairs.
 * Keep both original candidate/source decks, source seat, seed, and horizon.
 * The single added condition is a symmetric narrow bot prompt repair.
 * This is explicitly diagnostic, never a preregistered competitive sample.
 */
function replay(){
 const corrected=withMinimumAttachEnergySelection(()=>main());
 return {
  ...corrected.result,
  schema:'agent47-original-source20-mandatory-multiattach-forensic-replay-v1',
  originalCensusSchema:corrected.result.schema,
  remedy:corrected.audit,
  retrospective:true,
  qualification:'development-only',
  competitiveQualifiedGames:0,
  caveat:'Post-hoc correction to a weak two-seat prompt policy. Neither engine wins nor newly completed games are competitive-qualified. Native resolver can be sampled speculatively; correction counts are proposed, not accepted Store actions.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(replay(),null,2)+'\n');
module.exports={replay};
