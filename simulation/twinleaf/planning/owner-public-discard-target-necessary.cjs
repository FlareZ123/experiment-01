'use strict';

const assert=require('node:assert/strict');

const VERSION='owner-public-discard-target-necessary-v1';

// Each source ID and effect was checked against the bundled English print
// database. These are necessary target predicates, never permission to play.
const RULES=Object.freeze({
  'VS Seeker PHF':Object.freeze({sourceId:'xy4-109',target:'supporter',maxTargets:1}),
  'Rescue Carrier EVS':Object.freeze({sourceId:'swsh7-154',target:'pokemon-hp-90',maxTargets:2}),
  'Super Rod PAL':Object.freeze({sourceId:'sv2-188',target:'pokemon-or-basic-energy',maxTargets:3}),
  'Night Stretcher ASC':Object.freeze({sourceId:'me2pt5-196',target:'pokemon-or-basic-energy',maxTargets:1}),
  'Special Charge STS':Object.freeze({sourceId:'xy11-105',target:'special-energy',maxTargets:2})
});

/**
 * Return null if an unknown or incomplete printing cannot be safely ruled out.
 * Metadata uses the public bundled database's supertype, subtypes and hp.
 * @param {object|undefined} card Public card-print metadata.
 * @param {string} target Exact printed effect's target family.
 * @returns {boolean|null} Eligible, ineligible, or unresolved.
 */
function targetMatch(card,target){
  if(!card||!Array.isArray(card.subtypes)||
    !['Pokémon','Trainer','Energy'].includes(card.supertype))return null;
  const pokemon=card.supertype==='Pokémon';
  const trainer=card.supertype==='Trainer';
  const energy=card.supertype==='Energy';
  const basicEnergy=energy&&card.subtypes.includes('Basic');
  if(target==='supporter')return trainer&&card.subtypes.includes('Supporter');
  if(target==='pokemon-or-basic-energy')return pokemon||basicEnergy;
  if(target==='special-energy')return energy&&card.subtypes.includes('Special');
  if(target==='pokemon-hp-90'){
    if(!pokemon)return false;
    const hp=Number(card.hp);
    if(!Number.isSafeInteger(hp)||hp<=0)return null;
    return hp<=90;
  }
  assert.fail('Unregistered public-discard target family');
}

/**
 * A read-only, paper-negative certificate for common discard-recovery Items.
 * Every unknown discarded printing prevents a false no-target certificate.
 * The entire decision uses only the actor's held printing and public discard.
 *
 * @param {object} view Detached owner-root actor observation.
 * @param {{handIndex:number,printing:string}} trainer Held physical Trainer copy.
 * @param {Map<string,object>} publicPrints Public metadata, keyed by native fullName.
 */
function publicDiscardTargetNecessary(view,trainer,publicPrints){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Array.isArray(view.ownPublic?.discard));
  assert.ok(publicPrints instanceof Map);
  assert.ok(Number.isSafeInteger(trainer?.handIndex)&&
    trainer.handIndex>=0&&trainer.handIndex<view.ownHand.length);
  assert.equal(view.ownHand[trainer.handIndex],trainer.printing);
  const rule=Object.hasOwn(RULES,trainer.printing)?RULES[trainer.printing]:null;
  if(!rule)return {
    version:VERSION,printing:trainer.printing,handIndex:trainer.handIndex,
    ruleKnown:false,blocker:null,paperPlayable:null,
    status:'unmodeled-printing'
  };
  const eligible=[],unknown=[];
  for(const [index,printing] of view.ownPublic.discard.entries()){
    const found=targetMatch(publicPrints.get(printing),rule.target);
    if(found===true)eligible.push(index);
    if(found===null)unknown.push(index);
  }
  const blocked=eligible.length===0&&unknown.length===0;
  return {
    version:VERSION,printing:trainer.printing,handIndex:trainer.handIndex,
    ruleKnown:true,sourceId:rule.sourceId,targetFamily:rule.target,
    printedMaximumTargets:rule.maxTargets,
    publicDiscardCount:view.ownPublic.discard.length,
    eligibleTargetIndices:eligible,unknownMetadataIndices:unknown,
    blocker:blocked?'proven-no-public-discard-target':null,
    status:blocked?'proven-ineligible':eligible.length>0?
      'public-target-exists-other-conditions-unknown':
      'target-identity-unresolved',
    paperPlayable:blocked?false:null,
    targetSelectionCertified:false,paymentCertified:false,
    nativeAcceptanceCertified:false,strategicBenefitCertified:false,
    opponentConcealedInformationUsed:false
  };
}

module.exports={VERSION,RULES,targetMatch,publicDiscardTargetNecessary};
