'use strict';

const assert = require('node:assert/strict');
const { printedEnergyPayability } = require('./actor-energy-payability.cjs');
const VERSION = 'agent7-owner-funded-attack-stadium-paper-preflight-v1';
const MIN_DAMAGE = 80;

/**
 * Only two paper-verified source Stadium attack-cost modifiers are modeled.
 * The printed game uses full native CardType enum values supplied by caller.
 * Unknown costs and unsupported candidate Stadiums receive no positive
 * feasibility certificate.
 *
 * @param {number[]} printedCost
 * @param {number[]} pokemonTypes
 * @param {string|null} stadiumName
 * @param {object} types Pinned native CardType enum.
 * @returns {number[]|null}
 */
function costUnderStadium(printedCost, pokemonTypes, stadiumName, types) {
  assert.ok(Array.isArray(printedCost) &&
    Array.isArray(pokemonTypes));
  const cost = [...printedCost];
  if (stadiumName === 'Wondrous Labyrinth Prism Star' &&
      !pokemonTypes.includes(types.FAIRY)) {
    cost.push(types.COLORLESS);
  } else if (stadiumName === 'Thunder Mountain Prism Star' &&
      pokemonTypes.includes(types.LIGHTNING)) {
    const first = cost.indexOf(types.LIGHTNING);
    if (first >= 0) cost.splice(first, 1);
  } else if (stadiumName !== null &&
      !['Wondrous Labyrinth Prism Star',
        'Thunder Mountain Prism Star'].includes(stadiumName)) {
    return null;
  }
  return cost;
}

/**
 * @param {number[]} cost Real pinned CardType values.
 * @param {object} types CardType enum from pinned Store.
 * @returns {string[]|null}
 */
function toEnergySymbols(cost, types) {
  const names = [
    ['GRASS','G'],['FIRE','R'],['WATER','W'],
    ['LIGHTNING','L'],['PSYCHIC','P'],['FIGHTING','F'],
    ['DARK','D'],['METAL','M'],['FAIRY','Y'],['COLORLESS','C']
  ];
  const mapped = new Map(names.map(([key,symbol]) => [types[key],symbol]));
  const symbols = cost.map(type => mapped.get(type));
  return symbols.every(Boolean) ? symbols : null;
}

/** @param {object} view @param {object} pokemon */
function publicEnergyContext(view, pokemon, types, basicStage) {
  const name = pokemon.name ?? pokemon.printing ?? '';
  const stage = pokemon.printed.stage;
  return {
    isBasic: stage === basicStage,
    isEvolution: stage !== basicStage,
    isDragon: pokemon.printed.types.includes(types.DRAGON),
    hasRuleBox: /(?: ex| V|GX|EX|VMAX|VSTAR)/i.test(name),
    behindOnPrizes:
      view.ownPublic.prizeCount > view.opponentPublic.prizeCount,
    isPokemonGXorEX:
      /(?:GX|EX| ex)(?:$|\s)/i.test(name)
  };
}

/**
 * Find an owner hand Stadium that makes at least one damaging Active attack
 * payable now under two paper-verified Stadium cost modifiers. The source is
 * a detached actorObservation and only public printed card metadata.
 *
 * This is a conservative *candidate* for a real selected root, never a
 * substitute for Store attack permission, attack effects, opponent damage
 * prevention, or strategic benefit. It deliberately excludes unknown
 * modifier Stadiums, conditional counter-Energy ambiguity and zero-damage
 * attacks, and does not claim complete move enumeration.
 *
 * @param {object} view Owner-only actorObservation.
 * @param {{trainerCatalog:Map<string,{name:string,type:string}>,
 *  cardTypes:object,stageBasic:number,specialConditions:object}} refs
 * @returns {object|null}
 */
function chooseFundedStadiumAttack(view, refs) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const active = own.active;
  const resources = view.ownTurnResources;
  if (!active || view.globalTurn === 1 ||
      resources.stadiumPlayLocked !== false ||
      resources.stadiumPlayedTurn >= view.globalTurn ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.specialConditions?.some(x =>
        x === refs.specialConditions.ASLEEP ||
        x === refs.specialConditions.PARALYZED)) return null;

  const inPlay = [...own.stadium, ...view.opponentPublic.stadium];
  if (inPlay.length > 1) return null;
  const original = inPlay[0] ?? null;
  const oldMeta = original===null ? null:refs.trainerCatalog.get(original);
  if (original !== null && oldMeta?.type !== 'Stadium') return null;
  const beforeName = oldMeta?.name ?? null;
  const beforeAllowed =
    beforeName === null ||
    beforeName === 'Wondrous Labyrinth Prism Star' ||
    beforeName === 'Thunder Mountain Prism Star';
  if (!beforeAllowed) return null;
  const pokemonTypes = active.printed?.types;
  const isBasic = active.printed?.stage === refs.stageBasic;
  if (!Array.isArray(pokemonTypes) ||
      !Number.isInteger(active.printed?.stage)) return null;

  const availableAttackOptions = [];
  for (const attack of active.attacks ?? []) {
    if (attack.gxAttack === true ||
        !Number.isSafeInteger(attack.damage) ||
        attack.damage < MIN_DAMAGE ||
        !Array.isArray(attack.cost) ||
        active.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name) ||
        active.publicRestrictions?.blockedAttackNameNextTurn === attack.name ||
        active.publicRestrictions?.blockedAttackNameUntilLeavesActive === attack.name ||
        (active.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
        active.publicRestrictions.onlyAllowedAttackNameNextTurn !== attack.name)) {
      continue;
    }
    const oldCost = costUnderStadium(
      attack.cost,pokemonTypes,beforeName,refs.cardTypes);
    if (oldCost===null)continue;
    const oldSymbols=toEnergySymbols(oldCost,refs.cardTypes);
    if (oldSymbols===null)continue;
    const ctx=publicEnergyContext(view,active,
      refs.cardTypes,refs.stageBasic);
    const oldPayment=printedEnergyPayability(
      oldSymbols,active.energies,ctx);
    if(oldPayment.payable!==false || oldPayment.unknownPrintings.length)continue;
    availableAttackOptions.push({attack,ctx,oldSymbols,oldPayment});
  }
  if (!availableAttackOptions.length) return null;

  const candidates = [];
  for (let index=0;index<view.ownHand.length;index++) {
    const held = view.ownHand[index];
    const meta = refs.trainerCatalog.get(held);
    if(meta?.type!=='Stadium'||meta.name===beforeName||
       meta.name!=='Thunder Mountain Prism Star')continue;
    for(const option of availableAttackOptions){
      const nextCost = costUnderStadium(
        option.attack.cost,pokemonTypes,meta.name,refs.cardTypes);
      if(nextCost===null)continue;
      const nextSymbols = toEnergySymbols(nextCost,refs.cardTypes);
      if(nextSymbols===null)continue;
      const nextPayment=printedEnergyPayability(
        nextSymbols,active.energies,option.ctx);
      if(nextPayment.payable!==true)continue;
      const opp=view.opponentPublic.active;
      const nominalRemaining=opp?.hp-opp?.damage;
      candidates.push({
        kind:'play-funded-stadium',
        handIndex:index,printing:held,name:meta.name,
        originalStadium:original,
        originalStadiumName:beforeName,
        attackName:option.attack.name,baseDamage:option.attack.damage,
        nominalTargetRemainingHP:Number.isFinite(nominalRemaining)?
          nominalRemaining:null,
        printedPotentialKnockout:Number.isFinite(nominalRemaining) &&
          nominalRemaining>0 &&
          option.attack.damage>=nominalRemaining,
        modeledOldCost:option.oldSymbols,
        modeledNewCost:nextSymbols,
        availableModeledEnergyUnits:nextPayment.modeledUnits,
        eligibility:'owner-paper-printed-cost-improvement-native-store-final',
        modelLimits:'Two known Stadium cost modifiers; other effects, locks, '
          +'attack legality, damage and opponent tactics unresolved'
      });
    }
  }
  candidates.sort((a,b)=>b.baseDamage-a.baseDamage ||
    a.handIndex-b.handIndex ||
    a.attackName.localeCompare(b.attackName));
  return candidates[0]??null;
}

module.exports = {
  VERSION,MIN_DAMAGE,costUnderStadium,toEnergySymbols,
  publicEnergyContext,chooseFundedStadiumAttack
};
