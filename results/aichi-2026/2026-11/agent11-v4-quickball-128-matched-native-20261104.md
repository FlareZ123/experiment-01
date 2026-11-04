# Preregistered same-deal Quick Ball source test: 128 native arms, substantial action-cap censoring and full-Bench failures

**Agent 11 | 4 November 2026 | Development-only paper Expanded source-policy A/B | 0 qualified competitive games**

## Exact source, frozen procedure and provenance

This is a **prospectively registered**, fresh **16 random seeds × 2 physical positions for original rank 5 × 2 owner-resource-tutor modes × 2 Quick Ball actor-policy profiles = 128 native attempts**. The two source decks are the **unchanged original printed 60s** in `results/aichi-2026/full-decklists.json`: original tournament rank 5 Mew/Genesect vs rank 11 Absol/Garbodor. Every physical seat received identical enabled default-off Mew evolution, Double Colorless Energy and other Energy, Genesect Fusion draw, optional owner tutor, and known-dead attacking components, except for the single deliberately varied option: **conservative actor-only Quick Ball root enabled or disabled for both players**. Quick Ball is selected only when there is an available Bench slot, a nonempty deck, and a duplicate of some non-Quick-Ball hand printing that could serve as a cheap discard. Its subsequent mandatory discard and deck search still depend on native prompt resolution.

- Preregistration: [frozen v4 64 physical arms](../registrations/agent11-owner-resource-tutor-bilateral-v4.json), committed **`3ff625ffbdf538da50362c13b8e2bb42e72eda65`** *before either profile's outcome was observed*. Both profiles consume the same 16 freshly generated CSPRNG seeds; runtime SHA256 of `JSON.stringify(registration)` is **`cf3e211926004a2fc3f3b5615d47a0327ad7b1f30cd6dd1db42f7f0058ac196d`**.
- Engine: frozen Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, shared repository CI checkout **`7e4642dee046d2887830dc57005596a7976a2306`** for both profiles.
- **Quick Ball OFF:** completed [manual CI 41901549528](https://github.com/FlareZ123/experiment-01/actions/runs/41901549528), immutable original JSON artifact **13358501623**, archive ZIP SHA256 `ba09d2205df7d6fb6d342ac91bc0b325a2d1f483fb76357f60fd33ff082b9a27`, extracted `agent11-owner-tutor-native-v4.json` SHA256 `1d5a7ebe7389d65d4539b473d7bfb370fac216c4dabf161a7421d7a67f068bf4`.
- **Quick Ball ON:** completed [manual CI 41901576963](https://github.com/FlareZ123/experiment-01/actions/runs/41901576963), immutable original JSON artifact **13357779562**, archive ZIP SHA256 `99437c5acb2c52fc9e4f44c3abf8f1040e3e39b79f1a48f0257437c8665dac72`, extracted `agent11-owner-tutor-native-v4.json` SHA256 `ee45cc79147dbd49e0ea8248f8cf6aea649d3a683c4150200d73cf879b47f13c`.
- The independent SHA-bound [full 128-arm archive auditor](../../../scripts/agent11-v4-quickball-exact-paired-archive-audit.cjs) checks exact source registration, both immutable JSON SHA256 values, all error-preserved initial physical deals and turn-order receipts, selected native Quick Ball roots, native prompts, status changes, and settled copied-attack Prize consequences. The independent lightweight [archive CI verification workflow](../../../.github/workflows/agent11-v4-quickball-archive-verify.yml) downloads **the originals** by immutable run ID and tests the exact script, without rerunning 128 matches. See its successful run in GitHub Actions after validation.

## Native observations (NOT game win rates)

| Measure | Quick Ball OFF (64 attempts) | Quick Ball ON (64 attempts) |
| --- | ---: | ---: |
| Identical same-seed opening full-physical-deal pairs | 64/64 across profiles | 64/64 across profiles |
| Native rank-5 winners | 5 | 0 |
| Native rank-11 winners | 8 | 6 |
| Action caps (90 native actions) | 41 | 45 |
| Native dispatch errors | 10 | 13 |
| Selected Quick Ball `PlayCardAction` roots, including error histories | 0 | **99** |
| Rank-5 Cross Fusion Strike declarations from rows with attack telemetry | 32 | 16 |
| Those declarations settled by Store | 30 | 12 |
| Copy attempts with Benched Genesect V, regardless of settlement | 28 | 12 |
| Cumulative rank-5 Prizes from settled Cross Fusion Strike | 40 | 11 |

**All 64** pairs have exactly equal full initial physical-deal SHA256 and first-turn physical seat, including rows where the normal result was absent because the Store threw. To reconstruct an errored row, read the independent pre-dispatch `error.nativeAbortEvidence.fullPhysicalDealFingerprint.digestSha256` and `initialTurnOrderEvidence.firstTurnSlot` rather than treating missing primary fields as a mismatched deal.

**99 accepted native Quick Ball plays** are visible across root ledgers and native abort ledgers: 44 on original rank-5's physical seat, 55 on original rank-11's. All 99 were followed by **two actual native ChooseCards prompt resolutions** corresponding to discard and deck target. **97** also completed the expected reveal, shuffle and wait prompt sequence. Two started Quick Ball near the 90-action horizon and had their prompt sequence truncated by the cap. The primary archived root ledger does not expose physical selection identities or full zone-movement proof, so the result demonstrates root feasibility and native prompt progression rather than proving strategically acceptable discards or deliberate Genesect targeting. Do not silently equate a selected connector with useful resource access.

Original native disposition changed in **12 of 64 exact source pairs**. Among the transitions, two rank-5 native terminals became caps, multiple rank-11 terminals became caps, three prior caps became full-Bench errors, and a prior cap became a rank-11 native terminal. Only **13/64 paired full root-action ledgers were exactly identical**. This is a substantive policy intervention, although the native outcome changes are highly censored and not calibrated to paper tournament strength.

## Two major mechanisms make the apparent negative result inconclusive

**1. The 90-root native action budget is an unfair time proxy.** A paid Quick Ball root is followed by multiple prompt actions: in the 97 complete cases, two ChooseCards, one ShowCards, one ShuffleDeck and one WaitPrompt. The ON agent therefore consumes approximately six counted engine actions for a legal one-Item play before returning to the turn, and can be capped earlier in **real game turns** even if its search is beneficial. Among action-capped attempts, the median final global turn is **22** with Quick Ball OFF and **19** ON, despite the same fixed 90 native action cap. Consequently, **13 versus 6 native terminals, 32 versus 16 Cross declarations and 40 versus 11 copied-attack Prizes are not defensible estimates of tournament strength or card-value effects**.

As a *post hoc* exploratory sensitivity, compare each same-seed pair only through the **earlier of the two observed global-turn horizons**, retaining every registered pair and non-terminal failure in the audit. This counts **19** baseline versus **11** enabled native Cross Fusion Strike Prize receipts within common observed turns. Differences occur in four pairs, all favoring OFF; the remaining 60 are equal within their common limited horizons. This is a narrower same-clock observation, but is still biased by opponent choices, error truncation, and the large number of uncompetitive game states. It does not license a card-cut conclusion.

**2. Repeated pinned-engine paper-fidelity failure terminates genuine original-deck games.** All **23** native errors (10 OFF, 13 ON) trace to source rank-11 `Trubbish FST` `Call for Family` while all five Bench slots are occupied. The provided Advanced Player's Rulebook **C-11** explicitly says that the attack must **end before searching the deck** in this state. Pinned Twinleaf instead throws `NO_BENCH_SLOTS_AVAILABLE`. Relative to OFF, ON fills source Benches more aggressively, and three additional paired dispositions collapse into this error. Native failure count is not a loss or a legitimate competitive win by the other deck.

Each effect above can dominate the apparent card-value signal. The source rank-11 bot is also known to overuse `Mega Absol ex` `Terminal Period` on targets with zero damage counters, and both source bots have inadequate payoff-aware deck search, discard and attack sequencing. A normal-game simulation with fixed 90 action budget and full-Bench attack exceptions cannot establish a sign, let alone a reliable magnitude, for Quick Ball's true paper value.

## Follow-up and integrity restrictions

A **separately labeled retrospective compatibility stress**, dispatched *after observing these failures*, applies [a reversible development-only full-Bench pass shim](../../../simulation/twinleaf/agent11-fullbench-call-family-native-pass-guard.cjs) to both profiles on these same 16 seeds. It is a narrow approximation: when the actual native bot chooses `Trubbish FST Call for Family` and has five occupied Bench slots, it substitutes a turn-ending native Pass instead. This avoids the known Store exception; it also loses genuine attack-declaration semantics and **cannot certify paper-rule equivalence or qualify any game**. Its [five focused test cases](../../../tests/agent11-fullbench-call-family-native-pass-guard.test.cjs) check live-state isolation, Bench count, identity, exception restoration and native Pass acceptance. Any cross-profile interpretation must present its separate, immutable artifact revisions and describe this intervention as retrospective.

A genuine release-quality comparison requires source-paper attack effect handling, original physical discard/target custody, competent K0/K1 owner-only policy, equal **turn or time** budgets rather than root-action caps, correctly counted attack restrictions, true original 60/32 opponents with original provenance, and public counterplay. Current benchmark still has 29/32 complete 60-card inventories and **zero qualified paper games**. These analyses are tests of native execution quality and model validity, **not evidence that a given final deck is close to 99.5%**.
