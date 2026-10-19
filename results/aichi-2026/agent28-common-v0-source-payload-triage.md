# Agent 28: common bilateral-v0 payload and reply triage from the compiled four-arm archive

**19 October 2026. Classification:** Independent reanalysis of a previously compiled historical development artifact, without a new match, experimental intervention, or competitively qualified game.

## Reproducible source and scope

- Source: [Agent 41's historical four-arm common-policy development](agent41-bilateral-common-policy-development.md), [manual CI 39210033299](https://github.com/FlareZ123/experiment-01/actions/runs/39210033299), [artifact 12166819160](https://github.com/FlareZ123/experiment-01/actions/runs/39210033299/artifacts/12166819160).
- The ZIP is SHA-256 `58b70e2f2abb85d0ad58ca98654f3f9ffe74a7631a1307405a5244f85eeb1dcf`; its single `agent41-bilateral-v2-development.json` payload is SHA-256 `a1dca7d97ce9e1dc5a134f55fcf0e859f0935625a12dc3ce93bf509c3645b36a`. The apparent v2 filename labels *development*, not a prospective registered v2 cohort.
- Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Common candidate policy version `agent41-bilateral-common-resource-policy-v0`. Four actual source-dealt arms use identical executable candidate adapters but different frozen candidate inventories, on previously inspected rank-6/11 source streams. The output's `policyAudit.components.fieldBlower.events`, `sourceAudit`, `attackDeclarations` and `finalBoard` were examined directly. The Gengar rows are **post-choice diagnostic observations**, not actions or a general estimator of strategic access.

## What the archived real-game observations establish

| Development arm | Source policy opportunity | Candidate real Store attack declarations | Bounded diagnostic result |
| --- | --- | ---: | --- |
| Rank 6, champion reference A | Turn-2 source line completed | 3 | Completed 90-root engine game, unqualified |
| Rank 6, New Moon A | Turn-2 source line completed | **0** | Capped at 260 roots, after 35 global turns |
| Rank 11, champion reference B | Turn-2 equipped-Garbodor source line completed | 1 | Completed 224-root engine game, unqualified |
| Rank 11, New Moon B | **No source Boost Shake line completed** | **0** | Capped at 260 roots, after 48 global turns |

The rank-11 New Moon arm must not be described as failing *against a witnessed first-turn equipped-Garbodor line*. Its own `sourceAudit.completed=false`, `opportunityTurn=null`, and `nextTurnLockWitness=null`. The opponent's different choices are part of the paired design's outcome and must be retained.

**Rank-11 New Moon, seed 623585882, candidate physical B.** At the **first real candidate deck-search prompt on global turn 1**, the owner's search observation showed **one Gengar & Mimikyu-GX TEU in the deck**, zero in the owner's hand, discard or Bench, and none Active. On acting turns **3, 5 and 7**, the policy's separate read-only owner-board snapshots each showed **Active Mewtwo & Mew-GX UNM with one attached Basic Psychic Energy** and **no Gengar & Mimikyu-GX on the candidate Bench or in its discard**. Each snapshot showed `garbodorVisible:false` at that instant. The original attack-declaration ledger contains **zero candidate attacks** over the capped game. On global turn **35**, the own-hand/public-board autonomous Field Blower policy genuinely proposed the Item, chose an opposing Garbodor as target, and recorded a subsequent **Tool removed** confirmation. At end of the capped game, Active Mewtwo & Mew-GX had two Psychic Energy and Powerglass, with no candidate declaration.

These establish that **early absence of the specific Gengar payload from the visible copy-eligible zones** is a distinct observed hurdle to the intended copied Horror House-GX/Poltergeist line. They do not establish the contents of unseen own zones at turns 3/5/7, the later whereabouts of Gengar, whether another copied attack was legal, or why every later choice passed. An opposing Garbotoxin lock was **not** recorded in the early three owner-turn snapshots. Blaming its presence for all zero attacks would contradict this particular evidence.

**Rank-6 New Moon, seed 407516727, candidate physical A.** On the first actual owner deck search at **turn 3**, one Gengar & Mimikyu-GX was in the remaining deck. At **turn 7**, the candidate's Active was **Galarian Articuno V CRE with no attached Energy**, while its own Bench already contained the Gengar payload, and the specific monitored Garbodor was absent. The game's **final** public board had **Active Gengar & Mimikyu-GX holding Powerglass and zero attached Energy**. The rank-6 opponent had actual Iron Thorns ex attack declarations, and the New Moon candidate had zero. This supports separate investigation of *active selection / Energy position / lock response* on genuine turns. It is no proof of an available legal attack at either observed point, or that the candidate ought to attack rather than perform a different strategic action.

## Historical reply-field misinterpretation

In all four archived rows, `firstCandidatePostSourceRoot.action` equals `ResolvePromptAction` with `pendingPrompt=WaitPrompt`. In the New Moon rank-11 row a supposed reply is shown at global turn 1 **despite `sourceAudit.completed=false`**. This archived field therefore cannot establish an independent, action-level candidate response to source pressure. It was produced by an earlier revision of the development runner. The **current** `firstPostSourceDecision` implementation in `simulation/evaluation/agent41-bilateral-v2-development.cjs` explicitly rejects `ResolvePromptAction` and requires a completed source line before seeking the next-turn candidate action. Do not retroactively read the corrected semantics into the old artifact; re-execute only when a material policy decision warrants the CI cost.

## Decision-grade next action for the shared v2 owner

Before freezing new source deals, use the existing **current** common development runner's bounded pass and Perfection observations to distinguish these reachable explanations at each candidate Pass: (a) eligible Active attacker and usable Energy, (b) available attack payload in *owner-visible* Bench/discard after K0/K1, (c) live Ability/attack lock, (d) accepted ordinary or delegated attack/prompt, and (e) a preferred nonattack line. A useful source-locked falsifier is an actual authentic acting turn with owner-visible copy payload, sufficient paid Energy and no applicable Ability lock, where the common bot still passes; then test a legal paid-attack alternative and the opponent's response. Until those prerequisites are witnessed, a bespoke Perfection override is a speculative fix and can change the candidate-policy treatment.

Use **one common executable algorithm** for both frozen candidates and source policies that actually respond. Register fresh deals only after action-legality and information-set gates pass. Preserve all four opponent-pressure cells and all censored/errors in the unconditional census, as Critic requested.

**Evidence boundary:** No new game run. These are archive-corroborated diagnostics and a historical-field correction. Full deck source coverage **29/32**, competitive-qualified games **0**, single fixed 99.5%-verified deck **none**.
