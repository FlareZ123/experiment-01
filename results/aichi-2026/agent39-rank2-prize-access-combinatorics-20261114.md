# Rank-2 Vileplume Control: Prize-access chain combinatorics

**Date:** 2026-11-14  
**Author:** Agent39  
**Evidence class:** exact hypergeometric derivation from the authenticated source 60; card-text/rules interpretation; no simulation or matchup claim.

## Question

How exposed is the rank-2 source list's Peonia / Lusamine / Gladion / Team Yell's Cheer access package to its initial six Prizes, and what does that imply for an actor policy that must choose how many Prizes Peonia takes?

## Source inventory

The authenticated rank-2 entry (Takahiro Ando) in [full-decklists.json](full-decklists.json) is exactly 60 cards and contains:

| Card | Copies | Relevant printed function |
|---|---:|---|
| Peonia CRE 149 | 1 | Take up to 3 Prize cards into hand; replace each taken Prize with a card from hand |
| Lusamine CIN 96 | 1 | Recover two Supporter/Stadium cards from discard to hand |
| Gladion CIN 95 | 1 | Reveal own face-down Prizes, take one, then shuffle Gladion into remaining Prizes |
| Team Yell's Cheer BRS 149 | 1 | Shuffle up to 3 Pokémon/Supporter cards (except itself) from discard into deck |
| Pidgeot ex OBF 164 | 2 | Quick Search: search deck for any card into hand |
| Bunnelby PRC 121 | 2 | Rototiller: shuffle one card from discard into deck |

**Important inventory correction:** this rank-2 list has **one Lusamine**, not two. The two-Lusamine configuration belongs to rank 29. Rank 2 has one direct Lusamine-mediated Peonia recovery, but additional possible recycling routes exist through Team Yell's Cheer or Bunnelby's Rototiller followed by Pidgeot ex Quick Search. Those routes have turn, energy, board, and Supporter constraints and are not assumed to be automatically available.

The card texts above are read from the supplied Expanded card pool archive. The supplied advanced-player rulebook, D-05, says a Trainer effect worded “up to N” permits a choice from 1 through N; only an attack may choose none. Thus Peonia's paper-valid Prize count is **1–3**, and its replacement count must equal the number of Prizes taken.

## Exact initial Prize probabilities

Assume a uniformly shuffled 60-card physical deck and six initial Prizes sampled without replacement. For a set of (m) distinct named physical copies, the probability that exactly (k) are Prized is:

[
P(X=k)=\frac{\binom{m}{k}\binom{60-m}{6-k}}{\binom{60}{6}}.
]

For the four singleton access Supporters (Peonia, Lusamine, Gladion, Team Yell's Cheer), the exact distribution is:

| Number of these four in Prizes | Probability |
|---:|---:|
| 0 | 64.8540% |
| 1 | 30.5195% |
| 2 | 4.4019% |
| 3 | 0.2215% |
| 4 | 0.0031% |
| **At least 1** | **35.1460%** |
| **At least 2** | **4.6264%** |

This means one or more of the four singleton access pieces is Prized in about 35.15% of initial configurations, but all four being Prized is only about 0.0031%. The former is not a failure rate: the pieces can recover or find one another, and the table says nothing about later draw/search or game outcomes.

For any two specified one-ofs, the probability both are in the six Prizes is:

[
\frac{\binom{58}{4}}{\binom{60}{6}}=0.84746\%.
]

Therefore:
- Peonia **and** Gladion Prized: 0.84746%.
- Peonia **and** Lusamine Prized: 0.84746%.
- Lusamine **and** Gladion Prized: 0.84746%.
- Peonia, Lusamine, **and** Gladion all Prized: 0.05845%.
- All four singleton access Supporters Prized: 0.00308%.

For either two-copy Pokémon line (Pidgeot ex or Bunnelby):
- At least one copy Prized: 19.1525%.
- Both copies Prized: 0.84746%.

The two-copy lines therefore have meaningful individual Prize exposure, but their complete loss to Prizes is much less common than one copy being Prized.

## Peonia–Gladion cross-access

For the two direct Prize-access cards Peonia and Gladion:

| Initial configuration | Probability | Consequence |
|---|---:|---|
| Neither Prized | 80.8475% | Both are available outside Prizes |
| Exactly one Prized | 18.3051% | The other access card may recover it |
| Both Prized | 0.8475% | Direct Peonia/Gladion cross-access is unavailable |

If Peonia is Prized and Gladion is not, Gladion can reveal the remaining own Prizes and select Peonia if it is still there.

If Gladion is Prized and Peonia is not, Peonia can select face-down Prize slots. If the player knows Gladion is among (n) remaining unknown positions but does not know which position contains it, selecting (k) distinct positions hits it with probability:

[
P(\text{hit}mid\text{target among }n)=\frac{k}{n}.
]

With six remaining unknown Prizes, selecting 1, 2, or 3 gives 16.667%, 33.333%, or 50%. Before the first physical deck search (K0), if the player does not know whether a singleton target is Prized at all, the blind hit probability is instead (k/60): 1.667%, 3.333%, or 5%.

This is why safe hand-replacement capacity matters. The policy should not simply select three every time: it should choose the largest (k\leq3) for which it can safely replace (k) cards, while recognizing that fewer replacements reduce the chance of hitting a known Prized singleton.

## Repeated Peonia and slot coverage

If Peonia takes (k_1) Prize slots and replaces those slots, then a later Peonia can sample (k_2) **fresh** positions if no intervening event changes the slot mapping. The number of distinct original Prize positions observed is:

[
\min(6,k_1+k_2).
]

For example, two three-card Peonia resolutions can expose all six original Prize positions, provided all six are still present and no intervening shuffle/reindexing occurs. The owner-visited-slot helper is a reasonable mechanism for preferring unvisited physical indices; its ledger must be updated only after the entire native replacement/order chain settles.

Gladion is different: after taking one revealed Prize, it shuffles itself into the remaining Prizes and puts them back face down. This destroys the old slot-to-card mapping. Clear/rebuild the Peonia positional ledger after Gladion. The owner may retain knowledge of the **multiset** of remaining Prizes from the authenticated reveal, but not their new positions; do not conflate owner deck-membership knowledge with positional knowledge.

Other untracked Prize movement, shuffle, reorder, slot compaction/reindexing, reset, or uncertain/aborted resolution must also invalidate or rebuild the positional ledger. Lusamine itself does not move Prizes.

## Current policy implications

The current Agent10 rank-2 policy does not prioritize Peonia as a play or as a recovery target:
- Peonia and Gladion have zero card-play score.
- Lusamine's play/target scoring does not prioritize Peonia.
- Team Yell's Cheer scoring/target priority does not prioritize Peonia.
- Bunnelby's Rototiller recovery scoring/target priority does not prioritize Peonia.
- Pidgeot ex Quick Search / Pidgeotto Air Mail priority does not prioritize Peonia.
- The current prize-slot prompt policy uses native `requiredCount` rather than a Peonia-specific paper 1–3 range, and it lacks original physical slot indices and persistent accepted-visit history.

This is a coverage gap, not evidence that Peonia should always be played or recycled. The choice should depend on current lock/setup state, Supporter contention, energy and attack access, Prize knowledge (K0/K1), available recovery/search lines, and the marginal value of each hand card placed face down as a Prize.

The human-concepts document's UDP/DCI/AMR ideas are useful heuristics here: replacement safety is state-dependent, and should protect cards needed for the current line while preferring genuinely redundant or low-value cards. A raw hand-size threshold is not enough.

## Reproduction

The calculations use only combinations of physical card copies:

```python
from math import comb

den = comb(60, 6)

def exactly_k_prized(m, k):
    return comb(m, k) * comb(60 - m, 6 - k) / den

for k in range(5):
    print(k, exactly_k_prized(4, k))

both_specific_singletons = comb(58, 4) / den
three_specific_singletons = comb(57, 3) / den
four_specific_singletons = comb(56, 2) / den
at_least_one_of_four = 1 - exactly_k_prized(4, 0)
```

## Limitations

- Exact initial Prize distribution only; no draw sequencing, mulligans, deck searches, Prize-taking, or opponent actions are modeled.
- No simulation, human game, matchup result, policy improvement, or win-rate claim is made.
- The recovery routes are card-text possibilities; their practical availability depends on board, Energy, Supporter timing, and the opponent's lock/disruption.
- The 99.5% Aichi Top 32 objective remains wholly unproven.


## Candidate policy value model (hypothesis to test, not a result)

The safe replacement count should be state-dependent. A useful starting abstraction is a **Prize-replacement cost** for each hand card (c) in state (s):

[
C_{\mathrm{prize}}(c\mid s)=V_{\mathrm{keep}}(c\mid s)-V_{\mathrm{prize}}(c\mid s).
]

- (V_{\mathrm{keep}}) includes the card's immediate role in the current turn, unique lock/setup function, energy/resource reserve, and likely next-turn line.
- (V_{\mathrm{prize}}) includes the probability and cost of later access through Peonia, Gladion, or normal Prize-taking, conditioned on current K0/K1 information.
- **Do not count Lusamine, Team Yell's Cheer, or Bunnelby as direct recovery from the Prize zone.** They recover cards from discard; a card placed face down as a Prize requires a Prize-access route or normal Prize-taking.

Let (R(s)) be the hand cards whose replacement cost is below a calibrated threshold and which are not reserved for an immediate line. Then:

[
\mathrm{safeReplacementCount}(s)=\min(3,|R(s)|).
]

A candidate Peonia utility for selecting (k) cards is:

[
U_P(k\mid s)=E[\text{value of the }k\text{ selected Prizes}\mid K0/K1,s]
-\sum_{c\in R_k(s)}C_{\mathrm{prize}}(c\mid s)
-C_{\mathrm{Supporter}}(s),
]

where (R_k(s)) is the (k) lowest-cost safe replacement cards and (C_{\mathrm{Supporter}}) is the opportunity cost of spending the turn's Supporter play. Choose only (1\leq k\leq\mathrm{safeReplacementCount}(s)), and only when the marginal value is positive. The helper's fresh-slot-first rule maximizes distinct original Prize coverage when positions are exchangeable.

For a specific known target among `n` unknown Prize positions, the hit probability is `k/n`. Under K0, if the target is one card in a current pool of `M` unresolved cards and there is no other location information, the blind hit probability is `k/M`; for the initial 60-card deal, `M=60`, giving `k/60`. Later K0 states must condition on cards already observed in hand, discard, play, or other zones rather than reusing 60. These are different information states and should not be conflated.

A corresponding Gladion utility is the value of the best card among the authenticated owner-visible Prize reveal, less Supporter opportunity cost and the cost of destroying the old positional mapping. Gladion does not require a hand replacement, but it does require a source-scoped owner-only reveal and resets the Peonia slot ledger after its shuffle. When both Supporters are available, compare (U_P) and (U_G) rather than hardcoding one as always preferred.

This is a testable policy hypothesis only. The threshold, card values, opportunity costs, and interaction with the rank-2 lock plan require policy tests and then qualified games after the shared worker path is accepted.


## Visited indices versus full owner Prize knowledge

The existing owner-visited-slot helper stores only the set of physical indices previously selected. That is sufficient for a **fresh-first sampling** policy, but it is not a complete owner Prize-knowledge model.

After Peonia resolves, the owner also knows which physical hand card was placed into each selected slot; the OrderCardsPrompt determines that assignment. If the policy may later want to retrieve or avoid a particular known replacement as its value changes, it needs a host-owned owner-private mapping of `slotIndex -> printing`, not only a visited bit. Update that mapping only after the complete native Prize/replacement/order chain settles. Remove a mapping when that Prize is taken. Gladion's shuffle clears positional mappings but may preserve the known multiset of remaining Prize identities. Untracked movement/reorder clears or rebuilds the mapping.

The current actor-observation contract exposes face-down own Prize slots as index-only geometry, so neither the visited set nor the known replacement mapping currently reaches Agent10. Any future owner Prize snapshot must remain actor-private; it must not be included in the opponent's observation.

Fresh-first is an **information-coverage heuristic**, not always the highest-utility choice. Once the owner knows a replacement card's identity in a visited slot, the policy can compare that slot's exact current value with the expected value of an unknown slot (estimated from the remaining known Prize multiset under K1, or the deck composition under K0). It should choose the highest-value (k) slots subject to replacement safety. Fresh-first is the natural fallback when unknown slots are exchangeable and known replacements are still low-value; a known replacement may become worth retrieving as the game state changes.


## Existing native Gladion evidence to reuse

The repository already contains a source-authenticated Gladion observer:
- `simulation/twinleaf/gladion-root-prize-choice-evidence.cjs` requires the live Gladion Supporter source and every remaining own Prize to be exposed before capturing slot/printing references; it verifies the selected physical Prize reaches the owner's hand.
- `tests/agent24-gladion-owner-context.test.cjs` covers owner context, concealed-zone nonreads, the all-Prizes-exposed precondition, and detached snapshots.
- `simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs` observes a native source-rank2 run (seed 20261024, source seat 1, turn 5/action ordinal 47) in which Gladion selected Relicanth TEF; Technical Machine: Evolution PAR was another exposed option. The context-enabled run preserves baseline deck hashes, action ledger, and outcome.

This is retrospective read-only audit evidence, not an Agent10 decision or competitive result, and the rank-2 fixture is not currently registered as a dedicated test/workflow. Reuse this owner-reveal boundary rather than inventing another Gladion observer. It does not yet pass revealed identities into the actor policy. The generic Agent10 `prize-slots` branch currently receives no printing or original slot index and falls back to projected choice order; simply raising Gladion's play score would still select the first slot, not the best revealed Prize. A policy-facing Gladion path must add a source-scoped owner-only printing/slot projection behind the same all-Prizes-exposed gate. The existing Agent21 owner-first Prize helper is about ordinary KO Prize-taking and explicitly excludes card-specific Prize manipulation; Agent3's pinned shuffle audit notes that Gladion's native shuffle return assignment is correct (no engine patch), while its shuffle still invalidates positional mapping.


## Deferred implementation dependency matrix


A reusable native Gladion guard already exists at `simulation/twinleaf/gladion-visible-prize-resolver.cjs`: it requires the actor's live own-Prize prompt, count 1, Gladion CIN in the actor's Supporter zone, all occupied own Prizes `isSecret === false`, an unblocked target, and native `prompt.validate`. It is a SimpleBot `PromptResolver`, not a V3 projection, so reuse its checks rather than importing it into the single-file worker. The V3 projection must pass its already-computed trusted `source` into `projectChoosePrize()`; the current call at `agent36-prompt-projection.cjs` omits that argument, so the Prize projector cannot distinguish Gladion from Peonia or generic Prize-taking.

The static review indicates that the current actor-view path is **not sufficient**. Once the shared worker acceptance stopline is cleared, the minimal integration work is distributed across these boundaries:

| Layer | Current gap | Required behavior |
|---|---|---|
| `agent36-prompt-projection.cjs` | `projectPrompt()` computes typed `source` but does not pass it to `projectChoosePrize()`; Peonia projection has native exact count/filtered selection indices, no physical `slotIndex`; Prize identities are always hidden | Pass trusted source/provenance into the Prize projector. Emit Peonia paper bounds 1–3 while retaining native count 3; attach original physical slot index to each choice. For Gladion only, expose owner Prize printing behind typed source + own-Prize + all-slots-exposed checks |
| `agent49-policy-worker.cjs` | `multiSelectBounds('prize-slots')` enforces exact `requiredCount`; no owner Prize ledger in `ACTOR_KEYS` | Source-aware 1–3 bounds only for actor-owned Peonia; preserve exact count for other Prize prompts; validate slot indices 0–5; accept a separate owner-only Prize-knowledge snapshot |
| Agent10 rank-2 policy | Peonia/Gladion play scores are zero; recovery priorities omit Peonia; prompt branch uses required count/choice order; policy is stateless | Score Peonia/Gladion conditionally; prioritize Peonia through Lusamine, Team Yell's Cheer, Rototiller and Quick Search; use safe replacement cost, slot identity and source-aware count; choose Gladion from revealed identities rather than first choice |
| `actor-observation-contract.cjs` + host ledger | Face-down own Prizes are index-only; only `ownerK1Snapshot` exists | Pass authenticated owner-only visited indices and, if policy needs it, known slot-to-printing mappings; update only after accepted native settlement; keep separate from deck-membership K1 |
| `agent36-prompt-provenance.cjs` | Prompt provenance is recorded during effect execution; continuation callback is passed through unwrapped | Confirm follow-on Peonia replacement/order prompts retain their own `sourceCard`; if not, propagate captured source context through the continuation |
| `gladion-root-prize-choice-evidence.cjs` | Existing owner reveal is audit-only | Reuse its all-Prizes-exposed and actor-owned checks as the gate for a policy-facing Gladion projection; clear positional mappings after its shuffle |

Do not implement these changes while the shared worker acceptance gate remains closed. The current findings are a static contract map, not permission to create a rank-specific branch or bypass worker validation.
