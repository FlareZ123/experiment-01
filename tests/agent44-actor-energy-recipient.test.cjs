'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorEnergyRecipient}=
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:P,Darkness:7},colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function pokemon(name,energies,attacks){
  return {name,energies,attacks,
    publicRestrictions:{},specialConditions:[],printed:{types:[P]}};
}
/** @returns {object} */
function view(){
  return {decisionKind:'owner-root',globalTurn:3,
    ownHand:['Psychic Energy MEE'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false},
    ownPublic:{
      active:pokemon('Girafarig',Array(10).fill('Psychic Energy MEE'),[
        {name:'Get Lost',cost:[C],gxAttack:false},
        {name:'Mind Shock',cost:[C,C,C],gxAttack:false}
      ]),
      bench:[pokemon('Shadow Rider Calyrex V',[],[
        {name:'Shadow Mist',cost:[P],gxAttack:false},
        {name:'Astral Barrage',cost:[P,P,P],gxAttack:false}
      ]),null,null,null,null],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },opponentHidden:{hand:['private'],prizes:['private']}};
}

test('ten-Energy already-ready Active yields Basic attachment to visible Bench',()=>{
  const pick=chooseActorEnergyRecipient(view(),catalog);
  assert.deepEqual(pick,{handIndex:0,printing:'Psychic Energy MEE',
    slot:'bench',index:0,attackName:'Shadow Mist',
    gapBefore:1,gapAfter:0,knownBasicEnergyOnly:true});
  const intent=chooseActorRootIntent(view(),catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.deepEqual(intent,{kind:'attach-basic-energy',...pick});
  const old=chooseActorRootIntent(view(),catalog,{energyFrontier:true});
  assert.equal(old.slot,undefined,'New recipient must be explicit opt-in');
});

test('unready Active gets preference when Basic attachment closes its cost',()=>{
  const v=view();
  v.ownPublic.active.energies=[];
  v.ownPublic.active.attacks=[{name:'Mind Shock',cost:[P,P],gxAttack:false}];
  const pick=chooseActorEnergyRecipient(v,catalog);
  assert.equal(pick.slot,'active');
  assert.equal(pick.attackName,'Mind Shock');
  assert.equal(pick.gapBefore,2);
  assert.equal(pick.gapAfter,1);
});

test('no meaningful printed deficit preserves Basic Energy in hand',()=>{
  const v=view();
  v.ownPublic.bench=[null,null,null,null,null];
  assert.equal(chooseActorEnergyRecipient(v,catalog),null);
  assert.equal(chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  }).kind,'attack');
  assert.equal(chooseActorRootIntent(v,catalog,{energyFrontier:true}).kind,
    'attach-basic-energy','Default root stays unchanged');
});

test('skip GX and unknown Special Energy rather than crediting made-up units',()=>{
  const v=view();
  v.ownPublic.bench=[pokemon('GX only',[],[
    {name:'Miraculous Duo-GX',cost:[P,P,C],gxAttack:true}
  ]),null,null,null,null];
  assert.equal(chooseActorEnergyRecipient(v,catalog),null);
  v.ownPublic.bench=[pokemon('Special Energy',[
    'Double Dragon Energy ROS'],[
    {name:'Dual Attack',cost:[P,P,C],gxAttack:false}
  ]),null,null,null,null];
  assert.equal(chooseActorEnergyRecipient(v,catalog),null);
});

test('opposing hidden hand, deck and Prize data cannot affect actor decision',()=>{
  const x=view(),y=view();
  y.opponentHidden={hand:['other'],prizes:['other']};
  y.ownSecretDeck=['unknown'];
  y.ownSecretPrize=['unseen'];
  x.ownSecretDeck=['unrelated'];
  assert.deepEqual(chooseActorEnergyRecipient(x,catalog),
    chooseActorEnergyRecipient(y,catalog));
});

test('targeted Bench Energy has actual physical mutation witness, not Active proxy',()=>{
  const energy={fullName:'Psychic Energy MEE'};
  const active=()=>({energies:{cards:Array(10).fill(energy)}});
  const bench=()=>({energies:{cards:[]}});
  const state={turn:3,phase:2,players:[{id:11,active:active(),
    bench:[bench(),bench()],hand:{cards:[energy]}},
    {id:22,active:active(),bench:[bench()],hand:{cards:[]}}]};
  const intent={kind:'attach-basic-energy',slot:'bench',index:0,
    printing:energy.fullName};
  const before=rootPhysicalSnapshot(state,0,intent);
  const afterWrong=structuredClone(before);
  afterWrong.activeEnergies.push(energy.fullName);
  afterWrong.handCount--;
  assert.equal(rootPhysicalWitness(intent,before,afterWrong,{}),
    'no-confirmed-public-effect','Wrong Active slot must not count');
  state.players[0].bench[0].energies.cards.push(energy);
  state.players[0].hand.cards.pop();
  const after=rootPhysicalSnapshot(state,0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'confirmed-public-effect');
});

test('authentic owner Root proposal addresses the Bench, with reversible hooks',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      const makeSlot=name=>{
        const p={fullName:name,name,stage:1,cardType:[P],hp:100,
          weakness:[],resistance:[],retreat:[],attacks:[],powers:[]};
        return {getPokemonCard:()=>p,cards:[p],damage:0,
          specialConditions:[],energies:{cards:[]},tools:[]};
      };
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:makeSlot('Girafarig LOT'),
        bench:[makeSlot('Shadow Rider Calyrex V CRE'),
          ...Array.from({length:4},empty)],
        hand:{cards:[{fullName:'Psychic Energy MEE'}]},
        deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={turn:3,phase:2,activePlayer:0,
        prompts:[],players:[player(11),player(22)]};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Generic root prohibited');}
  }
  const botOriginal=SimpleTacticsAi.prototype.decodeNextAction;
  const storeOriginal=Store.prototype.dispatch;
  const observed=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const choice=new SimpleTacticsAi(11).decodeNextAction(store.state);
    assert.ok(choice instanceof PlayCardAction);
    assert.deepEqual(choice.target,{player:0,slot:2,index:0});
    store.dispatch(choice);
    return choice;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    getCatalog:()=>catalog,observe:()=>view(),
    energyRecipientFrontier:true,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.equal(observed.audit.energyRecipientFrontierOptIn,true);
  assert.equal(observed.audit.acceptedActorRoots,1);
  assert.equal(observed.audit.rejectedActorRoots,0);
  assert.equal(observed.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,botOriginal);
  assert.strictEqual(Store.prototype.dispatch,storeOriginal);
});

test('public blocked low-cost attack does not suppress Active upgrade',()=>{
  const v=view();
  v.ownPublic.active.energies=['Psychic Energy MEE','Psychic Energy MEE'];
  v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn='Get Lost';
  const pick=chooseActorEnergyRecipient(v,catalog);
  assert.equal(pick.slot,'active');
  assert.equal(pick.attackName,'Mind Shock');
  assert.equal(pick.gapAfter,0);
});

test('public paralysis favors eligible Bench deficit',()=>{
  const v=view();
  v.ownPublic.active.energies=[];
  v.ownPublic.active.attacks=[{name:'Mind Shock',cost:[P]}];
  v.ownPublic.active.specialConditions=[catalog.specialConditions.PARALYZED];
  const pick=chooseActorEnergyRecipient(v,catalog);
  assert.equal(pick.slot,'bench');
});

test('mobility funding counts ordinary Supporter uses, not global turns',()=>{
  const make=played=>{
    const v=view();
    v.ownPublic.active=pokemon('Stranded Active',[],[
      {name:'Three Energy',cost:[P,P,P],gxAttack:false}
    ]);
    v.ownPublic.bench=[pokemon('Bench Attacker',[],[
      {name:'One Energy',cost:[P],gxAttack:false}
    ]),null,null,null,null];
    v.opponentPublic={bench:[pokemon('Target',[],[])]};
    v.ownHand=['Psychic Energy MEE','Guzma BUS'];
    v.ownTurnResources={
      supporterPlayedTurn:played,supporterPlayLocked:false,
      itemPlayLocked:false
    };
    v.ownPublic.publicTurnRestrictions={
      supporterPlayLocked:false,itemPlayLocked:false
    };
    return v;
  };
  assert.equal(chooseActorEnergyRecipient(make(0),catalog,{
    mobilityAware:true
  }).slot,'bench','Unused Supporter permits genuine Guzma mobility');
  assert.equal(chooseActorEnergyRecipient(make(1),catalog,{
    mobilityAware:true
  }).slot,'active','Spent Supporter cannot grant Guzma mobility');
  assert.equal(chooseActorEnergyRecipient(make(2),catalog,{
    mobilityAware:true
  }).slot,'active','Invalid double-use cannot grant mobility');
  const first=make(0);
  first.globalTurn=1;
  assert.equal(chooseActorEnergyRecipient(first,catalog,{
    mobilityAware:true
  }).slot,'active','First-turn Supporter prohibition still applies');
  const locked=make(0);
  locked.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseActorEnergyRecipient(locked,catalog,{
    mobilityAware:true
  }).slot,'active','Public Supporter lock blocks mobility');
});


test('Dimension Valley preserves Basic attachment when Psychic attack is paid',()=>{
  const v=view();
  v.ownPublic.bench=[null,null,null,null,null];
  v.ownPublic.active.energies=['Psychic Energy MEE'];
  v.ownPublic.active.attacks=[
    {name:'Psychic Strike',cost:[P,C],gxAttack:false}];
  const first=chooseActorEnergyRecipient(v,catalog);
  assert.equal(first.slot,'active');
  assert.equal(first.gapBefore,1);
  assert.equal(first.gapAfter,0);
  v.ownPublic.stadium=['Dimension Valley PHF'];
  assert.equal(chooseActorEnergyRecipient(v,catalog),null);
  const intent=chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true,publicContextSpecialEnergy:true
  });
  assert.deepEqual(intent,{kind:'attack',attackName:'Psychic Strike'});
});

test('Thunder Mountain prevents false Bench Lightning deficit but retains a second one',()=>{
  const v=view();
  v.ownHand=['Lightning Energy MEE'];
  const lightning=4;
  const c={...catalog,basicEnergies:new Set([...catalog.basicEnergies,
    'Lightning Energy MEE']),
    basicEnergyTypes:{...catalog.basicEnergyTypes,Lightning:lightning}};
  const target=pokemon('Pikachu',[],[
    {name:'Thunderbolt',cost:[lightning],gxAttack:false}]);
  target.printed.types=[lightning];
  v.ownPublic.bench=[target,null,null,null,null];
  assert.equal(chooseActorEnergyRecipient(v,c)?.slot,'bench');
  v.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  assert.equal(chooseActorEnergyRecipient(v,c),null);
  target.attacks[0].cost=[lightning,lightning];
  const pick=chooseActorEnergyRecipient(v,c);
  assert.equal(pick?.slot,'bench');
  assert.equal(pick.gapBefore,1);
  assert.equal(pick.gapAfter,0);
});

// Keep the existing canonical actor recipient test command exercising the
// dependent, separately versioned held-Guzma public restriction regression.
require('./agent2-held-guzma-mobility-frontier.test.cjs');
