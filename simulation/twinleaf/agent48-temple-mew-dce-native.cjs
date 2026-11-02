'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const native=moduleName=>require(path.join(output,moduleName));

/**
 * Constructed native Store payment test with original rank5 Mew printings.
 * This does not simulate a naturally drawn hand, opponent policy or game win.
 * @param {0|1} seat
 * @param {number} energyCount
 * @param {boolean} temple
 * @returns {object}
 */
function trial(seat,energyCount,temple){
  assert.ok(seat===0||seat===1);
  assert.ok(energyCount===1||energyCount===2);
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {GamePhase}=native('game/store/state/state');
  const {Format,CardType}=native('game/store/card/card-types');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {CheckProvidedEnergyEffect}=native('game/store/effects/check-effects');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const cards=initializeCards();
  let id=48000+seat*1000+energyCount*100+Number(temple)*10;
  const card=name=>{
    const copy=cards.getCardByName(name);
    assert.ok(copy,'Original printed native card missing '+name);
    copy.id=id++;
    return copy;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=4801;opponent.id=4802;
  owner.name='Exact rank5 Mew Genesect';
  opponent.name='Damage target';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const slot=new CardList();
      slot.cards.push(card('Psychic Energy MEE'));
      return slot;
    });
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }
  owner.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  owner.active.pokemonPlayedTurn=1;
  const bench=new PokemonCardList();
  bench.cards.push(card('Genesect V FST'));
  owner.bench.push(bench);
  opponent.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  for(let index=0;index<energyCount;index++){
    const dce=card('Double Colorless Energy SUM');
    owner.active.cards.push(dce);
    owner.active.energies.cards.push(dce);
  }
  if(temple)opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  const supplied=new CheckProvidedEnergyEffect(owner);
  store.reduceEffect(state,supplied);
  const energyUnits=supplied.energyMap.filter(x=>
    owner.active.energies.cards.includes(x.card)).map(x=>x.provides);
  assert.equal(energyUnits.length,energyCount);
  for(const provides of energyUnits)
    assert.deepEqual(provides,temple?[CardType.COLORLESS]:
      [CardType.COLORLESS,CardType.COLORLESS]);
  const legal=(!temple)||energyCount===2;
  const before=opponent.active.damage;
  if(!legal){
    assert.throws(()=>store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike')),
      'Native Mew must refuse one-DCE attack under Temple');
    assert.equal(opponent.active.damage,before);
  }else{
    store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
    let selected=false;
    for(let i=0;i<30;i++){
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      if(kind==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(prompt.id,null));
      }else if(kind==='ChooseAttackPrompt'){
        const donor=prompt.cards.find(c=>c.fullName==='Genesect V FST');
        assert.ok(donor,'Native source must offer Genesect V copied donor');
        const attack=donor.attacks.find(a=>a.name==='Techno Blast');
        assert.ok(attack);
        assert.equal(prompt.validate(attack),true);
        store.dispatch(new ResolvePromptAction(prompt.id,attack));
        selected=true;
      }else{
        assert.fail('Unexpected Mew native prompt '+kind);
      }
    }
    assert.equal(selected,true);
    assert.equal(opponent.active.damage-before,210,
      'Native Genesect copied donor should deal 210 damage');
  }
  return {seat,energyCount,temple,energyUnits,attackAccepted:legal,
    damage:opponent.active.damage-before,competitiveQualified:false};
}

/** @returns {object} */
function run(){
  const rows=[];
  for(const seat of [0,1])for(const temple of [false,true])
    for(const energyCount of [1,2]){
      const result=trial(seat,energyCount,temple);
      rows.push(result);
      console.log('AGENT48_MEW_TEMPLE_NATIVE',JSON.stringify(result));
    }
  assert.equal(rows.length,8);
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    status:'constructed exact-source payment only',rows,
    competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
