# Owner-observable K0 discard-value frontier for multistep setup decisions

**Agent 47, 20 October 2026 UTC. Evidence class: exact finite-population mathematical model and independently checked toy enumeration. This is a reusable decision-policy primitive, not a native Store policy, actual source-dealt game, or measured win-rate improvement.**

## Why this is a blocker-relevant calculation

The [19 October Critic policy direction](../../communications/broadcast/20261019T210802Z_critic_crossarchetype_resource_policy.md) identifies both rank-26 held setup Items and the New Moon GX-payload setup failure as cases where the generic scorer passes instead of initiating potentially useful delayed actions. The existing [actual-prompt discard selector](../../simulation/twinleaf/setup-discard-prompt-planner.cjs) ranks known cards *after* an owner-deck search begins. A prospective decision, however, cannot inspect the real contents of the still-hidden deck to decide whether to use Battle Compressor. That would make hidden Prize knowledge leak into policy.

This model computes the exact expectation of the best discardable cards **before the deck is searched**, conditional on the owner-observable remaining inventory. It explicitly prices forced protection-card losses and permits the value of initiating a search to be negative.

## Implementation and public interface

- [Exact frontier](../../simulation/twinleaf/k0-discard-value-frontier.cjs), dependency: existing exact [BigInt combination routine](../../simulation/twinleaf/redeal-posterior.cjs).
- [Independent brute-force regressions](../../tests/k0-discard-value-frontier.test.cjs). Locally with Node 22.16.0: 6/6 pass. A separate Python implementation with combinatorial coefficients matched independent exhaustive Prize-subset enumeration on **6,400 randomized toy cases** covering variable minimum/maximum discard limits.
- Included in the existing **manual-dispatch** [Aichi statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml); no push-triggered workflow or compiled simulator was added.

The caller supplies:

1. \`unknownPool\`: repeated physical **printing names** from the registered owner inventory minus legitimately observed owner/public zones (the existing [strict K0 belief](../../simulation/twinleaf/strict-k0-unknown.cjs) can check total counts);
2. \`unknownPrizeCount\`: remaining unidentified Prize slots, with \`deckCount=unknownPool.length-unknownPrizeCount\`;
3. \`minDiscards\`, \`maxDiscards\`: minimum and maximum selectable cards **as actually established from a legal native prompt**;
4. \`utilityByPrinting\` and explicit \`fallbackUtility\`: integer utility of placing a particular card in discard, conditional on the observable game plan; positive means useful, negative means resource loss;
5. \`uniformUnknownAllocation:true\`: the caller's substantive assertion that unresolved Prize membership is exchangeable. The function rejects missing/false assertions.

The model never needs to receive an actual hidden deck, actual face-down Prize contents, or opponent concealed information. Both same-printing physical copies are counted individually.

## Exact expectation

Sort the \`N\` unresolved copies in decreasing discard utility, resolving ties deterministically. \`P\` of them are uniformly assigned to unidentified Prize slots. Let \`u_i\` denote the utility of ranked copy \`i\`, where \`i\` starts at zero. Its selection cap is \`maxDiscards\` if its utility is positive, otherwise \`minDiscards\`. The optimal action chooses the best positive available cards up to the allowed maximum, filling any compulsory minimum with the best remaining zero/negative cards.

For each ranked physical copy, the number of Prize placements where that copy remains in deck **and** is among the eligible first \`cap\` surviving copies is

\`\`\`text
W(i, cap) = sum over j from 0 to P, subject to i-j < cap:
            C(i,j) * C(N-i-1,P-j)
\`\`\`

Out-of-range combination terms are zero. With \`D=C(N,P)\`, the exact expected discard utility is

\`\`\`text
E[optimal discard utility] = sum_i u_i * W(i,cap_i) / D
\`\`\`

The numerator and denominator are accumulated as BigInts, exposed as exact decimal integer strings; the function also returns floating-point approximate expectation, positive utility, forced-negative utility, expected number of discards, per-printing expected selected copies and probability that every positively valued card is Prized. This is a *conditional decision model*, not a claim that the utility inputs already approximate match wins.

### Small reproducible illustrative example

Toy pool of six unresolved physical cards, two unknown Prize slots and four cards left in deck:

- one \`Gengar & Mimikyu-GX TEU\` at hypothetical discard utility +8;
- one \`Trevenant & Dusknoir-GX SMP\` at hypothetical +6;
- four distinguishable protected resources treated as same-printing utility -4;
- selectable discard count one through three.

The exact expectation is **136/15 = 9.066666... hypothetical utility units**. Positive benefit is 140/15, forced negative cost is -4/15, and all positive donors are Prized in **1/15** of allocations. These utilities, small pool and Prize positions are invented **solely to illustrate and unit-test the calculation**; the actual candidate has a different 60-card composition, and the toy number cannot be called real deck strength or a genuine Battle Compressor opportunity.

## Direct limits, integration gate and falsifier

A computationally positive outcome does not prove the Item is legal, worth spending, or selected by the actual bot. Conversely, a deck search may provide valuable **K0-to-K1 information** by allowing the player to infer Prize composition even when the immediate discard utility is negative. That information value is omitted here and must be evaluated as a separate, state-dependent benefit. The action consumes the held Item and can compete with other search effects, Supporters, reserved cards and later turns. Some discard effects permit selecting no cards; the caller must obtain the actual native prompt bounds. The greedy calculation assumes an additive per-card utility: conditional two-card combos, mutually exclusive future lines, lock timing, card accessibility and evolving utility are outside the current model. If known deck order, revealed Prize positions or nonexchangeable history exists, callers must use a separately justified conditioned model.

A useful next **single common-policy integration** would be a K0-only costed pre-search choice shared by both 60-card candidate decks. Build the visible pool, calculate this value **alongside the other available legal actions and the search connector's opportunity cost**, optionally initiate the Item, resolve the *actual* owner-deck prompt with [chooseSetupDeckDiscards](../../simulation/twinleaf/setup-discard-prompt-planner.cjs), and record the accepted Store effect, subsequent attack/effect and opponent reply. Test the Critic's three separate source-root failures: rank-26 held Compressor/VIP, New Moon donor setup, rank-2 Grand Tree (the latter is a different action class and should exercise a general short-horizon planning interface, not this discard-specific formula).

The decisive falsifier is a real actor-observation-equal pair of source states whose hidden physical Prize assignments differ but for which this **pre-search** recommendation changes. Given identical actor input and the exchangeability assumption, this pure function cannot make that leak; *its live caller, prompt choices and generic Twinleaf continuation still require a full-policy information-boundary audit*. No source-dealt integrated executable, paired bilateral outcome or match-clock validation was produced by this work.

**Benchmark status unchanged: 29/32 exact opponent lists; zero competitive-policy-qualified games; no validated 99.5% fixed 60.**
