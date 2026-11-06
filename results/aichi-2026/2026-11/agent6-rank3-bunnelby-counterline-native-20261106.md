# Original rank3 Bunnelby paid-retreat counterline A/B/A

**Status:** Completed selected-case native counterfactual.  
**Run:** [GitHub Actions 42251249188](https://github.com/FlareZ123/experiment-01/actions/runs/42251249188), success.  
**Artifact:** 13520526945, ZIP SHA-256 94acbfbd7a2f0190423f7e8b7d91525717dc7722be47572bcf8772e3ddda3a0c; inner JSON SHA-256 1764d6bfe58b0510e8af9208a092ed98b1085ae073c09f7cb55ab04f394003ab.  
**Twinleaf:** vendor/twinleaf at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

## Result

The proposed source response is real and executable in the pinned Store. Rank3 redirects its held Water Energy MEE to Active Rotom V, pays the one-Colorless retreat, promotes the already-funded Bunnelby, and uses Burrow twice through the actual Ω Barrage prompt. Both attacks settle.

Rank1 responds with Night Watch, Knocks Out Bunnelby for one Prize, and still wins by Prizes on the same global turn as the control. The response changes the Prize map and leaves rank1 with two fewer cards, but does not change the winner or delay the terminal. This is one selected historical deal, not a matchup-rate result.

## Frozen inputs and controls

Registered before execution in results/aichi-2026/registrations/agent6-rank3-bunnelby-counterline-aba-20261106.md.

- Rank3 original 60 SHA-256: 72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f.
- Rank1 original 60 SHA-256: de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311.
- Seed 3792360798, rank3 seat 0, first player 0.
- Full physical deal SHA-256: 02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a.
- Rank3 source-deal SHA-256: 37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46.
- Historical control root-ledger SHA-256: 5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd.

All three arms were native-terminal and matched both original 60s, the full deal, source deal and first player. A and A-prime reproduce the historical root ledger exactly and reproduce each other exactly.

| Arm | Policy | Winner | Actions | Turns | Root-ledger SHA-256 |
|---|---|---:|---:|---:|---|
| A | Historical bilateral Skyliner pivot | rank1 | 291 | 68 | 5acd02e4…749c3acd |
| B | A plus owner deck-out paid retreat | rank1 | 296 | 68 | ee130f34…ace9ad40 |
| A-prime | Exact repeat of A | rank1 | 291 | 68 | 5acd02e4…749c3acd |

The first root-ledger divergence is ordinal 227: control returns PassTurnAction; treatment returns RetreatAction. The Water Energy attachment is root 226 in both arms, with a different physical recipient.

## Store-accepted action receipts

At source turn 59, Active Rotom V had 150 damage, no Energy and printed Retreat Cost one Colorless. Benched Bunnelby PRC at index 1 had Capture Energy RCL attached. The owner held Water Energy MEE at hand index 27. The existing recipient selected Galarian Stunfisk at Bench index 4. Owner and opponent deck counts were 17 and 15.

The bilateral owner-only policy audit records one retarget on seat 0, one retreat offer, native fee [9] (exactly one Colorless), one typed RetreatAction, one offered optional second-attack prompt, one accepted prompt and one copied Burrow. It records no opponent hidden-zone access. Seat 1 had no matching opportunity.

The Store sidecar verifies:
1. PlayCardAction, action ordinal 229 / root 226, accepted. The exact Water Energy MEE moved from hand to Active Rotom V.
2. RetreatAction, action ordinal 230 / root 227, accepted. Rotom V moved to the Bench with no Energy; Bunnelby PRC with Capture Energy became Active. The newly attached Water Energy was discarded as retreat payment.
3. Native CheckRetreatCostEffect returned [9]. No fee mismatch or retreat-quota veto occurred.
4. First Burrow was a native AttackAction. The native optional ability prompt was offered and accepted. ChooseAttackPrompt selected Bunnelby PRC's Burrow. Two settled public attack-transition records confirm both Burrows.

The first meaningful reply is rank1's turn-60 Night Watch, root 235. Its settled transition shows Bunnelby as the source Active before the attack, Articuno-GX promoted afterward, and rank1's Prize count moving from six remaining to five.

| Rank1 turn | Source Active | Prize change | Rank1 Prizes remaining |
|---:|---|---:|---:|
| 60 | Bunnelby PRC | 1 | 5 |
| 62 | Articuno-GX | 0 | 5 |
| 64 | Articuno-GX | 2 | 3 |
| 66 | Snorlax | 1 | 2 |
| 68 | Rotom V | 2 | 0 |

Control takes two Prizes from Rotom V on turn 60, two from Articuno-GX on turn 64, one from Snorlax on turn 66 and one from Girafarig on turn 68. Both lines finish on turn 68 with rank1 winning by Prizes. Treatment ends with public deck counts rank3 23 / rank1 7; control ends 23 / 9. The two Burrows mill two additional cards, but rank1 still has seven when it wins.

The original rank3 list contains one Bunnelby PRC, three Capture Energy RCL and two Water Energy MEE. After Night Watch Knocks Out the single Bunnelby, this line cannot continue with another copy. The treatment also spends the newly attached Water Energy as retreat payment, leaving Galarian Stunfisk without that additional attachment.

## Interpretation and limitations

- Confirmed: this is a genuine owner response on the exact historical board; the pinned Store accepted the Basic attachment and retreat; both Burrows settled; the actual opponent reply and Prize settlement were captured.
- Confirmed for this case: no winner change and no turn delay. The first Prize target changes from a two-Prize Rotom to one-Prize Bunnelby; the opponent later takes two Prizes from Articuno-GX and two from Rotom.
- Not established: the quality of other source responses, other deals, other opponent policies, or the wider metagame.
- These are native simulator games, not paper-qualified tournament games. The A/B/A arms are one selected physical deal, not independent samples. This supplies zero new matchup-rate evidence, zero additional Top 32 coverage and no evidence for a 99.5% win rate.

Code: simulation/twinleaf/agent6-owner-deckout-paid-retreat.cjs; tests: tests/agent6-owner-deckout-paid-retreat.test.cjs; runner: simulation/evaluation/agent6-rank3-bunnelby-counterline-aba.cjs; manual workflow: .github/workflows/agent2-fss-float-rank3-native.yml. No upstream Twinleaf source was modified.

## Acceptance-packet delta

Record this as a resolved selected-case adversarial response: the source's Bunnelby paid-retreat line is real but does not defeat the tested Night Watch prize sweep. Retain broader opponent-policy competence and other owner-held responses as open questions. Do not count this A/B/A as a matchup sample or full-policy release qualification.

Related work: results/methodology/agent2-skyliner-six-nightwatch-prize-settlement-20261105.md; results/methodology/agent36-issue25-acceptance-packet-20261106.md.
