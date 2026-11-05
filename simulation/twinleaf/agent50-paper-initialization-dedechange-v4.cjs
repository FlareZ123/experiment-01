'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-original-rank6-paper-initialization-dedechange-v4';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Restrict the pinned native Dedenne pre-play Ability to the paper rule in one
 * preregistered controlled state: source original rank4, owner's first ordinary
 * turn, original rank6 Active Iron Thorns ex Initialization, zero Stadiums,
 * no opposing lock-disabling owner Active. The genuine Store must still place
 * the Basic on Bench, with no Dedechange effect. This opt-in simulation-side
 * compatibility hook leaves the vendor source untouched.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store workload.
 * @param {{sourceSeat:0|1}} config
 * @returns {{result:T,audit:object}}
 */
function withPaperInitializationDedechangeV4(run,config){
  assert.equal(typeof run,'function');
  assert.ok(config?.sourceSeat===0||config?.sourceSeat===1);
  const {DedenneGX}=require(path.join(OUTPUT,
    'sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx'));
  const {PlayPokemonEffect}=require(path.join(OUTPUT,
    'game/store/effects/play-card-effects'));
  const original=Object.getOwnPropertyDescriptor(
    DedenneGX.prototype,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  const audit={version:VERSION,sourceSeat:config.sourceSeat,
    paperLockSuppressedPreplayTriggers:0,
    protectedOriginalDedennePhysicallyPlayed:0,
    ledger:[],nativeVendorModified:false,
    qualifiedCompetitiveGames:0};

  function reduceEffect(store,state,effect){
    if(effect instanceof PlayPokemonEffect &&
        effect.pokemonCard===this &&
        this.fullName==='Dedenne GX UNB' &&
        store.calculatingPlayability!==true){
      const owner=effect.player;
      const seat=state.players.findIndex(p=>p.id===owner.id);
      const opposing=seat>=0?state.players[1-seat]:null;
      const opposingActive=opposing?.active.getPokemonCard()??null;
      const sourceActive=owner.active.getPokemonCard();
      const opposingIsIronThorns=
        opposingActive?.fullName==='Iron Thorns ex TWM'&&
        opposingActive?.powers?.some(p=>p.name==='Initialization')===true;
      const noStadiums=owner.stadium.cards.length===0&&
        opposing?.stadium.cards.length===0;
      const sourceActiveIsNotLocker=
        !sourceActive?.powers?.some(p=>p.abilityLock===true);
      const printedSourceCard=owner.hand.cards.includes(this)&&
        this.hasRuleBox()&&!this.powers.some(p=>p.exemptFromInitialize===true);
      if(seat===config.sourceSeat &&
          state.turn===1&&state.activePlayer===seat&&
          opposingIsIronThorns&&noStadiums&&
          sourceActiveIsNotLocker&&printedSourceCard){
        audit.paperLockSuppressedPreplayTriggers++;
        audit.ledger.push({seat,globalTurn:state.turn,
          sourceActivePrinting:sourceActive?.fullName??null,
          opponentActivePrinting:opposingActive.fullName,
          printedCard:this.fullName,
          bothStadiumsEmpty:true,
          sourceHandContainsPhysicalDedenne:true,
          event:'deny-preplay-Dedechange-ability-only'});
        // The genuine play-pokemon reducer runs afterward and still legally
        // Bench-plays this physical Basic with no printed Ability trigger.
        return state;
      }
    }
    return original.value.call(this,store,state,effect);
  }
  Object.defineProperty(DedenneGX.prototype,'reduceEffect',{
    ...original,value:reduceEffect});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent50PaperInitializationAudit={
        ...audit,ledger:audit.ledger.map(x=>({...x})),aborted:true};
    throw error;
  }finally{
    assert.strictEqual(DedenneGX.prototype.reduceEffect,reduceEffect);
    Object.defineProperty(DedenneGX.prototype,'reduceEffect',original);
  }
}
module.exports={VERSION,withPaperInitializationDedechangeV4};
