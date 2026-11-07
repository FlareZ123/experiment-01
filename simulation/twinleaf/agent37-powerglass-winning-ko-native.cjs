'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(output,p));

/**
 * Actual pinned Store KO prompt order under either terminal-condition shape.
 * @param {{lastPrize?:boolean,opponentHasBench?:boolean,settleAll?:boolean,targetDamage?:number,actorSeat?:number,actionKind?:string,targetPrinting?:string,toolPrinting?:string,withStoreHook?:(store:any,execute:()=>object)=>{result:object,audit:object}}} [options]
 */
function inspectPowerglassWinningKo({lastPrize=false,opponentHasBench=true,settleAll=false,targetDamage=60,actorSeat=0,actionKind='attack',targetPrinting='Trubbish FST',toolPrinting='Powerglass SFA',withStoreHook}={}){
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
  const {AttackAction,PassTurnAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state,owner=new Player(),enemy=new Player();
  owner.id=101;owner.name='Powerglass KO actor';
  enemy.id=202;enemy.name='original damaged Trubbish';
  assert.ok(actorSeat===0||actorSeat===1,'Physical actor seat must be 0 or 1');
  state.players=actorSeat===0?[owner,enemy]:[enemy,owner];
  state.activePlayer=actorSeat;state.turn=16;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Unown AOR'));
  owner.active.energies.cards.push(card('Psychic Energy MEE'));
  assert.ok(toolPrinting==='Powerglass SFA'||
    toolPrinting==='Technical Machine: Devolution PAR');
  owner.hand.cards.push(card(toolPrinting));
  owner.discard.cards.push(card('Psychic Energy MEE'));
  assert.ok((targetPrinting==='Trubbish FST'&&targetDamage>=0&&targetDamage<=60)||
    (targetPrinting==='Trevenant & Dusknoir-GX SMP'&&targetDamage===260));
  enemy.active.cards.push(card(targetPrinting));
  assert.ok(Number.isInteger(targetDamage));
  enemy.active.damage=targetDamage;
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
  const initialOccupiedBench=enemy.bench.filter(s=>s.getPokemonCard()).length;
  assert.equal(initialOccupiedBench,opponentHasBench?1:0,
    'Fixture must contain intended physical opponent Bench occupancy');
  const runNativeTransaction=()=>{
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.active.tools[0].fullName,toolPrinting);
  assert.ok(actionKind==='attack'||actionKind==='pass');
  if(actionKind==='attack')store.dispatch(new AttackAction(owner.id,'Hidden Power'));
  else store.dispatch(new PassTurnAction(owner.id));
  const prompts=[];
  let choice=null;
  let firstChoiceSnapshot=null;
  for(let n=0;n<32;n++){
    const p=state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    prompts.push(p.constructor.name);
    if(p.constructor.name!=='WaitPrompt'&&choice===null){
      choice=p.constructor.name;
      firstChoiceSnapshot={
        sourceActive:enemy.active.getPokemonCard()?.fullName??null,
        sourceOccupiedBench:enemy.bench.filter(s=>s.getPokemonCard()).length,
        ownerPrizesRemaining:owner.prizes.filter(x=>x.cards.length>0).length,
        statePhase:state.phase
      };
    }
    if(!settleAll&&p.constructor.name!=='WaitPrompt')break;
    let answer=null;
    if(p.constructor.name==='AttachEnergyPrompt'){
      assert.strictEqual(p.cardList,owner.discard);
      const donor=owner.discard.cards.find(x=>x.fullName==='Psychic Energy MEE');
      assert.ok(donor,'Expected one physical Basic Psychic in owner discard');
      answer=[{card:donor,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }}];
      assert.equal(p.validate(answer),true);
    }else if(p.constructor.name==='ChoosePrizePrompt'){
      assert.equal(p.playerId,owner.id);
      const remaining=owner.prizes.filter(x=>x.cards.length>0);
      answer=remaining.slice(0,p.options.count);
      assert.equal(answer.length,p.options.count,'Must choose exact physical Prize count');
      assert.equal(p.validate(answer,state),true);
    }else if(p.constructor.name==='ChoosePokemonPrompt'){
      assert.equal(p.playerId,enemy.id);
      const promote=enemy.bench.find(x=>x.getPokemonCard());
      assert.ok(promote,'Expected available source Bench promotion');
      answer=[promote];
      assert.equal(p.validate(answer,state),true);
    }else{
      assert.equal(p.constructor.name,'WaitPrompt',
        'Unexpected pending choice outside the bounded physical KO');
    }
    store.dispatch(new ResolvePromptAction(p.id,answer));
  }
  // A final-KO engine may terminate immediately without a selectable prompt.
  // Preserve that outcome as evidence instead of treating it as a probe error.
  const sourceActive=enemy.active.getPokemonCard();
  const occupiedBench=enemy.bench.filter(slot=>slot.getPokemonCard()).length;
  if(!settleAll)
    assert.equal(occupiedBench,opponentHasBench?1:0,
      'Before promotion, occupied source Bench count must match fixture');
  return {
    schema:'agent37-powerglass-winning-ko-preendturn-v1',
    lastPrize,opponentHasBench,targetDamage,actorSeat,actionKind,targetPrinting,toolPrinting,
    printedScenario:(actionKind==='attack'?'Unown AOR Hidden Power10':'Unown AOR pass')+
      ' vs '+targetPrinting+' with'+targetDamage+' damage',
    seenPrompts:prompts,firstChoicePrompt:choice,
    sourceActiveAfterAttack:sourceActive?.fullName??null,
    sourceBenchCount:enemy.bench.filter(slot=>slot.getPokemonCard()).length,
    ownerPrizesRemaining:owner.prizes.length,
    ownerPrizesBeforeAttack:lastPrize?1:6,
    gamePhaseAfterFirstSelectablePrompt:state.phase,
    opponentRemainingBench:enemy.bench.filter(slot=>slot.getPokemonCard()).length,
    firstChoiceBeforeUnclaimedWinningPrize:
      lastPrize&&choice==='AttachEnergyPrompt'&&
      owner.prizes.length===1&&!sourceActive,
    sourcePrizesRemaining:enemy.prizes.length,
    PowerglassBeforePrize:choice==='AttachEnergyPrompt'&&!sourceActive&&
      owner.prizes.length===(lastPrize?1:6),
    settleAll,firstChoiceSnapshot,
    finalState:{
      phase:state.phase,finished:state.phase===GamePhase.FINISHED,
      winner:state.winner,
      ownerPrizesRemaining:owner.prizes.filter(x=>x.cards.length>0).length,
      sourcePrizesRemaining:enemy.prizes.filter(x=>x.cards.length>0).length,
      sourceActive:enemy.active.getPokemonCard()?.fullName??null,
      ownerActive:owner.active.getPokemonCard()?.fullName??null,
      ownerActiveEnergy:owner.active.energies.cards.map(x=>x.fullName),
      ownerActiveTools:owner.active.tools.map(x=>x.fullName),
      ownerDiscard:owner.discard.cards.map(x=>x.fullName),
      openPrompts:state.prompts.filter(x=>x.result===undefined)
        .map(x=>x.constructor.name)
    },
    paperRulesToCheck:'Advanced Player Rulebook A-01/D versus E-21',
    paperOrderingQualified:false,competitiveGamesQualified:0
  };
  };
  if(!withStoreHook)return runNativeTransaction();
  const wrapped=withStoreHook(store,runNativeTransaction);
  return {...wrapped.result,scopedHookAudit:wrapped.audit};
}
if(require.main===module)
  process.stdout.write(JSON.stringify({
    lastPrize:inspectPowerglassWinningKo({lastPrize:true,opponentHasBench:true}),
    lastPokemon:inspectPowerglassWinningKo({lastPrize:false,opponentHasBench:false})
  },null,2)+'\n');
module.exports={inspectPowerglassWinningKo};
