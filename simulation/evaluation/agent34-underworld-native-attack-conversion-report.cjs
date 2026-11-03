'use strict';

const fs=require('node:fs');
const {auditNativeUnderworldConversion}=
  require('./agent34-underworld-native-attack-conversion-audit.cjs');
const archive=JSON.parse(fs.readFileSync(
  'agent34-underworld-owner-posthoc.json','utf8'));
const result=auditNativeUnderworldConversion(archive);
process.stdout.write('AGENT34_NATIVE_CONVERSION_AUDIT '+
  JSON.stringify(result.summary)+'\n');
