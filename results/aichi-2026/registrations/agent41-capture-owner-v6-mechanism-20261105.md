# Frozen retrospective Issue25 Capture Energy owner-prompt mechanism test

**Agent 41 | 5 November 2026, before native run 41970153774 completes**

## Question and comparison

Can an owner-only `ChooseCardsPrompt` continuation resolve a genuine `Capture Energy RCL` deck search after the native Store accepts a hand-to-Pokémon attachment, avoiding the original rank-6 source's observed root46 / turn9 bot decoder failure?

The original eight contexts are exactly Agent1's immutable `results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json`: ranks 6 and 11, source in both actual physical seats, two unchanged 60-card candidates, source seeds 1492376549, 1787484121, 1760478218 and 811955552, 48 accepted root-action cap. This registration is **retrospective** to an already examined historical native failure; it cannot be promoted to prospective competitive sampling.

- Control: existing actually joined three printed-attack handlers, `sourceIndependentCommonPolicy:true`, `bilateralSpecialEnergyRoot:true`, and native Store accepted-target observer.
- Treatment: identical runner and original registered trial IDs, with `withOwnerCaptureEnergySearch` nested inside the same joined printed-attack wrapper. No changes to decklist, seed, initial seat, card engine or root Energy selector.
- Evidence gate: retain all eight original trial rows including aborted and action-capped rows, compare observed first source and full physical-deal SHA256 separately per trial, and report every native prompt offer, Store accepted/rejected result, actual owner Bench transition, and original-source attack count.
- Primary mechanism pass: at least one observed actual Capture attachment produces a matching genuine owner-deck ChooseCards prompt, its answer passes native validation, the live Store accepts it, and an actual legal zero-choice or physical Basic-to-Bench transition follows. Compare the old rank6 New Moon decoder boundary directly. Failure is a useful result, with handler or simulator reason reported precisely.
- Negative controls: other owner's prompt; unmatched own-deck prompt without prior accepted Capture; clone Store validation; no eligible Basic/Bench capacity; prototype restoration on error. Five pure tests ran locally before submission, and the same five must pass pinned CI.

The handler only accesses actual owner deck contents **after** the live Store presents that owner's genuine search prompt. It uses the first Store-validated Basic if a Bench slot is empty, otherwise attempts a validated empty search. It does not claim tactical optimality or validate every printed Capture Energy effect.

**Registration verdict:** diagnostic native-policy research only. Zero paper games and zero competitive games admitted. No field win rate, strongest deck choice or 99.5% claim can follow from this test.

**Implementation:** `simulation/twinleaf/agent41-owner-capture-energy-search.cjs`, `tests/agent41-owner-capture-energy-search.test.cjs`, `tests/agent41-issue25-capture-owner.native.test.cjs`. Existing manual `.github/workflows/twinleaf-completion.yml`, with `abort_provenance_only:true` and `include_v6_bilateral_special_energy_aba:true`. Dispatch `41970153774`.
