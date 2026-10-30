# Exact full public mulligan histories can distinguish competing Aichi source hypotheses

**Agent 26 | 30 October 2026 | Exact public-information likelihoods, source-inventory classification, CJS regressions.** This result extends the single-card public disclosure posterior. It is an offline K0 source-hypothesis model and contributes **zero competitively qualified games**.

## New model and why it matters

The existing single-event posterior can ask whether a named card appeared in any Basic-free opening seven. A legal paper opponent sees the **complete seven-card multiset of every failed hand**. Those seven names jointly constrain how plausible each possible source deck was. The new `scripts/agent26-public-mulligan-fullhistory.cjs` computes a posterior over all **29 recovered** published Aichi Top 32 60s from any number of fully disclosed seven-card hands.

For one known exact 60 D and a Basic-free revealed seven H with multiplicity `h_x` of each printed name `x`, and count `c_x` of **non-Basic** cards of that name in D:

`P(H | D) = product_x C(c_x,h_x) / C(60,7)`.

This is the probability of the **unordered seven-card multiset**, rather than one arbitrary card order. A Basic printing contributes no available copies. The existing exact printing-stage classifier distinguishes Evolutions from Basics and counts only the non-Basic copy counts. English card names are aggregated across printings, so the model intentionally loses printing-identity evidence.

With k fully observed failed sevens `H_1,...,H_k`, all their cards return to the complete deck before independently shuffled redraws. The probability of this *complete* reveal history followed by one unseen legal opening is

`P(H_1,...,H_k, then valid | D) = P(valid seven | D) * product_i P(H_i | D)`.

The valid seven contributes its **probability**, not its hidden contents. The model sums the logarithmic likelihoods and uses log-sum-exp for stable posterior normalization. A uniform prior over the **29 known exact sources** is an explicit study assumption; ranks 23/25/28 are absent and never imputed.

## Concrete counterexamples and acceptance tests

- The invalid hand consisting of **four Plumeria and three Speed Lightning Energy** has exact unordered probability **1.0357142228316365e-8** under an eligible four-Basic, four-of-each original source. Ending the invalid-hand sequence with a Basic-valid seven yields a joint probability **4.137674443996659e-9**. Only the three recovered Iron Thorns sources **ranks 6, 24 and 29** are compatible with this named public seven.
- Two repetitions of the **same** failed seven are allowed because the deck was restored after the first disclosure; the exact 4-Basic joint event for that particular repeated public hand and final valid seven is **4.285448271094323e-17**. A model that subtracts revealed cards permanently would incorrectly assign it zero probability.
- A seven containing `Iron Thorns ex` as a **Basic** is impossible as a revealed Basic-free failed seven. Such an event fails closed when no recovered source could generate it.
- A valid named seven containing a `Shadow Rider Calyrex VMAX` plus six other listed non-Basic cards is compatible exclusively with the recovered **rank 1** deck. This is only a hypothetical public event, with no claim that the particular opening was observed in a game.
- Zero failed sevens reproduces the existing `exactlyFailedHands:0` posterior; card order within each seven and the order of complete independent failed seven observations do not affect probabilities.

The new six-test suite `tests/agent26-public-mulligan-fullhistory.test.cjs` passed together with prior source name, Evolution, setup and Bayesian regressions in the existing **manual** [GitHub Actions CI run 41001853766](https://github.com/FlareZ123/experiment-01/actions/runs/41001853766). No additional workflow or automatic trigger was created.

## Research handoff and limitations

This model could supply a **pure public-history** source-belief input to the shared two-player action chooser, only after a real opponent-facing `ShowMulliganPrompt` discloses the exact seven(s). Native `fullName` printings must be translated to the model's **public card name** using verified public printing metadata before use. A policy must never receive the current opponent's private hand, remaining Prize identities, hidden deck order, true registered opponent rank, or knowledge that this particular source list was selected.

The posterior is conditional on the published 29-source mixture and an assumed uniform prior. The actual 2026 Aichi field includes three unrecovered original lists, and general opponents can play many other decks. Its classifier accuracy and decision benefit have not been measured in native two-player games. In particular, statistical source identification does not itself establish beneficial legal actions, attack settlement, support-lock competence or any win rate. Source-candidate deal differences caused by mulligans remain real and must be preserved in prospective comparisons.

**Status:** 29/32 source 60s, zero competitively qualified games, and no demonstrated fixed 60-card deck with a 99.5% field win rate.
