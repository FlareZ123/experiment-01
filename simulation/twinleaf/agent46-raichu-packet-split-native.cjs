'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu}=require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook}=
  require('./electro-rain-damage-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));

/**
 * Test whether pinned native PutDamagePrompt enforces Electro Rain's printed
 * per-Energy 30-damage packet size at the real Alolan Raichu attack resolution.
 * Original Aichi rank4 and rank17 both use the exact UNM 57 printing.
 *
 * @param {boolean} illegalSplit Submit 10 active + 20 Bench from one 30 packet.
 * @param {boolean} [guarded] Install the reversible paper-validating Store hook.
 * @returns {object} Native prompt, reply and visible board changes.
 */
function probeElectroRainPacketSplit(illegalSplit,guarded=false){
  const f=stagedRaichu(['Unit Energy LPM UPR'],null);
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const base=f.card('Pikachu LOR');
  f.a.active.cards.unshift(base);
  const bench=new PokemonCardList();
  const victim=f.card('Shadow Rider Calyrex V CRE');
  bench.cards.push(victim);
  f.b.bench.push(bench);
  base.id=1000;
  f.a.active.getPokemonCard().id=1001;
  f.attached[0].id=1002;
  f.b.active.getPokemonCard().id=2000;
  victim.id=2001;
  for(const player of [f.a,f.b]){
    player.deck.cards.push(f.card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  let check=null;
  const resolveAttack=()=>{
    f.store.dispatch(new AttackAction(f.a.id,'Electro Rain'));
    for(let i=0;i<20;i++){
      const prompt=f.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const type=prompt.constructor.name;
      let answer;
      if(type==='ChooseCardsPrompt'){
        answer=[...f.attached];
      }else if(type==='PutDamagePrompt'){
        assert.equal(prompt.damage,30);
        assert.equal(prompt.options.damageMultiple,30);
        answer=illegalSplit?[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},
            damage:10},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
            damage:20}
        ]:[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},
            damage:30}
        ];
        check={
          promptDamage:prompt.damage,
          damageMultiple:prompt.options.damageMultiple,
          returnedRows:answer,
          nativeValidatorAccepted:prompt.validate(answer,f.state)
        };
      }else if(type==='WaitPrompt'){
        answer=null;
      }else{
        throw new Error('Unexpected Electro Rain prompt '+type);
      }
      f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }
    assert.ok(!f.state.prompts.some(p=>p.result===undefined),
      'Native Electro Rain prompts must settle');
  };
  let dispatchError=null;
  try{
    if(guarded){
      const {withPutDamageZeroCapPaperHook}=
        require('./put-damage-zero-cap-paper-hook.cjs');
      withPutDamageZeroCapPaperHook(()=>
        withElectroRainDamageHook(resolveAttack));
    }else{
      withElectroRainDamageHook(resolveAttack);
    }
  }catch(e){
    dispatchError=String(e?.message??e);
  }
  assert.ok(check,'Must have reached the real native damage prompt');
  return {
    sourcePrinting:'Alolan Raichu UNM 57',
    opponentPrintings:['Shadow Rider Calyrex V CRE','Shadow Rider Calyrex V CRE'],
    illegalSplit,guarded,
    ...check,dispatchError,
    publicDamage:{active:f.b.active.damage,bench:bench.damage},
    unresolvedPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    attachedEnergyDiscarded:
      f.a.discard.cards.some(c=>c.fullName==='Unit Energy LPM UPR')
  };
}

function run(){
  const legal=probeElectroRainPacketSplit(false);
  const split=probeElectroRainPacketSplit(true);
  const guardedLegal=probeElectroRainPacketSplit(false,true);
  const guardedSplit=probeElectroRainPacketSplit(true,true);
  assert.equal(legal.nativeValidatorAccepted,true);
  assert.equal(legal.publicDamage.active,30);
  assert.equal(legal.publicDamage.bench,0);
  assert.equal(legal.attachedEnergyDiscarded,true);
  assert.equal(split.attachedEnergyDiscarded,true);
  assert.equal(split.dispatchError,null);
  assert.deepEqual(guardedLegal.publicDamage,legal.publicDamage);
  assert.equal(guardedLegal.dispatchError,null);
  assert.match(guardedSplit.dispatchError,
    /PAPER_PUT_DAMAGE_REJECTED:INVALID_PRINTED_DAMAGE_PACKET/,
    'Native Store paper guard must reject fractional 30-damage packet');
  assert.deepEqual(guardedSplit.publicDamage,{active:0,bench:0},
    'Rejected fractional-packet action must leave all targets undamaged');
  assert.deepEqual(guardedSplit.unresolvedPrompts,['PutDamagePrompt'],
    'Paper-rejected prompt remains pending for a later valid reply');
  const out={
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    status:'native-original-printing-attack-prompt-characterization',
    legal,split,guardedLegal,guardedSplit,
    failure:split.nativeValidatorAccepted&&
      split.publicDamage.active===10&&split.publicDamage.bench===20?
      'pinned-store-accepts-paper-forbidden-10-plus-20-packet':
      'native-rejection-or-damage-normalization',
    benchmark:'original ranks4/17 contain Alolan Raichu UNM, no full-game qualification'
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={probeElectroRainPacketSplit,run};
