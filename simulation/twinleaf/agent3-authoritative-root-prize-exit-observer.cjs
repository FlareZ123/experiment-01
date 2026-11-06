'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent3-authoritative-root-prize-exit-v1';

/**
 * Passive physical Prize-zone exit inventory on the actual headless Store.
 * This captures every successful outer dispatch, including automatic Prize
 * taking without a ChoosePrizePrompt. Prize exits do NOT prove Knock Outs:
 * returning a Prize with Gladion, rearrangement, game reset and other card
 * effects require separate classification. No concealed card faces are read.
 *
 * @template T
 * @param {()=>T} execute Native experiment.
 * @param {{Store?:Function,rootBinding:{current:object|null},
 *   maxRecords?:number}} deps
 * @returns {{result:T,audit:object}}
 */
function withAuthoritativeRootPrizeExitObserver(execute,deps) {
  assert.equal(typeof execute,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??
    require(path.join(output,'game/store/store')).Store;
  const maxRecords=deps.maxRecords??128;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const proto=Store.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable,true);

  const sessions=new WeakMap();
  let nextSession=0;
  let depth=0;
  const audit={
    version:VERSION,
    registeredRootStores:0,
    attemptedRootDispatches:0,
    successfulRootDispatches:0,
    abortedRootDispatches:0,
    rootsWithPrizeCardExit:0,
    exactPhysicalPrizeCardsExited:0,
    actionTypeCounts:{},
    byDestination:{},
    records:[],
    omittedRecords:0,
    hiddenPrizeFacesRead:false,
    inferredKoCount:null,
    qualifiesPaperPrizeAccounting:false,
    competitivelyQualifiedGames:0
  };

  function prizeCards(player){
    return Array.isArray(player?.prizes)?
      player.prizes.flatMap(slot=>Array.isArray(slot?.cards)?slot.cards:[]):[];
  }
  function preSnapshot(state){
    return (state.players??[]).map(player=>({
      playerId:player.id, cards:prizeCards(player)
    }));
  }
  function location(player,physical){
    const fields=[
      ['hand',player.hand?.cards],
      ['deck',player.deck?.cards],
      ['lost-zone',player.lostzone?.cards],
      ['discard',player.discard?.cards],
      ['active',player.active?.cards]
    ];
    for(const [kind,cards] of fields)
      if(Array.isArray(cards)&&cards.includes(physical))return kind;
    if(player.bench?.some(bench=>
      bench.cards?.includes(physical)||bench.energies?.cards?.includes(physical)))
      return 'bench';
    return 'other';
  }
  function afterRoot(store,action,before){
    const after=store.state;
    for(const previous of before){
      const owner=after.players.find(p=>p.id===previous.playerId);
      if(!owner)continue;
      const present=prizeCards(owner);
      const removed=previous.cards.filter(card=>!present.includes(card));
      if(!removed.length)continue;
      const destinations=removed.map(card=>location(owner,card));
      const byDestination={};
      for(const dest of destinations){
        byDestination[dest]=(byDestination[dest]??0)+1;
        audit.byDestination[dest]=(audit.byDestination[dest]??0)+1;
      }
      const actionType=action?.constructor?.name??'unknown';
      audit.rootsWithPrizeCardExit++;
      audit.exactPhysicalPrizeCardsExited+=removed.length;
      audit.actionTypeCounts[actionType]=(audit.actionTypeCounts[actionType]??0)+1;
      const record={
        session:sessions.get(store),
        ownerSeat:after.players.findIndex(p=>p.id===owner.id),
        turn:after.turn,phase:after.phase,
        actionType,
        prePrizeCards:previous.cards.length,
        postPrizeCards:present.length,
        exactExitedCards:removed.length,
        byDestination
      };
      if(audit.records.length<maxRecords)audit.records.push(record);
      else audit.omittedRecords++;
    }
  }
  function dispatch(action,...args) {
    if(action?.constructor?.name==='AddPlayerAction' &&
       this===deps.rootBinding.current&&!sessions.has(this)) {
      sessions.set(this,++nextSession);
      audit.registeredRootStores++;
    }
    const native=this===deps.rootBinding.current&&sessions.has(this);
    const outer=native&&depth===0;
    const before=outer?preSnapshot(this.state):null;
    if(outer)audit.attemptedRootDispatches++;
    if(native)depth++;
    let returned;
    try {
      returned=original.value.apply(this,[action,...args]);
    } catch(error) {
      if(outer)audit.abortedRootDispatches++;
      throw error;
    } finally {
      if(native)depth--;
    }
    if(outer) {
      audit.successfulRootDispatches++;
      afterRoot(this,action,before);
    }
    return returned;
  }

  Object.defineProperty(proto,'dispatch',{...original,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error) {
    if(error&&typeof error==='object')
      error.agent3RootPrizeExitAudit={...audit,records:[...audit.records],aborted:true};
    throw error;
  } finally {
    Object.defineProperty(proto,'dispatch',original);
  }
}

module.exports={VERSION,withAuthoritativeRootPrizeExitObserver};
