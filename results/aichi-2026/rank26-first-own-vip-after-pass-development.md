# Rank26: owner-safe source VIP after generic pass, frozen native falsification

**Agent 4, 19 October 2026. Status: implemented, locally tested pure decisions, native paired runner NOT executed.** This is an exploratory retrospective policy-fidelity investigation, without a prospective win-rate sample.

## Prior complete-cohort evidence and selection rule

The full previously registered [48-deal source census](rank26-held-item-pass-census.md) found 20 actual rank26-first situations, seven with Battle VIP Pass in the first owner hand and zero firstturn Pass plays. Five of those seven had **no Meloetta ex already Active or Benched**. These five and only these five form the new development set. They were selected **after** reading the archived cohort's opening source state and do not establish a prevalence or improvement rate. Baseline source 60 is exact published rank26 Meloetta Donk; opponent is exact published rank6 Iron Thorns 60. Pinned Twinleaf commit is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Archived repeat | Physical rank26 seat | Original seed | Open Bench slots | Source had Meloetta? |
| --- | --- | --- | ---: | --- |
| 63 | A | 26947711 | 4 | No |
| 63 | B | 1093191703 | 5 | No |
| 78 | B | 3278006979 | 4 | No |
| 80 | B | 2274498611 | 4 | No |
| 83 | B | 2614852201 | 4 | No |

All five had rank26 genuinely first under the original draw log, held at least one printed Battle VIP Pass FST, and the baseline policy passed before playing it. This exact five-case identity set is hard-coded in the [paired test runner](../../simulation/twinleaf/rank26-vip-after-pass-source-pair.cjs) and verified against original `deriveSlotSeeds(20261019,'pilot',26,repeat)`; disallow changing seeds after observing the treatment.

## Intervention and paper/hidden-info constraints

The [opt-in reversible owner-only adapter](../../simulation/twinleaf/rank26-first-own-vip-after-pass.cjs) composes with the original `rank26-propagation-v3 + Mail starter-agnostic v2` policy. It considers a replacement Item **only after the existing bot chooses PassTurnAction**, in the **source's true global turn 1**, while the owner visibly holds Battle VIP Pass, Meloetta is absent from its public board and own hand, and Bench space allows reserving one slot for Tapu Koko Prism Star unless Koko is already in play.

If those prerequisites hold, it proposes a *real physical-hand* PlayCardAction and checks `SimpleTacticsAi.isValidAction` on the current native Store. It does not peek into deck or Prize cards to decide whether to play the Item. Only after the native `ChooseCardsPrompt` identifies the acting owner's deck as searchable does it inspect the physical available Basic Pokémon. It prefers **Meloetta ex SV11B** and then **Exeggcute PLF**, obeying the real prompt validator and leaving reserved Koko Bench capacity. If neither target can be legally selected, the real prompt falls back to the preexisting bot. All mutations go through the Store's normal action and resolver, not synthetic card insertion.

The wrapper logs offered native legality, actual selected physical card references and the subsequent public Bench. It leaves the vendor submodule untouched, restores the original `decodeNextAction` prototype after the match, and does not claim an optimal policy. A reserved Koko slot can be overly conservative where a valid card removal frees space. Conversely an accepted VIP can expose strategically unwanted multi-Prize Basics, making opponents' Prize routes easier. These are real decision tradeoffs for later evaluation.

## Reproducible bounded test

- Pure tests [rank26-first-own-vip-after-pass.test.cjs](../../tests/rank26-first-own-vip-after-pass.test.cjs): **3/3 passed locally with Node**, covering player-seat/turn, Koko slot preservation, genuine owner-card selections without deck mutation, and input rejection. No pinned compiled Store was available locally.
- [Source runner](../../simulation/twinleaf/rank26-vip-after-pass-source-pair.cjs): syntax checked locally with Node. For each of the five frozen opening states, it compares the unchanged baseline against baseline plus VIP adapter with equal decks, physical seed, seat, root-turn flags, card conservation assertions, draw-log evidence, and a 120-action cap. It records both positive and negative native acceptance and all firstturn actions; **this runner has not produced a compiled game outcome yet**.
- Existing **manual-only** [.github/workflows/aichi-damage-pump-fidelity.yml](../../.github/workflows/aichi-damage-pump-fidelity.yml) now has an opt-in boolean `rank26_vip_after_pass_probe`, default **false**, plus pure tests and artifact archival `rank26-first-own-vip-retrospective-unqualified`. It adds no on-push CI or always-on expensive experiment. The GitHub Actions manual dispatch was blocked in the chat tool, so **do not invent a run ID, native action acceptance, resolved Bench, attack or Prize change**.

## Exact decision gates for interpreting a future run

1. First verify all five baseline authentic opening hands, actual starter identities, seed hashes, unchanged 60-card inputs and baseline's absence of VIP Item plays.
2. For every arm, record whether the original policy's Pass had a native-valid VIP replacement and whether an owner-legitimate search selected Meloetta or an Egg. A zero or error must remain in the denominator.
3. Verify actual accepted root PlayCardAction, actual owner-resolved prompt, post-Store Bench card identity, and whether the source afterward attempted a legal printed attack or materially changed Prize counts.
4. Keep the response from a credible rank6 Iron Thorns policy, paper legality and game-clock qualification separate. Even five successful setup repairs would be retrospective selected opportunities, not win-rate evidence.

**Global status unchanged:** 29 of 32 exact opponent 60s, zero competitively qualified games and no validated 99.5% fixed deck.
