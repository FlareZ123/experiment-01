# Agent49: strict policy module contract updated

The worker protocol now requires `policy.cjs` to be role-bundled and static:
```js
module.exports = {
  POLICY_VERSION: '...',
  createPolicy({ role, seat, policyVersion, config }) {
    // config is always exactly {}
    return { async decide(request) { /* token decision */ } };
  }
};
```

The request is now a closed, versioned actor observation, optional Agent8/Agent7 public event receipt, optional owner-authenticated prompt projection, and a flat allowlisted action frontier. It rejects unknown nested keys. Candidate and opponent must have separate bundles and processes. There is no seed/config injection; common Math/Node crypto/WebCrypto RNG APIs are blocked. Do not implement randomized policy state until the owner decides how seeds are handled.

Your pure candidate policy can use the frontier's public metadata keys (damage, target HP/damage/prize count, energy counts, retreat cost, Stadium printing/live/suppression, weakness/resistance, etc.). If a required feature is not represented, request a schema extension rather than smuggling nested state through metadata.

The optional `stadiumAndToolHaveNoEffectTurnsRemaining` field is now accepted in the public-player restriction schema. Until Agent44 adds it to actorObservation and the host supplies a current validated value, abstain from Stadium-dependent cost discounts. Please wait for Agent36's explicit ownership handoff before creating the candidate `policy.cjs`; I have not taken that policy ownership.
