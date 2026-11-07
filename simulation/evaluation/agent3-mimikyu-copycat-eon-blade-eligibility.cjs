'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {assessDirectEnergy}=
  require('../twinleaf/agent30-source-attack-energy-reachability.cjs');

const VERSION='agent3-mimikyu-copycat-eon-blade-eligibility-v1';
const CARD_DIR=path.resolve(__dirname,'../../resources/cards/en');
const cardCache=new Map();

function cardById(id){
  if(typeof id!=='string')return null;
  const set=id.split('-')[0];
  if(!cardCache.has(set)){
    const file=path.join(CARD_DIR,set+'.json');
    cardCache.set(set,JSON.parse(fs.readFileSync(file,'utf8')));
  }
  return cardCache.get(set).find(card=>card.id===id)??null;
}

function addFailure(reasons,condition,reason){
  if(!condition&&!reasons.includes(reason))reasons.push(reason);
}

function rootByOrdinal(ledger,ordinal){
  return ledger.find(row=>row.actionOrdinal===ordinal)??null;
}

function donorPrinting(attack,root,physicalSeat){
  if(attack.delegatedCopy===true)
    return root?.attackChoice?.printing??null;
  return attack.publicBoardBefore?.[physicalSeat]?.active?.printing??null;
}

/**
 * Audit the specific Mimikyu GRI 58 Copycat -> Latias ex SSP 76 Eon Blade
 * line using only accepted native attack settlements, root-action history,
 * and public pre-attack board snapshots. The copied donor's Energy cost is
 * deliberately kept separate from Mimikyu's own Copycat cost.
 *
 * @param {object[]} attempts Original registered native attempts.
 * @param {object[]} prizeAttacks Accepted native attack -> physical Prize joins.
 * @param {object[]} preAttackRows Joined public pre-attack board rows.
 * @param {object[]} printedRows Original-roster printed attack screens.
 * @param {object} originalField Authenticated original 60-card inventories.
 * @returns {object} Fail-closed Copycat eligibility and cost evidence.
 */
function auditMimikyuCopycatEonBlade(
  attempts,prizeAttacks,preAttackRows,printedRows,originalField
){
  for(const rows of [attempts,prizeAttacks,preAttackRows,printedRows])
    if(!Array.isArray(rows))throw new TypeError('Copycat audit inputs must be arrays');
  if(!Array.isArray(originalField?.decks))
    throw new TypeError('Copycat audit requires the authenticated original field');

  const attemptsById=new Map();
  for(const attempt of attempts){
    const id=attempt?.trial?.id;
    if(typeof id==='string')attemptsById.set(id,attempt);
  }
  const preAttackByKey=new Map(preAttackRows.map(row=>[
    row.registeredTrialId+':'+row.acceptedDeclarationOrdinal,row
  ]));
  const nominalByKey=new Map(printedRows.map(row=>[
    row.trialId+':'+row.attackName,row
  ]));
  const mimikyu=cardById('sm2-58');
  const copycat=mimikyu?.attacks?.find(attack=>attack.name==='Copycat')??null;

  const targets=prizeAttacks.filter(root=>
    root.attackRole==='fixed-contender'&&root.attackName==='Eon Blade');

  const rows=targets.map(root=>{
    const reasons=[];
    const attempt=attemptsById.get(root.registeredTrialId);
    const pre=preAttackByKey.get(
      root.registeredTrialId+':'+root.attackDeclarationRootOrdinal);
    const nominal=nominalByKey.get(root.registeredTrialId+':'+root.attackName);
    const candidateSeat=attempt?.candidateSeat;
    const sourceSeat=attempt?.sourceSeat;
    const ledger=attempt?.rootActionLedger??[];
    const currentTurn=root.sameTurn;
    const current=currentAttack(attempt,root);
    const currentRoot=current?rootByOrdinal(ledger,current.actionOrdinal):null;
    const currentChoice=currentRoot?.attackChoice??null;
    const copycatRoots=ledger.filter(row=>
      row.playerSlot===candidateSeat&&row.turnBefore===currentTurn&&
      row.action==='AttackAction'&&row.attack==='Copycat'&&
      row.actionOrdinal<(current?.actionOrdinal??-1));
    const copycatRoot=copycatRoots.length===1?copycatRoots[0]:null;

    const rank=nominal?.originalRank;
    const sourceDeck=originalField.decks.find(deck=>deck.rank===rank);
    const donorCopies=sourceDeck?.cards?.filter(card=>
      card.category==='Pokémon'&&card.name===nominal?.rosterAttackerName&&
      nominal?.rosterAttackerPrintedId?.endsWith('-'+card.printing?.number))??[];
    const donorEntry=donorCopies.length===1?donorCopies[0]:null;
    const mimikyuCopies=sourceDeck?.cards?.filter(card=>
      card.category==='Pokémon'&&card.name==='Mimikyu'&&
      card.printing?.set==='GRI'&&card.printing?.number==='58')??[];
    const donorFullName=donorEntry?
      donorEntry.name+' '+donorEntry.printing.set:null;
    const donorCard=cardById(nominal?.rosterAttackerPrintedId);
    const donorAttack=donorCard?.attacks?.find(attack=>
      attack.name===root.attackName)??null;

    const priorCandidates=attempt?.sourceAttackSettlement?.attacks?.filter(attack=>
      attack.attackName===root.attackName&&
      attack.turnBefore===currentTurn-1)??[];
    const prior=priorCandidates.length===1?priorCandidates[0]:null;
    const priorRoot=prior?rootByOrdinal(ledger,prior.actionOrdinal):null;
    const priorDonor=prior?
      donorPrinting(prior,priorRoot,sourceSeat):null;
    const priorRootValid=Boolean(priorRoot&&priorRoot.playerSlot===sourceSeat&&
      priorRoot.turnBefore===currentTurn-1&&(
        prior.delegatedCopy===true?
          priorRoot.action==='ResolvePromptAction'&&
            priorRoot.attackChoice?.attackName===root.attackName:
          priorRoot.action==='AttackAction'&&priorRoot.attack===root.attackName));
    const currentRootValid=Boolean(currentRoot&&
      currentRoot.playerSlot===candidateSeat&&
      currentRoot.turnBefore===currentTurn&&
      currentRoot.action==='ResolvePromptAction');
    const board=current?.publicBoardBefore;
    const actor=Array.isArray(board)?board[candidateSeat]?.active:null;
    const stadiumNames=Array.isArray(board)?[...new Set(
      board.flatMap(player=>Array.isArray(player?.stadium)?player.stadium:[])
    )]:[];
    const knownStadiums=new Set(['Dimension Valley','Sky Field']);
    const unknownStadiums=stadiumNames.filter(name=>!knownStadiums.has(name));
    const conflictingStadiums=stadiumNames.length>1;
    const physicalCopycatMenu=actor?.printedAttacks?.find(attack=>
      attack.name==='Copycat')??null;
    const copycatCost=Array.isArray(copycat?.cost)?[...copycat.cost]:null;
    const effectiveCopycatCost=copycatCost?[...copycatCost]:null;
    if(effectiveCopycatCost&&stadiumNames.includes('Dimension Valley')){
      const colorless=effectiveCopycatCost.lastIndexOf('Colorless');
      if(colorless>=0)effectiveCopycatCost.splice(colorless,1);
    }
    const costAssessment=actor&&mimikyu&&effectiveCopycatCost?
      assessDirectEnergy({
        types:mimikyu.types,
        stage:mimikyu.subtypes?.includes('Basic')?'Basic':null
      },effectiveCopycatCost,
      actor.energyCards.map(name=>({name,count:1}))):null;
    const copycatCostFunding=unknownStadiums.length?
      {status:'UNVERIFIED',reason:'Unmodeled Stadium may alter attack cost',
        baseline:costAssessment}:costAssessment;

    const hasResetBetween=Boolean(prior&&current&&ledger.some(row=>
      row.actionOrdinal>=prior.actionOrdinal&&
      row.actionOrdinal<=current.actionOrdinal&&
      Number.isSafeInteger(row.turnBefore)&&
      Number.isSafeInteger(row.turnAfter)&&
      row.turnAfter<row.turnBefore));

    addFailure(reasons,Boolean(attempt),'registered-attempt-missing');
    addFailure(reasons,root.attackSeat===candidateSeat&&
      (candidateSeat===0||candidateSeat===1)&&
      sourceSeat===1-candidateSeat,'physical-seat-roles-mismatch');
    addFailure(reasons,attempt?.trial?.candidateId==='champion-reference',
      'candidate-is-not-champion-reference');
    addFailure(reasons,nominal?.rosterAttackerPrintedId==='sv8-76'&&
      nominal?.rosterAttackerName==='Latias ex'&&
      donorFullName==='Latias ex SSP','Eon-Blade-donor-print-not-authenticated');
    addFailure(reasons,mimikyuCopies.length>0,
      'Mimikyu-GRI-58-not-in-champion-reference-60');
    addFailure(reasons,donorCard?.id==='sv8-76'&&
      donorCard.legalities?.expanded==='Legal'&&
      !donorCard.subtypes?.includes('GX')&&
      donorAttack?.name==='Eon Blade'&&donorAttack.gxAttack!==true,
      'donor-attack-not-verified-as-expanded-non-GX');
    addFailure(reasons,Boolean(mimikyu&&mimikyu.id==='sm2-58'&&
      mimikyu.legalities?.expanded==='Legal'&&
      copycat?.name==='Copycat'&&
      copycat.text?.includes("isn't a GX attack")&&
      copycat.text?.includes('during their last turn')&&
      JSON.stringify(copycatCost)===JSON.stringify(['Psychic','Colorless'])),
      'printed-Mimikyu-Copycat-text-or-cost-unverified');
    addFailure(reasons,pre?.attackerPrintingFromActualNativeBoard==='Mimikyu GRI'&&
      actor?.printing==='Mimikyu GRI','physical-attacker-is-not-Mimikyu-GRI');
    addFailure(reasons,JSON.stringify(pre?.attackerEnergyNamesBeforeAttack)===
      JSON.stringify(actor?.energyCards),
      'pre-attack-energy-join-does-not-match-native-board');
    addFailure(reasons,Array.isArray(actor?.energyCards)&&
      Array.isArray(actor?.printedAttacks)&&
      JSON.stringify(physicalCopycatMenu?.cost)===JSON.stringify(copycatCost),
      'public-physical-Copycat-menu-missing-or-mismatched');
    addFailure(reasons,current?.delegatedCopy===true&&
      current?.triggerAction==='ResolvePromptAction'&&
      current?.settledPromptChain===true&&
      current?.settlementCrossesClockReset===false,
      'current-Copycat-attack-not-a-settled-delegated-copy');
    addFailure(reasons,copycatRoot!==null,'physical-Copycat-AttackAction-root-missing');
    addFailure(reasons,currentRootValid&&
      currentRoot?.attackChoice?.attackName===root.attackName&&
      currentChoice?.printing===donorFullName,
      'current-copied-attack-choice-does-not-match-donor');
    addFailure(reasons,priorRootValid,
      'prior-opponent-attack-root-missing-or-mismatched');
    addFailure(reasons,prior!==null&&
      prior.settledPromptChain===true&&
      prior.settlementCrossesClockReset===false&&
      prior.completionRootOrdinal<copycatRoot?.actionOrdinal,
      'no-settled-matching-opponent-attack-on-immediately-previous-turn');
    addFailure(reasons,priorDonor===donorFullName,
      'prior-turn-attack-donor-does-not-match-selected-Eon-Blade');
    addFailure(reasons,!hasResetBetween,'clock-reset-between-prior-attack-and-Copycat');
    addFailure(reasons,unknownStadiums.length===0,
      'unmodeled-Stadium-cost-modifier');
    addFailure(reasons,!conflictingStadiums,
      'conflicting-public-Stadium-state');
    addFailure(reasons,copycatCostFunding?.status==='POSSIBLE',
      'Mimikyu-Copycat-printed-cost-not-directly-funded');

    return {
      registeredTrialId:root.registeredTrialId,
      candidateId:attempt?.trial?.candidateId??null,
      currentTurn,priorOpponentTurn:currentTurn-1,
      physicalActive:actor?.printing??null,
      physicalActiveEnergyNames:actor?.energyCards??[],
      physicalActivePrintedCopycatCost:physicalCopycatMenu?.cost??null,
      copycatPrintedCost:copycatCost,
      effectiveCopycatCostAfterKnownStadiums:effectiveCopycatCost,
      stadiumNames,
      unknownStadiums,conflictingStadiums,
      copycatCostFunding,
      externalCostModifiersIncluded:false,
      currentCopiedAttack:root.attackName,
      currentCopiedAttackDonor:currentChoice?.printing??null,
      currentAttackDelegatedCopy:current?.delegatedCopy===true,
      currentCopycatAttackActionOrdinal:copycatRoot?.actionOrdinal??null,
      priorOpponentAttackObserved:prior!==null,
      priorOpponentAttackName:prior?.attackName??null,
      priorOpponentAttackTurn:prior?.turnBefore??null,
      priorOpponentAttackDonor:priorDonor,
      priorOpponentAttackSettled:prior?.settledPromptChain===true,
      priorOpponentAttackRootValid:priorRootValid,
      currentCopycatChoiceRootValid:currentRootValid,
      priorOpponentAttackNonGx:donorCard?.subtypes?.includes('GX')===false&&
        donorAttack?.gxAttack!==true,
      priorOpponentAttackWasImmediatelyPreviousTurn:prior?.turnBefore===currentTurn-1,
      copiedAttackEffectText:donorAttack?.text??null,
      copiedAttackHasNextTurnAttackLock:
        /During your next turn, this Pokémon can't attack/i.test(donorAttack?.text??''),
      nextTurnAttackLockApplicationAudited:false,
      donorPrintedAttackCost:donorAttack?.cost??null,
      donorCostAppliedToMimikyu:false,
      failureReasons:reasons,
      paperCopycatConditionSupported:reasons.length===0,
      actualAttachedEnergyPaymentCertified:false,
      paperGameCertified:false
    };
  });

  return {
    version:VERSION,rows,
    supportedRows:rows.filter(row=>row.paperCopycatConditionSupported).length,
    paperGameCertified:false,qualifiedCompetitiveGames:0
  };
}

function currentAttack(attempt,root){
  const attacks=attempt?.candidateAttackSettlement?.attacks;
  if(!Array.isArray(attacks))return null;
  const matches=attacks.filter(attack=>
    attack.actionOrdinal===root.attackDeclarationRootOrdinal&&
    attack.attackName===root.attackName&&
    attack.turnBefore===root.sameTurn);
  return matches.length===1?matches[0]:null;
}

module.exports={VERSION,auditMimikyuCopycatEonBlade};
