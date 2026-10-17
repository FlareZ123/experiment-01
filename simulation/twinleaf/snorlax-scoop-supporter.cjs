'use strict';

const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} module */
const engine = module => require(path.join(output, module));

/**
 * Test a Supporter removing its own trapped Active versus solo Snorlax.
 * These Supporters are proposed deck swaps, absent from benchmark source 60s.
 * @param {{supporter:'Cassius'|'AZ',jammer:boolean,ownBench:boolean}} config
 */
function probe(config) {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    if (!found) throw Error('Missing compiled card: ' + name);
    return found;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const us = new Player(), them = new Player();
  us.id = 101; us.name = 'Candidate';
  them.id = 202; them.name = 'Snorlax';
  state.players = [us,them];
  state.activePlayer = 0;
  state.turn = 3;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  for (const player of state.players) {
    player.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const original = card('Shadow Rider Calyrex V CRE');
  us.active.cards.push(original);
  if (config.ownBench) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Latias ex SSP'));
    us.bench.push(bench);
  }
  them.active.cards.push(card('Snorlax PGO'));
  if (config.jammer) them.active.tools.push(card('Tool Jammer BST'));
  us.hand.cards.push(card(config.supporter==='Cassius'?'Cassius XY':'AZ PHF'));

  const prompts=[];
  let error=null;
  try {
    store.dispatch(new PlayCardAction(us.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    for(let n=0;n<8;n++) {
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      prompts.push({kind, active:us.active.getPokemonCard()?.name??null});
      if(kind==='ChoosePokemonPrompt') {
        const choice=us.active.getPokemonCard()?.name==='Shadow Rider Calyrex V'?
          us.active:us.bench[0];
        store.dispatch(new ResolvePromptAction(prompt.id,[choice]));
      } else if(kind==='WaitPrompt') {
        store.dispatch(new ResolvePromptAction(prompt.id,null));
      } else {
        error='Unresolved prompt '+kind;
        break;
      }
    }
  }catch(e){error=String(e?.message??e);}
  return {
    ...config,activeAfter:us.active.getPokemonCard()?.name??null,
    benchAfter:us.bench.map(p=>p.getPokemonCard()?.name??null),
    targetInDeck:us.deck.cards.includes(original),
    targetInHand:us.hand.cards.includes(original),
    targetInDiscard:us.discard.cards.includes(original),
    supporterDiscarded:us.discard.cards.some(c=>c.name===config.supporter),
    remainingPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    prompts,error
  };
}

/** @returns {object} Staged printed-card source-independent results. */
function probeAll(){
  const cases=[
    {supporter:'Cassius',jammer:false,ownBench:true},
    {supporter:'Cassius',jammer:true,ownBench:true},
    {supporter:'AZ',jammer:true,ownBench:true},
    {supporter:'Cassius',jammer:false,ownBench:false}
  ];
  return {
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceDeckMatch:false,competitiveInferenceQualified:false,
    cases:cases.map(probe)
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(probeAll(),null,2)+'\n');
module.exports={probe,probeAll};
