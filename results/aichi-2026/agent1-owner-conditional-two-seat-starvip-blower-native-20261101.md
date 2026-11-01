# Original rank11 autonomous source setup and original rank1 owner-held Tool counterplay coexist in one native game

**Agent 1 | 1 November 2026 | paired original-Store developmental evidence | no competitive-qualified games**

## Question and falsifiable comparison

Can two **different owner-information-constrained, conditional** native decision hooks coexist inside the same original-Store game? The source's first-turn `Oranguru V -> Back Order -> Forest Seal Stone -> Star Alchemy -> Battle VIP Pass -> Trubbish + Float Stone -> Boost Shake -> Garbodor BKP` plan must select all eleven real native actions and five owner search/target prompts rather than replaying a scripted source action list. The original rank1 recipient must independently respond with its own legitimately held `Field Blower GRI` where the opponent's public Float-Stone-equipped Garbotoxin board supplies a valid target.

This deliberately isolates two strategic decisions on the same six **retrospectively preselected** original rank11 starting deals. It is neither a random trial of general win rate nor a trained policy comparison.

## Fixed inputs and two arms

- Pinned Twinleaf submodule revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Original Aichi rank11 Wataru Yano Absol/Garbodor printed 60 in seat 0, original rank1 Yasunori Kato Shadow Rider printed 60 in seat 1, from existing `resolvedPrintedDecks()`; no deck changes.
- Exactly the six selected original physical seeds and original source owner K0 hand SHA-256/public Bench checks in [Agent32's frozen original registration](registrations/agent32-rank11-six-k0-star-vip-native-20261030.json): 1462371689, 2301458581, 2387754768, 2549346519, 1518908781 and 2375861161.
- Both arms use `withOwnerOranguruStarVipPlan` from [the general actor-visible source adapter](../../simulation/twinleaf/agent1-owner-oranguru-starvip-native.cjs). Its external experiment callback accepts the offered first-turn line; the adapter acts on its own hand, public board and **only** the genuine owner deck after a native search has legally exposed it.
- Control: unmodified original recipient bot after the source intervention. Treatment: original recipient bot with `withNewMoonBlowerAutonomy(1,...,{automaticFieldBlower:true,allowAnyActiveBlower:true})` wrapped around the *same* source policy. This second adapter checks its own held Blower, the public opposing Garbodor+Tool, real native Item legality and its own pending target prompt. Other opponent decisions remain delegated to the generic bot.
- Bounded 200-root native original Store; developmental only. No original source 60 or opponent 60 adjusted; no vendor changes or push-triggered CI.

## Genuine compiled run, before strict witness-name repair

[Manual CI 41344834363](https://github.com/FlareZ123/experiment-01/actions/runs/41344834363) **SUCCESS**, tested repository head `65712020d5441b179df9f495fc68b5983f27930a`. [Complete twelve-arm JSON artifact 13099011440](https://github.com/FlareZ123/experiment-01/actions/runs/41344834363/artifacts/13099011440), ZIP digest `sha256:a7ccc1dae49d898d914fc0499cc3a040cc516085c0be84ea7e14c52ed08b1c99`.

The [paired executable](../../simulation/evaluation/agent1-rank11-six-original-two-seat-blower-response.cjs) recorded:

| Frozen original K0 index | Source-owned plan: control / treatment | Source native accepted actions: control / treatment | Recipient native turn-2 Field Blower: control / treatment | Treatment public native Tool removal |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 1 / 1 | 11 / 11 | 0 / 0 | 0 |
| 232 | 1 / 1 | 11 / 11 | 0 / 0 | 0 |
| **299** | **1 / 1** | **11 / 11** | **0 / 1** | **1** |
| 376 | 1 / 1 | 11 / 11 | 0 / 0 | 0 |
| 440 | 1 / 1 | 11 / 11 | 0 / 0 | 0 |
| 458 | 1 / 1 | 11 / 11 | 0 / 0 | 0 |
| **Total** | **6 / 6** | **66 / 66** | **0 / 1** | **1** |

Thus **12/12** genuine original-source K0 replays passed; **12/12** first-turn owner-policy plans selected; **132/132** plan steps were Store accepted, including **60 owner-native resolved prompts** (five per arm); **one** subsequent opponent `Field Blower` was a genuine selected native `PlayCardAction`, and the opponent's own policy separately observed **one real public Garbotoxin Tool-removal effect**. This response occurred in original seed 2387754768, index 299, where earlier independent K0-owner work had shown exactly one physically held recipient Field Blower; all other five selected recipient states had no held copy at the observed first opponent root.

This is the strongest available *combined-owner* native observation for these two specific channels: a source that genuinely makes its own multi-step setup choices and an opponent that genuinely makes its own Tool-removal choice. It supersedes the earlier [scripted-source counterfactual](agent1-original-rank11-versus-rank1-fieldblower-native-counterplay-20261030.md) only on the question of **source decision autonomy** in this narrow selected sample. The old scripted-source experiment remains an independent native comparison.

### Important temporal measurement correction

The experimental source-policy adapter increments `completedEquippedGarbodor` on the **source's first-turn plan completion, before the opponent's reply**. The original trial JSON and first console summary unfortunately label that value `sourceCompletedEquippedAfterReply`. **That label is wrong**: its value 1/1 per pair must never be construed as lock survival after Field Blower. The opponent's distinct treatment `earlyBlowerToolRemoved=1` in index299 establishes actual Tool removal **later**, on the genuine recipient turn. The source policy recorded a successful setup before that reply.

The source runner and existing manually-dispatched workflow have now been updated to use `sourceCompletedEquippedAtSourcePlanEnd`, require exactly one completed plan, all 11 Store actions, five owner prompts and zero aborts in **each** paired arm, and release-gate the single native Tool removal. This audit repair does not change the source or opponent policies, decks, seeds or native actions. Treat strict post-repair CI verification as an additional event rather than silently attributing its code to the first run.

## Interpretation and transfer

The result falsifies reliance on generic-bot 6/6 first-turn Tool-lock survival as competitive evidence. A stronger opponent's held, native-playable Tool answer really triggers within the same game in which the source independently selected its own setup. The outcome is already a *policy interaction*, although neither component is a globally optimal chooser.

**Open gates:** These six source openings were selected retrospectively for first-turn availability and do not estimate natural opportunity frequency; the source experimental `chooseOffer` always approves its eligible route without comparing against competing Supporter, Energy, attack or hold actions; recipient hook covers just the one Tool-answer family; the rest of both bots are unqualified. The old original-Store mechanics and many paper prompt contracts remain unverified, there is no clock-equivalent tournament match, and ranks 23/25/28 lack authenticated exact opposing 60s. No completed match in this study supports a competitive 99.5% claim. The benchmark remains **zero competitively qualified games**.

**Next use:** Integrate these two **independent native owner-choice opportunities**, with their source K0 prompt receipts and opponent after-effect witness, as a narrow two-seat regression within the central [canonical bilateral developmental policy](../../simulation/evaluation/agent41-bilateral-common-policy.cjs). For a true policy release, require nonselected natural source starts, refusal controls, genuine competing actions, paper-prompt contract coverage and complete both-player replies. Do not convert the six chosen opportunities into a field-wide win rate.
