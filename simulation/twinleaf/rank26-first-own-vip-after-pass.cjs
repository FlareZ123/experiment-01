'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const VIP = 'Battle VIP Pass';
const MELOETTA = 'Meloetta ex';
const EXEGGCUTE = 'Exeggcute';
const KOKO = 'Tapu Koko Prism Star';

const {actorObservation} = require('./actor-observation-contract.cjs');

/**
 * Pre-search owner-only first-turn VIP opportunity from the detached,
 * frozen actor-observation contract. No native State or opponent hidden
 * identities are available to this decision predicate.
 * @param {object} view Verified owner actorObservation.
 * @param {number} phase Pinned PLAYER_TURN enum.
 * @returns {boolean}
 */
function sourceVipActorEligible(view,phase) {
  const inPlay=name=>[view.ownPublic.active,...view.ownPublic.bench]
    .some(slot=>slot?.printing?.startsWith(name+' '));
  const hasHand=name=>view.ownHand.some(print=>
    print.startsWith(name+' '));
  const free=view.ownPublic.bench.filter(slot=>slot===null).length;
  return view.decisionKind==='owner-root' &&
    view.globalTurn===1 && view.phase===phase &&
    hasHand(VIP) && !inPlay(MELOETTA) && !hasHand(MELOETTA) &&
    free > (inPlay(KOKO) ? 0 : 1);
}

/**
 * This check sees only the acting player hand and public Active/Bench.
 * Reserve one Bench slot for Koko if Koko has not entered play.
 * @param {object} state Native live source state.
 * @param {object} own Source player.
 * @param {0|1} seat Physical source seat.
 * @param {number} phase Pinned PLAYER_TURN phase.
 * @returns {boolean}
 */
function sourceVipAfterPassEligible(state, own, seat, phase) {
  const board = [own.active, ...own.bench];
  const hasInPlay = name => board.some(
    slot => slot.getPokemonCard()?.name === name);
  const empty = own.bench.filter(slot => !slot.getPokemonCard()).length;
  return state.turn === 1 && state.activePlayer === seat &&
    state.phase === phase && state.players[seat] === own &&
    !state.prompts.some(prompt => prompt.result === undefined) &&
    own.hand.cards.some(card => card.name === VIP) &&
    !hasInPlay(MELOETTA) &&
    !own.hand.cards.some(card => card.name === MELOETTA) &&
    empty > (hasInPlay(KOKO) ? 0 : 1);
}

/**
 * Owner-deck inspection is permitted only after the actual owner search prompt.
 * Prefer a missing Meloetta then a physical Exeggcute without filling the
 * reserved Koko Bench slot or selecting a card unavailable in the search.
 * @param {object} own Source player after VIP was accepted.
 * @param {object} prompt Actual owner-deck ChooseCardsPrompt.
 * @param {object} state Live state.
 * @returns {object[]} Native card references, zero to two.
 */
function selectSourceVipBasics(own, prompt, state) {
  const kokoInPlay = [own.active, ...own.bench].some(
    slot => slot.getPokemonCard()?.name === KOKO);
  const free = own.bench.filter(slot => !slot.getPokemonCard()).length;
  const budget = Math.min(2, free - (kokoInPlay ? 0 : 1));
  if (budget < 1) return [];
  const choices = [];
  for (const name of [MELOETTA, EXEGGCUTE]) {
    if (choices.length >= budget) break;
    const card = prompt.cards.cards.find(item =>
      item.name === name && !choices.includes(item));
    if (card) choices.push(card);
  }
  for (let n = choices.length; n >= 1; n--) {
    const group = choices.slice(0,n);
    if (prompt.validate(group,state)) return group;
  }
  return [];
}

/**
 * Once the existing source bot proposes Pass, attempt one owner-information
 * Battle VIP Pass root, then resolve its native owner-deck search. No card
 * instances are fabricated. This is an opt-in development policy, not an
 * established optimal opening or competitive win-rate test.
 * @template T
 * @param {0|1} seat Source physical seat.
 * @param {()=>T} execute Synchronous native headless experiment.
 * @returns {{result:T,policyAudit:object}}
 */
function withSourceVipAfterPass(seat, execute) {
  if (![0,1].includes(seat) || typeof execute !== 'function')
    throw new TypeError('Need source seat and synchronous runner');
  const get = subpath => require(path.join(OUTPUT, subpath));
  const {SimpleTacticsAi} = get('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    get('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    get('game/store/actions/resolve-prompt-action');
  const {GamePhase} = get('game/store/state/state');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = seat === 0 ? 101 : 202;
  const events = [];
  let stage = 'available';
  const override = function rank26VipAfterPass(state) {
    const own = state.players[seat];
    if (this.client?.id !== sourceId || !own)
      return previous.call(this,state);
    const prompt = state.prompts.find(p => p.result === undefined);
    if (stage === 'search' && prompt) {
      if (prompt.constructor.name === 'WaitPrompt')
        return previous.call(this,state);
      if (prompt.constructor.name === 'ChooseCardsPrompt' &&
          prompt.playerId === sourceId && prompt.cards === own.deck) {
        const selected = selectSourceVipBasics(own,prompt,state);
        events.push({kind:'owner-deck-target',turn:state.turn,
          cards:selected.map(c => c.fullName),nativeValid:selected.length>0});
        stage = 'post';
        if (selected.length)
          return new ResolvePromptAction(prompt.id,selected);
      } else {
        events.push({kind:'unexpected-prompt',type:prompt.constructor.name});
        stage = 'finished';
      }
    }
    if (stage === 'post' && !prompt) {
      events.push({kind:'public-board-after',turn:state.turn,
        bench:own.bench.map(s => s.getPokemonCard()?.fullName ?? null)});
      stage = 'finished';
    }
    const action = previous.call(this,state);
    if (stage === 'available' &&
        action?.constructor?.name === 'PassTurnAction' &&
        state.turn === 1 && state.phase === GamePhase.PLAYER_TURN &&
        state.activePlayer === seat) {
      const view = actorObservation(state,seat);
      const eligible = sourceVipActorEligible(view,GamePhase.PLAYER_TURN);
      assert.equal(eligible,
        sourceVipAfterPassEligible(state,own,seat,GamePhase.PLAYER_TURN),
        'Detached actor view changed the first-turn VIP eligibility');
      if (eligible) {
        const handIndex = own.hand.cards.findIndex(c => c.name === VIP);
        const replacement = new PlayCardAction(sourceId,handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        const nativeValid = this.isValidAction(state,replacement);
        events.push({kind:'source-pass-vip-opportunity',turn:state.turn,
          nativeValid,seat,freeBench:own.bench.filter(s=>!s.getPokemonCard()).length,
          detachedActorView:true});
        stage = nativeValid ? 'search' : 'finished';
        if (nativeValid) return replacement;
      }
    }
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction = override;
  try {
    return {result:execute(),policyAudit:{
      version:'rank26-first-own-vip-after-pass-v1',seat,events,
      finalStage:stage,competitiveGameQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,override,
      'Rank26 VIP wrapper lost single-owner bot override');
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports={sourceVipAfterPassEligible,sourceVipActorEligible,
  selectSourceVipBasics,withSourceVipAfterPass};
