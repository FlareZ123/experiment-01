'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sourceEnergy,chooseRank9CompressorAfterPass,chooseRank9CompressorDiscard
}=require('../simulation/twinleaf/agent29-rank9-compressor-owner-bridge.cjs');

/** @param {object} [changes] */
function sample(changes={}){
  const own={
    active:{name:'Mega Absol ex'},
    bench:[{name:'Electrode-GX'},null,null,null,null],
    deckCount:18,discard:[],
    ...changes.own
  };
  return {
    decisionKind:'owner-root',globalTurn:6,
    ownHand:['Battle Compressor PHF','Rare Candy SVI'],
    ownPublic:own,opponentPublic:{prizeCount:6},
    ownTurnResources:{itemPlayLocked:false},
    ...changes
  };
}

test('source owner-visible Compressor is selected after actor Pass only in a viable board',()=>{
  const x=chooseRank9CompressorAfterPass(sample());
  assert.deepEqual(x,{handIndex:0,printing:'Battle Compressor PHF',
    reason:'owner-visible-voltorb-mega-discard-energy-deficit'});
  assert.equal(x.handIndex,0);
});

test('no opponent hand/Prize/deck identities are needed by owner gate',()=>{
  const v=sample();
  v.opponentPublic={prizeCount:6};
  v.ownPublic.deckCount=31;
  assert.equal(chooseRank9CompressorAfterPass(v).handIndex,0);
});

test('source early Item respects public risk, lock, occupied board and known existing discard fuel',()=>{
  const cases=[
    sample({globalTurn:13}),
    sample({ownTurnResources:{itemPlayLocked:true}}),
    sample({own:{deckCount:2}}),
    sample({opponentPublic:{prizeCount:2}}),
    sample({ownHand:['Ultra Ball SVI']}),
    sample({own:{active:{name:'Voltorb'},bench:[null,null,null,null,null]}}),
    sample({own:{active:{name:'Mega Absol ex'},
      bench:[{name:'Dedenne-GX'},null,null,null,null]}}),
    sample({own:{discard:['Prism Energy ASC','Prism Energy ASC',
      'Darkness Energy MEE']}})
  ];
  cases.forEach((v,i)=>assert.equal(chooseRank9CompressorAfterPass(v),null,
    'Case '+i+' must not consume source Combo'));
});

test('printed source Energy recognises only expected original physical types',()=>{
  assert.equal(sourceEnergy('Prism Energy ASC'),true);
  assert.equal(sourceEnergy('Darkness Energy SVE'),true);
  assert.equal(sourceEnergy('Telepath [P] Energy M3'),true);
  assert.equal(sourceEnergy('Telepathic Psychic Energy POR'),true);
  assert.equal(sourceEnergy('Basic Lightning Energy SVE'),false);
  assert.equal(sourceEnergy('Battle Compressor PHF'),false);
});

test('owner deck inspection happens only in real ChooseCardsPrompt',()=>{
  const records=[
    {fullName:'Rare Candy SVI'},
    {fullName:'Telepath [P] Energy M3'},
    {fullName:'Prism Energy ASC',id:1},
    {fullName:'Darkness Energy MEE'},
    {fullName:'Prism Energy ASC',id:2}
  ];
  const owner={deck:{cards:records},
    discard:{cards:[{fullName:'Prism Energy ASC'}]}};
  const prompt={cards:owner.deck};
  const chosen=chooseRank9CompressorDiscard(prompt,owner);
  assert.deepEqual(chosen,[records[2],records[4]]);
  assert.equal(owner.deck.cards.length,5);
  assert.equal(owner.discard.cards.length,1);
});

test('source deck selector rejects an unrelated prompt and handles exhausted source Energy',()=>{
  const p={cards:{cards:[]}};
  const owner={deck:{cards:[]},discard:{cards:[]}};
  assert.throws(()=>chooseRank9CompressorDiscard(p,owner));
  p.cards=owner.deck;
  assert.deepEqual(chooseRank9CompressorDiscard(p,owner),[]);
});
