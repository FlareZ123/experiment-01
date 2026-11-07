'use strict';

const assert=require('node:assert/strict');
const {assessDirectEnergy}=
  require('../twinleaf/agent30-source-attack-energy-reachability.cjs');

const VERSION='agent3-native-pre-attack-public-board-join-v2';
const CARD_TYPE_ENUM=Object.freeze({
  Grass:1,Fire:2,Water:3,Lightning:4,Psychic:5,Fighting:6,
  Darkness:7,Metal:8,Colorless:9,Fairy:10,Dragon:11
});

/**
 * Join an accepted, settled physical-Prize attack to its native public
 * board *before* the actual Store attack root. Card faces are public only.
 * This uses original trial results and never reads an opponent's hidden zones.
 *
 * @param {object[]} attempts Original registered native-development attempts.
 * @param {object[]} prizeAttacks Accepted source attack -> physical Prize joins.
 * @param {object[]} victims Corresponding actual native public KO victims.
 * @param {object[]} printedRows Unique original-roster printed attacker screens.
 * @param {object} originalField Original Aichi rank-indexed 60-card lists.
 * @returns {{version:string,rows:object[],paperGameCertified:false,qualifiedCompetitiveGames:0}}
 */
function joinNativePreAttackBoard(
  attempts,prizeAttacks,victims,printedRows,originalField
){
  for(const x of [attempts,prizeAttacks,victims,printedRows])
    assert.ok(Array.isArray(x));
  assert.ok(prizeAttacks.length>0);
  assert.equal(victims.length,prizeAttacks.length);
  assert.equal(printedRows.length,prizeAttacks.length);
  assert.ok(Array.isArray(originalField?.decks));
  const byTrial=new Map();
  for(const attempt of attempts){
    assert.equal(typeof attempt?.trial?.id,'string');
    assert.equal(byTrial.has(attempt.trial.id),false);
    byTrial.set(attempt.trial.id,attempt);
  }
  const used=new Set();
  const rows=prizeAttacks.map((root,index)=>{
    const victim=victims[index],nominal=printedRows[index];
    assert.equal(victim.registeredTrialId,root.registeredTrialId);
    assert.equal(victim.actualPrizeExitRootOrdinal,root.actualPrizeExitRootOrdinal);
    assert.equal(victim.attackName,root.attackName);
    assert.equal(nominal.trialId,root.registeredTrialId);
    assert.equal(nominal.attackName,root.attackName);
    const attempt=byTrial.get(root.registeredTrialId);
    assert.ok(attempt,'Native trial must be registered');
    const isSource=root.attackRole==='original-source';
    assert.ok(isSource||root.attackRole==='fixed-contender');
    const attackSeat=isSource?attempt.sourceSeat:attempt.candidateSeat;
    assert.ok(attackSeat===0||attackSeat===1);
    assert.equal(attackSeat,root.attackSeat);
    const settlement=isSource?
      attempt.sourceAttackSettlement:attempt.candidateAttackSettlement;
    assert.ok(Array.isArray(settlement?.attacks),
      'Missing actual Store postgame attack settlement');
    const matches=settlement.attacks.filter(attack=>
      attack.actionOrdinal===root.attackDeclarationRootOrdinal &&
      attack.attackName===root.attackName &&
      attack.turnBefore===root.sameTurn &&
      attack.completionRootOrdinal===root.attackCompletionRootOrdinal);
    assert.equal(matches.length,1,'Attack requires unique physical declaration');
    const attack=matches[0];
    assert.equal(attack.settledPromptChain,true);
    assert.equal(attack.settlementCrossesClockReset,false);
    const key=root.registeredTrialId+':'+attackSeat+':'+attack.actionOrdinal;
    assert.equal(used.has(key),false,'Duplicate native attack root');
    used.add(key);
    const before=attack.publicBoardBefore;
    assert.ok(Array.isArray(before)&&before.length===2);
    const actor=before[attackSeat]?.active;
    const defender=before[1-attackSeat]?.active;
    assert.ok(actor&&defender,'Exact native pre-attack Active slots needed');
    assert.ok(Array.isArray(actor.energyCards));
    assert.ok(Array.isArray(actor.toolCards));
    assert.ok(Array.isArray(actor.printedAttacks));
    const attackIsPrintedOnActualActive=actor.printedAttacks.some(p=>
      p.name===root.attackName);
    assert.equal(defender.name,victim.victimPrinting.name);
    assert.equal(defender.printing,victim.victimPrinting.fullName,
      'Actual native pre-attack target must be the knocked out printed Active');
    assert.equal(victim.victimLocation,'active');
    const rank=nominal.originalRank;
    assert.equal(rank,Number(root.registeredTrialId.split(':')[0]));
    const deck=originalField.decks.find(d=>d.rank===rank);
    assert.ok(deck&&Array.isArray(deck.cards));
    const copies=deck.cards.filter(c=>
      c.category==='Pokémon'&&c.name===nominal.rosterAttackerName &&
      nominal.rosterAttackerPrintedId.endsWith('-'+c.printing.number));
    assert.equal(copies.length,1,'Printed attacker requires unique original 60 identity');
    const expectedFullName=copies[0].name+' '+copies[0].printing.set;
    const originalRegisteredActive=deck.cards.filter(c=>
      c.category==='Pokémon' && actor.printing===c.name+' '+c.printing.set);
    assert.equal(originalRegisteredActive.length,1,
      'Actual native Active must be a registered original-60 printing');
    // Native attack logs can name copied or granted attacks. The physical
    // attacking Pokémon need not be the card printing that supplies text.
    const originalAttackSourceIsPhysicalActive=actor.printing===expectedFullName;
    const actualPrintedAttack=actor.printedAttacks.find(p=>p.name===root.attackName);
    const actualPrintedAttackCostEnum=actualPrintedAttack?.cost??null;
    if(originalAttackSourceIsPhysicalActive){
      assert.equal(attackIsPrintedOnActualActive,true);
      assert.ok(nominal.printedAttackCost.every(t=>
        Number.isSafeInteger(CARD_TYPE_ENUM[t])),
      'Independent source attack cost must use known pinned CardType labels');
      assert.deepEqual(actualPrintedAttackCostEnum,
        nominal.printedAttackCost.map(t=>CARD_TYPE_ENUM[t]),
        'Actual pinned Active attack cost must match the independent source print');
    }
    // Cost modifiers and granted attacks require separate paper adjudication.
    // This reports direct printed funding by attached public Energy only.
    const directPrintedEnergySufficiency=originalAttackSourceIsPhysicalActive?
      assessDirectEnergy({
        types:nominal.attackerTypes,
        stage:nominal.attackerStage
      },nominal.printedAttackCost,
      actor.energyCards.map(name=>({name,count:1}))):null;
    assert.ok(directPrintedEnergySufficiency===null||
      ['POSSIBLE','IMPOSSIBLE','UNVERIFIED'].includes(
        directPrintedEnergySufficiency.status));
    assert.ok(Number.isSafeInteger(defender.damage)&&defender.damage>=0);
    assert.ok(Number.isSafeInteger(victim.victimDamageBeforeNativeKo));
    const incrementalNativeDamage=
      victim.victimDamageBeforeNativeKo-defender.damage;
    assert.ok(incrementalNativeDamage>0,
      'KO must have more actual cumulative damage than the pre-attack Active');
    const expectedNominal=nominal.unmodifiedPrintedFinalAttackDamage;
    assert.ok(Number.isSafeInteger(expectedNominal)&&expectedNominal>=0);
    return {
      index,registeredTrialId:root.registeredTrialId,
      attackRole:root.attackRole,attackSeat,
      acceptedDeclarationOrdinal:root.attackDeclarationRootOrdinal,
      acceptedPrizeRootOrdinal:root.actualPrizeExitRootOrdinal,
      attackName:root.attackName,
      attackerPrintingFromActualNativeBoard:actor.printing,
      physicalActivePrintingAccountedForByOriginal60:true,
      publicActiveNameAndSetObserved:true,
      publicActiveCollectorNumberObserved:false,
      attackNamePrintedOnPhysicalActive:attackIsPrintedOnActualActive,
      sourceAttackPrintEqualsPhysicalActive:originalAttackSourceIsPhysicalActive,
      actualPrintedAttackCostEnum:actualPrintedAttackCostEnum===null?null:[...actualPrintedAttackCostEnum],
      actualPrintedAttackCostMatchesSourceScreen:originalAttackSourceIsPhysicalActive?true:null,
      publicStadiumNamesBeforeAttack:before.map(board=>
        Array.isArray(board.stadium)?[...board.stadium]:[]),
      publicInPlayPrintingsBeforeAttack:before.map(board=>({
        active:board.active?.printing??null,
        bench:(board.bench??[]).map(p=>p.printing)
      })),
      copiedOrGrantedSourceUnresolved:!originalAttackSourceIsPhysicalActive,
      attackerEnergyNamesBeforeAttack:[...actor.energyCards],
      attackerToolNamesBeforeAttack:[...actor.toolCards],
      printedAttackCost:nominal.printedAttackCost,
      directPrintedEnergySufficiency,
      printedEnergyTestIncludesExternalCostModifiers:false,
      targetPrinting: defender.printing,
      targetEnergyNamesBeforeAttack:[...defender.energyCards],
      targetPreAttackDamage: defender.damage,
      targetDamageAtActualNativeKo:victim.victimDamageBeforeNativeKo,
      incrementalNativeDamageSincePreAttack:incrementalNativeDamage,
      independentPrintedNominalDamage:expectedNominal,
      nativeDeltaEqualsPrintedNominal:incrementalNativeDamage===expectedNominal,
      sourceAttackTextPrintingIndependentlyMatched:true,
      physicalActiveAtActualNativeAttackObserved:true,
      actualAttachedEnergyPaymentCertified:false,
      paperDamageModifierEffectsCertified:false,
      paperGameCertified:false
    };
  });
  return {version:VERSION,rows,
    nativeDamageDeltaPrintMatches:rows.filter(r=>
      r.nativeDeltaEqualsPrintedNominal).length,
    paperGameCertified:false,qualifiedCompetitiveGames:0};
}
module.exports={VERSION,joinNativePreAttackBoard};
