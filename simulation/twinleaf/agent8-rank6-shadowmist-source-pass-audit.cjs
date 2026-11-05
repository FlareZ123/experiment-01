'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent8-rank6-shadowmist-source-pass-actual-store-audit-v1';
const TARGET='6:100:A:champion-reference';
const PREFIX='agent41-bilateral-v2-common-policy-development-';
/**
 * Read-only posthoc instrumentation of one real original-source owner's
 * decision state before its actual Pass and after the other player's native
 * Shadow Mist AttackAction. Never exposes hidden opponent hand/card identities
 * to the live decision policy or modifies native state.
 *
 * @template T
 * @param {()=>T} execute Genuine frozen 96-root source evaluation.
 * @param {{headless?:object,Store?:Function,EnergyType?:object,TrainerType?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRank6OwnerShadowMistPassAudit(execute,deps={}){
 assert.equal(typeof execute,'function');
 const headless=deps.headless??require('./headless.cjs');
 const native=file=>require(path.resolve(__dirname,
   '../../vendor/twinleaf/ptcg-server/output',file));
 const Store=deps.Store??native('game/store/store').Store;
 const types=deps.EnergyType&&deps.TrainerType?deps:
   native('game/store/card/card-types');
 const prevMatch=headless.runMatch;
 assert.equal(typeof prevMatch,'function');
 const audit={version:VERSION,target:TARGET,matchingMatches:0,
   nativeStores:0,shadowMistAttacks:[],sourcePasses:[],
   allRegisteredMatchesDelegated:0,readsOtherActorPrivate:false,
   nativeGamesQualified:0,claimsForcedPass:false};
 function tracedMatch(request){
   const label=request?.label??'';
   if(label!==PREFIX+TARGET){
     audit.allRegisteredMatchesDelegated++;
     return prevMatch(request);
   }
   audit.matchingMatches++;
   const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
   assert.equal(typeof previous?.value,'function');
   let live=null;
   function dispatch(action,...args){
     const kind=action?.constructor?.name;
     if(kind==='AddPlayerAction'&&live===null){
       live=this;
       audit.nativeStores++;
     }
     if(this!==live||!this.state?.players?.[1])
       return previous.value.call(this,action,...args);
     const state=this.state,src=state.players[1],other=state.players[0];
     const realOwner=action?.clientId===src.id;
     const candidateAttack=kind==='AttackAction'&&
       action.clientId===other.id&&state.activePlayer===0&&
       action.name==='Shadow Mist';
     const sourcePass=kind==='PassTurnAction'&&realOwner&&
       state.activePlayer===1;
     if(sourcePass){
       const hand=src.hand.cards;
       const special=hand.filter(card=>
         card.energyType===types.EnergyType.SPECIAL).length;
       const stadium=hand.filter(card=>
         card.trainerType===types.TrainerType.STADIUM).length;
       audit.sourcePasses.push({
         turn:state.turn,sourceSeat:1,actualOwnerIdMatches:true,
         handSize:hand.length,specialEnergyInSourceHand:special,
         stadiumsInSourceHand:stadium,
         specialEnergyHandPlayLocked:
           src.cannotPlaySpecialEnergyCards===true,
         stadiumHandPlayLocked:src.cannotPlayStadiumCards===true,
         playLocksTurnsRemaining:src.playLocksTurnsRemaining,
         sourceActiveAttachedEnergyCards:src.active.energies.cards.length,
         sourceActiveDamage:src.active.damage,
         sourcePrizesRemaining:src.prizes.filter(p=>p.cards.length).length
       });
     }
     if(!candidateAttack)return previous.value.call(this,action,...args);
     const damagedBefore=src.active.damage;
     const sourceActive=src.active.getPokemonCard()?.fullName??null;
     const attacking=other.active.getPokemonCard()?.fullName??null;
     const returnValue=previous.value.call(this,action,...args);
     audit.shadowMistAttacks.push({
       turn:state.turn,candidateSeat:0,attacking,
       sourceActiveBefore:sourceActive,damageBefore:damagedBefore,
       damageAfter:src.active.damage,
       activeSourceChanged:src.active.getPokemonCard()?.fullName!==sourceActive,
       specialEnergyLockedAfter:
         src.cannotPlaySpecialEnergyCards===true,
       stadiumLockedAfter:src.cannotPlayStadiumCards===true,
       lockTurnsAfter:src.playLocksTurnsRemaining
     });
     return returnValue;
   }
   Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
   try{return prevMatch(request);}
   finally{
     assert.strictEqual(Store.prototype.dispatch,dispatch);
     Object.defineProperty(Store.prototype,'dispatch',previous);
   }
 }
 headless.runMatch=tracedMatch;
 try{return {result:execute(),audit};}
 catch(error){
   if(error&&typeof error==='object')
     error.agent8ShadowMistAudit=audit;
   throw error;
 }finally{
   assert.strictEqual(headless.runMatch,tracedMatch);
   headless.runMatch=prevMatch;
 }
}
module.exports={VERSION,TARGET,PREFIX,withRank6OwnerShadowMistPassAudit};
