# Agent 3 fixed-checkout contrast: one source Special Energy option changes rank6 game endpoints

**21 October 2026, preregistered [before both dispatches](agent3-rank6-special-energy-sole-toggle-registration-20261021.md).** Development-only, historical four-arm fixture, zero competitive qualification.

## Same immutable checkout, only one input flag

Frozen branch `agent3-rank6-pale-moon-paired-20261021` exactly at `d57a08022a639d34cc87e316b33346de6909c08e`; pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Same existing manual `agent7-canonical-actor-bilateral.yml`, both canonical actor setups, paper Supporter and mandatory prompt guard. Four **original** trials per arm; all optional inputs default except `special_energy_root` OFF versus ON.

| Arm | Actual run | Artifact ID | ZIP SHA256 | Original audit cells |
| --- | --- | --- | --- | ---: |
| OFF | [39557095204](https://github.com/FlareZ123/experiment-01/actions/runs/39557095204) successful | [12325309172](https://github.com/FlareZ123/experiment-01/actions/runs/39557095204/artifacts/12325309172) | `bcdebf2c484d34ab8fe913685712f17f21ee4e9acbd71368ebd3403eb3399bb7` | 4/4 |
| ON | [39557100663](https://github.com/FlareZ123/experiment-01/actions/runs/39557100663) expected strict abort after replay | [12326455267](https://github.com/FlareZ123/experiment-01/actions/runs/39557100663/artifacts/12326455267) | `252f4f9dc2356d3adf62151365cd9c9f787b51a39e9b55550824c297794268cb` | 3/4 |

Both raw JSON artifacts are preserved and include complete source registrations and public Store root ledgers. Inner JSON SHA256 OFF `98f21ed86b8320e07655fc45e7a4f767c840a915c644a641983437e97d27511e`, ON `0a554bc29c5ad887dc019025ba238d3bc783bd49a663964548d5f9073bf539a0`.

## Observed matched original trials

| Original fixture | OFF: Store result | ON: Store result | Strongest specific divergence |
| --- | --- | --- | --- |
| Rank6 Iron Thorns vs Champion Shadow Rider, seed `407516727`, candidate seat A | Terminal after 35 Store actions, reported winner physical seat 0 (candidate), remaining Prizes `[4,6]`; no replay | 121 root actions including **one** t4→0 native fresh-deal reset at ordinal38; strict parser rejects mixed episodes; no original-match winner | Both arms identical initial physical source-deal SHA `2ce05954...`; shared source `Volt Cyclone` root24 t2, candidate `Pale Moon-GX` root29 t3. Only ON obtains source **second Volt Cyclone root33 t4**; both original boards empty by root35 with original Prizes still `[6,6]` |
| Rank6 Iron Thorns vs New Moon v1, same source fixture/seed | Action cap 200, engine terminal winner physical seat 0, Prizes `[2,6]`, no replay | Engine terminal after 75 root actions, winner physical seat 1 (source), Prizes `[6,0]`, no replay | ON source executes repeated `Volt Cyclone` roots30,37,46,56,65,73 (global t2,4,6,8,10,12); OFF records only first source attack root30 t2 |
| Rank11 Mega Absol vs Champion Shadow Rider, seed `623585882`, candidate seat B | 260-root cap, `[6,6]` | Same 260-root cap `[6,6]` | Repeated ineffective `Get Lost` / `Terminal Period`; no candidate Prize progress |
| Rank11 Mega Absol vs New Moon v1, same source fixture/seed | 260-root cap, `[6,6]` | Same 260-root cap `[6,6]` | Repeated ineffective `Future Sight` / `Terminal Period`; no candidate Prize progress |

OFF and ON preserve the **same source first physical-deal fingerprints** for the respective matched source fixtures. Because only the sole Special Energy policy input changes on a frozen checkout, the availability/execution of the second t4 source attack and the ensuing reset are strongly attributable to that option for **this seed and policy**. Downstream game paths, especially native sampling and Prize outcomes, depend on the changed actions; the pair does not prove a general win-rate effect. One original rank6 case in ON is censored/engine-epoch-split, not a draw/win datapoint that can be naively compared with OFF's terminal.

## Crucial paper-rule limitation

The ON rank6 champion native tiebreak is **potentially paper-invalid**, even though the native engine faithfully produced a simultaneous no-Pokémon state. Pinned `game-effect.ts` runs `EndTurnEffect` after non-Barrage attack damage before calling `checkState`, and `game-phase-effect.ts` resolves queued `Pale Moon-GX` end-of-turn KO before its eventual `checkState`. Paper rules §I.A-01 / §I.E check attack Knock Outs and start game resolution when a player has no Pokémon. If the second 140-damage Volt Cyclone knocks out the opponent's **only** 270-HP TAG TEAM immediately, the source should win at attack completion before Pale Moon's scheduled end-of-turn KO can occur. A separate public HP/damage preattack witness is pending. See [forensic report and critical caveat](../twinleaf/agent3-pale-moon-volt-cyclone-native-tie-20261021.md).

## Implication for the single deck

Any candidate deck's alleged game win rate can change drastically under one unresolved **opposing policy** choice in the exact same source deal. Source default simple bot and experimental opt-ins are not yet robust opponents. This is evidence of high policy sensitivity and an engine-fidelity validation need, **not** candidate competitive win evidence, nor progress to the full 32-list 99.5% target. Preserve the pair and refrain from combining its ON and OFF game endpoints as calibrated matchup estimates.
