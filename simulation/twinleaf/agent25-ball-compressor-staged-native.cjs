'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withCorrectedHnsDiscardAbilityCount,pin,VERSION:HOOK_VERSION}=
  require('./agent25-hns-discard-ability-lock-paper-hook.cjs');
const registration=require('../../results/als/registrations/agent25-ball-one-compressor-staged-store-20261104.json');

const VERSION='agent25-ball-one-compressor-staged-native-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=file=>require(path.join(output,file));

/**
 * Explicit artificial midgame state with physically distinct source cards.
 * This is a card-interaction canary; it has no initial deal, bot decision,
 * competent opponent, full physical 60, or competitive value.
 * @param {0|1} seat
 * @param {'Shuppet M5'|'Grass Energy MEE'} paymentName
 * @returns {object}
 */
function runArm(seat,paymentName){
  assert.ok(seat===0||seat===1);
  assert.ok(paymentName==='Shuppet M5'||paymentName==='Grass Energy MEE');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const attackCard=f.card('Dhelmise M5');
  const energy=f.card('Psychic Energy SVE');
  const ball=f.card('Quick Ball SSH');
  const compressor=f.card('Battle Compressor PHF');
  const payment=f.card(paymentName);
  const searchBasic=f.card('Dhelmise M5');
  const donors=[f.card('Banette M5'),
    f.card('Banette M5'),f.card('Banette M5')];
  f.source.active.cards.length=0;
  f.source.active.energies.cards.length=0;
  f.source.active.cards.push(attackCard,energy);
  f.source.active.energies.cards.push(energy);
  f.source.hand.cards.push(ball,payment,compressor);
  f.source.deck.cards.length=0;
  f.source.deck.cards.push(...donors,searchBasic,
    f.card('Psychic Energy SVE'),
    f.card('Psychic Energy SVE'),
    f.card('Psychic Energy SVE'));
  assert.equal(f.source.discard.cards.length,0);
  assert.equal(f.source.deck.cards.length,7);
  assert.equal(f.source.hand.cards.length,3);
  assert.equal(f.opponent.active.getPokemonCard().fullName,
    'Shadow Rider Calyrex V CRE');
  assert.equal(f.opponent.active.damage,10);

  const trace=[];
  const result={
    seat,paymentName,version:VERSION,pin,hookVersion:HOOK_VERSION,
    syntheticBoard:true,initialSourceFullSixty:false,
    competitiveQualifiedGames:0,trace
  };
  const snapshot=()=>({
    hand:f.source.hand.cards.map(c=>({name:c.fullName,id:c.id})),
    deck:f.source.deck.cards.map(c=>({name:c.fullName,id:c.id})),
    discard:f.source.discard.cards.map(c=>({name:c.fullName,id:c.id})),
    active:f.source.active.getPokemonCard()?.fullName??null,
    activeEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    opponentDamage:f.opponent.active.damage,
    pending:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>({type:p.constructor.name,source:p.sourceCard?.fullName??null}))
  });
  function settle(operation){
    for(let i=0;i<15;i++){
      const p=f.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const type=p.constructor.name;
      let answer;
      if(type==='WaitPrompt')answer=null;
      else if(type==='ShowCardsPrompt')answer=true;
      else if(type==='ShuffleDeckPrompt')answer=
        Array.from({length:f.source.deck.cards.length},(_,j)=>j);
      else if(type==='ChooseCardsPrompt'){
        if(p.cards===f.source.hand){
          assert.equal(operation,'Quick Ball SSH');
          answer=[payment];
        }else if(p.cards===f.source.deck){
          answer=operation==='Quick Ball SSH'?[searchBasic]:donors;
        }else throw new Error('Unrecognized owner card source '+type);
      }else throw new Error('Unexpected native '+operation+
        ' prompt '+type);
      const valid=typeof p.validate==='function'?
        p.validate(answer,f.state):null;
      assert.notEqual(valid,false,'Native prompt validator rejected '+type);
      const before=snapshot();
      f.store.dispatch(new ResolvePromptAction(p.id,answer));
      trace.push({stage:operation,action:'ResolvePromptAction',
        promptType:type,nativeValidatorAccepted:valid,
        chosen:Array.isArray(answer)?answer.map(x=>
          typeof x==='number'?x:{name:x.fullName,id:x.id}):answer,
        before,after:snapshot()});
    }
    assert.equal(f.state.prompts.filter(p=>p.result===undefined).length,0,
      'Unexpected pending native '+operation+' prompt');
  }
  function playItem(card,operation){
    const index=f.source.hand.cards.indexOf(card);
    assert.ok(index>=0,operation+' absent from own hand');
    const before=snapshot();
    f.store.dispatch(new PlayCardAction(f.source.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    trace.push({stage:operation,action:'PlayCardAction',before,
      after:snapshot(),accepted:true});
    settle(operation);
    assert.ok(f.source.discard.cards.includes(card),
      'Played Item missing from own discard: '+operation);
  }
  try{
    playItem(ball,'Quick Ball SSH');
    assert.ok(f.source.discard.cards.includes(payment),
      'Quick Ball must actually discard its held physical donor/payment');
    assert.ok(f.source.hand.cards.includes(searchBasic),
      'Quick Ball physical Basic search did not settle');
    assert.ok(!f.source.deck.cards.includes(searchBasic),
      'Quick Ball Basic target remains in source deck');
    playItem(compressor,'Battle Compressor PHF');
    for(const donor of donors){
      assert.ok(!f.source.deck.cards.includes(donor));
      assert.ok(f.source.discard.cards.includes(donor));
    }
    assert.ok(f.source.active.energies.cards.includes(energy));
    const expectedDonors=paymentName==='Shuppet M5'?4:3;
    assert.equal(f.source.discard.cards.filter(c=>
      ['Banette','Shuppet','Sinistcha'].includes(c.name)).length,
      expectedDonors);
    const attack=()=> {
      const before=snapshot();
      f.store.dispatch(new AttackAction(f.source.id,'Vengeful Anchor'));
      trace.push({stage:'Vengeful Anchor',action:'AttackAction',
        before,after:snapshot(),accepted:true});
      settle('Vengeful Anchor');
      return snapshot();
    };
    const executed=withCorrectedHnsDiscardAbilityCount(attack);
    result.attackCorrectedHookAudit=executed.audit;
    result.postAttack=executed.result;
    const expectedDamage=expectedDonors===4?170:30;
    assert.equal(f.opponent.active.damage,10+expectedDamage,
      'Native Vengeful Anchor damage did not match paid HNS donor threshold');
    result.status='STAGED_NATIVE_ACTIONS_SETTLED';
    result.paidHandDiscardIdentity=payment.id;
    result.paidDeckDonorIds=donors.map(c=>c.id);
    result.actualHnsDonors=expectedDonors;
    result.actualDamage=expectedDamage;
    result.allNativePromptsClosed=true;
  }catch(error){
    result.status='STAGED_NATIVE_ERROR';
    result.error=String(error?.message??error);
    result.failureState=snapshot();
  }
  return result;
}

function study(){
  assert.equal(registration.version,
    'agent25-one-ball-one-compressor-staged-native-store-v1-precommit');
  const arms=[];
  for(const seat of [0,1]){
    for(const payment of ['Shuppet M5','Grass Energy MEE'])
      arms.push(runArm(seat,payment));
  }
  const allPassed=arms.length===4&&arms.every(a=>
    a.status==='STAGED_NATIVE_ACTIONS_SETTLED'&&
    a.actualDamage=== (a.paymentName==='Shuppet M5'?170:30));
  return {version:VERSION,registration:registration.version,
    nativePin:pin,allPassed,arms,
    syntheticStagedMidgame:true,naturalDealQualified:false,
    competitiveGameQualified:false,qualifiedGames:0};
}
module.exports={VERSION,runArm,study};
if(require.main===module){
  const result=study();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.allPassed)process.exitCode=1;
}
