'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage,resolveOwnerRetreatPayment}=
  require('./agent21-owner-stranded-mew-retreat.native.test.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseStrandedFusionMewRetreat,MEW_VMAX,GENESECT_V,DCE}=
  require('../simulation/twinleaf/agent21-owner-stranded-fusion-mew-retreat.cjs');
const {nativeSinglePokemonChoices}=
  require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Full native paid retreat, printed Benched donor attack-selection prompt,
 * copy resolution, and damage/prize award on the actual Store.
 * This is staged mechanical evidence, not a natural shuffled original 60.
 * @param {0|1} seat
 * @returns {object}
 */
function playStagedPaidRetreatThenTechno(seat) {
  const staged=stage(seat,'Dedenne-GX UNB');
  const {store,state,owner,opponent,catalog}=staged;
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const physical=initializeCards().getCardByName('Lunatone OBF');
  assert.ok(physical);
  physical.id=93000+seat;
  const backup=new PokemonCardList();
  backup.cards.push(physical);
  opponent.bench.push(backup);

  const root=actorObservation(state,seat);
  const intent=chooseStrandedFusionMewRetreat(root,catalog);
  assert.ok(intent);
  assert.equal(intent.benchIndex,0);
  const {RetreatAction,AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const prizes=owner.prizes.filter(p=>p.cards.length>0).length;
  store.dispatch(new RetreatAction(owner.id,intent.benchIndex));
  resolveOwnerRetreatPayment(staged);
  assert.equal(owner.active.getPokemonCard().fullName,MEW_VMAX);
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===DCE));

  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  let technoSelections=0,chooseAttackPrompts=0;
  const settled=[];
  for(let i=0;i<48;i++) {
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    let selection;
    const kind=pending.constructor.name;
    if(kind==='ChooseAttackPrompt'){
      chooseAttackPrompts++;
      const donor=pending.cards.find(c=>c.fullName===GENESECT_V);
      assert.ok(donor,'Owner copied-attack prompt lacks real Benched Genesect');
      const techno=donor.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(techno);
      assert.equal(pending.validate(techno),true);
      selection=techno;technoSelections++;
    }else if(kind==='WaitPrompt')selection=null;
    else if(kind==='ChoosePrizePrompt'){
      const player=state.players.find(p=>p.id===pending.getPerspectivePlayerId());
      selection=player.prizes.filter(p=>p.cards.length>0).slice(0,pending.options.count);
      assert.equal(pending.validate(selection,state),true);
    }else if(kind==='ChoosePokemonPrompt'){
      const options=nativeSinglePokemonChoices(state,pending);
      assert.ok(options.length);
      selection=[options[0].physical];
      assert.equal(pending.validate(selection,state),true);
    }else assert.fail('Unrecognized real native copied-attack prompt '+kind);
    store.dispatch(new ResolvePromptAction(pending.id,selection));
    settled.push(kind);
  }
  assert.equal(state.prompts.some(p=>p.result===undefined),false,
    'Unsettled original Store attack/payment prompts');
  assert.equal(chooseAttackPrompts,1);
  assert.equal(technoSelections,1);
  assert.equal(owner.active.getPokemonCard().fullName,MEW_VMAX);
  assert.equal(owner.prizes.filter(p=>p.cards.length>0).length,prizes-2,
    'Techno Blast 210 should KO authentic two-Prize Tapu Lele-GX');
  assert.equal(opponent.active.getPokemonCard().fullName,'Lunatone OBF',
    'Opponent must promote its real prepared backup');
  return {
    seat,originalStrandedActive:'Dedenne-GX UNB',
    paidDceMovedToDiscard:true,mewRetainsOwnDce:true,
    originalGenesectDonorCopied:true,realPrompts:settled,
    prizeReduction:2,fullSourceOriginal60Shuffled:false,
    opponentPolicyQualified:false,competitiveGameQualified:false
  };
}
for(const seat of [0,1]){
  test('native owner DCE paid retreat + Genesect Techno Blast full settlement seat '+seat,
    ()=>{const x=playStagedPaidRetreatThenTechno(seat);
      assert.equal(x.prizeReduction,2);
      assert.equal(x.competitiveGameQualified,false);
    });
}
module.exports={playStagedPaidRetreatThenTechno};
