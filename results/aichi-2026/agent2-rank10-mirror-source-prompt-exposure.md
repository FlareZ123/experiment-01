# Agent 2: actual-first-player-stratified Regidrago source mirror

**17 October 2026 UTC.** Diagnostic source-60 replay using the exact published rank-10 Regidrago inventory in both engine slots. **Zero qualified competitive games.** These are repeatable engine-policy trajectories, never estimates of rank-1 champion strength.

## Input and first-player preflight

[Script](../../simulation/twinleaf/rank10-mirror-apex-source-exposure.cjs) uses the current Double Dragon Energy v4 policy and existing research-side rule/history hooks, with genuine pinned Source Store observation of copied attacks and Bench-counter allocations. One-action setup-only seed preflight initially failed because it stopped before the first normal turn. Commit `b20972af18829fab9c930cb9954ae8d99cc705ff` increased the deterministic setup probe bound to 24 actions, omits previews without verified first player, and requires both actual first-player strata.

Compiled [manual CI 39039228475](https://github.com/FlareZ123/experiment-01/actions/runs/39039228475), head `745f72c3a9b050adc2b883ff145ecf33a68c4ccd`, successfully ran the source-mirror stage. The [immutable JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39039228475/artifacts/12103203801) contains:

| First physical slot | Chosen seed | Seed preflight index | Source turns | Outcome as reported by engine | Original vs paired root action trace |
| --- | --- | ---: | ---: | --- | --- |
| 0 | 3245590697 | 2 | 15 | winner seat 1, Prizes [4,0] | identical |
| 1 | 1663713914 | 1 | 17 | winner seat 1, Prizes [5,0] | identical |

All four games finished, both paired controls shared identical complete starting deck/hand/Prize configurations and source player-turn order. In neither pair did the jointly installed Phantom Dive copy/placement policy change an actual root Store decision. These engine outcomes must not be used as matchup strength or competitive win rate.

## Source-prompt exposure

The true-first-slot-0 source replay includes **five actual Apex Dragon declarations** (three by seat0 on turns5,6,8 and two by seat1 on turns13,15). The two seat1 copy prompts explicitly offered `Jet Headbutt, Phantom Dive, Rolling Iron`, and the underlying bot selected `Rolling Iron` both times, even with the joint policy. No six-counter placement prompt was reached. The exact Bench state and thus the reason the copy resolver did not override its choice had **not yet been observed**; a valid 1–60-HP unprotected Bench window is required by its current guard.

The true-first-slot-1 mirror had **three real Apex Dragon declarations**, all by seat1 on turns13,15,17. Copy prompts selected Kaiser Tackle from menus without Phantom Dive; consequently the experimental policy had no Phantom Dive option. There were no six-counter placement prompts.

The first-slot-0 source replay also selected Timeless-GX through several real Regidrago copy prompts across turns 5,6,8, including repeated prompts within turns6 and8. This is a **reason to audit GX allowance and actual attack application**, not proof of repeat successful GX attacks; the source-root GX marker audit is under separate manual CI. The initial source opponent deck is rank10 vs rank10, not the benchmark rank1 champion against an opponent.

## Limits and next gates

The exact 60-card decks are published, but bot decisions and many card effects are not independently validated as competitively realistic. The GX state may require correction. No tactical policy advantage was observed, and opportunity guard analysis requires actual public Bench data rather than assuming an exposed KO because Phantom Dive was in the menu.

Investigate on real source boards: whether a copied GX payload can be selected after the once-per-game GX allowance is spent; whether the clone prompts are actually applied; whether Phantom Dive's six counters would Knock Out an opponent's publicly visible Bench in the observed turns; and how to preserve faithful opponent replies. Keep all game qualification flags false.
