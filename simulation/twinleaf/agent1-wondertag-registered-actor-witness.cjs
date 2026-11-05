'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-wondertag-registered-native-actor-witness-v1';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/**
 * Read only a genuine actor's trial ID and seat when an already-confirmed
 * printed Wonder Tag owner-deck Supporter choice occurs. This never reads
 * private Supporter identities: the source handler independently obtains
 * its legitimate owner search choices after the native prompt opens.
 *
 * @param {object} [deps] Optional native fixtures.
 * @returns {{run:(next:Function)=>unknown,selectSupporterIndex:Function,
 *   audit:object}}
 */
function createWonderTagRegisteredActorWitness(deps={}){
  const native=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(native,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const headless=deps.headless??require('./headless.cjs');
  const audit={version:VERSION,observedSearchDecisionCount:0,
    decisions:[],privateDeckNamesPublished:false,
    originalSourceEffectCertified:false,
    competitiveGamesQualified:0};
  let activeTrialId=null;
  let activeActorSeat=null;
  let live=false;

  /** @param {{globalTurn:number,choices:ReadonlyArray<object>}} context */
  function selectSupporterIndex(context){
    assert.equal(live,true);
    assert.ok(activeTrialId!==null,'Wonder Tag owner search outside registered native trial');
    assert.ok(activeActorSeat===0||activeActorSeat===1,
      'Wonder Tag owner search must arise within an authenticated actor decision');
    assert.ok(Array.isArray(context?.choices)&&
      Number.isSafeInteger(context.globalTurn));
    const nonempty=context.choices.length>0;
    audit.observedSearchDecisionCount++;
    audit.decisions.push({
      id:activeTrialId,actorSeat:activeActorSeat,
      globalTurn:context.globalTurn,
      answerCardinality:nonempty?1:0,
      ownerDeckPrintingsOmitted:true
    });
    return nonempty?0:-1;
  }

  /** @param {()=>unknown} next */
  function run(next){
    assert.equal(typeof next,'function');
    assert.equal(live,false);
    const priorRun=Object.getOwnPropertyDescriptor(headless,'runMatch');
    const priorDecode=Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction');
    assert.equal(typeof priorRun?.value,'function');
    assert.equal(typeof priorDecode?.value,'function');
    assert.equal(priorRun.configurable,true);
    assert.equal(priorDecode.configurable,true);
    function nativeRun(options,...args){
      assert.equal(activeTrialId,null,'Nested native runs have ambiguous trial attribution');
      assert.ok(options&&typeof options.label==='string'&&
        options.label.startsWith(PREFIX),'Unregistered native Store label');
      activeTrialId=options.label.slice(PREFIX.length);
      try{
        return priorRun.value.apply(this,[options,...args]);
      }finally{
        activeTrialId=null;
      }
    }
    function decode(state){
      const previousSeat=activeActorSeat;
      const seat=state?.players?.findIndex(p=>p.id===this.client?.id)??-1;
      activeActorSeat=seat;
      try{return priorDecode.value.call(this,state);}
      finally{activeActorSeat=previousSeat;}
    }
    Object.defineProperty(headless,'runMatch',{...priorRun,value:nativeRun});
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
      ...priorDecode,value:decode
    });
    live=true;
    try{return next();}
    finally{
      live=false;
      activeTrialId=null;
      activeActorSeat=null;
      assert.strictEqual(headless.runMatch,nativeRun);
      assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
      Object.defineProperty(headless,'runMatch',priorRun);
      Object.defineProperty(SimpleTacticsAi.prototype,
        'decodeNextAction',priorDecode);
    }
  }
  return {run,selectSupporterIndex,audit};
}

module.exports={VERSION,PREFIX,createWonderTagRegisteredActorWitness};
