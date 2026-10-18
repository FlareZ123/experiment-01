'use strict';

const {randomInt}=require('node:crypto');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} part */
const engine=part=>require(path.join(root,part));

/**
 * A controlled, attack-ready Shadow Rider board, with hypothetical printed
 * Trainer in hand. Only the actual action sequence is measured, not draw odds.
 * @param {'Cassius'|'AZ'|'Bird Keeper'|'Tate & Liza'|'Switch'} trainer
 */
function probe(trainer){
  const manager=initializeCards();
  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    if(!found)throw Error('Missing pinned printing '+name);
    return found;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');

  const stateStore=new Store({onStateChange(){}});
  const state=stateStore.state;
  const a=new Player(),b=new Player();
  a.id=101;a.name='Candidate';b.id=202;b.name='Stall';
  state.players=[a,b];state.activePlayer=0;state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    for(let i=0;i<6;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }

  const original=card('Shadow Rider Calyrex V CRE');
  a.active.cards.push(original);
  for(let i=0;i<2;i++){
    const energy=card('Psychic Energy MEE');
    a.active.cards.push(energy);
    a.active.energies.cards.push(energy);
  }
  a.active.tools.push(card('Air Balloon SSH'));

  const ready=new PokemonCardList();
  ready.cards.push(card('Shadow Rider Calyrex V CRE'));
  ready.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  ready.pokemonPlayedTurn=2;
  for(let i=0;i<3;i++){
    const energy=card('Psychic Energy MEE');
    ready.cards.push(energy);
    ready.energies.cards.push(energy);
  }
  a.bench.push(ready);
  b.active.cards.push(card('Snorlax PGO'));
  b.active.tools.push(card('Tool Jammer BST'));

  const printings={
    Cassius:'Cassius XY',AZ:'AZ PHF',
    'Bird Keeper':'Bird Keeper DAA','Tate & Liza':'Tate & Liza CES',
    Switch:'Switch SVI'
  };
  a.hand.cards.push(card(printings[trainer]));
  const prompts=[];
  const errors=[];
  let stage='Trainer';
  const settle=()=>{
    for(let i=0;i<16;i++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)return;
      const name=p.constructor.name;
      prompts.push(name);
      if(name==='ChoosePokemonPrompt'){
        const chooseOriginal=(trainer==='Cassius'||trainer==='AZ')&&
          a.active.getPokemonCard()?.name==='Shadow Rider Calyrex V';
        stateStore.dispatch(new ResolvePromptAction(
          p.id,[chooseOriginal?a.active:ready]));
      } else if(name==='SelectPrompt' && trainer==='Tate & Liza'){
        stateStore.dispatch(new ResolvePromptAction(p.id,0));
      } else if(name==='ShuffleDeckPrompt'){
        const perm=Array.from({length:a.deck.cards.length},(_,index)=>index);
        for(let j=perm.length-1;j>0;j--){
          const k=randomInt(j+1);
          [perm[j],perm[k]]=[perm[k],perm[j]];
        }
        stateStore.dispatch(new ResolvePromptAction(p.id,perm));
      } else if(name==='ChoosePrizePrompt'){
        const choices=a.prizes.filter(x=>x.cards.length>0)
          .slice(0,p.options.count);
        stateStore.dispatch(new ResolvePromptAction(p.id,choices));
      } else if(name==='WaitPrompt'){
        stateStore.dispatch(new ResolvePromptAction(p.id,null));
      } else {
        throw Error('Unhandled pinned prompt '+name);
      }
    }
    if(state.prompts.some(p=>p.result===undefined)){
      throw Error('Prompt limit reached');
    }
  };

  try{
    stateStore.dispatch(new PlayCardAction(a.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    settle();
    stage='Max Geist';
    if(a.active.getPokemonCard()?.name!=='Shadow Rider Calyrex VMAX'){
      throw Error('Ready VMAX was not promoted');
    }
    const energyAtAttack=[a.active,...a.bench].reduce(
      (sum,slot)=>sum+slot.energies.cards.filter(e=>e.name==='Psychic Energy').length,0);
    stateStore.dispatch(new AttackAction(a.id,'Max Geist'));
    settle();
    return {
      trainer,energyAtAttack,
      supporterUsed:a.supporterTurn,
      handSize:a.hand.cards.length,
      opposingActive:b.active.getPokemonCard()?.name??null,
      opposingDamage:b.active.damage,
      prizesTaken:6-a.prizes.filter(p=>p.cards.length>0).length,
      phase:state.phase,prompts,errors
    };
  }catch(e){
    errors.push(stage+': '+String(e?.message||e));
    return {trainer,stage,prompts,errors};
  }
}

function probeAll(){
  const trainers=['Cassius','AZ','Bird Keeper','Tate & Liza','Switch'];
  return {
    sourceDeckMatch:false,competitiveInferenceQualified:false,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scenario:'Five psychic Energy on pre-existing board, 150 HP opposing solo Snorlax, candidate turn 3',
    cases:trainers.map(probe)
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(probeAll(),null,2)+'\n');
module.exports={probe,probeAll};
