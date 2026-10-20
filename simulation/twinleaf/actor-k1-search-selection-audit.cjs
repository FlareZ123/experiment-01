'use strict';

const TARGETS=Object.freeze([
  'Mewtwo & Mew-GX UNM','Gengar & Mimikyu-GX TEU',
  'Trevenant & Dusknoir-GX SMP','Galarian Articuno V CRE',
  'Battle Compressor PHF','Powerglass SFA','Duskull VIV',
  'Dusclops SFA','Psychic Energy SVE',
  'Telepathic Psychic Energy MEE'
]);

/**
 * Read real owned-deck prompt only after Store has started a search that
 * entitles the player to inspect the entire remaining own deck. Pure capture
 * of exact printing counts and legal singleton answers. It cannot distinguish
 * a speculative State from a real Store, so its caller MUST do so.
 *
 * @param {object} state The native State currently in the actual Store.
 * @param {0|1} seat Physical player owning the native pending prompt.
 * @param {object} prompt Pending native ChooseCardsPrompt from this State.
 * @param {readonly string[]} [targets] Printing identities under study.
 * @returns {object|null}
 */
function actorK1SearchSelectionAudit(state,seat,prompt,targets=TARGETS){
  const owner=state.players[seat];
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
      prompt.playerId!==owner.id||prompt.cards!==owner.deck||
      prompt.result!==undefined)return null;
  const printings=prompt.cards.cards.map(card=>card.fullName);
  const exact=new Map();
  for(const printing of printings){
    exact.set(printing,(exact.get(printing)??0)+1);
  }
  const targetNames=[...new Set(targets)];
  const legalSingles={};
  for(const printing of targetNames){
    const card=prompt.cards.cards.find(card=>card.fullName===printing);
    legalSingles[printing]=Boolean(card&&prompt.validate([card],state));
  }
  return {
    turn:state.turn,seat,promptId:String(prompt.id),
    ownerSearchAuthenticatedByCaller:true,
    observedDeckCount:printings.length,
    targetCounts:Object.fromEntries(targetNames.map(printing=>[
      printing,exact.get(printing)??0])),
    legalSingletonChoice:legalSingles,
    ownHandTargets:Object.fromEntries(targetNames.map(printing=>[
      printing,owner.hand.cards.filter(card=>
        card.fullName===printing).length])),
    ownActive:owner.active.getPokemonCard()?.fullName??null,
    ownBench:owner.bench.map(slot=>slot.getPokemonCard()?.fullName??null)
  };
}

module.exports={TARGETS,actorK1SearchSelectionAudit};
