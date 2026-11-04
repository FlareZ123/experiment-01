'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(ROOT,name));
const {Player}=engine('game/store/state/player');
const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
const {GameMessage}=engine('game/game-message');
const {Stage,CardTag}=engine('game/store/card/card-types');
const {TapuLeleGX}=
  engine('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx');
const {CrobatV}=
  engine('sets/09-sword-and-shield/set-darkness-ablaze/crobat-v');
const {RegidragoV}=
  engine('sets/09-sword-and-shield/set-silver-tempest/regidrago-v');
const {chooseOwnedStartingBasics:greedy}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {isTurnEntrySupport,chooseOwnedProtectedStartingBasics:protect}=
  require('../simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs');

function sourcePrompt(owner,min=1,max=6){
  return new ChooseCardsPrompt(owner,GameMessage.CHOOSE_STARTING_POKEMONS,
    owner.hand,{}, {min,max,allowCancel:false,blocked:[]});
}

test('actual pinned printed classes + native prompt: protect entry supports on both seats',()=>{
  for(const seat of [0,1]){
    const owner=new Player();
    const other=new Player();
    owner.id=seat===0?101:202;
    other.id=seat===0?202:101;
    const lele=new TapuLeleGX();
    const attacker=new RegidragoV();
    const crobat=new CrobatV();
    owner.hand.cards=[lele,attacker,crobat];
    other.hand.cards=[new CrobatV(),new TapuLeleGX()];
    const physicalOwnerCards=[...owner.hand.cards];
    const prompt=sourcePrompt(owner);
    assert.equal(prompt.validate([attacker]),true);
    assert.equal(prompt.validate([lele,attacker,crobat]),true);
    assert.equal(isTurnEntrySupport(lele),true);
    assert.equal(isTurnEntrySupport(crobat),true);
    assert.equal(isTurnEntrySupport(attacker),false);

    const baseline=greedy(prompt,owner,Stage,CardTag);
    const replacement=protect(prompt,owner,Stage,CardTag);
    assert.deepEqual(baseline,[lele,attacker,crobat]);
    assert.deepEqual(replacement,[attacker]);
    assert.equal(prompt.validate(replacement),true);
    other.hand.cards.reverse();
    assert.deepEqual(protect(prompt,owner,Stage,CardTag),replacement);
    assert.deepEqual(owner.hand.cards,physicalOwnerCards,
      'no Store state mutated before actual dispatched action');
    assert.equal(owner.active.cards.length,0);
    console.log('AGENT50_PINNED_OWNER_ENTRY_PROTECTED',JSON.stringify({
      seat,sourcePrintings:physicalOwnerCards.map(x=>x.fullName),
      nativePromptMin:prompt.options.min,
      nativePromptMax:prompt.options.max,
      greedySelected:baseline.map(x=>x.fullName),
      protectedSelected:replacement.map(x=>x.fullName),
      nativePromptValidated:true,
      actualStoreDispatch:false,
      qualifiedCompetitiveGames:0
    }));
  }
});

test('pinned min0 bonus Bench prompt accepts empty owner-only optional selection',()=>{
  const owner=new Player();
  owner.id=101;
  owner.hand.cards=[new TapuLeleGX(),new RegidragoV()];
  const prompt=sourcePrompt(owner,0,5);
  assert.equal(prompt.validate([]),true);
  assert.deepEqual(protect(prompt,owner,Stage,CardTag),[]);
  assert.equal(owner.hand.cards.length,2);
});
