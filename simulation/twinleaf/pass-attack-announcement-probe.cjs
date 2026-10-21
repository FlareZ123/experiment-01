'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Enumerate visible attacks written on the Active Pokémon and attached Tools.
 * An attack obtained from another effect may be omitted; this census must
 * never be used as a certificate that all attack choices were enumerated.
 * @param {object} player Pinned Twinleaf player.
 * @returns {Array<{name:string,source:string}>}
 */
function visibleActiveAttacks(player) {
  const pokemon = player.active.getPokemonCard();
  if (!pokemon) return [];
  const result = [];
  const seen = new Set();
  for (const [cards, source] of [
    [[pokemon], 'printed'],
    [player.active.tools, 'attached-tool']
  ]) {
    for (const card of cards) {
      for (const attack of card.attacks || []) {
        if (typeof attack.name !== 'string' || seen.has(attack.name)) continue;
        seen.add(attack.name);
        result.push({name: attack.name, source});
      }
    }
  }
  return result;
}

/**
 * Attempt exactly one attack in a detached, seeded Store clone. As in the
 * existing TM Evolution announcement probe, acceptance means only that the
 * pinned engine accepted the action and may have produced prompts. It does
 * not prove that the attack's effects resolve or that the action is optimal.
 * @param {object} state Actual pre-pass game state.
 * @param {number} playerId The independently selected passing player's ID.
 * @param {string} attackName Visible candidate attack name.
 * @returns {boolean}
 */
function clonedStoreAcceptsAttack(state, playerId, attackName) {
  const load = name => require(path.join(output, name));
  const {deepClone} = load('utils');
  const {Store} = load('game/store/store');
  const {AttackAction} = load('game/store/actions/game-actions');
  const clone = new Store({onStateChange() {}});
  clone.state = deepClone(state);
  const previousRandom = Math.random;
  Math.random = () => 0.5;
  try {
    clone.dispatch(new AttackAction(playerId, attackName));
    return true;
  } catch {
    return false;
  } finally {
    Math.random = previousRandom;
  }
}

/**
 * Read-only, post-choice investigation of missed attack announcements.
 * Never expose its outcomes to a bot: a cloned reducer can inspect hidden
 * game state, which is not automatically known to a paper player.
 * @param {object} state Actual state before dispatching an already chosen Pass.
 * @param {number} playerId ID of the passing player.
 * @param {(state:object,playerId:number,attackName:string)=>boolean} [attempt]
 *   Test seam; production always uses the pinned Store clone.
 * @returns {object|null} Detached metadata containing public attack names.
 */
function probePassedAttackOptions(state, playerId, attempt = clonedStoreAcceptsAttack) {
  if (state.prompts.some(prompt => prompt.result === undefined)) return null;
  const player = state.players.find(side => side.id === playerId);
  if (!player) return null;
  const candidates = visibleActiveAttacks(player);
  const checked = candidates.slice(0, 8);
  return {
    evidenceType: 'post-choice-cloned-attack-announcements-v1',
    playerId,
    activePokemon: player.active.getPokemonCard()?.name || null,
    tested: checked.map(attack => ({
      ...attack, engineAcceptedAnnouncement: attempt(state, playerId, attack.name)
    })),
    truncated: candidates.length > checked.length,
    scope: 'Only visible printed and Tool attacks were attempted in detached pinned-Store clones after the policy chose Pass; no paper-rules or tactical-value conclusion.'
  };
}

/**
 * Reserve half the bounded probe budget for late Tool-equipped passes.
 * A first-eight-passes-only policy can miss Bunnelby's turn-56 Evolution
 * pass after earlier ordinary pass decisions exhaust the audit budget.
 *
 * @param {object} player Pinned Twinleaf player.
 * @param {{printed:number,tool:number}} counts Already attempted probes.
 * @returns {'printed'|'tool'|null} Bucket to charge, or no remaining quota.
 */
function nextPassProbeBucket(player, counts) {
  const hasAttachedAttack = visibleActiveAttacks(player)
    .some(attack => attack.source === 'attached-tool');
  const bucket = hasAttachedAttack ? 'tool' : 'printed';
  return counts[bucket] < 4 ? bucket : null;
}

/**
 * Exact Store clone: can the chosen passing player manually attach the held
 * Telepath Energy to its current Active before the Pass?
 * @param {object} state Native pre-Pass state.
 * @param {number} ownerId Real acting player ID.
 * @param {number} handIndex Observed own-hand printing index.
 * @returns {object} Cloned Store acceptance and physical placement.
 */
function clonedStoreTelepathActive(state,ownerId,handIndex){
  const load=name=>require(path.join(output,name));
  const {deepClone}=load('utils');
  const {Store}=load('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const clone=new Store({onStateChange(){}});
  clone.state=deepClone(state);
  const before=clone.state.players.find(p=>p.id===ownerId);
  const countBefore=before.active.energies.cards.length;
  const handBefore=before.hand.cards.length;
  const randomBefore=Math.random;
  Math.random=()=>0.5;
  try{
    clone.dispatch(new PlayCardAction(ownerId,handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const after=clone.state.players.find(p=>p.id===ownerId);
    return {
      nativeAccepted:true,
      physicalEnergyAttached:after.active.energies.cards.length===
        countBefore+1&&after.hand.cards.length===handBefore-1&&
        after.active.energies.cards.some(card=>
          card.fullName==='Telepath [P] Energy M3'),
      unresolvedPromptTypes:clone.state.prompts
        .filter(prompt=>prompt.result===undefined)
        .map(prompt=>prompt.constructor.name),
      nativeRejection:null
    };
  }catch(error){
    return {nativeAccepted:false,physicalEnergyAttached:false,
      unresolvedPromptTypes:null,
      nativeRejection:String(error?.message??error)};
  }finally{
    Math.random=randomBefore;
  }
}

/**
 * Observational only, after the real bot chose Pass. Native acceptance
 * concerns one precise Active target and does not validate attack value.
 * @param {object} state Native pre-Pass state.
 * @param {number} ownerId Acting player ID.
 * @param {(state:object,id:number,idx:number)=>object} [attempt]
 * @returns {object|null} Owner-only cloned-attachment witness.
 */
function probeHeldTelepathPass(state,ownerId,
  attempt=clonedStoreTelepathActive){
  if(state.prompts.some(prompt=>prompt.result===undefined))return null;
  const p=state.players.find(player=>player.id===ownerId);
  if(!p || p!==state.players[state.activePlayer])return null;
  const index=p.hand.cards.findIndex(card=>
    card.fullName==='Telepath [P] Energy M3');
  const active=p.active.getPokemonCard();
  if(index<0||!active)return null;
  return {
    schema:'agent4-native-cloned-owner-telepath-active-attachment-v1',
    activePokemon:active.name,heldPrinting:'Telepath [P] Energy M3',
    openBenchSlots:p.bench.filter(slot=>!slot.getPokemonCard()).length,
    ...attempt(state,ownerId,index),
    note:'Post-choice detached Store test only; no alternate-policy success or competitive claim'
  };
}

module.exports = {visibleActiveAttacks, clonedStoreAcceptsAttack, probePassedAttackOptions, nextPassProbeBucket,
  clonedStoreTelepathActive, probeHeldTelepathPass};
