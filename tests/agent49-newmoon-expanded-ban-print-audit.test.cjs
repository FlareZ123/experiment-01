'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const proposal=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const snapshot=require('../results/legality/japan-expanded-aichi-2026.json');
const {auditNewMoonExpandedBanPrintings}=require(
  '../simulation/evaluation/agent49-newmoon-expanded-ban-print-audit.cjs');

const cache=new Map();
function exactRecord(cardId){
  const set=cardId.split('-')[0];
  if(!cache.has(set)){
    const filepath=path.join(ROOT,'resources','cards','en',set+'.json');
    cache.set(set,JSON.parse(fs.readFileSync(filepath,'utf8')));
  }
  return cache.get(set).find(row=>row.id===cardId)??null;
}

test('frozen 60 has all exact printed English source IDs and no listed ban',()=>{
  const report=auditNewMoonExpandedBanPrintings(
    proposal,snapshot,exactRecord);
  assert.equal(report.fixed60Copies,60);
  assert.equal(report.distinctProxyCardIds,34);
  assert.equal(report.snapshotBanIdentities,27);
  assert.deepEqual(report.bannedPrintingsFound,[]);
  assert.deepEqual(report.expandedFlagExceptions,[]);
  assert.deepEqual(report.nonBasicNameCountViolations,[]);
  assert.equal(report.aceSpecCopies,1);
  assert.equal(report.basicEnergyCopies,3);
  assert.equal(report.radiantCount,0);
  assert.deepEqual(report.prismViolation,[]);
  assert.equal(report.proxyPassesListedSourceChecks,true);
  assert.equal(report.japaneseOriginalPrintLegalityCertified,false);
  assert.equal(report.paperCompetitiveGameQualified,false);
});

test('name-overlapping Unown and Duskull avoid banned effect identity',()=>{
  const actual=auditNewMoonExpandedBanPrintings(
    proposal,snapshot,exactRecord);
  const unown=actual.rows.find(x=>x.sourcePrinting==='xy7-30');
  const duskull=actual.rows.find(x=>x.sourcePrinting==='swsh4-69');
  assert.deepEqual(unown.abilityNames,['Farewell Letter']);
  assert.deepEqual(unown.attackNames,['Hidden Power']);
  assert.deepEqual(unown.bannedMatches,[]);
  assert.deepEqual(duskull.abilityNames,[]);
  assert.deepEqual(duskull.attackNames,['Future Sight']);
  assert.deepEqual(duskull.bannedMatches,[]);
});

test('banned Duskull and Unown effects are caught under otherwise same 60',()=>{
  const bannedDuskull=auditNewMoonExpandedBanPrintings(
    proposal,snapshot,id=>{
      const card=exactRecord(id);
      return id==='swsh4-69'?{...card,abilities:[
        {name:'Spiritborne Evolution'}]}:card;
    });
  assert.deepEqual(bannedDuskull.bannedPrintingsFound.map(x=>x.sourcePrinting),
    ['swsh4-69']);
  const bannedUnown=auditNewMoonExpandedBanPrintings(
    proposal,snapshot,id=>{
      const card=exactRecord(id);
      return id==='xy7-30'?{...card,abilities:[{name:'HAND'}]}:card;
    });
  assert.deepEqual(bannedUnown.bannedPrintingsFound.map(x=>x.sourcePrinting),
    ['xy7-30']);
  assert.equal(bannedUnown.proxyPassesListedSourceChecks,false);
});

test('missing exact source ID and second ACE SPEC fail closed',()=>{
  assert.throws(()=>auditNewMoonExpandedBanPrintings(
    proposal,snapshot,id=>id==='xy7-30'?null:exactRecord(id)),
  /Unresolved exact English proxy/);
  const extraACE=auditNewMoonExpandedBanPrintings(
    proposal,snapshot,id=>{
      const card=exactRecord(id);
      return id==='me1-119'?{...card,subtypes:[
        ...card.subtypes,'ACE SPEC']}:card;
    });
  assert.equal(extraACE.aceSpecCopies,3);
  assert.equal(extraACE.proxyPassesListedSourceChecks,false);
});
