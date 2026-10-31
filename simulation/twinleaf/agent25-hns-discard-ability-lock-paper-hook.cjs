'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent25-pinned-hns-discard-ability-lock-paper-hook-v1';
const pin='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=rel=>require(path.join(output,rel));

/**
 * Reversible research-side correction for the pinned Hide 'n' Sneak count.
 * Pinned countHideNSneakPokemonInDiscard counts powers by printed name
 * without invoking the existing ability lock checker. Wobbuffet, Silent
 * Lab and Garbotoxin explicitly remove Abilities in the discard pile,
 * so the original 170/30 damage threshold can be wrong.
 *
 * The patch affects only Dhelmise PBL, Sinistcha PBL and Spiritomb PBL
 * when their sole attack is used; it reuses pinned IS_ABILITY_BLOCKED
 * to retain actual lock applicability and avoids vendor file changes.
 * A full match policy and any other card engine gap remain unqualified.
 *
 * @template T
 * @param {()=>T} execute Synchronous Store test or experiment.
 * @param {object} [deps] Injection seam for pure and pinned fixture tests.
 * @returns {{result:T,audit:object}}
 */
function withCorrectedHnsDiscardAbilityCount(execute,deps={}){
  assert.equal(typeof execute,'function');
  const helper=deps.helper??load(
    'sets/11-mega-evolution/set-pitch-black/hide-n-sneak');
  const PokemonCard=deps.PokemonCard??load(
    'game/store/card/pokemon-card').PokemonCard;
  const PowerType=deps.PowerType??load(
    'game/store/card/pokemon-types').PowerType;
  const prefabs=deps.prefabs??load('game/store/prefabs/prefabs');
  const classes=deps.classes??[
    load('sets/11-mega-evolution/set-pitch-black/dhelmise').Dhelmise,
    load('sets/11-mega-evolution/set-pitch-black/sinistcha').Sinistcha,
    load('sets/11-mega-evolution/set-pitch-black/spiritomb').Spiritomb
  ];
  const previousHelper=helper.countHideNSneakPokemonInDiscard;
  assert.equal(typeof previousHelper,'function');
  assert.equal(typeof prefabs.WAS_ATTACK_USED,'function');
  assert.equal(typeof prefabs.IS_ABILITY_BLOCKED,'function');
  const audit={version:VERSION,pin,attackReducerCalls:0,
    countChecks:0,rawNamedDonors:0,effectiveDonors:0,
    suppressedDonors:0,changedThresholdOutcomes:0,
    originalHelperRestored:false,allPrototypesRestored:false,
    originalVendorFilesUnmodified:true,competitiveQualifiedGames:0};
  const saved=[],patched=[];
  try{
    for(const Card of classes){
      const proto=Card.prototype;
      const descriptor=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
      assert.equal(typeof descriptor?.value,'function',
        'missing pinned reducer '+Card.name);
      saved.push({proto,descriptor});
      function corrected(store,state,effect){
        if(!prefabs.WAS_ATTACK_USED(effect,0,this))
          return descriptor.value.call(this,store,state,effect);
        audit.attackReducerCalls++;
        const old=helper.countHideNSneakPokemonInDiscard;
        helper.countHideNSneakPokemonInDiscard=(player)=>{
          let raw=0,effective=0;
          for(const card of player.discard.cards){
            if(!(card instanceof PokemonCard))continue;
            const power=card.powers?.find(p=>
              p.powerType===PowerType.ABILITY&&
              p.name==="Hide 'n' Sneak");
            if(!power)continue;
            raw++;
            if(!prefabs.IS_ABILITY_BLOCKED(store,state,player,card,power))
              effective++;
          }
          audit.countChecks++;
          audit.rawNamedDonors+=raw;
          audit.effectiveDonors+=effective;
          audit.suppressedDonors+=raw-effective;
          if((raw>=4)!==(effective>=4)||
             (raw>=6)!==(effective>=6)||
             (raw>=13)!==(effective>=13))
            audit.changedThresholdOutcomes++;
          return effective;
        };
        try{return descriptor.value.call(this,store,state,effect);}
        finally{helper.countHideNSneakPokemonInDiscard=old;}
      }
      Object.defineProperty(proto,'reduceEffect',{...descriptor,value:corrected});
      patched.push({proto,descriptor,corrected});
    }
    return {result:execute(),audit};
  }finally{
    for(const {proto,descriptor,corrected} of patched.reverse()){
      assert.strictEqual(proto.reduceEffect,corrected,
        'overlapping Hook changed original reducer during execution');
      Object.defineProperty(proto,'reduceEffect',descriptor);
    }
    audit.allPrototypesRestored=patched.length===classes.length;
    assert.strictEqual(helper.countHideNSneakPokemonInDiscard,previousHelper,
      'HNS count helper leaked after test');
    audit.originalHelperRestored=true;
  }
}
module.exports={VERSION,pin,withCorrectedHnsDiscardAbilityCount};

