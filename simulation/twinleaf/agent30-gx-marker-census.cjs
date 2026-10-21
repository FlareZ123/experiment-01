'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const path=require('node:path');

/**
 * Descriptive inventory of printed -GX attack names missing the pinned
 * native gxAttack marker. This spans the current CardManager catalog, whose
 * membership is NOT a verified list of paper Expanded-legal printings.
 * @returns {object}
 */
function gxMarkerCensus(){
  const all=initializeCards().getAllCards();
  const {PokemonCard}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card'));
  const pokemon=all.filter(card=>card instanceof PokemonCard);
  const candidates=[];
  for(const card of pokemon){
    for(const attack of card.attacks??[]){
      if(!attack?.name?.endsWith('-GX'))continue;
      candidates.push({
        printing:card.fullName,
        attackName:attack.name,
        gxAttackNative:attack.gxAttack===true,
        hasPrintedQuotaText:/more than 1 GX attack/i.test(attack.text??'')
      });
    }
  }
  const missing=candidates.filter(row=>!row.gxAttackNative);
  const marked=candidates.filter(row=>row.gxAttackNative);
  const inconsistent=candidates.filter(row=>
    row.hasPrintedQuotaText && !row.gxAttackNative);
  assert.ok(candidates.length>0);
  assert.ok(missing.some(row=>
    row.printing==='Mewtwo & Mew-GX UNM' &&
    row.attackName==='Miraculous Duo-GX'));
  assert.ok(marked.some(row=>
    row.printing==='Gengar & Mimikyu-GX TEU' &&
    row.attackName==='Horror House-GX'));
  return {
    schema:'agent30-native-gx-printed-suffix-census-v1',
    scope:'all pinned Twinleaf CardManager printings; not paper Expanded legality',
    totalCatalogCards:all.length,
    pokemonCards:pokemon.length,
    gxNamedAttacks:candidates.length,
    gxNamedAttacksWithNativeFlag:marked.length,
    gxNamedAttacksMissingNativeFlag:missing.length,
    quotaTextUnmarked:inconsistent.length,
    examplesMissingNativeFlag:missing.slice(0,100),
    allMissingNativeFlag:missing,
    competitiveGameQualified:false
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(gxMarkerCensus(),null,2)+'\n');
module.exports={gxMarkerCensus};
