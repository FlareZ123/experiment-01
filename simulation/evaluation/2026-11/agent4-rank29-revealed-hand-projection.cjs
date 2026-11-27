'use strict';

/**
 * Narrow actor-only projection bridge for original Aichi rank-29 opponent's
 * Eri / Sidney / Team Skull Grunt. Their printed effects reveal the
 * opponent's hand, while the pinned generic projector ordinarily refuses
 * to expose ordinary opponent-private hand cards.
 *
 * This bridge NEVER marks the actual live opponent's hand public. It
 * constructs an ephemeral read-only projection clone only after an exact
 * pending prompt, printed Supporter, physical opponent-hand identity,
 * native choosing-seat, and provenance witness are present simultaneously.
 *
 * Must be consciously installed by the owning native experiment runner;
 * it is NOT wired to main or admitted for competitive use.
 */
const VERSION='agent4-rank29-revealed-hand-projection-v1';
const SOURCES=new Set(['Eri TEF','Sidney FST 241','Team Skull Grunt SUM']);

function physicalSupporterSource({prompt,state,actorSeat,provenanceHook}={}) {
  if (![0,1].includes(actorSeat) || !state ||
      !Array.isArray(state.players) || state.players.length!==2 ||
      !prompt || prompt.constructor?.name!=='ChooseCardsPrompt' ||
      prompt.result!==undefined ||
      prompt.message!=='CHOOSE_CARD_TO_DISCARD')return null;
  const player=state.players[actorSeat],opponent=state.players[1-actorSeat];
  if (!player||!opponent || prompt.playerId!==player.id ||
      prompt.getPerspectivePlayerId?.()!==player.id ||
      prompt.cards!==opponent.hand ||
      !Array.isArray(opponent.hand?.cards) ||
      !Array.isArray(player.supporter?.cards) ||
      opponent.hand.isPublic===true)return null;
  // The pinned printed cards all prompt the acting Supporter owner to
  // choose zero-to-two cards from the genuinely revealed opponent hand.
  if (prompt.options?.min!==0 ||
      prompt.options?.max!==2 ||
      prompt.options?.allowCancel!==false)return null;
  const provenance=provenanceHook?.getPromptProvenance?.(prompt);
  if(provenance?.sourceKind!=='card-effect' ||
      !provenance.sourceCard ||
      typeof provenance.effectName!=='string' ||
      provenance.effectName.length===0)return null;
  const source=provenance.sourceCard;
  if(!SOURCES.has(source.fullName) ||
      !player.supporter.cards.includes(source))return null;
  if(prompt.sourceCard&&prompt.sourceCard!==source)return null;
  return {source:source.fullName,actorSeat};
}

function ephemeralRevealedState(state,actorSeat) {
  const opponentSeat=1-actorSeat;
  const previous=state.players[opponentSeat];
  const projectedHand=Object.assign(
    Object.create(Object.getPrototypeOf(previous.hand)),
    previous.hand,{isPublic:true}
  );
  const projectedOpponent=Object.assign(
    Object.create(Object.getPrototypeOf(previous)),
    previous,{hand:projectedHand}
  );
  const projectedState=Object.assign(
    Object.create(Object.getPrototypeOf(state)),
    state,{players:state.players.map((p,i)=>i===opponentSeat?projectedOpponent:p)}
  );
  return projectedState;
}

function projectRank29RevealedHandPrompt(args={}) {
  const base=args.baseProjectPrompt ?? require('./agent36-prompt-projection.cjs').projectPrompt;
  if(typeof base!=='function')throw Error('NO_BASE_PROJECTION');
  const witness=physicalSupporterSource(args);
  if(!witness) return base(args); // normal physical privacy gate untouched
  const originalOpponent=args.state.players[1-args.actorSeat];
  const originalPublic=originalOpponent.hand.isPublic;
  const clone=ephemeralRevealedState(args.state,args.actorSeat);
  const output=base({...args,state:clone});
  // The real Store and the actual opponent hand remain private and
  // unchanged after projection. The worker only sees that one native
  // source-triggered typed prompt's enumerated legal Item/Energy/Tool choices.
  if(originalOpponent.hand.isPublic!==originalPublic ||
     args.state.players[1-args.actorSeat]!==originalOpponent ||
     args.state.players[1-args.actorSeat].hand!==originalOpponent.hand)
    throw Error('PROJECTION_MUTATED_LIVE_HAND');
  return {...output,
    rank29RevealedHandEvidence:{
      version:VERSION,actorSeat:witness.actorSeat,
      sourcePrinting:witness.source,
      physicalOpponentHandPrompt:true,
      liveHandWasNotMutated:true
    }};
}
module.exports={VERSION,SOURCES,physicalSupporterSource,
  ephemeralRevealedState,projectRank29RevealedHandPrompt};
