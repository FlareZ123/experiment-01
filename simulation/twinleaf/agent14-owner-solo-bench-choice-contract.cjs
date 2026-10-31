'use strict';

const VERSION='agent14-owner-solo-bench-choice-contract-v1';

/**
 * Build a two-option, same-observation contract before selecting a root.
 * This deliberately addresses only one concrete Bench-vs-attack contention:
 * a lone Iron Thorns ex with a payable (or already held funded) Volt Cyclone.
 * It does not certify that either option is strongest or natively playable.
 *
 * The two independent root probes receive the exact same detached owner view.
 * They differ solely in whether the development-only solo-energy hold is
 * enabled. A common arbiter can later score this structured option set.
 *
 * @param {object} view Detached acting-player observation.
 * @param {object} catalog Public static card catalog.
 * @param {function(object,object,object):object} proposeRoot Root selector.
 * @param {object} [options] Other enabled actor-only selectors.
 * @returns {object|null} Null when there is no actual two-option conflict.
 */
function collectSoloBenchChoice(view,catalog,proposeRoot,options={}){
  if(options.thornsSoloEnergyRetention!==true)return null;
  const {holdSoloThornsBench}=require('./agent14-thorns-solo-energy-retention.cjs');
  if(!holdSoloThornsBench(view,catalog))return null;
  const baseline=proposeRoot(view,catalog,{
    ...options,thornsSoloEnergyRetention:false
  });
  const proposed=proposeRoot(view,catalog,{
    ...options,thornsSoloEnergyRetention:true
  });
  if(baseline?.kind!=='bench-basic'||
     !['attack','play-thunder-mountain','attach-dce'].includes(proposed?.kind))
    return null;
  const active=view.ownPublic.active;
  const immediatelyPayable=active.energies.length===1;
  const proposalCost={
    ...(!immediatelyPayable?{
      requiredNextLine:'attach DCE and play Thunder Mountain before Volt Cyclone',
      intermediateActionMayBeRejected:true
    }:{
      requiredNextLine:'Volt Cyclone already printed payable on public board'
    }),
    ownerHandCardsConsumed:proposed.kind==='play-thunder-mountain'?1:
      proposed.kind==='attach-dce'?1:0,
    resourceTradeoff:'No Bench recipient keeps moved Energy on Active if Volt Cyclone resolves; only-Active knockout vulnerability remains',
    survivingOnlyActiveKnockoutRisk:'unquantified'
  };
  const optionsReceipt=[
    {selector:'baseline-first-return-bench',
      intent:{...baseline},
      consumes:{handPokemon:1,benchSlots:1},
      tradeoff:'Backup survives a sole Active knockout but becomes an Energy movement recipient',
      nativePlayability:'unverified',nativeEffectSettlement:'unverified'},
    {selector:'agent14-solo-energy-hold',
      intent:{...proposed},
      consumes:proposalCost,
      tradeoff:'Solo Energy retention versus absence of a backup',
      nativePlayability:'unverified',nativeEffectSettlement:'unverified'}
  ];
  return {
    version:VERSION,status:'TWO-SUPPORTED-PROPOSALS',
    observation:'same detached owner-root view, no concealed opponent zones',
    alternatives:optionsReceipt,
    rejectedIndex:0,chosenIndex:1,chosen:{...proposed},
    choiceRule:'development-only preserve solo Energy; no proved game-value dominance',
    reason:immediatelyPayable?'already-payable-solo-attack':
      'complete-visible-hand-thunder-dce-line',
    competitiveQualified:false
  };
}

module.exports={VERSION,collectSoloBenchChoice};
