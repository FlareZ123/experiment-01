# Agent9: real owner-paid Float Stone erases the apparent two-Prize Guzma advantage on an exact original source deal

**6 November 2026 | native paper-TCG development A/B/C and C-to-A replay | evidence: real pinned Store actions and physical custody; competitive qualification: none**

## Result

A genuine owner-held **Float Stone BKT** was a feasible, Store-accepted, strategically consequential reply to the source Iron Thorns ex player's **Guzma BUS** switch. In the exact registered original rank-6 `6:201:B:champion-reference` physical opening, a one-root Guzma counterfactual had appeared to deny the opponent two Prize cards by turn15 when the original bot left the gusted Marshadow UNB stranded. Replacing only that specific opponent response with an **actually owned, paid Float Stone Tool on Marshadow and one native zero-cost retreat** brought the opponent's damaged Tapu Lele-GX back Active in turn6. It then used Energy Drive.

**The prior two-Prize advantage disappeared.** At source turn15 the original A control and new C (Guzma + Tool-aware opponent reply) both had **source/opponent Prize cards remaining 3/4**, versus **3/6** in B (Guzma + original weak opposing bot). The exact-game native active damage and attack paths converge in relevant ways. No run completed a game; none establishes actual paper tournament win rate or an optimal opponent policy.

This is a decisive **counterexample to drawing strength conclusions from the B treatment's apparent 2-Prize defensive margin**. The original paired-source intervention was real, and the observed numerical margin was real in that restricted bot policy. A physically held and payable counter-response falsified its robustness.

## Root-level A/B/C contrast

The A/B/C rows reuse the same originally registered eight 60-card opponent/source attempts, pinned Twinleaf revision and 96-action cap. All eight source and complete two-player opening fingerprints are identical in the native comparison. The seven cases outside the sole selected source state produce **exactly identical** accepted public root ledgers and outcomes between A and each treatment.

| Event | A: unchanged native bot | B: source paid Guzma, original opponent bot | C: same Guzma, opponent Float Stone + Retreat |
| --- | --- | --- | --- |
| Source turn3 | root22 Volt Cyclone for 140 on Tapu Lele-GX | Same | Same |
| Source turn5 root32 | Pass | Native accepted Guzma | Identical native accepted Guzma |
| Guzma prompts | None | Opponent Marshadow promoted; own first Benched Iron Thorns promoted | Same physically verified recipients |
| Opponent turn6 | root35 Psychic Energy, root36 Energy Drive | root38 Psychic Energy, root39 Red Knuckles | **root38 Float Stone BKT** onto Active Marshadow, **root39 RetreatAction**, root40 Psychic Energy, **root41 Energy Drive** from now-Active Tapu Lele-GX |
| Opponent turns8/10 | Energy Drive, Energy Drive | Red Knuckles, Red Knuckles | Energy Drive, Energy Drive |
| Source turn11 Volt | root60; Prizes 6/4 -> **4/4**, 2-Prize Tapu Lele KO | root60; 6/6 -> **5/6**, 1-Prize Marshadow KO | root64; 6/4 -> **4/4**, 2-Prize Tapu Lele KO |
| Source turn15 Volt | root83; 4/4 -> **3/4**, 1-Prize Marshadow KO | root80; 5/6 -> **3/6**, 2-Prize Tapu Lele KO | root83; 4/4 -> **3/4**, 1-Prize Marshadow KO |

The third treatment **C** does add a Tool to a Benched Marshadow that persists through source turn15, and its root ordinals differ after the physically paid reply. The Prize-count convergence is a specific observed outcome; it does not imply all board states, legal options or future turns are identical. At source turn11, C's attacking Iron Thorns carried 60 damage before attacking, versus 100 in A and 30 in B, so even when the Prize counts coincide, defense, switching and future options still diverge.

The native B and C target both show original source bot proposing one Pass on turn5 and a unique owner PlayCardAction Guzma accepted at root32, zero rejected native Guzma roots, Supporter quota from 0 to 1, the exact opponent target Marshadow physical ID **76**, exact owner Thorns physical ID **3**, both native ChoosePokemon prompts accepted and both physical recipient verifications confirmed.

The C owner counter-response is independently native-accepted on seat1 turn6:
- One genuinely held `Float Stone BKT`, exact own hand index **3**, was attached using native `PlayCardAction` to the actual Active Marshadow UNB. Store post-state shows that Pokémon with Tool `Float Stone BKT`.
- The same opponent performed native `RetreatAction` to its original damaged Tapu Lele-GX GRI, Bench target index0. Store post-state shows Active `Tapu Lele-GX GRI` and `retreatedTurn:6`.
- Both proposed roots are accepted, zero rejected, and the usual opponent bot then attaches Psychic Energy and attacks with Energy Drive. No unseen opponent hand/Prize/deck identities were consulted in the response planner.

The owner-controlled `Float Stone` counter is a **selected developmental reply**, not a proven opponent-optimal route. A future competitive policy should compare additional plays such as gust, energy denial, pass, alternate attacks, Tool removal and tempo preservation on the appropriate actor information set.

## Exact control custody and reproducibility

**GitHub Actions success** [42300215214](https://github.com/FlareZ123/experiment-01/actions/runs/42300215214), manual `twinleaf-completion.yml`, inputs `abort_provenance_only=true`, `include_agent36_selected_v4=true`; original checkout SHA `361b5f433d46c37fcdd7418ac9c4f7c5af908616`, original pinned upstream Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Test step39 **success**, artifact step40 **success**. At time of this report the overall workflow may continue in unrelated later steps, so judge the exact canary's step success independently.

Relevant downloaded artifact **13544196677**, `agent9-v7-opponent-held-floatstone-after-source-guzma`, ZIP SHA256 `563e02e04fb850b259d4495dfd6e9dfdde04a763900c892c82844925fe9e918d`. Internal `agent9-v7-floatstone-guzma-opponent-control.json` 982,176 bytes, SHA256 `043f5452ba0802f7a464b2cde26641fb3bc8e0f1a982685a8ec4990a5b68f60b`, **matches included SHA256 sidecar**.

The C execution used `runOriginalV7GuzmaCanary({voltLayer:makeOpponentFloatStoneReplyLayer()})`. Native wrapper ownership and Store callbacks are reversible. The experiment executed:
1. A: original eight-registered native v7 owner-hand control.
2. C: one original source paid Guzma plus opponent-owned Float Stone/retreat response after genuine source turn5.
3. A again: full original eight native controls restored after both interventions.

The C-to-A control roundtrip returns **true for 8/8**, individually checking source and full physical fingerprints, result dispositions, accepted root counts, accepted public ledger SHA256 and exact public action arrays; 7/7 B/C non-target arms preserve exact public roots. One selected A/C root divergence occurs at source turn5 action32, leaving 32 identical accepted prior actions. All eight original abort/cap attempts retained. Original control and C target both stop at the 96-root cap without a final native winner.

Native source:
- `simulation/twinleaf/agent9-v7-floatstone-counterreply.cjs`: opt-in owner-only exact visible turn6 Float Stone then zero-cost native RetreatAction; after successful Store dispatch, records true Active, Tools, and physical retreat-turn.
- `simulation/evaluation/agent9-v7-guzma-causal-replay.cjs`: `makeOpponentFloatStoneReplyLayer` composes unchanged native Volt handler, genuine source Guzma and typed two-prompt continuation, plus actor-owned opponent Float Stone response. The shared eight physical openings, original sixties and selected root stay constant.
- `tests/agent9-v7-floatstone-counterreply.test.cjs`: pure actor view prerequisite and negative controls.
- `tests/agent9-v7-floatstone-counterreply.native.test.cjs`: compiled original Store assertions of one physically accepted Tool and Retreat, both original Guzma prompt recipients, all seven unmodified cases and full A/C/A restoration.

Historical A/B proof [42299270552](https://github.com/FlareZ123/experiment-01/actions/runs/42299270552), A/B/A ZIP `2ad6778223c0311f1e13eb775ce490e0471d26909f7886d030d684b5eddeb693` and JSON SHA `5e07fedb91ccfdead935d2b1d514cec24b94e9a3a901a7e92b604b2b479b656a`. See `results/methodology/agent9-v7-guzma-paid-native-aba-counterfactual-20261106.md`. Authentic owner-hand supporting opponent-held Float Stone before source Guzma: `results/methodology/agent9-v7-real-store-accepted-owner-hand-frontier-20261106.md`.

## Deck optimization implication and limits

This matched counterexample demonstrates a high-impact interaction between source gust, owning side's movement, the opponent's **physically held mobility Tool**, and opponent attack continuity. An optimizer can overvalue a disruptive strategy when its opponent policy ignores own-hand Tool+retreat replies. Evaluating real opportunities requires both players' actual legal action budgets, native prompt payment, attack effects, Energy attachments, prize outcome and continued strategic context.

All three arms use the same **registered original decks** and show zero competitively qualified games. The published original Aichi field still has **29/32** authenticated 60-card lists, with ranks **23, 25, 28** missing. No final fixed 60 has been nominated, no matchup-level field win-rate is defensible and **99.5% is unproven**. The primary result is a counter-response discovery with actionable simulator policy requirements.
