'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {ticketPostShuffleAccess}=require('../scripts/aichi-ticket-postshuffle-access.cjs');
test('direct Ticket plus Compressor and one subsequent draw',()=>{
  const result=ticketPostShuffleAccess(60,12,7,6,4,1);
  assert.equal(result.cardsRemaining,46);
  assert.ok(Math.abs(result.unconditionalAfterShuffle-0.00011003985764496337)<1e-12);
});

/** Enumerate all ordered physical mini-deck prefixes and uniform DCE positions. */
function independent(n,b,h,q,c,k){
  const cards=['D','T',...Array.from({length:c},(_,i)=>'C'+i),...Array.from({length:b},(_,i)=>'B'+i)];
  while(cards.length<n)cards.push('X'+cards.length);
  const used=Array(n).fill(false),order=[];
  let legal=0,route=0,post=0,plain=0;
  function visit(){
    if(order.length===h+q+1){
      if(!order.slice(0,h).some(x=>x[0]==='B'))return;
      legal++;
      if(!order.slice(h,h+q).includes('D'))return;
      const seen=order.slice(0,h).concat(order[h+q]);
      if(!seen.includes('T')||!seen.some(x=>x[0]==='C'))return;
      route++;
      const remaining=n-h-q-1;
      post+=k;
      plain+=remaining*Math.max(0,k-(remaining-q))/q;
      return;
    }
    for(let i=0;i<n;i++){
      if(used[i])continue;
      used[i]=true;order.push(cards[i]);visit();order.pop();used[i]=false;
    }
  }
  visit();
  const remaining=n-h-q-1;
  return {route:route/legal,post:post/(legal*remaining),plain:plain/(legal*remaining)};
}
test('independent mini-deck enumerations agree with exact first-turn model',()=>{
  for(const [n,b,h,q,c] of [[9,2,2,2,1],[10,3,2,2,1]]){
    const rem=n-h-q-1;
    for(const k of [0,1,2,rem-1,rem]){
      const result=ticketPostShuffleAccess(n,b,h,q,c,k);
      const counted=independent(n,b,h,q,c,k);
      assert.ok(Math.abs(counted.route-result.directTicketCompressor)<1e-12);
      assert.ok(Math.abs(counted.post-result.unconditionalAfterShuffle)<1e-12);
      assert.ok(Math.abs(counted.plain-result.unconditionalWithoutShuffle)<1e-12);
    }
  }
});
test('invalid draw horizons are rejected',()=>{
  assert.throws(()=>ticketPostShuffleAccess(60,12,7,6,4,-1),RangeError);
  assert.throws(()=>ticketPostShuffleAccess(60,12,7,6,4,47),RangeError);
  assert.throws(()=>ticketPostShuffleAccess(10,2,2,4,1,0),RangeError);
});
