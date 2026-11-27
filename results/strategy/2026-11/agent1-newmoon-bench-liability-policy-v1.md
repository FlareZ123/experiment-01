# Bench Liability Policy v1: stop treating optional Bench access as free value

**Agent 1 · 27 November 2026**
**Scope:** actor-visible paper policy abstraction for New Moon Lockbreaker v1.

For every optional Bench action, enumerate every legal cardinality first. For TPE, explicitly consider 0 targets, every legal 1-target choice, and every legal 2-target combination. Never make “up to 2” synonymous with “2”.

## Bench Exposure Vector

For each resulting board compute BEV = (P_immediate, R_margin, C_movable, T_trap, U_own):

- P_immediate: maximum actor-visible Prize loss available on the opponent's immediate reply from currently established/public resources.
- R_margin: current opposing Full Moon Rondo damage minus candidate Active remaining HP.
- C_movable: opponent-owned damage-counter mass that can be created/redistributed by an established Roxie/Koffing/Sinister-Hand line.
- T_trap: escape burden of the new body if gusted Active under a known Block-style trap.
- U_own: concrete value of that Bench body to the selected continuation, not generic graph connectivity.

Lexicographic preference: immediate win; avoid forced loss; preserve mandatory continuation pieces; minimize P_immediate; avoid lethal Rondo threshold crossings; minimize movable-counter/trap exposure; only then maximize ordinary setup value.

## Channel 1 — Raichu / Electrode packet knapsack

Electro Rain assigns one 30-damage selection per Lightning Energy discarded and may select the same target repeatedly.

Let E be the maximum number of Lightning-Energy units the opponent can currently establish from public state for the immediate attack. Do not infer hidden hand Energy as fact.

For target i, let h_i be remaining HP, v_i its Prize value, and sight_i = 30 only when it is a Benched Pokémon V/GX and a public Telescopic Sight modifier applies. Minimum packet cost is:

c_i = max(1, ceil((h_i - sight_i) / 30)).

Then solve the tiny 0/1 knapsack maximizing sum(v_i*x_i) subject to sum(c_i*x_i) <= E. With at most six candidate Pokémon under the normal Bench limit, exact enumeration is trivial.

Known 14-packet witness with Sight: Gengar & Mimikyu-GX costs 7 packets for 3 Prizes; Tapu Lele-GX costs 5 for 2; a 60-HP Unown/Duskull costs 2 for 1. 7+5+2 = 14 packets and six Prizes. A TPE target that changes the best reply from five Prizes to six is an immediate losing threshold unless the candidate itself wins or disables the attack.

## Channel 2 — Full Moon Rondo threshold crossing

Rondo damage is D(B)=20+20B where B is the total Benched Pokémon on both sides. Every optional candidate Bench body gives the opponent exactly +20 damage when its Clefairy attacks.

For candidate Active remaining HP H, lethal threshold is B_KO = ceil((H-20)/20). If D(B_before) < H <= D(B_after), the optional Bench action creates a KO and is rejected unless it creates a higher-priority win/survival line.

Witnesses: candidate Clefairy ex (190 HP) is KO'd at B=9 because Rondo=200; candidate's own Clefairy KOs rank-2 Stoutland at B=6; with Fairy Zone it KOs rank-19 Raging Bolt at B=5 and ADP at B=6.

## Channel 3 — Roxie / Koffing / Sinister Hand counter mass

One Koffing discarded by Roxie puts one damage counter on every opposing Pokémon. If candidate has N Pokémon in play and source resolves k Koffing triggers (k can be 1 or 2 from one Roxie), new counter mass is C_new = kN.

With BCR Dusknoir Sinister Hand live, those counters are fungible across candidate Pokémon after placement. Adding one Bench body therefore increases the pool by k movable counters, not merely 10 damage on that new body.

Exact lethal witness: candidate Mewtwo & Mew-GX at 270 HP with one Koffing counter plus two PRE Dusknoir Cursed Blasts receives 10+130+130=270. Source gives candidate two Prizes through the Dusknoir self-KOs, takes three from the TAG effect KO, and discounts Bloodmoon Ursaluna by two Energy. Score all three consequences together.

## Channel 4 — Snorlax Block trap surface

For each proposed low-impact Bench body record printed Retreat Cost, attached Energy, whether normal retreat is prohibited by Block, switching access, attack damage versus Snorlax, and any evolution route that changes the escape set. Unown with Hidden Power 10 and no switch route is high trap exposure; Duskull with an actor-visible Dusclops continuation may not be.

Do not encode a card-name blacklist. Trap value is state dependent.

## Positive Bench value: do not overcorrect

Bench when the body is a mandatory continuation: Duskull for near-term Cursed Blast, Clefairy for a Stoutland/Dragon KO, Solrock+Lunatone for asymmetric Path, a second Basic to avoid rank-26 no-Pokémon loss, or a fresh attacker needed before the Active is KO'd.

The operative question is: Does this exact Bench body improve the selected continuation more than it increases the opponent's strongest reply?

## Information boundary

Use public board/discard/attachments/Stadium, revealed cards, exact Prize counts, own hand, settled opponent actions, and exact source list only for copy-count bounds. Do not treat hidden Guzma, Energy, Telescopic Sight, Roxie/Koffing, or future draws as present without evidence. A later belief model can assign probabilities; this acceptance rule must not turn decklist membership into hand knowledge.

## Required policy trace

Every optional Bench decision should expose legal target sets considered, selected targets, selected continuation, immediate Prize ceiling before/after when spread is established, Rondo damage before/after when relevant, movable-counter delta, trap escape route, and any mandatory-continuation override.

This one rule subsumes REG-TPE-SPREAD, RAI-BENCH-FRONTIER, STALL-TPE-NARROW, R30-RONDO-BENCH-EXTERNALITY, R31-KOFFING-WIDE-BOARD, positive Rondo thresholds, and the rank-26 mandatory-second-Basic exception.

No deck change or competitive result follows.