'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(ROOT,name));
const {Player}=engine('game/store/state/player');
const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
const {GameMessage}=engine('game/game-message');
const {Stage,CardTag}=engine('game/store/card/card-types');
const {RegidragoV}=
  engine('sets/09-sword-and-shield/set-silver-tempest/regidrago-v');
const {ArticunoGX}=
  engine('sets/08-sun-and-moon/set-celestial-storm/articuno-gx');
const {CrobatV}=
  engine('sets/09-sword-and-shield/set-darkness-ablaze/crobat-v');
const {DedenneGX}=
  engine('sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx');
const {EldegossV}=
  engine('sets/09-sword-and-shield/set-rebel-clash/eldegoss-v');
const {RadiantEternatus}=
  engine('sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus');
const {TapuLeleGX}=
  engine('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx');
const {isTurnEntrySupport,chooseOwnedProtectedStartingBasics:protect}=
  require('../simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs');
const {chooseOwnedStartingBasics:greedy}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');

const cases=[
  [ArticunoGX,'Articuno-GX','CES','31','Legendary Ascent'],
  [CrobatV,'Crobat V','DAA','104','Dark Asset'],
  [DedenneGX,'Dedenne-GX','UNB','57','Dedechange'],
  [EldegossV,'Eldegoss V','RCL','19','Happy Match'],
  [RadiantEternatus,'Radiant Eternatus','CRZ','105','Climactic Gate'],
  [TapuLeleGX,'Tapu Lele-GX','GRI','60','Wonder Tag']
];

test('all six authenticated printed engine classes preserve in-turn Ability under setup',()=>{
  assert.equal(cases.length,6);
  const witnessed=[];
  for(const seat of [0,1]){
    for(const [Class,name,set,number,ability] of cases){
      const owner=new Player();
      owner.id=seat===0?101:202;
      const support=new Class();
      const ordinary=new RegidragoV();
      owner.hand.cards=[support,ordinary];
      const opponent=new Player();
      opponent.id=seat===0?202:101;
      opponent.hand.cards=[new CrobatV(),new TapuLeleGX()];
      const players=seat===0?[owner,opponent]:[opponent,owner];
      assert.equal(players[seat],owner);
      assert.equal(support.name,name);
      assert.equal(support.set,set);
      assert.equal(support.setNumber,number);
      assert.equal(support.stage,Stage.BASIC);
      assert.ok(support.powers.some(p=>p.name===ability));
      assert.equal(isTurnEntrySupport(support),true);
      assert.equal(isTurnEntrySupport(ordinary),false);
      const prompt=new ChooseCardsPrompt(owner,
        GameMessage.CHOOSE_STARTING_POKEMONS,owner.hand,{},
        {min:1,max:6,allowCancel:false,blocked:[]});
      const originals=[...owner.hand.cards];
      const old=greedy(prompt,owner,Stage,CardTag);
      const selected=protect(prompt,owner,Stage,CardTag);
      assert.equal(prompt.validate(old),true);
      assert.equal(prompt.validate(selected),true);
      assert.deepEqual(old,[support,ordinary]);
      assert.deepEqual(selected,[ordinary]);
      opponent.hand.cards.reverse();
      assert.deepEqual(protect(prompt,players[seat],Stage,CardTag),selected,
        'Owner prompt decision must ignore opposite concealed hand order');
      assert.deepEqual(owner.hand.cards,originals);
      assert.equal(owner.active.cards.length,0,
        'Native prompt validation is not an actual Store action');
      witnessed.push({seat,name,set,number,ability,
        eligibleSupport:true,
        selectedActive:selected[0].fullName,
        greedyWouldConsume:support.fullName,
        actualStoreDispatch:false});
    }
  }
  assert.equal(witnessed.length,12);
  console.log('AGENT50_PINNED_ALL_SIX_ENTRY_ABILITIES',JSON.stringify({
    pinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actualPrintedClasses:6,ownerSeatCases:12,
    caseDetails:witnessed,qualifiedCompetitiveGames:0
  }));
});
