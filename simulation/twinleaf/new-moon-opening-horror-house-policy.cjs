'use strict';

const path = require('node:path');
const server = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(server,file));

/**
 * Research-only narrow source-line decision: prefer the printed
 * Horror House-GX on the candidate's turn-two, going-second attack.
 * This deliberately does not alter the pinned Twinleaf source.
 *
 * @param {object} state
 * @param {object} player
 * @returns {'native'|'copied'|null}
 */
function firstAttackHorrorHouseChannel(state,player) {
  const {GamePhase}=engine('game/store/state/state');
  const active=player.active.getPokemonCard();
  if (state.turn!==2 || state.phase!==GamePhase.PLAYER_TURN ||
      player.usedGX===true || !active) return null;
  if (active.fullName==='Gengar & Mimikyu-GX TEU') return 'native';
  if (active.fullName!=='Mewtwo & Mew-GX UNM') return null;
  const payload=card=>card?.fullName==='Gengar & Mimikyu-GX TEU';
  if (!player.discard.cards.some(payload) &&
      !player.bench.some(slot=>payload(slot.getPokemonCard()))) return null;
  return 'copied';
}

/** @returns {Function} */
function makeOpeningHorrorHouseTactic() {
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction,UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  return class NewMoonOpeningHorrorHouseTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state,player) {
      const channel=firstAttackHorrorHouseChannel(state,player);
      if (channel==='native') return new AttackAction(player.id,'Horror House-GX');
      if (channel==='copied') return new UseAbilityAction(player.id,'Perfection',
        {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
      return undefined;
    }
  };
}

/** @returns {Function} */
function makeOpeningHorrorHouseResolver() {
  const {ChooseAttackPromptResolver}=engine(
    'simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt}=engine('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  return class NewMoonOpeningHorrorHouseResolver extends ChooseAttackPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt) {
      if (!(prompt instanceof ChooseAttackPrompt) ||
          prompt.playerId!==player.id ||
          firstAttackHorrorHouseChannel(state,player)!=='copied') {
        return super.resolvePrompt(state,player,prompt);
      }
      const payload=prompt.cards.find(card=>card.fullName==='Gengar & Mimikyu-GX TEU');
      const gx=payload?.attacks.find(attack=>attack.name==='Horror House-GX');
      if (gx && prompt.validate(gx)) {
        return new ResolvePromptAction(prompt.id,gx);
      }
      return super.resolvePrompt(state,player,prompt);
    }
  };
}

/**
 * Idempotent, per-seat research adapter. All other tactics remain in original
 * order and every non-New-Moon prompt falls back to pinned upstream behavior.
 * @param {object} options Original SimpleBotOptions.
 * @returns {object}
 */
function withNewMoonOpeningHorrorHouse(options) {
  const tactics=options.tactics;
  const resolvers=options.promptResolvers;
  if (!Array.isArray(tactics)||!Array.isArray(resolvers)) {
    throw new Error('Pinned SimpleBotOptions are missing tactic/resolver lists');
  }
  if (tactics.some(t=>t.name==='NewMoonOpeningHorrorHouseTactic') &&
      resolvers.some(r=>r.name==='NewMoonOpeningHorrorHouseResolver')) return options;
  const t=tactics.findIndex(x=>x.name==='AttackTactic');
  const r=resolvers.findIndex(x=>x.name==='ChooseAttackPromptResolver');
  if (t<0||r<0) throw new Error('Expected pinned attack tactic and attack resolver');
  return {
    ...options,
    tactics:[...tactics.slice(0,t),makeOpeningHorrorHouseTactic(),...tactics.slice(t)],
    promptResolvers:[...resolvers.slice(0,r),makeOpeningHorrorHouseResolver(),
      ...resolvers.slice(r)]
  };
}

module.exports={
  firstAttackHorrorHouseChannel,
  makeOpeningHorrorHouseTactic,
  makeOpeningHorrorHouseResolver,
  withNewMoonOpeningHorrorHouse
};
