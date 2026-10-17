'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {assertValidPromptAction} = require('./prompt-integrity.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * A conditioned, action-and-prompt-level test of the Aichi New Moon source
 * Cursed Blast self-KO into same-turn Ace Trainer, with actual Prize changes.
 *
 * @returns {object} Machine-checkable reducer observations; no setup probability.
 */
function cursedBlastAceTrainerContract() {
  const cards = initializeCards();
  let uid = 1200;
  /** @param {string} printing */
  const card = printing => {
    const found = cards.getCardByName(printing);
    assert.ok(found, 'Missing pinned card '+printing);
    found.id = uid++;
    return found;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType} = load('game/store/actions/play-card-action');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.activePlayer=0;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const candidate=new Player(),opponent=new Player();
  candidate.id=101;candidate.name='New Moon';
  opponent.id=202;opponent.name='Field adversary';
  state.players=[candidate,opponent];
  candidate.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  const duskull=card('Duskull VIV');
  const dusclops=card('Dusclops SFA');
  const evolved=new PokemonCardList();
  evolved.cards.push(duskull,dusclops);
  candidate.bench.push(evolved);
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  const ace=card('Ace Trainer AOR');
  candidate.hand.cards.push(ace,card('Psychic Energy MEE'));
  for(let i=0;i<5;i++)opponent.hand.cards.push(card('Psychic Energy MEE'));
  for(const p of state.players){
    for(let i=0;i<16;i++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }

  const trace=[];
  /** @param {'blast'|'supporter'} phase */
  function resolvePhase(phase) {
    for(let count=0;count<36;count++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending) return;
      const kind=pending.constructor.name;
      let selection;
      if(kind==='WaitPrompt')selection=null;
      else if(kind==='ChoosePokemonPrompt' && phase==='blast')selection=[opponent.active];
      else if(kind==='ChoosePrizePrompt'){
        const chooser=state.players.find(p=>p.id===pending.playerId);
        assert.ok(chooser);
        selection=chooser.prizes.filter(prize=>prize.cards.length)
          .slice(0,pending.options.count);
      }else if(kind==='ShuffleDeckPrompt'){
        const chooser=state.players.find(p=>p.id===pending.playerId);
        assert.ok(chooser);
        selection=Array.from({length:chooser.deck.cards.length},(_,index)=>index);
      }else throw new Error('Unexpected '+phase+' prompt: '+kind);
      const action = new ResolvePromptAction(pending.id,selection);
      assert.doesNotThrow(() => assertValidPromptAction(state,action),
        'Invalid strict prompt action for '+phase+' '+kind);
      trace.push({phase,kind,playerId:pending.playerId});
      store.dispatch(action);
    }
    assert.fail('Prompt loop exceeded bound in '+phase);
  }

  const before={
    ownPrizes:candidate.getPrizeLeft(),otherPrizes:opponent.getPrizeLeft(),
    canPlayAce:ace.canPlay(store,state,candidate),
    ownBench: candidate.bench.length
  };
  assert.equal(before.canPlayAce,false);
  store.dispatch(new UseAbilityAction(candidate.id,'Cursed Blast',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  resolvePhase('blast');
  const afterBlast={
    ownPrizes:candidate.getPrizeLeft(),otherPrizes:opponent.getPrizeLeft(),
    opposingDamage:opponent.active.damage,
    discardedDusclops:candidate.discard.cards.includes(dusclops),
    canPlayAce:ace.canPlay(store,state,candidate)
  };
  assert.equal(afterBlast.ownPrizes,6);
  assert.equal(afterBlast.otherPrizes,5,
    'Self-KO must grant one real Prize to opponent');
  assert.equal(afterBlast.opposingDamage,50);
  assert.ok(afterBlast.discardedDusclops,
    'Cursed Blast Pokémon must leave board for discard');
  assert.equal(afterBlast.canPlayAce,true);

  const handIndex=candidate.hand.cards.indexOf(ace);
  assert.ok(handIndex>=0);
  store.dispatch(new PlayCardAction(candidate.id,handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
  }));
  resolvePhase('supporter');
  const afterSupporter={
    ownPrizes:candidate.getPrizeLeft(),otherPrizes:opponent.getPrizeLeft(),
    ownHand:candidate.hand.cards.length,otherHand:opponent.hand.cards.length,
    spentSupporter:candidate.discard.cards.includes(ace),
    playedSupporterTurn:candidate.supporterTurn,
    pending:state.prompts.filter(p=>p.result===undefined).length
  };
  assert.equal(afterSupporter.ownHand,6);
  assert.equal(afterSupporter.otherHand,3);
  assert.ok(afterSupporter.spentSupporter);
  assert.equal(afterSupporter.pending,0);
  return {
    sourcePrints:{duskull:duskull.fullName,dusclops:dusclops.fullName,
      supporter:ace.fullName},
    before,afterBlast,afterSupporter,trace,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'Injected evolved Bench and future hand; actual Ability, self-KO, Prize and Supporter reducers'
  };
}
if(require.main===module)console.log(JSON.stringify(cursedBlastAceTrainerContract(),null,2));
module.exports={cursedBlastAceTrainerContract};
