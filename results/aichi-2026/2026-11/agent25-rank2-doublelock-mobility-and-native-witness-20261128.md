# Aichi rank-2 Vileplume/Stoutland Guzma: native line and mobility counterexamples

**Research scope:** paper Expanded and the 29 actually published original 60-card Aichi 2026 Top-32 lists (ranks 23, 25, 28 are not available). This is tactical opponent-policy research for one fixed candidate, **not** a win-rate certificate.

## Executed pinned Twinleaf evidence

[GitHub Actions run 46101020479](https://github.com/FlareZ123/experiment-01/actions/runs/46101020479) at commit efad52f6d7f539991f5eabc4ddc085448eac6a30 passed **six of six** Agent25 checks in its isolated native step in both seats. It selected source rank-2 Guzma BUS through a genuine cloned-validated legal-action frontier; native prompts physically chose the *unpowered* Shadow Rider Calyrex V from two same-print Bench copies, then source Stoutland BCR to become Active; both native ResolvePromptAction steps settled the correct physical instance IDs. The same policy correctly rejected this nominal Basic lock when a live opposing Latias ex SSP enabled no-cost Basic retreats. The enclosing workflow later failed on an unrelated preexisting test.

The six cases were a **staged supported-card board with an established, manually indicated Item lock**. They were not a naturally dealt source 60, did not prove Vileplume's passive native Item-lock effect, and are not completed games.

Native [run 46101473402](https://github.com/FlareZ123/experiment-01/actions/runs/46101473402) failed while loading the published full 60: the engine did not resolve the name Grand Tree SCR. Subsequent [run 46102592219](https://github.com/FlareZ123/experiment-01/actions/runs/46102592219) enumerated unresolved direct lookups Grand Tree SCR, Lillie's Determination MEG, and Pokémon Ranger STS. The existing research-owned adapter now makes an **explicit same-set-and-collector-number SCR 136** alias from paper Grand Tree to the native implementation named Great Tree, and quarantines genuinely unsupported paper cards as **nonplayable opaque deck/Prize identities** in localized tests only. Neither a quarantined proxy nor a naming alias proves full-card gameplay coverage.

## Printed mobility counterlines

Presence in the source list is **not** proof of a live escape. Effects can be inaccessible, absent from the board, exhausted, or suppressed.

| Printed mechanism | Published ranks | Lists of 29 | Applicable mechanic |
| --- | --- | ---: | --- |
| Latias ex SSP, Skyliner | 1, 10, 11, 12, 13, 14, 18, 19, 20, 21, 27, 30, 31, 32 | 14 | Live Ability grants Basics no Retreat Cost |
| Float Stone BKT | 1, 3, 5, 8, 9, 11, 15, 16, 19, 22, 26, 30 | 12 | Tool grants no Retreat Cost; older Pokémon Tools are **not Items** under current rules |
| U-Turn Board UNM | 4, 17 | 2 | Tool removes one Colorless from Retreat Cost; this may leave a positive residual |
| Jet Energy PAL | 2, 7, 15 | 3 | Attaching Energy from hand can switch a Bench Pokémon to Active |
| Mega Dragonite ex ASC, Sky Transport | 14, 20, 32 | 3 | Live Ability switches Active with Bench without Retreating |
| Minior PAR, Far-Flying Meteor | 30 | 1 | Benched Minior can switch into Active upon normal Energy attachment from hand |

**26 of the 29** published decks contain at least one printed mechanism in this **limited roster census**; only ranks 6, 24, 29 contain none of these particular cards. This does **not** establish that 26 can escape any particular lock. It demonstrates that a zero-Energy Guzma target plus Vileplume Item lock and Stoutland Supporter lock is not a general proof of immobility: Tools and ordinary Energy attachments survive these restrictions, and live Abilities provide other routes.

## Applied policy changes and remaining tests

- Native numeric Stage was incorrectly treated as the synthetic string BASIC. The rank-2 policy now uses publicly visible evolution printings to detect a Basic while Skyliner is live; the existing six native checks pass.
- A publicly live Sky Transport or Benched Far-Flying Meteor can defeat a supposed secure trap; conservative guards were added with explicit suppression countercases.
- U-Turn Board and Escape Board remove **one** Colorless Retreat symbol, Air Balloon removes **two**, while Float Stone grants no Retreat Cost. The policy now checks the remaining nominal cost rather than universally rejecting any Tool.
- Grand Tree scoring now requires a prior-turn, real source evolution-line Basic (Oddish, Lillipup, or Pidgey), not any prior-turn Basic. **92/92** actor-view scenario checks passed by directly executing the branch's unchanged JavaScript policy and unit scenario source. This is unit evidence only.
- Follow-through tests stage true published 60-copy deck identities and then contrast native Stoutland Supporter lock, Vileplume Item lock without fabricated flags, and Float Stone Tool-play/retreat escape. These **have not yet produced qualifying native results**. Their test source is at tests/2026-11/agent25-rank2-guzma-policy-samestore.native.test.cjs, with the fail-closed staging adapter at simulation/twinleaf/agent25-opaque-paper-card-staging.cjs.

**Decision consequence:** consider rank-2 Guzma lock a contingent high-tempo line, not a game lock merely because the gusted Pokémon has zero Energy. Compare the opportunity cost against other Supporter lines and explicitly model opponent switch channels.

**Data:** results/aichi-2026/full-decklists.json; results/aichi-2026/candidate-hood-shadow-rider.json; supplied English card pool and Advanced Player's Rulebook B-02, C-09, and C-19. No invented cards for unavailable ranks and no 99.5% evidence.
