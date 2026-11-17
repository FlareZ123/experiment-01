# Paired-mulligan-adjusted Hood resource access across Aichi ranks 1, 3, 7 and 15

**Agent 43 · 17 November 2026**

## Decision summary

The earlier Agent43 resource-access reports intentionally conditioned on valid opening sevens and omitted the optional cards awarded for the opponent's one-sided mulligans. This follow-up integrates the exact paired-mulligan distribution from [Agent14's full-field model](../../methodology/2026-11/agent14-aichi-field-paired-mulligan-matrix-20261114.md) and the setup order in the supplied Advanced Player's Rulebook I.G, steps 4–7 (page 15): six Prizes are set first, then the player may draw up to the number of one-sided opponent mulligans. It now also quantifies rank 1's Field Blower response and its conditional Forest Seal Stone search route.

The adjustment is real but modest. It does not change the resource conclusions.

| Matchup / resource event | No-bonus baseline | Paired-mulligan-adjusted sensitivity |
|---|---:|---:|
| Rank 1: opponent direct Field Blower response, one/two draws | — | **13.009873% / 14.687318%** |
| Rank 1: potential Forest Seal Stone + Shadow Rider V route, one/two draws | — | **4.465937% / 5.499883%** |
| Rank 1: combined Field Blower access if Star Alchemy is unspent, one/two draws | — | **16.940931% / 19.425268%** |
| Rank 1: conditional KO — Teammates in hand, Field Blower not Prized | — | **13.182576%** |
| Rank 1: conditional KO — Raihan in hand, Field Blower not Prized (Energy discard required) | — | **13.182576%** |
| Rank 1: conditional KO — either Supporter in hand, Field Blower not Prized | — | **24.630046%** |
| Rank 1: conditional KO — direct Field Blower or Teammates search | — | **25.932671%** |
| Rank 1: conditional KO — direct Field Blower or either Supporter (Raihan cost payable) | — | **35.668393%** |
| Rank 3: candidate escape, first own turn going second | 13.819413% | **14.369686–14.369691%** |
| Rank 3: candidate escape, second own turn, no Eri | 15.969682% | **16.532526–16.532532%** |
| Rank 3: candidate escape, second own turn, Eri natural-access mixture | 15.416851% | **15.932902–15.932908%** |
| Rank 7: candidate escape, first own turn going second | 13.819413% | **14.270008–14.270009%** |
| Rank 7: candidate escape, second own turn going first | 15.969682% | **16.430658–16.430660%** |
| Rank 7: opponent has a named Hood remover by first response, one draw | 42.738824% | **43.322411%** |
| Rank 7: opponent has a named Hood remover by first response, two draws | 47.143530% | **47.692685%** |
| Rank 15: candidate has at least one Hood by first own turn | 34.051576% | **34.582794%** |
| Rank 15: candidate has at least one Hood by second own turn | 37.834840% | **38.345078%** |
| Rank 15: candidate has both Hoods by first/second own turn | 3.718283% / 4.786895% | **3.871860% / 4.956486–4.956487%** |

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

Rank 1 has 14 Basics, Field Blower ×1, Forest Seal Stone ×1 and Shadow Rider Calyrex V ×3 (plus four VMAX). It also lists Teammates ×1, Raihan ×1, Night Stretcher ×1 and Battle Compressor ×1 (PHF-92); it has no Dowsing Machine. The candidate also has 14 Basics, so rank 1 receives optional cards when the candidate has one-sided mulligans: (P(N\ge1)=12.172125\%), (E[N]=0.141305).

By the first response window after Hood is attached:
- Candidate goes first; rank 1 goes second and has one normal draw plus any bonus cards: direct Field Blower access is **13.009873%**. The potential Forest Seal Stone + Shadow Rider V line is **4.465937%**. Their union is **16.940931%** if Star Alchemy remains unused.
- Candidate goes second; rank 1 goes first, then has its second turn after Hood is attached and two normal draws plus any bonus cards: direct Field Blower access is **14.687318%**. The potential Forest Seal Stone + Shadow Rider V line is **5.499883%**. Their union is **19.425268%** if Star Alchemy remains unused.

Card-text checks against the supplied card pool support the sequence: Field Blower discards up to two Tools/Stadiums; Arven searches one Item and one Pokémon Tool; VS Seeker recovers a Supporter; Teammates/Raihan are live after a Pokémon KO on the opponent's last turn; Star Alchemy searches any card but is once per game; Night Stretcher retrieves only Pokémon/Basic Energy. The source list includes Battle Compressor ×1 (PHF-92), and the supplied card pool includes it at [resources/cards/en/xy4.json, xy4-92](../../../resources/cards/en/xy4.json). It is not on the current Expanded banned list; the official July 2026 update made no changes to Expanded bans. This model does not simulate whether Battle Compressor is used to discard Field Blower; it assumes Field Blower is retained in hand/deck rather than discarded. This is a model limitation, not a card-pool or legality exclusion. The Forest Seal Stone line requires the Tool and a Shadow Rider V to have been seen, Field Blower not to be Prized or already discarded, and the opponent still to have its VSTAR Power available to search for Field Blower. The model does not include the possibility that Star Alchemy was spent earlier on another card, nor other setup/search lines. Field Blower is assumed retained until Hood appears. A single Field Blower can remove both attached Hoods, but these are access probabilities, not a guarantee that the opponent will choose or successfully make that play.

**Conditional first-turn-KO branch:** if the candidate goes second and Knocks Out one of rank 1's Pokémon on its first turn, rank 1's Teammates ×1 and Raihan ×1 become live on its second turn. Conditional on that KO, with the paired bonus draws included, the probability of either Supporter being in hand while Field Blower is not Prized is **13.182576%**; Raihan is also in hand with Field Blower not Prized **13.182576%**, but Raihan additionally requires a Basic Energy in the discard pile. Either Supporter is in hand with Field Blower not Prized **24.630046%**. The union of direct Field Blower or Teammates search is **25.932671%**; direct Field Blower or either Supporter search is **35.668393%** only if Raihan's Energy cost is payable. This excludes the Forest Seal Stone route. It assumes Field Blower remains in hand/deck (not discarded by Battle Compressor) and the Supporter can be chosen on the response turn. Thus a first-turn KO can accelerate the prize race but also unlock a second-turn Field Blower search; whether to take it is a board/policy decision, not a fixed rule.

**One-removal reserve loop:** the candidate has Arven ×1, VS Seeker ×2 and Stealthy Hood ×2; rank 1 has only one Field Blower and no Dowsing Machine or other Trainer recovery for it (Night Stretcher recovers Pokémon/Basic Energy, not Trainers). If the first Hood is removed, the candidate can use VS Seeker → Arven → second Hood, provided the reserve copy is not Prized. Conditional on the first Hood being outside Prizes, the second is also outside Prizes with probability **53/59 = 89.830508%**; both Hoods are Prized overall only **1/118 = 0.847458%**. Arven can fetch the Tool and an Item such as VS Seeker. The opponent's Teammates/Raihan/FSS can find its single Field Blower before use, but cannot retrieve it from the discard pile after it is used. Therefore the practical line is to attach one Hood, keep the other in hand/deck, and recycle Arven with VS Seeker if the first is stripped. The line fails if the reserve Hood is Prized or if the candidate cannot access Arven/VS Seeker in time; it is a card-resource sequence, not a tested matchup result.

### Rank 3 — Snorlax / Eri

Rank 3 has 11 Basics and Eri ×1. Candidate bonus eligibility is (P(M\ge1)=19.768952\%), with expected maximum allowance (E[M]=0.254237) cards. Integrating the bonus draws raises first-turn escape-resource access to **14.369686–14.369691%**.

Eri is in the opponent's opening seven **10.917506%** conditional on a valid opening. Its first-turn natural access is **12.598308%** without opponent bonus cards and **12.815269–12.815275%** after integrating rank 3's paired-mulligan bonus draws. The candidate's second-turn Eri/no-Eri mixture, correctly integrating the mutually exclusive M,N branches, is **15.932902–15.932908%**. This corrects the earlier independent-weighting approximation (**15.942423–15.942429%**); the numerical change is small, but the joint model is the correct paired setup. The Eri-worst-case access is **11.848539–11.848545%**; the no-Eri comparison is **16.532526–16.532532%**. Eri is assumed played whenever in hand by the opponent's first turn and to discard Field Blower if it is in the candidate's hand before resolution. The calculation does not include later VS Seeker/Lusamine recovery or extra draw access.

The operational rule is unchanged: if anticipating Eri, keep Field Blower in the deck until after Eri and then use Arven to fetch Field Blower + Hood.

### Rank 7 — Snorlax / Tool-removal package

Rank 7 has 12 Basics. Candidate bonus eligibility is (P(M\ge1)=16.868172\%), (E[M]=0.208415). Its adjusted Arven/Field Blower/Hood access is **14.270008–14.270009%** by the first own turn going second and **16.430658–16.430660%** by the second own turn going first.

The opponent receives optional cards when the 14-Basic candidate mulligans: (P(N\ge1)=11.521297\%), (E[N]=0.133749). Integrating those draws raises natural response-card access to at least one of Faba ×2, Field Blower ×1 or Megaton Blower ×1 to **43.322411%** after one normal draw and **47.692685%** after two. These are response-card-in-hand events, not successful removal or matchup outcomes. The opponent is assumed to retain any drawn remover until Hood appears; prior use on another Tool/Stadium and later VS Seeker/Lusamine recovery are outside this model.

The operational rule is unchanged: use the Arven/Field Blower/Hood line for immediate escape, not as durable protection against the four-card removal package.

### Rank 15 — Lopunny / Vileplume

Rank 15 has 14 Basics, matching the candidate. Candidate bonus eligibility is (P(M\ge1)=12.172125\%), (E[M]=0.141305). Adjusted access to at least one Hood is **34.582794–34.582794%** by the first own turn and **38.345078–38.345079%** by the second. Adjusted access to both Hoods is only **3.871860–3.871860%** and **4.956486–4.956487%**.

The rules distinction is unchanged: AOR3's Item-only lock does not prevent attaching a Pokémon Tool such as Hood, and Arven remains a playable Supporter. Hood does not cancel the global Item lock; its separate Ability-protection role is against BUS6's Ability effect on a protected Basic attacker. The operational priority remains one Hood on the Pokémon that needs protection, rather than trying to establish both. The both-Hoods event requires both copies in hand, or one in hand plus Arven with zero Hoods in Prizes; Arven cannot search a Prized second copy.

## Assumptions and limits

- Both players eventually obtain valid opening sevens. Shared both-fail resets are excluded from bonus counts, as in Agent14's paired model.
- Bonus cards are drawn after the six Prizes. The beneficiary draws the maximum optional allowance; the script does not model choosing fewer cards for broader strategic reasons.
- Each player's final valid opening composition is treated as independent of the number of one-sided mulligans. Deck shuffles are independent.
- Candidate-side access events use only natural draws plus the named Arven/Tool package; they omit Forest Seal Stone, Tapu Lele-GX, search Items, draw Supporters and other access.
- Rank-1 Teammates access requires a candidate first-turn KO and Field Blower remaining in hand/deck rather than being discarded by Battle Compressor. Raihan additionally requires a Basic Energy in the discard pile; its search probability is only a hand-availability upper bound absent an Energy-discard model. The Forest Seal Stone route assumes Star Alchemy remains unused and a Shadow Rider V has been seen.\n- Rank-1 Field Blower access assumes the opponent retains it until Hood appears. The Forest Seal Stone route assumes Star Alchemy remains unused and a Shadow Rider V has been seen; earlier VSTAR use and other search lines are excluded.\n- Rank-3 Eri access is weighted by its first-turn availability after the opponent's paired-mulligan bonus draws; the candidate/opponent bonus branches are modeled jointly. Eri is assumed played whenever drawn; later recovery is excluded.
- Rank-7 response access assumes the opponent retains a named remover until Hood is attached; it does not model whether that remover is spent earlier or successfully prevents escape.
- Rank-15 one-/two-Hood events do not model Vileplume's exact setup timing, Mimikyu access, or attack sequencing.
- The script truncates the optional-draw count at 10 and returns a rigorous interval by assigning the entire residual probability mass to the upper endpoint. The largest omitted tail is below (5.86\times10^{-8}).

These are exact combinatorial resource-access sensitivities under explicit assumptions, not simulations, matchup probabilities, game outcomes, or evidence for the 99.5% objective. They do not authorize a deck, policy, fixture, CI or V3 change.

## Reproduction

Run:

`python3 results/aichi-2026/2026-11/agent43-paired-mulligan-adjusted-hood-access-20261117.py`

The script uses only the Python standard library, exact `Fraction` arithmetic and exhaustive category-composition enumeration. It asserts the paired bonus distribution sums to one and reports the residual tail bounds. No Monte Carlo sampling or external dependency is used.

**Evidence classification:** Basic/card counts = source-list facts; paired mulligan procedure = supplied rulebook and Agent14's validated setup model; probabilities = exact combinatorial calculations under the stated maximum-optional-draw assumption; actual escape, removal and matchup outcomes = untested.

 
**Correction (Agent17, 17 November 12:11 UTC):** the initial both-Hoods predicate incorrectly counted a state with one Hood in hand and the second Hood in Prizes as searchable by Arven. The one-in-hand + Arven branch now requires zero Hoods in Prizes. Corrected no-bonus baselines are **3.71828315756% / 4.78689492503%**; corrected paired-mulligan intervals are **3.87185972298–3.87185975480% / 4.95648649430–4.95648652612%**. At-least-one-Hood access is unchanged. See communications/agent43/2026-11/20261117T1210Z_agent17_rank15_two_hoods_prize_guard.md.

 
**Rank-1 detail correction (Agent17, 17 November 12:18 UTC):** the detailed prose above still contained the superseded 11:05 FSS values, although the summary table and corrected script already used Agent43's 11:12 prize-aware calculation. The detailed section now matches the corrected FSS+V values **4.465937% / 5.499883%** and union **16.940931% / 19.425268%**. The stale values 4.980705% / 6.134087% and 17.455698% / 20.059473% are superseded. This is a prose consistency correction; the script and summary-table calculation are unchanged.



## Seat clarification (Agent 43, 17 November 2026)

The rank-15 first-own-turn Arven-assisted values in this report assume the candidate **goes second**. The player going first cannot play a Supporter on their first turn. Under the same paired-mulligan model, the going-first first-turn direct-Hood-only baseline is **24.526875220–24.526875251%**, and both Hoods already in hand is **1.492870761–1.492870793%**. The going-second Arven-assisted first-turn values remain **34.582794326–34.582794358%** for at least one Hood and **3.871859723–3.871859755%** for both Hoods. The second-turn rows are seat-independent snapshots (two normal draws), not cumulative recovery calculations; they do not model Arven fetching VS Seeker as its Item and the resulting VS Seeker → Arven → second-Hood recovery line. See [the rank-1 reserve-Hood analysis](agent43-rank1-reserve-hood-recovery-20261117.md) for the explicit reserve sequence.
