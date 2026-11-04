'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation,publicPlayer}=
  require('./actor-observation-contract.cjs');

const VERSION='agent5-rank1-native-twoitem-ace-owner-afterpass-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const PRINT=Object.freeze({
  blower:'Field Blower GRI',catcher:'Counter Catcher PAR',
  ace:'Ace Trainer AOR',float:'Float Stone BKT',
  vmax:'Shadow Rider Calyrex VMAX CRE'
});
const MODES=Object.freeze(['control-original','two-item-trap',
  'two-item-ace','control-repeat']);

/**
 * A single retrospective, true-Store candidate decision on exact source seat.
 * Does not read hidden opponent hand/deck/Prizes when choosing an action.
 *
 * @template T
 * @param {()=>T} execute A synchronous original physical Store runner.
 * @param {string} mode Registered experiment mode.
 * @param {object} [deps] Native dependency injections for narrow tests.
 * @returns {{result:T,audit:object}}
 */
function withRank1AceTrapFork(execute,mode,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(MODES.includes(mode));
  const native=relative=>require(path.join(OUTPUT,relative));
  const {Store}=deps.Store?{Store:deps.Store}:native('game/store/store');
  const {SimpleTacticsAi}=deps.SimpleTacticsAi?
    {SimpleTacticsAi:deps.SimpleTacticsAi}:
    native('simple-bot/simple-tactics-ai');
  const {GamePhase}=deps.GamePhase?{GamePhase:deps.GamePhase}:
    native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=deps.PlayCardAction?
    deps:native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.ResolvePromptAction?
    {ResolvePromptAction:deps.ResolvePromptAction}:
    native('game/store/actions/resolve-prompt-action');
  const observe=deps.observe??actorObservation;
  const aiDescriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatchDescriptor=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof aiDescriptor?.value,'function');
  assert.equal(typeof dispatchDescriptor?.value,'function');

  let live=null,stage=0,initialProposed=false,initialEligible=false;
  const proposals=new WeakMap();
  const audit={
    version:VERSION,mode,onlyHistoricalTrial:true,
    candidateSeat:0,sourceSeat:1,requiredTurn:37,
    eligibleOriginalPasses:0,unqualifiedStoreAttempts:0,
    selectedItemCount:0,storeAccepted:0,storeRejected:0,
    targetedPromptAccepted:0,requiredTargetAbsent:0,
    skippedNativeNonpass:0,proposalPurityObserved:[],
    stageAfterRun:0,events:[],sourceHiddenHandUsedByPolicy:false,
    competitiveGamesQualified:0
  };
  const log=x=>{
    if(audit.events.length<40)audit.events.push(x);
  };
  function sameLive(state,bot){
    return live?.state===state&&state.activePlayer===0&&
      state.turn===37&&state.phase===GamePhase.PLAYER_TURN&&
      state.players?.[0]?.id===bot.client?.id;
  }
  function targetVmax(state,position){
    const zone=position==='bench'?state.players[1].bench[3]:
      state.players[1].active;
    return zone?.getPokemonCard?.()?.fullName===PRINT.vmax?zone:null;
  }
  function scorePublicEvidence(state){
    const source=publicPlayer(state.players[1]);
    const cand=publicPlayer(state.players[0]);
    return {
      candidatePrizes:cand.prizeCount,sourcePrizes:source.prizeCount,
      candidateBench:cand.bench.filter(Boolean).length,
      sourceBench:source.bench.filter(Boolean).length,
      sourceActive:source.active?.printing??null,
      sourceBench3:source.bench[3]?.printing??null,
      sourceBench3Tools:source.bench[3]?.tools??[],
      sourceActiveEnergies:source.active?.energies??[]
    };
  }
  function itemAction(state,printing,kind){
    const view=observe(state,0);
    assert.equal(view.decisionKind,'owner-root');
    const index=view.ownHand.indexOf(printing);
    assert.ok(index>=0,'Registered physical owner-held card absent: '+printing);
    assert.equal(view.ownTurnResources.itemPlayLocked,false,
      'Item lock blocks selected native fork');
    if(kind==='ace') {
      assert.ok(view.ownPublic.prizeCount>view.opponentPublic.prizeCount);
      assert.equal(view.ownTurnResources.supporterPlayedTurn,0);
    }else if(kind==='catcher'){
      assert.ok(view.ownPublic.prizeCount>view.opponentPublic.prizeCount);
    }
    const action=new PlayCardAction(state.players[0].id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposals.set(action,{kind,printing,turn:state.turn,index});
    audit.selectedItemCount++;
    log({kind:'proposed-'+kind,handIndex:index,turn:state.turn,
      public:scorePublicEvidence(state)});
    return action;
  }
  function ownerPrompt(state,prompt){
    if(stage!==1&&stage!==2)return null;
    if(prompt.playerId!==state.players[0].id||
       prompt.constructor?.name!=='ChoosePokemonPrompt')return null;
    const one=targetVmax(state,'bench');
    if(!one){
      audit.requiredTargetAbsent++;
      throw new Error('Expected source Bench3 VMAX target absent at '+stage);
    }
    const candidate=[one];
    assert.equal(prompt.validate(candidate,state),true,
      'Printed target was not accepted by native prompt');
    const action=new ResolvePromptAction(prompt.id,candidate);
    proposals.set(action,{kind:stage===1?'tool-target':'catcher-target',
      printing:PRINT.vmax,turn:state.turn,index:3});
    log({kind:'proposed-prompt',stage,prompt:prompt.message,
      public:scorePublicEvidence(state)});
    return action;
  }
  function decode(state,...args){
    if(mode==='control-original'||mode==='control-repeat'||
       !sameLive(state,this))
      return aiDescriptor.value.apply(this,[state,...args]);
    const prompt=state.prompts?.find(p=>p.result===undefined)??null;
    if(prompt){
      const chosen=ownerPrompt(state,prompt);
      return chosen??aiDescriptor.value.apply(this,[state,...args]);
    }
    if(stage===1){
      const source=state.players[1];
      assert.equal(targetVmax(state,'bench')?.tools?.length,0,
        'Field Blower failed to remove registered Float Stone');
      assert.ok(source.discard.cards.some(c=>c.fullName===PRINT.float),
        'Removed Tool missing from source discard');
      return itemAction(state,PRINT.catcher,'catcher');
    }
    if(stage===2){
      assert.ok(targetVmax(state,'active'),
        'Counter Catcher did not gust one-Psychic source VMAX');
      assert.equal(state.players[1].active.energies.cards.length,1);
      if(mode==='two-item-ace')return itemAction(state,PRINT.ace,'ace');
      stage=3;
      log({kind:'two-item-only-released-to-original',turn:state.turn,
        public:scorePublicEvidence(state)});
    }
    if(stage===3)return aiDescriptor.value.apply(this,[state,...args]);
    const beforeSupporter=state.players[0].supporterTurn;
    const proposal=aiDescriptor.value.apply(this,[state,...args]);
    const afterSupporter=state.players[0].supporterTurn;
    if(proposal?.constructor?.name!=='PassTurnAction'){
      audit.skippedNativeNonpass++;
      return proposal;
    }
    audit.eligibleOriginalPasses++;
    audit.proposalPurityObserved.push({
      beforeSupporter,afterSupporter,changed:beforeSupporter!==afterSupporter
    });
    const view=observe(state,0);
    if(view.ownPublic.prizeCount!==6||
       view.opponentPublic.prizeCount!==1||
       !targetVmax(state,'bench')||
       targetVmax(state,'bench').energies.cards.length!==1||
       !targetVmax(state,'bench').tools.some(c=>c.fullName===PRINT.float)||
       view.ownPublic.bench.filter(Boolean).length!==5){
      return proposal;
    }
    initialEligible=true;
    initialProposed=true;
    return itemAction(state,PRINT.blower,'blower');
  }
  function dispatch(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction'&&
       this.state.players?.length===1&&
       this.state.players[0].id===101)live=this;
    const paid=proposals.get(action);
    try{
      const result=dispatchDescriptor.value.call(this,action,...args);
      if(paid){
        audit.storeAccepted++;
        if(paid.kind==='blower')stage=1;
        if(paid.kind==='catcher')stage=2;
        if(paid.kind==='ace')stage=3;
        if(paid.kind==='tool-target'||paid.kind==='catcher-target')
          audit.targetedPromptAccepted++;
        log({kind:'store-accepted',action:paid.kind,
          public:scorePublicEvidence(this.state)});
      }
      return result;
    }catch(error){
      if(paid){
        audit.storeRejected++;
        log({kind:'store-rejected',action:paid.kind,
          error:String(error?.message??error)});
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...aiDescriptor,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchDescriptor,value:dispatch});
  try{
    const result=execute();
    audit.initialEligible=initialEligible;
    audit.initialProposed=initialProposed;
    audit.stageAfterRun=stage;
    return {result,audit};
  }catch(error){
    audit.initialEligible=initialEligible;
    audit.initialProposed=initialProposed;
    audit.stageAfterRun=stage;
    if(error&&typeof error==='object')error.agent5Rank1AceTrapAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',dispatchDescriptor);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',aiDescriptor);
  }
}

module.exports={VERSION,PRINT,MODES,withRank1AceTrapFork};
