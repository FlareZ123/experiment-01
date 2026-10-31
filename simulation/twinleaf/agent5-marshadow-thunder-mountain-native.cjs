'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage,nativeAttack}=
  require('./agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {initializeCards}=require('./headless.cjs');
const {settleWaitPrompts}=require(
  './agent42-buddy-pulse-two-prize-native.cjs');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const STADIUM='Thunder Mountain Prism Star LOT';
const MARSHADOW='Marshadow UNB';
const SOURCE='Iron Thorns ex TWM';

function stageStadiumResponse(seat,withStadium=true){
  const x=stage(seat),manager=initializeCards();let id=10000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned card missing '+name);
    c.id=id++;return c;
  };
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card(SOURCE));
  x.owner.bench[0].cards.push(card(MARSHADOW));
  if(withStadium)x.opponent.stadium.cards.push(card(STADIUM));
  return x;
}

/**
 * Original Store ability resolution, including all nondiscretionary waits.
 * If a discretionary prompt is encountered, return it as a limitation
 * without selecting from concealed opponent information.
 */
function attemptHole(x){
  const {UseAbilityAction}=
    native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const before={
    stadium:x.opponent.stadium.cards.map(c=>c.fullName),
    benchMarshadow:x.owner.bench[0].cards.map(c=>c.fullName),
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName),
    opponentDiscard:x.opponent.discard.cards.map(c=>c.fullName),
    activeSeat:x.state.activePlayer,turn:x.state.turn
  };
  let error=null,prompts=[];
  try{
    x.store.dispatch(new UseAbilityAction(x.owner.id,
      'Resetting Hole',{player:PlayerType.BOTTOM_PLAYER,
        slot:SlotType.BENCH,index:0}));
    prompts=settleWaitPrompts(x);
  }catch(e){error=String(e?.stack??e);}
  const after={
    stadium:x.opponent.stadium.cards.map(c=>c.fullName),
    benchMarshadow:x.owner.bench[0].cards.map(c=>c.fullName),
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName),
    opponentDiscard:x.opponent.discard.cards.map(c=>c.fullName),
    activeSeat:x.state.activePlayer,turn:x.state.turn,
    pendingPrompts:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
  return {before,after,prompts,error,
    confirmedPublicDiscard:!after.stadium.includes(STADIUM)&&
      after.opponentDiscard.includes(STADIUM)&&
      after.ownerDiscard.includes(MARSHADOW)&&
      !x.owner.bench[0].getPokemonCard(),
    sameOwnerTurn:after.activeSeat===x.seat&&after.turn===2,
    abilityPromptResolutionComplete:after.pendingPrompts.length===0};
}

function runSeat(seat){
  const first=stageStadiumResponse(seat),
    treated=stageStadiumResponse(seat),
    negative=stageStadiumResponse(seat,false);
  const view=actorObservation(first.state,seat);
  assert.deepEqual(view,actorObservation(treated.state,seat));
  const publicStartingContext={
    ownerActive:view.ownPublic.active.printing,
    ownerBench:view.ownPublic.bench[0]?.printing,
    opponentActive:view.opponentPublic.active.printing,
    opponentStadium:view.opponentPublic.stadium,
    ownerResources:view.ownTurnResources
  };
  let attackControl=null,attackControlError=null;
  try{attackControl=nativeAttack(first);}
  catch(e){attackControlError=String(e?.stack??e);}
  const treatment=attemptHole(treated);
  let attackAfter=null,attackAfterError=null;
  if(treatment.confirmedPublicDiscard&&treatment.sameOwnerTurn&&
      treatment.abilityPromptResolutionComplete){
    try{attackAfter=nativeAttack(treated);}
    catch(e){attackAfterError=String(e?.stack??e);}
  }
  const negativeResult=attemptHole(negative);
  return {
    seat,publicStartingContext,
    originalPrintedMarshadowSource:true,
    control:{attack:attackControl,error:attackControlError,
      stadiumStillUp:first.opponent.stadium.cards
        .some(c=>c.fullName===STADIUM)},
    abilityFirst:{...treatment,attackAfter,attackAfterError},
    noStadium:{...negativeResult},
    sourceRelevantPositive:treatment.error===null&&
      treatment.confirmedPublicDiscard&&treatment.sameOwnerTurn&&
      attackAfter!==null&&attackAfterError===null
  };
}
function run(){
  const rows=[0,1].map(seat=>{
    try{return runSeat(seat);}
    catch(error){return {seat,error:String(error?.stack??error),
      sourceRelevantPositive:false};}
  });
  return {schema:'agent5-marshadow-thunder-mountain-original-store-v1',
    pin:PIN,
    registration:
      'results/aichi-2026/registrations/agent5-marshadow-thunder-mountain-20261031.md',
    attemptedSeats:2,
    positiveCount:rows.filter(r=>r.sourceRelevantPositive).length,
    nativeErrors:rows.filter(r=>r.error).length,
    rows,competitiveQualifiedGames:0,
    caveat:'Synthetic, no original sixty deal, no opponent competence or matchup win.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stageStadiumResponse,attemptHole,runSeat,run};
