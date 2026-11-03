'use strict';
const assert=require('node:assert/strict');
const VERSION='agent37-naked-initialization-underworld-veto-v1';
const THORNS='Iron Thorns ex TWM';
const RIDER='Shadow Rider Calyrex VMAX CRE';
const MIMIKYU='Mimikyu GRI';

/**
 * A bounded, all-public check for the exact rank6 T8 Store-abort geometry.
 * It only withholds an optional Underworld Door proposal. The true native
 * CheckPokemonPowersEffect is still the universal legality authority.
 * Unrecognized locks, tools, extra Pokemon or Stadium interactions abstain.
 * @param {object} view Detached authenticated actor root observation.
 * @param {object} intent Already selected native-neutral owner root proposal.
 * @returns {object|null} Exact public veto certificate or null.
 */
function nakedInitializationVeto(view,intent){
  assert.equal(view?.decisionKind,'owner-root');
  if(intent?.kind!=='use-underworld-door')return null;
  const own=view.ownPublic,foe=view.opponentPublic;
  if(own?.active?.printing!==MIMIKYU||
    foe?.active?.printing!==THORNS)return null;
  const ownBench=own.bench?.filter(Boolean);
  const foeBench=foe.bench?.filter(Boolean);
  if(ownBench?.length!==1||foeBench?.length!==1||
    ownBench[0]?.printing!==RIDER||
    foeBench[0]?.printing!==THORNS)return null;
  if(intent.position!=='bench'||!Number.isSafeInteger(intent.benchIndex)||
    own.bench[intent.benchIndex]!==ownBench[0])return null;
  if((own.stadium?.length??0)!==0||
    (foe.stadium?.length??0)!==0)return null;
  for(const pokemon of [own.active,ownBench[0],foe.active,foeBench[0]]){
    if(!Array.isArray(pokemon?.tools)||pokemon.tools.length!==0)
      return null;
  }
  if(!ownBench[0].abilities?.includes('Underworld Door')||
    !foe.active.abilities?.includes('Initialization'))return null;
  return {
    schema:VERSION,reason:'naked-opposing-active-initialization',
    sourcePrinting:RIDER,lockPrinting:THORNS,
    ownerViewOnly:true,nativeEffectVerified:false,
    sourceT8CausalActionNameVerified:false
  };
}
module.exports={VERSION,nakedInitializationVeto};
