'use strict';

const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const {fingerprintPublishedField}=
  require('../scripts/aichi-source-fingerprint-map.cjs');
const {assertFullFieldSourceBinding,assessRepositoryFullFieldClaim}=
  require('../scripts/aichi-full-field-claim-gate.cjs');

const CANDIDATE='a'.repeat(64);
const sourceMap=()=>({
  complete:true,rankCount:32,
  ranked:Array.from({length:32},(_,i)=>({
    rank:i+1,
    status:'verified-printed-inventory',
    sourceDeckSha256:(i+1).toString(16).padStart(64,'0')
  }))
});
const game=rank=>({
  rank,opponentDeckSha256:rank.toString(16).padStart(64,'0'),
  candidateDeckSha256:CANDIDATE
});
const fullRound=()=>Array.from({length:64},(_,i)=>game(i%32+1));

test('all 32 exact rank fingerprints and one frozen candidate are required',()=>{
  assert.doesNotThrow(()=>assertFullFieldSourceBinding(
    [fullRound()],sourceMap(),CANDIDATE));
  const missing=sourceMap();
  missing.complete=false;
  missing.missingRanks=[23,25,28];
  assert.throws(()=>assertFullFieldSourceBinding([fullRound()],missing,CANDIDATE),
    /source inventory is unavailable/);
  const removed=sourceMap();
  removed.ranked.pop();
  assert.throws(()=>assertFullFieldSourceBinding([fullRound()],removed,CANDIDATE),
    /source inventory is unavailable/);
});

test('correct-looking results cannot silently substitute a different opponent',()=>{
  const wrongOpponent=fullRound();
  wrongOpponent[22].opponentDeckSha256='f'.repeat(64);
  assert.throws(()=>assertFullFieldSourceBinding(
    [wrongOpponent],sourceMap(),CANDIDATE),
  /fingerprint contradicts/);
  const wrongCandidate=fullRound();
  wrongCandidate[0].candidateDeckSha256='b'.repeat(64);
  assert.throws(()=>assertFullFieldSourceBinding(
    [wrongCandidate],sourceMap(),CANDIDATE),
  /fingerprint contradicts/);
});

test('a forged complete marker cannot mask omitted or repeated source rank',()=>{
  const dup=sourceMap();
  dup.ranked[30].rank=30;
  assert.throws(()=>assertFullFieldSourceBinding(
    [fullRound()],dup,CANDIDATE),/Invalid or duplicated rank/);
  const noPrinting=sourceMap();
  noPrinting.ranked[5].status='unavailable-source';
  assert.throws(()=>assertFullFieldSourceBinding(
    [fullRound()],noPrinting,CANDIDATE),/Invalid or duplicated rank/);
});

test('final-claim intake uses repository source and refuses undocumented ranks',()=>{
  const folder=path.resolve(__dirname,'../results/aichi-2026');
  const source=JSON.parse(fs.readFileSync(
    path.join(folder,'full-decklists.json'),'utf8'));
  const csv=fs.readFileSync(path.join(folder,'field.csv'),'utf8');
  const mapped=fingerprintPublishedField(source,csv);
  const candidate=source.decks[0].cards;
  if(!mapped.complete) {
    assert.throws(()=>assessRepositoryFullFieldClaim([],candidate),
      new RegExp('missing ranks: '+mapped.missingRanks.join(',')));
  } else {
    const result=assessRepositoryFullFieldClaim([],candidate);
    assert.equal(result.sourceRanksBound,32);
  }
});
