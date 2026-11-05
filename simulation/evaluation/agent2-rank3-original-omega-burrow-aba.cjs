'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=
  require('../twinleaf/headless.cjs');
const {originals}=
  require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-original-rank3-owner-omega-barrage-natural-aba-v1';
const SOURCE_SEAT=0, SEED=290134, ACTION_LIMIT=260;
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const HISTORICAL_FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const HISTORICAL_SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const native=moduleName=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',moduleName));
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Default-off, source-seat-specific opt-in under a frozen native experiment.
 * It reads only the owner's visible Bunnelby/Energy, own prompt, recorded
 * public Burrow declaration and the opponent's public deck *count*.
 * It changes an existing native optional Ω Barrage choice and its genuine
 * follow-up native ChooseAttackPrompt. No deck identities are examined.
 *
 * @template T
 * @param {()=>T} execute Native game, under the same selected root policy.
 * @param {{minimumTurn?:number}} [options] Optional lower global turn for A/B interventions.
 * @returns {{result:T,audit:object}} Real source-owner prompts selected.
 */
function withOwnedBunnelbySecondBurrow(execute,{minimumTurn=0}={}){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {GameMessage}=native('game/game-message');
  const originalDecision=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  let markedBurrowTurn=null;
  const audit={
    feature:'source-visible-Bunnelby-PRC-Omega-Barrage-second-Burrow-v1',
    sourceSeat:SOURCE_SEAT,markedBurrowRoots:0,eligibleConfirmPrompts:0,
    acceptedOmegaConfirmPrompts:0,chosenSecondBurrowPrompts:0,
    selectedConfirmTurnNumbers:[],selectedSecondAttackTurns:[],
    ownerOnly:true,competitiveQualifiedGames:0
  };
  const observedDispatch=function observeSourceBurrow(action,...args){
    const state=this.state;
    if(state.turn>=minimumTurn&&state.players.length===2&&
       state.activePlayer===SOURCE_SEAT&&
       action.constructor.name==='AttackAction'&&action.name==='Burrow'&&
       state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName==='Bunnelby PRC'){
      markedBurrowTurn=state.turn;
      audit.markedBurrowRoots++;
    }
    const result=originalDispatch.call(this,action,...args);
    if(markedBurrowTurn!==null&&this.state.turn!==markedBurrowTurn)
      markedBurrowTurn=null;
    return result;
  };
  const ownedPrompt=function chooseOmegaWithPrintedBurrow(state,...args){
    const prompt=state.prompts.find(p=>p.result===undefined);
    const source=state.players[SOURCE_SEAT];
    const active=source?.active.getPokemonCard();
    const eligible=prompt&&prompt.playerId===source.id&&
      state.turn===markedBurrowTurn&&
      active?.fullName==='Bunnelby PRC'&&
      source.active.energies.cards.some(c=>
        c.fullName==='Water Energy MEE')&&
      state.players[1-SOURCE_SEAT].deck.cards.length>0;
    if(eligible&&prompt.constructor.name==='ConfirmPrompt'&&
        prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      audit.eligibleConfirmPrompts++;
      assert.equal(prompt.validate(true),true);
      audit.acceptedOmegaConfirmPrompts++;
      audit.selectedConfirmTurnNumbers.push(state.turn);
      return new ResolvePromptAction(prompt.id,true);
    }
    if(eligible&&prompt.constructor.name==='ChooseAttackPrompt'&&
        prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
      const printed=prompt.cards.find(c=>c.fullName==='Bunnelby PRC');
      const burrow=printed?.attacks.find(attack=>attack.name==='Burrow');
      assert.ok(burrow,'Native second attack must offer printed Burrow');
      assert.equal(prompt.validate(burrow),true);
      audit.chosenSecondBurrowPrompts++;
      audit.selectedSecondAttackTurns.push(state.turn);
      return new ResolvePromptAction(prompt.id,burrow);
    }
    return originalDecision.call(this,state,...args);
  };
  Store.prototype.dispatch=observedDispatch;
  SimpleTacticsAi.prototype.decodeNextAction=ownedPrompt;
  try{
    return {result:execute(),audit};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,ownedPrompt);
    SimpleTacticsAi.prototype.decodeNextAction=originalDecision;
    assert.equal(Store.prototype.dispatch,observedDispatch);
    Store.prototype.dispatch=originalDispatch;
  }
}

/**
 * Preserve actual Store winner, attack settlement and source/opponent replies.
 * Every attempted variant uses the identical registered seed, original prints,
 * starting physical seats and opponent root policy.
 * @param {'control'|'treatment'|'control-repeat'} variant
 * @param {{source:string[],candidate:string[]}} cards
 * @returns {object}
 */
function runArm(variant,cards){
  const request={
    deckA:cards.source,deckB:cards.candidate,seed:SEED,
    maxActions:ACTION_LIMIT,label:'agent2-omega-natural-'+variant,
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
    let omega=null;
    const simulated=()=>{
      const execute=()=>withSameTargetAttachEnergySelection(
        ()=>runMatch(request)).result;
      if(variant!=='treatment')return execute();
      const observed=withOwnedBunnelbySecondBurrow(execute);
      omega=observed.audit;
      return observed.result;
    };
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(simulated,{
        root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true}));
    const game=guarded.result.result;
    const sourceAttacks=game.attackDeclarationTrace.filter(row=>
      row.playerSlot===SOURCE_SEAT&&row.attackName==='Burrow');
    const sourceTransitions=(game.publicAttackTransitions??[]).filter(row=>
      row.triggerPlayerSlot===SOURCE_SEAT&&
      row.declarations.some(declaration=>declaration.attackName==='Burrow'));
    const opponentAttacks=game.attackDeclarationTrace.filter(row=>
      row.playerSlot===1-SOURCE_SEAT).map(row=>({
        globalTurn:row.turnBefore,attackName:row.attackName,
        actionOrdinal:row.actionOrdinal
      }));
    const final=game.terminalTransition?.after??null;
    return {
      variant,status:game.finished?'native-terminal':'native-cap',
      fullInitialPhysicalDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceInitialDealSha256:
        game.initialSourceDealFingerprint?.digestSha256??null,
      nativeWinner:game.winner,nativeActionCount:game.actions,
      finalTurn:game.turns,engineEndReason:game.endReason,
      nativeRootLedgerSha256:digest(game.rootActionLedger),
      nativeBurrowDeclarations:sourceAttacks.length,
      nativeBurrowDeclarationTurns:sourceAttacks.map(row=>row.turnBefore),
      nativeBurrowSettledTransitions:sourceTransitions.filter(row=>
        row.settled!==null).length,
      nativeOpponentAttackSequence:opponentAttacks,
      finalPublicDeckCounts:final?.players?.map(p=>p.deckRemaining)??null,
      finalPublicPrizeCounts:final?.players?.map(p=>p.prizesRemaining)??null,
      terminalTransition:game.terminalTransition??null,
      sourceAttackSettlementSamples:sourceTransitions.map(row=>({
        actionOrdinal:row.actionOrdinal,
        sourceTurn:row.turnBefore,
        opponentDeckRemainingAfter:
          row.settled?.deckRemaining?.[1-SOURCE_SEAT]??null
      })),
      omega,
      competitivelyQualified:false
    };
  }catch(error){
    return {variant,status:'native-error',
      error:String(error?.stack??error).slice(0,3500),
      competitivelyQualified:false};
  }
}

/** @returns {object} Frozen matched natural physical deal A/B/A evidence. */
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
    const variants=['control','treatment','control-repeat'];
    const arms=variants.map(variant=>runArm(variant,cards));
    const [a,b,again]=arms;
    const valid=arms.every(row=>row.status!=='native-error'&&
      row.fullInitialPhysicalDealSha256===HISTORICAL_FULL_DEAL&&
      row.sourceInitialDealSha256===HISTORICAL_SOURCE_DEAL);
    const repeated=valid&&a.status===again.status&&
      a.nativeWinner===again.nativeWinner&&
      a.nativeActionCount===again.nativeActionCount&&
      a.nativeRootLedgerSha256===again.nativeRootLedgerSha256;
    return {
      schema:VERSION,sourceRank:3,referenceRank:1,
      sourceSeat:SOURCE_SEAT,nativePin:PIN,
      convertedSourceSha256:digest(cards.source),
      convertedReferenceSha256:digest(cards.candidate),
      frozenSeed:SEED,registeredArms:variants,
      controls:{sameHistoricalFullPhysicalDeal:valid,
        repeatedControlLedgerIdentical:repeated,
        historicalSourceWinner:a.nativeWinner===SOURCE_SEAT,
        baselineFinalActions:a.nativeActionCount,
        treatmentFinalActions:b.nativeActionCount,
        treatmentSelectedGenuineOmega:
          b.omega?.acceptedOmegaConfirmPrompts>0&&
          b.omega?.chosenSecondBurrowPrompts>0,
        treatmentTerminal:b.status==='native-terminal',
        competentOpponentAdmitted:false,
        competitivelyQualifiedGames:0},
      arms,
      limitation:'One source-specific owner-visible prompt intervention on an already favorable historical physical deal, unqualified opponent and paper clock. Earlier terminal is not a new win and treatment is not a competitive win-rate sample.'
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(data.arms.some(row=>row.status==='native-error')||
    !data.controls.sameHistoricalFullPhysicalDeal||
    !data.controls.repeatedControlLedgerIdentical)
    process.exitCode=1;
}
module.exports={VERSION,SEED,SOURCE_SEAT,withOwnedBunnelbySecondBurrow,runArm,run};
