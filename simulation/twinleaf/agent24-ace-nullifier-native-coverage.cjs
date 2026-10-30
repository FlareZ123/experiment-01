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
    const abilities=Array.isArray(card?.abilities)?card.abilities:[];
    const ability=abilities.find(a=>a.name===target.ability);
    const exactPrinting=card!=null&&card.name===target.name&&
      String(card.set).toUpperCase()===target.set&&
      String(card.setNumber)===target.number;
    return {reference:target.printed,
      nativeCardRegistered:card!=null,
      exactNativePrinting:exactPrinting,
      namedNativeAbility:ability!=null,
      nativeAbilityText:ability?.text??null,
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
