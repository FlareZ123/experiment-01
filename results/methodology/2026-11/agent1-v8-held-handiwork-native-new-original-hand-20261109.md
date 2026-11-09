# Native policy conversion: already-held Handiwork including one never obtained through Mail

**Agent 1 · 9 November 2026.** Status: confirmed bounded native developmental effect; zero competitively qualified matches.

## Concrete decision

In [pinned Twinleaf workflow 42539570240](https://github.com/FlareZ123/experiment-01/actions/runs/42539570240) a new default-off owner-only policy played `Team Rocket's Handiwork FCO` at **two** authentic rank-3 Snorlax Stall source `PassTurnAction` roots. Both `PlayCardAction` actions were accepted by the real Store. Each Supporter then resolved the **two native WaitPrompt acknowledgements** for its coin flips, moved two cards from the opponent's public deck to discard, and was followed by a strategic opponent PlayCardAction plus a strategic source PlayCardAction on a later own turn. Neither intervention changed the four-arm native terminal/Prize outcome.

The stronger of these witnesses is **trial `3:213:B:champion-reference` at global turn 50, root 205**: the held Handiwork was **not** a physical card previously selected through Trainers' Mail. This extends the existing Mail-selected-Handiwork proof to the natural already-held-card bottleneck observed in Agent1's rank-3 owner-zone scan. It is a strict improvement in owner action coverage, **not** a demonstrated matchup-strength increase.

## Frozen registered comparison

The four arms use the original rank-3 source and rank-1 champion-reference physical 60s, seeds `2404595552` and `948758444`, each source seat 0 and 1, unchanged pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and 260 native-root cap. See [registration](../registrations/agent1-v8-held-handiwork-four-arm-20261109.md). Both sides share owner Ability confirmation and owner Mail-after-Pass; treatment alone enables `followHeldHandiwork`. `followMailHandiwork` remains off. First-divergent roots, accepted action tags, source/opponent turn receipts, native effects and final endpoints come from the archived machine output.

| Original trial | First changed native root | Native delayed effect | Later meaningful actions | Control / treatment endpoint |
| --- | --- | --- | --- | --- |
| `3:312:B` source seat 0 | None | None | N/A | 260-root cap; remaining Prizes 6/3 in both |
| `3:312:A` source seat 1 | None | None | N/A | Native game end, winner seat 1; Prizes 6/6 in both |
| `3:213:A` source seat 1 | Global turn **3**, root **26**, `PassTurnAction → PlayCardAction`; Mail-selected Handiwork | Two WaitPrompts, **2 cards milled**, opponent deck 45→43 and discard 1→3 | Opponent root 57 / turn 12 `PlayCardAction`; source root 99 / turn 25 `PlayCardAction` | 260-root cap; Prizes 6/6 in both |
| `3:213:B` source seat 0 | Global turn **50**, root **205**, `PassTurnAction → PlayCardAction`; **originally held, not Mail-selected** | Two WaitPrompts, **2 cards milled**, opponent deck 21→19 and discard 1→3 | Opponent root 211 / turn 51 `PlayCardAction`; source root 223 / turn 54 `PlayCardAction` | 260-root cap; Prizes 6/5 in both |

**All four trials retained:** two native action substitutions, two settled coin-effect chains, four opponent deck cards removed, zero native Store rejections, two strict owner/opponent/source continuation chains; six newly added pure tests passed. Both interventions performed genuine effects. Coin outcomes in two tiny exposures are **not** a general expected mill-rate estimate.

## Exact implementation and reproducibility

- Actor-only decision: [`simulation/twinleaf/agent1-owner-held-handiwork-choice.cjs`](../../../simulation/twinleaf/agent1-owner-held-handiwork-choice.cjs), which checks the detached hand, current Supporter quota/lock and visible opponent deck count. Real native `canPlay` must approve before a proposal; hidden opponent hand/deck/Prize identities are not read.
- Registered dual-seat native Store hook: [`simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs`](../../../simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs), with separately tagged held-vs-Mail action receipts, deferred two-WaitPrompt settlement and physical opponent deck/discard deltas.
- Shared runner entry point: [`simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs`](../../../simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs). Held actions are tagged by identity in the native action ledger and retained under source/seat/turn.
- Paired native A/B: [`simulation/evaluation/agent1-v8-held-handiwork-four-arm.cjs`](../../../simulation/evaluation/agent1-v8-held-handiwork-four-arm.cjs). Tests: [pure owner intent](../../../tests/2026-11/agent1-owner-held-handiwork-choice.test.cjs) and [frozen registration/strict-next-turn guard](../../../tests/2026-11/agent1-held-handiwork-four-arm.test.cjs). Reuses existing [manual workflow](../../../.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml) with only `follow_held_handiwork=true`; no new CI entry point.
- [Action log run 42539570240](https://github.com/FlareZ123/experiment-01/actions/runs/42539570240), exact HEAD `6e6e9d53907c3e9105968c0e1c6f440fdf6e7338`; raw artifact [13640822602](https://github.com/FlareZ123/experiment-01/actions/runs/42539570240/artifacts/13640822602), ZIP SHA256 `1877ef871d893e6cf153375b447d941acb05d2193bf2c987fd0a28194ef6885a`. Machine JSON `agent1-held-handiwork-four-arm.json` and its SHA256 sidecar are inside the archive.

## Inference boundary and next release

This is native **policy coverage** for a source Supporter; it has not been independently accepted as a complete paper Japanese Extra game, and the remaining root-cap arms are censored. The rank-3 source owner had a natural Handiwork it would otherwise pass with; using it removed two physical cards from the opponent's deck after the real two-coin process. No Prize or native-endpoint advantage followed in these four registered cases.

Agent36 can incorporate this default-off owner-held Supporter action into a versioned common-policy successor alongside prior Mail, Bench, Arven and Ability treatments, retaining the v8 frozen control. Agent9 should distinguish the root-205 non-Mail provenance from the earlier Mail-selected proof. Next high-value test is a frozen representative rank-3 original-source/opponent comparison with a stronger bilateral policy and full paper/clock acceptance; 99.5% remains entirely unmeasured.
