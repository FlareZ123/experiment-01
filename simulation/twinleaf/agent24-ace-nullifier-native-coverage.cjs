'use strict';
const assert=require('node:assert/strict');
const VERSION='agent24-ace-denial-exact-native-registry-v1';
const PRINTS=[
  {printed:'Spiritomb LTR',name:'Spiritomb',set:'LTR',number:'87',
    ability:'Sealing Scream',requiredTool:false,deniesOwnAce:true},
  {printed:'Genesect SFA',name:'Genesect',set:'SFA',number:'40',
    ability:'ACE Nullifier',requiredTool:true,deniesOwnAce:false}
];

/**
 * Pure exact-printed CardManager registration audit. Native registration or
 * matching a declaration is never proof the effect actually executes.
 * @param {{getCardByName:(name:string)=>object|null}} manager
 * @returns {object}
 */
function inspect(manager){
  assert.equal(typeof manager?.getCardByName,'function');
  const results=PRINTS.map(target=>{
    const card=manager.getCardByName(target.printed);
    // The pinned native PokemonCard API calls Abilities 'powers'.
    // The supplied archive instead uses 'abilities'. Do not silently
    // declare a missing native Ability by looking in the wrong property.
    const powers=Array.isArray(card?.powers)?card.powers:[];
    const ability=powers.find(a=>a.name===target.ability);
    const nativeAcePowers=powers.filter(a=>
      /ace spec/i.test(a.text??''));
    const exactPrinting=card!=null&&card.name===target.name&&
      String(card.set).toUpperCase()===target.set&&
      String(card.setNumber)===target.number;
    return {reference:target.printed,
      nativeCardRegistered:card!=null,
      exactNativePrinting:exactPrinting,
      namedNativeAbility:ability!=null,
      nativePowerNames:powers.map(p=>p.name),
      nativeAcePowerNames:nativeAcePowers.map(p=>p.name),
      nativeAbilityText:ability?.text??null,
      nativeAcePowerTexts:nativeAcePowers.map(p=>p.text),
      nativeToolRequirement:target.requiredTool,
      ownAceBlockedByPaperText:target.deniesOwnAce,
      nativeEffectActuallySettled:false,
      realisticBenchAndToolAccessValidated:false,
      competitiveQualified:false};
  });
  return {schema:VERSION,source:'pinned Twinleaf native CardManager',
    results,competitivelyQualifiedGames:0,
    caveat:'CardManager registration is only a preliminary prerequisite; paper effect, bench exposure and opponent continuation still require actual Store tests.'};
}
function main(){
  const {initializeCards}=require('./headless.cjs');
  return inspect(initializeCards());
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,PRINTS,inspect,main};
