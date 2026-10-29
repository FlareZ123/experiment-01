'use strict';
const assert=require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {choosePublicContextSpecialEnergy}=
  require('./agent17-public-context-special-energy.cjs');
const {stage,nativeAttack}=
  require('./agent5-attack-special-arbitration-native.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const path=require('node:path');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

const DD='Double Dragon Energy ROS';
const P='Psychic Energy SVE';
const options={publicContextSpecialEnergy:true};

/** @param {object} x @param {number} world */
function conceal(x,world){
  const cards=initializeCards();
  let id=900000+world*100;
  const fresh=name=>{
    const card=cards.getCardByName(name);
    assert.ok(card,name);card.id=id++;return card;
  };
  if(world===0){
    x.owner.deck.cards[0]=fresh(DD);
    x.opponent.hand.cards.push(fresh(DD));
  }else{
    x.owner.prizes[0].cards[0]=fresh(DD);
    x.opponent.deck.cards[0]=fresh(DD);
    x.opponent.hand.cards.push(fresh(P));
  }
}

/** @param {object} x */
function inventories(x){
  const identity=p=>p.map(c=>c.fullName).sort();
  return {
    owner:identity([...x.owner.deck.cards,
      ...x.owner.prizes.flatMap(p=>p.cards)]),
    opponent:identity([...x.opponent.hand.cards,
      ...x.opponent.deck.cards,
      ...x.opponent.prizes.flatMap(p=>p.cards)])
  };
}

/** @param {0|1} seat */
function verifySeat(seat){
  const rows=[];
  for(let world=0;world<2;world++){
    const x=stage(seat);
    conceal(x,world);
    const view=actorObservation(x.state,seat);
    const chosen=chooseActorRootIntent(view,x.catalog,options);
    const alternate=choosePublicContextSpecialEnergy(view,x.catalog);
    assert.deepStrictEqual(chosen,{kind:'attack',attackName:'Gnaw'});
    assert.deepStrictEqual(alternate,{kind:'attach-special-energy',
      printing:DD,handIndex:0,slot:'bench',index:1});
    const settled=nativeAttack(x);
    const alt=stage(seat);
    conceal(alt,world);
    assert.deepStrictEqual(actorObservation(alt.state,seat),view);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const prior=rootPhysicalSnapshot(alt.state,seat,alternate);
    alt.store.dispatch(new PlayCardAction(alt.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    const following=rootPhysicalSnapshot(alt.state,seat,alternate);
    assert.equal(rootPhysicalWitness(alternate,prior,following,alt.GamePhase),
      'confirmed-public-effect');
    assert.deepStrictEqual(alt.owner.bench[1].energies.cards
      .map(card=>card.fullName),[DD]);
    assert.equal(alt.owner.hand.cards.length,0);
    assert.deepStrictEqual(chooseActorRootIntent(
      actorObservation(alt.state,seat),alt.catalog,options),
      {kind:'attack',attackName:'Gnaw'});
    const settledAfterAttach=nativeAttack(alt);
    assert.equal(settled.damageAfter,settledAfterAttach.damageAfter);
    const physical={
      ownerDeckTop:x.owner.deck.cards[0].fullName,
      ownerPrizeFirst:x.owner.prizes[0].cards[0].fullName,
      opponentHandFirst:x.opponent.hand.cards[0].fullName,
      opponentDeckTop:x.opponent.deck.cards[0].fullName
    };
    rows.push({world,view,chosen,alternate,inventory:inventories(x),
      physical,damage:settled.damageAfter,
      attachThenAttackDamage:settledAfterAttach.damageAfter});
  }
  assert.notDeepStrictEqual(rows[0].physical,rows[1].physical,
    'The two concealed worlds must really be physically different');
  const publicChange=stage(seat);
  conceal(publicChange,0);
  publicChange.owner.active.damage=10;
  assert.notDeepStrictEqual(actorObservation(publicChange.state,seat),
    rows[0].view,'Public damage perturbation must change the actor view');
  assert.deepStrictEqual(rows[0].view,rows[1].view,
    'Owner observation changed across unseen K0 card arrangements');
  assert.deepStrictEqual(rows[0].inventory,rows[1].inventory,
    'Physical card multiset must remain fixed across worlds');
  assert.deepStrictEqual(rows[0].chosen,rows[1].chosen);
  assert.deepStrictEqual(rows[0].alternate,rows[1].alternate);
  assert.equal(rows[0].damage,rows[1].damage);
  assert.equal(rows[0].attachThenAttackDamage,
    rows[1].attachThenAttackDamage);
  return {seat,ownerViewInvariant:true,physicalInventoryPreserved:true,
    chosen:rows[0].chosen,alternative:rows[0].alternate,
    genuineNativeAttackSettledInBothWorlds:true,
    nativeAlternativeAttachmentAndAttackSettledInBothWorlds:true,
    actualDamage:rows[0].damage};
}
function run(){
  return {schema:'agent18-k0-root-native-invariance-v2',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    records:[verifySeat(0),verifySeat(1)],
    competitiveQualifiedGames:0,
    limit:'Staged non-60 root; no source-dealt matchup or strategic rank.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={conceal,inventories,verifySeat,run};
