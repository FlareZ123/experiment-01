'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const manifest=require('../../results/aichi-2026/candidates/agent50-sentinel-alchemy-triplelock-60-v1.json');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

test('structural Alolan Muk/Sentinel candidate is one native resolvable fixed 60',()=>{
  assert.equal(manifest.cards.reduce((n,c)=>n+c.count,0),60);
  const plan=planAichi(manifest,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.ok(Array.isArray(plan.candidate.cards),
    'Candidate must resolve all actual original printing identities');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(plan.candidate.unresolved.length,0);
  for(const id of ['Alolan Grimer SUM','Alolan Muk SUM'])
    assert.ok(plan.candidate.cards.includes(id),'Missing native stage '+id);
  assert.equal(plan.originalSourceIdentity.status,'verified');
  console.log('AGENT50_MUK_NATIVE_SIXTY '+JSON.stringify({
    fixedCount:plan.candidate.cards.length,
    sourceRanks:plan.sourceDeckCount,
    opponentOriginals:plan.opponents.filter(o=>o.status==='ready').length,
    candidateSubstitutions:plan.candidate.substitutions,
    competitiveQualifiedGames:0
  }));
});

/**
 * One explicitly staged midgame board showing whether simultaneous passive
 * Stage2/Stage1/Stage2 locks are represented by the pinned Store.
 * @param {0|1} ownerSeat Physical seat of the rank2-origin control player.
 * @param {boolean} muk Whether the Stage1 Basic Ability lock is present.
 * @returns {object} Two-seat native board.
 */
function stage(ownerSeat,muk=true){
  const mgr=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=98000;
  const card=printing=>{
    const c=mgr.getCardByName(printing);
    assert.ok(c,'Unimplemented native printed card '+printing);
    c.id=id++;
    return c;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=98010;opponent.id=98020;
  for(const p of [owner,opponent]){
    p.bench=Array.from({length:5},()=>new PokemonCardList());
    for(let i=0;i<20;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    p.prizes=Array.from({length:6},()=>{
      const pile=new CardList();
      pile.cards.push(card('Psychic Energy SVE'));
      return pile;
    });
  }
  owner.active.cards.push(card('Lillipup CEC'),card('Herdier SUM'),
    card('Stoutland BCR'));
  owner.bench[0].cards.push(card('Oddish UNB'),card('Gloom UNB'),
    card('Vileplume AOR'));
  if(muk)owner.bench[1].cards.push(card('Alolan Grimer SUM'),
    card('Alolan Muk SUM'));
  opponent.active.cards.push(card('Genesect V FST'));
  opponent.bench[0].cards.push(card('Genesect V FST'));
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=ownerSeat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=1-ownerSeat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,card};
}

for(const ownerSeat of [0,1]){
  test('native triple lock vetoes opposing Basic draw, Item and Supporter in owner seat '+ownerSeat,()=>{
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const basic=stage(ownerSeat,true);
    const draw=new UseAbilityAction(basic.opponent.id,'Fusion Strike System',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    });
    assert.throws(()=>basic.store.dispatch(draw),
      'Power of Alchemy must reject a Basic Genesect Ability');

    const item=stage(ownerSeat,true),switchCard=item.card('Switch SVI');
    item.opponent.hand.cards.push(switchCard);
    assert.throws(()=>item.store.dispatch(new PlayCardAction(
      item.opponent.id,0,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}
    )),'Irritating Pollen must reject an opponent Item');
    assert.ok(item.opponent.hand.cards.includes(switchCard));

    const support=stage(ownerSeat,true);
    const lillie=support.card("Lillie's Determination M1L");
    support.opponent.hand.cards.push(lillie);
    assert.throws(()=>support.store.dispatch(new PlayCardAction(
      support.opponent.id,0,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}
    )),'Sentinel must reject an opponent Supporter');
    assert.ok(support.opponent.hand.cards.includes(lillie));
    assert.equal(support.opponent.supporterTurn,0);

    const noMuk=stage(ownerSeat,false);
    noMuk.store.dispatch(new UseAbilityAction(noMuk.opponent.id,
      'Fusion Strike System',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }));
    assert.ok(noMuk.opponent.hand.cards.length>0,
      'Removing Muk must restore the ordinary native Genesect draw');
    console.log('AGENT50_TRIPLELOCK_NATIVE '+JSON.stringify({
      ownerSeat,passiveLocks:['Sentinel','Irritating Pollen',
        'Power of Alchemy'],
      opponentBasicDrawDenied:true,
      opponentItemDenied:true,opponentSupporterDenied:true,
      genuineNonMukBasicDrawRestored:true,
      originalFullGame:false,competitiveQualifiedGames:0
    }));
  });
}
