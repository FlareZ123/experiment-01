# Actual source G&H two-card payment: native owner-deck search is feasible, with strategic singleton cost

**5 November 2026 | Agent45 | Frozen eight-game retrospective cost feasibility test.** This is a source-independent native Store action-execution experiment. No complete paper-game or field win-rate claim follows from this result.

## Why and what was preregistered

Source `results/aichi-2026/registrations/agent45-issue25-ghala-relaxed-payment-v9-20261105.json` was committed before compiled native testing. Earlier **v7** showed native Tag Call fetching G&H into original Aichi rank6 source's own hand, while baseline passed the root. **v8** showed real G&H Supporter roots in two rank6 natural openings, each followed by free mode0 Stadium-only search. The v8 discardability heuristic scored prospective two-card payment as too strategically expensive, which left paid Special Energy and Pokémon Tool search untested in those actual openings.

The frozen v9 intervention changes only the after-authenticated-Tag-Call Guzma & Hala discard penalty ceiling from `40` to `Number.POSITIVE_INFINITY`. It can therefore choose the two least expensive *available actual hand cards* even when they are rare or valuable; this choice is a **deliberately unoptimized structural feasibility test**. The full native comparison uses the same frozen eight original rank6/rank11 source Sixties, same candidate printed 60s (`champion-reference` and `new-moon-lockbreaker-v1`), same four source-seed/seat pairs, same 48 accepted native action limit, same v5 native Prize/Promotion and selected-v4 mechanisms, same v7 accepted native Tag Call, same v8 conditional native G&H hand-origin gate. True physical owner shuffled deck and opponent concealed hand are excluded from root policy; the real owner deck is viewed only at an authenticated actual owner-deck search prompt.

## Verified native result

[**Successful corrected native CI 42080317659**](https://github.com/FlareZ123/experiment-01/actions/runs/42080317659) passed the pure cost tests and all eight matched real pinned Twinleaf Store attempts. `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` is the actual pinned native revision. The v8/v9 original-source initial physical-deal fingerprint and full two-player initial physical-deal fingerprint match **8/8 within each registered ID**. Both actual source G&H Supporter `PlayCardAction` roots are corroborated separately in digest-verified complete public accepted Store histories.

| Original frozen rank6/rank11 eight-game quantity | V9 observed |
| --- | ---: |
| Registered native attempts with exact deal parity vs v8 | 8 |
| Genuine native accepted Tag Call root | 2 |
| G&H physically fetched to owner hand by Tag Call | 2 |
| Subsequent native accepted G&H Supporter root | 2 |
| Real mode1 optional two-card discard selections | 2 |
| Native physical payments of **two other owner-hand cards** | 2 |
| Native accepted G&H own-deck three-category search prompts | 2 |
| Physical individual cards retrieved from deck to owner's hand | 6 |
| Additional rejected native G&H proposals | 0 |
| Source native attack settlements | 0 |
| Qualified competitive games | 0 |

The paid G&H path occurred in exactly the same two source rank6 seat0 first-turn situations as v7/v8: `6:101:B:champion-reference` and `6:101:B:new-moon-lockbreaker-v1`, both at global native turn2. In **each** real native owner hand, the selected physical two-card payment was **`Tool Jammer BST` + `Team Rocket's Handiwork FCO`**. Each is a singleton in the original rank6 60, so the paid search sacrifices real possible Tool-lock disruption and late-game Supporter disruption options. Whether this trade is strategically desirable depends on opponent matchup and attack plan and has **not** been established.

Relative to v8, the actual accepted public-root action sequence first differs at ordinal **25** for the champion reference and **32** for New Moon. Both are *native prompt resolutions*: v8 was resolving `ShuffleDeckPrompt`, while v9 was still resolving a `ChooseCardsPrompt` after mode1 and two-card payment. The original Tag Call and Supporter roots themselves are identical across v8/v9; the difference occurs in the authenticated optional paid branch, not a new Supporter event.

Each paid search moved three actual native owner-deck card objects into the player's own hand. The underlying supported search categories are Stadium, Special Energy and Pokémon Tool. Current audit reports the **physical card count, prompt acceptance, and two specific public payment card printings**; it does not report the exact three cards retrieved. Consequently the receipt certifies a three-card native retrieval from the authentic G&H deck prompt; any named retrieved printing or downstream attack must be verified separately.

The native 48-root dispositions remained exactly **seven capped developmental attempts and one original rank11/New Moon Telepathic Psychic Energy owner-search abort**. Neither source rank6 game reached an accepted source attack, original opponent response, Prize outcome, or terminal match. Two paid lines share an original source seed but have differing original source initial physical deals across the different contenders; they are *two observed native action instances*, never independent field wins.

## Reproduction, first CI failure and exact artifacts

Research-owned code [`agent45-owner-ghala-after-tagcall.cjs`](../../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs) accepts the optional discard threshold, preserves the default v8 value40 and records a publicly auditable two-card payment receipt only when both selected actual owner cards have physically left their hand for discard or Lost Zone. [`agent45-issue25-ghala-relaxed-v9.cjs`](../../simulation/evaluation/agent45-issue25-ghala-relaxed-v9.cjs) wraps the identical native v8 policy with only the threshold change. Pure [`agent45-owner-ghala-relaxed-cost.test.cjs`](../../tests/agent45-owner-ghala-relaxed-cost.test.cjs) and genuine same-eight [`agent45-issue25-ghala-relaxed-v9.native.test.cjs`](../../tests/agent45-issue25-ghala-relaxed-v9.native.test.cjs) execute from the default-off `include_agent45_ghala_v9` in the existing manual Twinleaf CI workflow.

The initial compiled [CI 42079737959](https://github.com/FlareZ123/experiment-01/actions/runs/42079737959) **failed overall** on two *synthetic* unit tests. Its fixture had accidentally generated twelve copies of each protected Supporter in a mock registered60; the discard heuristic correctly treated ≥3 copies as cheaper, contrary to the test's singleton assumptions. Importantly, the actual eight registered compiled native comparison subtest already passed and reported **two genuine paid and settled owner G&H searches**. The mock was corrected to one copy of each protected printing plus unique fillers (commit `31d91ef3cd3d9b9d082cfb6589c92da274983cf6`), without changing the native policy. The new CI run **42080317659** passed the complete suite and independently reproduced both paid source routes. Do not retroactively call the initial job green; two distinct CI histories remain visible.

The corrected green CI's archived complete public native receipt pair `agent45-issue25-native-ghala-v9` includes **all eight original native attempts per arm**, actual counterfactual action sequences, initial physical deal fingerprints, error/censor statuses, policy hashes, and atomic exclusive-lock SHA256 sidecars. Observed corrected archive digests:

- Strict control `issue25-agent45-ghala-v9/strict/issue25-steward-v5.json`: **149,306 bytes**, SHA256 `31737e3cebed34999661a2380fc7d740c7559a51f0b197e04f483f97a2562692`.
- Relaxed cost treatment `issue25-agent45-ghala-v9/relaxed/issue25-steward-v5.json`: **150,407 bytes**, SHA256 `cc1d6d90df6fb4e12e30bd95e7e17c1cafddfd32709968fbbb2f8386bfd5d7aa`.

All tools are additions under `simulation/` or `tests/` outside the pinned Twinleaf submodule. No upstream engine mutations and no new expensive periodic workflow were introduced.

## Decision and nonclaims

**What has advanced:** One authentic opponent source first-turn ALS prefix now executes mechanically inside real matches: owner-held Tag Call → real own-deck G&H retrieval → actual G&H Supporter root → native mode1 two-other-card payment → three native cards brought out of own deck. Prior v8 used free mode. This is stronger evidence for source playing-policy feasibility than a static associativity graph.

**What remains unknown:** whether paying two rare singleton resources has positive expected value, which exact three categories/printings were retrieved in each source state, whether the source can attach/pay the actual DCE/Thunder Mountain attack, whether a real source Volt Cyclone and opponent follow-up are reachable under a policy with correctly paper-legal costs, and eventual complete competitive results. Do not confuse wider access with successful setup or with game win rate. The original Aichi Top32 full printed source roster remains 29/32 and the 99.5% target remains unproven.

**Next discriminating action:** capture the actual three owner-search printings via source-stamped native prompt post-settlement after card identities are legitimately revealed, then test next source-root decisions and a printed-energy payable Volt Cyclone without forcing nonexistent resources. Preserve the same-deal control with full opponent response if a native attack settles; preregister a larger fresh test only after this smaller frontier is understood. Alternative analysis should quantify the opportunity cost of Tool Jammer + Team Rocket's Handiwork in the affected source matchups rather than treating physical payment as automatic strategic gain.
