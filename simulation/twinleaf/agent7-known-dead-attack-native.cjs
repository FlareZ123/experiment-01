'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load=file=>require(path.join(output,file));

/**
 * Construct a deliberately injected, source-printed turn-three Store with a
 * funded Mega Absol ex and a vulnerable Shadow Rider Calyrex V. This test
 * isolates root attack selection plus actual engine attack settlement. It
 * makes no assertion about this board arising from a tournament opening.
 * @param {number} defenderDamage Public damage, in HP.
 * @returns {object}
 */
function fixture(defenderDamage){
  const manager=initializeCards();
  let nextId=0;
  /** @param {string} printing */
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Unavailable pinned printing '+printing);
    found.id=++nextId;
    return found;
  };
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GameSettings}=load('game/core/game-settings');
  const {Store}=load('game/store/store');

  const attacker=new Player();
  attacker.id=101;
  attacker.name='Mega Absol actor-policy source';
  attacker.active.cards.push(card('Mega Absol ex M1L'));
  for(let k=0;k<3;k++){
    const e=card('Darkness Energy SVE');
    attacker.active.cards.push(e);
    attacker.active.energies.cards.push(e);
  }

  const defender=new Player();
  defender.id=202;
  defender.name='Shadow Rider fixed public victim';
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  defender.active.damage=defenderDamage;
  const replacement=new PokemonCardList();
  replacement.cards.push(card('Tapu Lele-GX GRI'));
  defender.bench.push(replacement);

  for(const player of [attacker,defender]){
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Darkness Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const state=new State();
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.players=[attacker,defender];
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;

  const nativeTypes={
    PokemonCard:load('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:load('game/store/card/energy-card').EnergyCard,
    ...load('game/store/card/card-types'),
    PowerType:load('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),nativeTypes);
  const publicDigest=createHash('sha256').update(JSON.stringify({
    turn:state.turn,phase:state.phase,activePlayer:state.activePlayer,
    beforeDamage:defender.active.damage,
    attacker:attacker.active.cards.map(c=>c.fullName),
    victim:defender.active.cards.map(c=>c.fullName),
    bench:defender.bench.map(x=>x.cards.map(c=>c.fullName)),
    prizeCounts:state.players.map(p=>p.prizes.length),
    hands:state.players.map(p=>p.hand.cards.map(c=>c.fullName))
  })).digest('hex');

  return {store,state,attacker,defender,catalog,publicDigest};
}

/**
 * Choose using the same pure actor root called by the integrated shared bot,
 * then dispatch the native AttackAction against the genuine pinned Store.
 * @param {{damage:number,flag:boolean}} treatment
 */
function arm({damage,flag}){
  const x=fixture(damage);
  const view=actorObservation(x.state,0);
  const intent=chooseActorRootIntent(view,x.catalog,{
    knownDeadAttackRoot:flag
  });
  assert.equal(intent.kind,'attack');
  const {AttackAction}=load('game/store/actions/game-actions');
  const before={damage:x.defender.active.damage,
    ownerPrizes:x.attacker.prizes.length};
  x.store.dispatch(new AttackAction(x.attacker.id,intent.attackName));
  const pending=x.state.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  const after={damage:x.defender.active.damage,
    ownerPrizes:x.attacker.prizes.length,
    pending,phase:x.state.phase};
  return {
    actorVisibleOnly:true,knownDeadAttackRoot:flag,
    victimDamageBefore:damage,publicInitialBoardSha256:x.publicDigest,
    selectedAttack:intent.attackName,nativeDispatchAccepted:true,
    before,after,prizesTaken:before.ownerPrizes-after.ownerPrizes
  };
}

function run(){
  const arms=[
    arm({damage:0,flag:false}),
    arm({damage:0,flag:true}),
    arm({damage:60,flag:false}),
    arm({damage:60,flag:true})
  ];
  assert.equal(arms[0].publicInitialBoardSha256,
    arms[1].publicInitialBoardSha256);
  assert.equal(arms[2].publicInitialBoardSha256,
    arms[3].publicInitialBoardSha256);
  assert.deepEqual(arms.map(x=>x.selectedAttack),[
    'Terminal Period','Claw of Darkness',
    'Terminal Period','Terminal Period'
  ]);
  console.error('AGENT7_NATIVE_ARM_DIAGNOSTIC '+JSON.stringify(arms));
  assert.deepEqual(arms.map(x=>x.prizesTaken),[0,2,2,2]);
  assert.ok(arms.every(x=>x.after.pending.length===0));
  return {
    schema:'agent7-known-dead-attack-actual-store-paired-v1',
    enginePin:PIN,sourcePrinting:'Mega Absol ex M1L',
    opponentPrinting:'Shadow Rider Calyrex V CRE',
    controlledInjectedMidgame:true,actualAichiSourceDeal:false,
    sharedBotRootPureDecision:true,actualStoreAttackDispatch:true,
    pairedInitialPublicBoardParity:true,arms,
    qualifiedCompetitiveGames:0,
    note:'Mechanically verified Store-only attack choice and Prize settlement. No ordinary setup, hidden-information complete-game guarantee, source policy, or win rate.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={fixture,arm,run};
