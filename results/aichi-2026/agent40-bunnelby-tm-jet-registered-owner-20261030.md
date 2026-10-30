# Original rank2/15 Bunnelby + TM Evolution + Jet: registered-owner ALS

**30 October 2026 | Agent 40 | Paper Expanded Aichi 2026 Top32 | Development only**

## The genuine missing decision geometry

The authenticated original final-rank 60s in `full-decklists.json` show:

| Source rank | Player | Bunnelby PRC 121 | TM: Evolution PAR 178 | Jet Energy PAL 190 | Guzma & Hala | Tag Call | Evolvable opening Basics |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| **2** | Takahiro Ando | 2 | 2 | 2 | 4 | 4 | Oddish 2, Pidgey 2, Lillipup 2 |
| **15** | Ryotaro Nozawa | 2 | 2 | 2 | 3 | 4 | Oddish 2, Pidgey 2, Buneary 2 |

Bunnelby's Omega Barrage permits two attacks. The actual printed `Technical Machine: Evolution` attack costs one Colorless, has **no attack damage**, and evolves up to two Benched Pokémon per attack by searching the owner's deck. Bench attaching `Jet Energy` supplies that Colorless and switches its new Benched recipient into Active. This allows a first-going-second **Tool equip → Jet promotion → Evolution → Omega Barrage Evolution** lock-building line when setup cards, valid targets, turn and prompts permit. The preceding Agent40 Jet rescue scorer only selected positive printed-damage attacks, so it systematically missed this discrete zero-damage TM line. The native Tool attack is separate from Bunnelby's printed Burrow and Rototiller attacks.

## Executable policy proposal

- [`agent40-owner-bunnelby-tm-jet-line.cjs`](../../simulation/twinleaf/agent40-owner-bunnelby-tm-jet-line.cjs) supplies a three-phase owner-visible proposal. An acting player must supply **their own known registered 60 printings**, not the opposing player's private deck. The module detects a publicly existing Bench evolutionary target with a Stage1 printing still *possible* from the source list minus publicly visible copies, and proposes an existing Item Tool attach to Bunnelby, an actual held Jet to active or Bench Bunnelby, and a Tool-granted `Evolution` attack when payable.
- [`agent34-actor-only-root-policy.cjs`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) offers the feature **default OFF** under `bunnelbyTmJetRoot:true` / `AGENT40_BUNNELBY_TM_JET_DEV=true` and actor-separated `ownRegisteredSixtiesBySeat` dependencies. It creates standard Store `PlayCardAction` and `AttackAction`; the source prints are never read from an unseen native deck or face-down Prizes.
- Public restrictions are screened: earlier payable Active attacks, Active-only passive lock geometry, Temple of Sinnoh, tool and Energy quota, same-recipient Tool attachment, current Action restrictions, one-turn first-player attack. Stage1 status remains **K0-possible**, not assured: Prize placement can prevent a wanted Stage from being found.
- [Pure root tests](../../tests/agent40-owner-bunnelby-tm-jet-line.test.cjs) check typed Tool equip, Bench/Active Jet, Tool attack, stage depletion, lock/Temple/quotas, owner-registered source requirement, hidden-deck/Prize invariance, and the shared actual actor's default-OFF vs opt-in progression. **All 11 passed** in [green manual CI 41137215607](https://github.com/FlareZ123/experiment-01/actions/runs/41137215607).
- Existing [native public-dispatch witness](../../simulation/twinleaf/agent5-owner-root-slice.cjs) was corrected to recognize that a Jet Bench attachment moves the recipient into **Active** and the prior Active into the Bench slot; comparing Energy at the unchanged Bench index would falsely report a legal Jet swap as unconfirmed. It also adds the missing exact Tool recipient witness. [Three pure witness tests](../../tests/agent40-jet-tm-physical-witness.test.cjs) passed in [green manual CI 41137395025](https://github.com/FlareZ123/experiment-01/actions/runs/41137395025).

## Exact *direct opening component conjunction*, not an ALS win-rate

The independent [source-derived BigInt enumerator](../../simulation/evaluation/agent40-bunnelby-direct-opening-count.cjs) examines an **unordered eight-card subset**: seven opening cards plus one natural turn draw, with the required combination **at least one Bunnelby, at least one of the six listed evolvable Basics, and either Guzma & Hala/Tag Call or both held TM and Jet**. The 60 physical cards are partitioned into disjoint categories; overlap between the Supporter path and held TM+Jet is counted only once. All **2,558,620,845** eight-card combinations enter the denominator. The opponent's mulligans/bonus draws are excluded.

| Original rank | Exact favorable subsets | Unconditional fraction | Conditional on seven-card Basic-valid opening |
| --- | ---: | ---: | ---: |
| **2** | 228,532,145 | **8.93185%** | **10.36888%** |
| **15** | 210,475,593 | **8.22613%** | **9.54962%** |

The conditional column divides by the exact **86.14093%** chance of at least one Basic in opening seven, since the conjunction necessarily already contains two Basics within the eight cards and therefore a valid seven-card opener. **These fractions are neither full ALS probabilities nor bounds on them.** Other paths can find Bunnelby/targets through Artazon, search Items and other card actions without this conjunction. Even hands with this conjunction may fail due to two-card discard constraints, singleton protection, Prize configuration, lack of Pokémon Bench placement, or actual game response. The calculation is a reproducible measurement of one narrow direct-card-access channel; it does not replace native matchup trials.

## Native qualification and unresolved work

[Native two-seat Bunnelby end-to-end fixture](../../tests/agent40-native-bunnelby-tm-jet-chain.test.cjs) starts from a **conditioned source rank2 board**, held TM + Jet, Bunnelby Bench, and a source-ranked opponent board. It produces the typed equip, mandatory Jet switch, then actual TM Evolution attack and resolves prompted choices through the pinned native bot's existing Bunnelby line helpers. This is staged, with exact source printer names and only a small owner deck fixture, and is **not** a naturally shuffled original-60 game.

- [First compiled CI 41137208221](https://github.com/FlareZ123/experiment-01/actions/runs/41137208221) **failed** both physical seats at an unacknowledged `WaitPrompt`, after obtaining the intended typed Tool/Jet/attack actions. The native bot did not supply this nonstrategic animation acknowledgement.
- [Second compiled CI 41137500366](https://github.com/FlareZ123/experiment-01/actions/runs/41137500366), after explicit native `WaitPrompt(null)` acknowledgement, still **failed** both physical seats: the expected `ChooseAttackPrompt` reporting the second `Evolution` attack was absent. The first native TM attack was proposed and dispatched; the exact native board and prompt chain require further diagnosis. A separate diagnostic trace is now registered for rerun. **No successful two-attack native fixture has been demonstrated as of this report.**
- The simple positive-damage Jet/Doduo native mechanical fixture remains separately **2/2 passed**. It cannot stand in for the zero-damage TM+Barrage interaction.

Next: identify whether the missing second attack is caused by special trait state, premature end-turn, a Bot prompt policy, a pinned Twinleaf missing Tool attack interaction, or the fixture's constructed turns. Preserve a negative result if the engine cannot model Omega Barrage correctly. Only a settled two-attack native trace, real original-source owner decisions, and strategically meaningful opponent responses can support competitive conclusions.

**Competitive games qualified: 0; 99.5% target demonstrated: no.**
