'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const EVENT_DATE='2026/05/10';
const VERSION='agent24-spiritomb-exact-ace-original29-census-v1';
const ELIGIBLE_SERIES=new Set([
  'Black & White','XY','Sun & Moon','Sword & Shield',
  'Scarlet & Violet','Mega Evolution'
]);

/** Preserve physical source printing and its full name. */
function printedKey(card){
  assert.equal(typeof card?.name,'string');
  assert.equal(typeof card.printing?.set,'string');
  assert.equal(typeof card.printing?.number,'string');
  return [card.printing.set.toUpperCase(),card.printing.number,
    card.name].join('::');
}

/**
 * Build an authentic print-number lookup from locally supplied card JSON
 * and the set table, bounded to the Aichi event's international date.
 * The list is a lookup resource, not itself Japanese legality certification.
 * @returns {{exact:Set<string>,names:Set<string>,spiritomb:object}}
 */
function cardReference(){
  const directory=path.join(ROOT,'resources/cards/en');
  const sets=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/sets/en.json'),'utf8'));
  const exact=new Set(),names=new Set();
  for(const set of sets){
    if(!ELIGIBLE_SERIES.has(set.series)||
      typeof set.releaseDate!=='string'||
      set.releaseDate>EVENT_DATE)continue;
    const cards=JSON.parse(fs.readFileSync(path.join(directory,
      set.id+'.json'),'utf8'));
    for(const card of cards){
      if(!card.subtypes?.includes('ACE SPEC'))continue;
      names.add(card.name);
      assert.ok(set.ptcgoCode,'ACE SPEC print is missing its set code');
      exact.add([set.ptcgoCode.toUpperCase(),String(card.number),
        card.name].join('::'));
    }
  }
  const spiritombCards=JSON.parse(fs.readFileSync(path.join(directory,
    'bw11.json'),'utf8'));
  const spiritomb=spiritombCards.find(card=>
    card.name==='Spiritomb'&&card.number==='87');
  assert.deepEqual(spiritomb?.subtypes,['Basic']);
  assert.equal(spiritomb?.hp,'80');
  const sealing=spiritomb?.abilities?.find(a=>a.name==='Sealing Scream');
  assert.equal(sealing?.text,
    "Each player can't play any ACE SPEC cards from his or her hand.");
  return {exact,names,spiritomb:{id:spiritomb.id,name:spiritomb.name,
    ability:sealing.name,text:sealing.text,hp:Number(spiritomb.hp),
    type:spiritomb.types?.[0],subtypes:spiritomb.subtypes}};
}

/**
 * Exact foreign printing-aware source census. A same-name card cannot
 * impersonate the claimed ACE SPEC print if its set/number differs.
 *
 * @param {object} roster 2026 29-deck source archive.
 * @param {{exact:Set<string>,names:Set<string>,spiritomb:object}} reference
 * @returns {object}
 */
function analyze(roster,reference){
  assert.equal(roster?.total_placements,32);
  assert.ok(Array.isArray(roster.decks));
  const byName={},ranks=[];
  const rowDetails=[];
  for(const source of roster.decks){
    const copies=source.cards.reduce((s,c)=>s+c.count,0);
    assert.equal(copies,60,'Malformed original source 60 at rank '+source.rank);
    const observed=source.cards.filter(c=>reference.names.has(c.name))
      .map(c=>({...c,exactReference:
        reference.exact.has(printedKey(c))}));
    const unverifiedPrints=observed.filter(c=>!c.exactReference)
      .map(c=>printedKey(c));
    const verified=observed.filter(c=>c.exactReference);
    const aceCopies=verified.reduce((s,c)=>s+c.count,0);
    const spiritombCopies=source.cards.filter(c=>c.name==='Spiritomb')
      .reduce((s,c)=>s+c.count,0);
    for(const card of verified)byName[card.name]=
      (byName[card.name]??0)+card.count;
    ranks.push(source.rank);
    rowDetails.push({rank:source.rank,archetype:source.archetype,
      aceCopies,aceCards:verified.map(c=>({name:c.name,count:c.count,
        printing:c.printing})),spiritombCopies,unverifiedPrints});
  }
  assert.equal(new Set(ranks).size,roster.decks.length);
  assert.ok(ranks.every(rank=>Number.isInteger(rank)&&rank>=1&&rank<=32));
  const withAce=rowDetails.filter(x=>x.aceCopies>0).length;
  const allExactlyOne=rowDetails.every(x=>x.aceCopies===1&&
    x.unverifiedPrints.length===0);
  const total=rowDetails.reduce((sum,x)=>sum+x.aceCopies,0);
  return {schema:VERSION,eventDate:EVENT_DATE,
    source:'results/aichi-2026/full-decklists.json',
    reference:'resources/cards/en and resources/sets/en',
    spiritomb:reference.spiritomb,
    analyzedOriginalDecks:rowDetails.length,
    registeredPlacements:32,
    unresolvedRanks:roster.missing_full_lists.map(x=>x.rank),
    aceHoldingOriginalDecks:withAce,
    exactlyOneVerifiedAceInEveryKnownOriginal:allExactlyOne,
    verifiedAceCopies:total,byAceName:byName,
    knownOriginalSpiritombCopies:rowDetails.reduce((s,x)=>
      s+x.spiritombCopies,0),
    rows:rowDetails,
    necessaryConditionForDenial:'Spiritomb LTR87 Ability active in play before the opponent tries to play its ACE SPEC; suppression and other resource interactions not modeled',
    opponentAcePlayActionsVerified:0,
    nativeCardImplementationVerified:false,
    competitiveQualifiedGames:0,winRateCertified:false};
}

function main(){
  const roster=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  return analyze(roster,cardReference());
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={EVENT_DATE,VERSION,printedKey,cardReference,analyze,main};
