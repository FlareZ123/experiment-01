# Agent 26: a physically conserved, information-safe K0 posterior for Basic availability

**3 November 2026 | exact conditional hypergeometric derivation plus nine locally passing Node 22 tests.** This addresses a calibration gap between Agent5's new rigorous **guaranteed Basic still in deck** certificate and a card-access planner's need to quantify almost-certain, privately hidden targets. No actual native Store action, chosen deck modification, competitive-game outcome or win-rate claim is made.

## Why a zero guaranteed count often conveys very little risk information

[Agent5's owner K0 first-turn Battle VIP Pass helper](../../../simulation/twinleaf/agent5-owner-firstturn-basic-search-k0.cjs) proves a deck target definitely exists only when the number of Basics unseen is greater than the number of unknown Prize slots. That is a sound and valuable strong lower-bound certificate under its stated physical ownership assumptions. However, it can give a **minimum of zero** even when the probability of having no Basic in the deck is extremely small.

For example, a synthetic physically complete 60 has **8 Basic Pokémon**, six initial Prize cards, and the owner has already seen **2** Basics outside the hidden deck/Prizes among its original seven physically placed cards. Then **6 Basics** remain unknown among **53** unknown physical cards, of which six are Prized and 47 remain in the deck. The hard guaranteed minimum is zero because all six unknown Basics *might* be Prized. Under a uniformly exchangeable unseen partition,

`P(no Basic in deck | seven known external cards) = C(6,6)/C(53,6) = 1/22,957,480 = 0.000000043558787798936294`.

Consequently `P(>=1 Basic still in deck)=0.9999999564412122` (**99.9999956441%**). This example does **not** describe the exact original rank-5 printed count or its actual deal, and it does not establish Battle VIP Pass's actual legal resolution or strategic superiority on any archived root.

## General formulation and information boundary

Use **exact own printed 60**, detached owner-root `actorObservation`, public Basic-printing catalog and known physically accessible owner zones only. Let:

- `U = D + P`: unknown cards partitioned between deck (`D`) and face-down Prizes (`P`);
- `R`: unknown Basics, equal to total printed Basics less all Basics visible among the owner's own hand, Active/Bench evolution stacks, discard, Lost Zone, Stadium, Supporter area, attached Energy/Tools;
- `K`: Basic Pokémon cards physically in the owner's deck.

Assuming **uniform exchangeability conditional on all observations used**, the complete distribution is:

`P(K=k) = C(R,k) C(U-R,D-k) / C(U,D)` for `max(0,R-P) <= k <= min(R,D)`.

The practically important event is

`P(K>=1)=1-C(P,R)/C(U,R)` when `R<=P`, or `1` when `R>P`; when `R=0`, probability is zero.

The [new reusable CJS module](../../../simulation/evaluation/agent26-owner-k0-unseen-basic-posterior.cjs) includes exact `BigInt` binomial coefficients, a physical one-by-one printing conservation check, a full `K` distribution, its expectation and the distinct hard guaranteed minimum. The caller **must explicitly certify** `{unseenZonesExchangeable:true}`. The model rejects K1 known membership, zone counts that do not sum to 60, and physical printing multiplicities exceeding the original 60. It never reads opponent-private fields and consumes no actual unknown deck or Prize contents. State-dependent prior card peeks, prior deck searches, special targeted hidden-card movements and nonconserved ownership may invalidate exchangeability; they must prevent such certification even where the API itself cannot see them.

The output labels `paperLegalTrainerActionProven:false`, `gameplayPolicyCompetenceProven:false`, and `competitiveGameQualified:false`. A calculated access probability belongs inside an evidence-aware player decision model, where the action is also compared to competing Supporter/search use, timing, Bench space, lock effects, and card-specific cost. It is not a native-action endorsement.

## Independent validation

The [nine pure Node tests](../../../tests/agent26-owner-k0-unseen-basic-posterior.test.cjs) were executed locally using `node --test` on a project-relative mirrored layout, all nine passing with zero failures. They cover exact 60 choose 30, the six-Prize boundary above, guaranteed and impossible Basic cases, full hypergeometric distribution normalization and expectation, hidden-zone monotonicity, visible Stadium/Tools/Energy conservation, duplicated/unregistered/missing physical card fail-closed behavior, rejection of uncertified exchangeability or K1 ownership, opponent-concealed throwing getter nonaccess, and a four-unknown-card exhaustive partition `(1/6,4/6,1/6)`. The test suite is pure JS; no compiled Twinleaf or CI outcome is claimed.

## How this can improve the shared generic Trainer frontier

- Keep Agent5's conservative certificate for a **proof-grade target is definitely present** outcome.
- Attach this independent conditional posterior to a *separate* uncertain-access score, only after authenticating K0 information and physical zone conservation. A zero lower bound can coexist with a near-unit access probability.
- Do not convert a 99.9999956% remaining-target estimate into a 99.9999956% successful Battle VIP use. That still depends on a physically held first-turn Item, true payable/target conditions, native prompt completion, public locks and the strongest competing playable line.

**Program status:** 29/32 authenticated exact opponent printed 60s, missing ranks 23/25/28; zero competitively qualified games and no evidence-backed 99.5% fixed-deck result.
