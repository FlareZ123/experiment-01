'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {sourceLockSources,candidateChannels}=
  require('../../scripts/agent25-vileplume-pokestop-postlock-screen.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Artificial midgame Store-board action. All involved named lock cards
 * originate in one *particular* authenticated original source roster;
 * the opponent board's chosen placement is still synthetic. No real match
 * or competent opposing turn is simulated. The Stadium play is genuine.
 *
 * @param {0|2|15} sourceRank
 * @param {0|1} candidateSeat
 * @param {{probeBlockedActions?:boolean}} [options]
 */
function runArm(sourceRank,candidateSeat,options={}){
  assert.ok([0,2,15].includes(sourceRank));
  assert.ok([0,1].includes(candidateSeat));
  const probeBlockedActions=options.probeBlockedActions??true;
  assert.equal(typeof probeBlockedActions,'boolean');
  assert.deepEqual(sourceLockSources().map(x=>x.rank),[2,15]);
  assert.equal(candidateChannels().stadiumDiscardOutlet.count,1);
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {StateUtils}=native('game/store/state-utils');
  const manager=initializeCards();
  let next=250000+sourceRank*100+candidateSeat*20;
  const card=name=>{
    const x=manager.getCardByName(name);
    assert.ok(x,'Missing original Store printing '+name);
    x.id=next++;
    return x;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const owner=new Player(),source=new Player();
  owner.id=2501;owner.name='Dhelmise candidate owner';
  source.id=2502;source.name='Original rank '+sourceRank+' synthetic lock board';
  state.players=candidateSeat===0?[owner,source]:[source,owner];
  state.activePlayer=candidateSeat;
  state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Dhelmise M5'));
  const psychic=card('Psychic Energy SVE');
  owner.active.cards.push(psychic);
  owner.active.energies.cards.push(psychic);
  const shuppet=card('Shuppet M5');
  owner.discard.cards.push(shuppet);

  if(sourceRank===2){
    source.active.cards.push(card('Lillipup CEC'),card('Herdier SUM'),
      card('Stoutland BCR'));
  }else source.active.cards.push(card(sourceRank===15?
    'Bunnelby PRC':'Pidgey MEW'));
  source.active.pokemonPlayedTurn=1;
  if(sourceRank!==0){
    const vile=new PokemonCardList();
    vile.cards.push(card('Oddish UNB'),card('Gloom UNB'),
      card('Vileplume AOR'));
    vile.pokemonPlayedTurn=1;
    source.bench.push(vile);
  }
  if(sourceRank===15)source.stadium.cards.push(card('Silent Lab PRC'));

  for(const player of [owner,source]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<8;i++)
      player.deck.cards.push(card('Psychic Energy SVE'));
  }

  const pokestop=card('PokéStop PGO');
  const compressor=card('Battle Compressor PHF');
  const arven=card('Arven SVI');
  owner.hand.cards.push(pokestop,compressor,arven);

  const sourceStadium=()=>StateUtils.getStadiumCard(state)?.fullName??null;
  const shuppetBlocked=()=>IS_ABILITY_BLOCKED(
    store,state,owner,shuppet,shuppet.powers[0]);
  const before={stadium:sourceStadium(),
    shuppetAbilityBlocked:shuppetBlocked(),
    candidateHand:owner.hand.cards.map(x=>x.fullName),
    ownerItemLockPotential:sourceRank!==0,
    ownerSupporterLockPotential:sourceRank===2};

  function play(target,location){
    const index=owner.hand.cards.indexOf(target);
    assert.ok(index>=0);
    return store.dispatch(new PlayCardAction(owner.id,index,location));
  }

  // Genuine attempt: Vileplume's lock must prohibit all Item plays.
  const initialHand=[...owner.hand.cards];
  let itemDenied=null;
  if(sourceRank!==0&&probeBlockedActions){
    itemDenied=false;
    try{play(compressor);}
    catch(e){itemDenied=/CANNOT_PLAY_THIS_CARD/.test(String(e?.message??e));}
    assert.equal(itemDenied,true,'AOR Item-lock native preflight must reject Compressor');
    assert.deepEqual(owner.hand.cards,initialHand,
      'Denied item must not be spent or reorder the candidate hand');
  }

  let supporterDenied=null;
  if(sourceRank===2&&probeBlockedActions){
    supporterDenied=false;
    try{play(arven);}
    catch(e){supporterDenied=/CANNOT_PLAY_THIS_CARD/.test(String(e?.message??e));}
    assert.equal(supporterDenied,true,
      'Active source Stoutland must prohibit Arven Supporter');
    assert.deepEqual(owner.hand.cards,initialHand);
  }

  const stadiumTarget={player:PlayerType.ANY,
    slot:SlotType.BOARD,index:0};
  let stadiumError=null;
  try{play(pokestop,stadiumTarget);}
  catch(error){stadiumError=String(error?.message??error);}
  const actualStadium=sourceStadium();
  const stadiumSettled=actualStadium==='PokéStop PGO' &&
    owner.hand.cards.includes(pokestop)===false &&
    owner.stadiumPlayedTurn===state.turn;
  if(sourceRank===0)
    assert.equal(stadiumSettled,true,'Neutral Stadium control must settle');

  const after={
    stadium:actualStadium,shuppetAbilityBlocked:shuppetBlocked(),
    stadiumPlayedTurn:owner.stadiumPlayedTurn,
    candidateHand:owner.hand.cards.map(x=>x.fullName),
    sourceStadiumAfter:source.stadium.cards.map(x=>x.fullName),
    ownerStadiumAfter:owner.stadium.cards.map(x=>x.fullName),
    prompts:state.prompts.map(x=>x.constructor.name),
    recentLogs:state.logs.slice(-4)
  };
  if(sourceRank===15){
    assert.equal(before.stadium,'Silent Lab PRC');
    assert.equal(before.shuppetAbilityBlocked,true);
    if(stadiumSettled) {
      assert.equal(after.shuppetAbilityBlocked,false);
      assert.equal(source.stadium.cards.length,0);
    }
  }else{
    assert.equal(before.stadium,null);
    assert.equal(before.shuppetAbilityBlocked,false);
  }

  return {
    sourceRank,candidateSeat,probeBlockedActions,enginePin:PIN,
    artificialConstructedLockBoard:true,
    genuineStoreItemDenied:itemDenied,
    genuineStoreSupporterDenied:supporterDenied,
    stadiumPlayError:stadiumError,
    genuineStoreStadiumSettled:stadiumSettled,
    expectedPaperStadiumPlayable:true,
    nativeNoOpWithoutThrownError:!stadiumSettled&&!stadiumError,
    nativeDiscrepancyRequiresCardImplementationReview:!stadiumSettled,
    abilityRestoredOnSilentLabReplacement:sourceRank===15&&stadiumSettled,
    pokestopClass:pokestop.constructor.name,
    pokestopTrainerType:pokestop.trainerType,
    before,after,stadiumEffectUsed:false,
    ownerDeckPhysicalSixty:false,competitivelyQualifiedGames:0
  };
}
function run(){
  const rows=[];
  for(const candidateSeat of [0,1])
    rows.push(runArm(0,candidateSeat,{probeBlockedActions:false}));
  for(const sourceRank of [2,15])for(const candidateSeat of [0,1])
    for(const probeBlockedActions of [false,true])
      rows.push(runArm(sourceRank,candidateSeat,{probeBlockedActions}));
  assert.equal(rows.length,10);
  return {enginePin:PIN,rows,
    allStagedNativeStadiumActionsPassed:rows.every(x=>x.genuineStoreStadiumSettled),
    originalSixtySourceDecisionPolicyTested:false,
    competitiveQualifiedGames:0};
}
module.exports={runArm,run};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
