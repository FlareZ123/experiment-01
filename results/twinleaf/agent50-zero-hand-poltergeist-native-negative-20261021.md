# Agent 50: copied Poltergeist public-zero-hand alternative had no native exposure

**21 October 2026 · Development result only · Competitive-qualified games: 0**

## Decision question and paper basis

Gengar & Mimikyu-GX (`sm9-53`, printed TEU) has **Poltergeist**: the opponent reveals their hand and this attack deals 50 damage per Trainer card found there. The supplied card pool confirms that wording. If the opponent's publicly visible hand has zero cards, the printed multiplier is zero regardless of hidden card identities. Under that exact public condition, selecting a different *offered and already legal* non-GX copied attack with fixed positive printed damage may improve immediate damage. Such raw-damage reasoning does not establish tactical superiority or a knockout.

The native copied-attack handler `simulation/twinleaf/agent13-actor-only-choose-attack.cjs` now has an **opt-in-only** `preferZeroHandPrintedDamage` option. It reads the authenticated actor-only opponent `handCount` and the genuine owner's `ChooseAttackPrompt` printed donor menu. It selects an already offered different, unblocked and GX-permitted attack with known positive integer printed damage. Variable damage and unknown damage are excluded. A default-off option preserves every existing canonical policy decision. The typed Store action uses the same native Attack reference. This added heuristic remains incomplete for full damage effects, tactical lock value and native/paper game-fidelity.

## Frozen native experiment

Existing original-source retrospective rank-11 Absol/Garbodor versus New Moon 60 proxy, seed **1244180408**, source physical seat **0** starting first, New Moon seat **1**. The same Gengar Poltergeist donor preference was set on both branches. The *only intended experimental difference* was the public zero-hand option disabled versus enabled. No deck or opponent registration changed. The same pinned Twinleaf headless engine is used in an existing manually triggered GitHub Actions workflow.

- First compiled [CI 39611998534](https://github.com/FlareZ123/experiment-01/actions/runs/39611998534), checkout SHA `5075f88aee0b75821ec65e9f9e6730d8b4e2e3bb`, **passed** synthetic decision tests, two actual native source games and first comparison.
- Full source artifact: [artifact 12351955923](https://github.com/FlareZ123/experiment-01/actions/runs/39611998534/artifacts/12351955923), ZIP SHA256 `8dfaf195859dd0829867227d96043d3ffcfc6d3f91ea539e8a8eb0d60fb1053a`. Preserves the complete JSON packets for baseline, treatment and comparison.
- Source runner: `simulation/twinleaf/agent13-copied-attack-source-smoke.cjs`. Comparison: `simulation/evaluation/agent50-zero-hand-native-pair.cjs`, pure regressions `tests/agent50-zero-hand-poltergeist-choice.test.cjs` and `tests/agent50-zero-hand-native-pair.test.cjs`.
- **Important audit caveat in first CI:** the field `sourceActionLedgerDigest` was null in *both* native packets. The first comparison incorrectly interpreted equality of two nulls as a positive whole-native-ledger comparison. Its `sameFullNativeRootDigest:true` **must not be used as evidence of root equality**. The new code instead requires the true headless `rootActionLedgerSha256` and `initialSourceDealFingerprint.digestSha256`, with a corrected fail-closed synthetic test. A second compiled same-seed run **39613490258** was dispatched at a later SHA and should be used to qualify whole-root equality. Until it completes, full-ledger parity is not established by the first run.

## First-run observed native decisions

| Candidate copied-attack event | Actual turn | Opposing public hand count | Referee Trainer count (post-choice only) | Native Poltergeist printed base |
| --- | ---: | ---: | ---: | ---: |
| First | 8 | 4 | 4 | 200 |
| Second | 48 | 10 | 9 | 450 |
| Third | 50 | 10 | 10 | 500 |

Both real native games accepted all **three** printed Poltergeist `ChooseAttackPrompt` selections, with **zero rejected** prompt actions. The candidate first choice occurred at native root **87**, with an identical original pre-first-copy root prefix hash `9502143ca90b8edc490a1d964f24d88a0f0851aad27b45617ed88fc7da34bc4e` in both branches. The opt-in policy made **zero** changed selections because none of the three observed opposing hand counts was zero.

Both branches ended at **300 native actions** with the same selected attacks, same reported source-side post-copy root samples, candidate engine terminal (seat 1) and native Prize report `[6,0]`. That long untimed terminal is **not a competitive win**; the source game, weak generic fallback (`162` native prompt delegations in each run), game policy and paper-clock fidelity remain unqualified. Post-choice referee Trainer counts were recorded only for evaluating the base-damage evidence and were not passed into the acting player's decision.

## Interpretation and priority

This **falsifies an exposure hypothesis on this one historical source deal**: there was no zero-hand condition at an eligible copied Poltergeist attack. The policy change therefore cannot explain any improvement in this run. It does not establish that zero-hand turns are absent elsewhere, nor that this conditional attack would be strategically superior if encountered.

Compared with source-plus-candidate policies that repeatedly choose zero-impact setup attacks under a 260-root cap, the immediate collective priority is still to establish one consequential, legally settled, owner-information-safe bilateral attack/board/response policy in the canonical runner. This narrow option is not proposed for automatic integration without an actual source-dealt opportunity and adversarial follow-up.

**Benchmark unchanged: 29/32 exact official source 60s, zero competitively qualified games, no validated 99.5% fixed deck.**
