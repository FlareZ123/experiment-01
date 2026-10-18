'use strict';

const safeDiscards = ['Tropical Beach', "Trainers' Mail", 'Palace Belt', 'Camping Gear'];

/**
 * Choose two physically distinct, lower-protection hand cards. The heuristic
 * deliberately excludes Energy, printed Pokémon and all Supporters.
 * @param {{name:string}[]} hand Source player's currently visible hand.
 * @returns {{name:string}[]}
 */
function safeDiscardPair(hand) {
  const selected = [];
  for (const name of safeDiscards) {
    for (const card of hand) {
      if (card.name === name && selected.length < 2 && !selected.includes(card)) {
        selected.push(card);
      }
    }
  }
  return selected.length === 2 ? selected : [];
}

/**
 * An own-hand-only opening plan. Any card sought from the deck remains an
 * unconfirmed request until a genuine owner-visible deck-search prompt.
 * @param {{name:string}[]} hand
 * @returns {{entry:'direct'|'guzma-hala'|'tag-call',requiresDce:boolean,
 *  requiresThunder:boolean,discards:{name:string}[]}|null}
 */
function planVisibleOpening(hand) {
  const contains = name => hand.some(card => card.name === name);
  const requiresDce = !contains('Double Colorless Energy');
  const requiresThunder = !contains('Thunder Mountain Prism Star');
  if (!requiresDce && !requiresThunder) {
    return {entry:'direct',requiresDce:false,requiresThunder:false,discards:[]};
  }
  const entry = contains('Guzma & Hala') ? 'guzma-hala' :
    contains('Tag Call') ? 'tag-call' : null;
  if (!entry) return null;
  const discards = requiresDce ? safeDiscardPair(hand) : [];
  if (requiresDce && discards.length !== 2) return null;
  return {entry,requiresDce,requiresThunder,discards};
}

module.exports = {safeDiscards,safeDiscardPair,planVisibleOpening};
