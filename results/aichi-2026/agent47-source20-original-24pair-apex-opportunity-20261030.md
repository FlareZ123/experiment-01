# Rank-20 original 60: frozen 24-pair native Apex-discard opportunity census

**Agent 47, 30 October 2026. Development-only, zero competitively qualified games.**

## Question and provenance

Can a bounded, owner-visible two-card Ultra Ball discard choice opportunistically
deposit a Dragon payload into the discard pile on a genuinely dealt rank-20
Regidrago VSTAR turn in which Apex Dragon is already directly payable? A prior
staged pinned-Store fixture established the physical Ultra Ball → discard →
search → Apex copied-attack mechanics, but that controlled hand was not naturally
dealt. The purpose of this run was to measure actual intervention opportunity
within a frozen two-source-opponent, both-seat sample, preserving failures.

- Registered recipe before native outcomes:
  [source](../../simulation/twinleaf/agent47-rank20-apex-natural-audit.cjs).
- Exact original source 60s: rank 20 versus ranks 1 and 11;
  six fixed seeds **1847000101 through 1847000106**, each source seat
  **0 and 1**, maximum **160 native root/prompt actions** per game.
- Both policy arms used the identical source 60s/seed/seat; treatment alone
  enabled `apexPayloadDiscard` in the
  [reversible owner-only discard adapter](../../simulation/twinleaf/agent47-actor-hand-discard.cjs).
- Pinned upstream Twinleaf submodule
  `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Manual compiled [CI 40995277628](https://github.com/FlareZ123/experiment-01/actions/runs/40995277628)
  **succeeded**. Full raw [artifact 12951665869](https://github.com/FlareZ123/experiment-01/actions/runs/40995277628/artifacts/12951665869),
  ZIP SHA-256 `207eaaaab0e883fefed987667b526795ecc4aa93d90305ac97c149cc9e9d4cc7`.
  Experimental code at runner head `4891f78d526e21a652c8f0efd4fa939325075784`.

## Observed denominators

| Original source setup | Registered pairs | Returned pairs | Engine-terminal pairs | 160-action capped pairs | Abort pairs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank 20 versus rank 1; source physical seat 0 | 6 | 6 | 2 | 4 | 0 |
| Rank 20 versus rank 1; source physical seat 1 | 6 | 6 | 3 | 3 | 0 |
| Rank 20 versus rank 11; source physical seat 0 | 6 | 6 | 1 | 5 | 0 |
| Rank 20 versus rank 11; source physical seat 1 | 6 | 4 | 0 | 4 | 2 |
| **All** | **24** | **22** | **6** | **16** | **2** |

There were **48 attempted native runs** (24 control + 24 treatment),
**44 returned native executions** and **4 exceptions** corresponding to
the same two paired source deals. Of the 22 intact pairs:

- **Zero** treatment Apex-discard alternative proposals, hence **zero**
  genuine policy intervention pairs. The treatment recorded **38**
  owner-hand discard opportunities with reason
  `apex-not-directly-confirmed-ready`, which does not imply the alternate
  line was globally unavailable.
- The **22 control/treatment observable digests matched**, with
  **22 source-deal fingerprints matching**. This is valuable opt-in
  noninterference evidence for these no-intervention deals only.
- Six paired games reached engine terminals under an unqualified simple policy.
  Sixteen pairs reached the action horizon. Neither class provides human-play
  game win percentages.

## Two paired native exceptions: exact, independently reproducible geometry

Both control and treatment aborted under strict pre-dispatch validation of
native `AttachEnergyPrompt`; the generic bot proposed only **one** distinct
physical Energy when the mandatory prompt demanded more.

1. Rank 11, seed **1847000101**, rank-20 source seat **1**:
   prompt **38**, native requirement `min=3,max=3`,
   **3** eligible Energy from source zone `other`, one permitted
   Benched **Regidrago V** recipient, but **1** selected Fire Energy.
2. Rank 11, seed **1847000105**, source seat **1**:
   prompt **76**, `min=2,max=2`, **2** eligible from 3 source
   cards, again Benched **Regidrago V**, but only **1** selected
   Grass Energy.

This is a genuine common-policy prompt-count failure, rather than
missing Apex policy benefit. It must remain an explicit abort in the original
frozen record. The repair path is the
[bounded opt-in native resolver](../../simulation/twinleaf/agent47-minimum-attach-energy-hook.cjs)
and [original-deal forensic replay](../../simulation/twinleaf/agent47-rank20-minrepair-replay.cjs).
The pure tests cover the two mandatory geometries, rejection constraints,
both seats and prototype restoration. A later native replay must be reported
separately, with its own CI status and all failures; the original 48 outcomes
must not be overwritten.

## Decision consequence

This exact six-seed/two-opponent natural slice supplied **no realized
opportunity** to test whether the Dragon-payload discard alternative improves
a legitimate attack. Repeatedly promoting the staged Ultra Ball positive
control would conflate a mechanically feasible line with an exercised
naturally dealt one. Prioritize the shared two-player owner-visible common
chooser and native prompt correctness. A broader discard-utility policy should
be evaluated as a separate prospective decision proposal if later evidence
justifies the coverage and compute.

This experiment is narrower than the full 32-opponent benchmark:
three final-rank original source 60s remain unverified (23, 25, 28),
the game clock and full paper-effect parity are unqualified, and
**zero games are competitively qualified**.
