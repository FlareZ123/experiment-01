'use strict';
const { ticketCompressor, verifyCompressor } = require('./aichi-meloetta-ticket-compressor.cjs');
/**
 * Restricted first-turn prize-redeal opportunity followed by a legal Battle
 * Compressor shuffle (selecting zero cards to discard) and k additional draws.
 * DCE is a marked singleton originally among q Prizes, and there is one Ticket.
 * The event is conditional on a Basic in the initial h cards. The first normal
 * turn draw is always included before the Ticket and Compressor are played.
 * This is a resource-location model, not a complete attack or win estimator.
 *
 * @param {number} n Deck size
 * @param {number} b Starting-eligible Basic Pokemon copies
 * @param {number} h Opening hand size
 * @param {number} q Number of initial Prize cards
 * @param {number} c Battle Compressor copies
 * @param {number} k Subsequent uniformly random draws after the Compressor shuffle
 */
function ticketPostShuffleAccess(n,b,h,q,c,k) {
  const firstTurnRemaining=n-h-q-1;
  if(!Number.isInteger(k)||firstTurnRemaining<q||k<0||k>firstTurnRemaining) {
    throw new RangeError('Invalid post-redeal draw horizon');
  }
  const direct=ticketCompressor(n,b,h,q,c);
  // Ticket exchanges q Prizes for q drawn from the existing deck front.
  // With at least q other cards before the returned bottom block, the
  // distinguished DCE is in the deck, always outside the new Prize cards.
  const afterShuffle=k/firstTurnRemaining;
  // Without a subsequent shuffle, the DCE remains uniformly somewhere among
  // the final q card positions because Ticket shuffles the returned Prizes.
  const withoutShuffle=Math.max(0,k-(firstTurnRemaining-q))/q;
  return {
    cardsRemaining:firstTurnRemaining,
    directTicketCompressor:direct.directRoute,
    conditionalAfterShuffle:afterShuffle,
    unconditionalAfterShuffle:direct.directRoute*afterShuffle,
    conditionalWithoutShuffle:withoutShuffle,
    unconditionalWithoutShuffle:direct.directRoute*withoutShuffle
  };
}
function verifyRank26PostShuffle(manifest) {
  const c=verifyCompressor(manifest);
  const deck=manifest.decks.find(d=>d.rank===26);
  const sourceBasics=new Set(['Unown','Exeggcute','Meloetta ex','Tapu Koko ♢','Bunnelby','Squawkabilly ex','Crobat V','Dedenne-GX']);
  const pokemon=deck.cards.filter(x=>x.category==='Pokémon');
  if(pokemon.some(x=>!sourceBasics.has(x.name)))throw new Error('Rank 26 source changed: recalculate Basic count');
  const basicCount=pokemon.reduce((n,x)=>n+x.count,0);
  if(basicCount!==12)throw new Error('Rank 26 Basic count changed');
  return {basicCount,compressorCount:c};
}
if(require.main===module){
  const path=require('node:path'),fs=require('node:fs');
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const {basicCount,compressorCount}=verifyRank26PostShuffle(manifest);
  console.log(JSON.stringify({rank:26,drawHorizon:[1,4,7,40,41,46].map(k=>({k,...ticketPostShuffleAccess(60,basicCount,7,6,compressorCount,k)}))},null,2));
}
module.exports={ticketPostShuffleAccess,verifyRank26PostShuffle};
