# Agent 5: FLF #108 gold M Charizard-EX native own-deck custody and runtime prototype repair (3 November 2026)

## Scope and print verification

The attached complete English print database `resources/cards/en/xy2.json` identifies two legal paper Expanded Flashfire printings of the same Dragon-type **M Charizard-EX Wild Blaze** attack: `xy2-69` (regular) and `xy2-108` (Rare Secret). Both have 230 HP; printed 300-damage Wild Blaze for Fire/Fire/Darkness/Colorless/Colorless and the text **“Discard the top 5 cards of your deck.”** Both also have the Mega Evolution turn-ending rule. This is a **card-effect fidelity** study on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, not a competitive match.

An earlier [exact FLF #69 report](../aichi-2026/agent5-flf69-wild-blaze-native-paper-custody-20261103.md) demonstrated that the original native `M Charizard EX FLF` class mills five **opponent** cards and that the generated duplicate `M Charizard-EX FLF 69` instead omits the ordinary Mega Evolution turn end. It supplied a reversible, opt-in own-deck patch for the first class.

## New inherited gold-secret defect

At the same upstream pin, `ptcg-server/src/sets/07-x-and-y/set-flashfire/other-prints.ts` defines `MCharizardEX4FLF extends MCharizardEXFLF69`, with `setNumber = '108'` and `fullName = 'M Charizard EX4 FLF'`. The upstream base `m-charizard-ex.ts` uses `MOVE_CARDS(... opponent.deck, opponent.discard, {count:5})`. The paper text instead requires the **owner** to discard.

The [native static screen](../../simulation/evaluation/agent5-native-top-deck-owner-screen.cjs), archived at [manual CI 41576602129](https://github.com/FlareZ123/experiment-01/actions/runs/41576602129), reviewed **14,101 native instances** and identified `M Charizard EX4 FLF` among six owner-text/opponent-movement flags. The other flagged Tyranitar V BST 97/154/155 and Gyarados PGO 22 are **card-wide false positives**: the same cards have separate owner-mill and opponent-mill attacks. Avalugg STS 37's same-attack own/opponent effects likewise explain its opposite-direction flag. This scanner is a *risk screen*, not independent behavioral proof.

We extended [the native FLF fidelity suite](../../tests/agent5-flf69-wild-blaze-native.test.cjs) by **12 gold-secret tests** (both physical seats; direct Wild Blaze; actual Regidrago VSTAR Apex Dragon copied donor; native Mega Evolution; native Charizard Spirit Link). First extended compiled [CI 41615915875](https://github.com/FlareZ123/experiment-01/actions/runs/41615915875) had **28 pass, four fail**: both seats failed precisely the old hook's promised direct and copy corrections for `#108`. All earlier `#69` cases and gold's unpatched baseline and Mega/Tool cases passed.

A second [native diagnostic CI 41616381975](https://github.com/FlareZ123/experiment-01/actions/runs/41616381975) recorded the cause. Although gold's *source code* extends the FLF69 base, the actual runtime `Object.getPrototypeOf(gold)` leads to a **distinct** `MCharizardEX` function/reducer prototype object from `Object.getPrototypeOf(getCardByName('M Charizard EX FLF'))`. The original hook patched only the first exact native object's prototype. The gold donor's patch-hit count remained zero on direct and copied attacks. This is a test-backed instance of source-level inheritance failing to imply shared mutable runtime prototype identity in the card registry.

## Correction and successful native control

[Research-owned hook](../../simulation/twinleaf/flf69-wild-blaze-paper-hook.cjs), changed at repository commit `67e1764c2eb6b192b2f51f6e9060bb2b54ed3e72`, now identifies **both exact printings**, asserts their print metadata, patches each **actual runtime reducer prototype independently** and changes only the `WAS_ATTACK_USED(effect,0,this)` destination to `effect.player.deck`. Nonattack effects delegate to the original reducer, retaining Mega Evolution turn end and Spirit Link protection. Each patch saves the original own-property descriptor or inherited status and restores the exact prototype relationship after the synchronous test. The hook remains default-off and does not touch the pinned submodule.

[Compiled manual CI 41616895924](https://github.com/FlareZ123/experiment-01/actions/runs/41616895924), exact research head `67e1764c2eb6b192b2f51f6e9060bb2b54ed3e72`: **32/32 tests passed, zero failed**, including all 12 new FLF108 cases. These are actual native Store actions and prompt resolutions, not mocked attacks.

| FLF #108 actual Store condition | Owner deck | Opponent deck | Owner discard | Opponent discard | Attack damage |
| --- | ---: | ---: | ---: | ---: | ---: |
| Unpatched direct Wild Blaze, either seat | 10 | 4 | 0 | 5 | 300 |
| Patched direct Wild Blaze, either seat | **5** | **9** | **5** | **0** | 300 |
| Unpatched Regidrago copied Wild Blaze, either seat | 10 | 4 | 1 donor | 5 | 300 |
| Patched Regidrago copied Wild Blaze, either seat | **5** | **9** | **6** including donor | **0** | 300 |

The opponent deck loses its normal one-card start-of-next-turn draw in these numbers (initially 10, then 9 without the wrong-side five-card mill). All native copied-donor cases resolved the actual `AttackAction('Apex Dragon')`, `ChooseAttackPrompt`, `ResolvePromptAction`, damage and game advancement. The patched hook reports `correctedByPrinting:{'69':0,'108':1}` for #108 alone, as verified in both seats.

Gold #108 inherits the original ordinary Mega Evolution turn-ending behavior: direct native `PlayCardAction` causes global turn **4 → 5** without Spirit Link, and stays on turn **4** with a genuine attached `Charizard Spirit Link EVO`. Both patched gold tests passed on both physical seats; the original #69 analogues remain passing. The suite restored each temporary prototype patch in `finally`.

## Limits and implications

The results demonstrate a second affected **printing**, independently from FLF69, and a subtle fix-coverage hazard for actual runtime card instances. The fixed gold copy is *not* an additional contender in the current immutable original field: the existing fifth structural candidate explicitly contains `xy2-69`; the authenticated 29 original 60s did not expose a Charizard printing in Agent5's prior census. Do not alter those exact 60s based on this isolated mechanics finding. The enlarged hook must be expressly selected and tested in any future full-game policy that uses these printings.

This experiment stages attacker, Energy, discard donor, target, deck and Prize zones; it does not demonstrate natural draw/setup access, paper-valid multi-card payment chains beyond the staged costs, competent two-sided opponent decisions, timed-paper outcomes, or a deck ranking. **Zero competitively qualified games and no demonstrated 99.5% field win rate.**

Reproduction: pinned Twinleaf revision above, `tests/agent5-flf69-wild-blaze-native.test.cjs` and `simulation/twinleaf/flf69-wild-blaze-paper-hook.cjs`, manually dispatched existing `.github/workflows/agent50-rank26-unlocked-fifth-candidate.yml` with `flf69_native_only:true`. Preserve the two failed runs and successful run, including their exact repository heads; do not retrospectively reclassify failures.
