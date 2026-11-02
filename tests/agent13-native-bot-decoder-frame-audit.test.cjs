'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {safeDecoderFrameAttribution}=
  require('../simulation/twinleaf/native-dispatch-abort-evidence.cjs');

test('sanitizes source locations and never copies private card data',()=>{
  const error=new TypeError('SECRET_CARD_HAND ID 1234');
  error.stack=[
    'TypeError: SECRET_CARD_HAND ID 1234',
    '    at choose (C:\\workspace\\simulation\\twinleaf\\actor-root.cjs:107:19)',
    '    at wrapped (/srv/repo/simulation/twinleaf/headless.cjs:1096:38)',
    '    at internal (node:internal/process/task_queues:95:5)',
    '    at revealSecret (/srv/repo/simulation/twinleaf/SECRET_CARD_HAND.txt:1:1)'
  ].join('\n');
  const result=safeDecoderFrameAttribution(error);
  assert.equal(result.errorClass,'TypeError');
  assert.deepEqual(result.frames,[
    {file:'actor-root.cjs',line:107,column:19},
    {file:'headless.cjs',line:1096,column:38}
  ]);
  assert.equal(JSON.stringify(result).includes('SECRET_CARD_HAND'),false);
  assert.equal(JSON.stringify(result).includes('workspace'),false);
});

test('unknown subclasses and unparseable stacks fail closed to bounded source data',()=>{
  const error={name:'SecretMewMatchupInjected',stack:'Hidden Info: Mew\n internal'};
  assert.deepEqual(safeDecoderFrameAttribution(error),
    {errorClass:'OtherError',frames:[]});
});

test('decoder attribution does not affect the established public abort receipt',()=>{
  const error=new Error('Private donor identity');
  error.stack='Error: PRIVATE DONOR\n at ai (C:\\x\\ai.cjs:4:18)';
  const frames=safeDecoderFrameAttribution(error);
  assert.deepEqual(frames.frames,[{file:'ai.cjs',line:4,column:18}]);
  assert.equal(Object.hasOwn(error,'nativeAbortEvidence'),false);
});
