'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(ROOT,name));
const MARSHADOW='Marshadow UNB';
const FOG='Fog Crystal CRE';
const SHADOW='Shadow Rider Calyrex V CRE';
const FLOAT='Float Stone BKT';
const ENERGY='Psychic Energy SVE';
const THUNDER='Thunder Mountain Prism Star LOT';
const THORNS='Iron Thorns ex TWM';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

function stageForcedActive(seat,payment) {
  assert.ok(seat===0||seat===1);
  assert.ok(payment==='floatstone'||payment==='psychic-energy');
  const x=stage(seat),manager=initializeCards();
  let id=30001;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned engine missing '+name);
    c.id=id++;
    return c;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card(MARSHADOW));
  for(const slot of x.owner.bench) {
    slot.cards.length=0;
    slot.energies.cards.length=0;
  }
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(card(FOG));
  x.owner.hand.cards.push(card(payment==='floatstone'?FLOAT:ENERGY));
  x.owner.deck.cards.push(card(SHADOW));
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card(THORNS));
  x.opponent.stadium.cards.push(card(THUNDER));
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.owner.bench.filter(s=>s.getPokemonCard()).length,0);
  return x;
}

/** @param {object} x @param {string} printing @param {object} destination */
function playPhysical(x,printing,destination){
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  const index=x.owner.hand.cards.findIndex(c=>c.fullName===printing);
  assert.ok(index>=0,'Requested card missing from owner hand '+printing);
  x.store.dispatch(new PlayCardAction(x.owner.id,index,destination));
}

/** Only native Wait or one exactly identified owner deck-search response. */
function settleNative(x,allowSearch=false){
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const prompts=[];
  let searched=false;
  for(let n=0;n<32;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let choice;
    if(kind==='WaitPrompt')choice=null;
    else if(allowSearch&&kind==='ChooseCardsPrompt'&&
      prompt.playerId===x.owner.id && prompt.cards===x.owner.deck){
      const selected=prompt.cards.cards.find(c=>c.fullName===SHADOW);
      assert.ok(selected,'Search prompt lacks prerequisite original Psychic Basic');
      assert.ok(prompt.validate([selected]),
        'Chosen printed Psychic Basic is not eligible in native Fog search');
      choice=[selected];
      searched=true;
    }else throw Error('Unsupported native prompt in staged chain: '+kind);
    x.store.dispatch(new ResolvePromptAction(prompt.id,choice));
    prompts.push({kind,ownerSeat:x.seat,
      selected:choice?.map(c=>c.fullName)??null});
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false,
    'Staged chain left unresolved native prompt');
  if(allowSearch)assert.equal(searched,true,
    'Fog Crystal failed to create owner deck search prompt');
  return prompts;
}

function runArm(seat,payment){
  const x=stageForcedActive(seat,payment);
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {RetreatAction,UseAbilityAction}=
    load('game/store/actions/game-actions');
  const ownActive={player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.ACTIVE,index:0};
  const ownBench={player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:0};
  const noTarget={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const events=[];
  const root=actorObservation(x.state,seat);
  assert.equal(root.ownPublic.active.printing,MARSHADOW);
  assert.deepEqual(root.opponentPublic.stadium,[THUNDER]);
  assert.equal(root.ownPublic.bench.filter(Boolean).length,0);
  const before={turn:x.state.turn,ownerHand:x.owner.hand.cards.map(c=>c.fullName),
    ownerActive:x.owner.active.getPokemonCard()?.fullName,
    oppStadium:x.opponent.stadium.cards.map(c=>c.fullName)};
  playPhysical(x,FOG,noTarget);
  events.push({step:'Fog Crystal PlayCardAction',prompts:settleNative(x,true),
    ownerHand:x.owner.hand.cards.map(c=>c.fullName)});
  assert.ok(x.owner.hand.cards.some(c=>c.fullName===SHADOW),
    'Native Fog resolution did not place target Basic into owner hand');
  playPhysical(x,SHADOW,ownBench);
  events.push({step:'Shadow Rider Basic Bench PlayCardAction',
    prompts:settleNative(x),benched:x.owner.bench[0].getPokemonCard()?.fullName});
  assert.equal(x.owner.bench[0].getPokemonCard()?.fullName,SHADOW);
  const paymentCard=payment==='floatstone'?FLOAT:ENERGY;
  playPhysical(x,paymentCard,ownActive);
  events.push({step:paymentCard+' Active PlayCardAction',
    prompts:settleNative(x),
    activeTools:x.owner.active.tools?.map(c=>c.fullName)??[],
    activeEnergy:x.owner.active.energies.cards.map(c=>c.fullName)});
  x.store.dispatch(new RetreatAction(x.owner.id,0));
  events.push({step:'RetreatAction to Shadow Rider',
    prompts:settleNative(x),
    ownerActive:x.owner.active.getPokemonCard()?.fullName,
    ownerBench:x.owner.bench.map(s=>s.getPokemonCard()?.fullName??null),
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName)});
  assert.equal(x.owner.active.getPokemonCard()?.fullName,SHADOW);
  assert.equal(x.owner.bench[0].getPokemonCard()?.fullName,MARSHADOW);
  assert.equal(x.state.activePlayer,seat);
  x.store.dispatch(new UseAbilityAction(x.owner.id,'Resetting Hole',
    ownBench));
  events.push({step:'Benched Resetting Hole UseAbilityAction',
    prompts:settleNative(x),
    opponentLostZone:x.opponent.lostzone.cards.map(c=>c.fullName),
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName)});
  assert.ok(x.opponent.lostzone.cards.some(c=>c.fullName===THUNDER));
  assert.equal(x.opponent.stadium.cards.some(c=>c.fullName===THUNDER),false);
  assert.equal(x.opponent.discard.cards.some(c=>c.fullName===THUNDER),false);
  assert.ok(x.owner.discard.cards.some(c=>c.fullName===MARSHADOW));
  assert.equal(x.owner.bench[0].getPokemonCard(),undefined);
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.turn,before.turn);
  if(payment==='psychic-energy')
    assert.ok(x.owner.discard.cards.some(c=>c.fullName===ENERGY));
  else
    assert.ok(x.owner.discard.cards.some(c=>c.fullName===FLOAT));
  return {seat,payment,before,events,
    success:true,
    finalActive:x.owner.active.getPokemonCard()?.fullName,
    finalStadium:x.opponent.stadium.cards.map(c=>c.fullName),
    opponentLostZone:x.opponent.lostzone.cards.map(c=>c.fullName),
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName),
    nativeTurnPreserved:true};
}

function run(){
  const rows=[];
  for(const seat of [0,1]){
    for(const payment of ['floatstone','psychic-energy']){
      try{rows.push(runArm(seat,payment));}
      catch(e) {rows.push({seat,payment,success:false,error:String(e?.stack??e)});}
    }
  }
  return {schema:'agent5-forced-active-marshadow-complete-chain-v1',
    enginePin:PIN,preregistration:
    'results/aichi-2026/registrations/agent5-forced-active-marshadow-chain-20261102.md',
    attemptedArms:4,nativeSuccesses:rows.filter(r=>r.success).length,
    rows,competitiveQualifiedGames:0,
    note:'Only staged native Store mechanics. Original sixty shuffle, opponent ability and match performance remain untested.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stageForcedActive,settleNative,runArm,run};
