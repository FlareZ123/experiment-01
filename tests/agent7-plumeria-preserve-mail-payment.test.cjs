'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {basicEnergyPrinting,proposePreserveMailPrintings,
  choosePreserveMailPhysicalPair}=
  require('../simulation/twinleaf/agent7-plumeria-preserve-mail-payment.cjs');
const {runOriginalPlumeriaPaymentPair,FLAGS}=
  require('../simulation/evaluation/agent7-plumeria-payment-original48-pair.cjs');

const originalHand=[
  'Guzma & Hala CEC',"Trainers' Mail ROS",
  'Captivating Poké Puff STS','Plumeria BUS',
  'Enhanced Hammer TWM',"Trainers' Mail ROS",
  'Echoing Horn CRE',"Team Rocket's Handiwork FCO",
  'Sidney FST 241'
];

/** @param {string[]} [energies] */
function view(energies=['Psychic Energy MEE']){
  return {decisionKind:'owner-prompt',
    pendingPromptType:'ChooseCardsPrompt',
    ownHand:[...originalHand],
    opponentPublic:{
      active:{energies},
      bench:[{energies:[]}]
    }
  };
}

test('the actual owner T3 permits an alternative printed two-card payment',()=>{
  assert.deepEqual(proposePreserveMailPrintings(view()),
    ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
  assert.equal(basicEnergyPrinting('Psychic Energy MEE'),true);
  assert.equal(basicEnergyPrinting('Capture Energy RCL'),false);
});
test('public opposing Special Energy vetoes the proposed Hammer payment',()=>{
  assert.equal(proposePreserveMailPrintings(view(
    ['Double Colorless Energy SUM'])),null);
});
test('lack of two owned Mail copies defers to the baseline',()=>{
  const actual=view();
  actual.ownHand.pop();
  actual.ownHand=actual.ownHand.filter(x=>
    x!=="Trainers' Mail ROS").concat("Trainers' Mail ROS");
  assert.equal(proposePreserveMailPrintings(actual),null);
});
test('native physical prompt receives two distinct owner cards, no hidden read',()=>{
  const hand=originalHand.map(fullName=>({fullName}));
  class ChooseCardsPrompt{
    constructor(cards){
      this.playerId=101;this.message='CHOOSE_CARD_TO_DISCARD';
      this.options={min:2,max:2,allowCancel:false};
      this.cards={cards};
    }
    validate(selection){return selection.length===2&&
      selection[0]!==selection[1]&&
      selection.every(card=>this.cards.cards.includes(card));}
  }
  const prompt=new ChooseCardsPrompt(hand);
  const state={players:[{id:101,hand:{cards:hand}},
    {id:102,hand:{cards:[{hidden:'unobserved'}]}}],
    prompts:[prompt]};
  const selected=choosePreserveMailPhysicalPair(state,0,
    ()=>{throw new Error('unexpected fallback');},
    ()=>view());
  assert.deepEqual(selected.map(c=>c.fullName),
    ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
  assert.equal(new Set(selected).size,2);
});
test('non-Plumeria prompt defers unchanged',()=>{
  class OtherPrompt{}
  const sentinel=[{fullName:'fallback'}];
  const state={players:[{id:1,hand:{cards:[]}},{}],
    prompts:[new OtherPrompt()]};
  assert.equal(choosePreserveMailPhysicalPair(state,0,()=>sentinel),sentinel);
});
test('same-deal pair runner restores all option flags if injected execution throws',()=>{
  const prior=FLAGS.map(name=>({
    name,had:Object.hasOwn(process.env,name),value:process.env[name]
  }));
  assert.throws(()=>runOriginalPlumeriaPaymentPair({
    execute:()=>{throw new Error('injected abort');},
    development:()=>null
  }),/injected abort/);
  for(const old of prior){
    assert.equal(Object.hasOwn(process.env,old.name),old.had);
    assert.equal(process.env[old.name],old.value);
  }
});
