'use strict';

// Original Aichi rank3/rank7 PAL Safeguard against two rank1 attacks,
// with authentic Store AttackAction on an explicitly constructed board.
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const ENGINE_SHA='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));

/**
 * @param {0|1} seat Actual attack-owning physical seat.
 * @param {'Tapu Lele-GX GRI'|'Shadow Rider Calyrex VMAX CRE'} attackerPrinting
 * @param {'Mimikyu PAL'|'Mimikyu GRI'} defenderPrinting
 * @returns {object} Genuine Store damage and KO/Prize receipts.
 */
function runArm(seat,attackerPrinting,defenderPrinting){
  const manager=initializeCards();
  let nextId=0;
  const make=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned executable: '+printing);
    c.id=++nextId;
    return c;
  };
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {Store}=load('game/store/store');
  const {GameSettings}=load('game/core/game-settings');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const attacker=new Player();
  attacker.id=101;
  attacker.name='reference physical attacker';
  const physicalAttacker=make(attackerPrinting);
  attacker.active.cards.push(physicalAttacker);
  for(let i=0;i<4;i++){
    const energy=make('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  const defender=new Player();
  defender.id=202;
  defender.name='original printed Mimikyu source wall';
  const physicalDefender=make(defenderPrinting);
  defender.active.cards.push(physicalDefender);
  const fallback=new PokemonCardList();
  fallback.cards.push(make('Snorlax PGO'));
  defender.bench.push(fallback);
  for(const p of [attacker,defender]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
    for(let i=0;i<6;i++)p.deck.cards.push(make('Psychic Energy SVE'));
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

  const attack=attackerPrinting==='Tapu Lele-GX GRI'?
    'Energy Drive':'Max Geist';
  const before=attacker.prizes.filter(p=>p.cards.length>0).length;
  store.dispatch(new AttackAction(attacker.id,attack));
  const promptTypes=[];
  for(let i=0;i<16;i++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let value;
    if(kind==='WaitPrompt')value=null;
    else if(kind==='ChoosePrizePrompt'){
      const owner=store.state.players.find(p=>p.id===prompt.getPerspectivePlayerId());
      assert.equal(owner,attacker);
      value=owner.prizes.filter(p=>p.cards.length>0).slice(0,prompt.options.count);
    }else if(kind==='ChoosePokemonPrompt'){
      const owner=store.state.players.find(p=>p.id===prompt.getPerspectivePlayerId());
      assert.equal(owner,defender);
      value=[fallback];
    }else{
      assert.fail('Unrecognized native prompt '+kind);
    }
    store.dispatch(new ResolvePromptAction(prompt.id,value));
    promptTypes.push(kind);
  }
  assert.deepEqual(store.state.prompts.filter(p=>p.result===undefined),[]);
  const prizeGain=before-attacker.prizes.filter(p=>p.cards.length>0).length;
  const predicted=(defenderPrinting==='Mimikyu PAL' &&
    attackerPrinting==='Shadow Rider Calyrex VMAX CRE')?0:1;
  assert.equal(prizeGain,predicted,
    'Native paper Safeguard should distinguish VMAX from GX attacking species');
  assert.equal(defender.discard.cards.includes(physicalDefender),predicted===1,
    'Physical defender should be discarded exactly on the 70 HP knockout');
  return {sourceRankPrintings: defenderPrinting==='Mimikyu PAL'?[3,7]:[1,30],
    seat,attackerPrinting,defenderPrinting,attackerAttack:attack,
    expectedSourceMimikyuPrizeLoss:predicted,prizeGain,
    defenderInDiscard:defender.discard.cards.includes(physicalDefender),
    resolvedPromptTypes:promptTypes};
}

function run(){
  const arms=[];
  for(const seat of [0,1]){
    for(const defenderPrinting of ['Mimikyu PAL','Mimikyu GRI']){
      for(const attackerPrinting of [
        'Shadow Rider Calyrex VMAX CRE','Tapu Lele-GX GRI']){
        arms.push(runArm(seat,attackerPrinting,defenderPrinting));
      }
    }
  }
  assert.equal(arms.length,8);
  return {schema:'agent21-source-print-safeguard-v-gx-actual-store-v1',
    enginePin:ENGINE_SHA,stagedFourPsychicEnergy:true,actualStoreAttack:true,
    realSourceMimikyuPrintings:['Mimikyu PAL','Mimikyu GRI'],
    actualSourceFull60Games:0,competitiveQualifiedGames:0,arms};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runArm};
