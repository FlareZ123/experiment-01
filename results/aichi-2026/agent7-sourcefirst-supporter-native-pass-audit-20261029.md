# Agent 7: source-first Supporter playability and independently verified native Pass turns

**29 October 2026. Final compiled native audit, retrospective development-only.**

This extends the [original four-arm owner-hand Supporter census](agent7-owner-supporter-opportunity-native-20261029.md) to an actual **source-first** four-arm cohort, adds an opt-in pinned-card native canPlay(null) diagnostic, and independently joins Store-accepted Pass actions against the subsequent original-Store native action ledger. It documents a large two-player policy-coverage failure. No new decklist or performance claim is made.

## Exact provenance and controls

- [Final manual GitHub Actions 40943983624](https://github.com/FlareZ123/experiment-01/actions/runs/40943983624): **SUCCESS** at repository commit **432da3dba541a6acdfd38dfeb8be79f7f7f094ae**; pinned upstream Twinleaf commit **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Native, pure-regression, original-root parity, generic-fallback parity and accepted Pass successor gates all passed. Existing manual-only canonical workflow reused; no new CI workflow or scheduled job.
- [Native artifact 12928153334](https://github.com/FlareZ123/experiment-01/actions/runs/40943983624/artifacts/12928153334), ZIP SHA-256 **ff0750769d458c09909350eed6fc1e218b5ffd27d16076043329a7b97f30140c**. Contains the original four canonical candidate-first arms with observer ON/OFF and the four original retrospective source-first arms with observer ON/OFF. The original frozen candidate and rank-6/rank-11 source lists, physical deals, engine and policy settings remain unchanged.
- The observer uses the true acting owner's hand from the native State and the detached owner-only observation contract; it reads the printed trainer type, normal Supporter quota and public locks. A first-player-first-turn screen excludes ordinary Supporters while allowing the printed Carmine exception. It calls the actual native card.canPlay(null,state,owner) only with a second experimental opt-in. The full State is passed only to the read-only native legality diagnostic, **never** to the action decision policy.
- Every modified arm passed independent observer-OFF parity for original gameplay, frozen physical deals and preexisting decision evidence. No accepted Supporter PlayCardAction was proposed by the composed actor policy in any of the eight observed arms. Existing original-Store source/actor decisions, with no force-fed Supporter, are preserved.
- Four games had the **candidate actually start first**; a different four games had the **source actually start first**. These were historically selected trials, with no claim of preregistration, representative random sampling, or balanced field performance. Five games ended natively, three hit the action cap. All outcomes remain unqualified.

## What counts as an opportunity

A **first owner-turn root** is the first nonprompt decision of a physical player in a given engine turn; a single game has many such roots. **Held** means at least one Supporter physical card was in that actor's own hand. **Structurally open** means at least one held Supporter survives the limited public quota, lock and first-player-first-turn screen. **Native null-target positive** means the pinned printed-card canPlay method returned true when called with null target against the actual native State; this may be a false certification for target-dependent texts. These three measurements are distinct.

A **structurally open accepted Pass** is a bot-proposed PassTurnAction with a held structurally open Supporter whose original Store dispatch returned normally. **Accepted Pass with native-positive held Supporter** adds one or more cards whose canPlay(null) probe returned true. It is still unproven whether the printed paper-legal line, target and strategic benefit existed.

| Retrospective arm | First owner-turn roots | Held at first root | Structural opening at first root | Native positive at first root | Native accepted Pass with structural opening | Native accepted Pass with positive canPlay(null) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Candidate-first rank 6 / champion | 6 | 6 | 6 | 6 | 4 | 4 |
| Candidate-first rank 6 / New Moon | 48 | 47 | 47 | 23 | 43 | 23 |
| Candidate-first rank 11 / champion | 49 | 49 | 48 | 48 | 5 | 5 |
| Candidate-first rank 11 / New Moon | 51 | 34 | 34 | 34 | 8 | 8 |
| **Candidate-first subtotal** | **154** | **136** | **135** | **111** | **60** | **40** |
| Source-first rank 6 / champion | 10 | 5 | 3 | 3 | 3 | 3 |
| Source-first rank 6 / New Moon | 64 | 59 | 57 | 57 | 30 | 30 |
| Source-first rank 11 / champion | 17 | 16 | 16 | 10 | 12 | 9 |
| Source-first rank 11 / New Moon | 52 | 52 | 52 | 42 | 34 | 24 |
| **Source-first subtotal** | **143** | **132** | **128** | **112** | **79** | **66** |
| **Total eight historical games** | **297** | **268** | **263** | **223** | **139** | **106** |

There were **391 observed live owner-root decoding calls** in these eight original games, across both physical player seats, and **zero proposed, Store-accepted or visibly settled bot Supporter plays**. The canPlay(null) diagnostic strengthens evidence that some Supporter uses were mechanically plausible; it remains inadequate to certify exact paper legality or a counterfactual improvement.

The native probe deliberately exposed useful conditional distinctions. Ace Trainer was sometimes positive and sometimes negative, while card names such as Faba could return false when the native target conditions were absent. Different cards require different physical targets, discard costs, Prize states or effects; a scalar structural availability count is insufficient.

## Independent accepted Pass and clock witnesses

The reversible observer now uses a WeakMap keyed by the exact original PassTurnAction instance. It records bot proposals separately from original Store-dispatch success, plus any immediate turn transition. In the actual engine, **all 154 Store-returned Pass actions showed no synchronous turn increment in that dispatch hook**. Consequently the first-level wrapper alone must never be described as proof of a completed turn.

The separate research-owned [postgame join](../../simulation/evaluation/agent7-pass-next-root-postgame.cjs) compares each observed Store-returned Pass by physical seat against the original root-action ledger, then checks the first later nonprompt root. [Final compiled CI](https://github.com/FlareZ123/experiment-01/actions/runs/40943983624) independently asserted:

| Cohort | Original Store-returned Pass | Matching Pass roots in independent ledger | Pass roots whose next normal root has a later engine turn | Missing next root / same turn / clock regression |
| --- | ---: | ---: | ---: | ---: |
| Candidate-first | 66 | 66 | 66 | 0 |
| Source-first | 88 | 88 | 88 | 0 |
| **Total** | **154** | **154** | **154** | **0** |

This proves **observable subsequent engine turn advancement** after the same accepted Pass physical roots in these eight selected games. It does not prove that native dispatch advances the turn immediately, that a Supporter was legally usable, or that the game clock or deck strength is realistic. The native root ledger also verifies full PASS witness coverage with no unexplained roots.

Pure tests in [owner opportunity tests](../../tests/agent7-owner-supporter-opportunity.test.cjs) and [postgame join tests](../../tests/agent7-pass-next-root-postgame.test.cjs) now hard-fail on a proposal with no actual Store acceptance, mismatched accepted Pass counts and absent later-turn roots. Reversible hooks are restored after each game.

## Consequences for the shared optimization

- **Source policy is a material confound:** In source-first rank-6/New Moon the real rank-6 owner retained native-positive, conditionally strong printed Supporters including Plumeria, Team Skull Grunt, Sidney and Lillie's Determination on many turns while the bot never proposed a Supporter. The rank-11 source contains Marnie and Guzma. Do not promote synthetic opponent wins when these sources are inadequately piloted.
- **Candidate policy also needs improvement:** Rank-11 New Moon has native-positive first-root draw, attack-position or ACE Trainer channels that the current bot did not actually spend. Full retained-hand value, cost, Supporter contention, opponent information and concrete target routes are required before deciding to play each card.
- **Native playability is a diagnostic:** The Game State passed to native card.canPlay is an oracle-like resource. A future decision policy cannot consume hidden information available only through that interface unless proven part of the legal player's observation; the own-hand/public-state abstraction remains the selection boundary.
- **Next meaningful evidence:** Implement a conservative owner-visible, printed-card legal Supporter action selector, then validate actual root action, prompts, native effect settlement and source reply on both starting orders, with same-deal controls and all censored arms. Agent 25 is independently developing a Lillie's Determination positive control and has been notified; avoid parallel conflicting Supporter implementations.

**Qualification unchanged:** 29 of the Aichi 2026 Top 32 exact source sixties authenticated; ranks 23/25/28 missing; **zero competitively qualified games**; no verified single fixed deck attaining or approaching the target 99.5% paper Expanded field win rate. This is a simulator policy fidelity finding and methodological gate, with no win-rate inference.
