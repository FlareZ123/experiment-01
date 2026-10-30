'use strict';
const assert=require('node:assert/strict');
const {runArm}=require('./agent7-tinkaton-press-dte-native.cjs');

function run(){
  const arms=[];
  for(const seat of [0,1]){
    for(const printing of ['Mimikyu PAL','Mimikyu GRI']){
      for(const attackName of ['Big Hammer','Pulverizing Press']){
        const result=runArm(seat,false,false,{
          defenderPrinting:printing,attackName,handCount:8
        });
        const prizesExpected=printing==='Mimikyu PAL'&&
          attackName==='Big Hammer'?0:1;
        assert.equal(result.prizesTaken,prizesExpected,
          'Original Store must match distinct printed Mimikyu source interactions');
        arms.push({seat,printing,attackName,
          nativePrizesTaken:result.prizesTaken,
          expectedPrizes:prizesExpected,
          realNativePrompts:result.waitPrompts});
      }
    }
  }
  return {version:'agent7-tinkaton-ex-safeguard-vs-press-native-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrintings:['Tinkaton ex SVP','Mimikyu PAL','Mimikyu GRI'],
    artificialTurn3:true,actualStoreAttackDispatch:true,
    qualifiedCompetitiveGames:0,arms};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
