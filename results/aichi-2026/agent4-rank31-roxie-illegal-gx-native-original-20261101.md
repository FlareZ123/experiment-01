# Native rank-31 Roxie CEC forbidden GX payment: original Store ignores strict blocked prompt

**Agent 4, 1 November 2026.** Reproducible, *prepared physical native Store* result. No random original Aichi deal, whole-game winner, or tournament-level result is claimed.

## Registered original-source hypothesis

Authenticated final **rank 31 Yuhi Yokoyama Dusknoir/Chimecho** contains **4 Roxie CEC205**, **1 Tapu Lele-GX GRI60** and **1 Gengar & Mimikyu-GX TEU53**, together with **3 Koffing CEC76**. See [the exact printed-source list](full-decklists.json). Printed Roxie discards up to two Pokémon that are neither **Pokémon-GX** nor **Pokémon-EX**; for each paid Pokémon card it draws three cards. Therefore Tapu Lele-GX cannot legally be paid to Roxie, even though it is a physically present Pokémon.

[Preregistration](registrations/agent4-rank31-roxie-forbidden-gx-payment-20261101.json) froze the native question before the test implementation: does the original Store *enforce* the printed GX exclusion, or does the prompt merely *display* an invalid response through `ChooseCardsPrompt.validate`? Both owner seats had to be attempted and all failures preserved.

## Actual pinned native Store result

The same true printed Roxie CEC and Tapu Lele-GX GRI were physically placed in owner hand. Each prepared Store had seven real Basic Psychic Energy cards in the owner deck and six Prize cards. `PlayCardAction` physically played Roxie, producing the actual `ChooseCardsPrompt`, and the owner submitted the actual Tapu Lele-GX card reference through `ResolvePromptAction`, wrapped only in the pre-existing reversible `DiscardCardsEffect.type` compatibility fix.

**Compiled [manual CI 41353395812](https://github.com/FlareZ123/experiment-01/actions/runs/41353395812): SUCCESS**, 5/5 expanded rank-31 tests, including all tested both-seat owner variants. The test logged each physical action in native job stdout. Results for both seats **0 and 1** were identical:

| Measured native event | Seat 0 | Seat 1 |
|---|---:|---:|
| Actual original Roxie prompt `validate([Tapu Lele-GX])` | false | false |
| Exact blocked positions immediately after playing Roxie | [0,1] | [0,1] |
| Original Store dispatch error | none | none |
| Prompt marked settled | yes | yes |
| Actual GX moved into owner discard | yes | yes |
| Actual Roxie moved into owner discard | yes | yes |
| Real owner-deck cards drawn | 3 | 3 |
| Physical owner hand after effect | 3 Psychic Energy | 3 Psychic Energy |

This is a **paper-illegal Trainer payment accepted and actually settled in both seats**, despite the native prompt correctly identifying the GX as ineligible. It establishes a general engine contract weakness: `Store.reducePrompt` does not call `prompt.validate` before applying prompt results. The missing `DiscardCardsEffect.type` issue required the *existing* reversible research-owned Roxie compatibility hook, applied identically to both seats; the forbidden GX acceptance and actual three-card draw are therefore observed **under that narrow compatibility correction**, not an unmodified vendor Store that would crash before finishing the Roxie effect.

The [rank31 Koffing/Roxie/Alakazam triad](agent4-original-rank31-roxie-koffing-alakazam-triad-native-20261101.md) separately shows a **paper-valid Koffing** payment and subsequent paper-invalid two-source Alakazam 2-Prize transfer. Combined, these results show that actual original printing families in one authenticated source 60 can be affected by **different** prompt safety failures.

## Reproduction and qualification

- Pinned Twinleaf submodule `vendor/twinleaf`: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Prepared physical-store probe](../../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs): `probeRoxieForbiddenGXPayment(seat)`.
- [Actual native CI regression](../../tests/agent4-rank31-roxie-koffing-spoons-native.test.cjs): `AGENT4_ROXIE_GX_NATIVE` outputs preserve individual outcomes for seat 0 and 1.
- Existing scoped Roxie compatibility: [research-owned hook](../../simulation/twinleaf/agent4-roxie-original-effect-type-hook.cjs).
- The follow-up reversible [Roxie physical payment gate](../../simulation/twinleaf/agent4-roxie-paper-payment-hook.cjs) was independently preregistered in [payment-guard registration](registrations/agent4-roxie-native-paper-payment-guard-20261101.json). **Compiled [CI 41354079057](https://github.com/FlareZ123/experiment-01/actions/runs/41354079057) SUCCESS, 8/8 expanded rank31 native tests** proved the guard rejects the original GX reply **before Store mutation** in both physical seats: no GX physical discard, no drawn cards and the original Roxie ChooseCards prompt remains pending. Critically, Roxie itself is not yet in its final discard zone until the outstanding prompt resolves, so the guard's pending state is not a finished playable paper turn. A separate both-seat positive control retained the **legal Koffing payment, three real draws, Blow-Away Bomb and independently guarded Painful Spoons**. The prior Store prototype was restored on synchronous failure.
- **Independent D-05 rulebook correction, compiled:** The supplied advanced player's rulebook, section D-05, specifies a Trainer's "up to N" selection is **1 through N**; the zero-choice exception is for Pokémon attacks. This contradicts the earlier provisional registration's "legal zero-selection" hypothesis, which has therefore been rejected by primary rulebook evidence. The separately [preregistered root/zero-contract study](registrations/agent4-roxie-zero-payment-paper-contract-20261101.json) passed in **[manual compiled CI 41354344097](https://github.com/FlareZ123/experiment-01/actions/runs/41354344097), all 10/10 rank-31 tests green**. For each original native owner seat, an owner hand consisting of Tapu Lele-GX and Roxie (no eligible Pokémon payment) allowed original native `PlayCardAction`, consumed the Supporter opportunity (supporterTurn 0→1) and opened a prompt. Paper root preflight rejected that attempted PlayCardAction **before any owner-card or turn mutation**. In the separately staged original Roxie prompt, native `ChooseCardsPrompt.validate([])` returned **true** and Store completed a **zero-payment** Supporter, putting Roxie into discard without drawing any cards. The paper prompt preflight rejected the same empty reply and preserved the pending prompt. Both physical seats were reproduced, with code [in the research-owned native probe](../../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs) and reversible [guard](../../simulation/twinleaf/agent4-roxie-paper-payment-hook.cjs). No vendor source was edited. Root preflight alone does not retroactively undo an already accepted native Roxie root; the prompt-level gate is a complementary failure-stop in that prepared state.

**Paper release implication:** Competitively qualifying a field comparison that includes rank31 must require paper-valid prompt selection, accepted native actions, and real following consequences. A validator returning false is not sufficient if the actual Store still resolves the invalid action. The upstream/vendor pin was not edited, and this result does not imply natural exposure frequency or real tournament wins.

**Population status unchanged:** 29/32 authenticated original field lists, 0 competitively qualified games, no demonstrated 99.5% fixed 60.
