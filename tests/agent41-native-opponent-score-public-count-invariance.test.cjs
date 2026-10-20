'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {State}=require(path.join(output,'game/store/state/state'));
const {Player}=require(path.join(output,'game/store/state/player'));
const {OpponentScore}=require(path.join(output,
  'simple-bot/state-score/opponent-score'));

test('pinned native opponent scorer is invariant to hidden card identities',()=>{
  const state=new State();
  const owner=new Player(),opponent=new Player();
  owner.id=101;
  opponent.id=202;
  opponent.hand.cards=[
    {fullName:'unknown hand card A'},{fullName:'unknown hand card B'}
  ];
  opponent.deck.cards=[
    {fullName:'unknown deck card A'},{fullName:'unknown deck card B'},
    {fullName:'unknown deck card C'}
  ];
  state.players=[owner,opponent];
  const scores={deck:11,hand:19,board:23,energy:29,
    emptyBench:31,noActiveEnergy:37};
  const scorer=new OpponentScore({scores:{opponent:scores}});
  const baseline=scorer.getScore(state,101);

  // This is solely an OpponentScore unit test. It does not certify that
  // other native tactics, reducers or prompt resolvers are information-safe.
  opponent.hand.cards=[
    {fullName:'different secret X'},{fullName:'different secret Y'}
  ];
  opponent.deck.cards=[
    {fullName:'different secret Z'},{fullName:'different secret W'},
    {fullName:'different secret V'}
  ];
  assert.equal(scorer.getScore(state,101),baseline);

  // The same module intentionally depends on public zone counts.
  opponent.deck.cards.push({fullName:'additional concealed card'});
  assert.equal(scorer.getScore(state,101),baseline+scores.deck);
  opponent.hand.cards.push({fullName:'additional unseen hand card'});
  assert.equal(scorer.getScore(state,101),
    baseline+scores.deck+scores.hand);
});
