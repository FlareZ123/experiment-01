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


/**
 * Public counterpart of the verified rank-11 source decision.
 * Only synthetic actor views are supplied here. The published Agent12
 * pinned-Store comparison is separate evidence of actual native settlement.
 * @param {number} defendingHP
 * @returns {object}
 */
function oneAttachmentClawView(defendingHP=90){
  const darkness='Darkness Energy MEE',D=7;
  const p=(name,energies,attacks)=>({
    name,energies,attacks,publicRestrictions:{},specialConditions:[]
  });
  return {
    decisionKind:'owner-root',globalTurn:42,
    ownHand:[darkness],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false},
    ownPublic:{
      active:p('Mega Absol ex',[darkness,darkness],[
        {name:'Terminal Period',cost:[D,C],damage:'',gxAttack:false},
        {name:'Claw of Darkness',cost:[D,D,C],damage:'200',
          gxAttack:false}
      ]),
      bench:[p('Trubbish',[],[
        {name:'Call for Family',cost:[D],damage:'',gxAttack:false}
      ]),p('Bench 1',[],[]),p('Bench 2',[],[]),
        p('Bench 3',[],[]),p('Bench 4',[],[])],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,
        attackMaxEnergy:null}
    },
    opponentPublic:{active:p('Girafarig',[],[]),
      handCount:4},
    opponentHidden:{hand:['unknown'],prizes:['unknown']}
  };
}

test('common policy prioritizes printed one-attachment nominal KO over a Bench gap',()=>{
  const v=oneAttachmentClawView();
  v.opponentPublic.active.hp=90;
  v.opponentPublic.active.damage=0;
  const old=chooseActorEnergyRecipient(v,catalog);
  assert.equal(old.slot,'bench','Unmodified generic recipient remains a baseline');
  const intent=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(intent.kind,'attach-basic-energy');
  assert.equal(intent.slot,'active');
  assert.equal(intent.attackName,'Claw of Darkness');
  assert.equal(intent.gapBefore,1);
  assert.equal(intent.gapAfter,0);
  assert.equal(intent.projectedBaseDamage,200);
  assert.equal(intent.opponentRemainingHP,90);
  assert.equal(intent.printing,'Darkness Energy MEE');
});

test('common policy retains ordinary recipient for insufficient printed damage',()=>{
  const v=oneAttachmentClawView();
  v.opponentPublic.active.hp=280;
  v.opponentPublic.active.damage=0;
  const intent=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(intent.slot,'bench');
  assert.equal(intent.attackName,'Call for Family');
});

test('common priority ignores hidden opponent identities and respects restrictions',()=>{
  const v=oneAttachmentClawView();
  v.opponentPublic.active.hp=90;
  v.opponentPublic.active.damage=0;
  const intent=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  v.opponentHidden={hand:['different'],prizes:[]};
  v.ownSecretDeck=['inaccessible'];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  }),intent);
  v.ownPublic.active.publicRestrictions.cannotUseAttacksNextTurn=[
    'Claw of Darkness'
  ];
  const blocked=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(blocked.slot,'bench');
});


const {printedActiveEnergyScaling,guardActiveEnergyExposure}=
  require('../simulation/twinleaf/agent6-active-energy-exposure.cjs');

/**
 * Synthetic public/owner image of the reported rank11 source-first Articuno
 * exposure. Card printings, damage wording and Basic attack gap are grounded
 * in publicly visible card text; no native game outcome is asserted.
 * @returns {object}
 */
function energyScalingThreatView(){
  const a=(name,energies,attacks)=>({
    name,energies,attacks,publicRestrictions:{},specialConditions:[]
  });
  return {
    decisionKind:'owner-root',globalTurn:22,
    ownHand:['Psychic Energy MEE'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false},
    ownPublic:{
      active:a('Galarian Articuno V',[],[
        {name:'Psyray',cost:[P,C,C],damage:'110',gxAttack:false}
      ]),
      bench:[a('Mewtwo & Mew-GX',[],[]),
        a('Duskull',[],[]),a('Solrock',[],[]),
        a('Clefairy',[],[]),a('Mew',[],[])],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      active:a('Oranguru V',[
        'Double Colorless Energy XY','Double Colorless Energy XY'],[
        {name:'Psychic',cost:[C,C,C],damage:'30+',
          text:"This attack does 50 more damage for each Energy attached to your opponent's Active Pokémon.",
          gxAttack:false}
      ])
    },
    opponentHidden:{hand:['unknown'],prizes:['unknown']}
  };
}

test('public opposing energy-scaled attack defers unready Active Basic attachment',()=>{
  const v=energyScalingThreatView();
  assert.equal(printedActiveEnergyScaling(v.opponentPublic),50);
  const baseline=chooseActorEnergyRecipient(v,catalog);
  assert.equal(baseline.slot,'active');
  assert.equal(baseline.gapBefore,3);
  assert.equal(baseline.gapAfter,2);
  const guarded=guardActiveEnergyExposure(v,catalog,baseline);
  assert.deepEqual(guarded,{triggered:true,recipient:null,bonusDamage:50});
  const root=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(root.kind,'pass');
  assert.equal(root.reason,'withheld-basic-from-active-energy-scaling');
  assert.equal(root.opponentPrintedScalingPerEnergy,50);
});

test('public Energy-scaling risk favors a credited Bench line',()=>{
  const v=energyScalingThreatView();
  v.ownPublic.bench[0].attacks=[
    {name:'Bench Attack',cost:[P],damage:'40',gxAttack:false}
  ];
  const root=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(root.kind,'attach-basic-energy');
  assert.equal(root.slot,'bench');
  assert.equal(root.index,0);
  assert.equal(root.attackName,'Bench Attack');
  assert.equal(root.avoidedActiveEnergyScaling,true);
  assert.equal(root.opponentPrintedScalingPerEnergy,50);
});

test('non-scaling threats and immediately funded Active attacks retain attachment',()=>{
  const v=energyScalingThreatView();
  v.opponentPublic.active.attacks[0].text='This attack does 30 damage.';
  assert.equal(printedActiveEnergyScaling(v.opponentPublic),0);
  assert.equal(chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  }).slot,'active');
  v.opponentPublic.active.attacks[0].text=
    "This attack does 50 more damage for each Energy attached to your opponent's Active Pokémon.";
  v.ownPublic.active.energies=[
    'Psychic Energy MEE','Psychic Energy MEE'];
  const root=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  assert.equal(root.slot,'active');
  assert.equal(root.gapAfter,0);
});

test('energy-exposure decision is invariant to opponent concealed information',()=>{
  const v=energyScalingThreatView();
  const original=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  });
  v.opponentHidden={hand:['different'],prizes:['different']};
  v.ownSecretDeck=['hidden'];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true
  }),original);
});
