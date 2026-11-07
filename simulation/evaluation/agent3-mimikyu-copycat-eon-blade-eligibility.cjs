'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {assessDirectEnergy}=
  require('../twinleaf/agent30-source-attack-energy-reachability.cjs');

const VERSION='agent3-mimikyu-copycat-eon-blade-eligibility-v2';
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

function auditOneCopycat({
  attempt,attack,attackRole,attackerSeat,opponentSeat,opponentSettlement,
  originalDeck,mimikyu,copycat,donorCard,donorAttack,donorFullName
}){
  const reasons=[];
  const ledger=attempt.rootActionLedger??[];
  const currentTurn=attack.turnBefore;
  const currentRoot=rootByOrdinal(ledger,attack.actionOrdinal);
  const currentChoice=currentRoot?.attackChoice??null;
  const copycatRoots=ledger.filter(row=>
    row.playerSlot===attackerSeat&&row.turnBefore===currentTurn&&
    row.action==='AttackAction'&&row.attack==='Copycat'&&
    row.actionOrdinal<attack.actionOrdinal);
  const copycatRoot=copycatRoots.length===1?copycatRoots[0]:null;
  const priorCandidates=opponentSettlement?.attacks?.filter(previous=>
    previous.attackName===attack.attackName&&
    previous.turnBefore===currentTurn-1)??[];
  const prior=priorCandidates.length===1?priorCandidates[0]:null;
  const priorRoot=prior?rootByOrdinal(ledger,prior.actionOrdinal):null;
  const priorDonor=prior?donorPrinting(prior,priorRoot,opponentSeat):null;
  const board=attack.publicBoardBefore;
  const actor=Array.isArray(board)?board[attackerSeat]?.active:null;
  const actorBoard=Array.isArray(board)?board[attackerSeat]:null;
  const stadiumNames=Array.isArray(board)?[...new Set(
    board.flatMap(player=>Array.isArray(player?.stadium)?player.stadium:[])
  )]:[];
  const knownStadiums=new Set(['Dimension Valley','Sky Field']);
  const unknownStadiums=stadiumNames.filter(name=>!knownStadiums.has(name));
  const conflictingStadiums=stadiumNames.length>1;
  const dimensionValleyVisible=stadiumNames.includes('Dimension Valley');
  const benchNames=(actorBoard?.bench??[]).map(pokemon=>pokemon.printing);
  const newMoonPairVisible=
    benchNames.some(name=>name==='Lunatone OBF')&&
    benchNames.some(name=>name==='Solrock CES');
  const physicalCopycatMenu=actor?.printedAttacks?.find(
    printed=>printed.name==='Copycat')??null;
  const copycatCost=Array.isArray(copycat?.cost)?[...copycat.cost]:null;
  const directCostAssessment=actor&&mimikyu&&copycatCost?
    assessDirectEnergy({
      types:mimikyu.types,
      stage:mimikyu.subtypes?.includes('Basic')?'Basic':null
    },copycatCost,actor.energyCards.map(name=>({name,count:1}))):null;

  let copycatCostFunding=directCostAssessment;
  if(unknownStadiums.length||conflictingStadiums){
    copycatCostFunding={
      status:'UNVERIFIED',
      reason:'Public Stadium snapshot is unknown or contradictory',
      baseline:directCostAssessment
    };
  }else if(dimensionValleyVisible&&directCostAssessment?.status==='IMPOSSIBLE'){
    copycatCostFunding={
      status:'UNVERIFIED',
      reason:'Dimension Valley may reduce one Colorless, but suppression and New Moon state are not captured',
      baseline:directCostAssessment
    };
  }

  const priorRootValid=Boolean(priorRoot&&
    priorRoot.playerSlot===opponentSeat&&
    priorRoot.turnBefore===currentTurn-1&&(
      prior.delegatedCopy===true?
        priorRoot.action==='ResolvePromptAction'&&
          priorRoot.attackChoice?.attackName===attack.attackName:
        priorRoot.action==='AttackAction'&&priorRoot.attack===attack.attackName));
  const currentRootValid=Boolean(currentRoot&&
    currentRoot.playerSlot===attackerSeat&&
    currentRoot.turnBefore===currentTurn&&
    currentRoot.action==='ResolvePromptAction'&&
    currentRoot.attackChoice?.attackName===attack.attackName&&
    currentChoice?.printing===donorFullName);
  const hasResetBetween=Boolean(prior&&ledger.some(row=>
    row.actionOrdinal>=prior.actionOrdinal&&
    row.actionOrdinal<=attack.actionOrdinal&&
    Number.isSafeInteger(row.turnBefore)&&
    Number.isSafeInteger(row.turnAfter)&&
    row.turnAfter<row.turnBefore));

  addFailure(reasons,attempt.trial?.candidateId==='champion-reference',
    'candidate-is-not-champion-reference');
  addFailure(reasons,originalDeck?.cards?.some(card=>
    card.category==='Pokémon'&&card.name==='Mimikyu'&&
    card.printing?.set==='GRI'&&card.printing?.number==='58'),
    'Mimikyu-GRI-58-not-in-original-rank-one-60');
  addFailure(reasons,originalDeck?.cards?.some(card=>
    card.category==='Pokémon'&&card.name==='Latias ex'&&
    card.printing?.set==='SSP'&&card.printing?.number==='76'),
    'Latias-ex-SSP-76-not-in-original-rank-one-60');
  addFailure(reasons,mimikyu?.id==='sm2-58'&&
    mimikyu.legalities?.expanded==='Legal'&&
    copycat?.name==='Copycat'&&
    copycat.text?.includes("isn't a GX attack")&&
    copycat.text?.includes('during their last turn')&&
    JSON.stringify(copycatCost)===JSON.stringify(['Psychic','Colorless']),
    'printed-Mimikyu-Copycat-text-or-cost-unverified');
  addFailure(reasons,donorCard?.id==='sv8-76'&&
    donorCard.legalities?.expanded==='Legal'&&
    !donorCard.subtypes?.includes('GX')&&
    donorAttack?.name==='Eon Blade'&&donorAttack.gxAttack!==true,
    'donor-attack-not-verified-as-expanded-non-GX');
  addFailure(reasons,attack.delegatedCopy===true&&
    attack.triggerAction==='ResolvePromptAction'&&
    attack.settledPromptChain===true&&
    attack.settlementCrossesClockReset===false,
    'current-Copycat-attack-not-a-settled-delegated-copy');
  addFailure(reasons,actor?.printing==='Mimikyu GRI',
    'physical-attacker-is-not-Mimikyu-GRI');
  addFailure(reasons,Array.isArray(actor?.energyCards)&&
    JSON.stringify(physicalCopycatMenu?.cost)===JSON.stringify(copycatCost),
    'public-physical-Copycat-menu-missing-or-mismatched');
  addFailure(reasons,copycatRoot!==null,
    'physical-Copycat-AttackAction-root-missing');
  addFailure(reasons,currentRootValid,
    'current-copied-attack-choice-does-not-match-donor');
  addFailure(reasons,prior!==null&&
    prior.settledPromptChain===true&&
    prior.settlementCrossesClockReset===false&&
    prior.completionRootOrdinal<copycatRoot?.actionOrdinal,
    'no-settled-matching-opponent-attack-on-immediately-previous-turn');
  addFailure(reasons,priorRootValid,
    'prior-opponent-attack-root-missing-or-mismatched');
  addFailure(reasons,priorDonor===donorFullName,
    'prior-turn-attack-donor-does-not-match-selected-Eon-Blade');
  addFailure(reasons,!hasResetBetween,
    'clock-reset-between-prior-attack-and-Copycat');
  addFailure(reasons,unknownStadiums.length===0&&!conflictingStadiums,
    'unmodeled-or-conflicting-Stadium-state');
  addFailure(reasons,copycatCostFunding?.status==='POSSIBLE',
    copycatCostFunding?.status==='UNVERIFIED'?
      'Mimikyu-Copycat-cost-unverified-under-Stadium-state':
      'Mimikyu-Copycat-printed-cost-not-directly-funded');

  return {
    registeredTrialId:attempt.trial?.id??null,
    candidateId:attempt.trial?.candidateId??null,
    attackRole,attackerSeat,opponentSeat,
    currentTurn,priorOpponentTurn:currentTurn-1,
    physicalActive:actor?.printing??null,
    physicalActiveEnergyNames:actor?.energyCards??[],
    physicalActivePrintedCopycatCost:physicalCopycatMenu?.cost??null,
    copycatPrintedCost:copycatCost,
    stadiumNames,unknownStadiums,conflictingStadiums,
    dimensionValleyVisible,newMoonPairVisible,
    stadiumSuppressionState:'not-captured',
    copycatCostFunding,
    currentCopiedAttack:attack.attackName,
    currentCopiedAttackDonor:currentChoice?.printing??null,
    currentAttackDelegatedCopy:attack.delegatedCopy===true,
    currentCopycatAttackActionOrdinal:copycatRoot?.actionOrdinal??null,
    priorOpponentAttackObserved:prior!==null,
    priorOpponentAttackName:prior?.attackName??null,
    priorOpponentAttackTurn:prior?.turnBefore??null,
    priorOpponentAttackDonor:priorDonor,
    priorOpponentAttackSettled:prior?.settledPromptChain===true,
    priorOpponentAttackRootValid:priorRootValid,
    currentCopycatChoiceRootValid:currentRootValid,
    priorOpponentAttackNonGx:
      donorCard?.subtypes?.includes('GX')===false&&donorAttack?.gxAttack!==true,
    priorOpponentAttackWasImmediatelyPreviousTurn:
      prior?.turnBefore===currentTurn-1,
    copiedAttackEffectText:donorAttack?.text??null,
    copiedAttackHasNextTurnAttackLock:
      /During your next turn, this Pokémon can't attack/i.test(donorAttack?.text??''),
    nextTurnAttackLockApplicationAudited:false,
    donorPrintedAttackCost:donorAttack?.cost??null,
    donorCostAppliedToMimikyu:false,
    externalCostModifiersIncluded:false,
    failureReasons:reasons,
    paperCopycatConditionSupported:reasons.length===0,
    actualAttachedEnergyPaymentCertified:false,
    paperGameCertified:false
  };
}

/**
 * Scan both seats' complete settled attack histories for actual Mimikyu
 * GRI 58 Copycat -> Latias ex SSP 76 Eon Blade events. Direct Latias ex
 * Eon Blade attacks are intentionally excluded.
 *
 * @param {object[]} attempts Registered native attempts with both attack settlements.
 * @param {object} originalField Authenticated original 60-card inventories.
 * @returns {object} Fail-closed postgame Copycat history and cost audit.
 */
function auditMimikyuCopycatEonBlade(attempts,originalField){
  if(!Array.isArray(attempts))
    throw new TypeError('Copycat audit attempts must be an array');
  if(!Array.isArray(originalField?.decks))
    throw new TypeError('Copycat audit requires the authenticated original field');

  const originalDeck=originalField.decks.find(deck=>deck.rank===1);
  const mimikyu=cardById('sm2-58');
  const copycat=mimikyu?.attacks?.find(attack=>attack.name==='Copycat')??null;
  const donorCard=cardById('sv8-76');
  const donorAttack=donorCard?.attacks?.find(attack=>attack.name==='Eon Blade')??null;
  const donorFullName='Latias ex SSP';
  const rows=[];
  let scannedAttackCount=0;
  let eonBladeAttackCount=0;

  for(const attempt of attempts){
    if(attempt?.trial?.candidateId!=='champion-reference'||
      !String(attempt?.trial?.id??'').startsWith('1:'))continue;
    const sides=[
      {role:'original-source',seat:attempt.sourceSeat,
        opponentSeat:attempt.candidateSeat,
        settlement:attempt.sourceAttackSettlement,
        opponentSettlement:attempt.candidateAttackSettlement},
      {role:'fixed-contender',seat:attempt.candidateSeat,
        opponentSeat:attempt.sourceSeat,
        settlement:attempt.candidateAttackSettlement,
        opponentSettlement:attempt.sourceAttackSettlement}
    ];
    for(const side of sides){
      const attacks=side.settlement?.attacks??[];
      scannedAttackCount+=attacks.length;
      for(const attack of attacks){
        if(attack.attackName==='Eon Blade')eonBladeAttackCount++;
        const physical=attack.publicBoardBefore?.[side.seat]?.active;
        if(attack.attackName!=='Eon Blade'||
          attack.delegatedCopy!==true||
          physical?.printing!=='Mimikyu GRI')continue;
        rows.push(auditOneCopycat({
          attempt,attack,attackRole:side.role,
          attackerSeat:side.seat,opponentSeat:side.opponentSeat,
          opponentSettlement:side.opponentSettlement,
          originalDeck,mimikyu,copycat,donorCard,donorAttack,donorFullName
        }));
      }
    }
  }

  return {
    version:VERSION,
    scannedAttackCount,eonBladeAttackCount,
    observedMimikyuCopycatEonBladeEvents:rows.length,
    noMimikyuCopycatEonBladeObserved:rows.length===0,
    rows,
    supportedRows:rows.filter(row=>row.paperCopycatConditionSupported).length,
    unverifiedCostRows:rows.filter(row=>
      row.copycatCostFunding?.status==='UNVERIFIED').length,
    paperGameCertified:false,qualifiedCompetitiveGames:0
  };
}

module.exports={VERSION,auditMimikyuCopycatEonBlade};
