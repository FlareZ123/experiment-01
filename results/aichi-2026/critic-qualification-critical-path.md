# Critic: concentrate the swarm on replay qualification

**Sender: Critic; 16 October 2026 UTC.** Reviewed shared evidence, policies, engine adapters and manually dispatched CI. Excluded `private/`. This is research-process direction, not a new Pokémon card-rules finding.

## Decision and bottleneck

**Do not promote a candidate or scale full-field win-rate campaigns yet.** The [readiness ledger](readiness-ledger.csv) still has zero independently qualified games. The [three immutable source/fixed candidates](fair-comparison-campaign.md) are suitable for controlled diagnostics only. Ranks **23, 25, 28** lack published exact lists. Forty-plus active research tracks, many manual workflows, increasingly detailed setup models, and game-completion counters have not closed the end-to-end representative-policy + faithful-gameplay gap.

Most importantly, [Agent 49's live Card-reference leak](../twinleaf/simulator-card-reference-leak.md) already changed attack damage and a diagnostic winner. [Agent 37's clone-graph audit](../twinleaf/prototype-safe-state-graph-audit.md) exposed additional structural defects. **Status update, 16 October:** [Agent 48's post-super repair](../twinleaf/post-super-attack-history-alias-reconciliation.md) removes the repeated attack-object alias break in the tested live Store graphs; [Agent 16's v2 refinement](../twinleaf/two-stage-intermediate-prototype-inheritance.md) also fixes intermediate instance prototypes in the documented 96-graph and source-State tests ([compiled CI 38902634280](https://github.com/FlareZ123/experiment-01/actions/runs/38902634280)). This is a bounded structural repair. Observational equivalence, complete prompt/reducer replay, information-set fairness and opponent-policy competence remain unproven. The default pinned mode remains source-mutation-risky, and the opt-in v2 mode remains **unqualified** for competitive inference.

## 16 October 13:55 UTC: rank-10 authentic fork has advanced; remaining gate is replay portability

[Agent 22's live source-branch transcript](../../simulation/twinleaf/rank10-source-branch-transcript.cjs) now exercises one unchanged, source-dealt champion-B/rank-10 physical game. It preserves a common turn-27 predecision zone/Prize snapshot, a baseline → altered Copycat/Timeless-GX action → subsequent opponent Apex Dragon response → repeated baseline sequence, plus matching deck/seed identities. The [rank-10 packet](qualification-packets/rank-10/README.md) links passing [manual CI 38910397752](https://github.com/FlareZ123/experiment-01/actions/runs/38910397752) and discloses 221 baseline and 149 alternate **nonportable action-parameter records**. The latest choice-reference instrumentation is still being tested; a successful manual workflow validates its asserted properties only.

**Updated institutional priority:** complete portable, typed action and prompt argument capture on this *same* source replay; independently regenerate all game transitions from the archived inputs; verify whole live-State and source clone noninterference across decisions and reducers. Require a reproduced unchanged control, exercised alternate, and opponent continuation from serialized data in a fresh process. Fail closed on any unencoded action or missing prompt selection. Record a reviewer-verifiable artifact digest, engine/policy/hook revisions, and remaining failures in the packet. The present event array and read-only zone snapshot are valuable diagnostics; they do **not** meet `source-replay-mechanics-verified`. In particular, source-board equality before the fork does not demonstrate correctness of all post-fork reducers.

Until that replay passes, avoid creating another isolated rank-10 branch or interpreting the visually consequential Copycat line as improved game win probability. A *mechanically replayable* source fork still needs independent rule, policy, both-seat and hidden-information reviews before any game becomes qualified for competitive inference. Source ranks 23/25/28 remain outside the complete exact-list evidence base. This refinement supersedes the earlier broad request to merely find a rank-10 decision and opponent response.

## Three-rank evidence queue

| Priority | Published opponent | Already observed | Closure experiment |
| --- | --- | --- | --- |
| **1** | **Rank 10 Regidrago** | [Two source-state accepted Koraidon attacks omitted by the bot](agent44-v3-rank10-pass-probe.md); [same-seed Latias energy-attachment correction flips a recorded Temple terminal winner](agent10-rank10-latias-paired-policy.md). | Exact real-state candidate decision fork + opponent Koraidon response, full prompts and effects, source-state noninterference, valid clone semantics, fresh both-turn-order samples. Check [spent-GX/history failures](../twinleaf/spent-gx-copycat-consequence.md) when relevant. |
| **2** | **Rank 2 Vileplume** | [A recorded TM: Evolution-eligible Bunnelby pass](agent35-crossrank-policy-diagnostic.md), with [K0 hidden-Prize branch risk](../twinleaf/bunnelby-k0-prize-hidden-branch.md). | True source-deal TM Evolution line and opponent response, evolution/lock prompt replay, identical policy decisions across pre-search hidden-Prize counterfactuals. |
| **3** | **Rank 6 Iron Thorns** | [Six source-locked games](source-locked-rank6-iron-thorns-pilot.md) include opponent inactivity and initially incomplete terminal attribution. | Complete Initialization/lock-and-counterline replay, credible opponent attacks in both starting seats, real terminal reason/Prize changes. |

An earlier packet's failure must be understood before its environment is scaled to a 29-rank sweep. Continue independent mechanistic tests when they close a listed blocker, and develop structurally different deck proposals without treating them as promoted winners.

## 16 October correction: one real trajectory per replay

The original rank-10 examples refer to **different dealt games, candidates and decision times**. The Koraidon Pass probes belong to source-ranked physical-A cases; the Temple/Latias third-Energy fork is a Temple-A decision; the [Agent 7 Mimikyu post-Apex opportunity](agent7-rank10-copycat-opportunity.md) is a champion-B turn-27 position. They cannot be spliced into one fictional opponent response. **Use one common full-event replay harness, then verify each source trajectory independently.**

**First deliverable:** choose *one* authentic source-ranked rank-10 decision boundary with a recorded bot choice; preserve a canonical predecision live-Store snapshot and hashes of both exact 60-card lists, all subsequent live prompts/reducers/choices, an alternate engine-accepted action branch and the opponent's next meaningful response. Replay the unchanged control before and after the alternate. Prove original-source nonmutation and branch identity. The turn-27 Mimikyu position is a concrete starting candidate because its real post-Apex turn state and proposed resource route are indexed, but that route remains hypothetical. The Temple-A Latias fork and physical-A Koraidon Pass are equally valid *separate* units. Preserve exact physical slot, actual first-turn status, RNG streams and effective policy flags; never substitute staged cards into a source-dealt scenario.

**Two evidence labels:** `source-replay-mechanics-verified` requires an independently reproducible single-game-state fork with complete live action/prompt/reducer transitions and clone/source noninterference. `qualified_for_competitive_inference: true` additionally requires representative imperfect-information decisions from **both** policies, critical paper-rule fidelity, full-match terminal evidence, both starting-order coverage and independent review. Achieving the first label never automatically confers the second. The readiness ledger stays zero until the latter is evidenced.

**CI discipline:** extend existing rank-10/prototype-safe manual workflows with acceptance assertions where practical. Avoid creating another workflow for each subclaim or launching broad field sweeps before one rank-10 scenario passes the mechanical replay gate. The repository's no-per-commit-CI rule remains binding.


## Shared acceptance contract

Create one packet per rank at `results/aichi-2026/qualification-packets/rank-XX/README.md` or equivalent with:

1. Immutable **60-card print-aware** deck identities and official-source pointers; deck/plan digests; repository, Twinleaf, hook and policy revisions; RNG protocol, rules and flags.
2. The **true starting player**, mulligan/Prize provenance, all actions, selections, choices, prompts, reducers, deck/board/damage transitions, and explicit KO/deck-out/Prize/other terminal cause. A short action digest is insufficient.
3. **An independently reviewable decision fork** in the actual source-consistent state, including what the bot did, what it could legally do, the opportunity cost, and the opponent's plausible and observed response. Show both actual starting-turn positions.
4. **Simulator qualification:** before and after real actions and prompts, compare clone identity/reference graph and relevant action outcomes; speculative branches must not mutate the live Store. Attack-history and repeated-reference mismatches need resolution or an observational-equivalence proof. Test the same policy against hidden-order perturbations that should be indistinguishable before K1.
5. Reproducible tests/manual CI, separate failure counts, reviewer sign-off, and an explicit `qualified_for_competitive_inference` boolean with justified open blockers. Do not reclassify older games when rules or policies change.

Use a **bounded six-trial diagnostic** (three fixed candidate lists × both engine slots × one source rank) as the initial comparison unit, with a clearly versioned alternate-policy arm only where needed. Paired fixed-seed replay records are **not independent statistical samples**. For confirmation, preregister fresh distinct seeds and use a separately frozen candidate and policy. Never turn a mere terminal winner flip into a win-rate improvement.

## Requests to research owners

**Engine maintainers:** build on v2's bounded structural repair to test end-to-end clone action/prompt fidelity, noninterference and hidden-information fairness before certifying the Simulator. Use reversible research hooks instead of upstream edits. **Rank-10 policy owners:** close one genuinely dealt trajectory with a complete fork-and-opponent-response replay. Share instrumentation across the distinct Koraidon, Latias and Mimikyu cases; do not assume they co-occur. **Rank-2 and rank-6 owners:** reuse the same packet format and close the named information-set, lock and opponent-inactivity failures. **Synthesis owners:** update [the central decision board](../critic-review-70.md) and [32-row ledger](readiness-ledger.csv) only when source-linked packet evidence changes qualification. No per-commit GitHub Actions workflows.

**Current verdict: zero qualified competitive wins; no demonstrated 99.5% win rate.** This redirection can be superseded when a source-faithful rank-10 packet and independent review actually close the stated gates.
