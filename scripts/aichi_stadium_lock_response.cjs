'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {number} Exact binomial coefficient for n<=60. */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) {
    throw new Error('Invalid combinatorial inputs');
  }
  if (k < 0 || k > n) return 0;
  let out = 1;
  const terms = Math.min(k, n-k);
  for (let i=1; i<=terms; i++) out = out * (n-i+1)/i;
  return Math.round(out);
}

/**
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number}>}>}} field
 * @returns {{cardCounts:object, fractions:object}}
 */
function calculate(field) {
  const champion = field.decks.find(deck=>deck.rank===1);
  if (!champion) throw new Error('Missing Aichi rank 1 source deck');
  const qty = name=> champion.cards.filter(card=>card.name===name)
    .reduce((sum,card)=>sum+card.count,0);
  const basics = [
    'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
    'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX',
    'Mimikyu', 'Girafarig', 'Marshadow', 'Radiant Eternatus',
  ];
  const N=champion.cards.reduce((sum,card)=>sum+card.count,0);
  const B=basics.reduce((sum,name)=>sum+qty(name),0);
  const S=qty('Sky Field')+qty('Dimension Valley');
  const F=qty('Forest Seal Stone');
  const V=qty('Shadow Rider Calyrex V');
  const H=7, P=6;
  if (N!==60 || B!==14 || S!==3 || F!==1 || V!==3) {
    throw new Error('Source champion deck changed; re-audit Basic and Tool assumptions');
  }
  const all=choose(N,H);
  const validCount=all-choose(N-B,H);
  const directCount=all-choose(N-B,H)-choose(N-S,H)+choose(N-B-S,H);
  // Disjoint extra access: 1 Forest Seal Stone, 0 Stadiums, >=1 Shadow Rider V
  const stoneCount=choose(N-S-F,H-1)-choose(N-S-F-V,H-1);
  // In this branch all S Stadiums remain in the 53 unknown cards after opener.
  // They are all Prized only if all S appear in the 6 face-down Prize cards.
  const prizeFailure=choose(N-H-S,P-S)/choose(N-H,P);
  const stoneSuccess=stoneCount*(1-prizeFailure);
  return {
    sourceRank: 1,
    cardCounts:{deck:N,hand:H,prizes:P,basic:B,stadium:S,stone:F,shadowRiderV:V},
    fractions:{
      openingValid:validCount/all,
      directStadiumGivenValid:directCount/validCount,
      stoneWithVNoStadiumGivenValid:stoneCount/validCount,
      allThreeStadiumPrizedGivenNoStadium:prizeFailure,
      stoneCanFindStadiumGivenValid:stoneSuccess/validCount,
      eitherResponseGivenValid:(directCount+stoneSuccess)/validCount
    }
  };
}

/** @param {ReturnType<typeof calculate>} result */
function toMarkdown(result) {
  const p=n=>(100*n).toFixed(5)+'%';
  const r=result.fractions;
  return [
    '# Opening accessibility of Stadium counterplay to Budew plus Path',
    '',
    '**Scope:** initial 7 cards of Aichi 2026 rank 1 Shadow Rider Calyrex versus a hypothetical board in which Path to the Peak and an existing Itchy Pollen Item restriction are active. This is a **card-visibility calculation** under the 60-card source list, with six random Prize cards after the opening hand. It is not a probability of such a board state, successful turn, or a game win.',
    '',
    '## Counted source pieces',
    '',
    '- 14 Basic Pokémon total, including 3 Shadow Rider Calyrex V that can hold Forest Seal Stone.',
    '- 3 Stadiums: Sky Field ×2 and Dimension Valley ×1. Each can replace the opponent’s Path to the Peak while Item play is disallowed.',
    '- Forest Seal Stone ×1, a Pokémon Tool. Its Star Alchemy can search any Stadium still in the deck even while Path to the Peak suppresses Rule Box Pokémon Abilities. The Tool needs an attached Pokémon V and an unused VSTAR Power.',
    '',
    '## Exact random-opening results',
    '',
    '| Event | Probability |',
    '| --- | ---: |',
    '| Seven-card opening contains at least one Basic (unconditional) | '+p(r.openingValid)+' |',
    '| Directly has at least one of the three Stadiums, given valid opener | **'+p(r.directStadiumGivenValid)+'** |',
    '| Has Stone and Shadow Rider V but no Stadium, given valid opener, before Prize risk | '+p(r.stoneWithVNoStadiumGivenValid)+' |',
    '| All three Stadiums Prized, given no Stadium in opening | '+p(r.allThreeStadiumPrizedGivenNoStadium)+' |',
    '| Stone plus Shadow Rider V and at least one Stadium left in deck, no Stadium in opener | **'+p(r.stoneCanFindStadiumGivenValid)+'** |',
    '| Either disjoint direct Stadium or Stone route, given valid opener | **'+p(r.eitherResponseGivenValid)+'** |',
    '',
    '## Derivation',
    '',
    'Let N=60, H=7, B=14 Basic, S=3 Stadium, F=1 Forest Seal Stone, V=3 Shadow Rider V, and P=6 Prizes. Let C(n,k) denote combinations.',
    '',
    '- Valid opener count: C(60,7) - C(46,7).',
    '- Direct Stadium and valid Basic count: C(60,7) - C(46,7) - C(57,7) + C(43,7).',
    '- Disjoint Stone plus V without Stadium count: C(56,6) - C(53,6). Stone consumes one of the seven opening slots.',
    '- All three Stadiums are among six Prizes conditional on no Stadium in opening: C(50,3)/C(53,6).',
    '- Divide each relevant joint count by the valid-opener count. Subtract the Stone branch’s all-Prized failure and add the disjoint branch to direct Stadium access.',
    '',
    '## Interpretation and missing game-state dependencies',
    '',
    'The 33% approximate opening-hand access is a low-information baseline. It excludes turn draws, mulligan bonuses, card effects played before lock, alternative search routes, Bench space, Star Alchemy already being spent, Tool denial, Stadium-play contention, and how quickly either opponent lock comes online. Path to the Peak is a Stadium effect, so Pokémon Ranger or Channeler cannot remove it by removing effects **of attacks**; they could separately remove Budew’s lingering Item restriction. One already-played Stadium or any other condition can change the exact legal action sequence.',
    '',
    'These probabilities must **not** be interpreted as failure chances or win-rate evidence. They are a narrowly defined comparison of two immediate resource channels under a hypothetical adversarial constraint.',
    '',
    'Source: [Aichi rank 1 exact decklist](full-decklists.json), [typed Ability scope](ability-scope-matrix.md), [Forest Seal Stone ruling](forest-seal-stone-ruling.md). Reproduce with [scripts/aichi_stadium_lock_response.cjs](../../scripts/aichi_stadium_lock_response.cjs).',
    ''
  ].join('\n');
}
if (require.main === module) {
  const root=path.resolve(__dirname,'..');
  const source=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const result=calculate(source);
  process.stdout.write(toMarkdown(result)+'\n');
}
module.exports={choose,calculate,toMarkdown};
