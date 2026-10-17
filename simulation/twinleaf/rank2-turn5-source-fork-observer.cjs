'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_PROFILE,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');
const {publicBoardSnapshot}=require('./public-board-telemetry.cjs');
const {decisionHandEvidence}=require('./decision-hand-evidence.cjs');
const {firstRecordedDecisionDifference}=
  require('./expanded-source-profile-pair.cjs');

const ENGINE_OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const SEED=20261023;
const TARGETS=new Set(['Guzma & Hala','Bellelba & Brycen-Man']);

/**
 * Capture only information available to the acting physical seat, together
 * with public in-play/visible discard data. Never read Prize identities,
 * remaining deck card order or the opposing hand contents.
 * @param {object} state Pinned actual Store state, before bot decision.
 * @param {0|1} seat
 * @returns {object}
 */
function visibleSourceDecisionContext(state,seat) {
  const p=state.players[seat];
  return {
    turn:state.turn,activePlayer:state.activePlayer,
    ownHand:decisionHandEvidence(state,seat),
    publicBoard:publicBoardSnapshot(state),
    ownDiscard:p.discard.cards.map(c=>c.fullName),
    ownLostZone:p.lostzone.cards.map(c=>c.fullName),
    ownSupporter:p.supporter.cards.map(c=>c.fullName),
    supporterTurn:p.supporterTurn,
    ownDeckCount:p.deck.cards.length,
    ownFaceDownPrizeCount:p.prizes.filter(slot=>slot.cards.length).length
  };
}

/**
 * Observe real headless root bot calls before proposing Supporter actions.
 * The identity of the chosen card is read from the pre-action hand, and
 * observational code has no influence on actions, prompts or RNG.
 * @template T
 * @param {(capture:object[])=>T} fn
 * @returns {T}
 */
function withSourceForkObserver(fn) {
  const {SimpleTacticsAi}=require(path.join(
    ENGINE_OUTPUT,'simple-bot/simple-tactics-ai'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const capture=[];
  SimpleTacticsAi.prototype.decodeNextAction=function(state) {
    const relevant=state.turn===5 && state.activePlayer===1 &&
      !state.prompts.some(p=>p.result===undefined);
    const before=relevant?visibleSourceDecisionContext(state,1):null;
    const action=original.call(this,state);
    if(relevant && action?.constructor.name==='PlayCardAction'){
      const card=before.ownHand.ownHandPrintings[action.handIndex]??null;
      const baseName=card?.replace(/ (?:CEC|CEC\d+)$/,'')||'';
      if(TARGETS.has(baseName)){
        capture.push({card,actionType:action.constructor.name,before});
      }
    }
    return action;
  };
  try {
    return fn(capture);
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/**
 * Compare both original source bot policies at the previously exposed turn5
 * first recorded fork. Does not assert full root Store equivalence.
 * @param {{maxActions?:number}} [request]
 * @returns {object}
 */
function runTurn5ForkObserver({maxActions=90}={}) {
  if(!Number.isInteger(maxActions)||maxActions<70) {
    throw new Error('Need at least 70 actions to reach sourced fork');
  }
  const field=resolveManifestFile(
    path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const rank1=byRank.get(1),rank2=byRank.get(2);
  if(!rank1?.playableUnderEngine||!rank2?.playableUnderEngine){
    throw Error('Both fixed source 60s must resolve under pinned engine');
  }
  const profiles=[EXPANDED_PROFILE,EXPANDED_SOURCE_PROFILE];
  const arms=profiles.map(profile=>withSourceForkObserver(capture=>{
    const game=runWithResearchProfile({
      deckA:rank1.cardIds,deckB:rank2.cardIds,
      seed:SEED,maxActions,strictPromptValidation:true,
      captureDecisionTrace:true,
      label:'Source rank2 first mover, turn5 pre-Supporter fork observer'
    },profile);
    const fork=game.decisionTrace.find(event=>
      event.turnBefore===5&&event.playerSlot===1&&
      event.action==='PlayCardAction'&&TARGETS.has(event.card));
    const ownDeckSearchesBeforeFork=game.decisionTrace.filter(event=>
      event.actionOrdinal<fork?.actionOrdinal&&event.playerSlot===1&&
      event.cardSelection?.sourceZone==='deck').map(event=>({
      actionOrdinal:event.actionOrdinal,
      selectedCards:event.cardSelection.selectedCards
    }));
    return {
      profile,sourceDeckHashes:game.deckHashes,firstTurnSlot:game.firstTurnSlot,
      verifiedByDrawLog:game.verifiedByDrawLog,actions:game.actions,
      fork:fork?{actionOrdinal:fork.actionOrdinal,turn:fork.turnBefore,
        playerSlot:fork.playerSlot,card:fork.card}:null,
      capture,ownDeckSearchesBeforeFork,
      meaningfulPrefix:fork?game.decisionTrace
        .filter(e=>e.actionOrdinal<=fork.actionOrdinal)
        .map(e=>({
          actionOrdinal:e.actionOrdinal,turnBefore:e.turnBefore,
          playerSlot:e.playerSlot,action:e.action,card:e.card??null,
          attack:e.attack??null,
          optionSelection:e.optionSelection,
          cardSelection:e.cardSelection
        })):null
    };
  }));
  const [a,b]=arms;
  return {
    study:'rank2 first-source Supporter fork owner-visible root snapshot',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed:SEED,rank2Seat:1,profiles,
    identicalSourceDeckHashes:
      JSON.stringify(a.sourceDeckHashes)===JSON.stringify(b.sourceDeckHashes),
    identicalFirstTurn:a.firstTurnSlot===b.firstTurnSlot,
    samePredecisionVisibleSnapshot:
      a.capture.length===1&&b.capture.length===1&&
      JSON.stringify(a.capture[0].before)===JSON.stringify(b.capture[0].before),
    firstRecordedMeaningfulDifference:firstRecordedDecisionDifference(
      a.meaningfulPrefix||[],b.meaningfulPrefix||[]),
    arms:arms.map(({meaningfulPrefix,...rest})=>({
      ...rest,meaningfulPrefixLength:meaningfulPrefix?.length??0
    })),
    limitation:'Root bot-call observation only: not authenticated full Store state or hidden-zone equivalence. No future draw claims, paper policy qualification or win-rate evidence.'
  };
}

if(require.main===module)console.log(JSON.stringify(runTurn5ForkObserver(),null,2));
module.exports={SEED,TARGETS,visibleSourceDecisionContext,
  withSourceForkObserver,runTurn5ForkObserver};
