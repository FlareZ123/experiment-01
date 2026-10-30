'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Iono}=require('../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-paldea-evolved/iono');
const {Marnie}=require('../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-sword-and-shield/marnie');

/** @param {object} card @param {number} deckCount @param {number} opposingHandCount @param {number} extra */
function pinnedCanPlay(card,deckCount,opposingHandCount,extra=0){
  const cards=count=>Array.from({length:count},()=>({name:'Other'}));
  const owner={id:1,supporterTurn:0,hand:{cards:[card,...cards(extra)]},
    deck:{cards:cards(deckCount)}};
  const opponent={id:2,hand:{cards:cards(opposingHandCount)}};
  return card.canPlay(null,{players:[owner,opponent]},owner);
}
for(const [name,Card] of [['Iono',Iono],['Marnie',Marnie]]){
  test(name+' pinned opening gate before shuffle',()=>{
    const card=new Card();
    assert.match(card.text,/If either player put any cards/);
    assert.equal(pinnedCanPlay(card,0,1),false);
    assert.equal(pinnedCanPlay(card,1,1),true);
    assert.equal(pinnedCanPlay(card,0,1,1),true);
    assert.equal(pinnedCanPlay(card,1,0),false);
  });
}

const {TrainerEffect}=require('../vendor/twinleaf/ptcg-server/output/game/store/effects/play-card-effects');
const {withSoleShuffleDeckZeroCorrection}=
  require('../simulation/twinleaf/agent2-sole-shuffle-deckzero-hook.cjs');

for(const [name,Card] of [['Iono',Iono],['Marnie',Marnie]]){
  test('reversible patch invokes pinned '+name+' opponent-only branch',()=>{
    const card=new Card();
    const owner={id:1,supporterTurn:0,hand:{cards:[card]},
      deck:{cards:[]},getPrizeLeft:()=>3};
    const opponent={id:2,supporterTurn:0,
      hand:{cards:[{name:'Opp card',fullName:'Opp card TEST'}]},
      deck:{cards:[]},getPrizeLeft:()=>2};
    const state={players:[owner,opponent]};
    assert.equal(card.canPlay(null,state,owner),false);
    const moved=[],draws=[];
    const result=withSoleShuffleDeckZeroCorrection(()=>{
      assert.equal(card.canPlay(null,state,owner),true);
      assert.strictEqual(card.reduceEffect(null,state,
        new TrainerEffect(owner,card)),state);
      return 88;
    },{Iono,Marnie,TrainerEffect,
      getOpponent:(s,p)=>s.players.find(x=>x.id!==p.id),
      moveHandToDeckThenDraw:(store,s,p,options)=>{
        moved.push({id:p.id,cards:options.cards.length,
          count:options.drawCount,source:options.sourceCard});
        options.afterDraw();
        return s;
      },
      drawCards:(store,s,p,count)=>{draws.push({id:p.id,count});return s;}
    });
    assert.equal(result,88);
    assert.deepEqual(moved,[{id:2,cards:1,count:name==='Iono'?2:4,source:card}]);
    assert.deepEqual(draws,[{id:1,count:name==='Iono'?3:5}]);
    assert.equal(card.canPlay(null,state,owner),false,
      'exact original pinned class restored');
  });
}
