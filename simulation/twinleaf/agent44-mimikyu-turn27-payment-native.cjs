'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {chooseSetupAction,createTactic}=require('./mimikyu-source-turn27-setup.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/**
 * Stage an intentionally constructed, owner-visible response state. The
 * opponent's last Apex declaration is injected; its prior turn was not played.
 * Both physical seats are exercised against the real pinned Store reducer.
 * @param {0|1} seat
 * @returns {object}
 */
function runSeat(seat){
  const x=stage(seat);
  const manager=initializeCards();
  let id=900000+seat*100;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'missing pinned print '+printing);
    c.id=id++;
    return c;
  };
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {RetreatAction}=native('game/store/actions/game-actions');
  const latias=card('Latias ex SSP');
  const mimikyu=card('Mimikyu GRI');
  const regidrago=card('Regidrago VSTAR SIT');
  const inheritedPsychic=x.owner.active.energies.cards[0];
  assert.equal(inheritedPsychic.name,'Psychic Energy');
  const newPsychic=card('Psychic Energy SVE');

  // Keep the original physical Energy object, changing only its initial slot.
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.length=0;
  x.owner.active.cards.push(latias);
  x.owner.bench[1].cards.length=0;
  x.owner.bench[1].energies.cards.length=0;
  x.owner.bench[1].cards.push(mimikyu,inheritedPsychic);
  x.owner.bench[1].energies.cards.push(inheritedPsychic);
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(newPsychic);
  x.owner.discard.cards.push(card('Dialga-GX UPR'));
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(regidrago);

  x.state.turn=27;
  x.owner.energyPlayedTurn=26;
  x.owner.retreatedTurn=26;
  x.owner.usedGX=false;
  const apex=regidrago.attacks.find(a=>a.name==='Apex Dragon');
  assert.ok(apex);
  x.state.playerLastAttack={
    [x.opponent.id]:{sourceCard:regidrago,attack:apex}
  };

  const Tactic=createTactic();
  const tactic=new Tactic({});
  const before=chooseSetupAction(x.state,x.owner);
  assert.deepEqual(before,{kind:'attach-psychic',handIndex:0,benchIndex:1});
  const attach=tactic.useTactic(x.state,x.owner);
  assert.ok(attach instanceof PlayCardAction);
  assert.equal(attach.id,x.owner.id);
  assert.deepEqual(attach.target,{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:1});
  x.store.dispatch(attach);
  assert.equal(x.owner.hand.cards.includes(newPsychic),false);
  assert.equal(x.owner.bench[1].energies.cards.includes(newPsychic),true);
  assert.equal(x.owner.bench[1].energies.cards.includes(inheritedPsychic),true);
  assert.equal(x.opponent.active.energies.cards.includes(newPsychic),false);
  assert.equal(x.owner.energyPlayedTurn,27);

  const next=chooseSetupAction(x.state,x.owner);
  assert.deepEqual(next,{kind:'promote-mimikyu',benchIndex:1});
  const retreat=tactic.useTactic(x.state,x.owner);
  assert.ok(retreat instanceof RetreatAction);
  assert.equal(retreat.clientId,x.owner.id);
  assert.equal(retreat.benchIndex,1);
  const discards=x.owner.discard.cards.length;
  x.store.dispatch(retreat);
  assert.strictEqual(x.owner.active.getPokemonCard(),mimikyu);
  assert.equal(x.owner.active.energies.cards.includes(newPsychic),true);
  assert.equal(x.owner.active.energies.cards.includes(inheritedPsychic),true);
  assert.strictEqual(x.owner.bench[1].getPokemonCard(),latias);
  assert.equal(x.owner.discard.cards.length,discards,
    'Skyliner Basic retreat should not spend Psychic Energy');

  return {seat,actorId:x.owner.id,sourceId:x.opponent.id,
    nativeAcceptedAttachment:true,nativeAcceptedRetreat:true,
    attachedOriginalEnergyId:inheritedPsychic.id,
    newlyAttachedEnergyId:newPsychic.id,
    copycatBasicPsychicCards:x.owner.active.energies.cards
      .map(c=>c.fullName),
    actorOwnedBenchTarget:
      attach.target.player===PlayerType.BOTTOM_PLAYER&&
      attach.target.slot===SlotType.BENCH,
    originalTurnWasInjected:true,completePaperGame:false};
}

function run(){
  const rows=[runSeat(0),runSeat(1)];
  const report={schema:'agent44-turn27-copycat-payment-native-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceSpecificConstructedBoard:true,
    firstApexDeclarationInjected:true,qualifiedCompetitiveGames:0,
    rows};
  console.log('AGENT44_TURN27_COPYCAT_PAYMENT '+JSON.stringify(report));
  return report;
}
if(require.main===module)run();
module.exports={runSeat,run};
