'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const roster=require('../results/aichi-2026/full-decklists.json');
const fused=require('../resources/cards/en/swsh8.json');
const breakthrough=require('../resources/cards/en/xy8.json');
const silver=require('../resources/cards/en/sv8.json');

const VERSION='agent31-original-rank11-turn2-letter-family-k0-v1';
const MATCH='11:102:A:champion-reference';
const V5_SHA='22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17';
const PASSES_SHA='23631b6c2cb8c5a38957167579b1fdcbb6035543ced1665d0e8373ef56bfe73f';

/**
 * Read-only original-source printed payment and target proof.
 * Assumes the supplied accepted root tape is complete and the observed
 * source owner hand/board are unaffected by read-only observer installation.
 * Unknown Prize faces and own deck order remain uninspected.
 * @param {object} native Authentic original eight-arm v5 native archive.
 * @param {object} passes Authentic original eight-arm owner-Pass archive.
 * @param {object} [sources] Exact source texts / inventory for pure tests.
 * @returns {object} Necessary printed sources, targets, and proof limits.
 */
function prove(native,passes,sources={}){
  const cards=sources.roster??roster;
  const trubbish=sources.fusion??fused;
  const letter=sources.breakthrough??breakthrough;
  const latias=sources.silver??silver;
  assert.equal(native.attempts?.length,8);
  assert.equal(passes.attempts?.length,8);
  assert.equal(passes.exactInitialFullDealAndRootTapeMatches,8);
  const row=native.attempts.find(x=>x.id===MATCH);
  const snapshots=passes.attempts.find(x=>x.id===MATCH);
  assert.ok(row&&snapshots);
  assert.equal(row.originalSourceSeat,1);
  assert.equal(snapshots.sourceSeat,1);
  assert.equal(row.actualFirstPlayer,0);
  assert.equal(row.verifiedFirstTurn,true);
  assert.equal(row.status,'returned-unqualified');
  assert.equal(row.nativeRootActionCount,48);
  assert.equal(row.finished,false);
  const roots=row.publicRootActions;
  assert.equal(roots.length,48);
  const initial=roots.slice(0,11);
  assert.equal(initial.every(x=>x.playerSlot!==1||
    x.action==='ResolvePromptAction'),true);
  assert.deepEqual(initial.filter(x=>x.playerSlot===0&&
    x.action==='PlayCardAction').map(x=>x.card),['Psychic Energy']);
  assert.equal(initial.some(x=>x.action==='AttackAction'),false);
  assert.equal(roots[11].actionOrdinal,11);
  assert.equal(roots[11].turnBefore,2);
  assert.equal(roots[11].playerSlot,1);
  assert.equal(roots[11].action,'PassTurnAction');
  assert.equal(snapshots.ownerPassObservations.length,5);
  const view=snapshots.ownerPassObservations[0];
  assert.equal(view.ordinal,11);
  assert.equal(view.turn,2);
  assert.equal(view.ownerHandAtPass.length,5);
  assert.equal(view.ownerHandAtPass.includes('Professors Letter BKT'),true);
  const own=view.publicBoardBeforePass[1];
  const opp=view.publicBoardBeforePass[0];
  assert.equal(own.active.name,'Trubbish');
  assert.deepEqual(own.bench.map(x=>x.name),['Mega Absol ex','Oranguru V']);
  assert.equal(opp.active.name,'Latias ex');
  assert.equal(opp.bench.length,0);
  assert.deepEqual(own.stadium,[]);
  assert.deepEqual(opp.stadium,[]);
  assert.ok([own.active,...own.bench].every(x=>x.energyCards.length===0));
  assert.ok([opp.active,...opp.bench].every(x=>x.toolCards.length===0));

  const printed=cards.decks.find(d=>d.rank===11);
  assert.equal(printed.category_counts.Pokémon,13);
  assert.equal(printed.cards.reduce((s,c)=>s+c.count,0),60);
  const starters=printed.cards.filter(c=>
    c.category==='Pokémon'&&c.name!=='Garbodor');
  assert.deepEqual(printed.cards.filter(c=>c.name==='Garbodor')
    .map(c=>c.count),[2]);
  const originalBasicCount=starters.reduce((s,c)=>s+c.count,0);
  assert.equal(originalBasicCount,11);
  const originalDarknessCount=printed.cards.filter(c=>c.name==='Darkness Energy'&&
    c.printing.set==='MEE').reduce((s,c)=>s+c.count,0);
  assert.equal(originalDarknessCount,8);
  assert.equal(printed.cards.filter(c=>c.name==="Professor's Letter"&&
    c.printing.set==='BKT').reduce((s,c)=>s+c.count,0),4);
  const heldBasics=view.ownerHandAtPass.filter(name=>starters.some(c=>
    name===c.name+' '+c.printing.set)).length;
  const heldDarkness=view.ownerHandAtPass.filter(name=>
    name==='Darkness Energy MEE').length;
  assert.equal(heldBasics,0);
  assert.equal(heldDarkness,0);
  const prizeUpperBound=6;
  const basicLower=originalBasicCount-(own.bench.length+1)-heldBasics-
    prizeUpperBound;
  const darknessLower=originalDarknessCount-heldDarkness-prizeUpperBound;
  assert.equal(basicLower,2);
  assert.equal(darknessLower,2);
  assert.equal(5-own.bench.length,3);
  const trubbishCard=trubbish.find(c=>c.id==='swsh8-168');
  const attack=trubbishCard?.attacks?.find(a=>a.name==='Call for Family');
  assert.deepEqual(trubbishCard?.subtypes,['Basic']);
  assert.deepEqual(attack?.cost,['Darkness']);
  assert.equal(attack?.text,
    'Search your deck for a Basic Pokémon and put it onto your Bench. Then, shuffle your deck.');
  assert.deepEqual(own.active.printedAttacks.find(a=>
    a.name==='Call for Family')?.cost,[7]);
  const printedLetter=letter.find(c=>c.id==='xy8-146');
  assert.equal(printedLetter?.name,"Professor's Letter");
  assert.equal(printedLetter?.subtypes?.includes('Item'),true);
  assert.ok(printedLetter?.rules?.some(r=>
    r.includes('up to 2 basic Energy cards')));
  assert.equal(latias.find(c=>c.id==='sv8-76')?.abilities?.[0]?.text,
    'Your Basic Pokémon in play have no Retreat Cost.');

  return {
    schema:VERSION,
    originalMatch:MATCH,sourceSeat:1,actualFirstPlayerSeat:0,
    originalSourceTurn:2,originalSourcePassRoot:11,
    original60BasicPokemonCount:originalBasicCount,
    sourceBasicsInPlay:own.bench.length+1,
    original60DarknessEnergyCount:originalDarknessCount,
    unknownPrizeUpperBound:6,
    guaranteedOriginalBasicInDeck:basicLower,
    guaranteedBasicDarknessEnergyInDeck:darknessLower,
    availableBenchSpaces:5-own.bench.length,
    conditionalPaperLine:[
      'Held Professors Letter BKT searches two Basic Darkness Energy into hand',
      'Unused first-turn normal attachment pays one Darkness to Active Trubbish FST',
      'Trubbish FST uses one-Darkness Call for Family to Bench one Basic from deck'
    ],
    sourceGoingSecondCanAttackFirstTurn:true,
    completeZoneInventoryAtFirstPass:false,
    printAndRootTapeConditionalProofOnly:true,
    nativeItemSearchAttachmentAttackAndReplyUnexecuted:true,
    physicalSampleCount:1,
    competitivelyQualifiedGames:0
  };
}

/** @param {string} path Authentic extracted member. @param {string} sha SHA256 of bytes. */
function member(path,sha){
  const bytes=fs.readFileSync(path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),sha);
  return JSON.parse(bytes.toString('utf8'));
}
if(require.main===module){
  assert.equal(process.argv.length,4,
    'Two original extracted JSON members required: steward v5 and owner Pass archive');
  process.stdout.write(JSON.stringify(prove(member(process.argv[2],V5_SHA),
    member(process.argv[3],PASSES_SHA)),null,2)+'\n');
}
module.exports={VERSION,prove,member};
