'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const manifestPath=path.resolve(__dirname,
  '../results/aichi-2026/raw-evidence-retention-20261103.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const API='https://api.github.com';
const RELEASE_TAG='aichi-native-evidence-2026-11-03';

/** @param {Uint8Array|Buffer} input @returns {string} */
const sha256=input=>createHash('sha256').update(input).digest('hex');

/**
 * Fixed allowlist, no caller-supplied asset URLs, IDs or scripts.
 * Ensures a dry-run and a publication run refer to identical bytes.
 *
 * @param {object} plan
 * @returns {object} Original immutable publication plan.
 */
function validatePlan(plan){
  assert.equal(plan.schema,'aichi-native-evidence-retention-manifest-v1');
  assert.equal(plan.repository,'FlareZ123/experiment-01');
  assert.equal(plan.releaseTag,RELEASE_TAG);
  assert.equal(plan.publicationOfReleaseDoesNotCertifyGames,true);
  assert.equal(plan.artifacts.length,5);
  const ids=new Set(),names=new Set();
  for(const a of plan.artifacts){
    assert.ok(Number.isSafeInteger(a.runId)&&a.runId>0);
    assert.ok(Number.isSafeInteger(a.artifactId)&&a.artifactId>0);
    assert.match(a.assetName,/^[a-z0-9-]+\.zip$/);
    assert.match(a.sha256,/^[0-9a-f]{64}$/);
    assert.ok(Number.isSafeInteger(a.sizeBytes)&&
      a.sizeBytes>=100&&a.sizeBytes<=8000000);
    assert.ok(Number.isFinite(Date.parse(a.expiresAtUtc)));
    assert.ok(a.report.startsWith('results/aichi-2026/'));
    assert.ok(!ids.has(a.artifactId));
    assert.ok(!names.has(a.assetName));
    ids.add(a.artifactId);
    names.add(a.assetName);
  }
  return plan;
}

const archivePlan=validatePlan(manifest);

/** @param {number} ms @returns {Promise<void>} */
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

/**
 * Invoke one documented GitHub REST endpoint; retry only transient errors.
 *
 * @param {string} url Full GitHub API or release-upload URL.
 * @param {object} options Fetch options.
 * @param {boolean} [allow404]
 * @returns {Promise<Response|null>}
 */
async function request(url,options,allow404=false){
  assert.ok(url.startsWith(API+'/repos/FlareZ123/experiment-01/')||
    url.startsWith('https://uploads.github.com/repos/FlareZ123/experiment-01/'));
  let last;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const response=await fetch(url,options);
      if(allow404&&response.status===404)return null;
      if(response.ok)return response;
      const body=(await response.text()).slice(0,300);
      if(![408,429,500,502,503,504].includes(response.status))
        throw new Error('GitHub HTTP '+response.status+': '+body);
      last=new Error('Transient GitHub HTTP '+response.status+': '+body);
    }catch(error){
      if(error?.message?.startsWith('GitHub HTTP '))throw error;
      last=error;
    }
    if(attempt<3)await sleep(500*(2**attempt));
  }
  throw last;
}

/** @param {string} token @param {string} [type] @returns {object} */
function headers(token,type='application/vnd.github+json'){
  return {Accept:type,Authorization:'Bearer '+token,
    'X-GitHub-Api-Version':'2026-03-10'};
}

/**
 * Verify the actual original archive bytes independently of the API metadata.
 * The original ZIP is kept byte-for-byte without repacking.
 *
 * @param {object} artifact Exact frozen source plan.
 * @param {string} token GitHub Actions ephemeral token.
 * @returns {Promise<Buffer>}
 */
async function originalArtifact(artifact,token){
  const base=API+'/repos/'+archivePlan.repository+
    '/actions/artifacts/'+artifact.artifactId;
  const meta=await (await request(base,{headers:headers(token)})).json();
  assert.equal(meta.id,artifact.artifactId);
  assert.equal(meta.size_in_bytes,artifact.sizeBytes);
  assert.equal(meta.expired,false);
  assert.equal(meta.digest,'sha256:'+artifact.sha256);
  assert.ok(Date.parse(meta.expires_at)>Date.now(),
    'Original Actions artifact expired during archival operation');
  const response=await request(base+'/zip',{headers:headers(token)});
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,artifact.sizeBytes);
  assert.equal(sha256(bytes),artifact.sha256,
    'Original artifact ZIP bytes do not match frozen API SHA-256');
  return bytes;
}

/**
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function existingRelease(token){
  const response=await request(API+'/repos/'+archivePlan.repository+
    '/releases/tags/'+RELEASE_TAG,{headers:headers(token)},true);
  return response?response.json():null;
}

/**
 * Download a published release asset for an independent second SHA-256
 * comparison. The release must already be published to expose this URL.
 * @param {object} asset GitHub release asset.
 * @param {object} source Frozen original artifact.
 * @param {string} token GitHub Actions token for private-release fallback.
 * @returns {Promise<object>}
 */
async function verifyPublishedAsset(asset,source,token){
  assert.equal(asset.name,source.assetName);
  assert.equal(asset.size,source.sizeBytes);
  assert.equal(asset.digest,'sha256:'+source.sha256);
  assert.equal(asset.state,'uploaded');
  if(Number.isSafeInteger(source.releaseAssetId))
    assert.equal(asset.id,source.releaseAssetId,
      'Published asset identity differs from frozen original release');
  if(source.durableUrl)
    assert.equal(asset.browser_download_url,source.durableUrl);
  assert.equal(asset.browser_download_url,
    'https://github.com/'+archivePlan.repository+'/releases/download/'+
    RELEASE_TAG+'/'+source.assetName);
  let response=await fetch(asset.browser_download_url);
  if(!response.ok){
    // In a private repository, the anonymous browser URL may be unavailable.
    // An authenticated release-asset octet-stream request is the documented
    // alternative. Never replace independent bytes with metadata alone.
    response=await request(API+'/repos/'+archivePlan.repository+
      '/releases/assets/'+asset.id,{
        headers:headers(token,'application/octet-stream')
      });
  }
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,source.sizeBytes);
  assert.equal(sha256(bytes),source.sha256,
    'Published release asset differs from original ZIP');
  return {key:source.key,assetId:asset.id,
    publishedUrl:asset.browser_download_url,
    observedSha256:sha256(bytes),verifiedDownloadedBytes:bytes.length};
}

/**
 * @param {object} release
 * @param {string} token
 * @param {object} source
 * @param {Buffer} bytes
 * @returns {Promise<object>}
 */
async function ensureAsset(release,token,source,bytes){
  const existing=release.assets.find(a=>a.name===source.assetName);
  if(existing){
    assert.equal(existing.size,source.sizeBytes);
    assert.equal(existing.digest,'sha256:'+source.sha256);
    assert.equal(existing.state,'uploaded');
    return existing;
  }
  assert.equal(release.draft,true,
    'Published release is immutable for missing archive assets');
  const url='https://uploads.github.com/repos/'+archivePlan.repository+
    '/releases/'+release.id+'/assets?name='+
    encodeURIComponent(source.assetName);
  const response=await request(url,{method:'POST',
    headers:{...headers(token),'Content-Type':'application/zip'},
    body:bytes});
  const asset=await response.json();
  assert.equal(asset.name,source.assetName);
  assert.equal(asset.size,source.sizeBytes);
  assert.equal(asset.digest,'sha256:'+source.sha256);
  assert.equal(asset.state,'uploaded');
  release.assets.push(asset);
  return asset;
}

/**
 * Independently re-download every release ZIP even after the historical
 * GitHub Actions artifact has expired. This never mutates a release or
 * retrieves original Actions archive bytes.
 *
 * @param {string} token Authentication to resolve release and private assets.
 * @returns {Promise<object>} Exact checked mirror receipt.
 */
async function verifyReleaseOnly(token){
  const published=await existingRelease(token);
  assert.ok(published,'Original research release does not exist');
  assert.equal(published.draft,false);
  assert.equal(published.tag_name,RELEASE_TAG);
  assert.equal(published.id,archivePlan.verification.releaseId);
  assert.ok(Array.isArray(published.assets));
  const independentlyVerified=[];
  for(const artifact of archivePlan.artifacts){
    const asset=published.assets.find(a=>a.name===artifact.assetName);
    assert.ok(asset,'Original research ZIP missing from release');
    independentlyVerified.push(await verifyPublishedAsset(asset,artifact,token));
  }
  return {schema:archivePlan.schema,
    mode:'post-expiry-independent-mirror-verification',
    releasePublished:true,releaseTag:RELEASE_TAG,releaseUrl:published.html_url,
    originalsNeeded:false,originalArtifactExpiryIrrelevant:true,
    independentlyVerified,verifiedPublishedZipCount:independentlyVerified.length,
    competitivelyQualifiedGames:0};
}

/**
 * Two-stage archival: first verify all source ZIPs, then draft/upload/publish.
 * Verify-only instead checks release assets by byte hash without accessing
 * original Actions artifacts, including after their actual retention expiry.
 *
 * @param {boolean} publish Explicit opt-in publication.
 * @param {boolean} verifyOnly Existing release re-download after retention.
 * @returns {Promise<object>}
 */
async function execute(publish=false,verifyOnly=false){
  const token=process.env.GITHUB_TOKEN;
  assert.ok(typeof token==='string'&&token.length>10);
  assert.equal(process.env.GITHUB_REPOSITORY,archivePlan.repository);
  assert.ok(!(publish&&verifyOnly),
    'Publishing and release-only verification are exclusive operations');
  if(verifyOnly)return verifyReleaseOnly(token);
  const originals=[];
  for(const artifact of archivePlan.artifacts){
    const bytes=await originalArtifact(artifact,token);
    originals.push({artifact,bytes});
  }
  const sourceReceipt=originals.map(({artifact,bytes})=>({
    key:artifact.key,artifactId:artifact.artifactId,
    originalZipSha256:sha256(bytes),sizeBytes:bytes.length,
    originalArtifactExpiresAtUtc:artifact.expiresAtUtc
  }));
  if(!publish)return {schema:archivePlan.schema,mode:'verified-dry-run',
    releasePublished:false,validatedOriginalZipCount:originals.length,
    sourceReceipt,competitivelyQualifiedGames:0};

  let release=await existingRelease(token);
  if(!release){
    const response=await request(API+'/repos/'+archivePlan.repository+
      '/releases',{method:'POST',
      headers:{...headers(token),'Content-Type':'application/json'},
      body:JSON.stringify({tag_name:RELEASE_TAG,target_commitish:'main',
        name:'Aichi 2026 unqualified native research evidence',
        body:'Byte-for-byte archive of five historical GitHub Actions ZIPs. '+
          'Frozen manifest: results/aichi-2026/raw-evidence-retention-20261103.json. '+
          'This release contains unqualified experimental and policy evidence; '+
          'it establishes no competitive match win or 99.5% claim.',
        draft:true,prerelease:true,make_latest:'false'})});
    release=await response.json();
  }
  assert.equal(release.tag_name,RELEASE_TAG);
  assert.ok(release.draft===true||release.draft===false);
  assert.ok(Array.isArray(release.assets));
  const assetMap=[];
  for(const {artifact,bytes} of originals)
    assetMap.push(await ensureAsset(release,token,artifact,bytes));
  if(release.draft){
    const response=await request(API+'/repos/'+archivePlan.repository+
      '/releases/'+release.id,{method:'PATCH',
      headers:{...headers(token),'Content-Type':'application/json'},
      body:JSON.stringify({draft:false,prerelease:true,make_latest:'false'})});
    release=await response.json();
  }
  assert.equal(release.draft,false);
  // Draft asset URLs use an ephemeral "untagged-..." path and are stale after
  // publication. Re-fetch the published release to verify canonical URLs.
  const published=await existingRelease(token);
  assert.equal(published?.draft,false);
  assert.equal(published.tag_name,RELEASE_TAG);
  const independentlyVerified=[];
  for(const artifact of archivePlan.artifacts){
    const asset=published.assets.find(a=>a.name===artifact.assetName);
    assert.ok(asset,'Published release is missing an original artifact');
    independentlyVerified.push(await verifyPublishedAsset(asset,artifact,token));
  }
  return {schema:archivePlan.schema,mode:'published-and-downloaded',
    releasePublished:true,releaseTag:RELEASE_TAG,releaseUrl:release.html_url,
    validatedOriginalZipCount:originals.length,sourceReceipt,
    independentlyVerified,
    competitivelyQualifiedGames:0};
}

if(require.main===module){
  execute(process.env.AICHI_ARCHIVE_PUBLISH==='true',
    process.env.AICHI_ARCHIVE_VERIFY_RELEASE_ONLY==='true').then(result=>
    process.stdout.write(JSON.stringify(result,null,2)+'\n'),
  error=>{process.stderr.write(String(error?.stack??error)+'\n');
    process.exitCode=1;});
}

module.exports={RELEASE_TAG,archivePlan,validatePlan,sha256,
  verifyReleaseOnly,execute};
