'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(base,relative));

/**
 * Prepared native Store, using original Aichi rank-5 printings for the Mew
 * line. This is a constructed board, not a 60-card source-dealt match.
 * @param {0|1} attackingSeat
 * @param {0|1} recipientIndex Benched Genesect V or Mew V.
 * @param {boolean} energyAvailable Whether a second DCE remains in deck.
 * @returns {object}
 */
function trial(attackingSeat,recipientIndex,energyAvailable){
  assert.ok(attackingSeat===0||attackingSeat===1);
  assert.ok(recipientIndex===0||recipientIndex===1);
  assert.equal(typeof energyAvailable,'boolean');
  const catalog=initializeCards();
  let nextId=10000;
  const printed=name=>{
    const result=catalog.getCardByName(name);
    assert.ok(result,'Pinned printing absent: '+name);
    result.id=++nextId;
    return result;
  };
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Store}=native('game/store/store');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const source=new Player(),defender=new Player();
  source.id=101;source.name='Aichi original rank5 Mew source (prepared)';
  defender.id=202;defender.name='Aichi original rank3 Mimikyu (prepared)';
  source.active.cards.push(printed('Mew V FST'),printed('Mew VMAX FST'));
  source.active.pokemonPlayedTurn=1;
  const paidDce=printed('Double Colorless Energy SUM');
  source.active.cards.push(paidDce);
  source.active.energies.cards.push(paidDce);
  const genesect=new PokemonCardList();
  genesect.cards.push(printed('Genesect V FST'));
  source.bench.push(genesect);
  const donor=new PokemonCardList();
  donor.cards.push(printed('Mew V FST'));
  source.bench.push(donor);
  const blocked=new PokemonCardList();
  blocked.cards.push(printed('Crobat V DAA'));
  source.bench.push(blocked);
  defender.active.cards.push(printed('Mimikyu PAL'));
  const sourceDeckDce=printed('Double Colorless Energy SUM');
  if(energyAvailable)source.deck.cards.push(sourceDeckDce);
  for(const cardName of ['Quick Ball FST','Ultra Ball MEG',
    'Battle VIP Pass FST','Special Charge STS'])
    source.deck.cards.push(printed(cardName));
  for(const player of [source,defender]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(printed('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    if(player===defender)
      for(let i=0;i<8;i++)player.deck.cards.push(printed('Psychic Energy SVE'));
  }
  const state=new State();
  state.players=attackingSeat===0?[source,defender]:[defender,source];
  state.activePlayer=attackingSeat;state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();
  state.gameSettings=settings;state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const prizesBefore=source.prizes.filter(p=>p.cards.length).length;
  store.dispatch(new AttackAction(source.id,'Cross Fusion Strike'));
  const trace=[];
  let sawCopy=false,sawEnergy=false,sawNonFusionBlock=false;
  for(let n=0;n<40;n++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let selection;
    if(kind==='ChooseAttackPrompt'){
      const benchMew=prompt.cards.find(c=>c.fullName==='Mew V FST');
      assert.ok(benchMew,'Physical benched Mew must be offered');
      selection=benchMew.attacks.find(a=>a.name==='Energy Mix');
      assert.ok(selection);
      assert.equal(prompt.validate(selection),true);
      sawCopy=true;
    }else if(kind==='AttachEnergyPrompt'){
      assert.equal(prompt.playerId,source.id);
      assert.equal(prompt.options.min,0);
      assert.equal(prompt.options.max,1);
      const card=prompt.cardList.cards.find(c=>c.id===sourceDeckDce.id);
      assert.equal(Boolean(card),energyAvailable);
      if(energyAvailable){
        const unallowed=[{card,to:{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:2}}];
        sawNonFusionBlock=prompt.validate(unallowed)===false;
        assert.equal(sawNonFusionBlock,true,
          'Native prompt must reject non-Fusion Crobat recipient');
        selection=[{card,to:{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
          index:recipientIndex}}];
      }else selection=[];
      assert.equal(prompt.validate(selection),true);
      sawEnergy=true;
    }else if(kind==='WaitPrompt'){
      selection=null;
    }else if(kind==='ChoosePrizePrompt'){
      const owner=store.state.players.find(p=>
        p.id===prompt.getPerspectivePlayerId());
      selection=owner.prizes.filter(p=>p.cards.length).slice(
        0,prompt.options.count);
    }else throw Error('Unhandled genuine pinned native prompt: '+kind);
    store.dispatch(new ResolvePromptAction(prompt.id,selection));
    trace.push({kind,accepted:true});
  }
  assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,0);
  assert.equal(sawCopy,true);
  assert.equal(sawEnergy,true);
  assert.equal(source.active.energies.cards.some(c=>c.id===paidDce.id),true);
  assert.equal(source.prizes.filter(p=>p.cards.length).length,prizesBefore);
  assert.equal(defender.active.damage,0);
  const chosen=source.bench[recipientIndex];
  const dceOnRecipient=chosen.energies.cards.some(c=>c.id===sourceDeckDce.id);
  assert.equal(dceOnRecipient,energyAvailable);
  assert.equal(source.deck.cards.some(c=>c.id===sourceDeckDce.id),!energyAvailable);
  assert.equal(source.discard.cards.some(c=>c.id===sourceDeckDce.id),false);
  for(const [index,board] of source.bench.entries())
    if(index!==recipientIndex)
      assert.equal(board.energies.cards.some(c=>c.id===sourceDeckDce.id),false);
  return {attackingSeat,recipientIndex,energyAvailable,
    copyChosen:'Mew V FST / Energy Mix',
    attachedExactDeckDceToRecipient:dceOnRecipient,
    originalAttackingDceRetained:true,
    nonFusionRecipientRejected:sawNonFusionBlock,
    prizesTaken:0,trace,preparedBoard:true,sourceDealt:false,
    paperQualified:false,competitiveQualifiedGames:0};
}

function run(){
  const arms=[];
  for(const seat of [0,1])
    for(const index of [0,1])
      for(const available of [false,true])
        arms.push(trial(seat,index,available));
  return {schema:'agent19-mew-vmax-copy-energy-mix-custody-native-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    physicalSourceDecksUnchanged:false,
    competitiveQualifiedGames:0,arms};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trial,run};
