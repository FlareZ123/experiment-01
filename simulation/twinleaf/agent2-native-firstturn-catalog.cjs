'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  scanFirstTurnAttacks
}=require('../../scripts/agent2-firstturn-attack-vocabulary.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent2-native-firstturn-printed-coverage-v1';
const SPECIAL_CODE={smp:'SMP',xyp:'XYP'};

/**
 * Print the strict distinction between archive card availability and a
 * *registered* native Pokémon/attack. Native presence still does not
 * certify reducer effects, rules, legality or tactical merit.
 *
 * @param {object} catalogOwner A real initialized Twinleaf CardManager
 * @param {string} [root] Supplied card archive repository root
 * @returns {object} Bounded printable coverage for 29 first-turn families
 */
function auditNativeFirstTurnPrintedCoverage(catalogOwner,root=ROOT){
  assert.ok(catalogOwner&&typeof catalogOwner.getCardByName==='function');
  const printings=scanFirstTurnAttacks(root);
  const sets=JSON.parse(fs.readFileSync(
    path.join(root,'resources','sets','en.json'),'utf8'));
  const idToCode=new Map(sets.filter(x=>x.ptcgoCode)
    .map(x=>[x.id,x.ptcgoCode]));
  for(const [id,code] of Object.entries(SPECIAL_CODE))
    idToCode.set(id,code);
  const families=printings.firstTurnAttackFamilies.map(family=>{
    const printCoverage=family.printings.map(id=>{
      const hyphen=id.indexOf('-');
      assert.ok(hyphen>0,'Malformed exact archive printing '+id);
      const setId=id.slice(0,hyphen);
      const code=idToCode.get(setId)??null;
      const officialPrinting=code?family.card+' '+code:null;
      const nativeCard=officialPrinting?
        catalogOwner.getCardByName(officialPrinting):null;
      const nativeAttack=nativeCard?.attacks?.find(x=>
        x.name===family.attack)??null;
      return {
        id,printName:officialPrinting,codeResolved:code!==null,
        nativeCardRegistered:nativeCard!==null,
        nativeAttackRegistered:nativeAttack!==null,
        nativeCanUseOnFirstTurn:nativeAttack?.canUseOnFirstTurn===true,
        printedTextPresentInNative:
          typeof nativeAttack?.text==='string'&&
          nativeAttack.text.trim().length>0,
        fullNativeAttackEffectsVerified:false
      };
    });
    return {
      card:family.card,attack:family.attack,
      orientation:family.orientation,
      printCoverage,
      atLeastOneNativeAttack:printCoverage.some(x=>x.nativeAttackRegistered)
    };
  });
  return {
    version:VERSION,
    sourceOriginalSixties:printings.authenticatedOriginalAichiSixties,
    originalSourceMatchingFirstTurnPrintings:
      printings.matchingOriginalSourcePrintedFirstTurnAttackCopies,
    distinctFirstTurnFamilies:families.length,
    nWithAnyNativeAttack:families.filter(x=>
      x.atLeastOneNativeAttack).length,
    familyCoverage:families,
    supportedGameMechanics:'not certified',
    paperExpandedLegality:'not certified',
    qualifiedCompetitiveGames:0
  };
}

/**
 * @returns {object} Pinned CardManager card registry coverage
 */
function main(){
  const {initializeCards}=require('./headless.cjs');
  const manager=initializeCards();
  const report=auditNativeFirstTurnPrintedCoverage(manager);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={VERSION,SPECIAL_CODE,auditNativeFirstTurnPrintedCoverage,main};
