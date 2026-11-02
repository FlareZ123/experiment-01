'use strict';

const {chooseOwnerSkylinerRondoRetreat,VERSION:BASE_VERSION}=
  require('./agent6-owner-public-skyliner-rondo-frontier.cjs');

const VERSION='agent6-skyliner-public-ability-suppression-v1';

/**
 * Conservatively detect only known public printed shutdowns of Latias ex
 * SSP's Skyliner Ability. This examines face-up public zones alone.
 * Printed Ability names remain present on owner observations even while
 * another public card suppresses them. An unknown or exempting effect
 * remains outside this deliberately narrow policy certificate.
 *
 * @param {object} view Frozen, detached authenticated actor observation.
 * @returns {string|null} Reason for refusing a Skyliner-dependent retreat.
 */
function publicSkylinerSuppressionReason(view){
  const own=view.ownPublic,foe=view.opponentPublic;
  const stadium=[...(own?.stadium??[]),...(foe?.stadium??[])];
  if(stadium.some(p=>p.startsWith('Path to the Peak ')))
    return 'path-to-peak-rule-box-ability-lock';

  const enemyActive=foe?.active;
  if(enemyActive?.printing==='Iron Thorns ex TWM'&&
     enemyActive.abilities?.includes('Initialization'))
    return 'opponent-active-iron-thorns-initialization';

  if(enemyActive?.abilities?.includes('Neutralizing Gas'))
    return 'opponent-active-neutralizing-gas';

  const allFaceUp=[
    own?.active,...(own?.bench??[]),
    enemyActive,...(foe?.bench??[])
  ];
  if(allFaceUp.some(p=>p?.abilities?.includes('Garbotoxin')&&
     Array.isArray(p.tools)&&p.tools.length>0))
    return 'tool-equipped-garbotoxin';
  return null;
}

/**
 * Default-off protected policy variant. The original v2 selector and all
 * preregistered v2 native experimental registrations remain unchanged.
 *
 * @param {object} view Frozen actor-only owner view.
 * @param {object} catalog Public printed metadata.
 * @returns {object|null} Conservative native-neutral action intent.
 */
function choosePublicLockGuardedSkylinerRondoRetreat(view,catalog){
  if(publicSkylinerSuppressionReason(view)!==null)return null;
  return chooseOwnerSkylinerRondoRetreat(view,catalog);
}

module.exports={VERSION,BASE_VERSION,publicSkylinerSuppressionReason,
  choosePublicLockGuardedSkylinerRondoRetreat};
