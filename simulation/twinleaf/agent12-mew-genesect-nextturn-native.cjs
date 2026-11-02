'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(ROOT,relative));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent12-rank5-mew-copied-techno-blast-next-turn-native-v1';

/**
 * Resolve only native Store-generated prompts. We may select the original
 * owner-visible printed donor, which the staged owner already has on Bench.
 */
function resolvePending(store,attacker,choice,receipts){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<40;i++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return;
    const kind=prompt.constructor.name;
    let selection;
    if(kind==='ChooseAttackPrompt'){
      assert.equal(prompt.playerId,attacker.id);
      const donor=prompt.cards.find(c=>c.fullName==='Genesect V FST');
      assert.ok(donor,'Original printed Genesect donor must remain Benched');
      selection=donor.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(selection&&prompt.validate(selection),
        'Owner-visible native copied-attack selection is invalid');
    }else if(kind==='WaitPrompt')selection=null;
    else if(kind==='ChoosePrizePrompt'){
      const player=store.state.players.find(p=>
        p.id===prompt.getPerspectivePlayerId());
      assert.ok(player);
      selection=player.prizes.filter(p=>p.cards.length>0).slice(
        0,prompt.options.count);
    }else if(kind==='ChoosePokemonPrompt'){
      const player=store.state.players.find(p=>
        p.id===prompt.getPerspectivePlayerId());
      assert.ok(player);
      selection=[player.bench.find(p=>p.cards.length>0)];
      assert.ok(selection[0]);
    }else throw Error('Unplanned genuine Store prompt: '+kind);
    store.dispatch(new ResolvePromptAction(prompt.id,selection));
    receipts.push({kind,accepted:true,filledResult:prompt.result!==undefined,
      originalNativePromptId:prompt.id});
  }
  assert.fail('Prompt settlement must not exceed 40 native responses');
}

/**
 * @param {0|1} attackerSeat Actual first attacking physical seat.
 * @returns {object} Real Store decisions and printed next-turn lock observations.
 */
function trial(attackerSeat){
  assert.ok(attackerSeat===0||attackerSeat===1);
  const manager=initializeCards();
  let nextId=0;
  function card(fullName){
    const c=manager.getCardByName(fullName);
    assert.ok(c,'Exact pinned card not implemented: '+fullName);
    c.id=++nextId;
    return c;
  }
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Store}=native('game/store/store');
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const a=new Player(),b=new Player();
  a.id=101;a.name='Original source rank 5 Mew/Genesect';
  b.id=202;b.name='Constructed original PAL Mimikyu defence';

  a.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  a.active.pokemonPlayedTurn=1;
  const dce=card('Double Colorless Energy SUM');
  a.active.cards.push(dce);
  a.active.energies.cards.push(dce);
  const donor=new PokemonCardList();
  donor.cards.push(card('Genesect V FST'));
  a.bench.push(donor);
  b.active.cards.push(card('Mimikyu PAL'));
  const backup=new PokemonCardList();
  backup.cards.push(card('Snorlax PGO'));
  b.bench.push(backup);

  for(const player of [a,b]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<8;i++)
      player.deck.cards.push(card('Psychic Energy SVE'));
  }
  const state=new State();
  state.players=attackerSeat===0?[a,b]:[b,a];
  state.activePlayer=attackerSeat;
  state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const prompts=[];
  const owner=()=>store.state.players.find(p=>p.id===a.id);
  const opponent=()=>store.state.players.find(p=>p.id===b.id);
  const flag=()=>({
    pending:owner().active.cannotAttackNextTurnPending,
    applied:owner().active.cannotAttackNextTurn,
    globalTurn:store.state.turn,
    attackerActive:owner().active.getPokemonCard()?.fullName,
    ownerIsActive:store.state.players[store.state.activePlayer].id===a.id
  });

  store.dispatch(new AttackAction(a.id,'Cross Fusion Strike'));
  resolvePending(store,a,'Techno Blast',prompts);
  const afterFirst=flag();
  assert.equal(afterFirst.globalTurn,6,
    'Original printed Techno Blast must finish first native attacking turn');
  assert.ok(prompts.some(p=>p.kind==='ChooseAttackPrompt'));
  assert.equal(opponent().active.getPokemonCard().fullName,'Mimikyu PAL');
  assert.equal(owner().prizes.filter(p=>p.cards.length>0).length,6,
    'Safeguard defender should prevent printed VMAX damage');

  store.dispatch(new PassTurnAction(b.id));
  resolvePending(store,a,'Techno Blast',prompts);
  const nextOwnerTurn=flag();
  assert.equal(nextOwnerTurn.globalTurn,7);
  assert.equal(nextOwnerTurn.ownerIsActive,true);
  let nextTurnIllegalAttackRejected=false;
  let nextTurnError=null;
  try{
    store.dispatch(new AttackAction(a.id,'Cross Fusion Strike'));
  }catch(e){
    nextTurnIllegalAttackRejected=true;
    nextTurnError=e.message;
  }
  const afterReject=flag();
  assert.equal(afterReject.globalTurn,7,
    'Rejected attempt must not end source next turn');

  store.dispatch(new PassTurnAction(a.id));
  resolvePending(store,a,'Techno Blast',prompts);
  store.dispatch(new PassTurnAction(b.id));
  resolvePending(store,a,'Techno Blast',prompts);
  const subsequentOwnerTurn=flag();
  assert.equal(subsequentOwnerTurn.globalTurn,9);
  assert.equal(subsequentOwnerTurn.ownerIsActive,true);
  let subsequentAttackLegal=false;
  let secondFailure=null;
  try{
    store.dispatch(new AttackAction(a.id,'Cross Fusion Strike'));
    resolvePending(store,a,'Techno Blast',prompts);
    subsequentAttackLegal=true;
  }catch(e){secondFailure=e.message;}
  return {
    version:VERSION,attackerSeat,pinnedTwinleaf:PIN,
    originalRank5MewGenesectPrintings:true,
    constructedBoard:true,fullNativeGame:false,
    recordedFirstPrintedCopiedAttack:true,
    afterFirst,nextOwnerTurn,
    nextTurnIllegalAttackRejected,nextTurnError,afterReject,
    subsequentOwnerTurn,subsequentAttackLegal,secondFailure,
    nativePendingChooseAttackPrompts:prompts.filter(p=>
      p.kind==='ChooseAttackPrompt').length,
    independentOpponentPolicyQualified:false,
    paperClockQualified:false,competitivelyQualifiedGames:0
  };
}
function run(){
  const arms=[trial(0),trial(1)];
  return {schema:VERSION,pinnedTwinleaf:PIN,arms,
    rank5PrintedCooldownCorrectBothSeats:arms.every(a=>
      a.nextOwnerTurn.applied&&a.nextTurnIllegalAttackRejected&&
      !a.subsequentOwnerTurn.applied&&a.subsequentAttackLegal),
    competitivelyQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,trial,run};
