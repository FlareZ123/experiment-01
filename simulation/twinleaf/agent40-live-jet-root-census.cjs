'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {choosePublicJetBenchSwitch,VERSION:JET_VERSION}=
  require('./agent40-public-jet-bench-frontier.cjs');

const VERSION='agent40-native-live-owner-jet-opportunity-census-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Read only public native card definitions, not anyone's future deck or Prize
 * identities. This catalogue is identical for both actors and all trials.
 * @returns {object}
 */
function publicCardCatalog(){
  const manager=require('./headless.cjs').initializeCards();
  const native=x=>require(path.join(OUTPUT,x));
  return require('./agent34-actor-only-root-policy.cjs')
    .buildActorCardCatalog(manager.getAllCards(),{
      PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
      EnergyCard:native('game/store/card/energy-card').EnergyCard,
      ...native('game/store/card/card-types'),
      PowerType:native('game/store/card/pokemon-types').PowerType
    });
}

/**
 * Passive, reversible instrumentation around a genuine Store match.
 * Proposals are sidecar diagnostics and never overwrite the bot's action,
 * resolve a prompt, or read any owner's unknown deck/Prize identities.
 *
 * @template T
 * @param {()=>T} execute Synchronous native match.
 * @param {{trackedSeat?:0|1,SimpleTacticsAi?:Function,Store?:Function,
 *   GamePhase?:object,observe?:Function,catalog?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withLiveJetRootCensus(execute,deps={}){
  assert.equal(typeof execute,'function');
  const trackedSeat=deps.trackedSeat??null;
  assert.ok(trackedSeat===null||trackedSeat===0||trackedSeat===1);
  const native=x=>require(path.join(OUTPUT,x));
  const Bot=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const GamePhase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const observe=deps.observe??actorObservation;
  const oldDecode=Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null,catalog=deps.catalog??null;
  const bySeat={
    0:{roots:0,heldJetRoots:0,proposedJetRoots:0},
    1:{roots:0,heldJetRoots:0,proposedJetRoots:0}
  };
  const audit={
    schema:VERSION,jetPolicyVersion:JET_VERSION,
    trackedSeat,realStoreObserved:false,bySeat,
    sourceHeldRootExamples:[],sourceProposalExamples:[],
    gamesQualifiedForStrength:0,actionPolicyChanged:false,
    noOpponentPrivateZoneInspection:true,
    cappedExamples:24,
    caveat:'Observer only, with baseline bot decisions. No native acceptance or source win claim for an unplayed proposal.'
  };
  function decode(state,...args){
    let extra=null;
    if(liveStore?.state===state&&
       state.phase===GamePhase.PLAYER_TURN&&
       !state.prompts?.some(p=>p.result===undefined)){
      const seat=state.players?.findIndex(p=>p.id===this.client?.id);
      if((seat===0||seat===1)&&state.activePlayer===seat&&
         (trackedSeat===null||trackedSeat===seat)){
        const v=observe(state,seat),counts=bySeat[seat];
        counts.roots++;
        const held=v.ownHand.filter(x=>x.startsWith('Jet Energy '));
        if(held.length){
          counts.heldJetRoots++;
          catalog??=publicCardCatalog();
          const proposed=choosePublicJetBenchSwitch(v,catalog);
          if(proposed)counts.proposedJetRoots++;
          extra={seat,globalTurn:v.globalTurn,
            sourceHeldJet:held.map(p=>({printing:p})),
            active:v.ownPublic.active?.name??null,
            benchCount:v.ownPublic.bench.filter(Boolean).length,
            publicOpponentActive:v.opponentPublic.active?.name??null,
            proposed:proposed??null};
        }
      }
    }
    const decision=oldDecode.value.apply(this,[state,...args]);
    if(extra){
      const receipt={...extra,baselineAction:decision?.constructor?.name??null};
      if(audit.sourceHeldRootExamples.length<audit.cappedExamples)
        audit.sourceHeldRootExamples.push(receipt);
      if(extra.proposed&&audit.sourceProposalExamples.length<audit.cappedExamples)
        audit.sourceProposalExamples.push(receipt);
    }
    return decision;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      audit.realStoreObserved=true;
    }
    return oldDispatch.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Bot.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent40JetCensus=audit;throw error;}
  finally{
    assert.strictEqual(Bot.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Bot.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,publicCardCatalog,withLiveJetRootCensus};
