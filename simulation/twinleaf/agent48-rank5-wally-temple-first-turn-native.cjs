'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const native=p=>require(path.join(output,p));

/**
 * Actual native first-going-second turn sequence with source-printed cards.
 * The starting source hand, Prize piles, deck and opponent board are staged.
 * @param {0|1} seat
 * @param {'sky'|'path'|'none'|'absent'} answer
 */
function trial(seat,answer){
  assert.ok([0,1].includes(seat));
  assert.ok(['sky','path','none','absent'].includes(answer));
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {CardType,Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {StateUtils}=native('game/store/state-utils');
  const {CheckProvidedEnergyEffect}=native('game/store/effects/check-effects');
  const cards=initializeCards();
  let serial=481000+seat*1000+['sky','path','none','absent'].indexOf(answer)*100;
  const card=fullName=>{
    const c=cards.getCardByName(fullName);
    assert.ok(c,'Native rank5 source printing missing '+fullName);
    c.id=serial++;
    return c;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const source=new Player(),opponent=new Player();
  source.id=4811;opponent.id=4812;
  source.name='Rank5 Mew owner on first own turn';
  opponent.name='Constructed Temple candidate target';
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2; // Source's first turn going second.
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const slot=new CardList();slot.cards.push(card('Psychic Energy MEE'));
      return slot;
    });
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }
  source.active.cards.push(card('Mew V FST'));
  source.active.pokemonPlayedTurn=0;
  // Native Board target indices require an explicit open Bench slot in this staged State.
  source.bench.push(new PokemonCardList());
  opponent.active.cards.push(card('Trevenant & Dusknoir-GX SMP'));
  const vmax=card('Mew VMAX FST');
  source.deck.cards.push(vmax);
  const dce=card('Double Colorless Energy SUM');
  source.hand.cards.push(card('Genesect V FST'));
  source.hand.cards.push(card('Wally ROS'));
  source.hand.cards.push(dce);
  const response=answer==='sky'?'Sky Field ROS':
    answer==='path'?'Path to the Peak CRE':null;
  if(response)source.hand.cards.push(card(response));
  const temple=answer!=='absent';
  if(temple)opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  const printedCost=()=>{
    const e=new CheckProvidedEnergyEffect(source);
    store.reduceEffect(state,e);
    return e.energyMap.find(x=>x.card===dce)?.provides??[];
  };
  const play=(fullName,target)=>{
    const at=source.hand.cards.findIndex(c=>c.fullName===fullName);
    assert.ok(at>=0,'Staged hand has required '+fullName);
    console.log('AGENT48_WALLY_NATIVE_DISPATCH',JSON.stringify({seat,answer,turn:state.turn,card:fullName,activePlayer:state.activePlayer,sourceBench:source.bench.length,pending:state.prompts.filter(x=>x.result===undefined).map(x=>x.constructor.name)}));
    store.dispatch(new PlayCardAction(source.id,at,target));
  };
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  play('Genesect V FST',board);
  assert.equal(source.bench.some(x=>x.getPokemonCard()?.fullName==='Genesect V FST'),true);
  play('Wally ROS',board);
  let wallySearch=false,wallyTarget=false;
  const trace=[];
  for(let i=0;i<30;i++){
    const p=state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    let selected;
    if(p.constructor.name==='ChooseCardsPrompt'){
      selected=[vmax];wallySearch=true;
    }else if(p.constructor.name==='ChoosePokemonPrompt'){
      selected=[source.active];wallyTarget=true;
    }else if(p.constructor.name==='ShuffleDeckPrompt'){
      selected=source.deck.cards.map((_,index)=>index);
    }else if(p.constructor.name==='ShowCardsPrompt'){
      selected=true;
    }else if(p.constructor.name==='WaitPrompt'){
      selected=null;
    }else{
      assert.fail('Unexpected Wally native prompt '+p.constructor.name);
    }
    if(typeof p.validate==='function')
      assert.equal(p.validate(selected,state),true,p.constructor.name+' validates Wally response');
    trace.push(p.constructor.name);
    console.log('AGENT48_WALLY_PROMPT',JSON.stringify({seat,answer,type:p.constructor.name,selected:Array.isArray(selected)?selected.map(x=>x.fullName??x.getPokemonCard?.()?.fullName??x):selected}));
    store.dispatch(new ResolvePromptAction(p.id,selected));
  }
  assert.equal(wallySearch,true);
  assert.equal(wallyTarget,true);
  assert.equal(source.active.getPokemonCard()?.fullName,'Mew VMAX FST');
  assert.equal(state.turn,2,'Wally evolved on the source first own turn');
  play('Double Colorless Energy SUM',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  });
  assert.equal(source.active.energies.cards.includes(dce),true);
  assert.deepEqual(printedCost(),temple?[CardType.COLORLESS]:
    [CardType.COLORLESS,CardType.COLORLESS]);
  if(response){
    assert.equal(StateUtils.getStadiumCard(state)?.fullName,'Temple of Sinnoh ASR');
    play(response,board);
    assert.equal(StateUtils.getStadiumCard(state)?.fullName,response);
    assert.deepEqual(printedCost(),[CardType.COLORLESS,CardType.COLORLESS]);
  }
  const pays=!temple||Boolean(response);
  if(!pays){
    assert.throws(()=>store.dispatch(new AttackAction(source.id,'Cross Fusion Strike')),
      'One DCE still cannot pay under remaining Temple');
    assert.equal(opponent.active.damage,0);
  }else{
    console.log('AGENT48_WALLY_ATTACK',JSON.stringify({seat,answer,energy:printedCost()}));
    store.dispatch(new AttackAction(source.id,'Cross Fusion Strike'));
    let copied=false;
    for(let i=0;i<30;i++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      if(p.constructor.name==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(p.id,null));
      }else if(p.constructor.name==='ChooseAttackPrompt'){
        const donor=p.cards.find(c=>c.fullName==='Genesect V FST');
        assert.ok(donor);
        const attack=donor.attacks.find(a=>a.name==='Techno Blast');
        assert.ok(attack);assert.equal(p.validate(attack),true);
        store.dispatch(new ResolvePromptAction(p.id,attack));
        copied=true;
        trace.push('ChooseAttackPrompt:Techno Blast');
      }else assert.fail('Unexpected first-turn attack prompt '+p.constructor.name);
    }
    assert.equal(copied,true);
    assert.equal(opponent.active.damage,210);
  }
  return {seat,sourceTurn:2,sourceGoingSecondFirstTurn:true,
    ownerStartedMewV:true,wallySearchedVmax:wallySearch,
    wallyEvolvedMewVmax:wallyTarget,sourceBenchGenesect:true,
    originalAnswer:response,initialTemple:temple,paidAttack:pays,
    nativeDamage:opponent.active.damage,promptTypes:trace,
    stagedHandAndDeck:true,competitiveQualified:false};
}
function run(){
  const cases=[];
  for(const seat of [0,1])for(const answer of ['absent','none','sky','path']){
    const row=trial(seat,answer);
    cases.push(row);
    console.log('AGENT48_RANK5_WALLY_T1_NATIVE',JSON.stringify(row));
  }
  assert.equal(cases.length,8);
  return {enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Exact original rank5 printed pieces, staged first source turn',
    cases,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
