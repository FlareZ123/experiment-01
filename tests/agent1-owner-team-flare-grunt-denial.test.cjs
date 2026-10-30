'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,TEAM_FLARE_GRUNT,chooseTeamFlareGruntDenial}=
  require('../simulation/twinleaf/agent1-owner-team-flare-grunt-denial.cjs');

/** @returns {object} Detached actor-owned, publicly energy-occupied board. */
function view(){
  const x={
    decisionKind:'owner-root',globalTurn:7,
    ownHand:['Crushing Hammer POR',TEAM_FLARE_GRUNT,'Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{name:'Iron Thorns ex',printing:'Iron Thorns ex TWM'},
      bench:[null],
      publicTurnRestrictions:{supporterPlayLocked:false},
      resolvingSupporter:[]
    },
    opponentPublic:{
      active:{name:'Shadow Rider Calyrex V',energies:['Psychic Energy MEE']},
      bench:[]
    }
  };
  Object.defineProperty(x,'opponentHiddenHand',{
    get(){throw Error('Illegal opponent hidden information read');}
  });
  return x;
}

test('real held XY printing and Active Energy create owner-only denial intent',()=>{
  const v=view(),before=JSON.stringify(v);
  assert.equal(VERSION,'agent1-owner-visible-team-flare-grunt-denial-v1');
  assert.deepEqual(chooseTeamFlareGruntDenial(v),{
    kind:'play-team-flare-grunt-denial',handIndex:1,
    printing:TEAM_FLARE_GRUNT,opponentActiveEnergyCount:1
  });
  assert.equal(JSON.stringify(v),before);
});

test('first player cannot play ordinary Supporter on global turn one',()=>{
  const v=view();v.globalTurn=1;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.globalTurn=2;
  assert.equal(chooseTeamFlareGruntDenial(v)?.kind,
    'play-team-flare-grunt-denial');
});

test('requires opponent Active to have at least one physical Energy',()=>{
  const v=view();v.opponentPublic.active.energies=[];
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.opponentPublic.active=null;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.opponentPublic.active={energies:['Double Colorless Energy SUM']};
  assert.equal(chooseTeamFlareGruntDenial(v)?.opponentActiveEnergyCount,1);
});

test('Supporter quota, live lock, resolving supporter all fail closed',()=>{
  const v=view();
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.ownTurnResources.supporterPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.ownPublic.resolvingSupporter=['Lillie'];
  assert.equal(chooseTeamFlareGruntDenial(v),null);
});

test('missing exact printing, own Active, or owner-root observation excluded',()=>{
  const v=view();v.ownHand=['Team Flare Grunt BUS','Guzma BUS'];
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.ownHand=[TEAM_FLARE_GRUNT];v.ownPublic.active=null;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
  v.ownPublic.active={name:'Iron Thorns ex'};
  v.decisionKind='owner-prompt';
  assert.throws(()=>chooseTeamFlareGruntDenial(v),/owner-root/);
});

test('unknown Supporter used state does not authorize extra play',()=>{
  const v=view();delete v.ownTurnResources.supporterPlayedTurn;
  assert.equal(chooseTeamFlareGruntDenial(v),null);
});
