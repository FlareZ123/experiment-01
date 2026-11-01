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

## New outcome: the missing native Climactic Gate confirmation and two-VMAX placement are now solved

The further [preregistered actual-owner ConfirmPrompt intervention](registrations/agent1-rank11-radiant-confirm-climactic-20261101.json) was tested by the *existing* manual workflow [CI 41349684416](https://github.com/FlareZ123/experiment-01/actions/runs/41349684416), **SUCCESS**, using original unchanged source and recipient 60s, the exact same physical seed and the same pinned Twinleaf as the two controls. [All-three-arm native archive 13099814871](https://github.com/FlareZ123/experiment-01/actions/runs/41349684416/artifacts/13099814871), ZIP digest `sha256:fbde251c9d019a97a4326e924a9ed71a0bfbdd94cf04062238685cad22bc7bb4`.

The original two arms reproduce their prior card choices and real public boards. The third arm changes **only the recipient's real owner-authenticated optional ability confirmation and legitimate subsequent own-deck VMAX search** after receiving Radiant from native Quick Ball and actually playing it onto the Bench. The owner’s native search returned:

`CHOOSE_CARD_TO_PUT_ONTO_BENCH` (native maximum 2) → **[Shadow Rider Calyrex VMAX CRE, Shadow Rider Calyrex VMAX CRE]**.

| Real original Store outcome, source first turn-3 public board | Generic Quick Ball | Radiant + generic Confirm | Radiant + owner Confirm + actual VMAX search |
| --- | ---: | ---: | ---: |
| Recipient chose Radiant via native owner Quick Ball search | 0 | 1 | 1 |
| Recipient Radiant actually on Bench | 0 | 1 | 1 |
| Real owner pending VMAX-to-Bench search selected both physical copies | 0 | 0 | **2** |
| Recipient Shadow Rider Calyrex VMAX publicly in play at source next turn | 0 | 0 | **2** |

The supplied full card-list database, card `swsh12pt5-105` (Radiant Eternatus, Crown Zenith), explicitly identifies Climactic Gate as a when-played-from-hand-to-Bench Ability. Its text permits searching for up to two Pokémon VMAX, placing them onto the Bench and ending the user's turn if the Ability is used. The native turn trace after Radiant showed a **real ConfirmPrompt**; the generic policy completed that prompt and passed without placing VMAX. The new actor-owned continuation accepted the confirmation, selected both actual owner-deck VMAX using the native validator, and the *public source first-return observer* saw **two Shadow Rider Calyrex VMAX in play**. This is direct evidence of an **unexercised legal, consequential optional-Ability branch in the opponent policy**, not evidence of a missing Twinleaf card implementation. The Ability activation is resolved through prompt actions; zero explicit `UseAbilityAction` roots remains consistent with this triggered ability.

The gain is a concrete board-setup capability in one positive original deal. The sample was selected retrospectively for the rank11 first-turn setup and recipient-held Field Blower, the source setup is conditionally approved, and the rest of the recipient bot is still weak. These are developmental root/board witnesses; **zero competitive-qualified games** and no evidence of a 99.5% fixed deck.

## Importance for deck optimization

This is a concrete high-leverage **Archetype-Line-Specific** test. In the brief unlocked window after Field Blower, a stronger opponent decision can steer real owner search to an Ability-bearing Basic. The existing generic policy chose a different physical Basic, and an owner-safe search choice alone still failed to materialize the consequential VMAX Board. A deck evaluator that counts only unlocked Ability availability, legal Quick Ball access, or Radiant Bench placement as a completed *Climactic Gate* line will overstate realized strength.

**Next discriminating experiment:** validate the new third-arm optional ConfirmPrompt and two native owner VMAX selections against printed paper wording, physical zone conservation, exact timing, and the source's later responding turn. Test refusal controls and whether a rival recipient can turn the resulting VMAX board into attacks or credible wins against a responsive original rank11 source. Port the demonstrated owner-search/Confirm chain into the canonical bilateral chooser only alongside opportunity-denominator and genuine other-action comparison. Do not classify a setup witness as a complete matchup win.

**Qualification:** One preselected original K0-positive physical seed; original opponent's remaining bot weak; no proof of competitive advantage, no complete match quality. The Aichi field still has 29/32 exact original 60s and zero competitively qualified games; the 99.5% target remains unproven.
