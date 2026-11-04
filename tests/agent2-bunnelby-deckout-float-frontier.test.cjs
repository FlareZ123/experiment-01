'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {chooseBunnelbyImminentDeckoutFloat,VERSION}=
  require('../simulation/twinleaf/agent2-bunnelby-deckout-float-frontier.cjs');

const C=101;
const catalog={
  colorlessEnergyType:C,basicEnergyTypes:{},stages:{BASIC:7},
  specialEnergies:new Set(['Capture Energy RCL']),
  specialConditions:{ASLEEP:'ASLEEP',PARALYZED:'PARALYZED'}
};
/** @returns {object} Detached, synthetic, owner-observable public view. */
function root(){
  return {
    decisionKind:'owner-root',globalTurn:3,
    ownHand:['Forest Seal Stone SIT','Float Stone BKT'],
    ownTurnResources:{retreatedTurn:0,toolPlayLocked:false},
    ownPublic:{
      active:{printing:'Snorlax PGO',
        printed:{retreatCost:[C,C,C,C]},
        publicRestrictions:{},specialConditions:[],tools:[],
        energies:['Capture Energy RCL','Capture Energy RCL']},
      bench:[{
        printing:'Bunnelby PRC',abilities:['Barrage'],
        abilityDetails:[{name:'Barrage',
          text:'This Pokémon may attack twice a turn.'}],
        printed:{stage:7},publicRestrictions:{},specialConditions:[],
        energies:['Capture Energy RCL'],tools:[],
        attacks:[{name:'Burrow',cost:[C],damage:0,
          text:'Discard the top card of your opponent\'s deck.'},
          {name:'Rototiller',cost:[C],damage:0,
            text:'Shuffle a card from your discard pile into your deck.'}]
      }],
      stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,toolPlayLocked:false}
    },
    opponentPublic:{
      active:{printing:'Mew V FST',tools:[]},
      bench:[],stadium:[],deckCount:2
    }
  };
}

test('source-neutral zero-damage imminent deckout overrides FSS-first Tool order',()=>{
  const v=root();
  const got=chooseBunnelbyImminentDeckoutFloat(v,catalog);
  assert.deepEqual(got,{
    benchIndex:0,printing:'Bunnelby PRC',
    targetAttackName:'Burrow',projectedPrintedDamage:0,
    estimatedCardsMilled:2,conditionalTerminalAfterOpponentDraw:true,
    source:VERSION,paperQualified:false,
    kind:'attach-emergency-floatstone',handIndex:1
  });
});
test('already attached Float can produce the next retreat intent',()=>{
  const v=root();
  v.ownPublic.active.tools=['Float Stone BKT'];
  v.ownHand=['Forest Seal Stone SIT'];
  const got=chooseBunnelbyImminentDeckoutFloat(v,catalog);
  assert.equal(got.kind,'retreat-emergency-floatstone');
  assert.equal(got.targetAttackName,'Burrow');
  assert.equal(got.handIndex,undefined);
});
test('opponent deck of three is outside printed double-Burrow terminal condition',()=>{
  const v=root();v.opponentPublic.deckCount=3;
  assert.equal(chooseBunnelbyImminentDeckoutFloat(v,catalog),null);
});
test('opponent deck of one remains a high-value one-Burrow terminal candidate',()=>{
  const v=root();v.opponentPublic.deckCount=1;
  assert.equal(chooseBunnelbyImminentDeckoutFloat(v,catalog).estimatedCardsMilled,1);
});
test('requires physically funded Burrow and printed Omega Barrage',()=>{
  const e=root();e.ownPublic.bench[0].energies=[];
  assert.equal(chooseBunnelbyImminentDeckoutFloat(e,catalog),null);
  const b=root();b.ownPublic.bench[0].abilities=[];
  assert.equal(chooseBunnelbyImminentDeckoutFloat(b,catalog),null);
  const t=root();t.ownPublic.bench[0].attacks[0].text='Draw a card.';
  assert.equal(chooseBunnelbyImminentDeckoutFloat(t,catalog),null);
});
test('respects Tool Jammer, Jamming Tower, Tool lock and owner retreat marker',()=>{
  const jam=root();jam.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(chooseBunnelbyImminentDeckoutFloat(jam,catalog),null);
  const tower=root();tower.ownPublic.stadium=['Jamming Tower TWM'];
  assert.equal(chooseBunnelbyImminentDeckoutFloat(tower,catalog),null);
  const lock=root();lock.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.equal(chooseBunnelbyImminentDeckoutFloat(lock,catalog),null);
  const retreat=root();retreat.ownTurnResources.retreatedTurn=3;
  assert.equal(chooseBunnelbyImminentDeckoutFloat(retreat,catalog),null);
});
test('disallows Asleep or Paralyzed Active and ineligible first global turn',()=>{
  for(const condition of ['ASLEEP','PARALYZED']){
    const v=root();v.ownPublic.active.specialConditions=[condition];
    assert.equal(chooseBunnelbyImminentDeckoutFloat(v,catalog),null);
  }
  const v=root();v.globalTurn=1;
  assert.equal(chooseBunnelbyImminentDeckoutFloat(v,catalog),null);
});
test('opponent opaque/private annotations cannot change owner-public decision',()=>{
  const a=root(),b=root();
  b.opponentPrivateHand=['unknown-card-A'];
  b.opponentPrivatePrize=['unknown-card-B'];
  assert.deepEqual(chooseBunnelbyImminentDeckoutFloat(a,catalog),
    chooseBunnelbyImminentDeckoutFloat(b,catalog));
});
