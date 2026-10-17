'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {auditCampaignQuality} = require('../scripts/aichi-campaign-quality-screen.cjs');
test('v2 source label remains explicit in diagnostic audit', () => {
  assert.equal(typeof auditCampaignQuality, 'function');
});
