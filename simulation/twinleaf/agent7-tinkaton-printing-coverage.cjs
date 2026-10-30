'use strict';
const assert=require('node:assert/strict');
const deck=require('../../results/als/agent7-tinkaton-lillie-reset-v1.json');
const sets=require('../../resources/sets/en.json');
const {initializeCards}=require('./headless.cjs');
const manager=initializeCards();
const all=manager.getAllCards();
const results=deck.cards.map(c=>{
  const [setId,number]=c.id.split('-');
  const sourceSet=sets.find(s=>s.id===setId);
  assert.ok(sourceSet,'Unknown source set '+setId);
  const sameNameNumber=all.filter(x=>
    x.name===c.name && String(x.setNumber)===String(Number(number)));
  const sameName=all.filter(x=>x.name===c.name);
  return {sourceId:c.id,name:c.name,sourceSet:sourceSet.ptcgoCode,
    sourceSetName:sourceSet.name,
    sameNameNumber:sameNameNumber.map(x=>({
      nativeSet:x.set,fullName:x.fullName,number:x.setNumber
    })),
    nativeOtherNames:sameName.length,
    nativeExactCandidate:sameNameNumber.length>0};
});
const absent=results.filter(x=>!x.nativeExactCandidate);
assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
const report={version:'agent7-tinkaton-native-printing-coverage-v1',
  enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  source:'supplied English Expanded-legal 60; no Japanese event proof',
  cards:deck.cards.length,physicalCards:60,
  nameAndNumberHits:results.length-absent.length,
  nameAndNumberMissing:absent.length,
  missing:absent,
  all:results,competitiveQualifiedGames:0};
if(require.main===module)process.stdout.write(JSON.stringify(report,null,2)+'\n');
module.exports={report,results};
