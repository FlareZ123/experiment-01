'use strict';

const assert = require('node:assert/strict');
const {planElectroRainDamage} =
  require('../simulation/twinleaf/raichu-prize-allocation-resolver.cjs');

/** A pure public-board test double, without vendor engine or private zones. */
function caseState({sight=true, jamming=false, budget=16}={}) {
  const codes={attackPhase:3, opponentSide:1, activeSlot:1, benchSlot:2};
  const mkPokemon=(name,hp,tags)=>({fullName:name,hp,tags});
  const mkSlot=(pokemon)=>({
    hp:pokemon.hp,
    hpBonus:0,
    damage:0,
    tools:[],
    denyPrizesIfKnockedOutNextTurn:false,
    extraPrizesIfKnockedOutNextTurn:0,
    getPokemonCard:()=>pokemon
  });
  const own = {
    id:101,
    active: {
      tools:sight?[{fullName:'Telescopic Sight VIV'}]:[],
      getPokemonCard:()=>mkPokemon('Alolan Raichu UNM',110,[])
    },
    stadium:{cards:[]},
    getPrizeLeft:()=>6
  };
  const opp = {
    id:202,
    active:mkSlot(mkPokemon('Shadow Rider Calyrex V CRE',210,['V'])),
    bench:[
      mkSlot(mkPokemon('Shadow Rider Calyrex VMAX CRE',320,['VMAX'])),
      mkSlot(mkPokemon('Shadow Rider Calyrex V CRE',210,['V']))
    ],
    stadium:{cards:jamming?[{name:'Jamming Tower'}]:[]},
    forEachPokemon(_side,callback) {
      const all=[{list:this.active,slot:1,index:0},
        ...this.bench.map((list,index)=>({list,slot:2,index}))];
      for(const row of all) {
        callback(row.list,row.list.getPokemonCard(),
          {player:1,slot:row.slot,index:row.index});
      }
    }
  };
  const state={phase:3,players:[own,opp]};
  const totalDamage=budget*30;
  const targets=[
    {player:1,slot:1,index:0},
    {player:1,slot:2,index:0},
    {player:1,slot:2,index:1}
  ];
  const hp=[210,320,210];
  const prompt={
    playerId:101,playerType:1,damage:totalDamage,
    options:{damageMultiple:30,blocked:[]},
    slots:[1,2],
    maxAllowedDamage:targets.map((target,index)=>({
      target,damage:hp[index]+totalDamage
    })),
    validate(result){
      return result.every(row=>row.damage>0 && row.damage%30===0 &&
        targets.some(t=>t.player===row.target.player &&
        t.slot===row.target.slot && t.index===row.target.index)) &&
        result.reduce((sum,row)=>sum+row.damage,0)===totalDamage;
    }
  };
  return {state,own,prompt,codes};
}

function test() {
  const full=caseState();
  const plan=planElectroRainDamage(full.state,full.own,full.prompt,full.codes);
  assert.deepEqual(plan.map(({target,damage}) =>
    [target.slot,target.index,damage]), [[2,0,300],[2,1,180]]);

  const noSight=caseState({sight:false});
  const without=planElectroRainDamage(noSight.state,noSight.own,noSight.prompt,noSight.codes);
  assert.ok(without);
  assert.notDeepEqual(without,plan);
  assert.equal(without.reduce((sum,row)=>sum+row.damage,0),480);

  const jamming=caseState({jamming:true});
  const disabled=planElectroRainDamage(jamming.state,jamming.own,jamming.prompt,jamming.codes);
  assert.deepEqual(disabled,without);

  const notRaichu=caseState();
  notRaichu.own.active.getPokemonCard=()=>
    ({fullName:'Crobat V DAA',hp:180,tags:['V']});
  assert.equal(planElectroRainDamage(notRaichu.state,notRaichu.own,
    notRaichu.prompt,notRaichu.codes),null);

  const insufficient=caseState({budget:1});
  assert.equal(planElectroRainDamage(insufficient.state,insufficient.own,
    insufficient.prompt,insufficient.codes),null);
  return {full,without,disabled};
}

const result=test();
console.log(JSON.stringify({
  passed:true,
  multiTargetResult:result.full.prompt.damage,
  noToolDamageRows:result.without,
  jammingTowerRows:result.disabled,
  warning:'Pure projected policy math, not a pinned attack or win-rate test'
},null,2));
