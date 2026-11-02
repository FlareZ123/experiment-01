'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(base,relative));

/** @param {0|1} seat @param {'genesect'|'mew-mirror'} choice */
function trial(seat,choice){
  assert.ok(seat===0||seat===1);
  assert.ok(choice==='genesect'||choice==='mew-mirror');
  const manager=initializeCards();
  let nextId=0;
  const card=fullName=>{
    const copy=manager.getCardByName(fullName);
    assert.ok(copy,'Pinned printed card not implemented: '+fullName);
    copy.id=++nextId;
    return copy;
  };
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Store}=native('game/store/store');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const attacker=new Player(),defender=new Player();
  attacker.id=101;attacker.name='Rank 5 Mew donor';
  defender.id=202;defender.name='Rank 3/7 Mimikyu defender';

  attacker.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  attacker.active.pokemonPlayedTurn=1;
  const dce=card('Double Colorless Energy SUM');
  attacker.active.cards.push(dce);
  attacker.active.energies.cards.push(dce);
  const gene=new PokemonCardList();
  gene.cards.push(card('Genesect V FST'));
  attacker.bench.push(gene);
  const mirror=new PokemonCardList();
  mirror.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  mirror.pokemonPlayedTurn=1;
  attacker.bench.push(mirror);
  defender.active.cards.push(card('Mimikyu PAL'));
  const backup=new PokemonCardList();
  backup.cards.push(card('Snorlax PGO'));
  defender.bench.push(backup);
  for(const player of [attacker,defender]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
  }
  const state=new State();
  state.players=seat===0?[attacker,defender]:[defender,attacker];
  state.activePlayer=seat;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();
  state.gameSettings=settings;state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const before=attacker.prizes.filter(p=>p.cards.length>0).length;
  store.dispatch(new AttackAction(attacker.id,'Cross Fusion Strike'));
  const trace=[];
  for(let i=0;i<30;i++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let result;
    if(kind==='ChooseAttackPrompt'){
      const donorName=choice==='genesect'?'Genesect V FST':'Mew VMAX FST';
      const attackName=choice==='genesect'?'Techno Blast':'Max Miracle';
      const donor=prompt.cards.find(c=>c.fullName===donorName);
      assert.ok(donor,'Native donor unavailable: '+donorName);
      const attack=donor.attacks.find(a=>a.name===attackName);
      assert.ok(attack,'Native copied attack absent: '+attackName);
      assert.equal(prompt.validate(attack),true);
      result=attack;
      trace.push({kind,donor:donorName,attack:attackName});
    }else if(kind==='ChoosePrizePrompt'){
      const owner=store.state.players.find(p=>p.id===prompt.getPerspectivePlayerId());
      assert.ok(owner);
      result=owner.prizes.filter(x=>x.cards.length>0).slice(0,prompt.options.count);
    }else if(kind==='ChoosePokemonPrompt'){
      const owner=store.state.players.find(p=>p.id===prompt.getPerspectivePlayerId());
      const promoted=owner?.bench.find(x=>x.cards.length>0);
      assert.ok(promoted);
      result=[promoted];
    }else if(kind==='WaitPrompt')result=null;
    else throw Error('Unresolved native prompt: '+kind);
    store.dispatch(new ResolvePromptAction(prompt.id,result));
    trace.push({kind,resolved:true});
  }
  assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,0);
  const prizes=before-attacker.prizes.filter(p=>p.cards.length>0).length;
  assert.equal(prizes,choice==='genesect'?0:1,
    'Native copy must reproduce original printed Safeguard distinction');
  return {seat,choice,prizesTaken:prizes,
    defenderActive:defender.active.getPokemonCard()?.fullName??null,
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalSourcePrintings:true,constructedBoard:true,
    competitiveQualifiedGames:0,genuineStoreAttack:true,trace};
}
function run(){
  const arms=[];
  for(const seat of [0,1])
    for(const choice of ['genesect','mew-mirror'])
      arms.push(trial(seat,choice));
  return {schema:'agent19-mew-mirror-max-miracle-pal-safeguard-native-v1',
    competitiveQualifiedGames:0,arms};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
