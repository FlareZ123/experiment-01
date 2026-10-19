'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');
const restoreLoader = installStateScopedCopySessionLoader();
try {
  const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const load = name => require(path.join(output,name));
  const {Store} = load('game/store/store');
  const {resolveManifestFile} = require('./resolve-field.cjs');
  const {runMatch} = require('./headless.cjs');
  const {installDecisionBoundaryCardObserver} =
    require('./bot-decision-card-boundary-observer.cjs');
  const {publicBoardSnapshot} = require('./public-board-telemetry.cjs');
  const manifest = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank = new Map(manifest.decks.map(x=>[x.rank,x]));
  const rank10 = byRank.get(10), champion = byRank.get(1);
  assert.ok(rank10?.playableUnderEngine && champion?.playableUnderEngine);
  const request = {
    deckA:rank10.cardIds,
    deckB:champion.cardIds,
    seed:4246551499,
    maxActions:350,
    label:'agent12-first-source-copied-effect-reply',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,
    doubleDragonRecovery:true,
    doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  /** @param {object} game @returns {string} */
  function digest(game) {
    return crypto.createHash('sha256').update(JSON.stringify({
      first:game.firstTurnSlot,
      root:game.rootActionLedger,
      attacks:game.attackDeclarationTrace,
      terminal:game.terminalTransition,
      prizes:game.prizesRemaining,
      finished:game.finished,
      actions:game.actions,
      winner:game.winner,
      decision:game.decisionTrace
    })).digest('hex');
  }
  /**
   * Record only the first real Store, recognized by AddPlayerAction. Every
   * root action is read immediately before and after the genuine dispatch,
   * once the policy already selected its action. No observer state or hidden
   * opponent cards enter either bot decision.
   *
   * @template T
   * @param {()=>T} work
   * @returns {{game:T,roots:object[]}}
   */
  function withReadOnlyLiveStoreSnapshots(work) {
    const previous = Store.prototype.dispatch;
    let live = null;
    let ordinal = -2;
    const roots = [];
    function observedDispatch(action,...args) {
      if (live===null && action?.constructor?.name==='AddPlayerAction') {
        live=this;
      }
      if (this!==live) return previous.call(this,action,...args);
      const currentOrdinal=ordinal++;
      const before = currentOrdinal>=0?{
        turn:this.state.turn,
        board:publicBoardSnapshot(this.state),
        prizes:this.state.players.map(p=>
          p.prizes.filter(prize=>prize.cards.length>0).length),
        logs:this.state.logs.length
      }:null;
      const actor=this.state.players[this.state.activePlayer];
      const passPerspective=currentOrdinal>=0 &&
        action.constructor.name==='PassTurnAction' && actor ? {
        actingSeat:this.state.activePlayer,
        actualTurn:this.state.turn,
        ownHandPrintings:actor.hand.cards.map(card=>card.fullName),
        enginePlayableHandPrintings:actor.hand.cards
          .filter(card=>actor.playableCardIds.includes(card.id))
          .map(card=>card.fullName),
        supporterChannelUnused:actor.supporterTurn!==this.state.turn,
        energyAttachmentChannelUnused:actor.energyPlayedTurn!==this.state.turn,
        retreatChannelUnused:actor.retreatedTurn!==this.state.turn,
        usedVSTAR:actor.usedVSTAR,
        ownActive:actor.active.getPokemonCard()?.fullName??null,
        activeEnergy:actor.active.energies.cards.map(card=>card.fullName)
      }:null;
      let failed=false;
      try {
        return previous.call(this,action,...args);
      } catch(error) {
        failed=true;
        throw error;
      } finally {
        if(currentOrdinal>=0) {
          roots.push({
            ordinal:currentOrdinal,
            action:action.constructor.name,
            failed,
            before,
            passPerspective,
            after:{
              turn:this.state.turn,
              board:publicBoardSnapshot(this.state),
              prizes:this.state.players.map(p=>
                p.prizes.filter(prize=>prize.cards.length>0).length),
              logs:this.state.logs.length
            }
          });
        }
      }
    }
    Store.prototype.dispatch=observedDispatch;
    try {
      return {game:work(),roots};
    } finally {
      if(Store.prototype.dispatch!==observedDispatch) {
        throw new Error('Live root observer lost Store.dispatch ownership');
      }
      Store.prototype.dispatch=previous;
    }
  }
  /** @param {object} snapshot @returns {object} */
  function compact(snapshot) {
    return {
      turn:snapshot.turn,
      prizes:snapshot.prizes,
      active:snapshot.board.map(p=>({
        name:p.active?.name??null,
        damage:p.active?.damage??null,
        energy:p.active?.energyCards??[],
        tools:p.active?.toolCards??[]
      })),
      bench:snapshot.board.map(p=>p.bench.map(z=>({
        name:z.name,damage:z.damage,tools:z.toolCards??[]
      }))),
      stadiums:snapshot.board.map(p=>p.stadium)
    };
  }
  const control=runMatch(request);
  const boundary=installDecisionBoundaryCardObserver();
  let observed;
  try {
    observed=withReadOnlyLiveStoreSnapshots(()=>runMatch(request));
  } finally {
    boundary.restore();
  }
  const game=observed.game;
  assert.equal(game.firstTurnSlot,1);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.actions,observed.roots.length);
  assert.ok(boundary.report.decisions>0,
    'Card observer must cover live source bot decisions');
  assert.equal(digest(control),digest(game),
    'Read-only live Store snapshots must preserve root choices and all compared outcome fields');
  const declarations=game.attackDeclarationTrace.filter(x=>
    x.playerSlot===0 && x.attackName==='Apex Dragon');
  assert.ok(declarations.length>=1,'Frozen rank10 source must use paid Apex Dragon');
  const target=declarations[0];
  const opening=game.rootActionLedger.find(row=>
    row.actionOrdinal===target.actionOrdinal);
  assert.ok(opening && opening.playerSlot===0);
  const nextOpponent=game.rootActionLedger.find(row=>
    row.playerSlot===1 && row.turnBefore>target.turnBefore &&
    row.action!=='ResolvePromptAction');
  assert.ok(nextOpponent,'Source-dealt copied attack must have a next opponent decision');
  const attackTurnActions=game.rootActionLedger.filter(row=>
    row.actionOrdinal>=target.actionOrdinal &&
    row.turnBefore===target.turnBefore);
  const selections=attackTurnActions.filter(row=>row.attackChoice);
  assert.ok(selections.length>0,
    'Actual copied attack must have printed source attack selection');
  const correspondingRoot=observed.roots.find(x=>
    x.ordinal===target.actionOrdinal);
  assert.ok(correspondingRoot);
  const reply=game.rootActionLedger.filter(row=>
    row.turnBefore===nextOpponent.turnBefore && row.playerSlot===1);
  assert.ok(reply.length>0);
  const relevantRoots=observed.roots.filter(row=>
    row.ordinal>=target.actionOrdinal &&
    row.ordinal<=reply.at(-1).actionOrdinal);
  const changedRoots=relevantRoots.filter(row=>
    JSON.stringify(compact(row.before))!==JSON.stringify(compact(row.after)));
  const evidence={
    schema:'source-rank10-copied-apex-effect-to-reply-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRanksByPhysicalSeat:[10,1],
    seed:request.seed,rank10ActuallySecond:true,
    immutableExactSources:true,
    rootObserverNoninterference:true,
    frozenControlDigest:digest(control),
    observerDigest:digest(game),
    sourceGame:{
      finished:game.finished,winner:game.winner,
      actions:game.actions,turns:game.turns,
      prizesRemaining:game.prizesRemaining
    },
    printedCopy:{
      declaration:target,
      declarationRoot:opening,
      selectedChoices:selections.map(row=>({
        ordinal:row.actionOrdinal,
        selection:row.attackChoice
      })),
      declarationBefore:compact(correspondingRoot.before),
      declarationAfter:compact(correspondingRoot.after),
      actionTurnRootEvents:attackTurnActions.map(row=>({
        ordinal:row.actionOrdinal,action:row.action,
        pendingPrompt:row.pendingPrompt,
        attackChoice:row.attackChoice??null
      }))
    },
    nextOpponent:{
      turn:nextOpponent.turnBefore,
      passPerspective:observed.roots.find(row=>
        row.ordinal===reply.find(event=>event.action==='PassTurnAction')?.actionOrdinal)
        ?.passPerspective??null,
      roots:reply.map(row=>({
        ordinal:row.actionOrdinal,action:row.action,
        card:row.card??null,attack:row.attack??null
      }))
    },
    changingPhysicalBoardRoots:changedRoots.slice(0,45).map(row=>({
      ordinal:row.ordinal,action:row.action,
      before:compact(row.before),after:compact(row.after)
    })),
    botDecisionCardBoundary:{
      ...boundary.report,
      scope:'Top-level live physical-zone Card scalars across synchronous bot decision only; excludes nested attachments and other live reducer effects'
    },
    rootObserverScope:{
      seen:observed.roots.length,
      effectStatus:'Physical public-board observation after real root actions; no independent attack-damage calculation',
      opponentPolicyQualified:false,paperRuleQualified:false,
      competitiveGameQualified:false
    }
  };
  console.log('SOURCE_COPY_EFFECT_REPLY',JSON.stringify(evidence,null,2));
} finally {
  restoreLoader();
}
