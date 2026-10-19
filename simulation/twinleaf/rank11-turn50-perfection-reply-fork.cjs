'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withRank11Turn49QuickBalls}=
  require('./rank11-turn49-quick-ball-counterfactual.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const SEED=1244180408;
const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;

/**
 * Single owner-visible, explicit second-policy decision after genuine source
 * Quick Ball pressure. This counterfactual is a retrospective mechanics test.
 * The real Store must accept the Perfection Ability and selected copied attack.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withTurn50OwnerPerfectionReply(candidateSeat,execute) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {GamePhase}=engine('game/store/state/state');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const candidateId=candidateSeat===0?101:202;
  const audit={observedOpportunity:false,realAbilityChosen:false,
    realPrintedAttackChosen:false,declinedReason:null,events:[]};
  let phase='initial';
  const wrapper=function candidateOwnerReply(state) {
    const player=state.players.find(p=>p.id===this.client?.id);
    if(!player || player.id!==candidateId || state.turn!==50 ||
        state.activePlayer!==candidateSeat ||
        (state.phase!==GamePhase.PLAYER_TURN && phase!=='select-attack') ||
        phase==='finished') {
      return previous.call(this,state);
    }
    const pending=state.prompts.find(p=>p.result===undefined);
    if(phase==='select-attack') {
      if(pending?.constructor.name==='WaitPrompt') return previous.call(this,state);
      if(!pending || pending.playerId!==player.id ||
          pending.constructor.name!=='ChooseAttackPrompt') {
        audit.declinedReason='missing-own-choose-attack-prompt';
        phase='finished';
        return previous.call(this,state);
      }
      const attack=pending.cards.filter(card=>
        card.fullName==='Gengar & Mimikyu-GX TEU')
        .flatMap(card=>card.attacks||[])
        .find(a=>a.name==='Poltergeist');
      if(!attack || !pending.validate(attack,state)) {
        audit.declinedReason='printed-Poltergeist-not-valid-in-owner-prompt';
        phase='finished';
        return previous.call(this,state);
      }
      audit.realPrintedAttackChosen=true;
      audit.events.push({turn:state.turn,kind:'owner-visible-Poltergeist-attack-choice',
        legal:true,source:'Gengar & Mimikyu-GX TEU'});
      phase='finished';
      return new ResolvePromptAction(pending.id,attack);
    }
    if(phase==='initial') {
      if(pending) return previous.call(this,state);
      audit.observedOpportunity=true;
      const current=player.active.getPokemonCard();
      audit.events.push({turn:state.turn,kind:'owner-first-decision',
        active:current?.fullName??null,
        ownEnergy:player.active.energies.cards.map(card=>card.fullName),
        ownHand:player.hand.cards.map(card=>card.fullName),
        opponentActive:state.players[1-candidateSeat].active.getPokemonCard()?.fullName??null,
        opposingActiveDamage:state.players[1-candidateSeat].active.damage});
      if(current?.fullName!=='Mewtwo & Mew-GX UNM') {
        audit.declinedReason='expected-Mewtwo-not-active';
        phase='finished';
        return previous.call(this,state);
      }
      const action=new UseAbilityAction(player.id,'Perfection',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      });
      if(!this.isValidAction(state,action)) {
        audit.declinedReason='pinned-simulator-rejected-Perfection';
        phase='finished';
        return previous.call(this,state);
      }
      audit.realAbilityChosen=true;
      audit.events.push({turn:state.turn,kind:'live-legal-Perfection-action'});
      phase='select-attack';
      return action;
    }
    return previous.call(this,state);
  };
  SimpleTacticsAi.prototype.decodeNextAction=wrapper;
  try {
    const result=execute();
    return {result,policyAudit:{...audit,phaseAtEnd:phase,competitivelyQualified:false}};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,wrapper,
      'Candidate counterfactual must retain hook ownership until restoration');
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

/** @param {object} game */
function afterTurn48(game) {
  return {
    actions:game.actions,turns:game.turns,winner:game.winner,
    prizes:game.prizesRemaining,
    candidateTurn50:game.rootActionLedger.filter(row=>
      row.playerSlot===CANDIDATE_SEAT && row.turnBefore===50),
    candidateLater:game.rootActionLedger.filter(row=>
      row.playerSlot===CANDIDATE_SEAT &&
      row.turnBefore>=52 && row.turnBefore<=56 &&
      row.action!=='ResolvePromptAction'),
    copiedSelections:game.decisionTrace.filter(row=>
      row.playerSlot===CANDIDATE_SEAT && row.attackChoice?.selection &&
      row.turnBefore>=48).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attack:row.attackChoice.selection
      })),
    latePrizeTransitions:game.decisionTrace.filter(row=>
      row.turnBefore>=48 && row.prizesAfter &&
      row.prizesAfter.some(n=>n<6)).slice(-12).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        playerSlot:row.playerSlot,action:row.action,
        prizesAfter:row.prizesAfter
      })),
    // Detached post-action evidence only: hidden opponent hand is never given
    // to either policy. Preserve printed calculation and Store board changes.
    latePoltergeistEffectWindows:(game.poltergeistEffectTrace||[])
      .filter(event=>event.turnBefore>=50 &&
        event.attackerSeat===CANDIDATE_SEAT)
      .map(event=>({
        turnBefore:event.turnBefore,actionOrdinal:event.actionOrdinal,
        triggerAction:event.triggerAction,
        before:event.before,after:event.after,
        publicBefore:event.publicBefore,publicAfter:event.publicAfter,
        steps:event.steps,assessment:event.assessment??null
      }))
  };
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===11);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,seed:SEED,
    maxActions:450,rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    capturePoltergeistEffectTrace:true,
    label:'rank11-QBall-NewMoon-turn50-owner-Perfection-reply'
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const candidatePolicy=fn=>withNewMoonBlowerAutonomy(CANDIDATE_SEAT,fn,
    {lowHandLillieAfterBlower:true});
  const sourcePolicy=fn=>withRank11Turn49QuickBalls(SOURCE_SEAT,fn);
  const noReply=candidatePolicy(()=>sourcePolicy(play));
  const withReply=candidatePolicy(()=>
    sourcePolicy(()=>withTurn50OwnerPerfectionReply(CANDIDATE_SEAT,play)));
  const restored=candidatePolicy(()=>sourcePolicy(play));
  const control=noReply.result.result;
  const reply=withReply.result.result.result;
  assert.equal(control.firstTurnSlot,SOURCE_SEAT);
  assert.equal(reply.firstTurnSlot,SOURCE_SEAT);
  assert.equal(control.verifiedByDrawLog,true);
  assert.equal(reply.verifiedByDrawLog,true);
  assert.deepEqual(control.deckHashes,reply.deckHashes);
  assert.deepEqual(control.rootActionLedger,restored.result.result.rootActionLedger,
    'All ephemeral owner policies must restore the original Source Store replay');
  const before=game=>game.rootActionLedger.filter(row=>row.turnBefore<50);
  assert.deepEqual(before(control),before(reply),
    'Only the candidate real t50 choice may differ after source Quick Ball fork');
  const selectedWindow=(reply.poltergeistEffectTrace||[]).find(event=>
    event.attackerSeat===CANDIDATE_SEAT && event.turnBefore===50);
  assert.ok(selectedWindow,
    'Chosen owner Perfection must reach a genuine Store Poltergeist effect window');
  assert.equal(selectedWindow.assessment?.sourceHandTrainerCount,4,
    'Source hand must still contain four Trainer cards after Quick Ball burns');
  assert.equal(selectedWindow.assessment?.printedBaseDamage,200,
    'The 50xTrainer printed-base calculation must use the observed source hand');
  return {
    schema:'rank11-QBall-counterfactual-plus-candidate-t50-Perfection-choice-v1',
    seed:SEED,sourceRank:11,enginePinned:plan.engineRevision,
    frozenDeckHashes:control.deckHashes,
    sourceQBallAudit:withReply.result.audit,
    candidateReplyAudit:withReply.result.result.policyAudit,
    baselineCounterfactual:afterTurn48(control),
    candidateOwnerReply:afterTurn48(reply),
    preTurn50RootActionsIdentical:true,
    restoredReplayIdentical:true,
    qualification:'Retrospective source selected seed and controlled owner choice. Not qualified competitive evidence',
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,withTurn50OwnerPerfectionReply};
