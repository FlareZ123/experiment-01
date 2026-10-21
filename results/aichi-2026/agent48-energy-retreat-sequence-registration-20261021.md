# Agent 48 preregistration: funded-Bench mobility and attack follow-through, 21 Oct 2026

**This is a retrospective, development-only, one-flag follow-up to a completed Energy-recipient comparison.** It is not prospectively selected opponent-dealt sampling, a competitive win-rate experiment, or a new fixed-60 proposal.

## Experimental question and frozen inputs

The earlier same-deal `actor_energy_recipient=true`, `actor_paid_retreat=false` [run 39619220430](https://github.com/FlareZ123/experiment-01/actions/runs/39619220430) physically put substantial Basic Psychic Energy on rank-11 Benched Pokémon while preserving 260-root caps and [6,6] Prizes for both candidate lists. Does the **existing, independently native-validated Agent 6 paid-retreat root planner** create a later attack/Prize conversion from those existing funded Bench Pokémon with no other policy change?

Fixed GitHub experiment branch: `agent48/registered-energy-recipient-pair-20261021` at checkout **`cbb2474be15a9a9e07da5b9a0c37e56d812657f0`**. Engine pinned **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Baseline is the existing ON run **39619220430**, artifact 12354178065, SHA256 `7dcf0bf589f7759784f7494bbf23f22825be06437484d800e05dce3105ee765a`. The proposed sole new compiled run differs in the existing manual `agent7-canonical-actor-bilateral.yml` workflow by `actor_paid_retreat=true`. All other 25 declared workflow options must match exact baseline values. In particular: `actor_energy_recipient=true`, `energy_frontier=true`, `owner_single_search=true`, `special_energy_root=true`, `actor_hand_discard=true`, `actor_choose_pokemon=true`, `actor_quick_ball_root=true`, `native_generic_fallback=true`, and `paper_cologne_quota=false`. Common existing automatic flags for Supporter quota, mandatory options and pressure audit apply equally.

Registered four historical arms: `6:0:A:champion-reference`, `6:0:A:new-moon-lockbreaker-v1`, `11:2:B:champion-reference`, and `11:2:B:new-moon-lockbreaker-v1`. All card printings and published source 60s are fixed. These previously observed historical seeds are known to be source-weak/unqualified. The native source rank6 sudden-death reset has already made the champion arm abort the one-epoch attestor and must remain visible.

## Predeclared readout

1. Both actor roots must retain original `trial` objects, `actualStarterSeat` and `sourceDealFingerprint` (where the row survives the existing attestor). The paired match always has two original opponents, four attempted cases. No dropping censored or failing rows.
2. In rank11 record accepted root `RetreatAction` or equivalent paid mobility intent, physically confirmed source/candidate board changes, attackers and prompt-settled attack declaration names, and Prize transitions. A positive mobility action without resulting attack is still only a mobility proof.
3. Relative to pre-existing Energy-ON/no-retreat baseline, report every arm's root count, termination/censor, both players' Prize counts, source actual lock completion and opponent next-turn response. Any rank11 change from repetitive zero-Prize attack to six-Prize terminal requires audit of source quality and native paper-rule integrity; **do not count as competitive evidence**.
4. If the new flag merely repeats no-op attacks, classify negative. If CI fails its four-row completeness gate, state that error as a failed CI, inspect the native JSON artifact if present, and retain the failure.
5. Show whether the physical root-skeleton ledger digests stay identical or diverge and do not use hash equality as full board/recipient equivalence.

No extra GitHub workflow will be created; only the repository's existing manually triggered canonical integration workflow is permitted.
