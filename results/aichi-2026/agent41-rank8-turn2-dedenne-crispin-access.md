# Rank-8 Crobat opener: conditional Quick Ball → Dedenne → Crispin attack access

**Agent 41; 17 October 2026. Evidence: source-dealt public/private-own-hand trace, printed card text, exact combinatorics.** No competitive win-rate or policy superiority claim.

## Observed source decision

[Source-ranked run 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040), `pilot:8:0:temple-v1:B`, seed `4168858073`, actual opponent rank 8 in physical A and candidate in B. At global turn 2, the rank-8 opponent started with **Crobat V** Active, **Trubbish** on Bench, and played its normal **Darkness Energy** onto Crobat. At ordinal 19 it **passed** with Wally, Quick Ball ×2 and Dark Patch ×2 in its own hand. Candidate's board was Shadow Rider Calyrex V with Forest Seal Stone and Dialga-GX; no observed Ability lock. No rank-8 attack was announced. Opponent source 60 contains Dedenne-GX ×1, Crispin ×1, 5 Basic Darkness and 2 Basic Lightning.

## Explicit possible line, with opportunity costs

Play Quick Ball by discarding the other Quick Ball; **if unprized**, search Dedenne-GX and play it onto the open Bench. Trigger Dedechange, which discards the remaining Wally and two Dark Patch cards and draws six. If the six contain **Crispin** and at least one each of Darkness and Lightning Basic Energy remains searchable in deck, play Crispin to attach an Energy to Active Crobat. Its already-attached Darkness plus the second Energy satisfies **Venomous Fang** ([D][C], 70 and Poison) going second on turn 2. Crispin's deck attachment is separate from the already-used normal attachment.

This is a **high-resource-cost, conditional tactic**, not necessarily the correct strategic choice. It consumes both Quick Balls, Wally, two Dark Patches and the turn's Supporter. The actual source Prize composition and remaining hidden deck at this point have not been independently dumped; do not assert the line was executable in this exact seed.

## Exact probability under the observed eight known printings

At that decision, eight physical cards were identified in hand/board/attached: seven starting printings and the drawn second Dark Patch. Of the remaining **52** unseen cards, six were Prized and 46 in deck. The singleton Dedenne was unseen, as was Crispin; **four Basic Darkness and two Basic Lightning Energy** were unseen.

Conditioning only on those eight cards and uniform random hidden zones:

- Dedenne in the searchable deck: `46/52`.
- After removing Dedenne, Crispin among the six Dedechange draws: `6/51`.
- After Dedenne and the Crispin draw, 50 unseen cards divide into 39 remaining deck, 6 Prizes and 5 other drawn cards. Probability at least one of each of the 4 Darkness and 2 Lightning remain in deck:

  `1 - C(48,39)/C(50,39) - C(46,39)/C(50,39) + C(44,39)/C(50,39) = 0.9536982008344503`.

Multiplying gives **0.09925365891037265**, or **9.9254%**, for this specific immediate-attack resource event over the modeled hidden configurations. The probability is about resources **conditional on the already-observed opening**, not an estimated tournament success rate or actual game outcome. A decision policy should weigh its substantial discard cost, Prize information (K0), and alternative Garbotoxin development lines before considering it.

**Evidence gap:** reproduce the source seed in a decision-only fork that legally makes the Quick Ball choice, logs the actual remaining 60-derived zones, resolves Dedechange/Crispin and full opponent response. The unmodified weak bot's Pass is not proof that this line was unavailable or preferable.
