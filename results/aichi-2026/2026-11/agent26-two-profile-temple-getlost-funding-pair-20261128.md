# Agent26: executable next-turn Regidrago funding-cut preference in the two-profile Get Lost worker

**2026-11-28. Development branch:** [agent26/two-profile-temple-getlost-funding-20261128](https://github.com/FlareZ123/experiment-01/tree/agent26/two-profile-temple-getlost-funding-20261128); **unchanged source and candidate 60s**. No compiled/native Store, CI, fixture, game, qualified Aichi matchup or win-rate claim.

## First executable failure in the *current* owner successor

Agent46's real two-profile successor **already implements Get Lost root and opponent-public discard prompts**. This supersedes the earlier Agent26 legacy-main compatibility patch as an owner handoff; *do not cherry-pick that older generic patch over Agent46's stronger worker*.

Its Get Lost pair scorer uses `apexHazard(view)` to value visible copied-attack donors. However the hazard returns zero whenever Apex Dragon is **not currently payable**, even when the opponent can recover a discarded funding counter and make it payable **next turn**. `getLostValue` rewards Dragon donor printings at 500 each but treats the two recovery/funding counters **Megaton Blower** and **Crispin** as mere 15-point fillers. That creates a candidate decision error independently reproduced on **both physical actor seats**:

- Own Active: paid Girafarig LOT with the actually offered `Get Lost` attack. Own Stadium: live Temple of Sinnoh.
- Opponent Active: Regidrago VSTAR SIT with one Basic Grass Energy + one Double Dragon Energy. Opponent's **public** Lost Zone has Silent Lab PRC and Parallel City BKT. Opponent's **public** discard offers, in exact token order, `[Dialga-GX UPR, Kyurem SFA, Megaton Blower SSP, Crispin SCR]`. No other opponent Pokémon.
- The original v2 worker blob `968e15dd7dda774d5dd1959ec7e1f58ea1669150` chooses root `Get Lost`, then **`card-0,card-1` (Dialga + Kyurem)** for its mandatory public-discard prompt.
- The amended worker blob `1f704f168efded95cd7b939baae4e172f223bd6d` chooses the *same offered root attack*, then **`card-2,card-3` (Megaton Blower + Crispin)**.

This is a *specific source-envelope funding-denial priority*, derived from [Agent26's original exact rank13 exhaustive pair oracle](agent26-rank13-temple-attack-cut.md) and [nine-rank source minima](agent26-regidrago-temple-minimum-cuts.md): in that constrained rank13 environment, with both replacement Stadium sources already Lost, Megaton can remove Temple and enable the DDE payment route; Crispin with the regular manual attachment can pay for GGF through Temple. Removing both eliminates these known distinct funding routes. **Not an actual-game lock claim:** hidden replacement Stadiums, alternate funded attackers, a different source list, Raihan after a KO, or other reachable routes may survive; our actor doesn't know all of these.

## Small actual decision patch

The owner successor's existing `getLostPairs` enumeration and prompt custody remain untouched. Add one `visibleTempleRegidragoFundingPairBonus(view,names)` term to its pair score, returning **7000 tactical prioritization units** only when ALL of these public facts hold:

- The candidate's current Temple effect is live and the pair is exactly `Megaton Blower + Crispin`.
- The opponent's current Active is Regidrago VSTAR, attached **exactly one Basic Grass and one Double Dragon Energy**, and cannot pay `GGF` *under Temple*.
- Both `Silent Lab` and `Parallel City` are present in the **opponent's public Lost Zone**.
- Exactly one visible copy each of Megaton Blower and Crispin is in opponent's public discard; at least one copied attack donor is publicly visible in that discard.
- No publicly visible **already funded** Benched Regidrago VSTAR can pay the same Apex cost.

Everything else delegates to the unchanged two-profile scorer, which may choose different cards. No opponent rank ID, hidden hand/deck contents, opponent Prizes, fabricated actions, secret matchup metadata, or native effects are read. The weight 7000 is a bounded heuristic to outrank immediate donor scores in this publicly relevant state, **not a calibrated probability or a proof**.

The source and [18/18 strict two-seat focused tests](../../../tests/2026-11/agent26-two-profile-temple-next-turn-getlost.test.cjs) are committed on the branch. Test blob `4080b964fd2f235c898a93ce2dba46b7042d7895`, base protocol `cf49a009525a9a5af3a89f5964eb563e0d9d9e26`. The tests exercise source-exact genuine typed policy decisions, `validateRequest`, `validateDecision`, `validatePolicyAudit`, and hard negatives for absent Temple, missing either Lost stadium, no G+DDE energy geometry, funded bench attacker, duplicated publicly discarded Crispin, and no revealed donor. All executed in isolated in-process V8 from exact GitHub blobs, **not** native compiled Store or Node CLI. In an additional V8 regression exercise, **101/104 original two-profile test callbacks passed**; the other 3 were not executed because the ad-hoc V8 harness did not provide the root suite's additional native-projection/prize helpers (not policy assertion failures). Their node files are unchanged, and no CI was dispatched.

## Owner adoption and stronger follow-up

This is a **proposed actor-only prioritization repair on the already developed v2 owner worker**. Do not treat a heuristic as settled competitive evidence, do not replace the fixed candidate 60, and do not auto-merge this branch. The owner (Agent46) and its reviewer (Agent31) should compare the patch with the most recent reviewed two-profile policy/PR95 work. The more principled follow-up is a bounded *next-turn funding reachability* evaluator incorporating observed DDE/Basic supply, public Lost recovery, actual Stadium counters, Supporter contention, alternative attackers, and a source-uncertainty upper bound before any large policy promotion. In particular the current `apexHazard` estimates **immediate** payoff and shouldn't be mistaken for next-turn access. Any genuine native Store execution requires separate authorization.

**Benchmark still unresolved:** 29/32 original field source lists, 0/32 qualified full matchups, no selected final fixed 60, 99.5% unsubstantiated.
