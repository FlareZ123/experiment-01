'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,sourceCensus,originalRank9DirectCompressorBombOpportunity}=require(
  '../scripts/agent29-rank9-direct-compressor-bomb-opportunity.cjs');

test('BigInt combinations match independent Pascal recurrence for n <= 15',()=>{
  let row=[1n];
  for(let n=0;n<=15;n++){
    for(let k=-1;k<=n+1;k++)
      assert.equal(choose(n,k),k>=0&&k<=n?row[k]:0n);
    row=[1n,...row.slice(0,-1).map((v,i)=>v+row[i+1]),1n];
  }
});

test('original authenticated rank9 four-piece direct population is unchanged',()=>{
  const s=sourceCensus();
  assert.deepEqual({
    source:s.sourceCardCount,basic:s.startingBasicCount,
    sourceEnergy:s.prismEnergy+s.otherEnergy,
    specialPieces:s.voltorb+s.megaAbsol+s.battleCompressor+s.electrode
  },{source:60,basic:11,sourceEnergy:7,specialPieces:5});
  assert.equal(5+7+s.otherBasics+s.otherNonBasics,60);
});

test('exact nine-observation valid-seven route has independently enumerated rational probabilities',()=>{
  const out=originalRank9DirectCompressorBombOpportunity();
  const values=[
    ['validSeven','1137524','1462905'],
    ['directFourPiecesBySecondTurn','7874063','12540064576'],
    ['directFourPiecesAndThreeEnergyInDeck','777534764131','1240877974609280'],
    ['voltorbByFirstTurnAndThreeEnergyInDeck','18057491327583','32262827339841280'],
    ['voltorbByFirstTurnAndThreePrismInDeck','13889519913','29845353690880']
  ];
  for(const [name,n,d] of values){
    assert.equal(out[name].numerator,n,name);
    assert.equal(out[name].denominator,d,name);
    assert.ok(out[name].probability>0&&out[name].probability<1);
  }
  assert.ok(out.voltorbByFirstTurnAndThreePrismInDeck.probability<
    out.voltorbByFirstTurnAndThreeEnergyInDeck.probability);
  assert.ok(out.voltorbByFirstTurnAndThreeEnergyInDeck.probability<
    out.directFourPiecesBySecondTurn.probability);
  assert.equal(out.probabilityOfSuccessfulAttackCertified,false);
  assert.equal(out.competitivelyQualifiedGames,0);
  console.log('AGENT29_RANK9_EXACT_DIRECT_WINDOW',JSON.stringify(out));
});
