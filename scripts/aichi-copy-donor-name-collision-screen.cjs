'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const field = require(path.join(root, 'results/aichi-2026/full-decklists.json'));
const sets = require(path.join(root, 'resources/sets/en.json'));
const setCodeToIds = new Map();
for (const set of sets.filter(entry=>entry.ptcgoCode)) {
  const code=set.ptcgoCode.toUpperCase();
  if (!setCodeToIds.has(code)) setCodeToIds.set(code,[]);
  setCodeToIds.get(code).push(set.id);
}
setCodeToIds.set('SMP',['smp']);
setCodeToIds.set('XYP',['xyp']);
const cache = new Map();

/** @param {string|number} number */
function normalizedNumber(number) {
  return String(number).toUpperCase().replace(/^0+(?=\d)/,'');
}
/**
 * Return exactly one printed card or record an explicit lookup failure.
 * @param {object} deckCard
 * @returns {{card:object|null,lookup:string}}
 */
function resolvePrinted(deckCard) {
  const code = deckCard.printing?.set?.toUpperCase();
  const setCandidates=setCodeToIds.get(code)??[];
  const number=String(deckCard.printing?.number??'').toUpperCase();
  const subgallery=number.startsWith('TG')?'tg':number.startsWith('GG')?'gg':null;
  const setId=(subgallery&&setCandidates.find(id=>id.endsWith(subgallery))) ||
    setCandidates.find(id=>!/(?:tg|gg)$/.test(id)) || setCandidates[0];
  if (!setId) return {card:null,lookup:'unknown-set:'+code};
  if (!cache.has(setId)) {
    const filename=path.join(root,'resources/cards/en',setId+'.json');
    if (!fs.existsSync(filename)) return {card:null,lookup:'no-set-file:'+setId};
    cache.set(setId,JSON.parse(fs.readFileSync(filename,'utf8')));
  }
  const cards = cache.get(setId).filter(card=>
    normalizedNumber(card.number) === normalizedNumber(deckCard.printing.number));
  if (cards.length !== 1) {
    return {card:null,lookup:'ambiguous-or-missing-number:'+setId+':'+deckCard.printing.number};
  }
  return {card:cards[0],lookup:'resolved'};
}
/** @param {object} card */
function printKey(card) {
  return card.id + ' ' + card.name;
}
/** @param {object} attack */
function attackFingerprint(attack) {
  return JSON.stringify({
    damage:attack.damage??'',
    cost:attack.cost??[],
    text:attack.text??''
  });
}
/**
 * Enumerate collision potential only. It does not imply simultaneous discard
 * accessibility, actual root decisions, or game consequences.
 * @returns {object}
 */
function scan() {
  const reports = [];
  const unresolved = [];
  for (const deck of field.decks) {
    const isRegidrago=deck.cards.some(c=>c.name==='Regidrago VSTAR');
    const isMewtwo=deck.cards.some(c=>c.name==='Mewtwo & Mew-GX');
    if (!isRegidrago && !isMewtwo) continue;
    const donors=[];
    for (const listed of deck.cards.filter(c=>c.category==='Pokémon')) {
      const match=resolvePrinted(listed);
      if (!match.card) {
        unresolved.push({rank:deck.rank,name:listed.name,printing:listed.printing,reason:match.lookup});
        continue;
      }
      const card=match.card;
      const subtypes=card.subtypes??[];
      const meetsDragon=isRegidrago &&
        card.types?.includes('Dragon') && card.name!=='Regidrago VSTAR';
      const meetsGXEX=isMewtwo && card.name!=='Mewtwo & Mew-GX' &&
        (subtypes.includes('GX')||subtypes.includes('EX'));
      if (meetsDragon || meetsGXEX) {
        donors.push({
          printing:printKey(card),
          attacks:(card.attacks??[]).map(a=>({
            name:a.name,fingerprint:attackFingerprint(a),damage:a.damage??'',cost:a.cost??[],text:a.text??''
          }))
        });
      }
    }
    const byName=new Map();
    for (const donor of donors) for (const attack of donor.attacks) {
      if (!byName.has(attack.name)) byName.set(attack.name,[]);
      byName.get(attack.name).push({printing:donor.printing,...attack});
    }
    const collisions=[...byName.entries()].flatMap(([name,rows])=>
      rows.length>1 && new Set(rows.map(x=>x.fingerprint)).size>1 ?
      [{name,sources:rows.map(({fingerprint,...row})=>row)}] : []);
    reports.push({
      rank:deck.rank,archetype:deck.archetype,
      copyMechanism:isRegidrago?'Apex Dragon':'Perfection',
      resolvedPotentialDonors:donors.length,
      collisions
    });
  }
  const collisionRanks=reports.filter(x=>x.collisions.length>0);
  return {
    schema:'aichi-copy-donor-printed-name-collision-potential-v1',
    sourcedDecks:field.decks.length,
    copyDecksScanned:reports.length,
    ranksWithDifferentTextSameAttackName:collisionRanks.length,
    collisionsByRank:collisionRanks,
    unresolved,
    caveat:'Printed database/source manifest screen only. No simultaneous donor access, engine trigger, opponent policy, or win rate inferred.'
  };
}
if (require.main===module) process.stdout.write(JSON.stringify(scan(),null,2)+'\n');
module.exports={scan,resolvePrinted,normalizedNumber};
