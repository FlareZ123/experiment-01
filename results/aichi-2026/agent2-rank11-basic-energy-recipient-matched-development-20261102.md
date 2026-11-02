# Agent 2: symmetric Basic Energy recipient policy makes real Bench investments, with mixed game outcomes

**2 November 2026 | 16 original rank-11 registered physical game attempts, replayed twice; historical matched development, not fresh validation or competitive games.**

## Decision question and prior evidence

[Our exact same-deal read-only root census](agent2-rank11-held-guzma-public-geometry-retrospective-20261102.md) found the original published rank11 Absol/Garbodor opponent had **zero attached Energy on its Bench at all 359/359 first owner roots and 161/161 accepted Passes**, across 16 already known native games. All 255 held-Guzma first roots with both Benches occupied also lacked any Benched Energy. The canonical actor policy's default Basic attachment chooses the Active when its opt-in energy-recipient frontier is absent. This makes an already-powered Bench gust pivot unavailable much more often than a raw held-Guzma tally implies.

This mechanism has an important **predecessor**, not to be erased: [Agent44's registered 21 October recipient contrast](agent44-actor-energy-recipient-joint-contrast-registration-20261021.md) and [Agent48's native four-arm result](agent48-energy-recipient-paired-fourarm-20261021.md) physically confirmed **11 Bench-directed Basic attachments** (two rank11 original game arms), while **neither** of those games advanced Prizes. Those runs also proved that equal root-skeleton digests can conceal different actual recipient targets and boards. Our larger study independently tests **all 16 rank11 frozen original arms** under the current canonical development profile, with a true two-seat option exposed in its existing runner. It remains an exploratory matched expansion, not a prospective improvement claim.

## Executable intervention and provenance

- Baseline and treatment both use exactly the same 16 historical [original rank11 preregistered trials](registrations/agent43-rank11-fresh-guzma-gust-20261101.json), eight seed groups with the original 60, both physical seats, and two unchanged candidate 60s (champion-reference and New Moon Lockbreaker). Each **candidate-specific baseline/treatment pair** has exactly the same seed, source 60, candidate 60, original source physical deal, complete physical deal and verified actual first-seat. No treatment-vs-control hidden-deal mismatches; all 16 comparisons pass strict assertions. Different candidate lists can legitimately alter original source mulligans and initial deals even under the same seed, so *cross-candidate* source-deal identity is not assumed.
- The **only experimental decision-policy difference** is default-off `bilateralBasicEnergyRecipientFrontier:false` versus `true` in [the shared canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs). The true branch gives *both* physical players the same pre-existing, owner-only, Basic Energy target chooser [`agent44-actor-energy-recipient.cjs`](../../simulation/twinleaf/agent44-actor-energy-recipient.cjs), with its opt-in owner-visible held Switch/Guzma mobility flag. The native `Store` alone actually plays and settles each action. All other frozen source policies, attack choices, card profiles, seed identities, Energy counts, game caps and vendor hook definitions remain fixed. There is no altered decklist.
- [Controlled paired experiment](../../simulation/evaluation/agent2-rank11-basic-recipient-matched-development.cjs) uses the original Agent43 source-registration preflight and mandatory immutable **control root-skeleton replay fingerprint** `4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216`. Pure metadata/deal regression at [`tests/agent2-rank11-basic-recipient-matched-development.test.cjs`](../../tests/agent2-rank11-basic-recipient-matched-development.test.cjs). Reused the **existing** manual [Agent43 retrospective workflow](../../.github/workflows/agent43-guzma-held-root-retrospective.yml) with an optional `basic_energy_recipient_comparison` dispatch input; default remains the previously verified read-only control. No new workflow or foreign identity leases.
- [**Compiled native CI 41371960662 PASSED**](https://github.com/FlareZ123/experiment-01/actions/runs/41371960662), tested main commit `8562c3e3ae675b13f3ff8235e3d69b48315329cd`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Full failure-inclusive 32-game-action raw JSON artifact 13109961742](https://github.com/FlareZ123/experiment-01/actions/runs/41371960662/artifacts/13109961742), artifact ZIP SHA256 `083892370ebf851aaacfe3192b86cd12a8b297d1b6182264619160d1ca0d46f4`, contained JSON SHA256 `d16c076632259150e4c3b6c95e990d750b5a2201300c61274c68796c64ab3942`. Treatment skeleton digest `360fe344ef32fb336ca9a9a1c1abe0683514ae01c142037063ffe85090cbe510` differs from the original control; this digest change only reports altered root sequence in some arms, not complete physical effect.
- All 16 baseline rows and 16 treatment rows are retained with actual accepted native roots, pending prompt audit, public actor-first roots, physical target sidecar, complete original/candidate registered sixty fingerprints, source first-deal/complete-deal fingerprints, actual first-seat, source/candidate attack settlements, end reason, failures and time/action caps. **0 errors** occurred in either run.

## Aggregate native exposure, correlated repeated-owner-turn evidence

| Metric across same 16 native game arms | Current control | Symmetric recipient treatment |
| --- | ---: | ---: |
| Source original-rank11 first owner turns with ≥1 Energy card on own Bench | **0 / 359** | **190 / 388** |
| Candidate first owner turns with ≥1 Energy card on own Bench | 124 / 362 | **271 / 389** |
| Original-source native attack declarations (all games combined) | 198 | **259** |
| Candidate native attack declarations | 107 | 110 |
| Real native engine terminals | 10 | 9 |
| 260-action-cap game attempts | 6 | 7 |
| Engine source wins among terminal games | 5 | 6 |
| Engine candidate wins among terminal games | 5 | 3 |
| Native exceptions / missing physical-pair proofs | 0 | 0 |
| Competitively qualified paper games | **0** | **0** |

**Physical-root confirmation:** Inspecting actual `nativeAcceptedTargetSidecar.events` for `StoreAccepted=true` native `PlayCardAction` with owner-hand Basic `Darkness Energy MEE` or `Psychic Energy MEE` plus **increased attached Energy-card count on a public Benched Pokémon** gives **82 actually completed Bench Basic Energy attachments**: **38 by original source**, **44 by candidates**. By candidate matchup: champion-reference pairs source20/candidate39, New Moon pairs source18/candidate5. The sidecar's event lists completely cover its recorded target actions (no missing target events in all treatment rows). The new Basic recipient model therefore executes real game-state mutations; it is not merely a suggested or native-null-`canPlay` line.

**Root-skeleton digest caution remains critical:** **7/16** matched games have exactly equal `rootActionLedgerSha256` despite at least one genuine source/candidate Benched Energy attachment in their treatment. This reproduces the previously documented root-ledger target-blindness. Comparisons must use Store dispatch target and before/after public-zone records. The new experiment's 9/16 changed root-skeleton digests refer to action-kind/ordering differences, not all 16 physical changes. The raw archived artifact is authoritative for each individual physical transition.

## The native endpoints are not monotonically better

Three authentic candidate-specific game endpoints change type; all other 13 retain terminal/cap status and native winner when terminal.

| Existing exact native trial | Control | Energy-recipient treatment |
| --- | --- | --- |
| `11:3:A:champion-reference` | Terminal candidate-seat native win, Prizes `[0,6]` | 260 action cap, Prizes `[4,6]` |
| `11:1:B:champion-reference` | Terminal candidate-seat native win, Prizes `[6,2]` | 260 action cap, Prizes `[1,6]` |
| `11:1:B:new-moon-lockbreaker-v1` | 260 action cap, Prizes `[6,6]` | Terminal original-rank11 source-seat native win, Prizes `[0,6]` |

The 13 other arms remain in their original endpoint class (though some native action counts and attack choices change). The original source's aggregate 198→259 declared attacks represents **61 additional declarations across altered, potentially longer trajectories**, mainly in three or four correlated arms; it is not 61 independent powered or damage-progress attacks. Source-side improvements are consequential when evaluating candidate deck strength. A correct symmetric policy can **make opponents more threatening**, so using a weak source actor to score candidate wins would be misleading.

Each terminal winner remains a **native engine outcome only**. Paper attack/effect correctness, full both-seat action utility, controlled prompt and random-choice settlement, optional attack payoff, 25-minute match clock and all 32 original source lists are not qualified. In particular, some source printed Psychic-cost attacks cannot be powered from its exact 8-Darkness-only registered sixty under normal attachment, while other already-paid Basic Darkness attacks are possible: never reduce this to a single scalar of total Energy investment.

## Decisions and next falsification

**Supported:** a shared two-seat Basic Energy target frontier can produce actual Benched Energy investments on both original source and candidate boards, and can change game action and Prize paths. **Unsettled:** this treatment does not reliably produce stronger or more paper-accurate policy; the engine terminal count slightly declines and the Aichi field remains untested under qualified conditions. Existing Agent44/48 evidence already showed that redistribution without a follow-up attack switch can leave a game stalled.

The highest-value next discriminating experiment is the **same actor** moving a genuinely funded, printed-legal Bench attacker into Active via verified retreat/Switch/Guzma, followed by **paid, correctly chosen meaningful attack**, actual KO/Prize and opponent reply; insist on same-source physical-deal controls and include lock/Tool/Supporter opportunity costs. Independently audit the source's **owner-known registered 8-Darkness Energy supply** before valuing unreachable Psychic attacks; avoid further broad recipient tweaks based only on attachment counts. Reuse the canonical policy and same external workflow, and do not combine multiple new policy toggles until an isolated native mechanism is shown.

**Evidence status unchanged:** **29/32** authenticated original Aichi Top32 60s (missing ranks 23, 25, 28); **0** competitively qualified games; **no** verified fixed 60 attaining 99.5%.
