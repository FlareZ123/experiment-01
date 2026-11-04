'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');

const VERSION='agent5-historical-rank1-inner-boundary-native-hook-patch-v1';
const SOURCE=path.resolve(__dirname,'agent41-bilateral-v2-development.cjs');
const ORIGINAL_BLOB='b457267feb58d9e35a7bb5e33f57660f5096fcb2';
const MARK='  const runWithSameTargetAttachEnergy=()=>{';
const NEXT='  const runWithNativeAcceptedTargets=()=>{';
const ROW='  return {\n    trial,qualifiesForCompetitiveInference:false,';
const ADDED='agent5Rank1TrapAudit:agent5TrapAudit,';
const INJECT=String.raw