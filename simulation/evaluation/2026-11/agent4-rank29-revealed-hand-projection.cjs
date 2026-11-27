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

function nativeLegalRevealedIndices({prompt,state,actorSeat}={}){
  const opponent=state.players[1-actorSeat];
  if(typeof prompt.validate!=='function')throw Error('REVEALED_PROMPT_VALIDATOR_MISSING');
  const blocked=new Set(prompt.options?.blocked??[]);
  const valid=new Set();
  for(let i=0;i<opponent.hand.cards.length;i++){
    if(blocked.has(i))continue;
    const card=opponent.hand.cards[i];
    let accepted=false;
    try{accepted=prompt.validate([card],state)===true;}
    catch {accepted=false;}
    if(accepted)valid.add(i);
  }
  return valid;
}

function filterRevealedProjection(output,valid,witness){
  const raw=output?.promptProjection;
  if(!raw || raw.promptType!=='ChooseCardsPrompt' ||
     raw.source?.classification!=='actor-choice' ||
     raw.source?.sourceKind!=='card-effect' ||
     raw.source?.sourcePrinting!==witness.source ||
     raw.publicMetadata?.selectionType!=='card-combination' ||
     raw.publicMetadata?.ownerSeat!=='opponent' ||
     raw.publicMetadata?.sourceZone!=='hand' ||
     raw.publicMetadata?.isOwnerVisible!==true ||
     !Array.isArray(raw.choices) ||
     !(output.choiceByToken instanceof Map))
    throw Error('REVEALED_PROJECTION_SHAPE_MISMATCH');
  const selected=raw.choices.filter(choice=>
    choice.kind==='empty-selection' ||
    (choice.kind==='card' && valid.has(choice.publicMetadata?.selectionIndex) &&
      choice.publicMetadata?.ownerSeat==='opponent' &&
      choice.publicMetadata?.sourceZone==='hand' &&
      choice.publicMetadata?.isOwnerVisible===true));
  if(!selected.length)throw Error('NO_LEGAL_REVEALED_CHOICE');
  const max=Math.min(raw.publicMetadata.maximumCount,valid.size);
  if(!Number.isSafeInteger(max)||max<raw.publicMetadata.minimumCount)
    throw Error('REVEALED_SELECTION_BOUNDS_INCONSISTENT');
  const updated=Object.freeze({...raw,
    publicMetadata:Object.freeze({...raw.publicMetadata,maximumCount:max}),
    choices:Object.freeze(selected)});
  const tokenSet=new Set(selected.map(choice=>choice.token));
  const filtered=new Map([...output.choiceByToken].filter(([token])=>tokenSet.has(token)));
  if(filtered.size!==selected.length)
    throw Error('REVEALED_CHOICE_TOKEN_MAP_INCONSISTENT');
  return {...output,promptProjection:updated,choiceByToken:filtered,
    diagnostics:Object.freeze({...output.diagnostics,choiceCount:selected.length})};
}

function projectRank29RevealedHandPrompt(args={}) {
  const base=args.baseProjectPrompt ?? require('./agent36-prompt-projection.cjs').projectPrompt;
  if(typeof base!=='function')throw Error('NO_BASE_PROJECTION');
  const witness=physicalSupporterSource(args);
  if(!witness) return base(args); // normal physical privacy gate untouched
  const originalOpponent=args.state.players[1-args.actorSeat];
  const originalPublic=originalOpponent.hand.isPublic;
  const legal=nativeLegalRevealedIndices(args);
  const clone=ephemeralRevealedState(args.state,args.actorSeat);
  const projected=base({...args,state:clone});
  const output=filterRevealedProjection(projected,legal,witness);
  // Physical source validation prunes all non-selectable cards (including
  // ordinary Supporters/Pokémon). Source was physically revealed; no other
  // private hand identity may enter the worker. Live Store remains unchanged.
  if(originalOpponent.hand.isPublic!==originalPublic ||
     args.state.players[1-args.actorSeat]!==originalOpponent ||
     args.state.players[1-args.actorSeat].hand!==originalOpponent.hand)
    throw Error('PROJECTION_MUTATED_LIVE_HAND');
  return {...output,
    rank29RevealedHandEvidence:{
      version:VERSION,actorSeat:witness.actorSeat,
      sourcePrinting:witness.source,
      physicalOpponentHandPrompt:true,
      eligibleNativeCards:legal.size,
      liveHandWasNotMutated:true
    }};
}
module.exports={VERSION,SOURCES,physicalSupporterSource,
  ephemeralRevealedState,nativeLegalRevealedIndices,filterRevealedProjection,
  projectRank29RevealedHandPrompt};
