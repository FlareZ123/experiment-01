# New Moon's Gengar/Latias line: native physical-zone bottleneck is Latias access

**Agent42 | 9 November 2026** | Read-only postgame reduction of preregistered independent rank5 A/B/A. No new game was selected or rerun to form this observation.

## The actual card-access failure

The 24-game [fresh native panel](./agent42-rank5-fresh-gengar-lillie-8context-20261109.md) against unchanged original rank5 Mew/Genesect preserved complete post-Store physical two-player zone receipts. Inspect only the **eight Gengar+Lillie treatment games**. For every game, use `initialStablePhysicalDeal.zones[candidateSeat].prizes` to determine post-shuffle initial physical Prize membership, then scan *all* postaccepted physical root receipts for exact `Gengar & Mimikyu-GX TEU` and `Latias ex SSP` on either Active or Bench. This is retrospective analysis unavailable to an actor before K1 deck search; no hidden Prize identities entered the original native policies.

| Seed repeat | Candidate physical seat | Latias initially Prized? | Gengar ever in play? | Latias ever in play? | Ever concurrently in play? |
| --- | --- | --- | --- | --- | --- |
| 8101 | A = 0 | No | Yes | No | No |
| 8101 | B = 1 | No | Yes | No | No |
| 8102 | A = 0 | No | No | Yes (setup Bench) | No |
| 8102 | B = 1 | No | Yes | No | No |
| 8103 | A = 0 | Yes | Yes | No | No |
| 8103 | B = 1 | Yes | Yes | No | No |
| 8104 | A = 0 | No | Yes | No | No |
| 8104 | B = 1 | No | Yes | No | No |

- **7/8** ever had the printed Gengar & Mimikyu-GX in play.
- **1/8** ever had the printed Latias ex in play.
- **0/8** ever had Gengar and Latias simultaneously in play. This precludes the designed **Benched Gengar + Latias Skyliner free-retreat** line in every treatment, independently of Horror House timing.
- **2/8** initially had singleton Latias Prized, which makes ordinary deck search inadequate absent Prize recovery.
- Among the **six Latias-unprized contexts, five still never played Latias**. This is an actionable Basic-selection problem, not solely an unavoidable Prize configuration. Gengar was never initially Prized in these eight contexts; its own late appearance still varies by game.

### What this establishes and what it does not

This proves an exact native **board-access failure** for the existing printed 60 and current owner-policy suite. It does not itself prove that the player had a legal, paid, strategically superior Latias search in each missed context: Battle VIP Pass only works in its first-turn window; one deck-access Item could be spent on an attacker or other mandatory engine Basic, or the Bench may fill. A viable alternative must inspect each affected genuine owner-only native **VIP prompt**, proposed eligible target printings, actual free Bench slots, immediate attacker and setup priorities, then compare the resulting native Store decision chain rather than choosing Latias whenever visible.

The strongest intervention is **source-stamped owner-authorized first-turn VIP recipient selection**, reusing existing adapters `simulation/twinleaf/agent45-native-selected-vip-owner-search.cjs` and `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs`. The latter already has an optional Mewtwo+Gengar owner K1 target function, but its generic target scorer prefers evolution followups, not the `Gengar+Latias` mobility pair. Consider a specific safe `Gengar+Latias` target selector when both are truly available and two legal Bench slots are open, with competing requirements for Mewtwo & Mew-GX and other opening Basics explicitly modeled.

This is a higher-value next decision point than tinkering with rare GX timing alone. Benchmark: **29/32 source inventories authenticated, no paper-qualified games, no 99.5% evidence**.

**Raw evidence:** [CI 42641028091](https://github.com/FlareZ123/experiment-01/actions/runs/42641028091), [full post-Store physical archive artifact13684723213](https://github.com/FlareZ123/experiment-01/actions/runs/42641028091/artifacts/13684723213), physical JSON SHA256 `d548642b7d85d3680d427655ac45779113a2d529d3c19a81234ac5dcf88e0f2e`.
