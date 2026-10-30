'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {inspect}=require('../simulation/twinleaf/agent24-ace-nullifier-native-coverage.cjs');

const fake={
  'Spiritomb LTR':{name:'Spiritomb',set:'LTR',setNumber:'87',
    powers:[{name:'Sealing Scream',
      text:'Each player cannot play ACE SPEC cards.'}]},
  'Genesect SFA':{name:'Genesect',set:'SFA',setNumber:'40',
    powers:[{name:'ACE Nullifier',
      text:'Tool required for opponent-only ACE lock.'}]}
};
test('exact normal registered cards never become certified native effects',()=>{
  const r=inspect({getCardByName:name=>fake[name]??null});
  assert.equal(r.results.length,2);
  assert.ok(r.results.every(x=>x.nativeCardRegistered&&
    x.exactNativePrinting&&x.namedNativeAbility&&
    !x.nativeEffectActuallySettled&&!x.competitiveQualified));
  assert.equal(r.results[0].ownAceBlockedByPaperText,true);
  assert.equal(r.results[1].nativeToolRequirement,true);
  assert.equal(r.results[1].ownAceBlockedByPaperText,false);
});
test('missing and mislabeled native registrations must be explicit',()=>{
  const missing=inspect({getCardByName:()=>null});
  assert.ok(missing.results.every(x=>!x.nativeCardRegistered&&
    !x.exactNativePrinting&&!x.namedNativeAbility));
  const wrong=inspect({getCardByName:name=>
    name==='Genesect SFA'?{...fake['Genesect SFA'],
      setNumber:'41',powers:[]}:
      fake[name]??null});
  assert.equal(wrong.results[1].nativeCardRegistered,true);
  assert.equal(wrong.results[1].exactNativePrinting,false);
  assert.equal(wrong.results[1].namedNativeAbility,false);
  assert.equal(wrong.competitivelyQualifiedGames,0);
});
test('a native printed Ability renamed Ace Canceller is flagged explicitly',()=>{
  const renamed=inspect({getCardByName:name=>name==='Genesect SFA'?
    {...fake['Genesect SFA'],powers:[{
      name:'Ace Canceller',text:fake['Genesect SFA'].powers[0].text
    }]}:fake[name]??null});
  const g=renamed.results[1];
  assert.equal(g.exactNativePrinting,true);
  assert.equal(g.namedNativeAbility,false);
  assert.deepEqual(g.nativePowerNames,['Ace Canceller']);
  assert.deepEqual(g.nativeAcePowerNames,['Ace Canceller']);
  assert.equal(g.nativeEffectActuallySettled,false);
});
test('missing native registry interface is not silently passed',()=>{
  assert.throws(()=>inspect(null));
  assert.throws(()=>inspect({}));
});
