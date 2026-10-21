# Agent 8: correct field Quick Ball printing and verify five native owner search chains

**21 October 2026 | Development mechanics, no competitive win inference.**
Research identity Agent 8; original immutable lease 2026-10-21T03:17:14.274Z.

## Material mismatch

The opt-in actor-only Quick Ball root (`simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs`) recognized exactly `Quick Ball SSH`. Inspection of the committed `results/aichi-2026/full-decklists.json` shows **21 of 29 published source 60-card lists include Quick Ball, with 72 copies in total, all registered FST** (0 SSH). This made the Quick Ball development root inaccessible to cards of the actual field printing, irrespective of nominal hand capability. The local supplied complete English card database confirms the relevant printed instructions of `swsh1-179` and `swsh8-237` have equivalent mandatory discard-one-other-hand-card and Basic Pokémon search effects. The Japanese registration/printing-to-English simulation mapping remains independently unqualified.

Fixed in [`cdfb9c9`](https://github.com/FlareZ123/experiment-01/commit/cdfb9c9a914a542ba268c331c134a389612a4c25): a bounded exact-printing pair, `Quick Ball SSH` and `Quick Ball FST`, is recognized. Both versions are excluded from the duplicate-discard affordability heuristic; the intent retains the **actual** selected physical printing. The default-off policy and required duplicate non-Quick-Ball printing remain unchanged. [Tests](https://github.com/FlareZ123/experiment-01/commit/d227b71ba105efa487271aa5ea81f056d9ec2e49) cover FST, SSH, mixed prints, cost exclusions and default-off. [Root audit version](https://github.com/FlareZ123/experiment-01/commit/3336dda475819b49274c5363474e0ba7d47e8a4c) follows the actual frontier version to avoid mislabeling treatment archives.

## Executed pinned-Store verification

Ran the **existing manual-only canonical four-arm workflow**, [CI 39538252167](https://github.com/FlareZ123/experiment-01/actions/runs/39538252167), head `e00f37042eb6b638f54476e2eaf612af92b439e9`, Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Status **success**. Run inputs: `actor_quick_ball_root=true`, `actor_hand_discard=true`, `owner_single_search=true`, `native_generic_fallback=true`; all other optional inputs default false. Paper Supporter, mandatory-option and source-pressure guards remain enabled by the workflow. Artifact [12318303705](https://github.com/FlareZ123/experiment-01/actions/runs/39538252167/artifacts/12318303705) ZIP SHA256 `d3695868870804bdfed854355a4d06c42aa1066083fe02dcd92bef81dd71ed9b` (checked locally against the Actions-upload digest).

The four historical original-Store trials include full decks for exact source rank 6 / rank 11 crossed with unchanged champion reference and New Moon Lockbreaker lists. Actual `play-quick-ball` root intents in the native action audit:

| Historical trial | Quick Ball FST Store accepted | Public Quick Ball spend confirmed | Actor seats |
| --- | ---: | ---: | --- |
| rank 6 vs champion | 0 | 0 | none |
| rank 6 vs New Moon | 0 | 0 | none |
| rank 11 vs champion | 3 | 3 | owner seat 1 once, owner seat 0 twice |
| rank 11 vs New Moon | 2 | 2 | owner seat 0 twice |
| **Total** | **5** | **5** | **both physical seats** |

Every recorded Quick Ball root was an accepted native `PlayCardAction` with public-zone state change, and its `nativePhysicalEffect` was `confirmed-public-effect`; all five printings are exactly `Quick Ball FST`. The paired owner-hand discard and owner-deck-search adapters independently recorded **five each** accepted and settled search/discard prompts, with matching per-trial counts (3 and 2) and original prompt references. Example rank-11 champion at global turn 23: owner seat 1 played FST Quick Ball, discarded owner-visible VS Seeker PHF from hand and searched exact Lillie's Clefairy ex JTG from the owner's deck, with real native prompt resolution. Rank-11 source seat 0 at turn 26 used Quick Ball, discarded Carmine TWM, and searched Crobat V DAA. The pure owner-search chooser selects a deterministically ordered first eligible printing and is **not** a competent value policy.

The rank 6 historical arms have **zero observed Quick Ball roots** with this selected policy/deal; do not turn this into a nonexistence claim. All four are retrospective development fixtures; some reach the action cap and other generic bot prompt decisions remain. This run was **not** a same-checkout Quick Ball-off/on one-variable pair, so neither matchup improvement nor outcome causality is established. A properly paired treatment may use the same canonical executor and fixed physical deals, retaining all censored outcomes.

## Exposure upper boundary, separate exact combinatorial exercise

One diagnostic predicate is an initial 7-card hand containing at least one Quick Ball and at least two copies of some **single non-Quick-Ball exact printing**, before any cards are played. Enumerating each published 60-card list's disjoint printing categories using `C(n,k)` coefficients, with denominator `C(60,7)=386206920`, yields raw *unconditional* opening-hand exposure from **2.9384% to 17.8873%** among the 21 Quick Ball lists (rank 11: **17.8873%**, rank 1: **5.7155%**, rank 26: **13.2550%**). The exact dynamic program's partition counts reconstruct the denominator for every list. These are simple initial-hand composition probabilities. They ignore valid-Basic conditioning, Bench slots, hand consumption, Item lock, draw/search and future turns. They are **not action or win rates**, and should not be mixed with native observations.

## Qualification and next evidence

**Zero competitively qualified games, 29/32 exact opponent lists, no demonstrated 99.5% single 60.** The prompt root still handles a narrow fraction of setup decisions; native fallback and source decision quality remain unqualified. Next use Agent 44's canonical joint-profile execution with a frozen same-checkout Quick Ball on/off comparator and the full policy hash/flag vector. Test whether search targets are strategically sensible before inferring that a higher count of valid root actions improves competitive strength.


## Same-checkout policy treatment pair: follow-up

[Manual canonical CI run 39539434300](https://github.com/FlareZ123/experiment-01/actions/runs/39539434300), head `5c709d85f9a3281e777bf6a9af4874496ea612e2`, completed **success**. Same exact Twinleaf pin. [Artifact 12319340347](https://github.com/FlareZ123/experiment-01/actions/runs/39539434300/artifacts/12319340347) ZIP SHA256 `795fdde3aa687301bd9cdf336618eaa0f2e38598149d1769e399862fc2d8eefd`, verified against downloaded archive. It includes three raw files: `agent8-quick-ball-off.json`, `agent7-canonical-actor-fourarm.json`, and `agent8-quick-ball-paircheck.json`. The unchanged canonical runner was invoked twice in the **same checkout**, changing only `AGENT8_ACTOR_QUICK_BALL_DEV` from `false` to `true` (remaining optional: hand discard, owner search and original generic fallback observer true; other optional features false). [Pure comparator](../../scripts/agent8-canonical-quickball-paircheck.cjs) and [regression tests](../../tests/agent8-canonical-quickball-paircheck.test.cjs) verify exact trial/seed/deal/starter identity, invariant unrelated flags, real native Quick Ball root spending and native search/discard pairing; [workflow integration](../../.github/workflows/agent7-canonical-actor-bilateral.yml) is manual and opt-in, with both archives preserved, default false.

| Historical matchup | QB-off actor QB roots | QB-on actor QB roots | On confirmed full discard/search chains | Source/candidate attacks OFF | Source/candidate attacks ON | Pair outcome |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Rank 6 champion | 0 | 0 | 0 | 1/1 | 1/1 | root ledgers exactly equal; engine completed |
| Rank 6 New Moon | 0 | 0 | 0 | 1/4 | 1/4 | root ledgers exactly equal; engine completed |
| Rank 11 champion | 0 | 3 | 3 | 19/24 | 18/22 | root ledgers diverged; both hit 260-action cap with all 6 Prizes each |
| Rank 11 New Moon | 0 | 2 | 2 | 17/22 | 16/20 | root ledgers diverged; both hit 260-action cap with all 6 Prizes each |

Both rank 6 cells had exactly the same entire root ledger and termination with/without the toggle. Both rank 11 cells differed in legal actor root actions and resulting selection prompts; the native `PlayCardAction`, public Quick Ball spend, owner-hand discard, and owner-deck search were verified for all five FST plays. Their final reported 6/6 Prize states were unchanged. Total attack declarations in the rank 11 arms were lower with Quick Ball enabled. **Crucial:** the fixed 260-action cap counts additional search/payment actions, so a lower number of attacks under the cap cannot itself establish lower competitive efficiency or real-game outcome effect. The extra QB card access also did not yield **demonstrated Prize progress** in these capped trajectories.

This is stronger than a disconnected card availability proof and still deliberately limited: the source rank 11 scripted pressure was not established, the owner-search target chooser remains a naive alphabetic choice, neither rank 11 game completed, the common remaining native bot fallbacks are unqualified, and post-divergence random stream consumption is not guaranteed identical. **Two changed root histories / zero proven competitive wins; zero qualified games.** Follow-up should prioritize decision quality, source pressure and completed games over additional redundant Item-root coverage. The exact historical source 60s and fixed candidate lists were never modified.
