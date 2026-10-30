'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {withSoloSnorlaxBenchPreservation,opponentHasVisibleAttachedEnergy} =
  require('./snorlax-solo-opening-policy.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} part */
const native = part => require(path.join(output,part));

/**
 * Stage the real rank-5 Mew Genesect physical card printings against the real
 * rank-3/7 Snorlax/Mimikyu printings in the pinned Store. This is a deliberately
 * built turn-three board, not a randomized source-dealt match.
 *
 * @param {boolean} benchBackup Whether source uses its ordinary legal Basic.
 * @returns {object} Live native transcript, not a competitive game.
 */
function trial(benchBackup) {
  const manager=initializeCards();
  /** @param {string} name */
  const card=name=>{
    const copy=manager.getCardByName(name);
    assert.ok(copy,'Pinned mechanical print missing: '+name);
    return copy;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange() {}});
  const state=store.state;
  const source=new Player(), opponent=new Player();
  source.id=101;source.name='Registered rank3/7 Snorlax mechanical source';
  opponent.id=202;opponent.name='Registered rank5 Mew Genesect mechanical opponent';
  state.players=[source,opponent];
  state.activePlayer=0;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const slot=new CardList();
      slot.cards.push(card('Psychic Energy MEE'));
      return slot;
    });
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }

  source.active.cards.push(card('Snorlax PGO'));
  source.hand.cards.push(card('Mimikyu PAL'));
  opponent.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  opponent.active.pokemonPlayedTurn=1;
  const bench=new PokemonCardList();
  bench.cards.push(card('Genesect V FST'));
  opponent.bench.push(bench);
  opponent.hand.cards.push(card('Double Colorless Energy SUM'));

  assert.equal(opponent.active.energies.cards.length,0);
  const before=opponentHasVisibleAttachedEnergy(state,source);
  assert.equal(before,false);
  class StubBasic {
    useTactic(){return new PlayCardAction(source.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });}
  }
  const guarded=withSoloSnorlaxBenchPreservation(
    {tactics:[StubBasic]},{PlayBasicTactic:StubBasic},
    {allowBackupOnVisibleOppEnergy:true}
  );
  const proposal=new guarded.tactics[0]().useTactic(state,source);
  assert.equal(proposal,undefined,
    'Zero Energy visible: the existing source guard withholds ordinary Basic');

  const trace=[];
  /** @param {object} prompt */
  function choose(prompt){
    const kind=prompt.constructor.name;
    if(kind==='WaitPrompt')return null;
    if(kind==='ChoosePokemonPrompt'){
      assert.ok(source.bench[0],'Expected backup Bench when Snorlax is KO');
      return [source.bench[0]];
    }
    if(kind==='ChooseAttackPrompt'){
      const donor=prompt.cards.find(c=>c.fullName==='Genesect V FST');
      assert.ok(donor,'Genuine Cross Fusion Strike must offer rank5 Genesect V');
      const attack=donor.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(attack,'Expected real 210-damage source attack');
      assert.equal(prompt.validate(attack),true,'Techno Blast must be selectable');
      trace.push({kind,selected:attack.name,donor:donor.fullName});
      return attack;
    }
    throw Error('Unexpected pinned native prompt '+kind);
  }
  function settle(){
    for(let i=0;i<40;i++){
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)return;
      const kind=prompt.constructor.name;
      const result=choose(prompt);
      store.dispatch(new ResolvePromptAction(prompt.id,result));
      trace.push({kind,resolved:true});
    }
    throw Error('Unsettled native prompts >40');
  }
  if(benchBackup){
    store.dispatch(new PlayCardAction(source.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    settle();
    assert.equal(source.bench[0]?.getPokemonCard()?.fullName,'Mimikyu PAL');
    trace.push({step:'source placed backup Mimikyu using genuine PlayCardAction'});
  }
  store.dispatch(new PassTurnAction(source.id));
  settle();
  assert.equal(state.activePlayer,1,'Opponent must own genuine next turn');
  assert.equal(opponent.active.energies.cards.length,0);

  const held=opponent.hand.cards.findIndex(c=>
    c.fullName==='Double Colorless Energy SUM');
  assert.ok(held>=0);
  store.dispatch(new PlayCardAction(opponent.id,held,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  settle();
  assert.equal(opponent.active.energies.cards.some(c=>
    c.fullName==='Double Colorless Energy SUM'),true,
  'Genuine Store DCE must be attached to Mew VMAX');
  trace.push({step:'one DCE attached through genuine PlayCardAction'});
  store.dispatch(new AttackAction(opponent.id,'Cross Fusion Strike'));
  settle();

  const winner=state.winner;
  const nativeFinished=state.phase===GamePhase.FINISHED;
  const sourceRemaining=[source.active,...source.bench]
    .map(x=>x.getPokemonCard()?.fullName??null).filter(Boolean);
  return {
    benchBackup,
    publicEnergyBeforeOpponentTurn:0,
    sourceGuardDecision:'withhold-ordinary-basic',
    attacker:'Mew VMAX FST',
    donor:'Genesect V FST',
    energy:'Double Colorless Energy SUM',
    currentSourceCards:sourceRemaining,
    currentSourceActive:source.active.getPokemonCard()?.fullName??null,
    sourceDamage:source.active.damage,
    opponentPublicEnergyAfter:opponent.active.energies.cards.map(c=>c.fullName),
    nativeFinished,nativeWinner:winner,
    nativeSourcePrizesRemaining:source.prizes.filter(s=>s.cards.length>0).length,
    nativeOpponentPrizesRemaining:opponent.prizes.filter(s=>s.cards.length>0).length,
    trace
  };
}
/** @returns {object} */
function run(){
  const solo=trial(false);
  const backup=trial(true);
  assert.equal(solo.nativeFinished,true,
    'Single Snorlax KO must end the real Store game');
  assert.equal(solo.nativeWinner,1);
  assert.deepEqual(solo.currentSourceCards,[]);
  assert.equal(backup.nativeFinished,false,
    'Backup Mimikyu must prevent sole-Pokémon sudden loss');
  assert.equal(backup.currentSourceActive,'Mimikyu PAL');
  assert.ok(solo.trace.some(x=>x.selected==='Techno Blast'));
  assert.ok(backup.trace.some(x=>x.selected==='Techno Blast'));
  return {
    schema:'agent19-original-rank5-mew-DCE-one-attachment-snorlax-source-threat-v1',
    classification:'Constructed printed-source mechanical Store proof, not a source-dealt game',
    actualRegisteredSourcePieces:true,
    citedRegisteredRanks:[3,5,7],
    pinnedExpectedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    competitiveQualifiedGames:0,
    cases:[solo,backup]
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
