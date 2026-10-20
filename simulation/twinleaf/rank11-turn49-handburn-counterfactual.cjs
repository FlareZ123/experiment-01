'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * @param {string} name Compiled module name relative to the pinned Twinleaf output.
 * @returns {any}
 */
function engine(name) {
  return require(path.join(OUTPUT, name));
}

const DISCARD_ORDER = [
  'Boost Shake EVS', 'VS Seeker PHF', 'Carmine TWM',
  'Professor\'s Letter BKT', 'Battle VIP Pass FST',
  'Temple of Sinnoh ASR', 'Shopping Center EVS',
  'Guzma BUS', 'Secret Box TWM', 'Dark Patch ASR'
];

/**
 * Choose an actually present non-Quick-Ball Trainer in owner-visible prompt
 * cards. Never select hidden-zone objects or the next Quick Ball to be used.
 *
 * @param {{fullName:string}[]} cards Prompt-listed physical cards.
 * @param {readonly string[]} [priority] Owner-visible discard preference.
 * @returns {{fullName:string}|null}
 */
function chooseTrainerDiscard(cards, priority=DISCARD_ORDER) {
  for (const fullName of priority) {
    const card = cards.find(item => item.fullName === fullName);
    if (card) return card;
  }
  return null;
}

/**
 * Retrospective, explicit opponent-policy counterfactual for source rank11's
 * game turn immediately before the archived terminal copied Poltergeist.
 *
 * This changes only real decoded actions at the specified source-own turn;
 * prompts are resolved through the real pinned Store and tested for validity.
 * The earlier source-dealt deal and its physical cards are never staged.
 * This branch must not enter prospective competitive game denominators.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute Synchronous original source-game runner.
 * @param {{turn?:number,maxQuickBalls?:number,discardPriority?:readonly string[]}} [options]
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11Turn49HandBurn(sourceSeat, execute,
  {turn=49,maxQuickBalls=3,discardPriority=DISCARD_ORDER}={}) {
  if (![0,1].includes(sourceSeat) || typeof execute !== 'function' ||
      !Number.isSafeInteger(turn) || turn<1 ||
      !Number.isSafeInteger(maxQuickBalls) || maxQuickBalls<1 ||
      !Array.isArray(discardPriority) || discardPriority.length===0) {
    throw new TypeError('Need source seat, source turn, positive Quick Ball goal and runner.');
  }
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction}=engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=sourceSeat===0?101:202;
  const QUICK_BALL='Quick Ball FST';
  const events=[];
  let phase='idle';
  let completedBalls=0;
  let attemptCount=0;
  let blocked=null;
  let sourceTurnSeen=false;
  let beforeOwnHand=null;
  let afterOwnHand=null;

  /**
   * @param {object} state
   * @param {object} player
   * @returns {any}
   */
  function selectPlay(state,player) {
    const index=player.hand.cards.findIndex(c=>c.fullName===QUICK_BALL);
    if(index<0 || player.deck.cards.length===0) {
      blocked={turn:state.turn,phase,reason:'Quick-Ball-or-nonempty-own-deck-unavailable'};
      return null;
    }
    const action=new PlayCardAction(player.id,index);
    if(!this.isValidAction(state,action)) {
      blocked={turn:state.turn,phase,reason:'pinned-action-legality-filter-rejected-Quick-Ball'};
      return null;
    }
    attemptCount++;
    phase='discard';
    events.push({turn:state.turn,step:'play-Quick-Ball',ordinal:attemptCount,
      ownHandBefore:player.hand.cards.map(c=>c.fullName),
      ownDeckSize:player.deck.cards.length});
    return action;
  }

  const sourceHandBurn=function sourceHandBurn(state) {
    const player=state.players.find(side=>side.id===this.client?.id);
    if(!player || player.id!==sourceId) return oldDecode.call(this,state);
    if(state.turn!==turn || state.activePlayer!==sourceSeat ||
        state.phase!==GamePhase.PLAYER_TURN) {
      return oldDecode.call(this,state);
    }
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!sourceTurnSeen && !pending) {
      sourceTurnSeen=true;
      beforeOwnHand=player.hand.cards.map(c=>c.fullName);
    }
    if(blocked || completedBalls>=maxQuickBalls) {
      if(!pending && afterOwnHand===null && sourceTurnSeen) {
        afterOwnHand=player.hand.cards.map(c=>c.fullName);
      }
      return oldDecode.call(this,state);
    }
    if(phase==='discard') {
      if(pending?.constructor?.name==='ChooseCardsPrompt' &&
          pending.playerId===player.id && pending.cards!==player.deck) {
        const selected=chooseTrainerDiscard(pending.cards.cards,discardPriority);
        if(selected && pending.validate([selected],state)) {
          events.push({turn:state.turn,step:'discard-own-Trainer',
            printing:selected.fullName});
          phase='search';
          return new ResolvePromptAction(pending.id,[selected]);
        }
        blocked={turn:state.turn,phase,reason:'no-valid-Trainer-discard-choice'};
      } else if(!pending) {
        blocked={turn:state.turn,phase,reason:'missing-Quick-Ball-discard-prompt'};
      }
      return oldDecode.call(this,state);
    }
    if(phase==='search') {
      if(pending?.constructor?.name==='ChooseCardsPrompt' &&
          pending.playerId===player.id && pending.cards===player.deck) {
        let selected=[];
        if(!pending.validate(selected,state)) {
          const first= pending.cards.cards.find(c=>
            c?.stage==='BASIC' && pending.validate([c],state));
          if(!first) {
            blocked={turn:state.turn,phase,reason:'no-valid-Basic-search-selection'};
            return oldDecode.call(this,state);
          }
          selected=[first];
        }
        events.push({turn:state.turn,step:'resolve-owner-Basic-search',
          selected:selected.map(c=>c.fullName)});
        phase='settle';
        return new ResolvePromptAction(pending.id,selected);
      }
      if(!pending) {
        blocked={turn:state.turn,phase,reason:'missing-Quick-Ball-search-prompt'};
      }
      return oldDecode.call(this,state);
    }
    if(phase==='settle') {
      if(pending) return oldDecode.call(this,state);
      completedBalls++;
      events.push({turn:state.turn,step:'finished-Quick-Ball',
        count:completedBalls,ownHandAfter:player.hand.cards.map(c=>c.fullName)});
      phase='idle';
    }
    if(pending) return oldDecode.call(this,state);
    if(phase==='idle' && completedBalls<maxQuickBalls) {
      const action=selectPlay.call(this,state,player);
      if(action) return action;
    }
    if(afterOwnHand===null && sourceTurnSeen) {
      afterOwnHand=player.hand.cards.map(c=>c.fullName);
    }
    return oldDecode.call(this,state);
  };
  SimpleTacticsAi.prototype.decodeNextAction=sourceHandBurn;
  try {
    const result=execute();
    return {result,policyAudit:{
      schema:'rank11-turn49-live-Quick-Ball-Trainer-burn-v1',
      sourceSeat,sourceTurn:turn,maxQuickBalls,discardPriority,
      sourceTurnSeen,beforeOwnHand,afterOwnHand,
      attemptCount,completedBalls,phaseAtEnd:phase,blocked,events,
      perspective:'acting source player own hand, owner search prompt, public turn',
      qualification:'retrospective source-conserved branch; no competitive game'
    }};
  } finally {
    if(SimpleTacticsAi.prototype.decodeNextAction!==sourceHandBurn) {
      throw new Error('Counterfactual Quick Ball hook lost prototype ownership.');
    }
    SimpleTacticsAi.prototype.decodeNextAction=oldDecode;
  }
}

module.exports={chooseTrainerDiscard,withRank11Turn49HandBurn,DISCARD_ORDER};
