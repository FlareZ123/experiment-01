'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {sourceGame}=require('./rank2-gh-root-score-probe.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/** @param {unknown} selection */
function renderSelection(selection) {
  if(Array.isArray(selection))
    return selection.map(card=>card?.fullName??card);
  if(selection && typeof selection==='object')
    return selection.fullName??selection.constructor?.name??'object';
  return selection??null;
}
