'use strict';

/**
 * Read-only checkpoint for the pinned Twinleaf card registry. Presence of
 * a card name/attack description does not validate reducer execution.
 *
 * @param {{getCardByName:(name:string)=>object|undefined,
 * getAllCards:()=>object[]}} manager
 * @returns {object}
 */
function inspectPrintings(manager){
  const requested=[
    'Whismur CES',
    'Latias ex SSP',
    'Gengar & Mimikyu GX TEU',
    'Battle VIP Pass FST',
    'Telepathic Psychic Energy POR'
  ];
  const exact=requested.map(printing=>{
    const card=manager.getCardByName(printing);
    return {printing,found:Boolean(card),
      actualFullName:card?.fullName??null,
      className:card?.constructor?.name??null,
      attacks:Array.isArray(card?.attacks)?card.attacks.map(a=>a.name):[],
      abilityNames:Array.isArray(card?.abilities)?
        card.abilities.map(a=>a.name):[]};
  });
  const candidateWhismurPrints=manager.getAllCards()
    .filter(card=>/\bWhismur\b/.test(String(card.fullName??'')))
    .map(card=>String(card.fullName)).sort();
  return {
    schema:'agent29-whismur-native-registry-coverage-v1',
    pinnedVendorRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actualOriginalStoreGameAttempted:false,
    canCertifyPaperAttackExecution:false,
    exact,candidateWhismurPrints,
    competitiveQualifiedGames:0
  };
}

/** @returns {object} Actual compiled pinned registry, read-only. */
function run(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  return inspectPrintings(initializeCards());
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={inspectPrintings,run};
