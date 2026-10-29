'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose} = require('./aichi_opening_audit.cjs');

const PRINTED_CHANNELS = Object.freeze([
  'Guzma',
  'VS Seeker',
  'Battle Compressor',
  "Lillie's Determination",
  'Battle VIP Pass'
]);

/**
 * Exact probability that the union of selected non-Basic cards appears
 * in the first seven, or the first seven plus one ordinary draw,
 * conditional on a Basic-valid starting seven.
 *
 * Card subsets are disjoint: the Basic count describes Pokémon while the
 * selected count describes only Trainer cards. Six unknown Prize cards are
 * sampled uniformly between the initial hand and ordinary draw, leaving
 * the marginal position of the eighth card exchangeable.
 *
 * @param {number} basics Count of Basic Pokémon in the exact sixty.
 * @param {number} selected Count of distinct physical Trainer copies.
 * @param {7|8} observedCards Number of sequential observed cards.
 * @returns {number} Conditional card-presence probability.
 */
function conditionalOpeningPresence(basics, selected, observedCards=8) {
  assert.ok(Number.isInteger(basics) && basics>=1 && basics<=60);
  assert.ok(Number.isInteger(selected) && selected>=0 &&
    selected+basics<=60);
  assert.ok(observedCards===7 || observedCards===8);
  const validHands=choose(60,7)-choose(60-basics,7);
  const noSelectedValidHands=choose(60-selected,7)-
    choose(60-selected-basics,7);
  const noSelectedDraw=observedCards===8?(53-selected)/53:1;
  return 1-noSelectedValidHands*noSelectedDraw/validHands;
}

/**
 * Analyse only exact published source cards, with a separate, previously
 * printed Basic-stage index. Count card presence, not legality or value.
 * @param {object} source Parsed full-decklists.json.
 * @param {object} openings Parsed opening-hand-audit.json.
 * @returns {object[]} Source-rank-sorted coverage rows.
 */
function openingExposureRows(source,openings) {
  assert.ok(Array.isArray(source.decks) && Array.isArray(openings.decks));
  const basicsByRank=new Map(openings.decks.map(x=>[
    x.rank,x.basic_count_known
  ]));
  const names=new Set(PRINTED_CHANNELS);
  const seen=new Set();
  return source.decks.map(deck=>{
    assert.ok(Number.isInteger(deck.rank) && !seen.has(deck.rank));
    seen.add(deck.rank);
    assert.equal(deck.cards.reduce((sum,x)=>sum+x.count,0),60);
    const basics=basicsByRank.get(deck.rank);
    assert.ok(Number.isInteger(basics));
    const channels=deck.cards.filter(card=>
      card.category==='Trainer' && names.has(card.name));
    const selected=channels.reduce((sum,card)=>sum+card.count,0);
    return {
      rank:deck.rank,
      archetype:deck.archetype,
      basics,
      selected,
      channelNames:channels.map(x=>x.name),
      p7:conditionalOpeningPresence(basics,selected,7),
      p8:conditionalOpeningPresence(basics,selected,8)
    };
  }).sort((a,b)=>a.rank-b.rank);
}

/**
 * @param {ReturnType<typeof openingExposureRows>} rows
 * @returns {string} Stable, reviewable Markdown.
 */
function toMarkdown(rows) {
  const total=rows.reduce((sum,x)=>sum+x.selected,0);
  const mean=rows.reduce((sum,x)=>sum+x.p8,0)/rows.length;
  return [
    '# Early printed Trainer-channel exposure among published Aichi 2026 decks',
    '',
    'Five named original-source channels: '+PRINTED_CHANNELS.join(', ')+'.',
    '',
    'The probabilities measure **physical card presence only**, conditional on a Basic-valid initial seven. They do not measure whether any card can be legally or beneficially played, whether its native engine text works, or win rate. Opponent mulligan bonuses, extra draw/search effects and play decisions are excluded. The eighth position is one ordinary turn draw after six uniformly hidden Prizes.',
    '',
    'Exact known sources: '+rows.length+'; selected printed copies: '+total+
      '; equally rank-weighted mean P(seen by eight): '+(100*mean).toFixed(4)+'%.',
    '',
    '| Rank | Original archetype | Basics | Five-channel copies | Initial seven | First seven + ordinary draw |',
    '| ---: | --- | ---: | ---: | ---: | ---: |',
    ...rows.map(x=>'| '+x.rank+' | '+x.archetype+' | '+x.basics+
      ' | '+x.selected+' | '+(x.p7*100).toFixed(3)+'% | '+
      (x.p8*100).toFixed(3)+'% |'),
    ''
  ].join('\n');
}

if (require.main===module) {
  const base=path.resolve(__dirname,'..','results','aichi-2026');
  const source=JSON.parse(fs.readFileSync(
    path.join(base,'full-decklists.json'),'utf8'));
  const openings=JSON.parse(fs.readFileSync(
    path.join(base,'opening-hand-audit.json'),'utf8'));
  process.stdout.write(toMarkdown(openingExposureRows(source,openings))+'\n');
}

module.exports={
  PRINTED_CHANNELS,conditionalOpeningPresence,openingExposureRows,toMarkdown
};
