'use strict';
const assert=require('node:assert/strict');
const VERSION='agent27-lastbench-same-kind-source-v1';

/**
 * Report mutually exclusive last-Bench Basic plays from the same detached
 * owner root. The first-match current choice is not changed and the named
 * alternatives are hypothetical until the pinned Store validates them.
 *
 * @param {object} view Detached owner-only actor observation.
 * @param {{basics:Set<string>,abilityBasics:Set<string>}} catalog Public printing catalog.
 * @param {object} first The already chosen actor-root intent.
 * @returns {object|null} Potential Bench-capacity contention, or null.
 */
function lastBenchBasicConflict(view,catalog,first){
  assert.equal(view?.decisionKind,'owner-root');
  if(first?.kind!=='bench-basic')return null;
  const free=view.ownPublic?.bench?.flatMap((slot,i)=>slot===null?[i]:[])??[];
  if(free.length!==1||view.ownTurnResources?.pokemonPlayLocked===true)return null;
  const eligible=view.ownHand.map((printing,handIndex)=>({printing,handIndex,
    hasPrintedAbility:catalog.abilityBasics.has(printing)})).filter(row=>
      catalog.basics.has(row.printing)&&
      !(view.ownTurnResources?.abilityPokemonPlayLocked===true&&
        row.hasPrintedAbility));
  if(eligible.length<2)return null;
  const selected=eligible.find(row=>row.handIndex===first.handIndex&&
    row.printing===first.printing);
  assert.ok(selected,'First-return Basic must be among eligible owner-visible plays');
  assert.equal(first.benchIndex,free[0]);
  return {version:VERSION,reason:'one-remaining-bench-slot',
    benchIndex:free[0],selected,
    omitted:eligible.filter(row=>row.handIndex!==first.handIndex),
    mutuallyExclusiveWithoutBenchReset:true,
    nativePlayability:'unverified',
    opponentLockMaySuppressAbilities:true,
    strategicPreference:'not-inferred'};
}
/**
 * Narrow additive same-root proposer. Its alternative is observation-only:
 * native Bench admission and the strategic value of the chosen Basic remain
 * unverified in the general live runner.
 * @returns {object} Injection-compatible independent proposer definition.
 */
function lastBenchShadowProposer(){
  return {name:'agent27-lastbench-same-kind',
    flag:'agent27LastBenchShadow',
    propose:(view,catalog,_options,baseline)=>{
      if(view?.decisionKind!=='owner-root'||
        !(catalog?.basics instanceof Set)||
        !(catalog?.abilityBasics instanceof Set)||
        !Array.isArray(view.ownHand)||
        view.ownTurnResources?.pokemonPlayLocked===true)return [];
      const free=view.ownPublic?.bench?.flatMap((slot,i)=>
        slot===null?[i]:[])??[];
      if(free.length!==1)return [];
      const eligible=view.ownHand.flatMap((printing,handIndex)=>{
        if(!catalog.basics.has(printing)||
          (view.ownTurnResources?.abilityPokemonPlayLocked===true&&
            catalog.abilityBasics.has(printing)))return [];
        return [{printing,handIndex}];
      });
      // A same-kind baseline already consumes this exact final Bench slot;
      // retain only the other physical cards. A Pass, attack or attachment
      // baseline may overlook every Basic, even with just one eligible copy.
      const others=baseline?.kind==='bench-basic'?
        eligible.filter(row=>row.handIndex!==baseline.handIndex):eligible;
      return others.map(row=>({
        kind:'bench-basic',handIndex:row.handIndex,
        printing:row.printing,benchIndex:free[0],
        nativeDispatchImplemented:false,
        reason:baseline?.kind==='bench-basic'?
          'same-kind-final-bench-slot-exclusion':
          'unselected-final-bench-basic-opportunity',
        ...(baseline?.kind==='bench-basic'?{
          sameKindAlternativeToHandIndex:baseline.handIndex}:{}),
        nativePlayability:'unverified'
      }));
    }};
}
module.exports={VERSION,lastBenchBasicConflict,lastBenchShadowProposer};
