# Rank-15 two-Vileplume Bench reservation: source policy made one recorded deferral, no dual lock

**Agent 36, 19 October 2026. Evidence: compiled eight-deal source-60 development-policy intervention. Zero qualified competitive games.**

## Hypothesis and physically aligned experiment

The preexisting [original-deal policy test](agent36-rank15-bunnelby-original-deal-policy-result.md) found five of eight source deals initially had unprized dual-Vileplume ingredients, yet the generic and improved Bunnelby policies never placed BUS Vileplume in play. A selected authentic source board in an eligible deal already had five Benched Pokémon and only one Oddish stage line. This suggested over-Benching secondary Basics could preclude the two independent Oddish/Gloom Stage-2 chains.

The new [source-only opt-in Bench reservation policy](../../simulation/twinleaf/rank15-vileplume-bench-reservation.cjs) observes the source player's face-up Active, Bench and own hand, **without accessing hidden deck or Prizes**. When Bunnelby is present, before global turn 11, it can defer a generic `PlayBasicTactic` choice that consumes the last Bench spaces needed for two Oddish/Gloom/Vileplume evolutionary positions. It leaves Oddish and non-Basic card actions eligible and continues with later ordinary tactics. This is a developmental counterpolicy, not a paper rules override or fully validated tournament player.

The [eight-stream replay](../../simulation/twinleaf/rank15-vileplume-bench-reserved-source.cjs) preserved the source's original 60, the unchanged New Moon Lockbreaker candidate 60, original physical seats, all eight original physical seeds and the same Bunnelby K0/K1, TM target and Guzma & Hala policies. It checked each real first-turn full-zone digest, deck SHA-256 signatures, actual first player and initial Prize prerequisite classification against [precommitted anchors](agent36-rank15-original-deal-anchors-v1.json). **All eight were exact original physical deal matches; none failed or was excluded.**

**Compiled CI [39248340474](https://github.com/FlareZ123/experiment-01/actions/runs/39248340474) passed**, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full [source-board and policy archive 12184332652](https://github.com/FlareZ123/experiment-01/actions/runs/39248340474/artifacts/12184332652), independently verified ZIP SHA-256 `0f2cd583a35a0626fe33a8906b89de51545df8328f2d0935b11a4f5dd99f9ec0`.

## Matched-source observations

| Original repeat / candidate seat | Initial dual-Prize prerequisites | Enhanced Bunnelby AOR / BUS | Bench-reserving AOR / BUS | Source Bench ever full with fewer than two Stage lines? |
| --- | :---: | --- | --- | :---: |
| 0:A | Yes | none / none | none / none | Yes, global turn 36 |
| 0:B | Yes | none / none | none / none | Yes, turn 1 |
| 1:A | No | AOR turn 27 / none | AOR turn 27 / none | Yes, turn 25 |
| 1:B | No | none / none | none / none | Yes, turn 20 |
| 2:A | Yes | none / none | none / none | Yes, turn 13 |
| 2:B | No | none / none | none / BUS turn 17 | Yes, turn 17 |
| 3:A | Yes | AOR turn 45 / none | AOR turn 45 / none | Yes, turn 31 |
| 3:B | Yes | none / none | none / none | Yes, turn 12 |

- Source AOR appeared in **2/8** in both policies; the additional reservation source policy showed BUS in **1/8**, on **repeat 2 / candidate seat B**, where **both AOR copies were initially Prized**. In that stream BUS alone cannot establish the two-variant initial-Prize-eligible lock. **Zero of eight** source boards showed simultaneous AOR plus BUS; **zero** attacks called `Evolution` appeared in the native attack-declaration log.
- The source Bench became fully occupied while fewer than two Stage-line positions were present in **all eight** independent-deal runs. This is a necessary local board-space bottleneck at that observation, not proof that future repositioning was legally impossible.
- The early Bench-reservation wrapper logged **one candidate deferral in all eight replays**, at global turn 9 in the same `2:B` stream: proposed `Buneary M2`, with one free slot and one Stage line, alternative `PlayCardAction`. The wrapper's event list is not independently restricted to real Store decisions and **may include speculative bot scoring**. Treat this as a hypothesis to replay at the root; it does not establish that the deferral caused the later BUS appearance.
- A double-chain occupied board occurred in only **1/8** (`3:A`, first global turn 35), but even that did not establish BUS or the dual lock. The controlled reservoir of realistic turn-one pressure therefore remains absent.

## Disposition

This policy is **not a solution** to rank-15 opponent qualification. Reserving a vacancy only when the generic bot proposes a non-Oddish Basic during the first ten turns barely changes the live candidate workload and does not induce the missing TM Evolution declaration. It may also sacrifice important Fan Rotom/Tatsugiri/Budew setup in other untested starts. The one BUS appearance in a single incompatible-Prize stream is interesting for mechanical reachability but offers no competitive-strength inference.

A useful next branch would characterize the true root early turn where an **Oddish** can be Benched, which search connector was consumed, whether Bunnelby is Active with TM attached and payable Energy, and the Stage2 selection when a Gloom actually survives. A rank15 source should be promoted as a credible lock opponent only after it executes a genuinely legal early lock line and opponent continuation in representative unselected physical deals. Repeating the same eight capped hands under arbitrary resource changes without this qualification is a poor route to the fixed-deck objective.
