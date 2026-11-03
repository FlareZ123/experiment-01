'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/rank26-pump-source-conserved-fixture.cjs');
const {withRank26ExeggcutePump}=require(
  '../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs');
const {installDamagePumpSingleSourceHook}=require(
  '../simulation/twinleaf/damage-pump-single-source-hook.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=rel=>require(path.join(ROOT,rel));
const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
const {PlayCardAction}=load('game/store/actions/play-card-action');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

/** @param {0|1} seat @param {boolean} withDefenderBench */
function stage(seat,withDefenderBench=false){
  const f=fixture(seat);
  // Artificial fifth-KO opportunity: previous four opponent Prizes are
  // staged in hand; this does not claim an actual earlier legal game path.
  for(const slot of f.own.bench.slice(0,3))slot.damage=0;
  const taken=f.opponent.prizes.slice(2).flatMap(slot=>slot.cards.splice(0));
  f.opponent.hand.cards.push(...taken);
  assert.equal(f.opponent.getPrizeLeft(),2);
  assert.equal(f.own.bench[3].getPokemonCard()?.name,'Exeggcute');
  assert.equal(f.own.bench[4].getPokemonCard()?.name,'Exeggcute');
  assert.equal(f.own.bench[3].damage,20);
  assert.equal(f.own.bench[4].damage,20);
  if(withDefenderBench){
    const {PokemonCardList}=load('game/store/state/pokemon-card-list');
    const index=f.opponent.hand.cards.findIndex(c=>c.name==='Iron Thorns ex');
    assert.ok(index>=0,'source-conserved opponent has a second Iron Thorns');
    const bench=new PokemonCardList();
    bench.cards.push(f.opponent.hand.cards.splice(index,1)[0]);
    f.opponent.bench.push(bench);
  }
  return f;
}

/**
 * Native original 60-conserved board, genuine Store PlayCardAction and
 * MoveDamagePrompt, but deliberately no native Prize/KO resolution.
 * @param {0|1} seat
 * @param {{allowEggToEggFifthKo?:boolean,requireOpponentSoloActive?:boolean}} options
 * @param {boolean} [withDefenderBench=false]
 */
function probe(seat,options,withDefenderBench=false){
  const f=stage(seat,withDefenderBench);
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previous,value(){return {kind:'synthetic-fallback-marker'};}
  });
  const restore=installDamagePumpSingleSourceHook();
  try{
    const audit=withRank26ExeggcutePump(seat,()=>{
      const actor={client:{id:f.own.id}};
      const decide=()=>SimpleTacticsAi.prototype.decodeNextAction.call(
        actor,f.state);
      const first=decide();
      if(!(first instanceof PlayCardAction)){
        assert.equal(first.kind,'synthetic-fallback-marker');
        return {first:'synthetic-fallback',second:null};
      }
      assert.equal(f.own.hand.cards[first.handIndex]?.name,'Damage Pump');
      f.store.dispatch(first);
      const pending=f.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'MoveDamagePrompt');
      assert.equal(pending.playerId,f.own.id);
      assert.equal(pending.options.singleSourceTarget,true);
      const second=decide();
      assert.ok(second instanceof ResolvePromptAction);
      assert.equal(second.id,pending.id);
      assert.equal(pending.validate(second.result,f.state),true);
      assert.deepEqual(second.result,[{
        from:{player:3,slot:5,index:4},
        to:{player:3,slot:5,index:3}
      }]);
      // Leave genuine Store prompt unresolved: native engine KO, recipient
      // Prize selection and payment custody are separate pending gates.
      return {first:'genuine-PlayCardAction',
        second:'genuine-MoveDamagePrompt-selection',
        moves:second.result,
        source60PhysicalConserved:true};
    },options);
    return {result:audit.result,audit:audit.policyAudit};
  }finally{
    restore();
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previous);
  }
}

for(const seat of [0,1]){
  test('paper-constrained native source Egg-to-Egg proposal seat '+seat,()=>{
    const x=probe(seat,{
      allowEggToEggFifthKo:true,requireOpponentSoloActive:true
    });
    assert.equal(x.result.first,'genuine-PlayCardAction');
    assert.equal(x.result.second,'genuine-MoveDamagePrompt-selection');
    assert.deepEqual(x.audit.actions.map(row=>row.kind),[
      'ready-egg-to-egg-fifth-KO','egg-to-egg-fifth-KO'
    ]);
    assert.equal(x.audit.qualifiedForCompetitiveInference,false);
    console.log('AGENT3_RANK26_NATIVE_EGG_PROPOSAL',JSON.stringify({
      seat,promptResult:x.result.moves,
      source:'original rank26 physical 60 on prepared board',
      completeMoveSettled:false,competitiveGamesQualified:0
    }));
  });
  test('no opt-in leaves native source Egg donor policy unchanged seat '+seat,()=>{
    const x=probe(seat,{requireOpponentSoloActive:true});
    assert.equal(x.result.first,'synthetic-fallback');
    assert.equal(x.audit.actions.length,0);
  });
  test('public opposing Bench vetoes native source Egg donor seat '+seat,()=>{
    const x=probe(seat,{allowEggToEggFifthKo:true,
      requireOpponentSoloActive:true},true);
    assert.equal(x.result.first,'synthetic-fallback');
    assert.equal(x.audit.vetoes.length,1);
  });
}
