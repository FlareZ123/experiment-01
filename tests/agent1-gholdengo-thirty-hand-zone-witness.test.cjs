"use strict";

/**
 * Printed-card zone-accounting witness only: selected opening and ordered draws,
 * opponent passes, no attack or policy claim against the Aichi Top32 field.
 * Run: node --test tests/agent1-gholdengo-thirty-hand-zone-witness.test.cjs
 */
const assert=require("node:assert/strict");
const test=require("node:test");

/** @type {[string,number][]} */
const SPEC=[
 ["Gimmighoul 30C 81",4],["Gholdengo 30C 108",3],
 ["Exeggcute PLF 4",2],["Firebreather PFL 89",4],
 ["Roxie CEC 205",4],["Arven SVI 166",4],
 ["VS Seeker PHF 109",4],["Ultra Ball SVI 196",4],
 ["Pokegear 3.0 SVI 186",3],["Professor's Letter BKT 146",2],
 ["Energy Search Pro SSP 176",1],["Switch SVI 194",1],
 ["Fire Energy",15],["Metal Energy",2],["Grass Energy",1],
 ["Water Energy",1],["Lightning Energy",1],["Psychic Energy",1],
 ["Fighting Energy",1],["Darkness Energy",1],["Fairy Energy",1]
];
const GIM="Gimmighoul 30C 81",GHO="Gholdengo 30C 108";
const EGG="Exeggcute PLF 4",ROX="Roxie CEC 205";
const ESP="Energy Search Pro SSP 176";
const ENERGY=["Fire Energy","Metal Energy","Grass Energy","Water Energy",
  "Lightning Energy","Psychic Energy","Fighting Energy","Darkness Energy",
  "Fairy Energy"];

/** @param {{name:string,id:string}[]} zone @param {string} name */
function take(zone,name){
 const i=zone.findIndex(c=>c.name===name);
 assert.notEqual(i,-1,"missing physical card "+name);
 return zone.splice(i,1)[0];
}

/** @param {object} s */
function audit(s){
 const all=[...s.hand,...s.deck,...s.prizes,...s.discard,...s.active,
  ...s.attached];
 assert.equal(all.length,60);
 assert.equal(new Set(all.map(x=>x.id)).size,60);
}

/**
 * Physical starting seven: Gimmighoul, both Exeggcute, 3 Roxie, ACE SPEC.
 * Six deliberately Prized Fire Energy, 21 deliberately non-Energy next draws.
 * This ordering is rare and chosen with hindsight, not randomized.
 * @param {boolean} [prizeGrass]
 */
function deal(prizeGrass=false){
 const pool=SPEC.flatMap(([name,n])=>Array.from({length:n},
  (_,i)=>({name,id:name+"#"+i})));
 const hand=[take(pool,GIM),take(pool,EGG),take(pool,EGG),
  take(pool,ROX),take(pool,ROX),take(pool,ROX),take(pool,ESP)];
 const prizes=Array.from({length:prizeGrass?5:6},
  ()=>take(pool,"Fire Energy"));
 if(prizeGrass)prizes.push(take(pool,"Grass Energy"));
 const draws=[take(pool,GHO)];
 while(draws.length<21){
  const next=pool.find(c=>!c.name.endsWith(" Energy"));
  assert.ok(next);
  draws.push(take(pool,next.name));
 }
 const s={hand,deck:[...draws,...pool],prizes,discard:[],
  active:[take(hand,GIM)],attached:[],turn:0,supporter:false,goingSecond:true};
 audit(s);
 return s;
}

/** @param {object} s */
function draw(s){
 assert.ok(s.deck.length);
 s.hand.push(s.deck.shift());
}

/** @param {object} s */
function newTurn(s){
 s.turn++;
 s.supporter=false;
 draw(s);
 audit(s);
}

/**
 * Roxie: exactly two Exeggcute discarded, six physical cards drawn.
 * Each Exeggcute Propagation retrieves its own instance from discard
 * before the attack; each copy used once in each of the three turns.
 * @param {object} s
 * @param {boolean} [abilitySuppressed]
 */
function roxie(s,abilitySuppressed=false){
 assert.ok(s.turn>1||s.goingSecond,"first player cannot Supporter on first turn");
 assert.ok(!s.supporter,"one Supporter per turn");
 assert.equal(s.hand.filter(c=>c.name===EGG).length,2,
  "two actual Exeggcute required");
 s.supporter=true;
 s.discard.push(take(s.hand,ROX),take(s.hand,EGG),take(s.hand,EGG));
 for(let i=0;i<6;i++)draw(s);
 if(!abilitySuppressed)s.hand.push(take(s.discard,EGG),take(s.discard,EGG));
 audit(s);
}

/** @param {object} s */
function evolve(s){
 assert.ok(s.turn>=2,"cannot evolve on first turn");
 assert.equal(s.active.at(-1).name,GIM);
 s.active.push(take(s.hand,GHO));
 audit(s);
}

/** @param {boolean} [prizeGrass] */
function witness(prizeGrass=false){
 const s=deal(prizeGrass);
 for(let t=1;t<=3;t++){
  newTurn(s);
  if(t===2)evolve(s);
  roxie(s);
 }
 const beforeAce=s.hand.length;
 s.discard.push(take(s.hand,ESP));
 let types=0;
 for(const type of ENERGY){
  if(s.deck.some(c=>c.name===type)){
   s.hand.push(take(s.deck,type));types++;
  }
 }
 s.attached.push(take(s.hand,"Metal Energy"));
 audit(s);
 const beforeAttack=s.hand.length;
 const success=beforeAttack===30;
 if(success){
  assert.equal(s.active[1].name,GHO);
  assert.ok(s.attached.some(c=>c.name==="Metal Energy"));
  s.hand.push(...s.prizes.splice(0,2));
  s.deck.push(...s.hand);
  s.hand=[];
 }
 audit(s);
 return {beforeAce,types,beforeAttack,success,s};
}

test("illustrative candidate has 60 cards, legal copy ceiling, one ACE SPEC",()=>{
 assert.equal(SPEC.reduce((n,[,count])=>n+count,0),60);
 assert.ok(SPEC.filter(([name,count])=>!name.endsWith(" Energy")&&count>4)
  .length===0);
 assert.equal(SPEC.find(([name])=>name===ESP)[1],1);
});
test("actual card-zone T3 Celebration takes 2 Prizes then shuffles entire hand",()=>{
 const r=witness(false);
 assert.equal(r.beforeAce,23);
 assert.equal(r.types,9);
 assert.equal(r.beforeAttack,30);
 assert.equal(r.success,true);
 assert.equal(r.s.prizes.length,4);
 assert.equal(r.s.hand.length,0);
});
test("Prize one singleton Energy and SAME line ends with 29, zero Prizes",()=>{
 const r=witness(true);
 assert.equal(r.types,8);
 assert.equal(r.beforeAttack,29);
 assert.equal(r.success,false);
 assert.equal(r.s.prizes.length,6);
});
test("discard-pile Ability suppression invalidates three-Roxie sequence",()=>{
 const s=deal();
 newTurn(s);
 roxie(s,true);
 newTurn(s);
 assert.throws(()=>roxie(s,true),/two actual Exeggcute/);
});
test("normal evolution and Supporter restrictions prohibit shortcuts",()=>{
 const s=deal();
 newTurn(s);
 assert.equal(s.turn,1);
 assert.ok(s.active.length===1);
 assert.throws(()=>evolve(s),/cannot evolve on first turn/);
 s.goingSecond=false;
 assert.throws(()=>roxie(s),/first player cannot Supporter/);
 s.goingSecond=true;
 roxie(s);
 assert.throws(()=>roxie(s),/one Supporter/);
 assert.ok(s.hand.length<30);
});

/**
 * Count uniformly shuffled six-Prize placements AFTER an accepted seven-card
 * opening containing at least one of the six Basic Pokémon (4 Gimmighoul,
 * 2 Exeggcute). This accounts for mulligan conditioning. The seven distinct
 * singleton Energy types are not among those six Basic Pokémon.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
 if(k<0||k>n)return 0n;
 let value=1n;
 for(let i=1;i<=k;i++)value=value*BigInt(n-k+i)/BigInt(i);
 return value;
}

test("mulligan-conditioned exact ACE/Special-Energy Prize collapse",()=>{
 const basicCount=6,singletonTypes=7,otherCount=47;
 const validInitial=choose(60,7)-choose(60-basicCount,7);
 let weightedNoPrizedSingleton=0n;
 for(let a=0;a<=singletonTypes;a++){
  for(let b=1;b<=basicCount;b++){
   const other=7-a-b;
   const initialWays=choose(singletonTypes,a)*choose(basicCount,b)*
     choose(otherCount,other);
   // A singleton already in the opening hand cannot be Prized. Remaining
   // non-singletons among the 53 undealt cards = 53 - (7 - a) = 46 + a.
   weightedNoPrizedSingleton+=initialWays*choose(46+a,6);
  }
 }
 const noSingletonPrized=Number(weightedNoPrizedSingleton)/
   Number(validInitial*choose(53,6));
 assert.ok(Math.abs(noSingletonPrized-0.4536122210550233)<1e-12);
 // An ACE SPEC has one physical copy. If it wasn't in the initial seven,
 // its conditional probability of being among six of the 53 undealt is 6/53.
 let aceAbsentInitialWays=0n;
 for(let basics=1;basics<=basicCount;basics++){
  aceAbsentInitialWays+=choose(basicCount,basics)*
    choose(53,7-basics);
 }
 const acePrized=Number(aceAbsentInitialWays*6n)/
   Number(validInitial*53n);
 assert.ok(Math.abs(acePrized-0.1012428890254701)<1e-12);
});
