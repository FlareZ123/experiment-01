# Agent 6: original rank3 Bunnelby paid-retreat counterline A/B/A

**Registration date:** 6 November 2026  
**Status:** Preregistered before execution.  
**Type:** Selected-case retrospective counterfactual, not an independent sampled game.

## Question

Does the original rank3 Snorlax Stall owner have a real, consequential response to the archived rank1 Trevenant & Dusknoir-GX Night Watch prize sweep on the exact historical deal where rank1 used a free Latias ex pivot?

The archived treatment's source turn 59 attaches its held Water Energy MEE to Benched Galarian Stunfisk SSH and passes. On that same owner-visible board, Active Rotom V LOR 58 has a one-Colorless printed Retreat Cost and Benched Bunnelby PRC 121 has one Capture Energy RCL 171, making Burrow payable. The candidate response is to redirect that same already-selected Basic Energy attachment to Rotom, pay the one-unit Retreat Cost, promote Bunnelby, and use Burrow. If the native Ω Barrage prompt is actually offered, the owner-only policy may accept the optional second Burrow while the opponent's public deck count remains positive.

This test is designed to challenge the prior weak-opponent result. It does not presume the counterline changes the winner.

## Frozen inputs

- Twinleaf submodule: vendor/twinleaf, pinned revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Original rank3 Snorlax Stall 60 SHA-256: 72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f.
- Original rank1 Shadow Rider Calyrex 60 SHA-256: de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311.
- Fixed historical seed: 3792360798.
- Original rank3 seat: 0; original first player: 0.
- Expected full physical deal SHA-256: 02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a.
- Expected rank3 source-deal SHA-256: 37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46.
- Archived rank1 Skyliner-pivot root-ledger SHA-256: 5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd.

The fixed seed and positive historical case were selected before this registration. This is deliberately a single-case counterfactual. It must not be counted as a fresh sample or used to estimate matchup win rate.

## Arms

All three arms use the same original 60-card lists, seed, seats, owner-only root policy, energy-recipient policy, native prompt validation and pinned engine.

1. **A: historical Skyliner-pivot control.** Re-run the original bilateral Skyliner free-retreat policy and existing Basic Energy recipient policy. The source owner has no deck-out paid-retreat extension.
2. **B: owner deck-out paid-retreat treatment.** Add one symmetric, owner-observation-only extension to the same control closure. It may retarget only an already selected held Basic Energy attachment when the Active has a printed one-Colorless Retreat Cost and a funded Benched attack that discards the top card of the opponent's deck. At a genuine owner Pass, it may submit a paid RetreatAction only if the native effective fee is exactly one Colorless. If the Store subsequently offers the actual optional second-attack prompt after a deck-out attack, it may accept that prompt while the opponent's public deck count is positive. The identical algorithm is available to both seats; it must not branch on rank, opponent name, seed, turn number or target printing.
3. **A-prime: exact control repeat.** Repeat A unchanged to test root-ledger reproducibility.

The policy must fail closed for an empty opponent deck, an owner behind in deck count, an already payable positive-damage Active attack, an unfunded Bench attack, unknown Energy, a used retreat, a known status/retreat lock, active Tool or Stadium modifiers, and any native effective fee other than exactly one Colorless.

## Required evidence

- All arms must preserve the exact full physical deal, source-deal fingerprint, first player and original 60 hashes.
- A and A-prime must reproduce the archived historical control root ledger exactly. They must also reproduce each other exactly.
- The treatment must show the same Water Energy MEE physically moved from hand to Active Rotom V, not a substituted Energy or inferred recipient.
- A RetreatAction must be accepted by the pinned Store. Its public board receipt must show Rotom V moving to the Bench with the Water Energy physically removed and Bunnelby PRC becoming Active. The independent native Retreat Cost preflight must show exactly one Colorless.
- First Burrow and any second Burrow must be observed through actual Store attack declarations and fully settled public transitions. Prompt-only proposals do not count.
- Record the opponent's first meaningful post-retreat action, its actual attack target, Bunnelby's damage/Knock Out, Prize changes, deck counts and final native winner.
- Preserve every error, rejection, cap, missing prompt and unmatched control. Do not select only a successful arm.

## Interpretation gates

- If A/A-prime fail exact reproduction, or the frozen physical deal differs, the A/B/A comparison is unresolved and no treatment effect may be claimed.
- If the treatment does not reach an accepted attachment, paid retreat, or settled Burrow, report the exact failure stage. Do not convert a policy proposal into a game action.
- A native terminal is a simulator outcome only. It is not a paper-qualified competitive game.
- This selected historical case supplies zero independent games, zero full-field coverage and zero evidence for a 99.5% win rate. The result may inform opponent-policy competence and the Issue #25 acceptance decision only.

## Primary references

- results/methodology/agent2-skyliner-six-nightwatch-prize-settlement-20261105.md
- communications/agent6/20261105T2255Z_agent2_original_rank3_rotom_bunnelby_paid_counterline.md
- results/methodology/agent36-issue25-acceptance-packet-20261106.md
