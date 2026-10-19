'use strict';

const assert=require('node:assert/strict');
const {loadNewMoonCandidate}=require('./aichi-new-moon-candidate.cjs');

/**
 * Exploratory 60-card New Moon variant: one recovery-only Ace Trainer copy
 * becomes an unconditional gust Supporter. Not a registered Top-32 source,
 * qualified paper-deck proof, or empirically stronger candidate.
 *
 * @returns {object} Deterministic deck manifest for external validation.
 */
function loadNewMoonBossConversion() {
  const base=loadNewMoonCandidate();
  const ace=base.cards.find(card=>card.name==='Ace Trainer');
  assert.ok(ace && ace.category==='Trainer' && ace.count===2);
  assert.equal(base.cards.filter(card=>card.name==="Boss's Orders").length,0);
  const cards=base.cards.map(card=>({
    ...card,count:card.name==='Ace Trainer'?1:card.count,
    printing:{...card.printing}
  }));
  cards.push({category:'Trainer',count:1,name:"Boss's Orders",
    printing:{set:'RCL',number:'154',language:'en'}});
  assert.equal(cards.reduce((sum,card)=>sum+card.count,0),60);
  assert.ok(cards.every(card=>card.count>=1 && card.count<=4));
  return {
    id:'new-moon-boss-conversion-v1',
    cards,
    transformedFrom:base.id,
    modification:{
      removed:{name:'Ace Trainer',count:1},
      added:{name:"Boss's Orders",count:1,englishId:'swsh2-154'}
    },
    evidence:'discrete final-prize gust line observed as a hypothetical turn-50 state substitution',
    exactOriginalJapaneseSource:false,
    provisionalEnglishProxy:true,
    paperLegalPrintsVerified:false,
    competitiveMatchupsQualified:0
  };
}

module.exports={loadNewMoonBossConversion};
