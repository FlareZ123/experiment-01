'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseConservativeShuffleSupporter,
  enumerateConservativeShuffleSupporterOffers,
  printedShuffleDrawCounts}=require(
    '../simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs');

function view(hand,override={}){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:hand,
    ownPublic:{active:{printing:'Iron Thorns ex TEST'},
      deckCount:40,prizeCount:6,resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{handCount:6,deckCount:40,prizeCount:6},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ...override};
}
test('Lillie print at six prizes provides highest own-only draw',()=>{
  const v=view(["Lillie's Determination M1L",'Iono PAL']);
  const action=chooseConservativeShuffleSupporter(v);
  assert.equal(action.family,'lillie');
  assert.equal(action.printing,"Lillie's Determination M1L");
  assert.equal(action.handIndex,0);
  assert.equal(action.drawEstimate.ownDraw,8);
  assert.equal(action.drawEstimate.opponentDraw,0);
  assert.deepEqual(printedShuffleDrawCounts(v,'iono'),{
    ownDraw:6,opponentDraw:6});
});
test('conservative Marnie and Iono are ranked by owner-public opponent gain',()=>{
  const marnie=chooseConservativeShuffleSupporter(
    view(['Marnie SSH'],{
      opponentPublic:{handCount:7,deckCount:30,prizeCount:3}
    }));
  assert.equal(marnie.family,'marnie');
  assert.equal(marnie.score,4);
  const iono=chooseConservativeShuffleSupporter(
    view(['Iono PAL'],{
      ownPublic:{active:{},deckCount:30,prizeCount:5,
        resolvingSupporter:[],publicTurnRestrictions:{}},
      opponentPublic:{handCount:6,deckCount:30,prizeCount:2}
    }));
  assert.equal(iono.family,'iono');
  assert.equal(iono.drawEstimate.opponentDraw,2);
  assert.equal(iono.score,4);
});
test('paper first-turn, quota, lock, hand size, draw advantage and DCI limits',()=>{
  assert.equal(chooseConservativeShuffleSupporter(view(['Marnie SSH'],{
    globalTurn:1})),null);
  assert.equal(chooseConservativeShuffleSupporter(view(['Marnie SSH'],{
    ownTurnResources:{supporterPlayedTurn:1,supporterPlayLocked:false}
  })),null);
  assert.equal(chooseConservativeShuffleSupporter(view(['Iono PAL'],{
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:true}
  })),null);
  assert.equal(chooseConservativeShuffleSupporter(
    view(['Marnie SSH','Forest Seal Stone TEST','Double Dragon Energy TEST',
      'VS Seeker TEST'])),null);
  assert.equal(chooseConservativeShuffleSupporter(view(['Iono PAL'],{
    ownPublic:{active:{},deckCount:40,prizeCount:2,
      resolvingSupporter:[],publicTurnRestrictions:{}}
  })),null);
  assert.equal(chooseConservativeShuffleSupporter(view(['Marnie SSH'],{
    opponentPublic:{handCount:0,deckCount:40,prizeCount:6}
  })),null);
  assert.equal(chooseConservativeShuffleSupporter(view(["Professor's Research SSH"])),null);
});
test('ties prefer own-only Lillie and detaches from input',()=>{
  const v=view(['Iono PAL',"Lillie's Determination M1L"],{
    opponentPublic:{handCount:7,deckCount:40,prizeCount:3}
  });
  const before=JSON.stringify(v);
  const chosen=chooseConservativeShuffleSupporter(v);
  assert.equal(chosen.family,'lillie');
  assert.equal(JSON.stringify(v),before);
});

test('explicit owner-only offers include competing eligible Supporters',()=>{
  const v=view(["Lillie's Determination M1L",'Marnie SSH']);
  const before=JSON.stringify(v);
  const offers=enumerateConservativeShuffleSupporterOffers(v);
  assert.equal(offers.length,2);
  assert.deepEqual(offers.map(x=>x.handIndex),[0,1]);
  assert.deepEqual(offers.map(x=>x.family),['lillie','marnie']);
  assert.deepEqual(chooseConservativeShuffleSupporter(v),offers[0]);
  assert.equal(JSON.stringify(v),before);
});

test('all offers obey owner Supporter quota and low-hand threshold',()=>{
  const v=view(['Iono PAL']);
  assert.equal(enumerateConservativeShuffleSupporterOffers(v).length,1);
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(enumerateConservativeShuffleSupporterOffers(v),[]);
  assert.equal(chooseConservativeShuffleSupporter(v),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownHand.push('Ultra Ball SVI','VS Seeker PHF','Forest Seal Stone SIT');
  assert.deepEqual(enumerateConservativeShuffleSupporterOffers(v),[]);
});

test('offer order is invariant to forbidden opponent-private and deck-order data',()=>{
  const a=view(['Marnie SSH']);
  const b=structuredClone(a);
  b.opponentPrivate={hand:['secret printing'],prizes:['secret']};
  b.unseenOwnedDeckOrder=['secret future draw'];
  assert.deepEqual(enumerateConservativeShuffleSupporterOffers(a),
    enumerateConservativeShuffleSupporterOffers(b));
});

test('Marnie and Iono draw condition fails if neither remaining hand has a card',()=>{
  const empty=view(['Iono PAL'],{
    opponentPublic:{handCount:0,deckCount:30,prizeCount:2}
  });
  assert.deepEqual(printedShuffleDrawCounts(empty,'iono'),
    {ownDraw:0,opponentDraw:0});
  assert.deepEqual(printedShuffleDrawCounts(empty,'marnie'),
    {ownDraw:0,opponentDraw:0});
  assert.deepEqual(enumerateConservativeShuffleSupporterOffers(empty),[]);
  assert.equal(chooseConservativeShuffleSupporter(empty),null);
});

test('an opponent card or another owner hand card activates printed conditional draw',()=>{
  const oppHasCard=view(['Iono PAL'],{
    opponentPublic:{handCount:1,deckCount:30,prizeCount:2}
  });
  assert.deepEqual(printedShuffleDrawCounts(oppHasCard,'iono'),
    {ownDraw:6,opponentDraw:2});
  const ownerHasExtra=view(['Iono PAL','Ultra Ball SVI'],{
    opponentPublic:{handCount:0,deckCount:30,prizeCount:2}
  });
  assert.deepEqual(printedShuffleDrawCounts(ownerHasExtra,'iono'),
    {ownDraw:6,opponentDraw:2});
  assert.deepEqual(printedShuffleDrawCounts(ownerHasExtra,'marnie'),
    {ownDraw:5,opponentDraw:4});
  const lillieOnly=view(["Lillie's Determination M1L"],{
    opponentPublic:{handCount:0,deckCount:30,prizeCount:2}
  });
  assert.deepEqual(printedShuffleDrawCounts(lillieOnly,'lillie'),
    {ownDraw:8,opponentDraw:0});
});
