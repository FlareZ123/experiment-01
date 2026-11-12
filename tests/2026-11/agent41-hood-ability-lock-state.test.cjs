'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  liveGarbotoxinSlots,hasLiveGarbotoxin,
  hasActiveIronThornsInitialization,hasLiveOpponentAbilityLock,
  hasProtectableHoodLockThreat,hoodAttachTargets,
  hasUnspentActiveUnderworldDoor,hoodedDoorRecoveryPlan,
  canUseHoodedDoorUnderGarbotoxin,hasHoodedDoorRecoveryWindow
}=require('../../simulation/twinleaf/hood-ability-lock-state.cjs');

const power=name=>({name});
const pokemon=(name,powers=[])=>({name,fullName:name+' TEST',powers});
const slot=(card,tools=[])=>({getPokemonCard:()=>card,tools});
const tool=name=>({name,fullName:name+' TEST'});
const player=({
  active=null,bench=[],hand=[],deck=[],discard=[],stadium=[],markerUsed=false
}={})=>({
  active,bench,hand:{cards:hand},deck:{cards:deck},discard:{cards:discard},
  stadium:{cards:stadium},marker:{hasMarker:()=>markerUsed},prizes:Array(6).fill(null)
});
const garbodor=()=>pokemon('Garbodor',[power('Garbotoxin')]);
const otherGarbodor=()=>pokemon('Garbodor',[power('Gloomy Garbage')]);
const ironThorns=()=>pokemon('Iron Thorns ex',[power('Initialization')]);
const shadowVmax=()=>pokemon('Shadow Rider Calyrex VMAX',[power('Underworld Door')]);

function recoveryBoard({
  opponentActive=null,opponentBench=[],opponentStadium=[],ownStadium=[],
  hand=[],deck=[],discard=[],markerUsed=false
}={}) {
  const own=player({
    active:slot(shadowVmax(),[tool('Stealthy Hood')]),
    bench:[slot(shadowVmax())],hand,deck,discard,stadium:ownStadium,markerUsed
  });
  const opponent=player({
    active:opponentActive,bench:opponentBench,stadium:opponentStadium
  });
  return {own,opponent,state:{players:[own,opponent]}};
}

test('live Garbotoxin recognizes an Active Garbodor with any Pokémon Tool',()=>{
  const foe=player({active:slot(garbodor(),[tool('Float Stone')])});
  assert.equal(hasLiveGarbotoxin(foe),true);
  assert.deepEqual(liveGarbotoxinSlots(foe),[{
    zone:'active',index:null,printing:'Garbodor TEST',tools:['Float Stone TEST']
  }]);
});

test('live Garbotoxin recognizes a Benched Garbodor with a non-Float-Stone Tool',()=>{
  const foe=player({bench:[slot(garbodor(),[tool('Pokémon Tool')])]});
  assert.equal(hasLiveGarbotoxin(foe),true);
  assert.equal(liveGarbotoxinSlots(foe)[0].zone,'bench');
});

test('a Garbodor name or Tool alone does not prove Garbotoxin',()=>{
  assert.equal(hasLiveGarbotoxin(player({active:slot(garbodor())})),false);
  assert.equal(hasLiveGarbotoxin(player({
    active:slot(otherGarbodor(),[tool('Float Stone')])
  })),false);
});

test('Iron Thorns is a lock only in the Active Spot with Initialization',()=>{
  assert.equal(hasActiveIronThornsInitialization(player({
    active:slot(ironThorns())
  })),true);
  assert.equal(hasActiveIronThornsInitialization(player({
    bench:[slot(ironThorns())]
  })),false);
  assert.equal(hasLiveOpponentAbilityLock(player({
    bench:[slot(garbodor(),[tool('Float Stone')])]
  })),true);
});

test('Hood only protects a Benched VMAX when no Stadium suppresses the Tool or Ability',()=>{
  const foe=player({active:slot(garbodor(),[tool('Float Stone')])});
  const plainState={players:[player(),foe]};
  assert.equal(hasProtectableHoodLockThreat(foe,plainState),true);
  for(const stadium of ['Jamming Tower','Path to the Peak']) {
    const ownStadiumState={players:[player({stadium:[{name:stadium}]}),foe]};
    const opponentStadiumState={players:[player(),player({
      active:foe.active,stadium:[{name:stadium}]
    })]};
    assert.equal(hasProtectableHoodLockThreat(foe,ownStadiumState),false,stadium);
    assert.equal(hasProtectableHoodLockThreat(foe,opponentStadiumState),false,stadium);
  }
});

test('opponent Active Tool Jammer does not suppress Hood while the protected VMAX is Benched',()=>{
  const foe=player({active:slot(garbodor(),[tool('Tool Jammer')])});
  const state={players:[player(),foe]};
  assert.equal(hasProtectableHoodLockThreat(foe,state),true);
});

test('Hood target ranking prefers Bench VMAX, then Active VMAX, then Bench V',()=>{
  const opponent=player({active:slot(garbodor(),[tool('Float Stone')])});
  const own=player({
    active:slot(shadowVmax()),
    bench:[slot(shadowVmax()),slot(pokemon('Shadow Rider Calyrex V'))]
  });
  const state={players:[own,opponent]};
  assert.deepEqual(hoodAttachTargets(own,opponent,state).map(x=>[
    x.zone,x.index,x.priority
  ]),[['bench',0,3],['active',0,2],['bench',1,1]]);

  const activeFallback=player({
    active:slot(shadowVmax()),
    bench:[slot(pokemon('Shadow Rider Calyrex V'))]
  });
  const fallbackState={players:[activeFallback,opponent]};
  assert.deepEqual(hoodAttachTargets(activeFallback,opponent,fallbackState).map(x=>[
    x.zone,x.index,x.priority
  ]),[['active',0,2],['bench',0,1]]);
});

test('Active VMAX Hood fallback fails under opponent Active Tool Jammer but Bench target remains usable',()=>{
  const opponent=player({active:slot(garbodor(),[tool('Tool Jammer')])});
  const activeOnly=player({active:slot(shadowVmax())});
  assert.deepEqual(hoodAttachTargets(activeOnly,opponent,{
    players:[activeOnly,opponent]
  }),[]);

  const withBench=player({
    active:slot(shadowVmax()),bench:[slot(shadowVmax())]
  });
  assert.deepEqual(hoodAttachTargets(withBench,opponent,{
    players:[withBench,opponent]
  }).map(x=>[x.zone,x.index]),[['bench',0]]);
});

test('direct Door plan works with Psychic Energy in hand and does not require Items or Field Blower',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Psychic Energy'}]
  });
  assert.equal(hoodedDoorRecoveryPlan(b.own),'direct');
  assert.equal(canUseHoodedDoorUnderGarbotoxin(b.own,b.opponent,b.state),true);
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),true);
});

test('Night Stretcher-only plan recovers Psychic Energy already in discard',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Night Stretcher'}],discard:[{name:'Psychic Energy'}]
  });
  assert.equal(hoodedDoorRecoveryPlan(b.own),'stretcher');
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),true);
});

test('Compressor plus Stretcher plan works when Energy remains in deck without Field Blower',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Battle Compressor'},{name:'Night Stretcher'}],
    deck:[{name:'Psychic Energy'}]
  });
  assert.equal(hoodedDoorRecoveryPlan(b.own),'compressor-stretcher');
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),true);
});

test('recovery plan fails closed when no energy path exists',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Night Stretcher'}]
  });
  assert.equal(hoodedDoorRecoveryPlan(b.own),null);
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});

test('a Tool Jammer on the opponent Active disables the candidate Active Hood',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Tool Jammer')]),
    hand:[{name:'Psychic Energy'}]
  });
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});

test('a Tool Jammer on a Benched Pokémon does not disable the Active Hood',()=>{
  const b=recoveryBoard({
    opponentActive:slot(pokemon('Other Pokémon')),
    opponentBench:[slot(garbodor(),[tool('Tool Jammer')])],
    hand:[{name:'Psychic Energy'}]
  });
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),true);
});

test('Jamming Tower and Path to the Peak suppress the recovery line',()=>{
  for(const stadium of ['Jamming Tower','Path to the Peak']) {
    const b=recoveryBoard({
      opponentActive:slot(garbodor(),[tool('Float Stone')]),
      hand:[{name:'Psychic Energy'}],opponentStadium:[{name:stadium}]
    });
    assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false,stadium);
  }
});

test('an already-used Underworld Door marker prevents wasting the recovery line',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Battle Compressor'},{name:'Night Stretcher'}],
    deck:[{name:'Psychic Energy'}],markerUsed:true
  });
  assert.equal(hasUnspentActiveUnderworldDoor(b.own),false);
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});

test('missing marker API fails closed rather than assuming Door is unspent',()=>{
  const b=recoveryBoard({
    opponentActive:slot(garbodor(),[tool('Float Stone')]),
    hand:[{name:'Psychic Energy'}]
  });
  delete b.own.marker;
  assert.equal(hasUnspentActiveUnderworldDoor(b.own),false);
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});
