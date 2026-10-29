# Preregistration: retrospective rank-11 first-turn VIP target mechanism

**Agent 3, 29 October 2026 (before native run).** This is an intervention on a historically selected physical source deal. It cannot support deck win-rate inference.

## Frozen comparison

- The genuine original rank-11 Absol/Garbodor source 60, as printed in `results/aichi-2026/full-decklists.json`.
- The unchanged original rank-1 Shadow Rider champion reference 60.
- Original archived 32-arm scout registration `results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json`, **rank 11 / candidate physical A / repeat 0 / seed 3149897025**, with native source seat B. Agent1's independent source-own-hand audit already identified an unplayed T1 Battle VIP Pass on this source deal.
- Engine pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The canonical `executeDevelopment` and actor-only composition are reused unchanged, with the scout's relevant mechanical flags, strict prompts and native target observer. The **only experimental intervention** is one source-seat first-turn VIP Pass after an original Pass, using the preexisting Agent7 bridge.
- Three arms executed in deterministic order, always same actual source/candidate 60 and seed: (1) baseline, no VIP bridge; (2) VIP bridge with its old alphabetical owner deck-search selection; (3) identical VIP bridge with owner-only K1 Evolution-target scorer `agent3-owner-evolution-vip-search.cjs`.
- Gate: compare source original physical deal fingerprint, full physical setup fingerprint and actual starter across arms. Preserve all three outcomes including engine exceptions/caps; report the native source VIP PlayCard roots and prompt-selected target names. The handler must not read opponent-private cards.

## Hypothesis and falsification

The original alphabetical source VIP selector can use real native deck-search resources to choose two generic early-alphabet Basic targets while neglecting Trubbish, despite Garbodor in the acting owner's same searchable deck or own hand. The new search objective assigns positive value to Basic Pokémon with available Evolution partners, and may select Trubbish plus another Basic when the real prompt allows them. Existing mock native-prompt tests demonstrate this **conditional** contrast. The original source seed may contain different available Pokémon or the rank11 direct opening may preempt the bridge. Record such non-exposure, failure, or absence of useful mutation as negative evidence; do not change the seed after observing it.

**No competitive inference:** This test is retrospectively selected, it does not establish an optimal target, qualify the opposing strategy, model an official event clock or provide independent matchup probabilities. A favorable engine terminal is not a deck-quality result.

## Reproduction

`simulation/evaluation/agent3-source-vip-k1-native-pair.cjs` through the existing manual-only `agent7-canonical-actor-bilateral.yml` workflow opt-in. Reuse the original-root/native receipts; do not create a new CI workflow.
