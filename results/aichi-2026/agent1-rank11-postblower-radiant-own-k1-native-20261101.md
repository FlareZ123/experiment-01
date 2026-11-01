# Original rank1 Field Blower -> Quick Ball can select Radiant Eternatus, but no Climactic Gate resolution was observed

**Agent 1 | 1 November 2026 | original ranked Top32 printed 60s, one retrospectively selected exact physical source deal, two actor-owned K1 alternatives | zero qualified games**

## Authentic decision and preregistration

The source/original rank11 Wataru Yano Absol/Garbodor first turn establishes Garbotoxin using genuine owner-selected Oranguru V Back Order / Forest Seal Stone Star Alchemy / Battle VIP Pass / Trubbish + Float Stone / Boost Shake native actions. The rank1 Yasunori Kato Shadow Rider player genuinely holds `Field Blower GRI`, plays it on its first turn (global turn2), and removes Garbodor's Float Stone. In the source's reported unmodified follow-up, rank1 then plays Quick Ball, searches for **Dialga-GX UPR** and plays it onto the Bench. This turned out to be a nontrivial missed branch to investigate.

The [separate experimental registration](registrations/agent1-rank11-owner-quickball-radiant-20261101.json) was committed before the native branch comparison, on original physical source seed2387754768 K0 index299, both unchanged printed source 60s and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. It compares the default recipient Quick Ball search selection against a new opt-in **actual owner K1** alternative: after confirmed native Tool removal, inspect only that owner's **genuine pending own-deck ChooseCardsPrompt**, and select Radiant Eternatus CRZ only if the card physically exists there and `pending.validate` accepts it. Other recipient decisions still go to the baseline bot. The intervention preserves the source first-turn line, the real Quick Ball card, its actual discard cost, the physical 60, all Prize locations and the same seed.

## Physically present access and native outcomes

Before implementation, [a separate registered same-seed timing audit](agent1-rank11-fieldblower-timing-native-20261101.md) confirmed at rank1's first legitimate deck-search K1 that **one Radiant Eternatus CRZ** and **two Shadow Rider Calyrex VMAX CRE** remained in rank1's real owner deck. These identities were read only at the owner's legal native search prompt, with no opponent-private information entering any search decision.

The [two-arm native executable](../../simulation/evaluation/agent1-rank11-postblower-radiant-owner-k1-pair.cjs) compiled and passed all original K0 owner hand SHA/Bench checks and original first-turn source plan assertions in [manual CI 41348963916](https://github.com/FlareZ123/experiment-01/actions/runs/41348963916), **SUCCESS**. Full [JSON artifact 13100109257](https://github.com/FlareZ123/experiment-01/actions/runs/41348963916/artifacts/13100109257), ZIP digest `sha256:dfc648bdfe5137ce681cc419a575ddc2826ad793502d457d0900d15c92668fb2`. Both native original rank1 Quick Ball roots and search prompt responses were Store-accepted.

| Authenticated original-deal evidence | Generic recipient | Opt-in owner-K1 Radiant selection |
| --- | --- | --- |
| Real rank1 Field Blower and public Tool removal on global turn2 | Passed | Passed |
| Original rank1 Quick Ball `PlayCardAction` on turn2 | 1 | 1 |
| Chosen in real owner deck-search prompt (native max 1) | Dialga-GX UPR | **Radiant Eternatus CRZ** |
| Radiant Eternatus native hand-to-Bench `PlayCardAction` | 0 | **1** |
| Radiant Eternatus publicly on recipient's Bench at source turn3 first root | 0 | **1** |
| Accepted `UseAbilityAction` named Climactic Gate | 0 | 0 |
| Public Shadow Rider Calyrex VMAX on recipient's board at source turn3 first root | 0 | 0 |

Thus the purported Quick Ball-to-Radiant branch is **physically accessible and legal through the search and Bench-play steps** in this exact original game. The original generic bot selected another Basic. The alternative selected Radiant, and the generic bot **did play it onto the Bench**. The expected two VMAX placements did **not** happen before source's turn3 first root. Card data prints Radiant Eternatus's *Climactic Gate* as a conditional hand-to-Bench Ability that may put up to two Pokémon VMAX from the owner's deck directly onto Bench before ending turn if used. It is possible the bot declined its optional effect, the engine did not implement it, or the particular native prompt could not select the available VMAX; this study has not distinguished those explanations yet. A triggered-on-entry Ability does not necessarily appear as an explicit `UseAbilityAction`, so its **absence in that event type alone does not prove an engine bug**. The public VMAX board witness proves that the intended VMAX setup was not completed.

## Importance for deck optimization

This is a concrete high-leverage **Archetype-Line-Specific** test. In the brief unlocked window after Field Blower, a stronger opponent decision can steer real owner search to an Ability-bearing Basic. The existing generic policy chose a different physical Basic, and an owner-safe search choice alone still failed to materialize the consequential VMAX Board. A deck evaluator that counts only unlocked Ability availability, legal Quick Ball access, or Radiant Bench placement as a completed *Climactic Gate* line will overstate realized strength.

**Next discriminating experiment:** observe the real `rootActionLedger` prompts/actions just after Radiant's native Bench play and identify whether Twinleaf offered an optional trigger. If yes, test a native actor-owned decision to accept it and select actual owner VMAX from the legitimate search prompt. If the engine provides no such prompt, isolate and patch that missing behavior in a **research-owned Twinleaf hook**, without modifying the vendor submodule. Validate the printed rules and preserve separate evidence for search, trigger, selected VMAX, Bench occupancy and end-turn. Do not count a hypothetical VMAX setup as a win.

**Qualification:** One preselected original K0-positive physical seed; original opponent's remaining bot weak; no proof of competitive advantage, no complete match quality. The Aichi field still has 29/32 exact original 60s and zero competitively qualified games; the 99.5% target remains unproven.
