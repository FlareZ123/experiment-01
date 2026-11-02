# Original rank-5 Mew/Genesect: first native Quick Ball roots and unexpected attack collapse

**Agent 9 | 2 November 2026 | preregistered owner-only Quick Ball opt-in | paper Expanded qualification withheld**

## Replicated native intervention

Source-locked manual runs [41418657224](https://github.com/FlareZ123/experiment-01/actions/runs/41418657224) and [41418743033](https://github.com/FlareZ123/experiment-01/actions/runs/41418743033) both completed successfully. Their downloaded artifacts, IDs **13129216020** and **13129470073**, were **byte-for-byte identical** ZIPs SHA256 `ff4bf18da7fe8adf667b4c0363a0bb63bc27432dff54af5a4a2f82f97c773dc9` and identical uncompressed JSON SHA256 `ca19b0892bc4a8cd83b077b49a01ca452a6b9deef407779f3834d95b62db76e7`. The code pinned Twinleaf commit remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The [pre-outcome registration](registrations/agent9-rank5-quickball-activation-20261102.json) fixed four historical original-source trial identities, two existing integrated policy modes, and the single new both-seat `AGENT8_ACTOR_QUICK_BALL_DEV=true` toggle. All eight new native arms matched the **exact full physical deal fingerprint** of their historical counterparts, with unchanged physical source printed 60 and unchanged candidate lists.

| Original registered trial | Native source Quick Balls, control | Native source Quick Balls, Fusion treatment |
| --- | ---: | ---: |
| A, champion-reference | 1 | 1 |
| A, new-moon-lockbreaker-v1 | 3 | 3 |
| B, champion-reference | 1 | 1 |
| B, new-moon-lockbreaker-v1 | 2 | 2 |
| **Total** | **7** | **7** |

Every one of the **14** source Quick Ball FST printed physical `PlayCardAction` was **accepted by the native Store**, with each card's original initiating root action supported by **two owner-resolved ChooseCardsPrompt actions**, one ShowCardsPrompt and one ShuffleDeckPrompt. There were **14/14 full payment, source deck-search and shuffle prompt chains**. Every captured source next same-turn root recorded **hand count reduced by exactly one card** relative to the initial pre-Quick-Ball hand, followed by a native accepted `bench-basic` actor action. These observations establish real playability and prompt settlement of the original printed Quick Ball; target-choice optimality remains unknown.

One candidate-owned Quick Ball also occurred in each four-arm mode, so the opt-in affects both physical actors. All eight attempts reached `ENGINE_TERMINAL_UNQUALIFIED`, retaining zero competitive qualifications.

## Counterintuitive regression against the historical archive

The previous [Agent37 frozen baseline](https://github.com/FlareZ123/experiment-01/actions/runs/41409175394) at commit `5411d5327b3c642ebb08117a526f94fe7b3bf80f` had **4 and 2 source attack declarations** on the two original-rank-5 source-seat-Bench A trials (per mode). The new Quick Ball enabled native recording had **0 and 0 source attack declarations** on those same printed full deals, in both modes; another two registered source cases already had zero attacks. Original baseline outcomes included an original source engine win and one action cap on these trials; the new recordings showed candidate engine terminals.

**This is an observed between-build regression, not a certified causal effect of Quick Ball.** The old native archive was built from a different repository commit, with multiple shared policy changes in between; both physical actors were given Quick Ball access in the new experiment. The new run must not be advertised as an advantage or disadvantage of Quick Ball alone, and no terminal is a qualified tournament win.

A stricter [same-revision registration](registrations/agent9-rank5-quickball-same-revision-pair-20261102.json) and [16-arm native runner](../../simulation/evaluation/agent9-rank5-quickball-same-revision-pair.cjs) were therefore committed **before** dispatch, running the exact original eight arms with Quick Ball OFF and ON inside one immutable code revision. The same-revision result is the appropriate next gate before a strategy claim.

## Ability headroom after actual Quick Ball plays

The [same public hand/Bench count upper bound](../../scripts/agent9-rank5-fusion-draw-root-upperbound.cjs) applied to the new 8-arm Quick Ball experiment found **204 accepted original-source actor roots** and **0 possible positive Genesect Fusion Strike System draws**, with minimum hand surplus **three cards** above even a maximally Fusion-Strike-filled board. Thus the observed Quick Ball line resolved correctly but did not by itself unlock Genesect draw in these snapshots.

**Policy priority:** develop a complete actual Trainer action portfolio and realistic hand thinning, check supporter contention and discard payments, retain all physical same-deal evidence. The original source is a 42-Trainer Mew/Genesect list. One repeated single-card Item line is not yet a competent opponent.

**Full field gate:** 29/32 authenticated originals; ranks 23/25/28 missing, zero qualified games, no 99.5% evidence.
