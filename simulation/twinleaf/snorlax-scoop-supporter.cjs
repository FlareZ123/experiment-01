'use strict';

const {randomInt} = require('node:crypto');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} module */
const engine = module => require(path.join(output, module));

/**
 * Test a Supporter removing its own trapped Active versus solo Snorlax.
 * These Supporters are proposed deck swaps, absent from benchmark source 60s.
 * @param {{supporter:'Cassius'|'AZ'|'Bird Keeper'|'Tate & Liza',jammer:boolean,ownBench:boolean,mode?:'switch'|'draw'}} config
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
    for(let n=0;n<6;n++) player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const original = card('Shadow Rider Calyrex V CRE');
  const attachedEnergy=card('Psychic Energy MEE');
  const attachedTool=card('Float Stone BKT');
  us.active.cards.push(original,attachedEnergy);
  // Twinleaf's real attachment path stores Energy in both indexes.
  us.active.energies.cards.push(attachedEnergy);
  us.active.tools.push(attachedTool);
  if (config.ownBench) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Latias ex SSP'));
    us.bench.push(bench);
  }
  them.active.cards.push(card('Snorlax PGO'));
  if (config.jammer) them.active.tools.push(card('Tool Jammer BST'));
  const supporterPrinting={Cassius:'Cassius XY',AZ:'AZ PHF','Bird Keeper':'Bird Keeper DAA','Tate & Liza':'Tate & Liza CES'};
  us.hand.cards.push(card(supporterPrinting[config.supporter]));

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
        const choice=['Bird Keeper','Tate & Liza'].includes(config.supporter)?us.bench[0]:
          us.active.getPokemonCard()?.name==='Shadow Rider Calyrex V'?
            us.active:us.bench[0];
        store.dispatch(new ResolvePromptAction(prompt.id,[choice]));
      } else if(kind==='SelectPrompt' && config.supporter==='Tate & Liza') {
        const index=config.mode==='switch'?0:config.ownBench?1:0;
        store.dispatch(new ResolvePromptAction(prompt.id,index));
      } else if(kind==='ShuffleDeckPrompt') {
        // The pinned engine requires an explicit complete deck permutation.
        // Use unbiased cryptographic draws: this fixture does not model deck-order policy.
        const permutation=Array.from({length:us.deck.cards.length},(_,i)=>i);
        for(let i=permutation.length-1;i>0;i--){
          const j=randomInt(i+1);
          [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
        }
        store.dispatch(new ResolvePromptAction(prompt.id,permutation));
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
    targetOnBench:us.bench.some(s=>s.cards.includes(original)),
    energyOnBench:us.bench.some(s=>s.energies.cards.includes(attachedEnergy)),
    energyOnActive:us.active.energies.cards.includes(attachedEnergy),
    toolOnBench:us.bench.some(s=>s.tools.includes(attachedTool)),
    toolOnActive:us.active.tools.includes(attachedTool),
    handCountAfter:us.hand.cards.length,
    energyInDeck:us.deck.cards.includes(attachedEnergy),
    energyInHand:us.hand.cards.includes(attachedEnergy),
    energyInDiscard:us.discard.cards.includes(attachedEnergy),
    toolInDeck:us.deck.cards.includes(attachedTool),
    toolInHand:us.hand.cards.includes(attachedTool),
    toolInDiscard:us.discard.cards.includes(attachedTool),
    supporterDiscarded:us.discard.cards.some(c=>c.name===config.supporter),
    supporterInPlayZone:us.supporter.cards.some(c=>c.name===config.supporter),
    supporterTurn:us.supporterTurn,
    phase:state.phase,
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
    {supporter:'Cassius',jammer:false,ownBench:false},
    {supporter:'Bird Keeper',jammer:false,ownBench:true},
    {supporter:'Bird Keeper',jammer:true,ownBench:true},
    {supporter:'Bird Keeper',jammer:false,ownBench:false},
    {supporter:'Tate & Liza',jammer:true,ownBench:true,mode:'switch'},
    {supporter:'Tate & Liza',jammer:true,ownBench:true,mode:'draw'},
    {supporter:'Tate & Liza',jammer:true,ownBench:false,mode:'draw'}
  ];
  return {
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceDeckMatch:false,competitiveInferenceQualified:false,
    cases:cases.map(probe)
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(probeAll(),null,2)+'\n');
module.exports={probe,probeAll};
