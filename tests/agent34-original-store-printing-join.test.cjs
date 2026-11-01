'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {joinOriginalStorePrintings}=require(
  '../simulation/evaluation/agent34-original-store-printing-join.cjs');
const stamp=(ordinal,seat,card,actionOrdinal)=>({
  ordinal,seat,cardName:card,printing:card+' CEC 205',
  executableConstructor:'RuntimeCard',
  executablePrototypeToken:1,accepted:true,
  actionOrdinal
});
const root=(ordinal,seat,card)=>({
  actionOrdinal:ordinal,playerSlot:seat,
  action:'PlayCardAction',card
});
function fixture(){
  return {
    ledger:[root(11,1,'Roxie'),root(15,0,'Ultra Ball')],
    receipt:{version:'agent34-original-store-playcard-instance-v1',
      originalStoreCaptured:true,rejectedPlayCardRoots:0,
      acceptedPlayCardRoots:2,
      accepted:[stamp(22,1,'Roxie'),stamp(27,0,'Ultra Ball')]}
  };
}
test('ordered genuine physical cards join unchanged native roots',()=>{
  const f=fixture();
  const prior=JSON.stringify(f.ledger);
  const r=joinOriginalStorePrintings(f.ledger,f.receipt);
  assert.equal(r.sequentialNameSeatPrintingJoin,true);
  assert.equal(r.rows[0].physicalPrinting,'Roxie CEC 205');
  assert.equal(r.rows[1].physicalPrinting,'Ultra Ball CEC 205');
  assert.equal(r.paperPaymentValidity,'unverified');
  assert.equal(r.exactActionObjectIdentityVerified,false);
  assert.equal(r.competitiveGameQualified,false);
  assert.equal(JSON.stringify(f.ledger),prior);
});
test('wrong physical seat, name, printed set or absent code identity veto',()=>{
  for(const mutate of [
    f=>f.receipt.accepted[0].seat=0,
    f=>f.receipt.accepted[1].cardName='Computer Search',
    f=>f.receipt.accepted[0].printing=null,
    f=>f.receipt.accepted[1].executableConstructor=null,
    f=>f.receipt.accepted[0].executablePrototypeToken=null
  ]){
    const f=fixture();mutate(f);
    assert.equal(joinOriginalStorePrintings(f.ledger,f.receipt)
      .sequentialNameSeatPrintingJoin,false);
  }
});
test('missing, extra or rejected original Store plays retain explicit vetoes',()=>{
  const f=fixture();
  f.receipt.accepted.pop();
  assert.equal(joinOriginalStorePrintings(f.ledger,f.receipt)
    .sequentialNameSeatPrintingJoin,false);
  f.receipt.accepted.push(stamp(27,0,'Ultra Ball'));
  f.receipt.accepted.push(stamp(30,0,'Ultra Ball'));
  const extra=joinOriginalStorePrintings(f.ledger,f.receipt);
  assert.equal(extra.sequentialNameSeatPrintingJoin,false);
  assert.equal(extra.extraStoreReceipts.length,1);
  f.receipt.accepted.pop();
  f.receipt.rejectedPlayCardRoots=1;
  assert.equal(joinOriginalStorePrintings(f.ledger,f.receipt)
    .sequentialNameSeatPrintingJoin,false);
});
test('duplicate, reordered, zero roots and clone-only observation veto',()=>{
  const f=fixture();
  f.ledger[1].actionOrdinal=11;
  assert.equal(joinOriginalStorePrintings(f.ledger,f.receipt)
    .sequentialNameSeatPrintingJoin,false);
  const g=fixture();
  g.receipt.accepted.reverse();
  assert.equal(joinOriginalStorePrintings(g.ledger,g.receipt)
    .sequentialNameSeatPrintingJoin,false);
  const h=fixture();
  h.ledger=[];h.receipt.accepted=[];h.receipt.acceptedPlayCardRoots=0;
  assert.equal(joinOriginalStorePrintings(h.ledger,h.receipt)
    .sequentialNameSeatPrintingJoin,false);
  h.receipt.originalStoreCaptured=false;
  assert.equal(joinOriginalStorePrintings(h.ledger,h.receipt)
    .sequentialNameSeatPrintingJoin,false);
});
