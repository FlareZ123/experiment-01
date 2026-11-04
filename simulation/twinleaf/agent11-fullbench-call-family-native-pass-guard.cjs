'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {publicBoardSnapshot}=require('./public-board-telemetry.cjs');

const VERSION='agent11-c11-fullbench-trubbish-pass-compatibility-v1';

/**
 * Flag the exact witnessed native paper-rule violation. The official C-11
 * wording says a full Bench makes Call for Family end before deck search.
 * Substituting Pass ends the turn but does not faithfully declare an attack:
 * this limited hook is developmental only, never paper qualification.
 * @param {object[]} board Read-only public snapshot of the actual Store.
 * @param {0|1} seat Actual acting owner seat.
 * @param {{constructor:{name:string},name?:string}} action Native chosen action.
 * @returns {boolean}
 */
function needsTrubbishFullBenchPass(board,seat,action){
  if(action?.constructor?.name!=='AttackAction' ||
      action.name!=='Call for Family' ||
      (seat!==0&&seat!==1))return false;
  const owner=board?.[seat];
  return owner?.active?.name==='Trubbish' &&
    Array.isArray(owner.bench) && owner.bench.length===5;
}

/**
 * Reversible compatibility shim around the acting bot's native AttackAction
 * choice. Only a genuine live Store state is transformed, never speculative
 * tactics copies. The original AttackAction is already proven in archival
 * traces to throw NO_BENCH_SLOTS_AVAILABLE; Pass is a deliberately explicit,
 * narrow counterfactual termination, not faithful attack-effect emulation.
 *
 * @template T
 * @param {()=>T} execute Actual synchronous native Store workload.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,PassTurnAction?:Function,observe?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withFullBenchTrubbishPassGuard(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const PassTurnAction=deps.PassTurnAction??
    require(path.join(base,'game/store/actions/game-actions')).PassTurnAction;
  const observe=deps.observe??publicBoardSnapshot;
  const priorDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorDecode?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  const selected=new WeakMap();
  const seenStores=new WeakSet();
  let liveStore=null;
  const audit={version:VERSION,realStoreVisits:0,guardProposals:0,
    acceptedPasses:0,rejectedPasses:0,nonLiveSkipped:0,
    bySeat:{0:0,1:0},selected:[],paperQualified:false};

  function decode(state){
    const action=priorDecode.value.call(this,state);
    if(state!==liveStore?.state){
      if(action?.constructor?.name==='AttackAction'&&action.name==='Call for Family')
        audit.nonLiveSkipped++;
      return action;
    }
    const seat=state.players?.findIndex(player=>player.id===this.client?.id)??-1;
    if(seat<0||seat>1||!needsTrubbishFullBenchPass(observe(state),seat,action))
      return action;
    const replacement=new PassTurnAction(this.client.id);
    const record={seat,turn:state.turn,sourceAttack:'Call for Family',
      sourceActive:'Trubbish',sourcePublicBenchCount:5};
    selected.set(replacement,record);
    audit.guardProposals++;
    if(audit.selected.length<32)audit.selected.push(record);
    return replacement;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!seenStores.has(this)){
      seenStores.add(this);audit.realStoreVisits++;
    }
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const evidence=this===liveStore?selected.get(action):null;
    if(!evidence)return priorDispatch.value.apply(this,[action,...args]);
    try{
      const result=priorDispatch.value.apply(this,[action,...args]);
      audit.acceptedPasses++;audit.bySeat[evidence.seat]++;
      return result;
    }catch(error){
      audit.rejectedPasses++;
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...priorDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...priorDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',priorDecode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
  }
}
module.exports={VERSION,needsTrubbishFullBenchPass,withFullBenchTrubbishPassGuard};
