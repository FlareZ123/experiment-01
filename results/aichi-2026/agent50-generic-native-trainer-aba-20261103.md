# Agent50 generic Trainer fallback: registered owner-root A/B/A native outcome

**3 November 2026, 12:45 UTC | developmental mechanism experiment | no qualified games or deck recommendation**

## Question and immutable registration

Can a single, symmetric, default-off generic fallback relieve the canonical actor-only policy's `no-supported-owner-visible-root` Pass starvation using the existing pinned native bot's proposed Trainer, while preserving exact historical controls and physically matched initial deals?

Registration: [agent50-owner-native-trainer-fallback-v1-20261103.json](registrations/agent50-owner-native-trainer-fallback-v1-20261103.json). Manifest SHA-256 `69847fda0f6b1b3de62513f70e71fc64f5f10c69fd71f9aae02072ce5b3df4f5`. Before any native simulation, exact 4-cohort/12-attempt preflight passed. Original Aichi ranks **5 Mew/Genesect** and **11 Mega Absol/Garbodor**, each as its unchanged authenticated printed 60; two physical seat orders; repeats 1 and 2 with seed base 20261119, phase `pilot`, rank 5. Every source-deal cohort used control / treatment / repeated control; the only intended policy difference was `nativeOwnerTrainerFallback:true`. Shared opt-in owner Trainer observer and generic fallback attribution remained on in every arm. Native action cap 90.

The fallback works at a genuinely live actor-owned root only after the canonical policy would choose an unsupported Pass. It asks the pinned native `SimpleTacticsAi` for a Trainer root proposal, filters by Agent5's generic actual-owner/public-board Trainer gate (Item/Supporter/Tool/Stadium lanes and public play restrictions), then submits the unmodified proposed `PlayCardAction` to the real Store. It records actual Store acceptance and errors independently. The native bot's proposal is **not information-set certified**; the generic filter does **not** prove individual paper costs, targets, prompts or strategic superiority.

Code: [generic classifier](../../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs), [canonical owner root hook](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), [common two-seat transport](../../simulation/evaluation/agent7-canonical-actor-composition.cjs), [registered native runner](../../simulation/twinleaf/agent50-generic-owner-native-trainer-paired-v1.cjs). All three new pure/integration/registration test files are at `tests/agent50-native-owner-trainer-pass-bridge.test.cjs`, `tests/agent50-native-owner-trainer-pass-integration.test.cjs` and `tests/agent50-generic-native-trainer-registration.test.cjs`. Option remains default-off. No upstream submodule edits.

## Actually executed evidence

[Manual compiled native CI **41637609294**](https://github.com/FlareZ123/experiment-01/actions/runs/41637609294) **passed**, at commit `ec7e8ca350a789497c43ecb037e0a9e11ab3aca7`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All new pure tests, integration tests and precompile seed-contract tests passed. Raw archive: Actions artifact **13230633884**, `agent50-generic-native-trainer-aba-v1`, 30-day retention, ZIP SHA-256 `cff9bc28a739b667bc3648b274fa1318c4bf7cba7ba71cb9166af1ba2a874c5b`, contained JSON SHA-256 `28bfd2b3f0a18141e96305640b7828abfe2ccc884e4c1fcf2c1cd97196c654f3`.

**All 12 registered attempts were archived; all four control/treatment/repeated-control trios had identical initial full-physical-deal SHA-256; repeated control was byte-equivalent on the entire archived game-evidence projection. Zero native errors.** Three physical cohorts remained action-capped in every mode; the other was the same native terminal in each mode. No competitive-game qualification or verified field win.

| Cohort (rank5 seat) | Native fallback Trainer roots accepted | First declared source rank11 attack, control → treatment | Final Prizes, control → treatment | Disposition (all three modes) |
| --- | ---: | --- | --- | --- |
| repeat1 A (seat 0), seed 3133142136 | 3 | none → `Psychic` turn6 (seat1) | `[6,6]` → `[6,4]` | action cap 90 |
| repeat1 B (seat 1), seed 465442104 | 7 | none → `Terminal Period` turn3 (seat0) | `[6,6]` → `[6,6]` | action cap 90 |
| repeat2 A (seat 0), seed 2934853417 | 0 | `Energy Drive` turn4 → same | `[6,6]` → `[6,6]` | native terminal, winner seat1 |
| repeat2 B (seat 1), seed 2316286015 | 2 | `Terminal Period` turn7 → turn3 (seat0) | `[6,6]` → `[6,6]` | action cap 90 |

The twelve Store-accepted generic Trainer roots consist of **seven Items, two Stadiums, two Tools and one Supporter**. By original physical owner they were **seven rank11** and **five rank5**:
- `Quick Ball FST` ×3; `Professors Letter BKT` ×3;
- `Temple of Sinnoh ASR`, `Muscle Band XY`, `Karen XYP`, `Secret Box TWM`, `Float Stone BKT`, `Path to the Peak CRE`, each ×1.

These are *12 selected and native-accepted root actions*, not 12 independent plays/games and not 12 paper-verified Trainer effects. Native actions can be consequential without proving that the resulting policy is generally stronger. One matched source case changed zero attack declarations to six native `Psychic` declarations and a 2-Prize native transition, while remaining action-capped. Two rank11 cohorts advanced the first `Terminal Period` declaration to turn3. They require source printing, actual Energy/payment, attack-effect, defender, and opponent-reply adjudication before promotion.

### Concrete payment and connector-contention witness

In repeat1 B, rank5 seat1 selected `Quick Ball FST` on native global turn2. The real ChooseCardsPrompt requested exactly one discard, selected `Escape Rope BST`, and its own-deck ChooseCardsPrompt selected `Crobat V DAA`, followed by a real `PlayCardAction` for that Crobat. Those are native prompt/choice receipts; the archive does not yet certify the exact physical owner-discard postcondition or paper-dominance relative to retaining Escape Rope.

In the same source turn, the native bot then selected `Karen XYP`, `Secret Box TWM`, `Float Stone BKT` and `Path to the Peak CRE`. The genuine Secret Box native prompt requested exactly three discard selections and recorded `Special Charge STS`, `Quick Ball FST`, `Ultra Ball MEG`; the subsequent four-target search selected `Guzma BUS`, `Battle VIP Pass FST`, `Float Stone BKT`, `Path to the Peak CRE`. This is stronger prompt cardinality evidence than the previously observed **zero-cost Secret Box** bug in another Store context, but independent before/after discard-zone conservation remains required. The selected Battle VIP Pass was already past the first turn, raising a clear opportunity-cost concern. No assertion of optimality follows.

## Interpretation and open gate

1. This proves the terminal unsupported-Pass path can be generically widened with a single common actor hook and **12 authentic native Store-accepted Trainer roots** across both original decks, with reproducible physical controls. It is a real selected-component result, narrower than full general planning.
2. It does **not** prove the fallback is paper legal or safe to release competitively. The delegated upstream native bot can use concealed game information, and its action preference has not been contrasted with alternative legal actions from the same owner root. It may choose a strategically poor Trainer or expend an important connector. The fact that all observed native root dispatches were accepted cannot discharge the known Secret Box, Supporter, Tool and prompt fidelity concerns.
3. All 12 attempts were either native action caps or unqualified native terminals; the Aichi Top32 original roster still lacks ranks 23, 25, 28. The 99.5% target has **zero demonstrated competitive games**, and no best fixed 60 can be selected from this experiment.
4. Next high-value step: keep these four exact physical controls; instrument printed family-specific payment/zone settlement and opponent consequences, then replace hidden-state native preference with a deterministic owner-only comparison between actually affordable Trainers and competing attack/Energy/Bench/Supporter lines. A fresh preregistered cohort is needed for any subsequent win-rate inference.

**Evidence classification:** registered, repeatable genuine native Store experiment for a developmental policy intervention; exact native action-choice, prompts and Prize transitions in archived JSON; paper legality and competitive strength **unverified**.
