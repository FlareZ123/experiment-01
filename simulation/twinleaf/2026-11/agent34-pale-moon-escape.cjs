'use strict';
const assert = require('node:assert/strict');

/**
 * Project only an already-public attack's impending KO on the exact native
 * PokemonCardList. No deck, hand, Prize, or arbitrary native effect is copied.
 * null means the engine's queue is missing, not proof that no threat exists.
 * This is a PUBLIC tactical fact, not a replacement for paper-correct
 * switch/evolution/devolution cleanup in the Store.
 */
/**
 * A printed no-Prize effect makes an impending KO nonterminal even when the
 * opponent has only one Prize. This is deliberately conservative: if the
 * current active is a known Prize-free Doll/Shedinja or has Life Dew or
 * attached Shedinja, do not override Pass based on a false terminal premise.
 * Legacy Energy does NOT qualify: its reduction requires KO by damage, and
 * Pale Moon-GX's delayed Knock Out is an attack effect rather than damage.
 */
function knownNoPrizeAwardOnPaleMoonKO(view) {
  const p=view?.ownPublic?.active;
  const printing=typeof p?.printing==='string'?p.printing:'';
  const tools=Array.isArray(p?.tools)?p.tools:[];
  if(printing.startsWith('Shedinja DRX')||
     printing.startsWith('Robo Substitute')||
     printing.startsWith('Snorlax Doll')||
     printing.includes('Poké Doll')||
     printing.includes('Poke Doll'))return true;
  return tools.some(tool=>typeof tool==='string'&&(
    tool.startsWith('Life Dew ')||tool.startsWith('Shedinja LOT')));
}
function terminalPaleMoonPrizeRisk(view) {
  return view?.opponentPublic?.prizeCount===1 &&
    view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut===true &&
    !knownNoPrizeAwardOnPaleMoonKO(view);
}

function pendingPaleMoonGXKnockOut(player, slot) {
  const effects = player?.pendingEndOfTurnEffects;
  if (effects === undefined || effects === null) return null;
  assert.ok(Array.isArray(effects), 'Pale Moon public effect queue must be an array');
  // Pale Moon-GX affects the Defending Pokemon, not a future Bench target.
  // The pinned engine retains stale pending records after Active -> Bench;
  // such a record is NOT a live attack effect under paper switch rules.
  if (player.active !== slot) return false;
  return effects.some(effect => effect?.type === 'knock_out' &&
    effect?.attack?.name === 'Pale Moon-GX' && effect?.target === slot);
}

/**
 * A deliberately narrow actor-only real root choice: protect an Active
 * Pokemon with a known pending Pale Moon-GX KO by using the ONE offered
 * legal RetreatAction, ONLY when there is ONE occupied Bench target and
 * no offered attack. Other decisions remain the existing worker's job.
 * This returns a native token, not a forged action or a complete game policy.
 */
function choosePaleMoonEscapeRetreat(view, items) {
  if (view?.decisionKind !== 'owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut !== true ||
      !terminalPaleMoonPrizeRisk(view) ||
      !Array.isArray(items) ||
      items.some(item => !['pass','retreat'].includes(item?.kind))) return null;
  const benches = view.ownPublic.bench;
  if (!Array.isArray(benches)) return null;
  const occupied = benches.map((slot, index) => slot ? index : -1).filter(index => index >= 0);
  if (occupied.length !== 1) return null;
  const retreats = items.filter(item => item?.kind === 'retreat' &&
    item.publicMetadata?.targetSeat === 'actor' &&
    item.publicMetadata?.benchIndex === occupied[0] &&
    item.publicMetadata?.targetIndex === occupied[0] &&
    item.publicMetadata?.targetZone === 'bench' &&
    (typeof item.token === 'string' || Number.isSafeInteger(item.token)));
  if (retreats.length !== 1) return null;
  return { token: retreats[0].token, reason: 'PUBLIC_PALE_MOON_PENDING_KO_SINGLE_LEGAL_RETREAT' };
}


/**
 * A second, distinct complete no-prompt paper reply for a source printing
 * held by Hood Shield but omitted by Lockbridge. Pinned Pokemon Ranger STS
 * calls removeAttackEffectsFromPlayerAndPokemon(), which clears the queued
 * delayed knock_out. Only a single offered native Ranger root versus Pass
 * qualifies; any additional tactical choice is left to a stronger policy.
 */
function choosePaleMoonEscapeRanger(view, items) {
  if (view?.decisionKind !== 'owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut !== true ||
      !terminalPaleMoonPrizeRisk(view) ||
      !Array.isArray(items) ||
      items.some(item => !['pass','play-card'].includes(item?.kind))) return null;
  const available = items.filter(item => item?.kind === 'play-card');
  if (available.length !== 1) return null;
  const ranger = available[0];
  if (ranger.actorPrinting !== 'Pokemon Ranger STS' ||
      !(typeof ranger.token === 'string' || Number.isSafeInteger(ranger.token))) return null;
  const resources = view.ownTurnResources;
  if (resources?.supporterPlayLocked !== false ||
      resources?.supporterPlayedTurn !== 0) return null;
  // Preserve any known continuing own Altered Creation-GX advantages.
  const own = view.ownPublic?.publicTurnRestrictions;
  if (own?.alteredCreationDamage !== false ||
      own?.usedAlteredCreation !== false) return null;
  return { token: ranger.token, reason: 'PUBLIC_PALE_MOON_PENDING_KO_ONLY_RANGER_ROOT' };
}


/**
 * Single-target, last-Prize Guzma fallback. Guzma's two mandatory Pokemon
 * selections are handled separately with authenticated prompt tokens below.
 * Only Pass+one exact Guzma root qualifies. This is not a replacement for
 * an existing multi-axis Guzma planner in richer states.
 */
function choosePaleMoonEscapeGuzmaRoot(view, items) {
  if(view?.decisionKind !== 'owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut !== true ||
      !terminalPaleMoonPrizeRisk(view) ||
      !Array.isArray(items) ||
      items.some(item => !['pass','play-card'].includes(item?.kind))) return null;
  const benches = [view.ownPublic?.bench,view.opponentPublic?.bench];
  if(benches.some(rows=>!Array.isArray(rows) || rows.filter(Boolean).length!==1))return null;
  const supporter=view.ownTurnResources;
  if(supporter?.supporterPlayLocked!==false ||
     supporter?.supporterPlayedTurn!==0)return null;
  const plays=items.filter(item=>item?.kind==='play-card');
  if(plays.length!==1)return null;
  const guzma=plays[0];
  if(guzma.actorPrinting!=='Guzma BUS' ||
     !(typeof guzma.token==='string' || Number.isSafeInteger(guzma.token)))return null;
  return {token:guzma.token,reason:'PUBLIC_PALE_MOON_LAST_PRIZE_ONLY_GUZMA_ROOT'};
}

/**
 * Authenticated card-effect ChoosePokemonPrompt after an accepted Guzma
 * root. Choose exactly one physical Bench target by HOST OFFER TOKEN;
 * never confuse a filtered selection ordinal with a real Bench index.
 * Returning null for ambiguous prompts prevents speculative resolution.
 */
function choosePaleMoonEscapeGuzmaPrompt(view, prompt) {
  if(view?.decisionKind!=='owner-prompt' ||
     view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut!==true ||
     !terminalPaleMoonPrizeRisk(view) ||
     prompt?.promptType!=='ChoosePokemonPrompt' ||
     prompt?.source?.classification!=='actor-choice' ||
     prompt?.source?.sourceKind!=='card-effect' ||
     prompt.source.effectName!=='Guzma' ||
     prompt.source.sourcePrinting!=='Guzma BUS' ||
     prompt?.publicMetadata?.selectionType!=='pokemon' ||
     !([0,1].includes(prompt.publicMetadata.minimumCount)) ||
     prompt.publicMetadata.maximumCount!==1 ||
     prompt.publicMetadata.allowCancel!==false ||
     !Array.isArray(prompt.choices)) return null;
  const valid=prompt.choices.filter(choice=>{
    if(choice?.kind!=='pokemon' ||
       choice.publicMetadata?.targetZone!=='bench' ||
       !['actor','opponent'].includes(choice.publicMetadata.ownerSeat) ||
       !Number.isSafeInteger(choice.publicMetadata.benchIndex) ||
       choice.publicMetadata.benchIndex<0 ||
       !(typeof choice.token==='string'||Number.isSafeInteger(choice.token)))return false;
    const physical=choice.publicMetadata.ownerSeat==='actor'?
      view.ownPublic.bench: view.opponentPublic.bench;
    return Array.isArray(physical) &&
      physical[choice.publicMetadata.benchIndex]?.printing===choice.printing;
  });
  if(valid.length!==1 || prompt.choices.some(choice=>
      choice?.kind==='pokemon'&&!valid.includes(choice)))return null;
  // Pinned own-switch prompt omits min (projected as 0), though printed
  // Guzma still requires switching after a successful opposing gust.
  if(prompt.publicMetadata.minimumCount===0 &&
     valid[0].publicMetadata.ownerSeat!=='actor')return null;
  return {token:valid[0].token,
    reason:'PUBLIC_PALE_MOON_GUZMA_EXACT_SINGLE_BENCH_PROMPT'};
}

/**
 * Integration-safe root fallback. The upstream candidate worker retains
 * all its normal sequencing and only calls this BEFORE dispatching a Pass.
 * A public, terminal Pale Moon queue makes Pass lose immediately. Select
 * one distinct proven rescue (retreat, Ranger or Guzma) offered in the FULL
 * genuine native frontier; do not require the entire frontier to be tiny.
 * If several rescues compete, abstain rather than silently rank their costs.
 *
 * No synthetic action is constructed: the chosen token is an offered token.
 * All non-Pass, winning attack, setup and unknown-policy decisions stay with
 * the caller.
 */
/**
 * Optional two-root emergency line for the candidate's exact Float Stone.
 * First play the offered Tool on our threatened Active (not a fabricated
 * target); AFTER native Store resolution the ordinary next root should
 * expose a payable retreat for the terminal Pass override to choose.
 * We abstain when any known lock, Tool suppression, alternate Tool, or
 * ambiguous physical Bench target could invalidate the continuation.
 */
function choosePaleMoonFloatStonePreparation(view,items) {
  if(view?.decisionKind!=='owner-root'||
     view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut!==true ||
     !terminalPaleMoonPrizeRisk(view) || !Array.isArray(items))return null;
  const player=view.ownPublic,active=player.active,opponent=view.opponentPublic;
  if(!Array.isArray(player.bench) || player.bench.filter(Boolean).length!==1 ||
     !Array.isArray(active?.tools) || active.tools.length!==0 ||
     !Array.isArray(active?.specialConditions) || active.specialConditions.length!==0 ||
     !Array.isArray(active?.printed?.retreatCost) || active.printed.retreatCost.length===0 ||
     view.ownTurnResources?.retreatedTurn!==0 ||
     view.ownTurnResources?.toolPlayLocked!==false)return null;
  const r=active.publicRestrictions??{};
  if(r.cannotRetreat!==false || r.cannotRetreatNextTurn!==false ||
     r.cannotRetreatWhileActive!==false)return null;
  if(player.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining!==0 ||
     opponent.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining!==0)
    return null;
  const stadiums=[...(player.stadium??[]),...(opponent.stadium??[])];
  if(stadiums.some(p=>typeof p==='string' && p.includes('Jamming Tower')))return null;
  if((opponent.active?.tools??[]).some(p=>
      typeof p==='string' && p.includes('Tool Jammer')))return null;
  const stones=items.filter(item=>item?.kind==='play-card'&&
     ['Float Stone PLF','Float Stone BKT'].includes(item.actorPrinting)&&
     item.publicMetadata?.targetSeat==='actor'&&
     item.publicMetadata?.targetZone==='active'&&
     item.publicMetadata?.targetIndex===0&&
     (typeof item.token==='string'||Number.isSafeInteger(item.token)));
  if(stones.length!==1)return null;
  if(stones[0].targetPrinting!==undefined&&
     stones[0].targetPrinting!==active.printing)return null;
  return {token:stones[0].token,
    reason:'PUBLIC_PALE_MOON_FLOAT_STONE_PREPARE_ZERO_RETREAT'};
}

function rescuePaleMoonTerminalPass(view,items,originalToken) {
  if(!Array.isArray(items) ||
      view?.decisionKind!=='owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut!==true ||
      !terminalPaleMoonPrizeRisk(view))return null;
  const passes=items.filter(item=>item?.kind==='pass');
  if(passes.length!==1 || passes[0].token!==originalToken)return null;
  const saves=[];
  for(const item of items){
    if(item?.kind==='retreat') {
      const choice=choosePaleMoonEscapeRetreat(view,[passes[0],item]);
      if(choice)saves.push(choice);
    }else if(item?.kind==='play-card') {
      const choice=item.actorPrinting==='Pokemon Ranger STS'?
        choosePaleMoonEscapeRanger(view,[passes[0],item]):
        item.actorPrinting==='Guzma BUS'?
          choosePaleMoonEscapeGuzmaRoot(view,[passes[0],item]):null;
      if(choice)saves.push(choice);
    }
  }
  if(saves.length>1)return null;
  if(saves.length===1)return {token:saves[0].token,
    reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_OVERRIDE',
    selectedSourceReason:saves[0].reason};
  const setup=choosePaleMoonFloatStonePreparation(view,items);
  return setup?{token:setup.token,
    reason:'PUBLIC_PALE_MOON_TERMINAL_PASS_PREPARATION',
    selectedSourceReason:setup.reason}:null;
}

module.exports = {
  pendingPaleMoonGXKnockOut,
  choosePaleMoonEscapeRetreat,
  choosePaleMoonEscapeRanger,
  choosePaleMoonEscapeGuzmaRoot,
  choosePaleMoonEscapeGuzmaPrompt,
  rescuePaleMoonTerminalPass,
  choosePaleMoonFloatStonePreparation,
  knownNoPrizeAwardOnPaleMoonKO,
  terminalPaleMoonPrizeRisk
};
