'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const VERSION = 'agent36-source-closure-audit-v2-vendor-boundary';
const LITERAL_REQUIRE = /\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
const ANY_REQUIRE = /\brequire\s*\(/g;
const ENV_DOT = /\bprocess\s*\.\s*env\s*\.\s*([A-Za-z_$][\w$]*)/g;
const ENV_BRACKET = /\bprocess\s*\.\s*env\s*\[/g;
const ENV_BASE = /\bprocess\s*\.\s*env\b/g;

/** @param {Buffer|string} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Resolve a literal relative CommonJS import using local source files.
 * No code is executed and no upstream dependency is installed by this audit.
 * @param {string} importer Absolute path of importing file.
 * @param {string} request The string argument inside a CommonJS require call.
 * @returns {string|null}
 */
function resolveRelative(importer, request) {
  const base = path.resolve(path.dirname(importer), request);
  const candidates = [base, base+'.cjs', base+'.js', base+'.json',
    path.join(base, 'index.cjs'), path.join(base, 'index.js'),
    path.join(base, 'index.json')];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

/**
 * Inspect every statically discoverable, literal relative CommonJS require.
 * This is an intentionally conservative lexical audit. Nonliteral imports,
 * bracket-addressed env keys and third-party packages remain explicit gaps.
 *
 * @param {string} repositoryRoot Absolute or relative repository directory.
 * @param {string[]} entries Entry files relative to the repository directory.
 * @returns {{version:string,files:Array<object>,keys:string[],readers:Record<string,string[]>,digest:string,limitations:object}}
 */
function auditSourceClosure(repositoryRoot, entries, options = {}) {
  assert.equal(typeof repositoryRoot, 'string');
  assert.ok(Array.isArray(entries) && entries.length > 0);
  assert.ok(options && typeof options === 'object' && !Array.isArray(options));
  const root = fs.realpathSync(repositoryRoot);
  const vendorPrefixes = [...new Set(options.vendorPrefixes ?? ['vendor/twinleaf/'])].sort();
  for (const prefix of vendorPrefixes) {
    assert.equal(typeof prefix, 'string');
    assert.ok(prefix.startsWith('vendor/') && prefix.endsWith('/') &&
      !prefix.includes('..') && !prefix.includes('\\'),
      'vendor prefix must be a canonical repository-relative directory');
  }
  const files = new Map();
  const vendorImports = [];
  const limitations = {dynamicRequireSites:[], computedEnvSites:[],
    unclassifiedEnvSites:[], missingRelativeImports:[], externalRequires:[]};

  /** @param {string} filename */
  function visit(filename) {
    const absolute = path.resolve(filename);
    const real = fs.realpathSync(absolute);
    const relative = path.relative(root, real);
    assert.ok(relative && relative !== '..' &&
      !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative),
    'Source escapes audited repository: '+filename);
    if (files.has(relative)) return;
    const bytes = fs.readFileSync(real);
    const text = bytes.toString('utf8');
    const direct = [...text.matchAll(LITERAL_REQUIRE)];
    const env = [...new Set([...text.matchAll(ENV_DOT)].map(match => match[1]))].sort();
    const dynamicCount = [...text.matchAll(ANY_REQUIRE)].length - direct.length;
    if (dynamicCount > 0) limitations.dynamicRequireSites.push({file:relative,count:dynamicCount});
    const computedCount = [...text.matchAll(ENV_BRACKET)].length;
    if (computedCount > 0) limitations.computedEnvSites.push({file:relative,count:computedCount});
    const baseCount = [...text.matchAll(ENV_BASE)].length;
    const recognizedCount = [...text.matchAll(ENV_DOT)].length + computedCount;
    if (baseCount > recognizedCount) {
      limitations.unclassifiedEnvSites.push({file:relative,
        count:baseCount - recognizedCount});
    }
    files.set(relative,{path:relative,sha256:sha256(bytes),envKeys:env});
    for (const match of direct) {
      const request = match[2];
      if (!request.startsWith('.')) {
        if (!request.startsWith('node:')) {
          limitations.externalRequires.push({file:relative,request});
        }
        continue;
      }
      const resolved = resolveRelative(real, request);
      if (!resolved) {
        limitations.missingRelativeImports.push({file:relative,request});
        continue;
      }
      const resolvedReal = fs.realpathSync(resolved);
      const targetRelative = path.relative(root, resolvedReal).split(path.sep).join('/');
      assert.ok(targetRelative && targetRelative !== '..' && !targetRelative.startsWith('../') &&
        !path.isAbsolute(targetRelative), 'Import escapes audited repository: '+relative+' -> '+request);
      const vendorPrefix = vendorPrefixes.find(prefix => targetRelative.startsWith(prefix));
      if (vendorPrefix) {
        const vendorBytes = fs.readFileSync(resolvedReal);
        vendorImports.push({importer:relative,request,path:targetRelative,
          vendorPrefix,sha256:sha256(vendorBytes)});
        continue;
      }
      visit(resolvedReal);
    }
  }

  for (const entry of entries) visit(path.resolve(root, entry));
  const ordered = [...files.values()].sort((a,b)=>a.path.localeCompare(b.path));
  const readers = {};
  for (const file of ordered) {
    for (const key of file.envKeys) (readers[key] ??= []).push(file.path);
  }
  const keys = Object.keys(readers).sort();
  for (const value of Object.values(readers)) value.sort();
  const digest = sha256(JSON.stringify(ordered.map(f=>[f.path,f.sha256])));
  vendorImports.sort((a,b)=>(a.importer+'\\0'+a.request+'\\0'+a.path).localeCompare(
    b.importer+'\\0'+b.request+'\\0'+b.path));
  for (const group of Object.values(limitations)) {
    group.sort((a,b)=>a.file.localeCompare(b.file));
  }
  return {version:VERSION, files:ordered, keys, readers, digest, limitations,
    vendorPrefixes,vendorImports};
}

/**
 * Check that every statically visible environment read has a reviewed value.
 * @param {ReturnType<typeof auditSourceClosure>} audit
 * @param {Record<string,string|undefined>} accepted Option map, including unset keys.
 * @returns {string[]} Unreviewed environment setting names.
 */
function missingReviewedKeys(audit, accepted) {
  assert.ok(accepted && typeof accepted === 'object');
  return audit.keys.filter(k => !Object.hasOwn(accepted, k));
}

module.exports={VERSION,auditSourceClosure,missingReviewedKeys,
  resolveRelative,sha256};
