'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {beforeGladionRootPrizeChoice,afterGladionRootPrizeChoice}=
  require('../simulation/twinleaf/gladion-root-prize-choice-evidence.cjs');

class ChoosePrizePrompt{
  constructor(){this.playerId=202;this.options={count:1,useOpponentPrizes:false};}
}
class ResolvePromptAction{}

function setup(){
  const item={fullName:'Technical Machine: Evolution PAR'};
  const relicanth={fullName:'Relicanth TEF'};
  const gloom={fullName:'Gloom UNB'};
  const gladion={fullName:'Gladion CIN'};
  const prizes=[
    {isSecret:false,cards:[relicanth]},
    {isSecret:false,cards:[item]},
    {isSecret:false,cards:[gloom]}
  ];
  const slot=(card,underlay=[],tools=[],energies=[])=>({
    getPokemonCard:()=>card,
    cards:[...underlay,card],tools,
    energies:{cards:energies},damage:0
  });
  const empty=()=>({
    getPokemonCard:()=>undefined,cards:[],tools:[],
    energies:{cards:[]},damage:0
  });
  const owner={
    id:202,prizes,supporter:{cards:[gladion]},
    hand:{cards:[{fullName:'Jet Energy PAL'}]},
    discard:{cards:[{fullName:'Tag Call CEC'}]},
    stadium:{cards:[{fullName:'Artazon PAL'}]},
    supporterTurn:1,
    stadiumUsedTurn:0,
    stadiumPlayedTurn:5,
    lostzone:{cards:[{fullName:'Lost Vacuum CRZ'}]},
    active:slot({fullName:'Bunnelby PRC'}),
    bench:[
      slot({fullName:'Oddish UNB'}),
      slot({fullName:'Gloom UNB'},[{fullName:'Oddish UNB'}]),
      empty()
    ]
  };
  const opponent={
    id:101,
    active:slot({fullName:'Radiant Eternatus CRZ'}),
    bench:[empty()],
    get hand(){throw Error('Opponent concealed hand must never be read');}
  };
  Object.defineProperty(owner,'deck',{
    get(){throw Error('Owner concealed deck order must never be read');}
  });
  Object.defineProperty(opponent,'deck',{
    get(){throw Error('Opponent concealed deck order must never be read');}
  });
  const state={turn:5,players:[opponent,owner]};
  return {owner,state,prizes,relicanth,gladion,
    prompt:new ChoosePrizePrompt(),action:new ResolvePromptAction()};
}

test('opt-in Gladion owner context records own resources and face-up boards only',()=>{
  const f=setup();
  const prior=beforeGladionRootPrizeChoice(
    f.state,f.prompt,f.action,1,47,true);
  assert.equal(prior.ownerContextBefore.supporterAlreadyPlayed,true);
  assert.equal(prior.ownerContextBefore.stadiumEffectUsedThisTurn,false);
  assert.equal(prior.ownerContextBefore.stadiumPlayedThisTurn,true);
  assert.deepEqual(prior.ownerContextBefore.ownLostZonePrintings,
    ['Lost Vacuum CRZ']);
  assert.equal(prior.ownerContextBefore.ownActive.pokemon,'Bunnelby PRC');
  assert.equal(prior.ownerContextBefore.ownBench[1].stackPrintings[0],
    'Oddish UNB');
  assert.deepEqual(prior.ownerContextBefore.ownHandPrintings,
    ['Jet Energy PAL']);
  assert.equal(prior.ownerContextBefore.opponentActive.pokemon,
    'Radiant Eternatus CRZ');
  f.prizes[0].cards=[f.gladion];f.prizes[0].isSecret=true;
  f.owner.hand.cards.push(f.relicanth);
  const outcome=afterGladionRootPrizeChoice(prior,f.state);
  assert.equal(outcome.selectedPrinting,'Relicanth TEF');
  assert.equal(outcome.selectedPhysicalPrizeReachedHand,true);
  assert.equal(outcome.ownerVisibleContext.after.ownHandPrintings.at(-1),
    'Relicanth TEF');
  assert.equal(outcome.ownerVisibleContext.before.ownHandPrintings.length,1);
  assert.equal(JSON.stringify(outcome).includes('concealed deck'),false);
  assert.equal(JSON.stringify(outcome).includes('refs'),false);
  f.owner.hand.cards.length=0;
  assert.equal(outcome.ownerVisibleContext.after.ownHandPrintings.length,2,
    'Captured context must be detached from later live state');
});

test('default Gladion evidence remains unchanged without context opt-in',()=>{
  const f=setup();
  const prior=beforeGladionRootPrizeChoice(
    f.state,f.prompt,f.action,1,47);
  assert.equal(Object.hasOwn(prior,'ownerContextBefore'),false);
  f.owner.hand.cards.push(f.relicanth);
  const outcome=afterGladionRootPrizeChoice(prior,f.state);
  assert.equal(Object.hasOwn(outcome,'ownerVisibleContext'),false);
});

test('no board context may be captured before all Prize cards are revealed',()=>{
  const f=setup();f.prizes[1].isSecret=true;
  assert.equal(beforeGladionRootPrizeChoice(
    f.state,f.prompt,f.action,1,47,true),null);
});

test('used Stadium and Supporter counters are distinct from global turn number',()=>{
  const f=setup();
  f.owner.stadiumUsedTurn=5;
  f.owner.supporterTurn=1;
  const prior=beforeGladionRootPrizeChoice(
    f.state,f.prompt,f.action,1,47,true);
  assert.equal(prior.ownerContextBefore.supporterAlreadyPlayed,true);
  assert.equal(prior.ownerContextBefore.stadiumEffectUsedThisTurn,true);
  f.owner.stadiumUsedTurn=4;
  assert.equal(prior.ownerContextBefore.stadiumEffectUsedThisTurn,true,
    'Detached context must not change with the live state');
});
