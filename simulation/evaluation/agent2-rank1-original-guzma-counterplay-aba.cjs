'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
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
const {nativeSinglePokemonChoices}=
  require('../twinleaf/agent8-actor-only-choose-pokemon.cjs');

const VERSION='agent2-original-rank1-held-guzma-vs-bunnelby-aba-v2-optional-vmax';
const SEED=290134,SOURCE_SEAT=0,OPPONENT_SEAT=1,INTERVENTION_TURN=3;
const ORIGINAL_FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const ORIGINAL_SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));
const hash=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * One no-hidden-info, actual print Guzma owner action and two native prompts.
 * The owner has the literal BUS Guzma in hand on its Turn3 in the registered
 * original 60 physical game, with Bunnelby Active and a Benched Snorlax.
 * The opposing target and own switched Pokémon must be present in the
 * native pending prompt and accepted by native validation.
 *
 * This variant tests one credible tactical counterline only, not an
 * optimized symmetric opponent strategy. Other actions remain canonical.
 *
 * @template T
 * @param {()=>T} execute Original native matchup, unchanged actual cards.
 * @returns {{result:T,audit:object}}
 */
function withRank1HeldGuzmaCounterplay(execute,{evolveVmax=false}={}){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const audit={
    feature:VERSION,registeredOwnerTurn:INTERVENTION_TURN,
    changedGuzmaOwnerRoots:0,
    nativeOpponentSnorlaxGustPromptChoices:0,
    nativeSelfShadowRiderSwitchPromptChoices:0,
    proposedGuzmaOwnHandCount:0,
    originalOwnerPromptValidation:true,
    rank1LiveOwnerVmaxHeldAfterGuzma:[],
    rank3NativeOwnerRescuePassEvidence:[],
    enabledEvolutionTreatment:evolveVmax,
    selectedNativeVmaxEvolutionRoot:0,
    vmaxEvolutionReceipts:[],
    ownerOnly:true,
    completelyQualifiedGames:0,
    receipts:[]
  };
  let selectedTurn=null;
  let selectedVmaxEvolutionTurn=null;
  const decoder=function ownerGuzmaAndTruePrompt(state,...args){
    const owner=state.players[OPPONENT_SEAT];
    const pending=state.prompts.find(p=>p.result===undefined);
    if(selectedTurn!==null && state.turn>INTERVENTION_TURN &&
       state.activePlayer===OPPONENT_SEAT && !pending &&
       owner.active.getPokemonCard()?.fullName==='Shadow Rider Calyrex V CRE'){
      const held=owner.hand.cards.filter(c=>
        c.name==='Shadow Rider Calyrex VMAX');
      if(held.length>0 && !audit.rank1LiveOwnerVmaxHeldAfterGuzma.some(x=>
        x.globalTurn===state.turn)){
        audit.rank1LiveOwnerVmaxHeldAfterGuzma.push({
          globalTurn:state.turn,
          ownHandVmaxCopies:held.length,
          ownedVmaxPrintings:held.map(c=>c.fullName),
          printedActive:owner.active.getPokemonCard()?.fullName,
          activePsychicEnergyCards:owner.active.energies.cards.filter(c=>
            c.name==='Psychic Energy').length,
          ownSupporterTurn:owner.supporterTurn,
          opponentPublicActive:
            state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName,
          ownerDeckCount:owner.deck.cards.length,
          ownerBenchCount:owner.bench.filter(x=>x.cards.length>0).length
        });
      }
    }
    // One preregistered 29th global turn actual own-hand evolution after
    // the genuine turn3 Guzma. Always use the native evolution reducer.
    if(evolveVmax && selectedTurn!==null &&
       selectedVmaxEvolutionTurn===null &&
       !pending&&state.turn===29&&state.activePlayer===OPPONENT_SEAT&&
       owner.active.getPokemonCard()?.fullName==='Shadow Rider Calyrex V CRE'&&
       owner.active.pokemonPlayedTurn!==state.turn){
      const index=owner.hand.cards.findIndex(c=>
        c.fullName==='Shadow Rider Calyrex VMAX CRE');
      if(index>=0){
        selectedVmaxEvolutionTurn=state.turn;
        audit.selectedNativeVmaxEvolutionRoot++;
        audit.vmaxEvolutionReceipts.push({
          globalTurn:state.turn,ownerHandIndex:index,
          genuinePrinting:owner.hand.cards[index].fullName,
          ownActiveBefore:owner.active.getPokemonCard().fullName,
          attachedPsychicEnergyBefore:owner.active.energies.cards.filter(
            c=>c.name==='Psychic Energy').length,
          selectedNativeAction:'PlayCardAction',
          selectedNativeTarget:'owner Active Spot'
        });
        return new PlayCardAction(owner.id,index,{
          player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.ACTIVE,index:0
        });
      }
    }
    if(selectedTurn===INTERVENTION_TURN && state.turn===INTERVENTION_TURN &&
       pending?.constructor.name==='ChoosePokemonPrompt' &&
       pending.playerId===owner.id){
      const choices=nativeSinglePokemonChoices(state,pending);
      const opponent=choices.filter(c=>c.seat===SOURCE_SEAT &&
        c.zone==='bench');
      const self=choices.filter(c=>c.seat===OPPONENT_SEAT&&
        c.zone==='bench');
      const target=opponent.length>0 && self.length===0?
        opponent.find(c=>c.physical.getPokemonCard()?.fullName==='Snorlax PGO'):
        self.length>0&&opponent.length===0?
          self.find(c=>c.physical.getPokemonCard()?.fullName==='Shadow Rider Calyrex V CRE'):
          null;
      if(target){
        assert.equal(pending.validate([target.physical],state),true);
        const side=target.seat===SOURCE_SEAT?'opponent':'self';
        if(side==='opponent')
          audit.nativeOpponentSnorlaxGustPromptChoices++;
        else audit.nativeSelfShadowRiderSwitchPromptChoices++;
        audit.receipts.push({
          globalTurn:state.turn,promptId:pending.id,
          selectedSide:side,printedPokemon:target.physical.getPokemonCard().fullName,
          legalChoiceCount:choices.length,
          selectedBenchIndex:target.index
        });
        return new ResolvePromptAction(pending.id,[target.physical]);
      }
    }
    if(!pending&&selectedTurn===null&&state.turn===INTERVENTION_TURN &&
       state.activePlayer===OPPONENT_SEAT &&
       state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName==='Bunnelby PRC'){
      const hand=owner.hand.cards;
      const index=hand.findIndex(c=>c.fullName==='Guzma BUS');
      const theirSnorlax=state.players[SOURCE_SEAT].bench.some(slot=>
        slot.getPokemonCard()?.fullName==='Snorlax PGO');
      const ownV=owner.bench.some(slot=>
        slot.getPokemonCard()?.fullName==='Shadow Rider Calyrex V CRE');
      if(index>=0 && theirSnorlax && ownV &&
         owner.supporterTurn!==state.turn &&
         !owner.cannotPlaySupporterCards){
        audit.changedGuzmaOwnerRoots++;
        audit.proposedGuzmaOwnHandCount=hand.length;
        selectedTurn=INTERVENTION_TURN;
        audit.receipts.push({
          globalTurn:state.turn,ownerHandIndex:index,
          playedPrinting:hand[index].fullName,
          beforeOwnActive:owner.active.getPokemonCard()?.fullName,
          beforeOpponentActive:state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName
        });
        return new PlayCardAction(owner.id,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
      }
    }
    const owner=state.players[SOURCE_SEAT];
    const nativeProposal=original.call(this,state,...args);
    if(selectedTurn!==null && !pending &&
       state.activePlayer===SOURCE_SEAT &&
       nativeProposal?.constructor.name==='PassTurnAction' &&
       owner.active.getPokemonCard()?.name==='Snorlax' &&
       owner.bench.some(slot=>slot.getPokemonCard()?.name==='Bunnelby')){
      const ownerHand=owner.hand.cards.map(c=>c.fullName);
      const recoverable=ownerHand.filter(c=>
        /^(Float Stone|Guzma|Scoop Up Cyclone|Escape Rope|Switch|VS Seeker) /.test(c));
      audit.rank3NativeOwnerRescuePassEvidence.push({
        globalTurn:state.turn,
        nativeChosen:'PassTurnAction',
        ownerActive:owner.active.getPokemonCard()?.fullName??null,
        ownerActiveEnergy:owner.active.energies.cards.map(c=>c.fullName),
        ownerActiveTool:owner.active.tools.cards.map(c=>c.fullName),
        benchFundedBunnelby:owner.bench.some(slot=>
          slot.getPokemonCard()?.fullName==='Bunnelby PRC'&&
          slot.energies.cards.length>0),
        ownerHandCount:ownerHand.length,
        ownerHandRescueCandidates:recoverable,
        ownerSupporterTurn:owner.supporterTurn,
        ownerCannotPlaySupporterCards:owner.cannotPlaySupporterCards,
        ownerCannotPlayItemCards:owner.cannotPlayItemCards,
        rank1HasBenchedPokemon:state.players[OPPONENT_SEAT].bench.some(
          slot=>slot.getPokemonCard()!==undefined)
      });
    }
    return nativeProposal;
  };
  SimpleTacticsAi.prototype.decodeNextAction=decoder;
  try{
    return {result:execute(),audit};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decoder);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/**
 * Every arm shares the identical original 60s, physical initial deal, and
 * selected canonical root and printed-prompt rules.
 * @param {'control'|'guzma'|'control-repeat'} arm
 * @param {{source:string[],candidate:string[]}} cards
 * @returns {object}
 */
function runArm(arm,cards){
  const request={
    deckA:cards.source,deckB:cards.candidate,seed:SEED,
    maxActions:520,label:'agent2-native-original-rank1-held-guzma-'+arm,
    strictPromptValidation:true,mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureNativeAbortEvidence:true,
    captureFinalPublicBoard:true
  };
  try{
    let tacticalAudit=null;
    const execute=()=>{
      const unchanged=()=>withSameTargetAttachEnergySelection(
        ()=>runMatch(request)).result;
      if(arm!=='guzma'&&arm!=='guzma+vmax')return unchanged();
      const treated=withRank1HeldGuzmaCounterplay(unchanged,{
        evolveVmax:arm==='guzma+vmax'
      });
      tacticalAudit=treated.audit;
      return treated.result;
    };
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(execute,{
        root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true}));
    const game=guarded.result.result;
    const sourceAttacks=game.attackDeclarationTrace.filter(
      d=>d.playerSlot===SOURCE_SEAT);
    const opponentAttacks=game.attackDeclarationTrace.filter(
      d=>d.playerSlot===OPPONENT_SEAT);
    const actualGuzmaRoots=game.rootActionLedger.filter(x=>
      x.playerSlot===OPPONENT_SEAT&&
      x.action==='PlayCardAction'&&x.card==='Guzma');
    return {
      arm,status:game.finished?'native-terminal':'native-cap',
      fullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceDeal:game.initialSourceDealFingerprint?.digestSha256??null,
      winner:game.winner,turns:game.turns,actions:game.actions,
      rootLedgerSha256:hash(game.rootActionLedger),
      originalRank1ActualGuzmaRoots:actualGuzmaRoots.length,
      originalRank1ActualGuzmaRootActions:actualGuzmaRoots,
      rank3ActualBurrowCount:sourceAttacks.filter(x=>
        x.attackName==='Burrow').length,
      rank1FilchCount:opponentAttacks.filter(x=>
        x.attackName==='Filch').length,
      rank1OtherAttacks:opponentAttacks.filter(x=>
        x.attackName!=='Filch').map(x=>x.attackName),
      registeredRootTurn3ActualSourceActions:game.rootActionLedger.filter(x=>
        x.turnBefore===3),
      originalRank3OwnerMeaningfulRootTimeline:game.rootActionLedger.filter(x=>
        x.playerSlot===SOURCE_SEAT&&
        ['PlayCardAction','AttackAction','RetreatAction','PassTurnAction']
          .includes(x.action)),
      originalRank1OwnerMeaningfulRootTimeline:game.rootActionLedger.filter(x=>
        x.playerSlot===OPPONENT_SEAT&&
        ['PlayCardAction','AttackAction','RetreatAction','PassTurnAction']
          .includes(x.action)),
      originalSourcePassBoardTimeline:(game.decisionTrace??[]).filter(x=>
        x.playerSlot===SOURCE_SEAT&&x.action==='PassTurnAction'&&
        x.turnBefore>=INTERVENTION_TURN
      ).map(x=>({
        globalTurn:x.turnBefore,
        sourceActive:x.publicBoardBeforePass?.[SOURCE_SEAT]?.active??null,
        sourceBench:x.publicBoardBeforePass?.[SOURCE_SEAT]?.bench??[],
        rank1Active:x.publicBoardBeforePass?.[OPPONENT_SEAT]?.active??null,
        remainingPrizes:x.prizesAfter,
        remainingDeckCards:x.decksAfter
      })),
      actualFinalPublicBoard:game.finalPublicBoard??null,
      terminalTransition:game.terminalTransition??null,
      tacticalAudit,competitivelyQualified:false
    };
  }catch(error){
    return {arm,status:'native-error',
      error:String(error?.stack??error).slice(0,3600),
      competitivelyQualified:false};
  }
}

/** @returns {object} Frozen owner-visible original Guzma counterplay A/B/A. */
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
    const includeVmax=process.env.AGENT2_INCLUDE_VMAX_ABCA==='true';
    const registered=includeVmax?
      ['control','guzma','guzma+vmax','control-repeat']:
      ['control','guzma','control-repeat'];
    const arms=registered.map(arm=>runArm(arm,cards));
    const a=arms[0],b=arms[1],again=arms[arms.length-1];
    const withVmax=includeVmax?arms[2]:null;
    const valid=arms.every(x=>x.status!=='native-error'&&
      x.fullDeal===ORIGINAL_FULL_DEAL&&
      x.sourceDeal===ORIGINAL_SOURCE_DEAL);
    const repeated=valid&&a.status===again.status&&
      a.winner===again.winner&&a.actions===again.actions&&
      a.rootLedgerSha256===again.rootLedgerSha256;
    return {
      schema:VERSION,sourceRank:3,opponentRank:1,seed:SEED,
      sourceSeat:SOURCE_SEAT,opponentSeat:OPPONENT_SEAT,
      nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      originalSourceConvertedSha256:hash(cards.source),
      originalOpponentConvertedSha256:hash(cards.candidate),
      registeredArms:registered,
      controls:{
        exactOriginalPhysicalOpeningAllArms:valid,
        repeatedControlExactRootLedger:repeated,
        actualOriginalGuzmaNativeRoot:b.originalRank1ActualGuzmaRoots>0,
        nativeBothGuzmaPromptChoices:
          b.tacticalAudit?.nativeOpponentSnorlaxGustPromptChoices>0&&
          b.tacticalAudit?.nativeSelfShadowRiderSwitchPromptChoices>0,
        optionalVmaxNativeEvolutionAccepted:includeVmax?
          withVmax?.tacticalAudit?.selectedNativeVmaxEvolutionRoot>0:
          null,
        competitiveQualifiedGames:0
      },
      arms,
      interpretationLimits:
        'Single historical original deal with one owner-legal held Guzma response and real opponent and own switch prompts. This does not optimize rank1, certify every paper mechanic, or estimate field win rate.'
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const evidence=run();
  process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
  if(evidence.arms.some(x=>x.status==='native-error')||
    !evidence.controls.exactOriginalPhysicalOpeningAllArms||
    !evidence.controls.repeatedControlExactRootLedger||
    !evidence.controls.actualOriginalGuzmaNativeRoot||
    !evidence.controls.nativeBothGuzmaPromptChoices||
    (process.env.AGENT2_INCLUDE_VMAX_ABCA==='true'&&
      !evidence.controls.optionalVmaxNativeEvolutionAccepted))
    process.exitCode=1;
}
module.exports={VERSION,run,withRank1HeldGuzmaCounterplay};
