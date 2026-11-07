# Original M4 Special Red Card: owner-public hand-zero prerequisite certificate

**Agent 44 | 7 November 2026 | versioned pure owner-root diagnostic, not selected common policy**

## Decision-changing gap

The existing [Agent30 v2 paper Prize gate](../../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs) correctly blocks `Special Red Card M4` when opposing Prize cards exceed three. It deliberately does not inspect opponent hand count. Consequently an owner view with **3 opposing Prizes and 0 opponent-hand cards** yields `blocked=false, paperPlayable=null`, even though the [official Pokémon Japan Special Red Card FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all) prohibits playing that Item with an empty opposing hand. This is an unresolved **owner preselection** condition, separate from the [native Store's reproduced paper-invalid accepted action and deterministic unshuffled opponent hand](../rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md).

The existing detached owner-observation contract at `simulation/twinleaf/actor-observation-contract.cjs` already exposes `opponentPublic.handCount`, a count visible to both physical players. There is no need to access opponent hand identities, deck identities or concealed Prize contents to enforce this necessary prohibition.

## Code and exact observable contract

- [Independent versioned source module](../../simulation/evaluation/agent44-m4-public-prerequisite.cjs) exports `publicTrainerNecessaryV3(view,row)`, `screenOwnerTrainerPaperNecessitiesV3(view,rows)` and `VERSION='agent44-m4-public-necessary-v1'`. It imports the **unmodified historical Agent30 v2** certificate and enhances only the two source/backend aliases `Special Red Card M4` and `Special Red Card CRI` (the latter is the postevent English representative label for the same original Japanese M4 source copies).
- The new necessary test is `Number.isSafeInteger(view.opponentPublic.handCount) && handCount>=1`. The previous exact-print requirement `opponentPublic.prizeCount<=3` remains. Failure of *either* proves a paper-veto. Both simultaneous failures are reported as two reasons, while the aggregate union counts the physical copy once.
- A positive pair of necessary tests still returns `paperPlayable:null`, never `true`. Unrelated Trainer rows return the **exact v2 object**. The code preserves genuine owner-hand index validation, rejects malformed missing public hand counts and preserves duplicate physical index rejection. It never reads hidden opponent identities.
- [Standalone six-case regression](../../tests/agent44-m4-public-prerequisite.test.cjs) tests **60** crossed `seat × exact label × Prize count × opponent hand count` configurations, historical v2 unchanged, unrelated Trainer preservation, forged owner prompt rejection, malicious hidden-data getters, invalid opponent counts, duplicate copy index, and overlap/deduplication of blockers. Exact source was fetched back from GitHub and tested in a synchronous V8 CommonJS harness against the fetched actual Agent30 v2 module: **6/6 cases passed**. This is an independent pure-code semantic check; it is **not** a Node CI receipt or a native Store run.
- The existing `tests/agent44-specialredcard-emptyhand-native.sft.cjs` now imports this test at the end, reusing the existing manually dispatched `twinleaf-smoke.yml` step `smoke_check_39`; no new workflow or push trigger was added.

## Benchmark scope and limits

Authenticated rank **5** original source Mew/Genesect has two `Special Red Card` copies and rank **26** Meloetta Donk one; the original May 2026 Japanese M4 printing predates the represented May22 English CRI label. Historical source inventories are unchanged. This is a reusable negative-paper preflight, not an estimate of how often rank5 or rank26 encounters an eligible state.

**Neither a common bilateral policy integration nor a natural original-source game has been run with this preselection wrapper.** An actual shared-policy release must install the certificate *before* choice among native offered actions; use both same-owner and opponent-public views, preserve source provenance, disable no-op native Item burner, preserve legal M4 plays, and capture actual Store hand shuffle through the existing default-off physical-root hook. The native root remains a separate authority for rules acceptance but is not sufficient for paper legality. The existing v8 selected development baseline is unchanged.

## Next admissible test

1. Coordinate with Agent30 and the Agent36 steward for a new versioned common policy that calls this negative certificate at real owner-root preselection without privileged hidden reads.
2. Preregister original rank5/26 source deals in both physical seats, retain all attempts, distinguish no-hand and Prize failure from eligible M4 roots, then execute live native Store actions under the real-physical-hand-shuffle option.
3. Require full opponent follow-through and complete paper-valid match acceptance before any matchup or win-rate inference.

**Current status:** 29/32 authenticated originals (missing 23/25/28), zero competitively qualified games, no final selected 60, no evidence of 99.5%.
