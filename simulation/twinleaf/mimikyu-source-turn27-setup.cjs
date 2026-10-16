'use strict';
const path = require('node:path');
const out = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load=name=>require(path.join(out,name));

/**
 * Candidate actions from one source-locked, visibly recognizable state.
 * The turn-27 restriction prevents unvalidated generalization.
 * @param {object} state @param {object} player @returns {object|null}
 */
function chooseSetupAction(state,player) {
  const enemy=state.players.find(p=>p.id!==player.id);
  const last=enemy&&state.playerLastAttack?.[enemy.id];
  if (state.turn!==27 || player.usedGX ||
      last?.sourceCard?.fullName!=='Regidrago VSTAR SIT' ||
      last?.attack?.name!=='Apex Dragon') return null;
  const hand=player.hand.cards;
  const benchIndex=player.bench.findIndex(s=>s.getPokemonCard()?.fullName==='Mimikyu GRI');
  const active=player.active.getPokemonCard()?.fullName;
  const mimikyu=benchIndex>=0?player.bench[benchIndex]:
    active==='Mimikyu GRI'?player.active:null;
  if (!mimikyu) return null;
  const dialgaDiscard=player.discard.cards.some(c=>c.fullName==='Dialga-GX UPR');
  const dialgaHand=hand.some(c=>c.fullName==='Dialga-GX UPR');
  const treasure=hand.findIndex(c=>c.fullName==='Mysterious Treasure FLI');
  if (!dialgaDiscard && dialgaHand && treasure>=0)
    return {kind:'discard-dialga',handIndex:treasure};
  if (!dialgaDiscard) return null;
  if (mimikyu.energies.cards.length<2 && player.energyPlayedTurn<state.turn) {
    const psychic=hand.findIndex(c=>c.name==='Psychic Energy');
    if (psychic>=0)
      return {kind:'attach-psychic',handIndex:psychic,benchIndex};
    const stretcher=hand.findIndex(c=>c.name==='Night Stretcher');
    if (stretcher>=0 && player.discard.cards.some(c=>c.name==='Psychic Energy'))
      return {kind:'recover-psychic',handIndex:stretcher};
  }
  if (benchIndex>=0 && mimikyu.energies.cards.length>=2 &&
      player.retreatedTurn!==state.turn && active==='Latias ex SSP')
    return {kind:'promote-mimikyu',benchIndex};
  return null;
}

/** @returns {Function} */
function createTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {RetreatAction}=load('game/store/actions/game-actions');
  return class CopycatSetupTactic extends SimpleTactic {
    useTactic(state,player) {
      const c=chooseSetupAction(state,player);
      if (!c) return;
      if (c.kind==='promote-mimikyu')
        return new RetreatAction(player.id,c.benchIndex);
      return new PlayCardAction(player.id,c.handIndex,
        c.kind==='attach-psychic'
          ? {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:c.benchIndex}
          : {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }
  };
}

/** @returns {Function} */
function createDiscardResolver() {
  const {ChooseCardsPromptResolver}=
    load('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GameMessage}=load('game/game-message');
  return class CopycatDiscardResolver extends ChooseCardsPromptResolver {
    resolvePrompt(state,player,prompt) {
      const enemy=state.players.find(p=>p.id!==player.id);
      if (state.turn===27 && prompt instanceof ChooseCardsPrompt &&
          prompt.playerId===player.id &&
          prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD &&
          state.playerLastAttack?.[enemy.id]?.attack?.name==='Apex Dragon') {
        const card=prompt.cards?.cards?.find(c=>c.fullName==='Dialga-GX UPR');
        if (card && prompt.validate([card]))
          return new ResolvePromptAction(prompt.id,[card]);
      }
      return super.resolvePrompt(state,player,prompt);
    }
  };
}
/** @param {object} options @returns {object} */
function withCopycatTurn27Setup(options) {
  const i=options.promptResolvers.findIndex(c=>c.name==='ChooseCardsPromptResolver');
  if (i<0) throw Error('Pinned ChooseCardsPromptResolver missing');
  return {...options,tactics:[createTactic(),...options.tactics],
    promptResolvers:[...options.promptResolvers.slice(0,i),createDiscardResolver(),
      ...options.promptResolvers.slice(i)]};
}
module.exports={chooseSetupAction,createTactic,createDiscardResolver,
  withCopycatTurn27Setup};
