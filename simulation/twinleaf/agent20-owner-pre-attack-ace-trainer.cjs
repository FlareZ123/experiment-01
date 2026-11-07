'use strict';

const VERSION = 'agent20-owner-pre-attack-ace-trainer-v1';

/**
 * Select Ace Trainer immediately before an already-planned, publicly lethal
 * attack. The decision reads the actor's hand and public board only.
 *
 * @param {object} view Owner-only actor observation.
 * @param {object} action The pending native AttackAction.
 * @param {{minOpponentHandCount?:number,minOwnHandCount?:number}} [options]
 * @returns {null|{kind:string,handIndex:number,printing:string,attackIndex:number,
 *   attackName:string,damage:number,targetPrinting:string,targetRemainingHp:number,
 *   ownPrizeCount:number,opponentPrizeCount:number,ownHandCount:number,
 *   opponentHandCount:number,reason:string}}
 */
function chooseOwnerPreAttackAceTrainer(view, action, options = {}) {
  if (view?.decisionKind !== 'owner-root') return null;

  const ownHand = view.ownHand;
  const own = view.ownPublic;
  const opponent = view.opponentPublic;
  const resources = view.ownTurnResources ?? {};
  if (!Array.isArray(ownHand) || !own || !opponent) return null;
  if (!own.active || !opponent.active) return null;
  if (resources.supporterPlayLocked === true ||
      Number(resources.supporterPlayedTurn) > 0) return null;

  const ownPrizeCount = Number(own.prizeCount);
  const opponentPrizeCount = Number(opponent.prizeCount);
  if (!Number.isFinite(ownPrizeCount) ||
      !Number.isFinite(opponentPrizeCount) ||
      ownPrizeCount <= opponentPrizeCount) return null;

  const handIndex = ownHand.findIndex(printing =>
    String(printing).includes('Ace Trainer'));
  if (handIndex < 0) return null;

  const ownHandCount = ownHand.length;
  const opponentHandCount = Number(opponent.handCount);
  const minOwnHandCount = options.minOwnHandCount ?? 6;
  const minOpponentHandCount = options.minOpponentHandCount ?? 5;
  if (!Number.isFinite(opponentHandCount) ||
      ownHandCount < minOwnHandCount ||
      opponentHandCount < minOpponentHandCount ||
      opponentHandCount < ownHandCount) return null;

  const active = own.active;
  const target = opponent.active;
  const attacks = active.attacks ?? [];
  const requestedIndex = action?.attackIndex ?? action?.index ??
    action?.selection?.index;
  const requestedName = action?.attackName ?? action?.attack?.name ??
    action?.name;
  const namedIndex = typeof requestedName === 'string'
    ? attacks.findIndex(candidate => candidate.name === requestedName)
    : -1;
  const attackIndex = Number.isInteger(requestedIndex)
    ? requestedIndex
    : namedIndex >= 0 ? namedIndex : attacks.length === 1 ? 0 : -1;
  const attack = attacks[attackIndex];
  if (!attack) return null;
  if (attack.damageCalculation != null ||
      String(attack.text ?? '').trim() !== '') return null;

  const damage = Number(attack.damage);
  const attackCost = Array.isArray(attack.cost) ? attack.cost : [];
  const attachedEnergy = Array.isArray(active.energies) ? active.energies : [];
  if (!Number.isFinite(damage) || attackCost.length === 0 ||
      attachedEnergy.length < attackCost.length) return null;

  if ((target.tools ?? []).length > 0 ||
      (target.abilities ?? []).length > 0 ||
      (opponent.stadium ?? []).length > 0) return null;

  const ownTypes = active.printed?.types ?? [];
  const resistance = target.printed?.resistance ?? [];
  if (resistance.some(entry => ownTypes.includes(entry.type))) return null;

  const targetHp = Number(target.hp);
  const targetDamage = Number(target.damage);
  if (!Number.isFinite(targetHp) || !Number.isFinite(targetDamage)) return null;
  const targetRemainingHp = targetHp - targetDamage;
  if (damage < targetRemainingHp) return null;

  return {
    kind: 'play-ace-trainer',
    handIndex,
    printing: String(ownHand[handIndex]),
    attackIndex,
    attackName: String(attack.name ?? ''),
    damage,
    targetPrinting: String(target.printing ?? ''),
    targetRemainingHp,
    ownPrizeCount,
    opponentPrizeCount,
    ownHandCount,
    opponentHandCount,
    reason: 'owner-public-ace-trainer-before-lethal-attack'
  };
}

module.exports = { VERSION, chooseOwnerPreAttackAceTrainer };
