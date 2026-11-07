'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent29-rank9-owner-card-location-v7-read-only';
const IDENTITIES={
  mega:'Mega Absol ex M1L',
  voltorb:'Voltorb ROS',
  electrode:'Electrode-GX CES'
};
const CONNECTORS={
  ultraBall:'Ultra Ball MEG',
  vip:'Battle VIP Pass FST',
  trainerMail:"Trainers' Mail ROS",
  secretBox:'Secret Box TWM'
};

/**
 * Archive-only omniscient physical-location witness. Never send any hidden
 * deck or Prize identity to the owner decision policy. Read only when a
 * real source PassTurnAction has actually been dispatched. A prospective
 * player could not know face-down Prize contents until K1.
 *
 * @param {object} owner Native original-source Player.
 * @returns {object} Role-card zone counts and physically held connectors.
 */
function originalRoleCardZones(owner){
  const zones={
    deck:owner.deck.cards,
    hand:owner.hand.cards,
    prizes:owner.prizes.flatMap(p=>p.cards),
    active:owner.active.cards,
    bench:owner.bench.flatMap(b=>b.cards),
    discard:owner.discard.cards,
    lostzone:owner.lostzone.cards,
    stadium:owner.stadium.cards,
    supporter:owner.supporter.cards
  };
  const byZone=printing=>Object.fromEntries(
    Object.entries(zones).map(([name,cards])=>[name,
      cards.filter(c=>c.fullName===printing).length]));
  const mega=byZone(IDENTITIES.mega);
  const voltorb=byZone(IDENTITIES.voltorb);
  const electrode=byZone(IDENTITIES.electrode);
  const sum=x=>Object.values(x).reduce((a,b)=>a+b,0);
  return {
    mega,voltorb,electrode,
    physicalRoleConservation:
      sum(mega)===1&&sum(voltorb)===1&&sum(electrode)===2,
    ownHandConnectorCounts:Object.fromEntries(Object.entries(CONNECTORS)
      .map(([name,printing])=>[name,
        owner.hand.cards.filter(c=>c.fullName===printing).length])),
    ownHandCompressor:owner.hand.cards.filter(c=>
      c.fullName==='Battle Compressor PHF').length,
    ownerPrizesLeft:owner.getPrizeLeft(),
    ownActive:owner.active.getPokemonCard()?.fullName??null,
    ownBench:owner.bench.map(b=>b.getPokemonCard()?.fullName??null)
  };
}

/**
 * Observe source role locations at each *accepted* original-source Pass.
 * Root Store/owner seat is determined ONLY by the trusted registered trial
 * callback, never opponent cards or speculative clone dispatch.
 *
 * @template T
 * @param {(register:(store:object,trialId:string)=>void)=>T} run
 * @param {{Store?:Function}} [deps] Test-only native injection.
 * @returns {{result:T,audit:object}}
 */
function withOriginalRank9OwnerCardLocations(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const registrations=new WeakMap();
  const audit={version:VERSION,rolePrintings:IDENTITIES,
    oracleOnly:true,usedForAnyPlayerDecision:false,
    originalRank:9,originalRoleCopies:{mega:1,voltorb:1,electrode:2},
    observedSourcePasses:0,heldItemSourcePasses:0,
    nonConservingRoleSnapshots:0,sourceSeatMismatch:0,events:[]};

  function register(store,trialId){
    assert.ok(store instanceof Store);
    assert.equal(typeof trialId,'string');
    const fields=trialId.split(':');
    assert.equal(fields[0],'9');
    assert.ok(fields[2]==='A'||fields[2]==='B');
    const sourceSeat=fields[2]==='A'?1:0;
    registrations.set(store,{trialId,sourceSeat});
  }

  function dispatch(action,...args){
    const registered=registrations.get(this);
    const isPass=action?.constructor?.name==='PassTurnAction';
    const state=this.state;
    const source=registered?state.players?.[registered.sourceSeat]:null;
    const sourceAction=!!registered&&isPass&&
      state.activePlayer===registered.sourceSeat&&
      action.clientId===source?.id;
    const snapshot=sourceAction?originalRoleCardZones(source):null;
    const globalTurn=state.turn;
    const result=original.value.call(this,action,...args);
    if(snapshot){
      const event={trialId:registered.trialId,
        sourceSeat:registered.sourceSeat,
        globalTurn,
        ...snapshot};
      audit.events.push(event);
      audit.observedSourcePasses++;
      audit.heldItemSourcePasses+=Number(snapshot.ownHandCompressor>0);
      audit.nonConservingRoleSnapshots+=Number(!snapshot.physicalRoleConservation);
    }
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{return {result:run(register),audit};}
  finally{Object.defineProperty(Store.prototype,'dispatch',original);}
}

module.exports={VERSION,IDENTITIES,CONNECTORS,originalRoleCardZones,
  withOriginalRank9OwnerCardLocations};
