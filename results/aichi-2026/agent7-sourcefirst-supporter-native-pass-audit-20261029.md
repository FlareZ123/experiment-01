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


## Independent owner-public necessary-condition screens (compiled follow-up)

The fifth manual compiled native run, [40945500643](https://github.com/FlareZ123/experiment-01/actions/runs/40945500643), completed **successfully** at repository commit cb69f63aa6464e10ca21e59f078a41dc2fc91547, pinned Twinleaf unchanged. Its archived [original Store artifact 12929995391](https://github.com/FlareZ123/experiment-01/actions/runs/40945500643/artifacts/12929995391) has SHA-256 15c52f7f63431399fc631e76782cf82f35b586d2fc4bf06a72a94a59c1d95604. The read-only audit now records both visible Bench counts, attached Energy-card counts, Prize counts, deck counts and public opponent hand count at each actual owner Pass. Postgame public condition screens run only where that owner held the exact printed Supporter, the structural quota/first-turn/lock screen was open, and the pinned native card.canPlay(null) returned true. All native observer ON/OFF gameplay and postgame original-root Pass successor controls passed.

**Exact card-name screens at native Store-accepted Passes, aggregated over the selected 8 historical arms:**

| Actor | Printed Supporter | Held/native-positive accepted Pass observations | Owner-public necessary-condition passes |
| --- | --- | ---: | ---: |
| Source rank 6/11, candidate-first | Plumeria BUS | 25 | **25**, with owner hand size at least 3 and at least one opponent attached Energy card |
| Source rank 6/11, source-first | Plumeria BUS | 24 | **24**, same public tests |
| Source rank 6/11, candidate-first | Guzma BUS | 14 | **10**, opponent Bench and own Bench both occupied |
| Source rank 6/11, source-first | Guzma BUS | 37 | **15**, both Benches occupied |
| Candidate, source-first | Ace Trainer AOR | 16 | **16**, own Prize count greater than opponent's |
| Source, source-first | Lillie's Determination M1L | 33 | **33**, owner has exactly 6 Prize cards remaining (printed draw-eight mode) |
| Candidate, candidate-first | Carmine TWM | 2 | **1**, owner playing its first turn going first |
| Source, candidate-first | Carmine TWM | 13 | **0**, no first-player-first-turn exception window |

One source-first candidate-held Lillie's Determination native-positive Pass had fewer than six Prize cards, so it was excluded **only** from the optional draw-eight mode screen; normal draw-six can remain available. The table describes repeated turn-level **opportunities**, not independent games, free disposable hand cards or confirmed useful tactical lines. A source may retain a Plumeria in a game where using it is unattractive despite the resource and target counts. The printed Plumeria requirement to discard two actual cards creates discard-capable-index (DCI) value contention; counting them does not prove low-cost discards. Guzma's full two-switch line is similarly subject to realistic target selection. Printed individual conditions come from the supplied card database; the native canPlay output was treated strictly as an experimental diagnostic. No counterfactual legal root was attempted in these observational arms.

The historical runs still show **zero Supporter actions proposed by the bot** in any of the eight selected games. Future candidate/source Supporter positive controls should report the actual native accepted PlayCardAction, prompt target, resolved discard/draw/switch/Energy effects and opponent reply, rather than only the table above.

### First-player Supporter screen correction

The complete supplied English card pool identifies **three printed Supporters** explicitly permitting use on the first turn going first: Carmine TWM, Beauty VIV, and Team Rocket's Proton DRI (including alternative printings). The initial v1-v3 owner structural screen had treated only Carmine as an exception. The corrected v4 observer explicitly recognizes all three and regresses them while continuing to restrict ordinary opening-player Supporters. None of the selected eight historical lists contains Beauty or Team Rocket's Proton, so retrospective historical counts are unaffected. This correction is about scope expansion to the full paper Expanded pool; printed-paper or native acceptance for any particular opening play is still a separate question.
