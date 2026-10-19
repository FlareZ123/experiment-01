'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { LEADS, decodePost, isTrustedPhotoUrl, run } =
  require('../scripts/aichi-missing-rank-social-media.cjs');

test('public media parser accepts only pinned tweet/author and original photo domain', () => {
  const lead = LEADS[0];
  const url = 'https://pbs.twimg.com/media/source_A?format=jpg&name=large';
  assert.equal(isTrustedPhotoUrl(url), true);
  assert.equal(isTrustedPhotoUrl('https://pbs.twimg.com.evil.test/media/A'), false);
  assert.equal(isTrustedPhotoUrl('http://pbs.twimg.com/media/A'), false);
  assert.equal(isTrustedPhotoUrl('https://pbs.twimg.com/profile_images/A'), false);
  const payload = { tweet: {
    id: lead.id, author: { screen_name: lead.currentAliases?.[0] ?? lead.handle }, text: 'sample',
    media: { photos: [
      { url }, { url: 'https://malicious.test/source' }, { url }
    ] }
  }};
  const decoded = decodePost(payload, lead);
  assert.deepEqual(decoded.photoUrls, [url]);
  assert.equal(decoded.certifiedRanked60, false);
  assert.equal(decoded.civilNameMatchVerified, false);
  assert.throws(() => decodePost({
    tweet: { ...payload.tweet, id: 'unrelated-post' }
  }, lead), /Post ID mismatch/);
  assert.throws(() => decodePost({
    tweet: { ...payload.tweet, author: { screen_name: 'other' } }
  }, lead), /Post author mismatch/);
});

test('pinned rank28 original ID accepts evidenced current Replica handle only', () => {
  const lead = LEADS[0];
  assert.deepEqual(lead.currentAliases, ['nnaac5']);
  const tweet = { id: lead.id,
    author: { screen_name: 'nnaac5' }, media: { photos: [] } };
  const resolved = decodePost({ tweet }, lead);
  assert.equal(resolved.authorHandle, 'nnaac5');
  assert.equal(resolved.publicTweetUrl.includes(lead.id), true);
  assert.equal(resolved.certifiedRanked60, false);
  assert.throws(() => decodePost({
    tweet: { ...tweet, author: { screen_name: 'unrelated' } }
  }, lead), /Post author mismatch/);
  assert.throws(() => decodePost({
    tweet: { ...tweet, id: 'unrelated-post' }
  }, lead), /Post ID mismatch/);
  assert.throws(() => decodePost({
    tweet: { ...tweet, id: LEADS[1].id }
  }, LEADS[1]), /Post author mismatch/);
});

test('VXTweet schema is accepted but never mistaken for certified deck source', () => {
  const lead = LEADS[1];
  const actual = decodePost({
    tweetID: lead.id, user_screen_name: lead.handle,
    date: 'Sun May 10 2026',
    text: 'text',
    mediaURLs: ['https://pbs.twimg.com/media/card.png',
      'https://video.twimg.com/tweet_video/A.mp4']
  }, lead);
  assert.deepEqual(actual.photoUrls, [
    'https://pbs.twimg.com/media/card.png'
  ]);
  assert.equal(actual.rankHypothesis, 25);
  assert.equal(actual.certifiedRanked60, false);
});

test('offline mirrors create locked, atomic image provenance without promoting any 60', async () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'aichi-source-social-'));
  const originalFetch = global.fetch;
  const seen = [];
  try {
    global.fetch = async url => {
      seen.push(url);
      if (url.startsWith('https://api.fxtwitter.com/')) {
        const lead = LEADS.find(item => url.includes(item.id));
        assert.ok(lead);
        return {
          ok: true,
          json: async () => ({ tweet: {
            id: lead.id, author: { screen_name: lead.handle },
            text: 'public source test post', created_at: '2026-05-10',
            media: { photos: [{ url:
              'https://pbs.twimg.com/media/' + lead.key + '.jpg'
            }] }
          } })
        };
      }
      assert.ok(url.startsWith('https://pbs.twimg.com/media/'));
      return {
        ok: true,
        headers: { get: key =>
          key === 'content-type' ? 'image/png' : null },
        arrayBuffer: async () => Uint8Array.from([137,80,78,71]).buffer
      };
    };
    const result = await run(target);
    assert.equal(result.full60sRecoveredByAutomation, 0);
    assert.equal(result.results.length, 3);
    assert.ok(result.results.every(row =>
      row.retrievalStatus === 'post-resolved' &&
      row.photos.length === 1 &&
      row.photos[0].verifiedCards === false &&
      row.certifiedRanked60 === false));
    assert.equal(seen.length, 6);
    assert.equal(fs.existsSync(path.join(target, '.write.lock')), false);
    assert.equal(fs.existsSync(path.join(target, 'manifest.json')), true);
    for (const row of result.results) {
      assert.equal(fs.readFileSync(path.join(target,
        row.photos[0].file)).length, 4);
    }
  } finally {
    global.fetch = originalFetch;
    fs.rmSync(target, { recursive: true, force: true });
  }
});
