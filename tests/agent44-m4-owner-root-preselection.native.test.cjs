'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withM4PaperOwnerRoot}=require('../simulation/twinleaf/agent44-m4-owner-root-preselection.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(output,'game/store/actions/play-card-action'));
const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {0|1} seat @param {number} prizes @param {number} hand */
function sourceRoot(seat,prizes,hand){
  const x=stage(seat);
  const manager=initializeCards();
  const m4=manager.getCardByName('Special Red Card M4');
  assert.ok(m4);
  x.owner.hand.cards.unshift(m4);
  for(let i=prizes;i<6;i++)
    x.opponent.prizes[i].moveTo(x.opponent.deck);
  for(let i=0;i<hand;i++)
    x.opponent.hand.cards.push(manager.getCardByName('Fog Crystal CRE'));
  assert.equal(x.opponent.prizes.filter(p=>p.cards.length).length,prizes);
  assert.equal(x.opponent.hand.cards.length,hand);
  assert.equal(x.owner.hand.cards[0].fullName,'Special Red Card M4');
  return {...x,m4};
}

/** @param {object} x */
function nativeCanPlayChooser(x){
  return x.m4.canPlay(x.store,x.store.state,x.owner)?
    new PlayCardAction(x.owner.id,0,target):{kind:'other-option'};
}
for(const seat of [0,1]){
  test('genuine native owner M4 hand-zero gate changes chooser, seat '+seat,()=>{
    const x=sourceRoot(seat,3,0),audits=[];
    assert.equal(x.m4.canPlay(x.store,x.store.state,x.owner),true);
    const action=withM4PaperOwnerRoot(x.store.state,seat,
      ()=>nativeCanPlayChooser(x),r=>audits.push(r));
    assert.equal(action.kind,'other-option');
    assert.equal(audits.length,1);
    assert.equal(audits[0].provenPaperBlockedCopies,1);
    assert.equal(audits[0].nativeCanPlayHandVetoInstalled,true);
    assert.equal(audits[0].attemptedPaperInvalidM4,false);
    assert.equal(x.m4.canPlay(x.store,x.store.state,x.owner),true);
    assert.equal(x.owner.hand.cards[0],x.m4);
    console.log('AGENT44_M4_OWNER_ROOT_PAPER_VETO',JSON.stringify(audits[0]));
  });
  test('M4 genuine native allowed hand and original Prize gates, seat '+seat,()=>{
    const allowed=sourceRoot(seat,3,1),a=[];
    const selected=withM4PaperOwnerRoot(allowed.store.state,seat,
      ()=>nativeCanPlayChooser(allowed),r=>a.push(r));
    assert.ok(selected instanceof PlayCardAction);
    assert.equal(a[0].provenPaperBlockedCopies,0);
    assert.equal(a[0].nativeCanPlayHandVetoInstalled,false);
    assert.equal(a[0].paperPlayableCertified,false);
    const forbidden=sourceRoot(seat,4,1),b=[];
    const other=withM4PaperOwnerRoot(forbidden.store.state,seat,
      ()=>nativeCanPlayChooser(forbidden),r=>b.push(r));
    assert.equal(other.kind,'other-option');
    assert.equal(b[0].provenPaperBlockedCopies,1);
    assert.equal(b[0].nativeCanPlayHandVetoInstalled,false);
  });
  test('uncooperative M4 choice fails closed before physical dispatch, seat '+seat,()=>{
    const x=sourceRoot(seat,3,0),audits=[];
    assert.throws(()=>withM4PaperOwnerRoot(x.store.state,seat,
      ()=>new PlayCardAction(x.owner.id,0,target),r=>audits.push(r)),
    /Paper-invalid Special Red Card/);
    assert.equal(audits[0].attemptedPaperInvalidM4,true);
    assert.equal(x.m4.canPlay(x.store,x.store.state,x.owner),true);
    assert.equal(x.owner.hand.cards[0],x.m4);
  });
  test('decoder failure restores exact native method, seat '+seat,()=>{
    const x=sourceRoot(seat,3,0);
    assert.throws(()=>withM4PaperOwnerRoot(x.store.state,seat,()=>{
      assert.equal(x.m4.canPlay(x.store,x.store.state,x.owner),false);
      throw Error('controlled decode abort');
    }),/controlled decode abort/);
    assert.equal(x.m4.canPlay(x.store,x.store.state,x.owner),true);
    assert.equal(x.owner.hand.cards[0],x.m4);
  });
}
