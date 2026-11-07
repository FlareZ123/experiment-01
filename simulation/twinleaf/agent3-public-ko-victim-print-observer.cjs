'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent3-public-ko-victim-print-observer-v1';

/**
 * Passive, retrospective snapshot of the public, in-play KnockOutEffect target
 * before the native reducer moves or discards that target. It does not read
 * hands, decks, Prize faces or hidden cards, and does not alter decisions.
 * The engine's current card name/tags/HP are captured as NATIVE metadata;
 * independent paper card text/Prize-rule validation is still required.
 *
 * @template T
 * @param {()=>T} execute Actual native headless trials, synchronous.
 * @param {{rootBinding:{current:object|null,currentTrialId?:string},
 *   Store?:Function,maxRecords?:number}} deps
 * @returns {{result:T,audit:object}}
 */
function withNativePublicKoVictims(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const maxRecords=deps.maxRecords??128;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const proto=Store.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable,true);
  const audit={
    version:VERSION,eligibleNativeKoEffects:0,recordedKoVictims:[],
    omittedVictims:0,ignoredForeignOrPlayabilityKoEffects:0,
    readOnlyPublicInPlayTargets:true,readHiddenPrizeCards:false,
    alteredGameDecisionPolicy:false,paperPrizeAwardValidityCertified:false
  };
  function printedCard(card){
    return card?{
      name:card.name??null,fullName:card.fullName??null,
      set:card.set??null,setNumber:card.setNumber??null,
      stage:card.stage??null,cardTags:Array.isArray(card.tags)?
        [...card.tags]:[],printedHp:Number.isFinite(card.hp)?card.hp:null
    }:null;
  }
  function capture(state,effect){
    const ownerSeat=state.players.findIndex(p=>p.id===effect.player?.id);
    assert.ok(ownerSeat===0||ownerSeat===1);
    const target=effect.target;
    assert.ok(target&&typeof target.getPokemonCard==='function',
      'Native KO target must be an in-play PokemonCardList');
    const pokemon=target.getPokemonCard();
    assert.ok(pokemon,'Native KO target must have a public Pokemon');
    const energy=target.energies?.cards;
    assert.ok(Array.isArray(energy));
    const tools=target.tools;
    assert.ok(Array.isArray(tools));
    const location=state.players[ownerSeat].active===target?
      'active':state.players[ownerSeat].bench?.includes(target)?
        'bench':'unresolved-in-play';
    return {
      registeredTrialId:deps.rootBinding.currentTrialId??null,
      nativeTurn:state.turn,nativePhase:state.phase,
      koOwnerSeat:ownerSeat,location,
      publicVictim:printedCard(pokemon),
      evolutionCards:typeof target.getPokemons==='function'?
        target.getPokemons().map(printedCard):[],
      damageCountersValue:target.damage??null,
      targetNativeHpCache:target.hp??null,
      attachedPublicEnergyCards:energy.map(card=>({
        name:card.name??null,fullName:card.fullName??null,
        set:card.set??null,setNumber:card.setNumber??null
      })),
      attachedPublicTools:tools.map(card=>({
        name:card.name??null,fullName:card.fullName??null
      }))
    };
  }
  function reduceEffect(state,effect,...args){
    const isKo=effect?.constructor?.name==='KnockOutEffect';
    const live=this===deps.rootBinding.current &&
      this.calculatingPlayability!==true;
    const pre=isKo&&live?capture(state,effect):null;
    const returned=original.value.apply(this,[state,effect,...args]);
    if(isKo&&!live)audit.ignoredForeignOrPlayabilityKoEffects++;
    if(pre){
      audit.eligibleNativeKoEffects++;
      const row={
        ...pre,postNativePrizeCount:effect.prizeCount??null,
        preventDefault:effect.preventDefault===true,
        nonDefaultPrizeDestination:effect.prizeDestination!==undefined
      };
      if(audit.recordedKoVictims.length<maxRecords)
        audit.recordedKoVictims.push(row);
      else audit.omittedVictims++;
    }
    return returned;
  }
  Object.defineProperty(proto,'reduceEffect',{...original,value:reduceEffect});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent3PublicKoVictimAudit={...audit,aborted:true};
    throw error;
  }finally{
    Object.defineProperty(proto,'reduceEffect',original);
  }
}
module.exports={VERSION,withNativePublicKoVictims};
