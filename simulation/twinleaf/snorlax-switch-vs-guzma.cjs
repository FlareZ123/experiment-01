'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {installGuzmaNoTargetHook}=require('./guzma-no-target-hook.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} part */
const engine=part=>require(path.join(root,part));

/**
 * A single source-faithful logical choice, executed as a pinned Store action.
 * Both Trainers are legal Expanded printings; no hand/search frequency assumed.
 * @param {{trainer:'Switch'|'Guzma',opponentBench:boolean,jammer:boolean,guzmaCorrection?:boolean}} options
 */
function probeTrainerEscape(options){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');

  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing pinned printing '+name);
    return found;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=101;a.name='Shadow Rider';b.id=202;b.name='Snorlax';
  state.players=[a,b];state.activePlayer=0;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const side of state.players){
    side.prizes=Array.from({length:6},()=>{
      const prize=new CardList();prize.cards.push(card('Dratini OBF'));return prize;
    });
    side.deck.cards.push(card('Psychic Energy MEE'));
  }
  a.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const ownBench=new PokemonCardList();
  ownBench.cards.push(card('Latias ex SSP'));a.bench.push(ownBench);
  b.active.cards.push(card('Snorlax PGO'));
  if(options.opponentBench){
    const target=new PokemonCardList();
    target.cards.push(card('Mimikyu PAL'));b.bench.push(target);
  }
  if(options.jammer)b.active.tools.push(card('Tool Jammer BST'));
  a.hand.cards.push(card(options.trainer==='Switch'?'Switch SVI':'Guzma BUS'));

  const restore=options.guzmaCorrection?installGuzmaNoTargetHook():()=>{};
  let error=null,steps=[];
  try {
    store.dispatch(new PlayCardAction(a.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    for(let n=0;n<6;n++){
      const p=state.prompts.find(prompt=>prompt.result===undefined);
      if(!p)break;
      const name=p.constructor.name;
      steps.push(name);
      if(name==='ChoosePokemonPrompt') {
        const choice=options.trainer==='Guzma'&&options.opponentBench&&
          steps.filter(x=>x==='ChoosePokemonPrompt').length===1 ?
          b.bench[0]:a.bench[0];
        store.dispatch(new ResolvePromptAction(p.id,[choice]));
      } else if(name==='WaitPrompt') {
        store.dispatch(new ResolvePromptAction(p.id,null));
      } else {
        throw new Error('Unexpected Trainer prompt '+name);
      }
    }
  }catch(failure){error=String(failure?.message||failure);}
  finally{restore();}
  return {
    ...options,originalActive:'Shadow Rider Calyrex V',
    activeAfter:a.active.getPokemonCard()?.name||null,
    opponentActiveAfter:b.active.getPokemonCard()?.name||null,
    trainerInDiscard:a.discard.cards.some(c=>c.name===options.trainer),
    trainerInHand:a.hand.cards.some(c=>c.name===options.trainer),
    prompts:steps,
    error
  };
}

/** @returns {object} Narrow effect-level escape matrix, no game wins. */
function probeAll(){
  const cases=[
    {trainer:'Switch',opponentBench:false,jammer:false},
    {trainer:'Switch',opponentBench:false,jammer:true},
    {trainer:'Guzma',opponentBench:false,jammer:false},
    {trainer:'Guzma',opponentBench:false,jammer:true},
    {trainer:'Guzma',opponentBench:true,jammer:false}
  ];
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:cases.map(probeTrainerEscape),
    correctedCases:cases.map(config=>probeTrainerEscape({...config,guzmaCorrection:true})),
    scope:'Pinned Store-dispatched Trainer interactions on a controlled board; no live 60-card match'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(probeAll(),null,2)+'\n');
module.exports={probeTrainerEscape,probeAll};
