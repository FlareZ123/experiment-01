'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');

/**
 * Fixed public primary-post leads. Rank attribution remains provisional:
 * Japanese handles do not independently establish Limitless legal identities.
 * Never import a photograph into full-decklists.json without human review.
 */
const LEADS = Object.freeze([
  { key: 'rank28-replica', rankHypothesis: 28, handle: 'nnaacc5_uec',
    id: '2053378618420859259' },
  { key: 'rank25-kume', rankHypothesis: 25, handle: 'kume_pokeca',
    id: '2053398480572588468' },
  { key: 'unassigned-natsumegu', rankHypothesis: null,
    handle: 'yamatodaisuki', id: '2053387997710872929' }
]);

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256').update(value).digest('hex');

/**
 * Decode public FxTwitter or VXTwitter responses without assigning a ranked
 * player's civil identity or inferring any card identity from photographs.
 * @param {object} payload
 * @param {{key:string,handle:string,id:string,rankHypothesis:number|null}} lead
 * @returns {object}
 */
function decodePost(payload, lead) {
  const tweet = payload?.tweet ?? payload;
  assert.ok(tweet && typeof tweet === 'object', 'Missing post object');
  assert.equal(String(tweet.id ?? tweet.tweetID), lead.id,
    'Post ID mismatch: refuse unrelated social content');
  const handle = tweet.author?.screen_name ?? tweet.user_screen_name;
  assert.equal(String(handle).toLowerCase(), lead.handle.toLowerCase(),
    'Post author mismatch: refuse unrelated social content');
  const photos = tweet.media?.photos ?? [];
  const fxPhotos = Array.isArray(photos) ?
    photos.map(photo => photo.url ?? photo.src) : [];
  const vxPhotos = Array.isArray(tweet.mediaURLs) ? tweet.mediaURLs : [];
  const photoUrls = [...new Set([...fxPhotos, ...vxPhotos]
    .filter(url => typeof url === 'string')
    .filter(isTrustedPhotoUrl))];
  return {
    key: lead.key,
    rankHypothesis: lead.rankHypothesis,
    authorHandle: handle,
    publicTweetUrl: 'https://x.com/' + lead.handle + '/status/' + lead.id,
    tweetId: lead.id,
    createdAt: tweet.created_at ?? tweet.date ?? null,
    text: tweet.text ?? null,
    photoUrls,
    classification: 'unreviewed-primary-social-lead',
    certifiedRanked60: false,
    civilNameMatchVerified: false
  };
}

/** @param {string} url @returns {boolean} */
function isTrustedPhotoUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' &&
      parsed.hostname === 'pbs.twimg.com' &&
      parsed.pathname.startsWith('/media/');
  } catch {
    return false;
  }
}

/**
 * The artifact folder is single-writer locked and individual replacements
 * happen atomically. The lock covers all writes for one attempt.
 * @param {string} directory
 * @param {()=>Promise<object>} work
 * @returns {Promise<object>}
 */
async function withLockedOutput(directory, work) {
  fs.mkdirSync(directory, { recursive: true });
  const lock = path.join(directory, '.write.lock');
  const fd = fs.openSync(lock, 'wx');
  try {
    return await work();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/** @param {string} filename @param {Buffer|string} bytes */
function atomicSave(filename, bytes) {
  const temp = filename + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, bytes, { flag: 'wx' });
    fs.renameSync(temp, filename);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

/** @param {string} url @returns {Promise<object>} */
async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

/**
 * Mirror failure is reported explicitly, not treated as missing deck evidence.
 * @param {object} lead
 * @returns {Promise<{source:string,payload:object,post:object,errors:string[]}>}
 */
async function retrievePost(lead) {
  const hosts = ['api.fxtwitter.com', 'api.vxtwitter.com'];
  const errors = [];
  for (const host of hosts) {
    const source = 'https://' + host + '/' + lead.handle +
      '/status/' + lead.id;
    try {
      const payload = await fetchJson(source);
      return { source, payload, post: decodePost(payload, lead), errors };
    } catch (error) {
      errors.push(host + ': ' + String(error?.message ?? error));
    }
  }
  throw new Error(errors.join('; '));
}

/** @param {string} url @returns {Promise<{bytes:Buffer,extension:string}>} */
async function retrievePhoto(url) {
  assert.ok(isTrustedPhotoUrl(url));
  const response = await fetch(url, { signal: AbortSignal.timeout(16000) });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const type = response.headers.get('content-type')?.split(';')[0] ?? '';
  const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png',
    'image/webp': '.webp' };
  const extension = extensions[type];
  if (!extension) throw new Error('Unsupported media type: ' + type);
  const declared = Number(response.headers.get('content-length') ?? '0');
  if (declared > 8000000) throw new Error('Photo exceeds 8 MB limit');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 8000000) throw new Error('Photo exceeds 8 MB limit');
  return { bytes, extension };
}

/** @param {string} outputDirectory @returns {Promise<object>} */
async function run(outputDirectory) {
  return withLockedOutput(outputDirectory, async () => {
    const results = [];
    for (const lead of LEADS) {
      const result = {
        key: lead.key, rankHypothesis: lead.rankHypothesis,
        expectedTweetId: lead.id, expectedHandle: lead.handle,
        certifiedRanked60: false, photos: []
      };
      try {
        const fetched = await retrievePost(lead);
        Object.assign(result, fetched.post, {
          retrievalEndpoint: fetched.source,
          mirrorFailures: fetched.errors,
          jsonSha256: digest(JSON.stringify(fetched.payload)),
          retrievalStatus: 'post-resolved'
        });
        let index = 0;
        for (const url of result.photoUrls) {
          index += 1;
          try {
            const photo = await retrievePhoto(url);
            const filename = lead.key + '-photo-' + index + photo.extension;
            atomicSave(path.join(outputDirectory, filename), photo.bytes);
            result.photos.push({
              originalUrl: url, file: filename, sha256: digest(photo.bytes),
              bytes: photo.bytes.length, verifiedCards: false
            });
          } catch (error) {
            result.photos.push({
              originalUrl: url,
              retrievalError: String(error?.message ?? error),
              verifiedCards: false
            });
          }
        }
      } catch (error) {
        result.retrievalStatus = 'unresolved';
        result.retrievalError = String(error?.message ?? error);
      }
      results.push(result);
    }
    const report = {
      schema: 'aichi-public-social-media-unverified-source-probe-v1',
      retrievedAt: new Date().toISOString(),
      provenanceOnly: true,
      full60sRecoveredByAutomation: 0,
      results
    };
    atomicSave(path.join(outputDirectory, 'manifest.json'),
      JSON.stringify(report, null, 2) + '\n');
    return report;
  });
}

if (require.main === module) {
  const target = process.argv[2] ??
    path.join(__dirname, '..', 'results', 'aichi-2026',
      'missing-social-source-probe');
  run(path.resolve(target)).then(result => {
    process.stdout.write(JSON.stringify({
      schema: result.schema,
      photosSaved: result.results.reduce(
        (sum, row) => sum + row.photos.filter(item => item.file).length, 0),
      statuses: result.results.map(row => ({
        key: row.key, status: row.retrievalStatus,
        photoCount: row.photos.length,
        errors: row.retrievalError ?? row.mirrorFailures ?? []
      })),
      no60Verified: true
    }, null, 2) + '\n');
  }).catch(error => {
    process.stderr.write(String(error?.stack ?? error) + '\n');
    process.exitCode = 1;
  });
}

module.exports = { LEADS, decodePost, isTrustedPhotoUrl,
  withLockedOutput, atomicSave, run };
