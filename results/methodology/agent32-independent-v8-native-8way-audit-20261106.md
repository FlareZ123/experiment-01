# Independent owner-root audit: v8 original four-rank native attempts

**Agent32, 6 November 2026. Independent examination of archived actual pinned Store receipts. The result is developmental; zero paper-qualified games.**

## Which v8 run actually executed

The initial [v8 run 42148271259](https://github.com/FlareZ123/experiment-01/actions/runs/42148271259), checkout `548c9d54883cce7a227af20872c4a324f3394576`, returned **zero** actual trial rows against eight registered IDs, failing `0 !== 8`. This was a real veto, **not eight censored games**. The earlier v8 runner omitted `allowAdditionalOriginalSourceRanks:true`, while its existing authenticated-source admission function admitted only historical ranks6/11 by default. Agent36 had already committed the missing explicit opt-in as [a69c007387](https://github.com/FlareZ123/experiment-01/commit/a69c007387) at 02:08:25 UTC, after the failing checkout; [641dda832e](https://github.com/FlareZ123/experiment-01/commit/641dda832e) then proved the rank admission wiring. That prior correction was discovered by comparing the pinned old and current source, **not** invented during this audit.

I dispatched the existing `twinleaf-completion.yml` manual `abort_provenance_only:true`, `include_agent36_selected_v4:true` job at the later checkout `46d6775ab50c...`. It ran the full v4/v6/v7/v8 selected branch, and the specific eight-arm native-v8 test **PASSED** in [run 42228565414](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414). The exact original frozen v8 eight IDs, seeds and physical seats were unchanged; the **executed code revision was not identical** to the original 02:07 preflight-aborted checkout and must be reported separately.

I downloaded [v8 artifact 13506238955](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414/artifacts/13506238955) and independently verified the UTF-8 `issue25-steward-v8.json` byte SHA256 against its accompanying sidecar:

`d30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0` (505,775 bytes)

The eight preregistered IDs exactly match the eight returned IDs. Every row's 88–128 accepted-root array matches the recorded nontruncated count and own JSON ledger SHA256; every root ordinal is consecutive. For **all 20** recorded real Store attack declarations, the declared root ordinal exists, the root's physical source seat and turn match, and its accepted action matches the declaration's trigger action. These checks independently reproduce the core of the existing [Agent36 archived-root audit](../../simulation/evaluation/agent36-v8-original-field-archive-audit.cjs). They do **not** imply all aborted matches exposed their full attack traces.

## Results by actual original rank and fixed contender

| Registered original | Fixed contender | Native disposition | Accepted roots | Source Store attack declarations | Completed prompt chains |
| --- | --- | --- | ---: | ---: | ---: |
| 6 Iron Thorns | Rank1 champion | Censored at cap | 128 | 2 | 2 |
| 6 Iron Thorns | New Moon | Engine-aborted | 118 | Unknown | Unknown |
| 11 Garbodor / Absol | Rank1 champion | Censored at cap | 128 | 13 | 13 |
| 11 Garbodor / Absol | New Moon | Engine-aborted | 88 | Unknown | Unknown |
| 1 Shadow Rider | Rank1 champion | Engine-aborted | 98 | Unknown | Unknown |
| 1 Shadow Rider | New Moon | Censored at cap | 128 | 5 | 4 |
| 3 source | Rank1 champion | Engine-aborted | 106 | Unknown | Unknown |
| 3 source | New Moon | Engine-aborted | 93 | Unknown | Unknown |

Thus **8/8 attempts are real and identity-verified**, with **3 root128 censored** and **5 native engine-errors**, **zero terminal games**. In the three available closed-source-attack traces, there are **20** attack declarations, of which **19** are settled and have a same-epoch subsequent opponent root. In each of the five error rows, complete source-attack declarations remain **unknown**; the absence of a closed trace cannot be interpreted as zero attacks.

### Consequential actual Store observations

- **Rank6 Iron Thorns versus champion, source seat0:** at global turn17/root85, the actual `Volt Cyclone` attack moved its Active's Double Colorless Energy to a Benched Iron Thorns ex and Knocked Out a 160-HP Girafarig, giving the source **one native Prize** (6 to 5). The defending Active was promoted to Latias ex. The next opponent turn18 first returned a genuine `PassTurnAction` root, so this witness does not demonstrate a competent reply. At turn23/root109, another settled `Volt Cyclone` dealt 140 damage to Latias ex without taking an additional Prize. This is a genuine native effect/Prize transition, with paper legality and policy still unqualified.
- **Rank11 original versus champion, source seat1:** the source's active Squawkabilly ex used its printed **Motivate** (20 damage) on global turns2,4,6,8,10,12,14,16,18 and again on 20,22,24,26. By turn18 the defending Dialga-GX already had 160 damage; the ninth Motivate was enough for a native two-Prize Knock Out (source Prize count 6 to 4). The thirteen attacks are **not thirteen strategically distinct successes**. The candidate took no efficient defensive or attacking line in this recorded window, demonstrating opponent-policy weakness.
- **Rank1 original versus New Moon:** the four settled `Red Knuckles` attacks on turns16,18,20,22 gave no Prize. A fifth declaration on turn24/root125 did not settle within the 128-root cutoff. Treat the fifth effect as **unknown**, not a zero-damage success.

Across the observable settled attack traces, the **source took three native Prizes**, distributed one in rank6 and two in rank11. Native Prizes and same-epoch next actions are strictly narrower than paper-game victories.

### Physical coupling veto

Source-deal fingerprints are identical across the two contenders for rank6, rank1, and rank3, **but differ for rank11** (`447db766...` versus `7b5caecb...`). Both rank11 arms use the same seed in the registration; a shared random seed alone therefore does **not** justify calling every pair an identical physical source opening. Retain all eight attempts in a prospective analysis without filtering on matching physical openings after treatment.

## Release consequences

The 8/8 identity gate is repaired at this later code revision, exposing genuine operational limitations previously hidden by the zero-row return. Five decoder/engine failures share the native error SHA256 `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. The selected v0 outer catch also reports `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` even though all eight trial rows are returned; **this is a caught outer exception and must not be mislabeled universally as a preflight failure**.

Next meaningful validation is to restore owner-safe decisions at the observed failing Store roots, then run **independent held-out full 60-vs-60 games** with authentic source actions, meaningful opponent counterplay, paper print and payment verification, setup choices and the event's 25-minute clock. Do not turn a native 20-damage attack that eventually takes two Prizes after nine uses into evidence of an optimal opposing policy.

**Conclusion:** The original rank1/3 admission failure is repaired in the newer code. The refreshed sample is valid as eight bounded developmental **attempts** and 19 recorded settled source attacks. There are still **29/32 exact original lists, zero qualified games, and no 99.5% win demonstration**.
