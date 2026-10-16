'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureSlotChoice,restoreSlotChoice}=
  require('../simulation/twinleaf/choice-slot-reference.cjs');
class ChoosePokemonPrompt {
  constructor(){this.message='CHOOSE_POKEMON';this.playerId=202;}
  getPerspectivePlayerId(){return this.playerId;}
}
class ChoosePrizePrompt {
  constructor(){this.message='CHOOSE_PRIZES';this.playerId=202;}
  getPerspectivePlayerId(){return this.playerId;}
}
class ResolvePromptAction {constructor(result){this.result=result;}}
const zone=(...names)=>({cards:names.map(fullName=>({fullName}))});
function state() {
  return {players:[
    {id:101,active:zone('Regidrago VSTAR SIT'),
      bench:[zone('Latias ex SSP'),zone('Regidrago VSTAR SIT')],
      prizes:[zone('Same Card A'),zone('Same Card A'),zone()]},
    {id:202,active:zone('Mimikyu GRI'),
      bench:[zone('Latias ex SSP'),zone('Dialga-GX UPR')],
      prizes:[zone('Same Card A'),zone('Same Card A'),zone('Secret Energy B')]}
  ]};
}
test('capture and restore exact duplicated printed Prize piles',()=>{
  const original=state(),prompt=new ChoosePrizePrompt();
  const evidence=captureSlotChoice(prompt,
    new ResolvePromptAction([original.players[1].prizes[1]]),original);
  assert.deepEqual(evidence.selections[0],
    {playerId:202,zone:'prizes',index:1,signature:['Same Card A']});
  const replica=state();
  const restored=restoreSlotChoice(new ChoosePrizePrompt(),replica,evidence);
  assert.equal(restored[0],replica.players[1].prizes[1]);
  assert.notEqual(restored[0],replica.players[1].prizes[0]);
});

test('capture exact physical bench source across both players',()=>{
  const original=state(),prompt=new ChoosePokemonPrompt();
  const evidence=captureSlotChoice(prompt,
    new ResolvePromptAction([original.players[0].bench[1],
      original.players[1].active]),original);
  const replay=state();
  const got=restoreSlotChoice(new ChoosePokemonPrompt(),replay,evidence);
  assert.equal(got[0],replay.players[0].bench[1]);
  assert.equal(got[1],replay.players[1].active);
});

test('reject source inventory drift even if selected name still exists',()=>{
  const original=state(),prompt=new ChoosePrizePrompt();
  const evidence=captureSlotChoice(prompt,
    new ResolvePromptAction([original.players[1].prizes[1]]),original);
  const replay=state();
  replay.players[1].prizes[2].cards[0].fullName='Drift';
  assert.throws(()=>restoreSlotChoice(new ChoosePrizePrompt(),replay,evidence),
    /source inventory differs/);
});

test('null cancellation and alien object handling',()=>{
  const source=state(),prompt=new ChoosePokemonPrompt();
  const evidence=captureSlotChoice(prompt,new ResolvePromptAction(null),source);
  assert.equal(restoreSlotChoice(new ChoosePokemonPrompt(),state(),evidence),null);
  assert.throws(()=>captureSlotChoice(prompt,
    new ResolvePromptAction([zone('Mimikyu GRI')]),source),/absent/);
});
