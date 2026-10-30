'use strict';

// Source-print midgame Stage-2 attack parity probe; NOT a competitive game.
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(out,name));

function runArm(seat,useTurbo,withHook=false){
  const manager=initializeCards();
  let id=0;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Pinned printing unavailable: '+printing);
    c.id=++id;
    return c;
  };
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GameSettings}=load('game/core/game-settings');
  const {Store}=load('game/store/store');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const attacker=new Player();
  attacker.id=101;attacker.name='Tinkaton SVP source attack';
  attacker.active.cards.push(card('Tinkaton ex SVP'));
  const energies=['Psychic Energy SVE',...(useTurbo?
    ['Double Turbo Energy BRS']:
    ['Psychic Energy SVE','Psychic Energy SVE'])];
  for(const name of energies){
    const energy=card(name);
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  const defender=new Player();
  defender.id=202;defender.name='Unmodified Psychic recipient';
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Tapu Lele-GX GRI'));
  defender.bench.push(bench);
  for(const player of [attacker,defender]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<6;i++)player.deck.cards.push(card('Psychic Energy SVE'));
  }
  const state=new State();
  state.players=seat===0?[attacker,defender]:[defender,attacker];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;

  const undo=withHook?require('./agent7-tinkaton-dte-hook.cjs').installTinkatonDteHook(manager):()=>{};
  try{
  const before=defender.active.damage;
  store.dispatch(new AttackAction(attacker.id,'Pulverizing Press'));
  const prompts=[];
  for(let j=0;j<14;j++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    assert.equal(kind,'WaitPrompt','Unexpected native prompt');
    store.dispatch(new ResolvePromptAction(prompt.id,null));
    prompts.push(kind);
  }
  assert.deepEqual(store.state.prompts.filter(p=>p.result===undefined),[]);
  const damage=defender.active.damage-before;
  const paperDamage=useTurbo?120:140;
  return {seat,useTurbo,sourcePrinting:'Tinkaton ex SVP',
    doubleTurboPrinting:useTurbo?'Double Turbo Energy BRS':null,
    opponentPrinting:'Shadow Rider Calyrex V CRE',
    energyAttachments:energies,damage,paperDamage,
    nativePaperParity:damage===paperDamage,
    genuineStoreAttackDispatch:true,
    waitPrompts:prompts.length,artificialMidgame:true};
  }finally{undo();}
}

function run(){
  const arms=[];
  for(const seat of [0,1]){
    arms.push(runArm(seat,false),runArm(seat,true));
  }
  assert.deepEqual(arms.map(x=>x.damage),[140,140,140,140],
    'Source-level bypass prediction changed: investigate real native mechanics');
  assert.deepEqual(arms.map(x=>x.paperDamage),[140,120,140,120]);
  assert.equal(arms.filter(x=>!x.nativePaperParity).length,2);
  return {schema:'agent7-tinkaton-press-dte-pinned-source-fidelity-v1',
    enginePin:PIN,arms,qualifiedCompetitiveGames:0,
    note:'Artificial Store staging isolates a printing-level damage modifier, not a legal physical deal or competitive matchup.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runArm};
