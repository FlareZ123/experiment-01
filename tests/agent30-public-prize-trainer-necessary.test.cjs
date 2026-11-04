'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {PRINT_RULES, publicPrizeTrainerPrerequisite,
  screenOwnerTrainerPrizePrerequisites} =
  require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');

const root = path.resolve(__dirname, '..');
const specs = [
  ['Counter Catcher PAR', 'Item', 'sv4-160', 10, [3, 7, 12, 14, 21, 26, 32]],
  ['Roxanne ASR', 'Supporter', 'swsh10-150', 2, [8, 22]],
  ['Special Red Card CRI', 'Item', 'me4-82', 3, [5, 26]]
];

/** @param {string[]} hand @param {number} own @param {number} opponent */
function view(hand, own, opponent) {
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:hand, ownPublic:{prizeCount:own},
    opponentPublic:{prizeCount:opponent}};
}
/** @param {number} index @param {string} name @param {string} type */
function row(index, name, type) {
  return {handIndex:index,printing:name,type};
}

test('three source-exact public Prize prerequisites are negative-only', () => {
  for (const [printing, type, id] of specs) {
    assert.equal(PRINT_RULES[printing].id, id);
    const r = row(0, printing, type);
    const atStart = publicPrizeTrainerPrerequisite(view([printing],6,6), r);
    assert.equal(atStart.knownPrintedPrerequisite, true);
    assert.equal(atStart.blocked, true);
    assert.equal(atStart.paperPlayable, false);
    assert.equal(atStart.reason, 'public-prize-prerequisite-failed');
    const conditional = publicPrizeTrainerPrerequisite(
      view([printing], printing==='Counter Catcher PAR'?6:4,
        printing==='Counter Catcher PAR'?5:3), r);
    assert.equal(conditional.blocked, false);
    assert.equal(conditional.paperPlayable, null);
    assert.equal(conditional.remainingTargetPaymentAndBenefitUnknown, true);
  }
});

test('correct thresholds, equality, and exact print matching', () => {
  const catcher = row(0, 'Counter Catcher PAR', 'Item');
  assert.equal(publicPrizeTrainerPrerequisite(view([catcher.printing],5,5),catcher).blocked,true);
  assert.equal(publicPrizeTrainerPrerequisite(view([catcher.printing],5,4),catcher).blocked,false);
  assert.equal(publicPrizeTrainerPrerequisite(view([catcher.printing],4,5),catcher).blocked,true);
  const roxanne = row(0,'Roxanne ASR','Supporter');
  assert.equal(publicPrizeTrainerPrerequisite(view([roxanne.printing],6,4),roxanne).blocked,true);
  assert.equal(publicPrizeTrainerPrerequisite(view([roxanne.printing],6,3),roxanne).blocked,false);
  const unknown = row(0,'Counter Catcher CIN','Item');
  assert.equal(publicPrizeTrainerPrerequisite(view([unknown.printing],6,6),unknown).knownPrintedPrerequisite,false);
});

test('one row per genuine hand copy; native enumeration cannot certify paper', () => {
  const v = view(['Counter Catcher PAR','Roxanne ASR','Quick Ball FST'],6,6);
  const rows = [row(0,'Counter Catcher PAR','Item'),
    row(1,'Roxanne ASR','Supporter'),row(2,'Quick Ball FST','Item')];
  const result = screenOwnerTrainerPrizePrerequisites(v,rows);
  assert.equal(result.provenPrizeBlockedCopies,2);
  assert.equal(result.remainingNotDisprovenCopies,1);
  assert.equal(result.anyPaperPlayableTrainerCertified,false);
  assert.deepEqual(result.rows.map(x=>x.paperPlayable),[false,false,null]);
  assert.throws(()=>screenOwnerTrainerPrizePrerequisites(v,[rows[0],rows[0]]),
    /Repeated physical owner hand index/);
});

test('guard genuine owner observations and printing/type integrity', () => {
  const v=view(['Counter Catcher PAR'],6,6);
  assert.throws(()=>publicPrizeTrainerPrerequisite({...v,decisionKind:'owner-prompt'},row(0,'Counter Catcher PAR','Item')));
  assert.throws(()=>publicPrizeTrainerPrerequisite(v,row(0,'Counter Catcher PAR','Supporter')));
  assert.throws(()=>publicPrizeTrainerPrerequisite(v,row(1,'Counter Catcher PAR','Item')));
  assert.throws(()=>publicPrizeTrainerPrerequisite(v,row(0,'Roxanne ASR','Supporter')));
  assert.throws(()=>publicPrizeTrainerPrerequisite({...v,opponentPublic:{prizeCount:null}},row(0,'Counter Catcher PAR','Item')));
});

test('opponent-concealed data cannot influence proof', () => {
  const a=view(['Special Red Card CRI'],6,6);
  const b=view(['Special Red Card CRI'],6,6);
  Object.defineProperty(b,'opponentDeck',{get(){throw Error('hidden-read');}});
  a.opponentHand=['SECRET'];
  assert.deepEqual(screenOwnerTrainerPrizePrerequisites(a,[row(0,'Special Red Card CRI','Item')]),
    screenOwnerTrainerPrizePrerequisites(b,[row(0,'Special Red Card CRI','Item')]));
});

test('29 exact original source rosters expose 15 copies across ten ranks', () => {
  const raw=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(raw.decks.length,29);
  assert.deepEqual([...raw.missing_full_lists].map(x=>typeof x==='object'?x.rank:x)
    .map(Number).sort((a,b)=>a-b),[23,25,28]);
  let total=0;
  const rankUnion=new Set();
  for (const [printing,type,id,expected,ranks] of specs) {
    const [name,set]=printing.split(/ (?=[A-Z0-9]+$)/);
    const observations=raw.decks.flatMap(deck=>deck.cards.filter(card=>
      card.category==='Trainer'&&card.name===name&&card.printing.set===set)
      .map(card=>({rank:Number(deck.rank),count:card.count})));
    assert.deepEqual(observations.map(x=>x.rank).sort((a,b)=>a-b),ranks);
    assert.equal(observations.reduce((a,x)=>a+x.count,0),expected);
    for (const x of observations)rankUnion.add(x.rank);
    total+=expected;
    const prefix=id.split('-')[0];
    const cards=JSON.parse(fs.readFileSync(
      path.join(root,'resources/cards/en',prefix+'.json'),'utf8'));
    const card=cards.find(c=>c.id===id);
    assert.ok(card,id+' must exist in English card source');
    assert.equal(card.name,name);
    assert.equal(card.legalities.expanded,'Legal');
    const rule=card.rules[0];
    assert.match(rule,/only if/);
    if (type==='Supporter') assert.ok(card.subtypes.includes('Supporter'));
    else assert.ok(card.subtypes.includes('Item'));
    if (name==='Counter Catcher')assert.match(rule,/more Prize cards remaining than your opponent/);
    else assert.match(rule,/opponent has 3 or fewer Prize cards remaining/);
  }
  assert.equal(total,15);
  assert.deepEqual([...rankUnion].sort((a,b)=>a-b),[3,5,7,8,12,14,21,22,26,32]);
  process.stdout.write('Verified 15 printed Prize-gated Trainer copies over 10 original ranks; all fail at 6-6.\n');
});


test('original-era Japanese M4 Item rule is exact and negative-only',()=>{
  // Official Japanese M4 072/083 was released before the May 2026 Aichi
  // tournament. The verified source says the Item can only be played when
  // the opposing player has at most three Prize cards remaining.
  const print='Special Red Card M4';
  const spec=PRINT_RULES[print];
  assert.equal(spec.id,'jp/M4/72');
  assert.equal(spec.type,'Item');
  const selected=row(0,print,'Item');
  for(const opposingPrizes of [6,5,4]){
    const r=publicPrizeTrainerPrerequisite(
      view([print],6,opposingPrizes),selected);
    assert.equal(r.knownPrintedPrerequisite,true);
    assert.equal(r.blocked,true);
    assert.equal(r.paperPlayable,false);
    assert.equal(r.observedOpponentPrizeCount,opposingPrizes);
  }
  for(const opposingPrizes of [3,2,1,0]){
    const r=publicPrizeTrainerPrerequisite(
      view([print],6,opposingPrizes),selected);
    assert.equal(r.blocked,false);
    assert.equal(r.paperPlayable,null,
      'A satisfied Prize gate does not prove paid paper play');
  }
  assert.throws(()=>publicPrizeTrainerPrerequisite(
    view([print],6,6),row(0,print,'Supporter')),
  /Mismatched native Trainer type/);
});
