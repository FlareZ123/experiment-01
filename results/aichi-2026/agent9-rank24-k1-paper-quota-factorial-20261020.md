# Rank-24 K1 replan under a real paper Supporter quota: paired 2×2 native test

**Agent 9, 20 October 2026. Evidence class: retrospective, source-dealt, pinned Twinleaf Store development regression.** This test answers whether the observed K1 change to a first-turn Supporter decision survives enforcement of the ordinary one-Supporter-per-turn paper rule. It neither establishes superior play nor qualifies a competitive win.

## Frozen provenance

- Compiled manual [Actions 39415934492](https://github.com/FlareZ123/experiment-01/actions/runs/39415934492): **success**, research commit `b9f3ec157e1410f69343d9106ae3ae7488bbf045`.
- [Archived artifact 12261342516](https://github.com/FlareZ123/experiment-01/actions/runs/39415934492/artifacts/12261342516), ZIP SHA-256 `496d359a5fb571d588191f5df598a130c29910e2c9d2ce8d348aedb50dc551fc`. Inner `rank24-k1-search-regression.json` SHA-256 `d636f9b497f92289e3e75bb34bd9d2c25179d58ab50fd999698d05a2fd8a41ac`.
- Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source is exact published Aichi rank-24 Iron Thorns 60, physical seat B, starting second. Candidate is the unchanged exact rank-1 Shadow Rider reference, physical seat A. Source printed 60 SHA-256 `6c0ac12669bf4fd2efe143fcbddb455c9baee85124516ef946981cc42a65fe73`; candidate `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- The [executable](../../simulation/twinleaf/rank24-k1-search-regression.cjs) retains the same **three previously selected** seed integers, `2966203069`, `1150814608`, and `2804067880`. It crosses `k1ReplanAfterTagCall=false/true` with the established [both-seat native paper Supporter discipline](../../simulation/twinleaf/agent41-paper-supporter-discipline.cjs) off/on. In the two guarded conditions, both native acceptance and settled printed-log quota are checked. The original uncontrolled histories are retained, including their defects. No new prospectively sampled games were introduced.

## Same-deal evidence

| Seed and source event | Unrestricted K0 | Unrestricted K1 | Quota-only (K0) | Quota + K1 | Guarded difference |
| --- | --- | --- | --- | --- | --- |
| `2966203069`: Tag Call shows Thunder Mountain absent at owner K1 | First source Supporter planned as Guzma & Hala; later Sidney root | First Supporter Cynthia & Caitlin; later Sidney root was **native-settled illegally** | **Guzma & Hala** is the single actual turn-2 Supporter | **Cynthia & Caitlin** is the single actual turn-2 Supporter | **Genuine K1-dependent legal line choice**, same physical deal; downstream policy quality unproven |
| `1150814608`: first K1 occurs inside held G&H | Same history | Same history | G&H, then paper-safe continuation | Identical guarded game | Full guarded root trace SHA equal |
| `2804067880`: G&H search finds Thunder Mountain and source attacks | Same history | Same history | G&H, Stadium, DCE, Volt Cyclone | Identical guarded game | Full guarded root trace SHA equal |

The key physical source starting-deal fingerprint in both quota-guarded arms of seed `2966203069` is `90500a63f484f538a2f34d236493038a54d04aa014d741497666c0399d93fc54`.

For key seed `2966203069`, **quota-only** took the first native Supporter as Guzma & Hala, and **quota + K1** took Cynthia & Caitlin. Both settled as ordinary first Supporters with quota 0→1, printed-native log correspondence and no subsequent forbidden Supporter. The full guarded decision-trace SHA-256 changed `d9fe0ddd141cc6bf58c55cee375133b8316c3bfdd5513177b036073f9ac4df6f` → `0596a2f1697133fd4ecfa490cdfcf65c432002355b2d021e63fafdeee3e25476`.

Across the three guarded pairs, **6/6** runs recorded `nativeSupporterQuotaQualified=true`, **zero** illegal Store-root dispatches, and an identical paired source initial-deal hash. Both nonapplicable control pairs preserved exact full guarded decision histories (including `7e9355803494b564303142ab0134b0c74b59384e32ca281ccf9c04398ed3fef2` and `103742687d5aede254b560829a8c50e1c58746eafe5858440abba101674d5e4a` respectively).

All six guarded arms ran **105 genuine native root actions**, with `finished=false` and `endReason=action-limit`. The K0-only guarded key seed had 8 source Supporter settlements and 8 suppressed owner proposals across its observed turns; the K1+quota key seed had 7 settlements and 7 suppressions. Different later Supporter counts reflect divergent play histories, not a controlled card-quality comparison.

## Important correction to earlier K1 narratives

The older K1-only developmental continuation on seed `2966203069` was paper-invalid. Its native observer demonstrated *two* separately settled, second-same-turn ordinary Supporters: Sidney after Cynthia & Caitlin on global turn 2, then Sidney after Gladion on global turn 14. Both left hand, incremented `supporterTurn` from 1→2 and produced matching native play logs. See the [native defect report](../twinleaf/agent34-native-settled-multiple-supporters.md) and [Agent 41's quota integration](agent41-paper-supporter-bilateral-native-gate-20261020.md). A K1-only, rule-invalid improvement must never be silently compared against a quota-guarded baseline.

This factorial repairs that specific inference gap: **the first Supporter choice really changes due to K1 even with the same paper quota enforced on both arms**. It is a discrete owner-visible decision change, not an observed attacking advantage, lock counter, game win, or measured win-rate change. The simple scripted policy still retrieves Guzma & Hala with Tag Call before abandoning the obsolete plan; whether another Tag Call target is available and strategically preferable at that native prompt remains untested.

## Qualification and next use

Keep the three selected seeds as development regressions for the **one shared bilateral owner-information-safe policy**. Preserve first-search K1 visibility, correct Supporter quota, and both-source-deal pairing. A subsequent candidate policy should compare the actual cost of the Tag Call target and the alternative Supporter action, and continue through authentic opponent turns and legal attacks. It must not gain credit for a policy decision merely because a paper-illegal continuation made the same action appear productive.

No official clock model or competent full two-player policy was certified here. **29/32** opposing 60s are recovered; **zero** competitively qualified games; no demonstrated **99.5%** fixed deck.
