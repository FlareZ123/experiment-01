'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {
  withSoloSnorlaxBenchPreservation,
  opponentHasVisibleAttachedEnergy
} = require('./snorlax-solo-opening-policy.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} part */
const engine = part => require(path.join(root, part));

/**
 * Real pinned Store counterexample to the idea that zero opposing visible
 * attached Energy means solo Snorlax cannot be knocked out before next turn.
 * This is a constructed public board and held opponent Energy, not a drawn
 * source field game; only printed Expanded legal Energy/attack combination.
 * @param {boolean} placeBackup Ordinary source Basic Bench alternative.
 * @returns {object} Actual Store trace and terminal board.
 */
function trial(placeBackup) {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found,'Missing pinned printing: '+name);
    return found;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction} =
    engine('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const source = new Player(), opponent = new Player();
  source.id=101;source.name='Snorlax source';
  opponent.id=202;opponent.name='Arceus counterexample';
  state.players=[source,opponent];
  state.activePlayer=0;state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players) {
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    for(let n=0;n<6;n++)player.deck.cards.push(card('Psychic Energy MEE'));
  }

  source.active.cards.push(card('Snorlax PGO'));
  source.hand.cards.push(card('Mimikyu PAL'));
  opponent.active.cards.push(card('Arceus V BRS'),card('Arceus VSTAR BRS'));
  opponent.active.pokemonPlayedTurn=1;
  opponent.hand.cards.push(card('Triple Acceleration Energy UNB'));

  // The opponent's current public board is entirely unpowered.
  const visibleEnergyBefore=opponentHasVisibleAttachedEnergy(state,source);
  assert.equal(visibleEnergyBefore,false);
  class StubBasic {
    useTactic() {
      return new PlayCardAction(source.id,0,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  const configured=withSoloSnorlaxBenchPreservation(
    {tactics:[StubBasic]},{PlayBasicTactic:StubBasic},
    {allowBackupOnVisibleOppEnergy:true}
  );
  const proposal=new configured.tactics[0]().useTactic(state,source);
  assert.equal(proposal,undefined,
    'The public Energy guard must withhold Basic despite latent special attachment');
  const trace=[];
  const settle=()=>{
    for(let attempt=0;attempt<24;attempt++) {
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)return;
      const type=prompt.constructor.name;
      let result;
      if(type==='ChoosePokemonPrompt') {
        assert.ok(source.bench[0],'Expected backup Bench promotion');
        result=[source.bench[0]];
      } else if(type==='ChooseCardsPrompt') {
        result=[];
        if(!prompt.validate(result,state)) {
          result=prompt.cards.cards.filter(c=>c.name==='Psychic Energy')
            .slice(0,prompt.options?.maxCards??1);
        }
      } else if(type==='AttachEnergyPrompt') {
        // Trinity Nova may attach UP TO three Basic Energy. Declining the
        // optional acceleration is a legal, owner-directed resolution that
        // avoids introducing hidden deck knowledge into this KO witness.
        // The native prompt validates the choice; no Store rules are bypassed.
        result=[];
        assert.equal(prompt.validate(result,state),true,
          'Optional Trinity Nova Energy allocation should allow zero cards');
      } else if(type==='WaitPrompt') {
        result=null;
      } else if(type==='ShuffleDeckPrompt') {
        result=Array.from({length:opponent.deck.cards.length},(_,i)=>i);
      } else if(type==='ChoosePrizePrompt') {
        result=opponent.prizes.filter(slot=>slot.cards.length>0)
          .slice(0,prompt.options?.count??1);
      } else {
        throw new Error('Unhandled authentic prompt '+type);
      }
      trace.push({prompt:type,resultCount:Array.isArray(result)?result.length:null});
      store.dispatch(new ResolvePromptAction(prompt.id,result));
    }
    throw new Error('Too many native prompts');
  };

  if(placeBackup) {
    store.dispatch(new PlayCardAction(source.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    settle();
    assert.equal(source.bench.length,1,'Backup Basic must have been Benched');
    assert.equal(source.bench[0].getPokemonCard()?.fullName,'Mimikyu PAL');
    trace.push({source:'ordinary Basic Benched',benchCount:source.bench.length});
  } else {
    trace.push({source:'public Energy policy withheld backup'});
  }
  store.dispatch(new PassTurnAction(source.id));
  settle();
  assert.equal(state.activePlayer,1,'Opponent must get genuine next turn');
  assert.equal(opponent.active.energies.cards.length,0,
    'Opponent should start with zero attached Energy');
  const idx=opponent.hand.cards.findIndex(c=>
    c.fullName==='Triple Acceleration Energy UNB');
  assert.ok(idx>=0,'Opponent must hold printed special Energy');
  store.dispatch(new PlayCardAction(opponent.id,idx,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  settle();
  trace.push({opponent:'attached Triple Acceleration Energy',
    attached:opponent.active.energies.cards.map(c=>c.fullName)});
  store.dispatch(new AttackAction(opponent.id,'Trinity Nova'));
  settle();
  const terminal=state.phase===GamePhase.FINISHED;
  return {
    backup:placeBackup,
    nativeStoreDispatchesCompleted:true,
    initialOpponentVisibleEnergyCount:0,
    sourceGuardDecision:proposal===undefined?'withhold-ordinary-basic':'allow-basic',
    opponentEnergyAfterAttachment:opponent.active.energies.cards.map(c=>c.fullName),
    sourceActive:source.active.getPokemonCard()?.fullName??null,
    sourceBench:source.bench.map(slot=>slot.getPokemonCard()?.fullName??null)
      .filter(Boolean),
    sourcePrizesRemaining:source.prizes.filter(slot=>slot.cards.length>0).length,
    opponentPrizesRemaining:opponent.prizes.filter(slot=>slot.cards.length>0).length,
    nativeFinished:terminal,
    nativeWinner:state.winner,
    trace
  };
}

function run() {
  const solo=trial(false);
  const backup=trial(true);
  assert.equal(solo.nativeFinished,true);
  assert.equal(solo.nativeWinner,1,'Solo opponent should win by KOing only Pokémon');
  assert.equal(solo.sourceActive,null);
  assert.deepEqual(solo.sourceBench,[]);
  assert.equal(backup.nativeFinished,false,'Backup should prevent immediate all-Pokémon loss');
  assert.deepEqual(backup.sourceBench,[]);
  assert.equal(backup.sourceActive,'Mimikyu PAL');
  return {
    schema:'agent19-zero-visible-energy-3C-attachment-sole-pokemon-counterexample-v1',
    scope:'Constructed pinned Store, paper legal card texts, not source-dealt or a game win rate',
    printedPair:'Arceus VSTAR BRS Trinity Nova [CCC] 200 + Triple Acceleration Energy UNB [CCC]',
    opponentInitialVisibleEnergy:0,
    defender:'Snorlax PGO HP150',
    qualifiedCompetitiveGames:0,
    cases:[solo,backup]
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
