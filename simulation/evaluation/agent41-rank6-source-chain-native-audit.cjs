'use strict';

const SOURCE_RANK = 6;
const SOURCE_PRINTED60_SHA256 =
  'b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a';
const VERSION = 'agent41-rank6-source-native-chain-v1';

/** @param {unknown} value @returns {boolean} */
const isObject = value => value !== null && typeof value === 'object' &&
  !Array.isArray(value);

/**
 * A read-only, deliberately narrow audit of the ORIGINAL rank-6 Iron Thorns
 * Guzma & Hala -> Thunder Mountain / DCE -> Volt Cyclone native chain.
 * It checks accepted Store roots and archived prompt selections; they are not
 * by themselves independent proof of physical discard or paper legality.
 * This can audit a bounded early-turn slice of a full native row.
 * @param {unknown} row Registered native row or provenance-preserving slice.
 * @returns {object} One status for every registered arm, including no-line arms.
 */
function auditRank6SourceNativeChain(row) {
  const base = {
    version:VERSION, trialId:isObject(row?.trial)?row.trial.id??null:null,
    status:'INVALID_REGISTRATION',nativeChainSettled:false,
    physicalDiscardCustodyVerified:false, paperGameQualified:false,
    competitiveGameQualified:false, roots:null, paymentChoice:null,
    sourcePrizeDelta:null, opponentReplyAction:null
  };
  if(!isObject(row) || row.trial?.rank !== SOURCE_RANK ||
      ![0,1].includes(row.sourceSeat) ||
      row.candidateSeat !== 1-row.sourceSeat ||
      row.sourceDeckFingerprint !== SOURCE_PRINTED60_SHA256 ||
      row.verifiedFirstTurn !== true ||
      ![0,1].includes(row.actualStarterSeat)) return base;
  if(row.rootActionLedgerProtocol !== 'actual-store-root-action-ledger-v1' ||
      !Array.isArray(row.rootActionLedger))
    return {...base,status:'STORE_ROOTS_UNVERIFIED'};
  const roots = row.rootActionLedger;
  const byOrdinal = new Map(roots.map(root=>[root.actionOrdinal,root]));
  if(byOrdinal.size !== roots.length || roots.some(root =>
    !Number.isSafeInteger(root.actionOrdinal) ||
    !Number.isSafeInteger(root.turnBefore) ||
    !Number.isSafeInteger(root.turnAfter) ||
    root.turnAfter < root.turnBefore))
    return {...base,status:'STORE_ROOTS_UNVERIFIED'};
  const sourceRoots = roots.filter(root =>
    root.playerSlot === row.sourceSeat && root.pendingPrompt === null);
  const gh = sourceRoots.find(root => root.action === 'PlayCardAction' &&
    root.card === 'Guzma & Hala');
  if(!gh)return {...base,status:'GH_ROOT_NOT_SELECTED'};
  const prefix = {...base,roots:{gh:gh.actionOrdinal,thunderMountain:null,
    doubleColorless:null,voltCyclone:null,reply:null}};
  const sidecar = row.nativeAcceptedTargetSidecar;
  const accepted = sidecar?.observedLiveStore === true &&
    sidecar?.schema === 'actual-store-declared-target-sidecar-v1' &&
    Array.isArray(sidecar.events) && sidecar.events.some(event=>
      event.storeAccepted === true &&
      event.action === 'PlayCardAction' &&
      event.playerSlot === row.sourceSeat &&
      event.rootActionOrdinal === gh.actionOrdinal &&
      event.declared?.ownerHandPrinting === 'Guzma & Hala CEC');
  if(!accepted)return {...prefix,status:'GH_PHYSICAL_ROOT_UNVERIFIED'};
  const children = roots.filter(root =>
    root.initiatingRootActionOrdinal === gh.actionOrdinal &&
    root.action === 'ResolvePromptAction' &&
    root.playerSlot === row.sourceSeat);
  const promptEvents = row.nativePromptChoices?.events;
  if(!Array.isArray(promptEvents))
    return {...prefix,status:'GH_NATIVE_PROMPT_CHOICES_UNVERIFIED'};
  const join = kind => promptEvents.filter(event =>
    event.kind === kind && event.actorSeat === row.sourceSeat &&
    children.some(child=>child.actionOrdinal===event.ordinal));
  const option = join('SelectOptionPrompt').find(event =>
    event.selectedOption === 1 &&
    typeof event.selectedText === 'string' &&
    event.selectedText.includes('Discard 2 cards'));
  const paid = join('ChooseCardsPrompt').find(event =>
    event.sourceZone === 'hand' &&
    event.sourcePlayerSlot === row.sourceSeat &&
    event.nativePromptMin === 2 && event.nativePromptMax === 2 &&
    event.sourceZoneCardCountBefore >= 2 &&
    Array.isArray(event.selectedCards) && event.selectedCards.length === 2 &&
    event.selectedCards.every(card=>typeof card === 'string' && card.length>0));
  const search = join('ChooseCardsPrompt').find(event =>
    event.sourceZone === 'deck' &&
    event.sourcePlayerSlot === row.sourceSeat &&
    Array.isArray(event.selectedCards) &&
    event.selectedCards.includes('Thunder Mountain Prism Star LOT') &&
    event.selectedCards.includes('Double Colorless Energy SUM'));
  if(!option || !paid || !search)
    return {...prefix,status:'GH_NATIVE_PROMPT_CHOICES_UNVERIFIED'};
  const withPayment = {...prefix,paymentChoice:{
    selectedNames:[...paid.selectedCards],
    distinctPrintingNames:new Set(paid.selectedCards).size===2,
    nativeAcceptedSelection:true,discardZoneTransitionProven:false
  }};
  if(new Set(paid.selectedCards).size !== 2)
    return {...withPayment,status:'GH_PAYMENT_PHYSICAL_IDENTITY_UNVERIFIED'};
  const afterGh = (card)=>sourceRoots.find(root=>
    root.action === 'PlayCardAction' && root.card === card &&
    root.turnBefore === gh.turnBefore &&
    root.actionOrdinal > gh.actionOrdinal);
  const stadium = afterGh('Thunder Mountain Prism Star');
  const energy = afterGh('Double Colorless Energy');
  const attack = sourceRoots.find(root=>
    root.action === 'AttackAction' && root.attack === 'Volt Cyclone' &&
    root.turnBefore === gh.turnBefore && root.actionOrdinal > gh.actionOrdinal);
  if(!stadium || !energy || !attack ||
      !(stadium.actionOrdinal < energy.actionOrdinal &&
        energy.actionOrdinal < attack.actionOrdinal))
    return {...withPayment,status:'SOURCE_RESOURCE_TO_ATTACK_LINE_INCOMPLETE'};
  const withRoots = {...withPayment,roots:{
    ...withPayment.roots,thunderMountain:stadium.actionOrdinal,
    doubleColorless:energy.actionOrdinal,voltCyclone:attack.actionOrdinal
  }};
  const transition=row.sourceLinePacket?.sourceImmediatePublicAttackTransition;
  const publicSource=transition?.before?.[row.sourceSeat];
  if(transition?.actionOrdinal!==attack.actionOrdinal ||
      transition?.triggerAction!=='AttackAction' ||
      transition?.triggerPlayerSlot!==row.sourceSeat ||
      publicSource?.active?.name!=='Iron Thorns ex' ||
      !publicSource?.active?.energyCards?.includes('Double Colorless Energy') ||
      !publicSource?.stadium?.includes('Thunder Mountain Prism Star'))
    return {...withRoots,status:'SOURCE_ATTACK_ACTIVE_ENERGY_RECIPIENT_UNVERIFIED'};
  const settlements = row.sourceAttackSettlement?.attacks;
  const settlement = Array.isArray(settlements) ? settlements.find(event=>
    event.actionOrdinal === attack.actionOrdinal &&
    event.attackName === 'Volt Cyclone' &&
    event.triggerAction === 'AttackAction' &&
    event.settledPromptChain === true &&
    event.settlementCrossesClockReset === false &&
    event.nextSourceSameEpochProven === true &&
    Array.isArray(event.prizesBefore) &&
    Array.isArray(event.prizesAfter) &&
    event.prizesBefore[row.sourceSeat]-event.prizesAfter[row.sourceSeat]===1 &&
    Number.isSafeInteger(event.completionRootOrdinal) &&
    event.completionRootOrdinal >= attack.actionOrdinal):null;
  if(!settlement || row.sourceLinePacket?.matchingSourceAttackDeclared!==true ||
      row.sourceLinePacket?.executedSourceRoot?.ordinal !== attack.actionOrdinal ||
      transition?.settled?.completionRootActionOrdinal!==
        settlement.completionRootOrdinal ||
      !Array.isArray(transition.beforePrizesRemaining) ||
      !Array.isArray(transition.settled?.prizesRemaining) ||
      transition.beforePrizesRemaining[row.sourceSeat]!==
        settlement.prizesBefore[row.sourceSeat] ||
      transition.settled.prizesRemaining[row.sourceSeat]!==
        settlement.prizesAfter[row.sourceSeat])
    return {...withRoots,status:'SOURCE_NATIVE_ATTACK_PRIZE_UNVERIFIED'};
  const reply = row.sourceLinePacket?.firstCandidateNextTurnRoot;
  const recordedReply = byOrdinal.get(reply?.ordinal);
  if(!reply || !recordedReply ||
      reply.playerSlot !== row.candidateSeat ||
      recordedReply.playerSlot !== row.candidateSeat ||
      reply.turn !== attack.turnBefore+1 ||
      recordedReply.turnBefore !== reply.turn ||
      recordedReply.action !== reply.action ||
      reply.ordinal <= settlement.completionRootOrdinal ||
      recordedReply.pendingPrompt !== null ||
      recordedReply.action === 'ResolvePromptAction')
    return {...withRoots,status:'IMMEDIATE_OPPONENT_ROOT_UNVERIFIED',
      sourcePrizeDelta:1};
  return {
    ...withRoots,status:'NATIVE_SETTLED_WITH_REPLY_PAPER_UNQUALIFIED',
    nativeChainSettled:true,sourcePrizeDelta:1,
    roots:{...withRoots.roots,reply:reply.ordinal},
    opponentReplyAction:reply.action
  };
}

/** @param {unknown[]} rows @returns {object} */
function summarizeRank6SourceNativeChains(rows) {
  if(!Array.isArray(rows))throw new TypeError('Expected all registered rows');
  const findings = rows.map(auditRank6SourceNativeChain);
  const counts={};
  for(const row of findings)counts[row.status]=(counts[row.status]??0)+1;
  return {version:VERSION,registeredAttempts:rows.length,counts,findings,
    nativeSettledWithImmediateReply:findings.filter(x=>x.nativeChainSettled).length,
    paperPaymentVerified:0,competitiveQualifiedGames:0};
}

module.exports={VERSION,SOURCE_RANK,SOURCE_PRINTED60_SHA256,
  auditRank6SourceNativeChain,summarizeRank6SourceNativeChains};
