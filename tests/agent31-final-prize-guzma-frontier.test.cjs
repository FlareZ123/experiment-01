'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {nominalKo,chooseFinalPrizeGuzma}=require(
  '../simulation/twinleaf/agent31-final-prize-guzma-frontier.cjs');
const {chooseActorRootIntent}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:P},
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const attack=(damage=100)=>({
  name:'Moon Press',cost:[P,C,C],damage,damageCalculation:null,
  text:'',gxAttack:false
});
const poke=(name,energyCount,damage=100)=>({
  printing:name,attacks:[attack(damage)],
  energies:Array.from({length:energyCount},()=> 'Psychic Energy MEE'),
  publicRestrictions:{},specialConditions:[],
  printed:{types:[P],resistance:[]},
  hp:90,damage:0,tools:[]
});
function root(){
  return {
    decisionKind:'owner-root',globalTurn:9,
    ownHand:['Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:poke('Lunatone OBF',0),
      bench:[poke('Crobat V DAA',0),poke('Lunatone OBF',3),null,null,null],
      prizeCount:1,
      resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      active:{hp:210,damage:0,tools:[],printed:{resistance:[]}},
      bench:[{hp:210,damage:0,tools:[],printed:{resistance:[]},
        printing:'Oranguru V ASR'},
        {hp:90,damage:0,tools:[],printed:{resistance:[]},
          printing:'Lunatone OBF'},null,null,null],
      prizeCount:5
    }
  };
}

test('selects actual second Bench recipient and second opponent Bench final Prize',()=>{
  const result=chooseFinalPrizeGuzma(root(),catalog);
  assert.equal(result.kind,'play-guzma-forced-nominal-ko');
  assert.equal(result.planFamily,'last-prize-multi-bench-nominal-gust');
  assert.equal(result.opponentBenchIndex,1);
  assert.equal(result.benchIndex,1);
  assert.equal(result.attackName,'Moon Press');
  assert.equal(result.finalPrizeBeforeRoot,1);
  assert.equal(result.nativeOpponentTargetMustMatchIndex,true);
});

test('zero, two or unknown remaining Prize cards decline this endgame line',()=>{
  for(const prizes of [0,2,undefined]){
    const v=root();v.ownPublic.prizeCount=prizes;
    assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  }
});

test('already funded direct final-Prize attack preserves the Supporter',()=>{
  const v=root();
  v.ownPublic.active.energies=['Psychic Energy MEE',
    'Psychic Energy MEE','Psychic Energy MEE'];
  v.opponentPublic.active.hp=90;
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
});

test('unknown Tool or matching printed Resistance forbids nominal-KO inference',()=>{
  const v=root(),target=v.opponentPublic.bench[1];
  target.tools=['Big Charm RCL'];
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  target.tools=['Eviolite NVI'];
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  target.damage=20;
  assert.equal(chooseFinalPrizeGuzma(v,catalog).nominalDamage,80);
  target.tools=[];
  target.printed.resistance=[{type:P,value:-30}];
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
});

test('no payable Bench attack, wrong Supporter, spent quota, lock or first turn',()=>{
  const v=root();v.ownPublic.bench[1].energies=[];
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  v.ownPublic.bench[1].energies=['Psychic Energy MEE',
    'Psychic Energy MEE','Psychic Energy MEE'];
  v.ownHand=['Guzma & Hala CEC'];
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  v.ownHand=['Guzma BUS'];
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.globalTurn=1;
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
});

test('opponent private hand and hidden Prize identities cannot affect selection',()=>{
  const v=root();
  const expected=chooseFinalPrizeGuzma(v,catalog);
  Object.defineProperty(v,'opponentHidden',{get(){
    throw Error('Forbidden opponent concealed information accessed');
  }});
  assert.deepEqual(chooseFinalPrizeGuzma(v,catalog),expected);
});

test('new root stays default-off and opt-in beats funded but nonterminal Active attack',()=>{
  const v=root();
  v.ownPublic.active.energies=['Psychic Energy MEE',
    'Psychic Energy MEE','Psychic Energy MEE'];
  v.ownPublic.active.attacks=[attack(100)];
  v.ownTurnResources.energyPlayedTurn=9;
  assert.equal(chooseActorRootIntent(v,catalog).kind,'attack');
  assert.equal(chooseActorRootIntent(v,catalog,{finalPrizeGuzma:true}).kind,
    'play-guzma-forced-nominal-ko');
});

test('zero-damage and overdamaged Bench targets are never nominated',()=>{
  const v=root();
  v.opponentPublic.bench[1].damage=90;
  assert.equal(chooseFinalPrizeGuzma(v,catalog),null);
  assert.equal(nominalKo({hp:90,damage:0},v.ownPublic.bench[1],
    attack(0)),null);
});
