'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));

/**
 * One source-conserved, owner-information-only candidate turn-24 decision
 * instead of its ordinary policy's self-suppressing Path to the Peak.
 *
 * Patch both the real candidate root action and its delegated prompt choice.
 * Change no hidden zones, initial deal, printed cards, or opponent actions.
 * @template T
 * @param {()=>T} work One fixed source-dealt game
 * @returns {{game:T,proposal:object|null,selectedAttack:object|null}}
 */
function withTurn24CopiedPoltergeist(work) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ChooseAttackPromptResolver}=engine(
    'simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt}=engine('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {GamePhase}=engine('game/store/state/state');
  const originalAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalPrompt=Object.getOwnPropertyDescriptor(
    ChooseAttackPromptResolver.prototype,'resolvePrompt');
  assert.equal(typeof originalAi?.value,'function');
  assert.equal(typeof originalPrompt?.value,'function');

  let proposal=null,selectedAttack=null;
  const candidateDecision=function(state) {
    const ordinary=originalAi.value.call(this,state);
    if(proposal || state.turn!==24 || state.activePlayer!==1 ||
        state.phase!==GamePhase.PLAYER_TURN ||
        state.prompts.some(prompt=>prompt.result===undefined) ||
        !(ordinary instanceof PlayCardAction))return ordinary;
    const own=state.players[1];
    if(own.id!==this.client?.id ||
        own.active.getPokemonCard()?.fullName!=='Mewtwo & Mew-GX UNM' ||
        own.hand.cards[ordinary.handIndex]?.name!=='Path to the Peak')return ordinary;
    const printed=card=>card?.fullName==='Gengar & Mimikyu-GX TEU';
    const payloadAvailable=own.discard.cards.some(printed) ||
      own.bench.some(slot=>printed(slot.getPokemonCard()));
    const source=state.players[0];
    const equippedGarbo=source.bench.some(slot=>
      slot.getPokemonCard()?.name==='Garbodor' && slot.tools.length>0);
    if(!payloadAvailable || equippedGarbo)return ordinary;
    proposal={
      globalTurn:state.turn,
      physicalSeat:1,
      sourceActive:source.active.getPokemonCard()?.fullName??null,
      candidateActive:own.active.getPokemonCard()?.fullName??null,
      ownHand:own.hand.cards.map(card=>card.fullName),
      printedPayloadPresent:true,
      sourceEquippedGarbodor:false,
      displacedOwnHandCard:'Path to the Peak',
      originalAction:ordinary.constructor.name,
      sourceHiddenInformationInspected:false
    };
    return new UseAbilityAction(own.id,'Perfection',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    });
  };
  const choosePrintedAttack=function(state,player,prompt) {
    if(proposal && !selectedAttack &&
        state.turn===24 && state.activePlayer===1 &&
        prompt instanceof ChooseAttackPrompt &&
        prompt.playerId===player.id && state.players[1].id===player.id &&
        player.active.getPokemonCard()?.fullName==='Mewtwo & Mew-GX UNM') {
      const donor=prompt.cards.find(card=>
        card.fullName==='Gengar & Mimikyu-GX TEU');
      const chosen=donor?.attacks.find(attack=>attack.name==='Poltergeist');
      if(chosen && prompt.validate(chosen)) {
        selectedAttack={
          sourcePrinting:donor.fullName,attackName:chosen.name,
          validatedByActualPrompt:true,
          actorOwnCardOrDiscard:true
        };
        return new ResolvePromptAction(prompt.id,chosen);
      }
    }
    return originalPrompt.value.call(this,state,player,prompt);
  };

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...originalAi,value:candidateDecision});
  Object.defineProperty(ChooseAttackPromptResolver.prototype,'resolvePrompt',
    {...originalPrompt,value:choosePrintedAttack});
  try {
    return {game:work(),proposal,selectedAttack};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalAi);
    Object.defineProperty(ChooseAttackPromptResolver.prototype,'resolvePrompt',
      originalPrompt);
  }
}

/** @returns {object} */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {pairedCandidateSlots}=
    require('./new-moon-lockbreak-source-diagnostic.cjs');
  const {runArm}=require('./new-moon-second-start-paired.cjs');
  const source=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const seed=1111464409;
  const args=[candidate,source.cards,1,seed,350,true,true,false,false];
  const control=runArm(...args);
  const observedControl=runArm(...args.slice(0,-1),true);
  assert.deepEqual(observedControl.rootActionLedger,control.rootActionLedger,
    'Read-only Poltergeist observer changed baseline action ledger');
  assert.deepEqual(observedControl.terminalTransition,control.terminalTransition);
  const changed=withTurn24CopiedPoltergeist(()=>runArm(...args.slice(0,-1),true));
  const game=changed.game;
  assert.equal(control.firstTurnSlot,0);
  assert.equal(game.firstTurnSlot,0);
  assert.equal(game.verifiedByDrawLog,true);
  assert.deepEqual(game.deckHashes,control.deckHashes);
  assert.ok(changed.proposal,
    'Expected an own-hand, public-board candidate Path opportunity at turn24');
  assert.ok(changed.selectedAttack,
    'The actual delegated attack prompt must offer the payable printed Poltergeist');
  const originally=control.rootActionLedger.find(row=>
    row.turnBefore===24 && row.playerSlot===1 &&
    row.action==='PlayCardAction' && row.card==='Path to the Peak');
  const instead=game.rootActionLedger.find(row=>
    row.turnBefore===24 && row.playerSlot===1 &&
    row.action==='UseAbilityAction' && row.ability==='Perfection');
  assert.ok(originally && instead,'Expected real source root action contrast');
  assert.equal(originally.actionOrdinal,instead.actionOrdinal);
  assert.deepEqual(
    control.rootActionLedger.filter(row=>row.actionOrdinal<instead.actionOrdinal),
    game.rootActionLedger.filter(row=>row.actionOrdinal<instead.actionOrdinal),
    'Before the source-legal candidate response all root actions must match');
  const copied=game.attackDeclarationTrace.find(row=>
    row.turnBefore===24 && row.playerSlot===1 &&
    row.attackName==='Poltergeist' && row.triggerAction!=='AttackAction');
  assert.ok(copied,'Actual Store must declare delegated Poltergeist at source turn24');
  const observedTurn24=game.poltergeistEffectTrace.find(row=>row.actionOrdinal===copied.actionOrdinal);
  assert.ok(observedTurn24?.assessment);
  assert.equal(observedTurn24.assessment.printedBaseDamage,observedTurn24.before[0].handTrainerCount*50);
  const firstSourceReply=game.rootActionLedger.find(row=>
    row.actionOrdinal>copied.actionOrdinal &&
    row.playerSlot===0 && row.turnBefore>=25 &&
    row.action!=='ResolvePromptAction');
  assert.ok(firstSourceReply,'Need an authentic source response following copied turn24');
  const sourceTurnActions=game.rootActionLedger.filter(row=>
    row.turnBefore===firstSourceReply.turnBefore && row.playerSlot===0);
  assert.ok(sourceTurnActions.some(row=>
    row.action==='PassTurnAction'||row.turnAfter>row.turnBefore),
    'The source player response must proceed through a complete real turn');
  const sourceTurnAttackDeclarations=game.attackDeclarationTrace.filter(row=>
    row.turnBefore===firstSourceReply.turnBefore && row.playerSlot===0);
  const sourceFirstAction=game.decisionTrace.find(row=>
    row.actionOrdinal===firstSourceReply.actionOrdinal);
  const sourcePass=game.decisionTrace.find(row=>
    row.turnBefore===firstSourceReply.turnBefore && row.playerSlot===0 &&
    row.action==='PassTurnAction');
  const sourceTurnPublicPressure={
    globalTurn:firstSourceReply.turnBefore,
    sourcePassActionOrdinal:sourcePass?.actionOrdinal??null,
    sourceHandAtPass:sourcePass?.decisionHandBefore?.ownHandPrintings??null,
    sourceBoardAtPass:sourcePass?.publicBoardBeforePass??null,
    initialAction:firstSourceReply,
    ownerHandAtInitialAction:sourceFirstAction?.decisionHandBefore?.ownHandPrintings??null,
    publicBoardAtInitialAction:sourceFirstAction?.publicBoardBeforePass??null,
    fullSourceTurnActions:sourceTurnActions,
    sourceAttackDeclarations:sourceTurnAttackDeclarations,
    sourceAttackDeclared:sourceTurnAttackDeclarations.length>0
  };

  return {
    schema:'rank11-source-candidate-turn24-perfection-poltergeist-fork-v1',
    seed,seedWasRetrospectivelySelected:true,
    opponentRank:11,sourceFirst:true,candidatePhysicalSeat:1,
    source60:'results/aichi-2026/full-decklists.json rank 11',
    candidate60:'New Moon Lockbreaker English mechanics proxy',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    identicalDeckHashes:game.deckHashes,
    firstDivergentRootOrdinal:instead.actionOrdinal,
    completePreInterventionRootParity:true,
    baselineEffectObserverNoninterferenceVerified:true,
    turn24PrintedEffect:observedTurn24.assessment,
    turn24SourceActiveBefore:observedTurn24.publicBefore[0]?.active??null,
    turn24SourceActiveAfter:observedTurn24.steps.at(-1)?.publicAfter?.[0]?.active??null,
    turn24SourceBenchAfter:observedTurn24.steps.at(-1)?.publicAfter?.[0]?.bench??null,
    chosenAction:changed.proposal,
    chosenAttack:changed.selectedAttack,
    actualCopiedAttack:{
      actionOrdinal:copied.actionOrdinal,attackName:copied.attackName,
      triggerAction:copied.triggerAction,
      resolutionStatus:copied.resolutionStatus
    },
    candidateTurn24Original:control.rootActionLedger.filter(row=>
      row.turnBefore===24 && row.playerSlot===1),
    candidateTurn24Changed:game.rootActionLedger.filter(row=>
      row.turnBefore===24 && row.playerSlot===1),
    sourceNextAction:firstSourceReply,
    sourceTurnPublicPressure,
    control:{
      winner:control.winner,prizes:control.prizesRemaining,
      actions:control.actions,turns:control.turns,
      terminalTransition:control.terminalTransition
    },
    candidateCopiedResponse:{
      winner:game.winner,prizes:game.prizesRemaining,
      actions:game.actions,turns:game.turns,
      terminalTransition:game.terminalTransition
    },
    qualifiedCompetitiveGames:0,
    caveat:'Retrospective single source deal. One public/own-hand change at candidate turn24; historical policies, full paper damage fidelity and official clock remain unqualified.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withTurn24CopiedPoltergeist,run};
