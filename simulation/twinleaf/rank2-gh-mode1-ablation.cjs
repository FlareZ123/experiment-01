'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {withExpandedActionOptions,runWithResearchProfile,EXPANDED_PROFILE}=
  require('./policy-profiles.cjs');
const {firstRecordedDecisionDifference}=require('./expanded-source-profile-pair.cjs');
const {SEED,TARGETS,withSourceForkObserver}=
  require('./rank2-turn5-source-fork-observer.cjs');

const ARMS=Object.freeze([
  {name:'original-expanded-v1',legacy:true},
  {name:'source-K0-only',sourceK0:true,stageTarget:false,mode1:false},
  {name:'source-K0-plus-stage-target',sourceK0:true,stageTarget:true,mode1:false},
  {name:'source-K0-plus-stage-target-plus-GH-mode1',sourceK0:true,stageTarget:true,mode1:true}
]);

/**
 * Run one fixed original-source rank-2 seat-B decision for component
 * attribution. Every arm uses the identical source deck IDs, engine,
 * actual setup seed and independent bot randomness policy.
 *
 * @param {{maxActions?:number}} [request]
 * @returns {object}
 */
function runRank2Mode1Ablation({maxActions=70}={}) {
  if(!Number.isInteger(maxActions)||maxActions<70||
      maxActions>180)throw new Error('Requires 70..180 bounded root actions');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const rank1=ranks.get(1),rank2=ranks.get(2);
  if(!rank1?.playableUnderEngine||!rank2?.playableUnderEngine){
    throw new Error('Exact rank1/2 source lists must be engine-resolvable');
  }
  const sourceRequest={
    deckA:rank1.cardIds,deckB:rank2.cardIds,
    seed:SEED,maxActions,
    strictPromptValidation:true,
    captureDecisionTrace:true,
    isolatePolicyRandomness:true
  };
  const results=ARMS.map(flags=>withSourceForkObserver(capture=>{
    const game=flags.legacy ?
      runWithResearchProfile(sourceRequest,EXPANDED_PROFILE) :
      withExpandedActionOptions(()=>runMatch({
        ...sourceRequest,
        doubleDragonRecovery:true,
        supporterDecisionCorrection:true,
        bunnelbyK0SafeEvolution:true,
        bunnelbyTargetAwareEvolution:flags.stageTarget,
        bunnelbyGuzmaHalaMode1:flags.mode1
      }),{sourceK0Bunnelby:true});
    const fork=game.decisionTrace.find(e=>
      e.turnBefore===5&&e.playerSlot===1&&
      e.action==='PlayCardAction'&&TARGETS.has(e.card));
    return {
      flags,seed:SEED,rank2Seat:1,sourceDeckHashes:game.deckHashes,
      firstTurnSlot:game.firstTurnSlot,
      verifiedByDrawLog:game.verifiedByDrawLog,
      actions:game.actions,policy:game.policy,
      fork:fork?{
        actionOrdinal:fork.actionOrdinal,
        turn:fork.turnBefore,seat:fork.playerSlot,card:fork.card
      }:null,
      capturedSourceContext:capture[0]??null,
      captureCount:capture.length,
      projectedRootDecisions:game.decisionTrace.filter(e=>
        fork&&e.actionOrdinal<=fork.actionOrdinal)
        .map(e=>({
          actionOrdinal:e.actionOrdinal,turnBefore:e.turnBefore,
          playerSlot:e.playerSlot,action:e.action,card:e.card??null,
          attack:e.attack??null,
          optionSelection:e.optionSelection,
          cardSelection:e.cardSelection
        }))
    };
  }));
  const reference=results[0];
  const sameSourceHashes=results.every(r=>JSON.stringify(r.sourceDeckHashes)===
    JSON.stringify(reference.sourceDeckHashes));
  const sameFirstTurn=results.every(r=>r.firstTurnSlot===reference.firstTurnSlot);
  const sameVisibleContext=results.every(r=>r.capturedSourceContext &&
    JSON.stringify(r.capturedSourceContext.before)===
      JSON.stringify(reference.capturedSourceContext?.before));
  return {
    study:'rank2 source first real Supporter fork, compositional K0/stage/GH mode1 ablation',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed:SEED,sameSourceHashes,sameFirstTurn,sameVisibleContext,
    results:results.map(({projectedRootDecisions,...r})=>({
      ...r,
      firstRecordedDifferenceFromV1:firstRecordedDecisionDifference(
        reference.projectedRootDecisions,projectedRootDecisions),
      meaningfulPrefixLength:projectedRootDecisions.length
    })),
    caveat:'Ablation attribution for one reproduced root source deal only; may change hypothetical evaluator behavior. Neither a legal optimality test nor paper win-rate evidence.'
  };
}

if(require.main===module)console.log(JSON.stringify(runRank2Mode1Ablation(),null,2));
module.exports={ARMS,runRank2Mode1Ablation};
