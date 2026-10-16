'use strict';
const fs=require('node:fs'),path=require('node:path');
/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){if(k<0||k>n)return 0;let r=Math.min(k,n-k),v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v)}
/**
 * Conditional direct Prize-redemption opportunity for a required singleton
 * non-Basic card D and a non-Basic singleton Redeemable Ticket T.
 * @param {number} n Total cards
 * @param {number} basics Basic starters
 * @param {number} hand Opening hand
 * @param {number} prizes Prize cards
 */
function ticketOpportunity(n,basics,hand,prizes){
 if(![n,basics,hand,prizes].every(Number.isInteger)||n<4||n>60||basics<1||basics>n-2||hand<1||prizes<1||hand+prizes>=n-1)throw new RangeError('Invalid setup');
 const v=choose(n,hand)-choose(n-basics,hand);
 const d=(choose(n-1,hand)-choose(n-basics-1,hand))/v*prizes/(n-hand);
 const initial=(choose(n-2,hand-1)-choose(n-basics-2,hand-1))/v*prizes/(n-hand);
 const draw=(choose(n-2,hand)-choose(n-basics-2,hand))/v*prizes/((n-hand)*(n-hand-1));
 return {validOpening:v/choose(n,hand),requiredPrized:d,ticketInitially:initial,ticketTurnDraw:draw,prizedAndTicketInEight:initial+draw,prizedWithoutDirectTicket:d-initial-draw,directTicketGivenPrized:(initial+draw)/d};
}
/** @param {object} manifest Aichi published-deck manifest */
function verifyRank26(manifest){
 const deck=manifest.decks.find(d=>d.rank===26);
 if(!deck)throw new Error('Missing source rank 26');
 const expected={'Double Colorless Energy':1,'Redeemable Ticket':1,'Lightning Energy':2,'Meloetta ex':1,'Technical Machine: Crisis Punch':2,'Tapu Koko ♢':1};
 for(const [name,quantity] of Object.entries(expected)){
  const count=deck.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
  if(count!==quantity)throw new Error('Rank 26 source drift: '+name);
 }
 if(deck.cards.reduce((s,c)=>s+c.count,0)!==60)throw new Error('Source deck not 60 cards');
 return deck;
}
if(require.main===module){
 const root=path.resolve(__dirname,'..');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
 verifyRank26(manifest);
 const {audit,loadBasicIndex}=require('./aichi_opening_audit.cjs');
 const rows=audit(manifest.decks,loadBasicIndex(path.join(root,'resources/cards/en')));
 const basics=rows.find(r=>r.rank===26).basicCount;
 if(basics!==12)throw new Error('Rank 26 Basic count changed');
 process.stdout.write(JSON.stringify({rank:26,basics,...ticketOpportunity(60,basics,7,6)},null,2)+'\n');
}
module.exports={choose,ticketOpportunity,verifyRank26};
