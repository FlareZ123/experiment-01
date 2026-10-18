'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {audit}=require('./regidrago-dragon-discard-access-audit.cjs');
const SEEDS=[4246551499,4246551500,4246551501];
