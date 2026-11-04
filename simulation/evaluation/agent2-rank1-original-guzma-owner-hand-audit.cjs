'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-rank1-original-guzma-owner-window-audit-v1';
const SEED=290134,SOURCE_SEAT=0,OPPONENT_SEAT=1;
const FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const hash=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Read-only capture of genuine rank1 source-owner Guzma access. The observer
 * reads its own hand/discard and both public in-play boards, never any
 * concealed opposing cards. It runs BEFORE the existing bot's speculative
 * scoring. Nothing is changed in either bot or the native Store.
 * @template T
 * @param {()=>T} execute Actual native unchanged original-vs-original game.
 * @returns {{result:T,decisions:object[]}}
 */
function withOriginalRank1GuzmaWindowObservation(execute){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const decisions=[];
  const observer=function observeOpponentOwnGuzma(state,...args){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending&&state.activePlayer===OPPONENT_SEAT&&
       state.players[SOURCE_SEAT].active.getPokemonCard()?.name==='Bunnelby'){
      const player=state.players[OPPONENT_SEAT];
      const ownHand=player.hand.cards.map(c=>c.fullName);
      const ownDiscard=player.discard.cards.map(c=>c.fullName);
      const direct=ownHand.filter(c=>c==='Guzma BUS').length;
      const seeker=ownHand.filter(c=>c==='VS Seeker ROS').length;
      const graveGuzma=ownDiscard.filter(c=>c==='Guzma BUS').length;
      const ownerBench=player.bench.map(slot=>
        slot.getPokemonCard()?.fullName??null).filter(Boolean);
      const sourceBench=state.players[SOURCE_SEAT].bench.map(slot=>
        slot.getPokemonCard()?.fullName??null).filter(Boolean);
      if(direct||seeker){
        const before={
          globalTurn:state.turn,
          ownActive:player.active.getPokemonCard()?.fullName??null,
          ownActiveEnergy:player.active.energies.cards.map(c=>c.fullName),
          sourceActive:state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName??null,
          sourceActiveEnergy:state.players[SOURCE_SEAT].active.energies.cards.map(c=>c.fullName),
          ownBench:ownerBench,sourceBench,
          directGuzmaCopiesInOwnHand:direct,
          vsSeekerCopiesInOwnHand:seeker,
          guzmaCopiesInOwnDiscard:graveGuzma,
          ownSupporterTurn:player.supporterTurn,
          ownCannotPlaySupporterCards:player.cannotPlaySupporterCards,
          ownHandCount:ownHand.length,
          opponentPublicDeckCount:state.players[SOURCE_SEAT].deck.cards.length,
          ownPublicDeckCount:player.deck.cards.length,
          ownHandSha256:hash(ownHand),
          ownHeldOtherTacticalCards:ownHand.filter(x=>
            /Guzma|VS Seeker|Float Stone|Mysterious Treasure|Fog Crystal/.test(x))
        };
        const action=original.call(this,state,...args);
        decisions.push({...before,
          proposedAction:action?.constructor.name??null,
          proposedCard:action?.constructor.name==='PlayCardAction'?
            ownHand[action.handIndex]??null:null,
          paperGuzmaOpportunity:state.turn>1&&direct>0&&
            sourceBench.length>0&&ownerBench.length>0&&
            player.supporterTurn!==state.turn&&
            !player.cannotPlaySupporterCards});
        return action;
      }
    }
    return original.call(this,state,...args);
  };
  SimpleTacticsAi.prototype.decodeNextAction=observer;
  try{
    return {result:execute(),decisions};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,observer);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/** @returns {object} One frozen original source physical deal and retrospective owner evidence. */
function run(){
  initializeCards();
  const cards=originals();
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>
        withOriginalRank1GuzmaWindowObservation(()=>
          withSameTargetAttachEnergySelection(()=>runMatch({
            deckA:cards.source,deckB:cards.candidate,
            seed:SEED,maxActions:260,
            label:'agent2-rank1-original-guzma-owner-only-natural-windows',
            strictPromptValidation:true,
            mandatoryOptionFallback:true,
            enforceSelectOptionLegality:true,
            enforceVisiblePlayLockBothSeats:true,
            captureInitialFullPhysicalDeal:true,
            captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
            captureDecisionTrace:true,
            capturePublicAttackTransitions:true,
            captureNativeAbortEvidence:true,
            captureFinalPublicBoard:true
          })).result),{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })
        },{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const {result:game,decisions}=guarded.result.result;
    const controls={
      sameHistoricalFullDeal:
        game.initialFullPhysicalDealFingerprint?.digestSha256===FULL_DEAL,
      sameHistoricalSourceDeal:
        game.initialSourceDealFingerprint?.digestSha256===SOURCE_DEAL,
      sameNativeWinnerAndActions:
        game.finished&&game.winner===SOURCE_SEAT&&game.actions===133,
      originalOpponentFilch:
        game.attackDeclarationTrace.filter(x=>x.playerSlot===OPPONENT_SEAT&&
          x.attackName==='Filch').length===11,
      ownerInformationOnly:true,competitivelyQualifiedGames:0
    };
    return {
      schema:VERSION,seed:SEED,sourceRank:3,opponentRank:1,
      nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      sourceConvertedSha256:hash(cards.source),
      opponentConvertedSha256:hash(cards.candidate),
      controls,
      controlsPass:Object.entries(controls)
        .filter(([key])=>key!=='competitivelyQualifiedGames')
        .every(([,value])=>value===true),
      observations:decisions,
      observedGuzmaOwnerRootWindows:decisions.filter(x=>
        x.directGuzmaCopiesInOwnHand>0).length,
      observedPossiblePaperGuzmaWindows:decisions.filter(x=>
        x.paperGuzmaOpportunity).length,
      distinctSupportedGuzmaTurns:[...new Set(decisions.filter(x=>
        x.paperGuzmaOpportunity).map(x=>x.globalTurn))],
      opponentActualSourceTurnActions:game.rootActionLedger.filter(x=>
        x.playerSlot===OPPONENT_SEAT&&
        ['PlayCardAction','AttackAction','RetreatAction','PassTurnAction']
          .includes(x.action)),
      actualTerminal:game.terminalTransition??null,
      interpretation:'A pre-score owner-hand root observation. This is not proof that any Guzma line is optimal, available under all remaining restrictions, or changes the actual game. No treatment or new win.',
      competitivelyQualifiedGames:0
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  try{
    const evidence=run();
    process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
    if(!evidence.controlsPass)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      schema:VERSION,status:'native-error',
      error:String(error?.stack??error).slice(0,3500),
      competitivelyQualifiedGames:0},null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run,withOriginalRank1GuzmaWindowObservation};
