# Predeclared source-rank2 Guzma & Hala resource-selection gameplay contrast

**Agent 24, 19 October 2026 UTC. Prospective diagnostic protocol before running the manual CI.** Fixed source Aichi rank-2 Vileplume Control against source rank-1 Shadow Rider. This is a policy-competence test, not a candidate-deck strength comparison or confirmatory statistical sample.

## Hypothesis and sole alteration

The rank-2 adversarial bot's opt-in `expanded-gh-root-search-v3` policy uses the **actual owner-deck G&H mode-one search prompt** to prioritize Bunnelby's `Technical Machine: Evolution PAR`, `Jet Energy PAL`, and `Artazon PAL` under the existing live-Store/K1 guard, instead of the generic arbitrary Tool and Energy choice. Its comparator is the already versioned `expanded-source-k0-stage-gh-v2` policy, which has the same K0/Stage/optional G&H corrections but generic G&H deck selection. The 60s, match seed, physical starter, Tool attack tactics and other source corrections stay fixed. No printed cards are injected or changed.

Existing reproducible runner: [`simulation/twinleaf/expanded-gh-search-pair.cjs`](../../simulation/twinleaf/expanded-gh-search-pair.cjs) on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This was present in repository before the test registration. Rank-2 source seat **A** versus rank1 B at seed `20261021`, then rank1 A versus rank2 **B** at seed `20261023`. Both arms have the same physically source-dealt initial 60s and first-mover position; no assertion that shuffles/draws remain paired after the first branch. Strict predispatch prompt validation, isolated policy RNG, and **350 root-action cap**.

## Primary complete source-game decisions to measure

Per actual source rank-2 physical seat, report (1) number of actual root `Evolution` attack declarations, (2) actual `Technical Machine: Evolution` Tool plays, (3) `Guzma & Hala` mode-one selections and owner deck choices, and (4) genuine attack followed by opposing meaningful action if it occurs. Include 350-action incomplete/capped runs, unchanged/null opportunity arms and first differing root decision without filtering failures away. Compare exact source hashes, observed first starter and available replay action-level traces.

**Possible positive mechanism:** v3 reaches a legal Bunnelby TM Evolution attack where v2 did not. A more conservative positive result is a new actual legal TM/Jet/Artazon G&H search, but even that does not establish a later attack or matchup strength. If neither arm actually selects G&H mode one before the cap, report a **null exposure**.

**Important bounds:** This entire two-seed comparison is retrospective mechanism diagnosis using source material and weak bot policy. It does not prove a strong Vileplume opponent, an accepted printed full-game policy, a clock-qualified outcome, matched postdecision draws, or the 99.5% objective. Agent41 owns the separate rank6/rank11 bilateral v2 comparison and is unaffected by this research.


## Registered development outcome: compiled complete source-game pair (08:15 UTC)

[Manual compiled CI 39220847479](https://github.com/FlareZ123/experiment-01/actions/runs/39220847479) **passed** all workflow steps, head `b1b3077756a25fb29762fd49ce29583bf3408ce9`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Artifact 12171622956](https://github.com/FlareZ123/experiment-01/actions/runs/39220847479/artifacts/12171622956), ZIP SHA-256 `759e754ac56bb6899c00ed0f98b71935a83c2096042c77f618d7e2b372af9ac8`. Four full physical-60 arms ran without reported engine errors. These seeds were selected in preceding exploratory work; this is a development result and contains **zero qualified competitive games**.

| Source-dealt actual position | Shared policy v2 | GH search-choice policy v3 | Earliest meaningful root divergence |
| --- | --- | --- | --- |
| rank2 seat A versus rank1 B; seed `20261021` | 323 root actions, global turn 48, **0 Evolution attack actions**, two TM: Evolution Tools played | Identical 323-action sequence and **0 Evolution attack actions** | **None** recorded |
| rank1 seat A versus rank2 B; seed `20261023` | 350 root actions, global turn 40, **0 Evolution attack actions**, **0 TM Tools played** | 299 root actions, global turn 31, **1 Evolution attack action**, one TM Tool played | **Ordinal 84, turn 7**: source v2 searches Capture Energy RCL, Counter Gain SSP, Artazon PAL; v3 searches TM: Evolution PAR, Jet Energy PAL, Artazon PAL |

The rank2 seat-B source actually started first in both treatment arms; deck hashes and first-turn identity agreed. On global turn **7**, both rank2 arms actually played G&H mode one and discarded **Tag Call CEC and Stoutland BCR** (printed singleton). The source v3 then actually **played Jet Energy**, **played Technical Machine: Evolution**, and made an **AttackAction('Evolution')**. Those actions did not occur on v2's same turn. This is a meaningful source-game line execution rather than merely a hypothetical evaluator choice. The v2 source did make other G&H plays, including a separate mode-one later.

**Crucial evidence limit:** `rank2EvolutionAttacks` in the existing parser counts actual accepted `AttackAction` dispatches, but this condensed output lacks an independently checked closed prompt-chain evolution-board delta or an actor-bound next opposing root. It therefore establishes **play and attack dispatch**, with the printed effect and opponent response still unqualified. `finished-engine-game` is an engine terminal label; nothing here certifies its winner, competitive policy, human clock or full game rules. After the two policies diverge at root 84, differences in later draws, shuffles and inventories invalidate claims of paired counterfactual continuation. The other starting seat showed no policy intervention opportunity, demonstrating why intervention exposure must be included in outcome denominators.

The tactical implication is tightly scoped: **the actual G&H selection of TM and Jet made a Bunnelby Evolution attack reachable in this one source-dealt game where the generic resource chooser did not**. This provides a reproducible negative control for rank2 adversarial policy completeness. It is **not evidence** of an improved win percentage for either player's fixed deck or 99.5% target success.

A deliberately retrospective public attack effect and opponent-response observer can now verify the root-84 sequel without a fresh claimed statistical sample. The original archived artifact remains intact.
