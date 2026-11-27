# Rank26 defense policy: opening risk by backup and safe first-turn board

Agent16, 2026-11-27. Both candidates remain unchanged fixed 60s. No native games, CI dispatch, worker edits, or nomination. This is a narrow tactical geometry and resource-access study, not matchup win-rate evidence.

## 1. Exact backup-class exposure

`python backup_classes.py` enumerates valid opening-seven composition and net source-only mulligan bonuses using exact rational probabilities. Same 14 Basics and withheld classes for both frozen profiles. Under current Agent46 successor setup policy (withholds Dialga, Lele, Radiant; fragile Girafarig/Mimikyu/Marshadow exception for Lele), rank26 12 Basics:

| Current singleton class | Probability per opening | Maximum equal-32 field gain if prevented, assuming every such rank26 opening loses |
|---|---:|---:|
| Forced singleton, no backup | 37.50679602% | not avoidable by placement |
| Dialga best available backup | 6.28725576% | 0.196477 pp |
| Lele best available backup | 3.64811562% | 0.114004 pp |
| Radiant only available backup | 4.85157230% | 0.151612 pp |
| Total avoidable | 14.78694368% | 0.462092 pp |

Dialga placement does not sacrifice an entry trigger; Lele loses Wonder Tag, Radiant loses Climactic Gate. Do NOT treat unconditional backup as a free improvement: 31 other ranks, each potentially penalized. For a particular backup class c, the field improvement is sum over ranks of weight times P(c|rank) times conditional change in win probability, not the number of averted singleton states. Even if rank26 converts every Radiant-only singleton, its benefit alone is only 0.151612 percentage points under equal-rank weighting. No assumption of actual conversion or trigger-loss penalty. The model excludes other possible donk decks until identified, and uses existing setup-worker observation: no revealed opponent mulligan card information consumed. Targeted use of actual publicly revealed opponent information would need owner-approved observation and policy integration.

## 2. Candidate goes first: Bunnelby double attack

Rank26's first player can attack once with Meloetta's Debut Performance. When rank26 goes second, Bunnelby's Omega Barrage can attack twice with attached TM Crisis Punch. After exact donation of five Prizes, each attack can deal 280. Allow arbitrary initial gust target (Counter Catcher), then adverse defender promotion. With these exact frozen profiles and full-health board, the immediate two-hit elimination is impossible if there are at least three Pokémon in play, or at least two with one healthy 320 HP VMAX. There is only one vulnerable 3-Prize T&D-GX, no two vulnerable 3-Prize targets for a two-KO six-Prize win; VMAX have 320 HP. Source own-damage effects do not damage candidate's already-established board. This is immediate Crisis Punch geometry, not full-game safety.

`first_turn_defense.cjs` implements a constructive, public-information first-player setup subpolicy: prioritize held ordinary Basics, use Fog Crystal (Psychic only), Mysterious Treasure or Quick Ball with real discard cost, Hisuian Heavy Ball, Battle Compressor + Night Stretcher, Forest Seal Stone on V, Radiant Gate. Basic/Radiant choice before search never uses actual deck/prize contents; after legal search, exact inventory is knowable. Latias ex SSP76 is Psychic and its Skyliner survives own active Wobbuffet Bide Barricade; Radiant Eternatus is Dragon and Gate is suppressed while own Wob is active. Uses standard initial setup, source-only mulligan bonus, candidate first turn draw, no first-turn Supporter. Retains entry triggers in hand until the turn. Does not model subsequent turns, field policy costs, or claim current Agent46 worker already takes these actions. Stops when safe geometry reached (a real candidate policy can continue its normal engine setup). Card conservation checked per deal.

```
node first_turn_defense.cjs '{"start":200000,"trials":100000,"profile":"lockbridge","oracle":true}'
node first_turn_defense.cjs '{"start":200000,"trials":100000,"profile":"hood","oracle":true}'
```

| Profile | Safe | Unsafe singleton | Unsafe double | Gate used | Additional failures recoverable by limited offline oracle |
|---|---:|---:|---:|---:|---:|
| Hood | 85,074/100,000 (85.074%) | 3,911 | 11,015 | 17,232 | 0 |
| Lockbridge | 84,793/100,000 (84.793%) | 3,911 | 11,296 | 16,492 | 0 |

The oracle is an offline comparator, not a live policy: knows true remaining deck/prize composition, enumerates starter, basic placement, search order/targets and discard payments within the listed direct-access action set. Initially found 11 additional Lockbridge recoverable failures; fixed premature Gate:0 by placing ordinary held Basics first, checking legal search-revealed VMAX availability when possible, and preferring V for FSS if no VMAX available. Final zero recoveries is on the same development seed range, not a proof of global optimality or independent heldout performance. No native game evidence.

If both sides choose first and candidate uses full backup rule, rank26 gets first half of games (forced-singleton risk 37.5068% conditional); when candidate gets first, remaining modeled unsafe geometry ~15%. Naively averaging these **opportunity** rates gives about 26.35%, versus 52.29% selected singleton risk when candidate always chooses second and rank26 always chooses first. This is not a loss-rate estimate, since the source policies, conditional combo success, and other 31 matchups are not determined. Do not change global first/second preference without comparing actual field costs.

## Integration recommendation

Agent46/31: treat the three backup classes separately, preserve high-value Gate trigger where justified by field tradeoff, and add a first-player rank26-recognized (public board after setup) safe-geometry target. Do not expose hidden source rank or deck identity. When choosing first, source can go second and threaten double Punch; do not equate two vulnerable Basics with safety. Evaluate setup policy alternatives on identical physical deals only after owner authorization. Agent21: double-attack target geometry in existing tactical handoff remains valid; no parallel native runner.

Sources: exact frozen candidate lists in `results/aichi-2026/candidate-hood-shadow-rider.json` and `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`; rank26 original in full-decklists.json; card-list snapshot printings identified in prior README. Exact backup code 1319448321ebac6273d332f2005b584869a8b076, defensive planner d1baf112b2a64198ffc314da71a6e0e845244813.
