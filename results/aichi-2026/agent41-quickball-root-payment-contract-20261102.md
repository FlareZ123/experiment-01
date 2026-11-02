# Quick Ball root/payment contract: accepted native action can violate its own duplicate-discard rationale

**Agent 41 | 2 November 2026 | executable pure audit, not a new native game**

## Evidence and scope

Agent 8's `chooseQuickBallRootIntent` proposes Quick Ball when the acting owner visibly holds at least two copies of another exact printing. This makes a disposable other-printing choice available at the root. It does **not** ensure that the native mandatory `ChooseCardsPrompt` actually selects that copy.

Agent 9's [archived native evidence](agent9-rank5-quickball-native-payment-search-chain-20261102.md), same-code [negative comparison](agent9-rank5-quickball-same-revision-negative-regression-20261102.md), and [CI 41419769572](https://github.com/FlareZ123/experiment-01/actions/runs/41419769572) show an actual source-owned Quick Ball FST at rank-5 physical trial `5:0:B:new-moon-lockbreaker-v1`, turn 22/root 92: its mandatory payment selected **Secret Box TWM**, a **singleton in the authenticated original printed 60**, and subsequently searched Dedenne-GX UNB. Other actual payments included Double Colorless Energy SUM. This is a root-intent/payment disconnect, **not** a Pokémon paper-rules violation, proof that a better discard was held in that archived hand, or a causal explanation for missing attacks. No new native game was executed in this report.

## Reusable executable test

`simulation/evaluation/agent41-quickball-payment-contract.cjs` is a pure, conservative post-choice audit. It takes the **actor's own hand before the accepted root**, accepted Quick Ball printing, physically selected payment printing, ownership seats and native root/payment acceptance flags. It removes the played Quick Ball from the available hand, then evaluates whether an other-printing duplicate was originally present and whether a duplicate was actually consumed.

The explicit statuses include `DUPLICATE_PRINTING_PAYMENT`, `SINGLETON_PAYMENT`, `OTHER_QUICK_BALL_PAYMENT`, `ROOT_HEURISTIC_UNMET`, and separate witness/owner/membership failures. The return expressly marks competitive qualification false. It does not receive opponent hidden hand, face-down Prize identities, or deck contents.

`tests/agent41-quickball-payment-contract.test.cjs` contains six passing local Node built-in test cases. The test calls the **exact current** `chooseQuickBallRootIntent` implementation, verified by independently reproduced matching Git blob SHA `d687cc353b731f56e785be9cf55ef55fc197e4a3`. A synthetic eligible hand with two DCE and one Secret Box demonstrates that an actually selected Secret Box payment defeats the root heuristic; paying a DCE instead conservatively preserves one copy. Further cases require the owner hand and native receipt, disallow assuming a root duplicate when absent, and distinguish paying another Quick Ball. These are pure fixtures. The original root-92 private hand was not reconstructed here.

## Integration criterion

The canonical actor composition already accepts opt-in `actorHandDiscard:true`, using Agent 47's owner-hand-only mandatory discard handler. Its isolated tests demonstrate duplicate preference. **Whether it controls this particular Quick Ball payment in a natural original Store game is unverified.** Do not turn this new read-only audit into a fabricated payment fix or reinterpret Agent 9's already frozen eight paired deals as protected.

The next registered **symmetric two-seat** development profile should opt into a deliberately coupled Quick Ball root and real actor hand-discard prompt policy, then preserve for each actual root: actor-only pre-root hand, accepted PlayCard, native physical payment, selected Basic search, Bench effects, subsequent evolution/attack, opponent response, terminal horizon, errors, and caps. Run this audit on each root's physical payment chain and veto any unverified or singleton-payment root from being reported as having satisfied the duplicate-discard *policy rationale*. A repeated-card payment is a narrow resource invariant, and by itself cannot establish good card choice, timing or game strength.

Agent 9's four-scope historical diagnostic [41424333037](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037) is independent. Source-only or candidate-only flags are useful for causal probes, and must not be substituted for an identity-neutral benchmark policy.

**Field status:** 29/32 authenticated original Aichi source 60s (23/25/28 missing), zero competitively qualified games, no demonstrated 99.5% fixed deck.
