'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=modulePath=>require(path.join(output,modulePath));
const VERSION='agent15-native-source-rank31-roxie-playcard-root-observer-v1';

/**
 * Observe original source rank31's real Store PlayCard Roxie attempts
 * BEFORE payment prompts. Counts are private audit only and never policy
 * inputs. Uses the first AddPlayerAction Store as the genuine game Store,
 * excluding speculative Store clones. No action is changed.
 *
 * @template T
 * @param {()=>T} run
 * @param {object} [deps] Optional constructor injections for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withRank31RoxiePlayCardRootObserver(run,deps={}) {
  assert.equal(typeof run,'function');
  const {Store}=deps.Store?{Store:deps.Store}:
    native('game/store/store');
  const {PokemonCard}=deps.PokemonCard?
    {PokemonCard:deps.PokemonCard}:
    native('game/store/card/pokemon-card');
  const {CardTag}=deps.CardTag?
    {CardTag:deps.CardTag}:
    native('game/store/card/card-types');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let liveStore=null,liveRootOrdinal=0;
  const audit={version:VERSION,liveStoreSeen:false,
    liveSourceRank31RoxiePlayCards:0,
    liveSourceRank31RoxieWithZeroEligiblePayment:0,
    liveRoxieStoreAccepted:0,liveRoxieStoreRejected:0,
    events:[],liveRootDispatches:0,auxiliaryDispatches:0,
    policyModified:false};
  const isEligible=card=>card instanceof PokemonCard&&
    !card.hasTag(CardTag.POKEMON_GX)&&
    !card.hasTag(CardTag.POKEMON_EX);
  function dispatched(action,...args) {
    const type=action?.constructor?.name;
    if(liveStore===null&&type==='AddPlayerAction') {
      liveStore=this;
      audit.liveStoreSeen=true;
    }
    if(liveStore!==this) {
      audit.auxiliaryDispatches++;
      return descriptor.value.call(this,action,...args);
    }
    const root=++liveRootOrdinal;
    audit.liveRootDispatches++;
    const sourcePlayer=this.state?.players?.[1];
    const card=type==='PlayCardAction'&&
      sourcePlayer?.id===action?.id?
      sourcePlayer.hand?.cards?.[action.handIndex]:null;
    const isRoxie=card?.fullName==='Roxie CEC';
    let event=null;
    if(isRoxie) {
      const candidates=sourcePlayer.hand.cards.filter(
        item=>item!==card&&isEligible(item));
      event={liveRootOrdinal:root,turn:this.state.turn,
        sourcePhysicalSeat:1,card:'Roxie CEC',
        physicallyEligiblePaymentCount:candidates.length,
        zeroPayment:candidates.length===0,
        acceptedByOriginalStore:false,
        error:null};
      audit.events.push(event);
      audit.liveSourceRank31RoxiePlayCards++;
      if(event.zeroPayment)
        audit.liveSourceRank31RoxieWithZeroEligiblePayment++;
    }
    try{
      const value=descriptor.value.call(this,action,...args);
      if(event) {
        event.acceptedByOriginalStore=true;
        audit.liveRoxieStoreAccepted++;
      }
      return value;
    }catch(error){
      if(event){
        audit.liveRoxieStoreRejected++;
        event.error=String(error?.message??error);
      }
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...descriptor,value:dispatched});
  try{return {result:run(),audit};}
  catch(error) {
    if(error&&typeof error==='object')
      error.agent15RoxieRootAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatched);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={VERSION,withRank31RoxiePlayCardRootObserver};
