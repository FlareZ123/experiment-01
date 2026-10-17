'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'../simulation/twinleaf');
const prefix=[
  '// Historical version retained solely to reproduce old rank10 trials.',
  '// Source: git revision a0457938c56e31b2856d7b4524e0318e94e3f452.',
  '// The original cross-Store card-object identity check is intentionally retained.',
  '// Do not use this archival tactic for new competitive inference.',
  ''
].join('\n');

/** @param {string} source @returns {string} */
function gitBlobSha(source) {
  const header=Buffer.from('blob '+Buffer.byteLength(source)+'\\0','utf8');
  return crypto.createHash('sha1').update(header)
    .update(source,'utf8').digest('hex');
}

test('archival v3 tactic remains byte-identical to historic Git blob',()=>{
  const content=fs.readFileSync(path.join(root,'dde-attach-tactic-v3-archive.cjs'),'utf8');
  assert.ok(content.startsWith(prefix));
  const historic=content.slice(prefix.length);
  assert.equal(gitBlobSha(historic),'16b89be7a0afe28dbbd603cae56c88550bed42b4');
  assert.match(historic,/location\.cards\.includes\(wanted\)/);
});

test('current v4 fix stays separate from archival v3 source identity',()=>{
  const current=fs.readFileSync(path.join(root,'dde-attach-tactic.cjs'),'utf8');
  const runner=fs.readFileSync(path.join(root,'headless.cjs'),'utf8');
  assert.match(current,/DoubleDragonAttachTactic-v4/);
  assert.match(current,/location\.cards\.includes\(selectedEnergy\)/);
  assert.match(runner,/doubleDragonArchiveV3\s*===\s*true/);
  assert.match(runner,/dde-attach-tactic-v3-archive\.cjs/);
});
