# Agent 26: frozen rank6 source-deal divergence reproduced through unequal candidate mulligans

**30 October 2026 | Original pinned Store, immutable paired source seed; read-only two-arm setup-only replay.** This is a **positive causal setup-mechanism witness** for the previously unexplained source-deal difference. There are no new played games or competitive-win observations.

## Question

The original prospective 32-arm Agent41 native scout contained a single mismatched paired source physical-deal fingerprint at \`6:3:B\`. I earlier verified that the **actual original turn-0 source starting Pokémon choice** was one Iron Thorns ex in champion versus two in New Moon, with the first selected card going Active and the remaining card going onto the Bench. Which native mulligan and first-turn setup path produces these two original source states, given the same fixed Iron Thorns 60, same source seat 0, and same seed **861838028**?

## Exact frozen provenance and zero-game replay

I reused the immutable [Agent41 registration](registrations/agent41-prospective-canonical-32-20261029.json), Git blob SHA-1 \`8c54d8497f9927b04d501237462f64a42173d33d\`, and required the two exact registered candidate identities \`6:3:B:champion-reference\` and \`6:3:B:new-moon-lockbreaker-v1\`. Both original 60s and the rank6 source 60 were resolved with the already-used \`planAichi\` printing rules and retained unchanged. Pinned Twinleaf revision: **\`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`**.

The [bounded setup-only runner](../../simulation/evaluation/agent26-frozen-mismatch-setup-replay.cjs) invoked the original Store twice for the fixed seed/physical positions and **stopped at its first settled ordinary-turn root**, before a single player-turn decision. It independently ran the existing [native setup/mulligan observer](../../simulation/twinleaf/setup-audit.cjs)'s \`oneSetup\` with the same decks and seed. The native reproductions used the base headless setup policy, while the 32-arm original had its full actor composition; the two setup-only runs never attempt to certify full canonical policy or match outcomes.

[Manually dispatched existing first-source-deal workflow, **run 40994781295**](https://github.com/FlareZ123/experiment-01/actions/runs/40994781295) **SUCCESS** at research head \`f162668cd0dae29e678f96c1219464a1b52f8126\`. It checked out/compiled the pinned server and archived both source setup receipts in [GitHub Actions artifact 12951225413](https://github.com/FlareZ123/experiment-01/actions/runs/40994781295/artifacts/12951225413). Independently downloaded ZIP size **1,218 bytes**, SHA-256 \`ab44c80bc30646a2d34a7a891a661ccb49b0c2829002fe1aac7b6c240a78bfab\`; raw \`agent26-frozen-rank6-setup-followup.json\` SHA-256 \`a74042815874451348450a1b44b4dd25ab0465f0485f5f91bc2a791d6a9b62a3\`.

## Actual native observations

| Frozen source trial | Champion reference | New Moon |
| --- | --- | --- |
| Source physical seat / actual first turn | 0 / source first | 0 / source first |
| Source Iron Thorns mulligan count | **2** | **2** |
| Candidate mulligan count | **1** | **0** |
| Source bonus-card offers, selections, and draws | **0 / 0 / 0** | **0 / 0 / 0** |
| Candidate bonus-card offers / selected / drawn | **1 / 1 / 1** | **2 / 2 / 2** |
| Source Active at first settled turn | Iron Thorns ex TWM | Iron Thorns ex TWM |
| Source Bench at first settled turn | **Empty** | **One Iron Thorns ex TWM** |
| Reproduction's source full physical-deal SHA256 equals original archived source digest | **Yes** | **Yes** |

The two source hashes match the untouched original full-game scout archive **byte-for-byte**:

- Champion source: \`e57fb601c6a81c7db88b4b469fc8b3246a04e43e2e942141ada30b7a6f8806ce\`.
- New Moon source: \`a811d26b25cc712f765f891ec60c0a16dda7a8f438f3ba794cc461c5fe348da3\`.

Both Store setups passed the exact 60-copy inventory conservation, source-seat, real first-turn draw-log, and first-settled-PLAYER_TURN capture checks. The separate native setup observer verified that the source's **own two mulligans are unchanged**, while the opponent candidate's redraw count differs. Because the source took **zero extra bonus cards in both**, the originally documented source physical mismatch is **not attributable to extra cards drawn by the source** in this exact replay.

## Mechanism and experimental implications

The pinned [setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) resolves initial deck shuffles and mulligan redraws as successive \`ShuffleDeckPrompt\` actions; the original [headless seed adapter](../../simulation/twinleaf/headless.cjs) uses a **shared seeded xorshift32 game-random stream**, and its Fisher-Yates deck shuffle consumes samples from that stream. The candidate's **one-versus-zero mulligan** changes the number/order of setup shuffle events under the same integer seed. The subsequent source shuffle can therefore receive a different segment of the shared PRNG sequence, changing the source's drawn cards and legal starting Pokémon choices despite identical opponent deck contents.

This is an **implementation-level candidate-dependent RNG-coupling pathway**, corroborated by both reproduced original source digests, the source's one-versus-two starting Pokémon, and exact native mulligan/bonus counts. The already-reproduced original source choices occur during setup, before any normal-turn attack or opponent-response policy. We have **not** instrumented every individual shuffle's random-word offset in the original full-game run, so the precise stream index responsible for each altered source card remains an unobserved internal intermediate.

Agent39's earlier [mulligan posttreatment analysis](../statistics/agent39-mulligan-posttreatment-source-alignment.md) identified source **bonus-card draw** as a legitimate pathway to source-deal inequality. This exact frozen pair displays a complementary pathway: **candidate redraw changes the shared game-random sequence even when the source itself takes no bonus cards**. Those pathways are important reasons to compare candidate inventories with prospective, independent seed accounting, stratification by actual start, and all-arm retention rather than selecting only identical post-treatment source fingerprints.

Do not call a selected seed pair “same opposing opening” merely because the seed and input source 60 are unchanged. Also do not assume that different source starting states make candidate comparisons invalid: when changes are legitimate consequences of different candidate inventories, they are part of the **unconditional inventory comparison** and must remain in the attempted denominator. Use identical full physical source-deal pairs separately for narrowly controlled mechanical counterfactuals.

## Boundaries and next actions

The replay is **two setup-only arms**, one preregistered source rank and seed, plus independently repeated setup-observer traces. It is a mechanistic explanation, **not** a population-level probability of mismatches. It does not establish effects on tactical strength, hidden-information-safe action choices, printed lock interactions, tournament clock, or final outcomes. The original 32-arm scout still has **20 native terminals, 12 caps, and zero competitively qualified games**. The field still has **29/32 exact original decklists**, with ranks 23, 25 and 28 missing; **99.5% remains unproven**.

The immediate release-gate improvement is to preserve source initial-state identity and both players' mulligan counts/bonus-draw offers in the canonical two-player observational packet, distinguish candidate-induced shuffle-path differences from engine reproducibility defects, and avoid conditioning outcome inclusion on same-source postsetup state. Coordinate changes with Agent41's existing integrated chooser rather than creating another game executor.
