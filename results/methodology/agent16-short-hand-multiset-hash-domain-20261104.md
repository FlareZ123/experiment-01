# Agent 16: full SHA-256 does not hide low-entropy source-hand multisets

**4 November 2026 | mathematical inventory count + synthetic recovery demonstration.** This is an archival privacy and evidence-release warning. No native game was affected, no private game hand was recovered, and **zero competitively qualified games** arise from this study.

## Exact published source inventory domain

The [original-source benchmark inventory](../aichi-2026/full-decklists.json) currently has 29 authenticated name/count 60s. The shared development runner computes `sourceFirstOwnHandMultisetSha256 = SHA256(JSON.stringify(firstLiveOwnHandFullNames.sort()))` for its **private first-live owner hand** (see [the runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs)). The original rank16 [compiled native replay](../aichi-2026/agent16-rank16-live-prebot-source-hand-pairing-20261104.md) retains these values in its downloadable archival JSON.

For a publicly known deck with card categories of counts `c_i`, a hand of `h` cards has at most the coefficient of `x^h` in

`G(x) = product_i (1 + x + ... + x^c_i)`

distinct unordered card-category multisets. This is a direct exact dynamic program over the authenticated source 60, *not a simulation*. Distinct inventory entries are treated as different identities, which gives an **upper bound** when two printed entries map to one native `card.fullName`. Sorting the native full names loses card order; a category with four identical copies contributes only five choices (0 through 4).

- **Rank 11 Absol Garbodor**: 2,018,562 distinct seven-card inventory-line multisets, equivalent to **20.94490 bits** of an equally likely identifier space at most.
- **Rank 16 Absol Garbodor**: 3,869,032 distinct seven-card line multisets, with an even smaller domain if the two same-name inventory lines collapse.
- **All 29 authenticated original 60s**: for a *seven-card* unordered hand, the line-level domain runs from **2,018,562 (rank 11)** to **21,854,508 (rank 32)**, strictly below **2^25** distinct candidates per source deck.

These values count possible hand identities, **not Shannon entropy** under realistic nonuniform dealing, and they do not describe hands of arbitrary sizes or unknown source decks. A native fullName mapping may reduce the search space; a hand with additional drawn cards may increase it.

## Reproduced dictionary reconstruction on an invented hand

I generated an artificial seven-card rank11 hand (`Darkness Energy ×2`, `Battle VIP Pass`, `Mega Absol ex`, `Float Stone`, `Quick Ball`, `Carmine`) and hashed its sorted names with the same standard compact JSON + SHA-256 construction. A simple Python enumeration respecting all published rank11 copy counts recovered that **invented** multiset after **234,949** valid candidates and **1.23 seconds** in this runtime. This is one known synthetic target, not a speed benchmark or evidence that any genuine native hidden hand was recovered. A real reconstruction must use the corresponding actual native `fullName` strings and observed hand size.

A 256-bit hash is only as opaque as its unknown input domain. Publicly publishing a deterministic, unkeyed digest over a small known-card multiset makes the private card identities offline guessable. The length of the SHA-256 hexadecimal string does not supply 256 bits of input uncertainty.

## Implications for provenance reporting

1. **Keep the paper-game policy boundary intact.** The current observer is postgame telemetry and is never passed to the opponent's live decision policy; this study does not demonstrate an in-game data leak.
2. **Avoid public raw digests of small private hands when confidentiality is intended.** A read-only trusted offline comparator can emit `MATCHED / MISMATCHED / UNKNOWN` and aggregate counts without publishing both reconstructable hand hashes. Where authorized auditors need them, retain separate restricted raw evidence; alternatively use a secret-key HMAC rather than a public predictable bare hash, with a clearly documented key-custody model.
3. **Never make first-live-hand equality an admission filter.** As separately shown in [the causal boundary](agent16-initial-vs-live-hand-causal-boundary-20261104.md), it is a downstream outcome when the source goes second.
4. **Do not confuse privacy with provenance strength.** The `sourceDealFingerprint` contains ordered physical zones and a far larger input domain, but still does not itself prove printed source provenance, paper-valid game state, or full-policy competence.

The [exact counting module](../../scripts/agent16-hand-multiset-digest-domain.cjs) and [five pure regression tests](../../tests/agent16-hand-multiset-digest-domain.test.cjs) enumerate the current 29-source domain without any game observations. They are registered in the existing manually dispatched benchmark CI. No new workflow and no deck promotion.

**Current objective unchanged:** 29/32 original name/count lists, zero competitively qualified full matches, no selected final fixed 60 and no demonstrated 99.5% field win rate.

**Agent 16**
