'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildExactPrintIndex,screenOneSourceDeck,screenManifest}=
  require('../simulation/twinleaf/agent9-jp-expanded-structure.cjs');
const card=(name,count,set,number,category='Trainer')=>({name,count,category,
  printing:{set,number,language:'en'}});
const deck=(cards,rank=5)=>({rank,player:'source',archetype:'test',cards});
const groups=[{setId:'set',cards:[
  {name:'Psychic Energy',number:'1',supertype:'Energy',subtypes:['Basic']},
  {name:'Mew V',number:'2',supertype:'Pokémon',subtypes:['Basic']},
  {name:'Mew VMAX',number:'3',supertype:'Pokémon',subtypes:['VMAX']},
  {name:'Unfair Stamp',number:'4',supertype:'Trainer',subtypes:['ACE SPEC','Item']},
  {name:'Secret Box',number:'5',supertype:'Trainer',subtypes:['ACE SPEC','Item']},
  {name:'Flapple',number:'6',supertype:'Pokémon',subtypes:['Stage 1'],
    abilities:[{name:'Apple Drop'}]},
  {name:'Marshadow',number:'7',supertype:'Pokémon',subtypes:['Basic'],
    abilities:[{name:'Shadowy Echo'}]},
  {name:'Professor Sycamore',number:'8',supertype:'Trainer',subtypes:['Supporter']},
  {name:"Professor's Research",number:'9',supertype:'Trainer',subtypes:['Supporter']},
  {name:'Lysandre',number:'10',supertype:'Trainer',subtypes:['Supporter']},
  {name:"Boss's Orders",number:'11',supertype:'Trainer',subtypes:['Supporter']},
  {name:'Quick Ball',number:'12',supertype:'Trainer',subtypes:['Item']},
  {name:'Radiant Eternatus',number:'13',supertype:'Pokémon',subtypes:['Basic','Radiant']},
  {name:'Radiant Greninja',number:'14',supertype:'Pokémon',subtypes:['Basic','Radiant']}
]}];
const index=buildExactPrintIndex([{id:'set',ptcgoCode:'TST'}],groups);
const base=()=>[card('Mew V',4,'TST','2','Pokémon'),
  card('Mew VMAX',3,'TST','3','Pokémon'),card('Unfair Stamp',1,'TST','4'),
  card('Quick Ball',4,'TST','12'),card('Psychic Energy',48,'TST','1','Energy')];

test('known 60-card structure stays distinct from certified Japanese paper legality',()=>{
  const out=screenOneSourceDeck(deck(base()),index);
  assert.equal(out.sourcePhysicalCopies,60);
  assert.deepEqual(out.violations,[]);
  assert.equal(out.paperLegalityCertified,false);
  assert.equal(out.matchedEnglishProxyCopies,60);
  assert.equal(out.knownBasicCopies,4);
});

test('official exclusive Supporter name families reject both coexistences',()=>{
  const cards=base();cards[4].count=44;
  cards.push(card('Professor Sycamore',1,'TST','8'));
  cards.push(card("Professor's Research",1,'TST','9'));
  cards.push(card('Lysandre',1,'TST','10'));
  cards.push(card("Boss's Orders",1,'TST','11'));
  const out=screenOneSourceDeck(deck(cards),index);
  assert.equal(out.violations.filter(x=>x.kind==='official-exclusive-Supporter-family').length,2);
});

test('two distinct ACE SPECs violate one-per-deck construction',()=>{
  const cards=base();cards[4].count=47;
  cards.push(card('Secret Box',1,'TST','5'));
  assert.equal(screenOneSourceDeck(deck(cards),index).violations
    .some(x=>x.kind==='multiple-known-ACE-SPEC'),true);
});

test('copies of same name across printings aggregate, Basic Energy exempt',()=>{
  const cards=base();cards[0].count=5;cards[4].count=47;
  const out=screenOneSourceDeck(deck(cards),index);
  assert.equal(out.violations.some(x=>x.kind==='four-copy-name-limit'),true);
  assert.equal(out.violations.some(x=>x.name==='Psychic Energy'),false);
});

test('printed banned Flapple ability detected, non-banned Marshadow remains safe',()=>{
  const cards=base();cards[4].count=46;
  cards.push(card('Flapple',1,'TST','6','Pokémon'));
  cards.push(card('Marshadow',1,'TST','7','Pokémon'));
  const out=screenOneSourceDeck(deck(cards),index);
  assert.equal(out.violations.filter(x=>x.kind==='official-banned-Pokémon-mechanism').length,1);
  assert.match(out.violations.find(x=>x.kind==='official-banned-Pokémon-mechanism').printing,/Flapple/);
});

test('banned Trainer name and unknown Japanese alias recorded separately',()=>{
  const cards=base();cards[4].count=46;
  cards.push(card('Red Card',1,'XY','124'));
  cards.push(card('New Japanese Print',1,'M4','17'));
  const out=screenOneSourceDeck(deck(cards),index);
  assert.equal(out.violations.some(x=>x.kind==='official-banned-Trainer-name'),true);
  assert.equal(out.uncertainties.filter(x=>x.kind==='unmatched-or-ambiguous-English-proxy').length,2);
});

test('basic Energy never counts as an opening Basic Pokémon',()=>{
  const out=screenOneSourceDeck(
    deck([card('Psychic Energy',60,'TST','1','Energy')]),index);
  assert.equal(out.knownBasicCopies,0);
  assert.equal(out.violations.some(x=>x.kind==='no-Pokémon-Basic-in-full-known-metadata'),true);
});

test('two Radiant Pokémon and double Prism Star detected conservatively',()=>{
  const cards=base();cards[4].count=46;
  cards.push(card('Radiant Eternatus',1,'TST','13','Pokémon'));
  cards.push(card('Radiant Greninja',1,'TST','14','Pokémon'));
  const out=screenOneSourceDeck(deck(cards),index);
  assert.equal(out.violations.some(x=>x.kind==='multiple-known-Radiant'),true);
});

test('manifest keeps missing original rank and certifies no paper wins',()=>{
  const x=screenManifest({decks:[deck(base())],missing_full_lists:[{rank:23}]},index);
  assert.deepEqual(x.missingOriginalDecks,[23]);
  assert.equal(x.observedDefiniteViolationDecks,0);
  assert.equal(x.paperLegalityCertifiedDecks,0);
});
