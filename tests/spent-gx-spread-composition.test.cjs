'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {preparedRegidrago}=require('../simulation/twinleaf/apex-attack-action.cjs');
const {installApexPrizeWindowPolicy}=require('../simulation/twinleaf/apex-prize-headless-policy.cjs');
const {installHeadlessSpentGxCopyPolicy}=require('../simulation/twinleaf/spent-gx-headless-resolver.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));
function resolveWithBoth(board){
  const defs=load('simple-bot/simple-bot-definitions');
  const original=defs.allPromptResolvers.slice();
  const restoreSpread=installApexPrizeWindowPolicy();
  let restoreGx;
  try{
    restoreGx=installHeadlessSpentGxCopyPolicy();
    const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
    const bot=new SimpleTacticsAi({id:board.attacking.id},{
      tactics:[],promptResolvers:defs.allPromptResolvers,
      scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions},null);
    assert.ok(bot.resolvers.some(r=>r.constructor.name==='SpentGxIntegratedCopyResolver'));
    const {AttackAction}=load('game/store/actions/game-actions');
    board.store.dispatch(new AttackAction(board.attacking.id,'Apex Dragon'));
    const prompt=board.state.prompts.find(x=>x.result===undefined&&
      x.constructor.name==='ChooseAttackPrompt');
    assert.ok(prompt);
    const action=bot.decodeNextAction(board.state);
    assert.equal(prompt.validate(action.result),true);
    return action;
  }finally{
    if(restoreGx)restoreGx();
    restoreSpread();
    assert.deepEqual(defs.allPromptResolvers,original);
  }
}
test('spent GX picks Shred in joint resolver composition',()=>{
  const dialga=initializeCards().getCardByName('Dialga-GX UPR');
  assert.ok(dialga);
  const b=preparedRegidrago();
  b.attachFire(); b.attacking.usedGX=true;
  b.attacking.discard.cards.push(dialga);
  const action=resolveWithBoth(b);
  assert.equal(action.result.name,'Shred');
  b.store.dispatch(action);
  assert.equal(b.defending.active.damage,80);
  assert.equal(b.attacking.usedGX,true);
});
test('spent GX guard retains spread-aware Phantom Dive tactical copy',()=>{
  const get=name=>initializeCards().getCardByName(name);
  const b=preparedRegidrago();
  b.attachFire(); b.attacking.usedGX=true;
  b.attacking.discard.cards.push(get('Dragapult ex TWM'),get('Hisuian Goodra VSTAR LOR'));
  b.defending.active.cards.length=0;
  b.defending.active.cards.push(get('Pidgey FLF'),get('Pidgeotto TEU'),get('Pidgeot ex OBF'));
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const bench=new PokemonCardList();
  bench.cards.push(get('Budew ASC'));
  b.defending.bench.push(bench);
  assert.equal(resolveWithBoth(b).result.name,'Phantom Dive');
});
