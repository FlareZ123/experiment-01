'use strict';
/*
 * Source-locked selective PR109 retreat certificate port (review-only).
 * Does not replace PR109's broader worker, frozen PR104 or candidate 60.
 * From a PR109 checkout, after owner review:
 * node agent10-pr109-retreat-cost-port.cjs <existing-worker.cjs> <new-output.cjs>
 * Refuses stale input, never overwrites, and never touches the source.
 */
const SOURCE_GIT_BLOB='a260ac66e405bc80060f461109cfbfc4a80ab1a0';
function replaceOnce(s,before,after,label){
  const at=s.indexOf(before);
  if(at<0||s.indexOf(before,at+1)>=0)
    throw Error('PR109 worker source drift: '+label);
  return s.slice(0,at)+after+s.slice(at+before.length);
}
function applyPr109NativeRetreatPort(input){
  if(typeof input!=='string'||input.length<10000)
    throw TypeError('Complete PR109 worker source required');
  let s=input;
  s=replaceOnce(s,
    'function scoreTrainerPlay(item, view, receipt) {',
    'function scoreTrainerPlay(item, view, receipt, rootItems=[]) {',
    'root options for Float Stone');
  s=replaceOnce(s,
    '        !freeRetreatKnown(view)) return 650;',
    [
      '        !freeRetreatKnown(view) &&',
      "        !rootItems.some(a=>a.kind==='retreat'&&",
      '          a.publicMetadata?.freeRetreat===true&&',
      '          a.publicMetadata?.retreatEnergyCost===0)) return 650;'
    ].join('\n'),
    'Float Stone certified opportunity cost');
  s=replaceOnce(s,
    [
      "  const isBasic = active.printed.subtypes.includes('Basic');",
      '  return isBasic && skylinerStatus(view) === true;'
    ].join('\n'),
    [
      '  const stage = active.printed?.stage;',
      "  // Pinned Stage.BASIC=2; PR94's canonical source stage is 'BASIC'.",
      '  // Native Card.subtypes does not represent evolutionary stage.',
      "  const isBasic = stage === 2 || stage === 'BASIC';",
      '  return isBasic && skylinerStatus(view) === true;'
    ].join('\n'),
    'native Basic stage');
  s=replaceOnce(s,
    [
      'function chooseRetreat(view, items, receipt) {',
      '  if (!freeRetreatKnown(view) || !view.opponentPublic.active) return null;'
    ].join('\n'),
    [
      'function chooseRetreat(view, items, receipt) {',
      '  if (!view.opponentPublic.active) return null;'
    ].join('\n'),
    'per-token native effective-cost gate');
  s=replaceOnce(s,
    [
      '  for (const item of retreats) {',
      '    const index = item.publicMetadata?.benchIndex;'
    ].join('\n'),
    [
      '  for (const item of retreats) {',
      '    const meta=item.publicMetadata??{};',
      '    const certified=meta.retreatEnergyCost!==undefined||meta.freeRetreat!==undefined;',
      '    // A native certificate overrides uncertain Ability/Tool inference.',
      '    // Incomplete or contradictory certificates fail closed.',
      '    const free=certified ?',
      '      meta.retreatEnergyCost===0&&meta.freeRetreat===true :',
      '      freeRetreatKnown(view);',
      '    if(!free){',
      "      recordPolicyAuditUnscored(item.token,'RETREAT_COST_NOT_PROVEN_ZERO');",
      '      continue;',
      '    }',
      '    const index = meta.benchIndex;'
    ].join('\n'),
    'native cost per retreat token');
  s=replaceOnce(s,
    '    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt);',
    '    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt, items);',
    'root decision items');
  return s;
}
function gitBlobHash(contents,crypto){
  return crypto.createHash('sha1')
    .update('blob '+Buffer.byteLength(contents,'utf8')+'\0')
    .update(contents,'utf8').digest('hex');
}
if(require.main===module){
  const fs=require('node:fs'),crypto=require('node:crypto');
  const [sourcePath,outputPath,...rest]=process.argv.slice(2);
  if(!sourcePath||!outputPath||rest.length||sourcePath===outputPath)
    throw Error('Usage: node <script> <exact PR109 worker path> <new output path>');
  const source=fs.readFileSync(sourcePath,'utf8');
  const sha=gitBlobHash(source,crypto);
  if(sha!==SOURCE_GIT_BLOB)
    throw Error('Refusing non-PR109 input. Expected '+SOURCE_GIT_BLOB+' got '+sha);
  const patched=applyPr109NativeRetreatPort(source);
  fs.writeFileSync(outputPath,patched,{encoding:'utf8',flag:'wx'});
  process.stdout.write(JSON.stringify({sourceBlob:sha,sourcePath,outputPath,
    status:'review-only output, original source unchanged',
    generatedBytes:Buffer.byteLength(patched,'utf8'),
    originalDeckAndFrozenPR104Untouched:true})+'\n');
}
module.exports={SOURCE_GIT_BLOB,applyPr109NativeRetreatPort,gitBlobHash};
