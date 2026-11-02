'use strict';

const {publicSkylinerSuppressionReason}=
  require('./agent6-skyliner-ability-suppression-guard.cjs');
const {chooseOwnerSkylinerRondoRetreat}=
  require('./agent6-owner-public-skyliner-rondo-frontier.cjs');

const VERSION='agent6-public-latias-hood-versus-active-thorns-v1';

/**
 * Very narrow paper-grounded public exception to the earlier conservative
 * Iron Thorns veto. Source is uncharged Active Latias ex SSP with its own
 * attached Stealthy Hood UNB. Stealthy Hood protects against the opponent's
 * Initialization Ability while Tool Jammer on that opposing Active disables
 * the Hood. Other possible locks retain the earlier veto. This is not a
 * native action-legality certificate.
 *
 * @param {object} view Detached owner-visible observation
 * @returns {string|null} Reason, or null if the scoped Iron Thorns lock fails
 */
function publicHoodAwareSkylinerSuppressionReason(view){
  const reason=publicSkylinerSuppressionReason(view);
  if(reason!=='opponent-active-iron-thorns-initialization')return reason;
  const own=view.ownPublic,foe=view.opponentPublic;
  const active=own?.active,enemyActive=foe?.active;
  if(active?.printing!=='Latias ex SSP'||
     !Array.isArray(active.tools)||active.tools.length!==1||
     active.tools[0]!=='Stealthy Hood UNB')return reason;
  if(enemyActive?.tools?.some(p=>p.startsWith('Tool Jammer ')))
    return 'opponent-active-tool-jammer-disables-stealthy-hood';
  const stadium=[...(own.stadium??[]),...(foe.stadium??[])];
  if(stadium.some(p=>p.startsWith('Jamming Tower ')))
    return 'jamming-tower-disables-stealthy-hood';
  // The first opt-in exception only admits opponents whose other face-up
  // Benched Abilities are absent or require the Active Spot themselves.
  if(foe.bench?.some(slot=>slot?.abilities?.some(name=>
    name!=='Initialization')))
    return 'other-opponent-bench-ability-not-certified';
  const visibleWithoutThorns={
    ownPublic:own,
    opponentPublic:{...foe,active:{
      ...enemyActive,
      abilities:(enemyActive.abilities??[])
        .filter(name=>name!=='Initialization')
    }}
  };
  return publicSkylinerSuppressionReason(visibleWithoutThorns);
}

/**
 * Default-off policy; paper effect still requires real Store adjudication.
 * @param {object} view Original frozen actor observation
 * @param {object} catalog Public native card-printing catalog
 * @returns {object|null} Existing nominal Rondo action
 */
function choosePublicHoodAwareSkylinerRondoRetreat(view,catalog){
  if(publicHoodAwareSkylinerSuppressionReason(view)!==null)return null;
  return chooseOwnerSkylinerRondoRetreat(view,catalog);
}

module.exports={VERSION,publicHoodAwareSkylinerSuppressionReason,
  choosePublicHoodAwareSkylinerRondoRetreat};
