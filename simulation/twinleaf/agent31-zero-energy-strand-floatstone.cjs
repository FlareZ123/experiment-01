'use strict';

const assert = require('node:assert/strict');
const {publicSpecialAttackPayable} =
  require('./agent17-public-context-special-energy.cjs');
const {projectedFundedAttackDamage} =
  require('./agent14-generic-funded-floatstone-frontier.cjs');

const VERSION = 'agent31-zero-energy-strand-to-funded-ko-v1';
const TOOL = 'Float Stone BKT';

/**
 * Owner-visible zero-Energy stranded Active rescue into an already funded
 * Benched attacker with a conservatively projected nominal Active KO.
 *
 * This is a newly observed payoff class omitted by the generic
 * energy-preservation mobility proposal. The proposal is provisional:
 * no live Store action, residual attack effect, or opponent continuation is
 * certified. Only authentic owner-root observations may reach this helper.
 *
 * @param {object} view A detached actorObservation with public boards.
 * @param {object} catalog A public, printing-specific energy catalog.
 * @returns {object|null} Existing native-neutral Tool / Retreat intent.
 */
function chooseZeroEnergyStrandFloatStone(view, catalog) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const active = own?.active;
  const enemy = view.opponentPublic?.active;
  const resources = view.ownTurnResources;
  if (!Number.isSafeInteger(view.globalTurn) || view.globalTurn <= 1 ||
      !resources || !active || !enemy || !Array.isArray(own.bench) ||
      !Array.isArray(active.energies) || active.energies.length !== 0 ||
      !Array.isArray(active.printed?.retreatCost) ||
      active.printed.retreatCost.length === 0 ||
      !Number.isSafeInteger(resources.retreatedTurn) ||
      resources.retreatedTurn === view.globalTurn ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      !Number.isSafeInteger(enemy.hp) || !Number.isSafeInteger(enemy.damage) ||
      enemy.hp <= enemy.damage ||
      (enemy.printed?.resistance??[]).length > 0 ||
      (enemy.tools??[]).length > 0) return null;

  const activeRestrictions = active.publicRestrictions??{};
  if (activeRestrictions.cannotRetreatNextTurn === true ||
      activeRestrictions.cannotRetreatWhileActive === true ||
      (active.specialConditions??[]).some(condition =>
        condition === catalog.specialConditions?.ASLEEP ||
        condition === catalog.specialConditions?.PARALYZED)) return null;

  const stadiums = [...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if (stadiums.some(stadium => stadium.startsWith('Jamming Tower ')) ||
      view.opponentPublic?.active?.tools?.some(tool =>
        tool.startsWith('Tool Jammer '))) return null;

  const candidates = [];
  for (const [benchIndex, pokemon] of own.bench.entries()) {
    if (!pokemon) continue;
    const restrictions = pokemon.publicRestrictions??{};
    if (restrictions.cannotAttackNextTurn === true ||
        (pokemon.specialConditions??[]).some(condition =>
          condition === catalog.specialConditions?.ASLEEP ||
          condition === catalog.specialConditions?.PARALYZED)) continue;
    for (const attack of pokemon.attacks??[]) {
      if (attack.gxAttack === true ||
          restrictions.blockedAttackNameNextTurn === attack.name ||
          restrictions.blockedAttackNameUntilLeavesActive === attack.name ||
          restrictions.cannotUseAttacksNextTurn?.includes(attack.name) ||
          (restrictions.onlyAllowedAttackNameNextTurn &&
            restrictions.onlyAllowedAttackNameNextTurn !== attack.name) ||
          !publicSpecialAttackPayable(view,catalog,pokemon,attack)) continue;
      const nominal = projectedFundedAttackDamage(view,pokemon,attack,catalog);
      if (!Number.isSafeInteger(nominal) ||
          nominal <= 0 || nominal < enemy.hp - enemy.damage) continue;
      candidates.push({
        benchIndex, printing:pokemon.printing,
        targetAttackName:attack.name, projectedPrintedDamage:nominal,
        remainingEnemyHp:enemy.hp-enemy.damage,
        estimatedSurplus:nominal-enemy.hp+enemy.damage
      });
    }
  }
  candidates.sort((a,b) => b.estimatedSurplus-a.estimatedSurplus ||
    a.benchIndex-b.benchIndex ||
    a.targetAttackName.localeCompare(b.targetAttackName));
  const target=candidates[0];
  if (!target) return null;

  if (active.tools?.includes(TOOL))
    return {...target,kind:'retreat-emergency-floatstone',
      source:VERSION,paperQualified:false};
  if (!Array.isArray(active.tools) || active.tools.length !== 0 ||
      resources.toolPlayLocked === true ||
      own.publicTurnRestrictions?.toolPlayLocked === true) return null;
  const handIndex = view.ownHand?.indexOf(TOOL)??-1;
  if (handIndex < 0) return null;
  return {...target,kind:'attach-emergency-floatstone',handIndex,
    source:VERSION,paperQualified:false};
}

module.exports={VERSION,TOOL,chooseZeroEnergyStrandFloatStone};
