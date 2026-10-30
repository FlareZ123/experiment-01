'use strict';

const assert=require('node:assert/strict');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const STADIUM='Wondrous Labyrinth Prism Star TEU';
const ATTACK='Volt Cyclone';

/**
 * Build identical genuine pinned Store boards with optional public Wondrous
 * tax and an exactly three-unit non-Fairy attack cost. This does not simulate
 * natural source setup or real opponent decision-making.
 * @param {0|1} seat
 * @param {boolean} wondrous
 * @returns {object}
 */
function stageOne(seat,wondrous){
  const x=stage(seat),manager=initializeCards();
  let cardId=90000;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing genuine native printing: '+printing);
    c.id=cardId++;
    return c;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card('Iron Thorns ex TWM'));
  for(let i=0;i<3;i++){
    const energy=card('Lightning Energy SVE');
    x.owner.active.cards.push(energy);
    x.owner.active.energies.cards.push(energy);
  }
  x.owner.hand.cards.length=0;
  x.owner.stadium.cards.length=0;
  x.opponent.stadium.cards.length=0;
  if(wondrous)x.owner.stadium.cards.push(card(STADIUM));
  x.state.turn=3;
  return x;
}

/** @param {0|1} seat */
function runSeat(seat){
  const nominal=stageOne(seat,false),taxed=stageOne(seat,true);
  const before=actorObservation(nominal.state,seat);
  const after=actorObservation(taxed.state,seat);
  const baseline=chooseActorRootIntent(before,nominal.catalog);
  const taxedRoot=chooseActorRootIntent(after,taxed.catalog);
  const {AttackAction}=require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const actions=[];
  for(const x of [nominal,taxed]){
    const start={turn:x.state.turn,activePlayer:x.state.activePlayer,
      opponentDamage:x.opponent.active.damage,
      prompts:x.state.prompts.length};
    let dispatchError=null;
    try{x.store.dispatch(new AttackAction(x.owner.id,ATTACK));}
    catch(error){dispatchError=String(error?.message??error);}
    actions.push({start,error:dispatchError,
      after:{turn:x.state.turn,activePlayer:x.state.activePlayer,
        opponentDamage:x.opponent.active.damage,
        pendingPrompts:x.state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name)},
      root: x===nominal?baseline:taxedRoot});
  }
  return {seat,attack:ATTACK,enginePin:PIN,
    beforeStadium:before.ownPublic?.stadium??[],
    afterStadium:after.ownPublic?.stadium??[],
    baseline,taxedRoot,actions};
}

function run(){
  return {schema:'agent49-pinned-stadium-cost-native-board-comparison-v1',
    pin:PIN,
    playerResults:[0,1].map(runSeat),
    competitiveQualifiedGames:0,
    caveat:'Synthetic native Store actions with staged three Lightning Energies; cannot establish tournament playability or complete opponent response.'};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT49_NATIVE_STADIUM_CONTRAST '+
    JSON.stringify(result.playerResults.map(row=>({
      seat:row.seat,baseline:row.baseline,taxedRoot:row.taxedRoot,
      nominalNativeAction:row.actions[0],
      wondrousNativeAction:row.actions[1]
    })))+'\n');
}
module.exports={stageOne,runSeat,run};
