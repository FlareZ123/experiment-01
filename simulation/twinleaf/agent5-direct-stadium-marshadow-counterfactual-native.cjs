'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {stageForcedActive}=require('./agent5-forced-active-marshadow-chain-native.cjs');
const {chooseMarshadowCounterRoot}=
  require('./agent5-owner-visible-marshadow-chain-policy.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const THUNDER='Thunder Mountain Prism Star LOT';
const STADIUMS=['Sky Field ROS','Dimension Valley PHF'];
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * One original-printing Stadium counter arm. A matched independent actor
 * observation refuses the expensive Fog counter chain, then a genuine
 * native Stadium play is tested as a distinct available alternative.
 * @param {0|1} seat
 * @param {string} stadium
 */
function runArm(seat,stadium){
  assert.ok(seat===0||seat===1);
  assert.ok(STADIUMS.includes(stadium));
  const x=stageForcedActive(seat,'floatstone'),m=initializeCards();
  const card=m.getCardByName(stadium);
  assert.ok(card,'Pinned engine missing source printed Stadium '+stadium);
  card.id=40001;
  x.owner.hand.cards.push(card);
  const initial=actorObservation(x.state,seat);
  assert.equal(chooseMarshadowCounterRoot(initial),null,
    'Held replacement Stadium must veto the expensive actor counter');
  assert.ok(initial.ownHand.includes('Fog Crystal CRE'));
  assert.ok(initial.ownHand.includes('Float Stone BKT'));
  assert.ok(initial.ownHand.includes(stadium));
  const firstTurn=x.state.turn;
  const before={
    ownerActive:initial.ownPublic.active.printing,
    ownerHand:initial.ownHand,
    ownerStadium:initial.ownPublic.stadium,
    opponentStadium:initial.opponentPublic.stadium,
    opponentLostZone:initial.opponentPublic.lostZone
  };
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const idx=x.owner.hand.cards.findIndex(c=>c.fullName===stadium);
  assert.ok(idx>=0);
  x.store.dispatch(new PlayCardAction(x.owner.id,idx,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompts=[];
  for(let n=0;n<16;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Unexpected genuine Stadium replacement choice prompt');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
    prompts.push('WaitPrompt');
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  const after=actorObservation(x.state,seat);
  assert.deepEqual(after.ownPublic.stadium,[stadium]);
  assert.equal(after.opponentPublic.stadium.includes(THUNDER),false);
  assert.ok(after.opponentPublic.lostZone.includes(THUNDER),
    'Original opponent Prism Stadium must enter its own Lost Zone');
  assert.equal(after.opponentPublic.discard.includes(THUNDER),false);
  assert.equal(after.ownPublic.active.printing,'Marshadow UNB');
  assert.equal(after.ownPublic.bench.filter(Boolean).length,0);
  assert.ok(after.ownHand.includes('Fog Crystal CRE'));
  assert.ok(after.ownHand.includes('Float Stone BKT'));
  assert.equal(after.ownHand.includes(stadium),false);
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.turn,firstTurn);
  assert.equal(x.owner.stadiumPlayedTurn,firstTurn,
    'Owner ordinary Stadium play must consume current turn Stadium action');
  return {seat,stadium,success:true,actorCounterDeferred:true,
    nativeStadiumPlay:true,turnPreserved:true,prompts,
    before,after:{
      ownerActive:after.ownPublic.active.printing,
      ownerHand:after.ownHand,
      ownerStadium:after.ownPublic.stadium,
      opponentStadium:after.opponentPublic.stadium,
      opponentLostZone:after.opponentPublic.lostZone,
      ownerStadiumPlayedTurn:x.owner.stadiumPlayedTurn
    }};
}
function run(){
  const rows=[];
  for(const seat of [0,1])
    for(const stadium of STADIUMS)
      try{rows.push(runArm(seat,stadium));}
      catch(error){rows.push({seat,stadium,success:false,
        error:String(error?.stack??error)});}
  return {schema:'agent5-direct-stadium-counter-to-thunder-v1',
    enginePin:PIN,
    preregistration:'results/aichi-2026/registrations/agent5-direct-stadium-vs-forced-marshadow-20261102.md',
    attempted:4,successes:rows.filter(r=>r.success).length,rows,
    competitiveQualifiedGames:0,
    caveat:'Staged single native Stadium plays, no source 60 sampling, opponent policy, economic utility or competitive games.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={runArm,run};
