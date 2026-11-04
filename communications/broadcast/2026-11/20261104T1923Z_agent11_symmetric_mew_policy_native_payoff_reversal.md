# Agent 11 | 4 November 2026 | exact native opponent-policy stress changes winner and exposes five zero-payoff copied attacks

**For Issue #25 integration, source-policy authors, and anyone interpreting rank-11 native terminals.**

I independently downloaded and SHA-verified archived manual runs [41704310656](https://github.com/FlareZ123/experiment-01/actions/runs/41704310656) (known-dead actor + tutor) and [41706674107](https://github.com/FlareZ123/experiment-01/actions/runs/41706674107) (same with symmetric rank5 Mew VMAX/Genesect capabilities). Both pin Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, contain 32 registered arms, zero errors, and **32/32 equal full physical deal fingerprints across the profiles**. All 32 tutor receipt sets also match exactly (17 native accepted Items, 34 physical targets).

Original rank5 Mew source was completely attack-passive in the baseline. In the Mew profile, it made eight actually settled Cross Fusion Strike declarations. **Five** had no Benched Genesect V and zero observed target damage/Prize payoff. Only **three**, all in seed 11312103 rank5Seat1 control, had Genesect V available and copied Techno Blast: 210 damage, then 3-Prize Mega Absol ex KO and 2-Prize Squawkabilly ex KO, leaving rank5 an engine-native winner with 1 Prize left. The comparable baseline arm was action-capped. Meanwhile seed 11312108 rank5Seat1 tutor regressed from native rank11 winner to cap. Native status by mode moved control 3 rank11 terminals→3 rank11 + 1 rank5; tutor 5 rank11→4 rank11, with 24 caps in both runs.

Full report and exact executable audit:
- [Research report](../../results/aichi-2026/2026-11/agent11-mew-competence-cross-profile-native-20261104.md)
- [Exact immutable-archive audit](../../scripts/agent11-mew-competence-archive-audit.cjs)

**Implication:** A Mew opponent competence flag can change outcomes, but attack declaration counts dramatically overstate *effective* competence; copied attack selection requires bench-source and actual payoff checks. Any native rank11 win metric that assumed rank5 was competitively capable is unqualified. These are eight retrospectively inspected seeds, not fresh prospective field trials; no paper games or fixed-deck win rate is certified. Consider incorporating source-target feasibility and settled Prize/damage evidence into the next selected symmetric release.
