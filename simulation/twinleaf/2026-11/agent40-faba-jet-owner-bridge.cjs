'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent40-owner-public-faba-jet-hood-bridge-v1';

/**
 * Find the one face-up protected AOR Item lock on a public opponent board.
 * Multiple live protected copies make a single Faba / Jet exchange
 * insufficient for Nest Ball; the chooser declines rather than overclaiming.
 *
 * @param {object} opponentPublic Detached actor-only public observation.
 * @returns {{slot:'active'|'bench',index:number}|null}
 */
function hoodedVileplumeTarget(opponentPublic) {
  const visible = [
    {slot:'active',index:0,pokemon:opponentPublic?.active},
    ...(opponentPublic?.bench??[]).map((pokemon,index)=>
      ({slot:'bench',index,pokemon}))
  ];
  const locks = visible.filter(({pokemon})=>
    pokemon?.printing==='Vileplume AOR'&&
    pokemon.abilityDetails?.some(a=>a.name==='Irritating Pollen'));
  const protectedLocks=locks.filter(({pokemon})=>
    pokemon.tools?.some(t=>t.startsWith('Stealthy Hood ')));
  if(protectedLocks.length!==1)return null;
  return {slot:protectedLocks[0].slot,index:protectedLocks[0].index};
}

/**
 * A high-specificity owner-only Supporter proposal for exact original
 * rank7-style hand/board state. It pays the Supporter for the turn, so only
 * consider the line if the next two axes (Jet promotion and Nest Ball) are
 * already physically in the own hand and their public space is available.
 * It makes no guess about hidden Prize identities.
 *
 * @param {object} view Frozen detached actorObservation root.
 * @returns {object|null}
 */
function chooseFabaJetHoodRoot(view) {
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||
    own.active.printing==='Wobbuffet PHF'||
    !own.bench?.some(p=>p?.printing==='Wobbuffet PHF')||
    !own.bench.some(p=>p===null)||
    own.deckCount<=0||
    resources?.supporterPlayedTurn!==0||
    resources?.supporterPlayLocked===true||
    own.publicTurnRestrictions?.supporterPlayLocked===true||
    resources?.energyPlayedTurn===view.globalTurn||
    resources?.energyPlayLocked===true||
    resources?.specialEnergyPlayLocked===true||
    own.publicTurnRestrictions?.energyPlayLocked===true||
    own.publicTurnRestrictions?.specialEnergyPlayLocked===true||
    [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
      .some(p=>p.startsWith('Temple of Sinnoh ')))return null;
  const target=hoodedVileplumeTarget(view.opponentPublic);
  if(!target)return null;
  const fabaIndex=view.ownHand.findIndex(p=>p==='Faba LOT');
  if(fabaIndex<0||!view.ownHand.some(p=>p==='Jet Energy PAL')||
    !view.ownHand.some(p=>p.startsWith('Nest Ball ')))return null;
  return {
    kind:'play-faba-jet-hood',printing:'Faba LOT',handIndex:fabaIndex,
    target,reason:'remove-hood-before-jet-wobbuffet-item-unlock'
  };
}

/**
 * Answer an actual Faba owner prompt after the chosen Supporter was accepted.
 * The caller must authenticate both prompt owner and Faba's pending chain.
 * Only exact face-up opponent Hood targets are searched here, never hidden
 * opponent zones. Returns the exact native prompt result, not a root action.
 *
 * @param {object} view Genuine detached owner prompt observation.
 * @param {object} prompt The native pending prompt, authenticated by caller.
 * @param {object} state The Store state, used only by prompt.decode.
 * @param {{PlayerType:object,SlotType:object}} native Native target constants.
 * @returns {{answer:object|number,kind:string}|null}
 */
function chooseFabaJetHoodPrompt(view,prompt,state,native) {
  assert.equal(view.decisionKind,'owner-prompt');
  const target=hoodedVileplumeTarget(view.opponentPublic);
  if(!target||!prompt||prompt.result!==undefined)return null;
  if(prompt.type==='Select'&&
    prompt.message==='DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY') {
    const answer=prompt.values.indexOf('CHOICE_TOOL');
    return answer<0?null:{answer,kind:'faba-select-tool'};
  }
  if(prompt.type==='Choose pokemon'&&
    prompt.message==='CHOOSE_POKEMON_TO_DISCARD_CARDS') {
    const descriptor={
      player:native.PlayerType.TOP_PLAYER,
      slot:target.slot==='bench'?
        native.SlotType.BENCH:native.SlotType.ACTIVE,
      index:target.index
    };
    return {
      answer:prompt.decode([descriptor],state),
      kind:'faba-target-hooded-vileplume'
    };
  }
  return null;
}

/**
 * Once source Wobb is Active, propose its original held Item. The native
 * Store then verifies Item permissions and owns the Basic search prompt.
 *
 * @param {object} view Frozen detached owner root.
 * @returns {object|null}
 */
function choosePostJetNestRoot(view) {
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  if(own?.active?.printing!=='Wobbuffet PHF'||
      !own.bench?.some(p=>p===null)||
      own.deckCount<=0||
      view.ownTurnResources?.itemPlayLocked===true||
      own.publicTurnRestrictions?.itemPlayLocked===true)return null;
  const handIndex=view.ownHand.findIndex(p=>p.startsWith('Nest Ball '));
  if(handIndex<0)return null;
  return {kind:'play-nest-after-jet',printing:view.ownHand[handIndex],
    handIndex,reason:'use-unlocked-source-basic-search'};
}

module.exports={VERSION,hoodedVileplumeTarget,
  chooseFabaJetHoodRoot,chooseFabaJetHoodPrompt,choosePostJetNestRoot};
