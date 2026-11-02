'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-rank30-real-store-fund-retreat-rondo-v1';

/**
 * Reversible original pinned Store execution-time observed-pass fork.
 * Observe only genuinely dispatched first-source, owner-public action roots.
 * The intervention, when explicitly enabled, is on that owner's own first
 * PassTurnAction after its naturally attached second Psychic on Clefairy.
 * All action success/failure and opponent replies remain native Store results.
 *
 * @template T
 * @param {()=>T} execute Original source game function.
 * @param {{sourceSeat:0|1,targetTurn:number,treatment:boolean}} config
 * @returns {{result:T,audit:object}}
 */
function withRank30FundedRondoPassFork(execute,config){
  assert.equal(typeof execute,'function');
  assert.ok(config.sourceSeat===0||config.sourceSeat===1);
  assert.ok(Number.isSafeInteger(config.targetTurn)&&config.targetTurn>0);
  const base=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(base,name));
  const {Store}=engine('game/store/store');
  const {CheckRetreatCostEffect}=engine('game/store/effects/check-effects');
  const {RetreatAction,AttackAction}=
    engine('game/store/actions/game-actions');
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  // The canonical runner constructs two genuine Stores in one A/B group.
  // AddPlayerAction is not guaranteed to traverse Store.dispatch, so acquire
  // each native Store at an authenticated owner action instead.
  const perStore=new WeakMap();
  let storeOrdinal=0;
  const audit={version:VERSION,sourceSeat:config.sourceSeat,
    targetTurn:config.targetTurn,treatment:config.treatment,
    authenticPassedOwnerWindows:[],retreatAccepted:false,
    attackAccepted:false,retreatError:null,attackError:null,
    originalSourcePassCount:0,retreatCard:null,
    interceptedDispatches:0,dispatchWindowSamples:[],
    neverReadOpponentConcealedZones:true};

  function dispatch(action,...args){
    const state=this.state,source=state?.players?.[config.sourceSeat];
    const actionKind=action?.constructor?.name;
    // Twinleaf action roots carry clientId (or id), while prompt actions
    // carry playerId on the pending prompt. A nonexistent action.playerId
    // incorrectly made every authentic source root fail the owner test.
    const actionOwnerId=action?.clientId??action?.id??action?.playerId;
    audit.interceptedDispatches++;
    if(Number.isInteger(state?.turn)&&
       state.turn>=config.targetTurn-1&&
       state.turn<=config.targetTurn+2&&
       audit.dispatchWindowSamples.length<24&&
       (actionKind==='PassTurnAction'||
        (source?.id===actionOwnerId&&
         ['PlayCardAction','AttackAction','RetreatAction'].includes(actionKind)))){
      audit.dispatchWindowSamples.push({storeTurn:state.turn,
        activePlayer:state.activePlayer,sourceSeat:config.sourceSeat,
        sourceId:source?.id??null,actionPlayerId:actionOwnerId??null,
        actionKind});
    }
    const sourceTurn=source?.id===actionOwnerId&&
      state.activePlayer===config.sourceSeat&&
      state.turn===config.targetTurn;
    if(sourceTurn&&actionKind==='PassTurnAction'){
      let session=perStore.get(this);
      if(!session){
        session={ordinal:++storeOrdinal,retreated:false,attacked:false};
        perStore.set(this,session);
      }
      audit.originalSourcePassCount++;
      const active=source.active.getPokemonCard();
      const bench=source.bench.flatMap((slot,index)=>{
        const poke=slot.getPokemonCard();
        return poke?.fullName==="Lillie's Clefairy ex JTG"&&
          slot.energies.cards.filter(c=>c.fullName.startsWith('Psychic Energy ')).length>=2?
          [{index,printing:poke.fullName,
            energies:slot.energies.cards.map(c=>c.fullName)}]:[];
      });
      if(!session.retreated&&bench.length>0){
        const check=new CheckRetreatCostEffect(source);
        this.reduceEffect(state,check);
        const window={globalTurn:state.turn,storeOrdinal:session.ordinal,
          sourceSeat:config.sourceSeat,
          nativeActionProposed:actionKind,
          activePrinting:active?.fullName??null,
          activeAbilities:active?.powers?.map(p=>p.name)??[],
          ownBenchTarget:bench[0],
          nativeCheckRetreatCost:check.cost.length,
          activeConditions:[...(source.active.specialConditions??[])],
          retreatCount:source.retreatCount??null,
          sourcePlayerRestrictions:{
            cannotRetreat:source.cannotRetreat??null,
            cannotPlayPokemon:source.cannotPlayPokemonCards??null},
          ownPrizes:source.prizes.reduce((n,p)=>n+p.cards.length,0),
          opponentPublicActive:
            state.players[1-config.sourceSeat].active.getPokemonCard()?.fullName??null,
          sourceHandCount:source.hand.cards.length,
          targetActualOwnerId:source.id};
        audit.authenticPassedOwnerWindows.push(window);
        if(config.treatment&&check.cost.length===0&&
           source.active.specialConditions?.includes('ASLEEP')!==true&&
           source.active.specialConditions?.includes('PARALYZED')!==true){
          try{
            const result=previous.value.apply(this,[
              new RetreatAction(source.id,bench[0].index),...args]);
            session.retreated=true;audit.retreatAccepted=true;
            audit.retreatCard=source.active.getPokemonCard()?.fullName??null;
            return result;
          }catch(error){
            audit.retreatError=String(error?.stack??error).slice(0,1400);
            throw error;
          }
        }
      }
      if(config.treatment&&session.retreated&&!session.attacked&&
         source.active.getPokemonCard()?.fullName===
           "Lillie's Clefairy ex JTG"){
        try{
          const target=state.players[1-config.sourceSeat].active;
          const before=target.damage;
          const result=previous.value.apply(this,[
            new AttackAction(source.id,'Full Moon Rondo'),...args]);
          session.attacked=true;audit.attackAccepted=true;
          audit.opponentActiveDamageAtAttack={
            before,after:target.damage,
            printing:target.getPokemonCard()?.fullName??null};
          return result;
        }catch(error){
          audit.attackError=String(error?.stack??error).slice(0,1400);
          throw error;
        }
      }
    }
    return previous.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent6Rank30RondoAudit={...audit};throw error;}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,withRank30FundedRondoPassFork};
