'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const ENGINE_ROOT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
function engine(name) { return require(path.join(ENGINE_ROOT, name)); }

/** @param {any} p @returns {number} */
function occupiedPrizes(p) {
  return p.prizes.filter(slot => slot.cards.length > 0).length;
}

const THREE_PRIZE_TARGETS = new Set([
  'Mewtwo & Mew-GX UNM',
  'Shadow Rider Calyrex VMAX CRE',
  'Trevenant & Dusknoir-GX SMP',
  'Gengar & Mimikyu-GX TEU'
]);

/** @param {any} slot @returns {boolean} */
function hasCrobatAttackEnergy(slot) {
  return slot.energies.cards.length >= 2 &&
    slot.energies.cards.some(c => c.name === 'Darkness Energy');
}

/**
 * Owner-information-only lethal-opportunity classification.
 * Never examines hidden opponent zones, owner deck, or unobserved Prizes.
 * Uses a conservative 70-damage threshold despite Darkness Weakness on
 * three listed targets. Future improvements must check live modifiers.
 *
 * @param {any} state Actual Store state.
 * @param {0|1} seat Source physical seat.
 * @returns {{ready:boolean,mode:string|null,reason:string,stoneSlot:number,crobatIndex:number,patchInHand:boolean}}
 */
function crobatLethalOpportunity(state, seat) {
  const no = reason => ({ready:false,mode:null,reason,
    stoneSlot:-1,crobatIndex:-1,patchInHand:false});
  if (state.activePlayer !== seat || state.prompts.some(p => p.result === undefined))
    return no('not-owner-decision');
  const own = state.players[seat];
  const other = state.players[1-seat];
  const defended = other.active.getPokemonCard();
  if (!THREE_PRIZE_TARGETS.has(defended?.fullName) ||
      defended.hp - other.active.damage > 70)
    return no('no-public-three-prize-lethal-target');
  if (occupiedPrizes(own) > 3) return no('no-immediate-prize-win');
  const yes = (mode,stoneSlot,crobatIndex,patchInHand=false) => ({
    ready:true,mode,reason:mode,stoneSlot,crobatIndex,patchInHand});
  if (own.active.getPokemonCard()?.fullName === 'Crobat V DAA' &&
      hasCrobatAttackEnergy(own.active))
    return yes('active-attack',-1,-1);
  const crobatIndex = own.bench.findIndex(slot =>
    slot.getPokemonCard()?.fullName === 'Crobat V DAA' &&
    slot.energies.cards.some(c => c.name === 'Darkness Energy'));
  if (crobatIndex < 0) return no('no-eligible-bench-crobat');
  const crobat = own.bench[crobatIndex];
  if (hasCrobatAttackEnergy(crobat)) return yes('powered-bench',-1,crobatIndex);
  if (!own.discard.cards.some(c => c.name === 'Darkness Energy'))
    return no('no-discard-darkness');
  const patchInHand = own.hand.cards.some(c => c.fullName === 'Dark Patch ASR');
  if (patchInHand) return yes('held-dark-patch',-1,crobatIndex,true);
  if (own.usedVSTAR) return no('vstar-spent');
  if (own.bench.some(slot => slot.getPokemonCard()?.name === 'Garbodor' && slot.tools.length))
    return no('own-garbotoxin-blocks-star-alchemy');
  if (crobat.tools.some(c => c.fullName === 'Forest Seal Stone SIT'))
    return yes('crobat-equipped-stone',-1,crobatIndex);
  if (crobat.tools.length) return no('crobat-tool-slot-occupied');
  if (own.hand.cards.some(c => c.fullName === 'Forest Seal Stone SIT'))
    return yes('held-stone',-1,crobatIndex);
  if (!own.stadium.cards.some(c => c.fullName === 'Shopping Center EVS'))
    return no('no-shopping-center-for-stone-transfer');
  const stoneSlot = own.bench.findIndex(slot =>
    slot.getPokemonCard() && slot !== crobat &&
    slot.tools.some(c => c.fullName === 'Forest Seal Stone SIT'));
  if (stoneSlot >= 0) return yes('transfer-stone',stoneSlot,crobatIndex);
  if (own.active.tools.some(c => c.fullName === 'Forest Seal Stone SIT'))
    return yes('transfer-stone',-2,crobatIndex);
  return no('no-source-tool-transfer-search');
}

/**
 * Install a reversible opponent-owner policy using live legal Store actions.
 * Never inspects the unsearched deck or opponent hand. Retrospective test seed
 * is a positive control only; eligibility itself uses no seed or turn number.
 * Failures leave an explicit incomplete intervention and do not count as games.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {() => T} execute Synchronous already-configured headless match.
 * @param {{resolveEngine?:(name:string)=>any}} [options] Tested loader seam.
 * @returns {{result:T,audit:object}}
 */
function withRank11CrobatTerminalPolicy(sourceSeat, execute,
  {resolveEngine=engine} = {}) {
  if (![0,1].includes(sourceSeat)) throw new RangeError('sourceSeat must be 0 or 1');
  const {SimpleTacticsAi} = resolveEngine('simple-bot/simple-tactics-ai');
  const {GamePhase} = resolveEngine('game/store/state/state');
  const {PlayerType,SlotType,PlayCardAction} = resolveEngine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = resolveEngine('game/store/actions/resolve-prompt-action');
  const {UseStadiumAction,UseAbilityAction,RetreatAction,AttackAction} =
    resolveEngine('game/store/actions/game-actions');
  const proto = SimpleTacticsAi.prototype;
  const old = Object.getOwnPropertyDescriptor(proto, 'decodeNextAction');
  assert.equal(typeof old?.value, 'function');
  const boardTarget = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const benchTarget = i => ({player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i});
  const audit = {version:'rank11-crobat-terminal-owner-v3',sourceSeat,attempts:[],
    qualifyingGames:0,containsSeedSpecificGate:false};
  let turn = null, stage = null, event = null;
  function abort(reason) {
    if (event) { event.status = 'aborted'; event.reason = reason; }
    stage = 'aborted';
  }
  function record(state, action, label) {
    event.actions.push({turn:state.turn,label,action:action.constructor.name});
    return action;
  }
  const wrapper = function rank11CrobatOwnerDecision(state) {
    const ordinary = () => old.value.call(this, state);
    if (state.players[sourceSeat].id !== this.client?.id ||
        state.activePlayer !== sourceSeat || state.phase !== GamePhase.PLAYER_TURN)
      return ordinary();
    if (turn !== null && state.turn !== turn && stage !== 'done') abort('turn-expired');
    const own = state.players[sourceSeat];
    const pending = state.prompts.find(p => p.result === undefined);
    if (stage === null) {
      const gate = crobatLethalOpportunity(state, sourceSeat);
      if (!gate.ready) return ordinary();
      turn = state.turn;
      event = {turn,gate,status:'executing',actions:[]};
      audit.attempts.push(event);
      const stages = {
        'active-attack':'attack', 'powered-bench':'retreat',
        'held-dark-patch':'patch', 'crobat-equipped-stone':'vstar',
        'held-stone':'attach-stone', 'transfer-stone':'stadium'
      };
      stage = stages[gate.mode];
    }
    if (stage === 'aborted' || stage === 'done') return ordinary();
    const index = name => own.hand.cards.findIndex(c => c.fullName === name);
    const crobatIndex = own.bench.findIndex(s => s.getPokemonCard()?.fullName === 'Crobat V DAA');
    if (crobatIndex < 0 && stage !== 'attack') {
      abort('crobat-left-bench'); return ordinary();
    }
    if (pending) {
      if (stage === 'choose-stone' && pending.constructor.name === 'ChoosePokemonPrompt') {
        const slot = event.gate.stoneSlot === -2 ?
          own.active : own.bench[event.gate.stoneSlot];
        if (!slot?.tools.some(c => c.fullName === 'Forest Seal Stone SIT') ||
            !pending.validate([slot],state)) { abort('stone-prompt-rejected'); return ordinary(); }
        stage = 'attach-stone';
        return record(state,new ResolvePromptAction(pending.id,[slot]),'retrieve-stone');
      }
      if (stage === 'choose-patch' && pending.constructor.name === 'ChooseCardsPrompt' &&
          pending.playerId === own.id && pending.cards === own.deck) {
        const patch = pending.cards.cards.find(c => c.fullName === 'Dark Patch ASR');
        if (!patch || !pending.validate([patch],state)) {
          abort('no-legitimate-patch-in-star-alchemy-search'); return ordinary();
        }
        stage = 'await-patch';
        return record(state,new ResolvePromptAction(pending.id,[patch]),'search-patch');
      }
      if (stage === 'attach-darkness' && pending.constructor.name === 'AttachEnergyPrompt') {
        const energy = own.discard.cards.find(c => c.name === 'Darkness Energy');
        const transfers = energy ? [{card:energy,to:benchTarget(crobatIndex)}] : [];
        if (!energy || !pending.validate(transfers,state)) {
          abort('darkness-attach-prompt-rejected'); return ordinary();
        }
        stage = 'retreat';
        return record(state,new ResolvePromptAction(pending.id,transfers),'dark-patch-to-crobat');
      }
      return ordinary();
    }
    if (stage === 'stadium') {
      stage = 'choose-stone';
      return record(state,new UseStadiumAction(own.id),'shopping-center-stone-retrieval');
    }
    if (stage === 'attach-stone') {
      const i=index('Forest Seal Stone SIT');
      if (i < 0) { abort('stone-not-in-hand'); return ordinary(); }
      stage = 'vstar';
      return record(state,new PlayCardAction(own.id,i,benchTarget(crobatIndex)),'equip-crobat-stone');
    }
    if (stage === 'vstar') {
      if (own.usedVSTAR || !own.bench[crobatIndex].tools.some(c => c.fullName === 'Forest Seal Stone SIT')) {
        abort('vstar-unavailable'); return ordinary();
      }
      stage = 'choose-patch';
      return record(state,new UseAbilityAction(own.id,'Star Alchemy',benchTarget(crobatIndex)),
        'owner-deck-search-activation');
    }
    if (stage === 'await-patch' && index('Dark Patch ASR') >= 0) stage = 'patch';
    if (stage === 'patch') {
      const i = index('Dark Patch ASR');
      if (i < 0) { abort('patch-not-in-hand'); return ordinary(); }
      stage = 'attach-darkness';
      return record(state,new PlayCardAction(own.id,i,boardTarget),'play-dark-patch');
    }
    if (stage === 'retreat') {
      if (own.bench[crobatIndex].energies.cards.length < 2) {
        abort('crobat-not-powered'); return ordinary();
      }
      stage = 'attack';
      return record(state,new RetreatAction(own.id,crobatIndex),'promote-crobat');
    }
    if (stage === 'attack') {
      if (own.active.getPokemonCard()?.fullName !== 'Crobat V DAA') {
        abort('crobat-promotion-failed'); return ordinary();
      }
      stage = 'done';
      event.status = 'attack-declared';
      return record(state,new AttackAction(own.id,'Venomous Fang'),'venomous-fang');
    }
    return ordinary();
  };
  Object.defineProperty(proto,'decodeNextAction',{...old,value:wrapper});
  try {
    const result = execute();
    return {result,audit};
  } finally {
    Object.defineProperty(proto,'decodeNextAction',old);
  }
}

module.exports={occupiedPrizes,crobatLethalOpportunity,withRank11CrobatTerminalPolicy};
