'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='owner-public-discard-target-necessary-v2-rescue-absol-native-class';

// Each source ID and effect was checked against the bundled English print
// database. These are necessary target predicates, never permission to play.
const RULES=Object.freeze({
  'VS Seeker PHF':Object.freeze({sourceId:'xy4-109',target:'supporter',maxTargets:1}),
  'Rescue Carrier EVS':Object.freeze({sourceId:'swsh7-154',target:'pokemon-hp-90',maxTargets:2}),
  'Super Rod PAL':Object.freeze({sourceId:'sv2-188',target:'pokemon-or-basic-energy',maxTargets:3}),
  'Night Stretcher ASC':Object.freeze({sourceId:'me2pt5-196',target:'pokemon-or-basic-energy',maxTargets:1}),
  'Special Charge STS':Object.freeze({sourceId:'xy11-105',target:'special-energy',maxTargets:2}),
  // Both Rescue Stretcher modes need a discarded Pokémon; a single target
  // defeats only this negative proof, not all mode/payment prerequisites.
  'Rescue Stretcher GRI':Object.freeze({sourceId:'sm2-130',target:'pokemon',maxTargets:3,
    modes:Object.freeze(['one-pokemon-to-hand','three-pokemon-to-deck'])})
});

/**
 * Return null if an unknown or incomplete printing cannot be safely ruled out.
 * Metadata uses the public bundled database's supertype, subtypes and hp.
 * @param {object|undefined} card Public card-print metadata.
 * @param {string} target Exact printed effect's target family.
 * @returns {boolean|null} Eligible, ineligible, or unresolved.
 */
function targetMatch(card,target){
  if(Array.isArray(card?.variants)){
    if(card.variants.length===0)return null;
    const claims=card.variants.map(variant=>targetMatch(variant,target));
    return claims.every(value=>value===true)?true:
      claims.every(value=>value===false)?false:null;
  }
  if(!card||!Array.isArray(card.subtypes)||
    !['Pokémon','Trainer','Energy'].includes(card.supertype))return null;
  if(card.subtypes.length===0&&card.supertype!=='Pokémon')return null;
  const pokemon=card.supertype==='Pokémon';
  const trainer=card.supertype==='Trainer';
  const energy=card.supertype==='Energy';
  const basicEnergy=energy&&card.subtypes.includes('Basic');
  if(target==='supporter')return trainer&&card.subtypes.includes('Supporter');
  if(target==='pokemon')return pokemon;
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
 * Build a conservative name + set-code index from published English metadata.
 * Different collector-number cards often share the native fullName. Keep all
 * differing variants so a >90 HP and <=90 HP collision remains UNKNOWN.
 * @param {object[]} sets Public bundled sets/en.json records.
 * @param {{setId:string,cards:object[]}[]} cardSets Public cards/en/*.json.
 */
function buildPublicPrintMetadata(sets,cardSets){
  assert.ok(Array.isArray(sets)&&Array.isArray(cardSets));
  const codes=new Map(sets.map(s=>[s.id,s.ptcgoCode]));
  const metadata=new Map();
  for(const {setId,cards} of cardSets){
    const code=codes.get(setId);
    if(typeof code!=='string'||code.length===0)continue;
    assert.ok(Array.isArray(cards));
    for(const card of cards){
      assert.ok(typeof card.name==='string'&&card.name.length>0);
      const printing=card.name+' '+code;
      const variant={supertype:card.supertype,
        subtypes:card.subtypes??[],hp:card.hp??null};
      const entry=metadata.get(printing)??{variants:[]};
      if(!entry.variants.some(v=>JSON.stringify(v)===JSON.stringify(variant)))
        entry.variants.push(variant);
      metadata.set(printing,entry);
    }
  }
  return metadata;
}

/** @param {string} resourceRoot Repository's resources/ directory. */
function loadBundledPublicPrintMetadata(resourceRoot){
  assert.equal(typeof resourceRoot,'string');
  const sets=JSON.parse(fs.readFileSync(path.join(resourceRoot,'sets','en.json'),'utf8'));
  const dir=path.join(resourceRoot,'cards','en');
  const cardSets=fs.readdirSync(dir).filter(f=>f.endsWith('.json'))
    .sort().map(file=>({setId:file.slice(0,-5),
      cards:JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'))}));
  return buildPublicPrintMetadata(sets,cardSets);
}


/**
 * Recognize historical set-code aliases present in the original Aichi printed
 * manifest, without claiming print identity for unresolved modern promos.
 * Public English database has PR-BLW/PR-XY/PR-SM; source/native manifests
 * spell the corresponding promo families BWP/XYP/SMP. The original source
 * also uses ♢ instead of the database's ◇ for Prism Star Pokémon.
 * @param {Map<string,object>} index Original public name + set metadata.
 */
function withSourcePromoAliases(index){
  assert.ok(index instanceof Map);
  const codes=Object.freeze({
    'PR-BLW':'BWP','PR-XY':'XYP','PR-SM':'SMP'
  });
  const result=new Map(index);
  for(const [printing,entry] of index){
    const split=printing.lastIndexOf(' ');
    if(split<0)continue;
    const alias=codes[printing.slice(split+1)];
    if(!alias)continue;
    const key=printing.slice(0,split+1)+alias;
    const prior=result.get(key);
    assert.ok(!prior||JSON.stringify(prior)===JSON.stringify(entry),
      'A promo alias collides with different public card metadata');
    result.set(key,entry);
  }
  // The original Limitless display prints the Prism Star marker as ♢,
  // while the bundled English card source prints ◇. Preserve both labels
  // for genuine public print identity; the rest of each name stays exact.
  for(const [printing,entry] of [...result]){
    if(!printing.includes('◇'))continue;
    const key=printing.replaceAll('◇','♢');
    const prior=result.get(key);
    assert.ok(!prior||JSON.stringify(prior)===JSON.stringify(entry),
      'Prism Star display alias collides with different public metadata');
    result.set(key,entry);
  }
  // Pinned native CardManager omits the apostrophe in Professor's Letter.
  // Preserve this exact English source Item identity for both printed sets.
  for(const set of ['XY','BKT']){
    const correct=result.get("Professor's Letter "+set);
    if(!correct)continue;
    const alias='Professors Letter '+set;
    const prior=result.get(alias);
    assert.ok(!prior||JSON.stringify(prior)===JSON.stringify(correct),
      'Native Letter display alias collides with different metadata');
    result.set(alias,correct);
  }
  // Source archive prints these exact collector numbers with shorter names.
  // English database retains the Team Flare Gear suffix and spelled-out
  // Lightning/Psychic/Metal names. Verified ids: xy4-92/102/106, sm5-138.
  for(const [alias,canonical] of [
    ['Battle Compressor PHF','Battle Compressor Team Flare Gear PHF'],
    ['Robo Substitute PHF','Robo Substitute Team Flare Gear PHF'],
    ['Target Whistle PHF','Target Whistle Team Flare Gear PHF'],
    ['Unit Energy LPM UPR','Unit Energy LightningPsychicMetal UPR']
  ]){
    const source=result.get(canonical);
    assert.ok(source,'Missing bundled source for verified public display alias');
    const prior=result.get(alias);
    assert.ok(!prior||JSON.stringify(prior)===JSON.stringify(source),
      'Public shortened-name alias collides with other metadata');
    result.set(alias,source);
  }
  // In the pinned native CardManager, the authentic source-rank9
  // English MEG/86 Mega Absol ex is surfaced on the public discard as
  // "Mega Absol ex M1L". The exact-native public receipt independently
  // identifies the source card as MEG/86. Use its sourced Pokémon class for
  // this target-family screen; this does NOT certify a physical JP M1L print.
  const sourceAbsol=result.get('Mega Absol ex MEG');
  assert.ok(sourceAbsol?.variants?.length>0 &&
    sourceAbsol.variants.every(card=>
      card.supertype==='Pokémon'&&card.subtypes.includes('Basic')),
  'Verified MEG/86 native name-alias type must remain Basic Pokémon');
  const nativeAbsol='Mega Absol ex M1L';
  const priorAbsol=result.get(nativeAbsol);
  assert.ok(!priorAbsol||
    JSON.stringify(priorAbsol)===JSON.stringify(sourceAbsol),
  'Native M1L alias must not override divergent public metadata');
  result.set(nativeAbsol,sourceAbsol);
  return result;
}
const withSourceDisplayAliases=withSourcePromoAliases;

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


/**
 * Add independently known public discard-target negatives to an existing
 * paper-necessity frontier. Caller retains its original generic/temporal/
 * payment/Prize/target statuses. No action is selected or dispatched.
 * @param {object} view Detached owner-root observation.
 * @param {{rows:object[],negativeProofFamilies?:string[]}} base Existing owner necessity census.
 * @param {Map<string,object>} publicPrints Ambiguity-preserving card metadata.
 */
function augmentPaperNecessityWithDiscardTargets(view,base,publicPrints){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(base?.rows));
  const seen=new Set();
  let additionallyBlocked=0,registeredHeld=0;
  const rows=base.rows.map(row=>{
    assert.ok(!seen.has(row.handIndex),'Duplicate physical owner-hand index');
    seen.add(row.handIndex);
    assert.ok(Array.isArray(row.necessaryBlockers));
    const target=publicDiscardTargetNecessary(view,row,publicPrints);
    if(target.ruleKnown)registeredHeld++;
    const blockers=[...row.necessaryBlockers];
    if(target.blocker)blockers.push('printed-discard-target:'+target.blocker);
    const newlyBlocked=row.paperPlayable!==false&&target.blocker!==null;
    if(newlyBlocked)additionallyBlocked++;
    return {...row,publicDiscardTargetNecessity:target,
      necessaryBlockers:blockers,
      paperPlayable:blockers.length>0?false:null};
  });
  return {
    ...base,version:String(base.version)+'+public-discard-target-v2-rescue-absol-native-class',
    rows,registeredHeldDiscardRecoveryCopies:registeredHeld,
    newlyProvenPublicDiscardTargetFailures:additionallyBlocked,
    provenNecessaryConditionFailures:rows.filter(r=>r.paperPlayable===false).length,
    remainingUnresolvedCopies:rows.filter(r=>r.paperPlayable!==false).length,
    negativeProofFamilies:[...new Set([
      ...(base.negativeProofFamilies??[]),'printed-discard-target'
    ])],
    allRemainingArePaperLegal:false,
    nativeOrPaperLegalTrainerMoveSetCertified:false,
    selectedOrDispatchedAction:false
  };
}

module.exports={VERSION,RULES,targetMatch,buildPublicPrintMetadata,
  withSourcePromoAliases,withSourceDisplayAliases,
  loadBundledPublicPrintMetadata,publicDiscardTargetNecessary,
  augmentPaperNecessityWithDiscardTargets};
