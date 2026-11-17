# Paired-mulligan-adjusted Hood resource access across Aichi ranks 1, 3, 7 and 15

**Agent 43 · 17 November 2026**

## Decision summary

The earlier Agent43 resource-access reports intentionally conditioned on valid opening sevens and omitted the optional cards awarded for the opponent's one-sided mulligans. This follow-up integrates the exact paired-mulligan distribution from [Agent14's full-field model](../../methodology/2026-11/agent14-aichi-field-paired-mulligan-matrix-20261114.md) and the setup order in the supplied Advanced Player's Rulebook I.G, steps 4–7 (page 15): six Prizes are set first, then the player may draw up to the number of one-sided opponent mulligans. It now also quantifies rank 1's Field Blower response and its conditional Forest Seal Stone search route.

The adjustment is real but modest. It does not change the resource conclusions.

| Matchup / resource event | No-bonus baseline | Paired-mulligan-adjusted sensitivity |
|---|---:|---:|
| Rank 1: opponent direct Field Blower response, one/two draws | — | **13.009873% / 14.687318%** |
| Rank 1: potential Forest Seal Stone + Shadow Rider V route, one/two draws | — | **4.980705% / 6.134087%** |
| Rank 1: combined Field Blower access if Star Alchemy is unspent, one/two draws | — | **17.455698% / 20.059473%** |
| Rank 3: candidate escape, first own turn going second | 13.819413% | **14.369686–14.369691%** |
| Rank 3: candidate escape, second own turn, no Eri | 15.969682% | **16.532526–16.532532%** |
| Rank 3: candidate escape, second own turn, Eri natural-access mixture | 15.416851% | **15.932902–15.932908%** |
| Rank 7: candidate escape, first own turn going second | 13.819413% | **14.270008–14.270009%** |
| Rank 7: candidate escape, second own turn going first | 15.969682% | **16.430658–16.430660%** |
| Rank 7: opponent has a named Hood remover by first response, one draw | 42.738824% | **43.322411%** |
| Rank 7: opponent has a named Hood remover by first response, two draws | 47.143530% | **47.692685%** |
| Rank 15: candidate has at least one Hood by first own turn | 34.051576% | **34.582794%** |
| Rank 15: candidate has at least one Hood by second own turn | 37.834840% | **38.345078%** |
| Rank 15: candidate has both Hoods by first/second own turn | 4.016765% / 5.176322% | **4.183463% / 5.360720%** |

The intervals are rigorous truncation bounds, not confidence intervals. The script sums bonus counts 0–10 exactly and adds the entire remaining tail probability to the upper endpoint. The widest interval is only (5.86\times10^{-8}) probability (rank 3); the other tails are smaller.

## Exact paired-mulligan distribution

Let (q_C=\binom{46}{7}/\binom{60}{7}) be the candidate's probability of a no-Basic opening, (q_O=\binom{60-b_O}{7}/\binom{60}{7}) for an opponent with (b_O) Basics, (p_C=1-q_C), (p_O=1-q_O), and (D=1-q_Cq_O).

Shared both-fail rounds repeat with probability (q_Cq_O) and award no bonus. If the candidate receives (M) optional cards from opponent-only mulligans:

[
P(M\ge k)=\frac{p_C q_O^k}{D},\qquad k\ge1.
]

Thus (P(M=0)=1-P(M\ge1)) and (P(M=k)=p_Cp_Oq_O^k/D) for (k\ge1). If the opponent receives (N) cards from candidate-only mulligans, exchange the roles:

[
P(N\ge k)=\frac{p_O q_C^k}{D}.
]

The implementation reproduces Agent14's per-rank bonus probability and expected maximum optional allowance. Candidate bonus cards M and opponent bonus cards N are mutually exclusive under the paired protocol: P(M=0,N=0)=p_C p_O/D; P(M=m,N=0)=p_C p_O q_O^m/D for m>=1; P(M=0,N=n)=p_O p_C q_C^n/D for n>=1; P(M>0,N>0)=0. The rank-3 Eri mixture is integrated over this joint distribution, rather than treating the two players' bonus draws as independent. The beneficiary is assumed to draw the maximum optional allowance to maximize the narrow resource-access event. This does not assert that maximum draw is the strategically optimal whole-game decision.

## Rank-specific results

### Rank 1 — Shadow Rider mirror / Field Blower

Rank 1 has 14 Basics, Field Blower ×1, Forest Seal Stone ×1 and Shadow Rider Calyrex V ×3 (plus four VMAX). The candidate also has 14 Basics, so rank 1 receives optional cards when the candidate has one-sided mulligans: (P(N\ge1)=12.172125\%), (E[N]=0.141305).

By the first response window after Hood is attached:
- Candidate goes first; rank 1 goes second and has one normal draw plus any bonus cards: direct Field Blower access is **13.009873%**. The potential Forest Seal Stone + Shadow Rider V line is **4.980705%**. Their union is **17.455698%** if Star Alchemy remains unused.
- Candidate goes second; rank 1 goes first, then has its second turn after Hood is attached and two normal draws plus any bonus cards: direct Field Blower access is **14.687318%**. The potential Forest Seal Stone + Shadow Rider V line is **6.134087%**. Their union is **20.059473%** if Star Alchemy remains unused.

The Forest Seal Stone line requires the Tool and a Shadow Rider V to have been seen, and assumes the opponent still has its VSTAR Power available to search for Field Blower. The model does not include the possibility that Star Alchemy was spent earlier on another card, nor other setup/search lines. Field Blower is assumed retained until Hood appears. A single Field Blower can remove both attached Hoods, but these are access probabilities, not a guarantee that the opponent will choose or successfully make that play.

### Rank 3 — Snorlax / Eri

Rank 3 has 11 Basics and Eri ×1. Candidate bonus eligibility is (P(M\ge1)=19.768952\%), with expected maximum allowance (E[M]=0.254237) cards. Integrating the bonus draws raises first-turn escape-resource access to **14.369686–14.369691%**.

Eri is in the opponent's opening seven **10.917506%** conditional on a valid opening. Its first-turn natural access is **12.598308%** without opponent bonus cards and **12.815269–12.815275%** after integrating rank 3's paired-mulligan bonus draws. The candidate's second-turn Eri/no-Eri mixture, correctly integrating the mutually exclusive M,N branches, is **15.932902–15.932908%**. This corrects the earlier independent-weighting approximation (**15.942423–15.942429%**); the numerical change is small, but the joint model is the correct paired setup. The Eri-worst-case access is **11.848539–11.848545%**; the no-Eri comparison is **16.532526–16.532532%**. Eri is assumed played whenever in hand by the opponent's first turn and to discard Field Blower if it is in the candidate's hand before resolution. The calculation does not include later VS Seeker/Lusamine recovery or extra draw access.

The operational rule is unchanged: if anticipating Eri, keep Field Blower in the deck until after Eri and then use Arven to fetch Field Blower + Hood.

### Rank 7 — Snorlax / Tool-removal package

Rank 7 has 12 Basics. Candidate bonus eligibility is (P(M\ge1)=16.868172\%), (E[M]=0.208415). Its adjusted Arven/Field Blower/Hood access is **14.270008–14.270009%** by the first own turn going second and **16.430658–16.430660%** by the second own turn going first.

The opponent receives optional cards when the 14-Basic candidate mulligans: (P(N\ge1)=11.521297\%), (E[N]=0.133749). Integrating those draws raises natural response-card access to at least one of Faba ×2, Field Blower ×1 or Megaton Blower ×1 to **43.322411%** after one normal draw and **47.692685%** after two. These are response-card-in-hand events, not successful removal or matchup outcomes. The opponent is assumed to retain any drawn remover until Hood appears; prior use on another Tool/Stadium and later VS Seeker/Lusamine recovery are outside this model.

The operational rule is unchanged: use the Arven/Field Blower/Hood line for immediate escape, not as durable protection against the four-card removal package.

### Rank 15 — Lopunny / Vileplume

Rank 15 has 14 Basics, matching the candidate. Candidate bonus eligibility is (P(M\ge1)=12.172125\%), (E[M]=0.141305). Adjusted access to at least one Hood is **34.582794–34.582794%** by the first own turn and **38.345078–38.345079%** by the second. Adjusted access to both Hoods is only **4.183463–4.183463%** and **5.360720–5.360720%**.

The rules distinction is unchanged: AOR3's Item-only lock does not prevent attaching a Pokémon Tool such as Hood, and Arven remains a playable Supporter. Hood does not cancel the global Item lock; its separate Ability-protection role is against BUS6's Ability effect on a protected Basic attacker. The operational priority remains one Hood on the Pokémon that needs protection, rather than trying to establish both.

## Assumptions and limits

- Both players eventually obtain valid opening sevens. Shared both-fail resets are excluded from bonus counts, as in Agent14's paired model.
- Bonus cards are drawn after the six Prizes. The beneficiary draws the maximum optional allowance; the script does not model choosing fewer cards for broader strategic reasons.
- Each player's final valid opening composition is treated as independent of the number of one-sided mulligans. Deck shuffles are independent.
- Candidate-side access events use only natural draws plus the named Arven/Tool package; they omit Forest Seal Stone, Tapu Lele-GX, search Items, draw Supporters and other access.
- Rank-1 Field Blower access assumes the opponent retains it until Hood appears. The Forest Seal Stone route assumes Star Alchemy remains unused and a Shadow Rider V has been seen; earlier VSTAR use and other search lines are excluded.\n- Rank-3 Eri access is weighted by its first-turn availability after the opponent's paired-mulligan bonus draws; the candidate/opponent bonus branches are modeled jointly. Eri is assumed played whenever drawn; later recovery is excluded.
- Rank-7 response access assumes the opponent retains a named remover until Hood is attached; it does not model whether that remover is spent earlier or successfully prevents escape.
- Rank-15 one-/two-Hood events do not model Vileplume's exact setup timing, Mimikyu access, or attack sequencing.
- The script truncates the optional-draw count at 10 and returns a rigorous interval by assigning the entire residual probability mass to the upper endpoint. The largest omitted tail is below (5.86\times10^{-8}).

These are exact combinatorial resource-access sensitivities under explicit assumptions, not simulations, matchup probabilities, game outcomes, or evidence for the 99.5% objective. They do not authorize a deck, policy, fixture, CI or V3 change.

## Reproduction

Run:

`python3 results/aichi-2026/2026-11/agent43-paired-mulligan-adjusted-hood-access-20261117.py`

The script uses only the Python standard library, exact `Fraction` arithmetic and exhaustive category-composition enumeration. It asserts the paired bonus distribution sums to one and reports the residual tail bounds. No Monte Carlo sampling or external dependency is used.

**Evidence classification:** Basic/card counts = source-list facts; paired mulligan procedure = supplied rulebook and Agent14's validated setup model; probabilities = exact combinatorial calculations under the stated maximum-optional-draw assumption; actual escape, removal and matchup outcomes = untested.
