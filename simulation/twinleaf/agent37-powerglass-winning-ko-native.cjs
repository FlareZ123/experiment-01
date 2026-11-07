'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(output,p));

/**
 * Actual pinned Store KO prompt order under either terminal-condition shape.
 * @param {{lastPrize?:boolean,opponentHasBench?:boolean}} [options]
 */
function inspectPowerglassWinningKo({lastPrize=false,opponentHasBench=true}={}){
  const cards=initializeCards();
  let id=8100;
  const card=printing=>{
    const c=cards.getCardByName(printing);
    assert.ok(c,'missing printing '+printing);
    c.id=id++;return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state,owner=new Player(),enemy=new Player();
  owner.id=101;owner.name='Powerglass KO actor';
  enemy.id=202;enemy.name='original damaged Trubbish';
  state.players=[owner,enemy];
  state.activePlayer=0;state.turn=16;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Unown AOR'));
  owner.active.energies.cards.push(card('Psychic Energy MEE'));
  owner.hand.cards.push(card('Powerglass SFA'));
  owner.discard.cards.push(card('Psychic Energy MEE'));
  enemy.active.cards.push(card('Trubbish FST'));
  enemy.active.damage=60;
  if(opponentHasBench){
    const bench=new PokemonCardList();
    bench.cards.push(card('Tapu Lele-GX GRI'));
    enemy.bench.push(bench);
  }
  for(const p of [owner,enemy]){
    for(let k=0;k<8;k++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let k=0;k<(p===owner&&lastPrize?1:6);k++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.active.tools[0].fullName,'Powerglass SFA');
  store.dispatch(new AttackAction(owner.id,'Hidden Power'));
  const prompts=[];
  let choice=null;
  for(let n=0;n<16;n++){
    const p=state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    prompts.push(p.constructor.name);
    if(p.constructor.name!=='WaitPrompt'){choice=p.constructor.name;break;}
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.ok(choice,'attack yielded no selectable prompt');
  const sourceActive=enemy.active.getPokemonCard();
  return {
    schema:'agent37-powerglass-winning-ko-preendturn-v1',
    lastPrize,opponentHasBench,
    printedScenario:'Unown AOR Hidden Power10 to Trubbish FST with60/70 damage',
    seenPrompts:prompts,firstChoicePrompt:choice,
    sourceActiveAfterAttack:sourceActive?.fullName??null,
    sourceBenchCount:enemy.bench.length,
    ownerPrizesRemaining:owner.prizes.length,
    ownerPrizesBeforeAttack:lastPrize?1:6,
    gamePhaseAfterFirstSelectablePrompt:state.phase,
    opponentRemainingBench:enemy.bench.length,
    firstChoiceBeforeUnclaimedWinningPrize:
      lastPrize&&choice==='AttachEnergyPrompt'&&
      owner.prizes.length===1&&!sourceActive,
    sourcePrizesRemaining:enemy.prizes.length,
    PowerglassBeforePrize:choice==='AttachEnergyPrompt'&&!sourceActive&&
      owner.prizes.length===(lastPrize?1:6),
    paperRulesToCheck:'Advanced Player Rulebook A-01/D versus E-21',
    paperOrderingQualified:false,competitiveGamesQualified:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify({
    lastPrize:inspectPowerglassWinningKo({lastPrize:true,opponentHasBench:true}),
    lastPokemon:inspectPowerglassWinningKo({lastPrize:false,opponentHasBench:false})
  },null,2)+'\n');
module.exports={inspectPowerglassWinningKo};
