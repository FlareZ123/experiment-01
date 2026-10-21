# Source-first rank-11 Powerglass root: first same-deal pair reaches GX_USED abort

**Agent 30, 21 October 2026 UTC.** **Native retrospective development. No competitively qualified games.**

## Frozen experiment

This experiment tests a specific physical intervention arising from Agent 41's [rank-11 owner-discard Powerglass opportunity](agent41-sourcefirst-powerglass-discard-window-20261021.md). The **preregistration** and paired experiment script were committed *before* the first run on an [isolated research branch](https://github.com/FlareZ123/experiment-01/tree/agent30-powerglass-sourcefirst-pair-20261021).

- [Compiled manual GitHub Actions 39690410641](https://github.com/FlareZ123/experiment-01/actions/runs/39690410641), **SUCCESS**, [complete zipped control/treatment/summary artifacts 12388118700](https://github.com/FlareZ123/experiment-01/actions/runs/39690410641/artifacts/12388118700).
- Research checkout `9f4e7a4c0705e6c203adff83ea4551495b05b2ee`; pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Four registered source-first development trials: rank-6 seed `407516727` and rank-11 seed `482443328`, candidate in seat B, both frozen `champion-reference` and `new-moon-lockbreaker-v1` 60s.
- The only changed actor-policy input between independently spawned run processes was `AGENT41_ACTOR_POWERGLASS_ROOT_DEV=false/true`. Native fallback, Perfection, Basic Energy recipient, paid retreat, Special Energy root, paper supporter and action/KO hooks were identical, as recorded in [the branch's source-first registration](https://github.com/FlareZ123/experiment-01/blob/9f4e7a4c0705e6c203adff83ea4551495b05b2ee/results/aichi-2026/registrations/agent30-powerglass-sourcefirst-pair-20261021.md).

## Actual paired outcomes

| Original source-first trial | Control | Powerglass ON | Exact source deal and Store roots |
| --- | --- | --- | --- |
| Rank 6, champion-reference | Ended action 93, turn 18; source 6 Prizes, candidate 2 | **Identical** | Initial source fingerprint matched; 93/93 root entries identical |
| Rank 6, new-moon-lockbreaker-v1 | Ended action 211, turn 51; source 0 Prizes, candidate 6 | **Identical** | Initial source fingerprint matched; 211/211 root entries identical |
| Rank 11, champion-reference | Ended action 89, turn 18; source 6 Prizes, candidate 1 | **Identical** | Initial source fingerprint matched; 89/89 root entries identical |
| **Rank 11, new-moon-lockbreaker-v1** | Censored at action limit **260**, turn **58**; source **1 Prize**, candidate **6 Prizes** | **Engine error at action 231**: `AttackAction` rejected `LABEL_GX_USED` | Control source fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`; treatment exception prevented final source-deal fingerprint/root-ledger archive, so that one pair is **not independently fingerprint-verified** |

The treatment's failed rank-11 row preserved owner prompt evidence including **three owner-side `AttachEnergyPrompt` occurrences**, versus **zero** for the same control. This supports a causal policy divergence and a reachable native Tool end-turn prompt; it does **not** yet prove which Basic Energy was selected or whether the rejected attack arose from a direct actor root, a copied GX effect or the engine.

The rank-11 control never completed a genuine winning continuation under the weak historical bot and 260-action cap. No comparison in this experiment can establish win-rate strength or a correction against all 32 decks.

## Evidence checks

- Complete paired raw JSON files, summary and stdout were archived in the run's **14-day** artifact. Control and treatment raw SHA-256: `c46991cdf66a7a508525380cb64e133ba51cc4ab2aa02108ad2f79ad2e165088` / `4239d26f88cef4b10bfa8b74c4d9181cb9ca1a935bc285b8c3e4de0222c9b350`.
- Successful controls include actual native source-deal and exact root-ledger digest equality. The lone aborted treatment reported `nativeSupporterQuotaQualified=false` because any engine error is unqualified.
- Source-first rank-11 was selected retrospectively after a source Tool-Garbodor success. Both decks and all original seeds remain frozen; the sample is **exploratory**, the source player is a weak generic bot with read-only fallback attribution, and **zero** games qualify for competitive inference.
- Mechanically separate [staged native Powerglass-after-Pass contract](../twinleaf/agent30-powerglass-pass-native-20261021.md) did already prove physical Basic Psychic attachment in a constructed state, but that receipt cannot be silently substituted for a real opponent game.

## Next falsification

An instrumented rerun is preregistered [on the same isolated branch](https://github.com/FlareZ123/experiment-01/blob/agent30-powerglass-sourcefirst-pair-20261021/results/aichi-2026/registrations/agent30-powerglass-gx-rejection-followup-20261021.md). It enables only a read-only rejected-action receipt on both arms. That receipt must identify the acting seat, attempted attack name, active Pokémon, and native `usedGX` flag at the exact rejected `AttackAction`. Subsequent policy work should reproduce a genuine legal attack after Tool funding, preserve original source reply, and distinguish optimizer defects from actual card constraints.

**Scope remains 29/32 source-verified Aichi opponent decks, zero competitively qualified games, and no demonstrated 99.5% fixed-list win rate.**


## Independent rejection attribution, 21 October 2026, 23:15 UTC

A second, independently dispatched same-pair [compiled CI 39691889301](https://github.com/FlareZ123/experiment-01/actions/runs/39691889301), checkout `4b6b81c22988b13cb241ea862251b7bd9e38bc6e`, with an *observation-only* native rejection record on **both** arms, reproduced the same 3 identical trials and the same rank-11 New Moon `LABEL_GX_USED` abort at **action 231, turn 48**. [Complete artifact 12388623853](https://github.com/FlareZ123/experiment-01/actions/runs/39691889301/artifacts/12388623853).

The actual native `rejectedActionEvidence` identifies all of the following directly **before** the rejected dispatch: candidate seat **B** owns Active **Mewtwo & Mew-GX UNM**, **Powerglass SFA attached**, **three Psychic Energy cards attached**, `usedGX=true`, and `cannotUseGXAttacks=false`; the bot proposed native `AttackAction.name='Miraculous Duo-GX'` while no prompt was pending. The public log already contains B's earlier **Horror House-GX** declaration and subsequent **Poltergeist** declaration. The second GX was forbidden by the once-per-game rule, so the Store correctly rejected it.

This confirms that source-first Tool funding led to a legally equipped and Energy-powered Mewtwo, plus actual source and candidate attack declarations, before an **illegal automated choice** cut the game short. It remains a development game with no qualified outcome. The native metadata root cause is independently checkable: pinned `mewtwo-and-mew-gx.ts` defines printed **Miraculous Duo-GX** without `gxAttack: true` even though its reducer calls `BLOCK_IF_GX_ATTACK_USED`; Agent34's actor-root code originally trusted that marker alone to treat an attack as GX. The printed **Horror House-GX** on Gengar & Mimikyu-GX is correctly flagged. An isolated research-branch [preregistered semantic-GX correction](https://github.com/FlareZ123/experiment-01/blob/agent30-powerglass-sourcefirst-pair-20261021/results/aichi-2026/registrations/agent30-mewtwo-printed-gx-alias-correction-20261021.md) will retest a conservative printed `-GX` alias while leaving vendor code unchanged and maintaining the selected-fixture caveat.
