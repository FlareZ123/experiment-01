'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {IronThornsex}=native(
  'sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex');
const {CaptureEnergy}=native(
  'sets/09-sword-and-shield/set-rebel-clash/capture-energy');
const {SpeedLightningEnergy}=native(
  'sets/09-sword-and-shield/set-rebel-clash/speed-lightning-energy');
const {StateScore}=native('simple-bot/state-score/state-score');
const {ChoosePokemonPromptResolver}=native(
  'simple-bot/prompt-resolver/choose-pokemon-prompt-resolver');
const {defaultStateScores}=native('simple-bot/simple-bot-definitions');
const {PlayerType}=native('game/store/actions/play-card-action');

/**
 * Real pinned print and physical Energy cards on each Bench slot; no Store
 * mutation or fabricated decision-response acceptance.
 * @param {boolean} funded
 * @returns {object} Pinned native PokemonCardList.
 */
function thorns(funded){
  const slot=new PokemonCardList();
  slot.cards.push(new IronThornsex());
  if(funded){
    slot.energies.cards.push(new CaptureEnergy());
    slot.energies.cards.push(new SpeedLightningEnergy());
  }
  return slot;
}

test('pinned native intrinsic Pokemon score ignores two attached special Energies',()=>{
  const prepared=thorns(true);
  const empty=thorns(false);
  assert.equal(prepared.getPokemonCard().fullName,'Iron Thorns ex TWM');
  assert.equal(empty.getPokemonCard().fullName,'Iron Thorns ex TWM');
  assert.equal(prepared.energies.cards.length,2);
  assert.equal(empty.energies.cards.length,0);
  const stateScore=new StateScore({scores:defaultStateScores});
  const fundedScore=stateScore.getPokemonScore(prepared);
  const emptyScore=stateScore.getPokemonScore(empty);
  // Pinned default: 230 HP*0.3 + 140 attack*0.4 +
  // 1 printed Ability*1 - 4 printed retreat symbols*5 = 106.
  assert.equal(fundedScore,106);
  assert.equal(fundedScore,emptyScore);
});

test('default pinned ChoosePokemon prompt picks earlier identical Bench slot',()=>{
  const prepared=thorns(true);
  const empty=thorns(false);
  const resolver=new ChoosePokemonPromptResolver({
    scores:defaultStateScores
  });
  // Call the pinned TypeScript-private method at runtime solely for a
  // deterministic *prompt selection* diagnostic. This does not assert
  // legality, native Store acceptance, or attack/Prize settlement.
  const prompt={message:'switch source Active',options:{
    min:1,max:1,allowCancel:false
  }};
  assert.deepEqual(resolver.getPromptResult(prompt,[
    {cardList:empty,player:PlayerType.BOTTOM_PLAYER},
    {cardList:prepared,player:PlayerType.BOTTOM_PLAYER}
  ]),[empty]);
  assert.deepEqual(resolver.getPromptResult(prompt,[
    {cardList:prepared,player:PlayerType.BOTTOM_PLAYER},
    {cardList:empty,player:PlayerType.BOTTOM_PLAYER}
  ]),[prepared]);
});
