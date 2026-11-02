'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./rank26-pump-source-conserved-fixture.cjs');
const {
  withRank26ExeggcutePump,opponentHasLiveBench
}=require('./rank26-exeggcute-pump-policy.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=rel=>require(path.join(OUTPUT,rel));

/**
 * Check only one exposed policy root on a genuine original 60-conserved,
 * artificially prepared native Store board. The fallback is a deliberately
 * synthetic marker. No damage counter is moved and no game is run.
 * @param {0|1} sourceSeat
 * @param {boolean} withDefenderBench
 * @returns {object}
 */
function runCase(sourceSeat,withDefenderBench){
  const f=fixture(sourceSeat);
  if(withDefenderBench){
    const i=f.opponent.hand.cards.findIndex(c=>c.name==='Iron Thorns ex');
    assert.ok(i>=0,'Prepared original opponent hand must have another Iron Thorns');
    const card=f.opponent.hand.cards.splice(i,1)[0];
    const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
    const bench=new PokemonCardList();
    bench.cards.push(card);
    f.opponent.bench.push(bench);
  }
  assert.equal(opponentHasLiveBench(f.state,sourceSeat),withDefenderBench);

  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous.value,'function');
  // Fake only the *otherwise chosen baseline action* so the vignette
  // cannot be mislabeled as genuine autonomous gameplay or a legal pass.
  function syntheticBaseline(){return {kind:'synthetic-baseline-marker'};}
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previous,value:syntheticBaseline
  });
  try{
    const audited=withRank26ExeggcutePump(sourceSeat,()=>{
      const player={client:{id:f.own.id}};
      const action=SimpleTacticsAi.prototype.decodeNextAction.call(
        player,f.state);
      const name=action?.constructor?.name;
      return {action:name==='PlayCardAction'?'native-pump-proposal':
        action?.kind==='synthetic-baseline-marker'?'synthetic-baseline':
        'unexpected-'+name};
    },{requireOpponentSoloActive:true});
    assert.equal(audited.policyAudit.version,
      'rank26-single-source-pump-solo-public-board-v2');
    assert.equal(audited.policyAudit.actions.length,withDefenderBench?0:1);
    assert.equal(audited.policyAudit.vetoes.length,withDefenderBench?1:0);
    assert.equal(audited.result.action,
      withDefenderBench?'synthetic-baseline':'native-pump-proposal');

    const all=player=>[
      ...player.active.cards,...player.bench.flatMap(x=>x.cards),
      ...player.hand.cards,...player.deck.cards,...player.discard.cards,
      ...player.prizes.flatMap(x=>x.cards),
      ...player.stadium.cards
    ];
    const self=all(f.own),other=all(f.opponent);
    assert.equal(self.length,60);
    assert.equal(other.length,60);
    assert.equal(new Set(self.map(c=>c.id)).size,60);
    assert.equal(new Set(other.map(c=>c.id)).size,60);
    return {sourceSeat,withDefenderBench,
      nativeStoreBoard:true,preparedBoard:true,
      originalPhysical60Conserved:true,
      sourceDecision:audited.result.action,
      overlayActions:audited.policyAudit.actions,
      overlayVetoes:audited.policyAudit.vetoes,
      stage:'initial prospective policy decision only',
      fullGamePlayed:false,competitiveGameQualified:false};
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previous);
  }
}
function run(){
  const cases=[
    runCase(0,false),runCase(0,true),
    runCase(1,false),runCase(1,true)
  ];
  return {schema:'agent47-rank26-solo-opponent-pump-native-board-gate-v1',
    originalSourceAndOpponentSixties:true,
    cases,competitiveQualifiedGames:0,
    caveat:'Native board and proposed PlayCardAction are real; the disallowed source fallback is synthetic. No attack, payment, Prize or match settlement is claimed.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={runCase,run};
