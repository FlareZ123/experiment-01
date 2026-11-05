# Aichi Top32 fixed-deck 99.5% target: explicit matchup loss budget and zero-loss evidence

**2026-11-05 | Agent35 | mathematical derivation / prospective evidence policy**  
**Qualification:** no actual competitive matches are yet qualified; all values below are conditional planning mathematics, not measured win rates.

## Target and non-negotiable field coverage

Let `p_i` be the **true** game win probability of the **same frozen 60-card candidate with a frozen playing policy** against the **exact published Aichi 2026 rank-i opposing 60** under a predeclared seating/coin/seed mixture, for `i=1..32`. Assume the objective uses **uniform opponent weights**. The benchmark win probability is

```
p_field = (p_1 + ... + p_32) / 32
target: p_field >= 0.995
loss budget: (1-p_1) + ... + (1-p_32) <= 0.16
```

The last inequality is exact and makes the 32-matchup requirement substantive. If any one opposing deck has true `p_i < 0.84`, a field average of 0.995 is impossible even if the other 31 opponents are defeated in every game. If one true matchup is 0.90, the other 31 would need to average at least `(32*0.995-0.90)/31 = 0.9980645161`. Two matchups at 0.90 would already exhaust more than the entire available loss budget. If a single opponent is a guaranteed loss, the absolute field ceiling is `31/32 = 0.96875`.

These are necessary conditions on **true** probabilities. A noisy observed record does not prove a matchup rate without uncertainty. They do not imply that the target is feasible.

## What a zero-loss statistical certificate would mean

Assume each trial is independent, a **fully qualified real game**, the candidate sixty and all decision policies are frozen before any test, and the opponent is independently sampled uniformly from the complete, exactly verified 32-list field with a preregistered treatment of seat and game randomness. With zero failures among `n` such i.i.d. field-mixture games, the exact one-sided 95% Clopper-Pearson lower bound on `p_field` is

```
L(n) = 0.05 ** (1/n)
n_min = ceil(ln(0.05) / ln(0.995)) = 598
```

Check: `L(597)=0.9949945920`, below 0.995, while `L(598)=0.9950029413`, above 0.995. A design can preassign balanced per-opponent trials and use stratified inference; do not silently treat an unbalanced, adaptively selected tournament sample as an i.i.d. field mixture.

A *different, much stricter* sufficient criterion is a **simultaneous** one-sided 95% lower bound `p_i >= 0.995` for **each** of the 32 matchups. Under Bonferroni, allocate `alpha_i = 0.05/32`; with zero losses per opposing 60 this requires

```
n_min_each = ceil(ln(0.05/32) / ln(0.995)) = 1290
n_total = 32 * 1290 = 41280 games, all wins
```

Check: per-match lower bound at 1289 is 0.9949997671, and at 1290 is 0.9950036335. This is only an illustrative **sufficient** all-matchup guarantee, not an efficient or required sample plan for the field-average goal. In particular, proving all 32 individual rates exceed 0.995 is far stronger than proving their mean exceeds it.

## Requirements before these calculations apply

1. Preserve exact and verified original competing sixties and their provenance for all 32 placements. Current authenticated public coverage was 29/32 (ranks 23/25/28 missing) at the time of writing, so **neither target design is executable as specified**.
2. A real game outcome requires valid paper Expanded 60/60 decks; an engine covering every actually used card and effect; physically settled prompts, Prize, attack and KO; independent correct turn clock; and two competitive, source-independent agents. Engine-aborted, root-capped, silent-prompt or hidden-state-leaking runs are unqualified.
3. Precommit the one candidate 60, the opponent 60s, policy, simulator SHA, balanced seat protocol, seeds and sample/stop rules **before** prospective win samples. Any candidate or policy tuning on the test games invalidates the single fixed-policy certificate.
4. Record all 32 matchup-level results and interval estimates alongside the aggregate. An aggregate without per-opponent denominators can conceal catastrophic matchups. Keep uncertainty and native support gaps explicit.
5. Prefer efficient adaptive discovery only on **separate development data**. Freeze a new policy and register a genuinely held-out evaluation for evidence. Stop futility assessments before spending large CI budgets on an obviously unqualified simulator or missing field.

**Implication for current research:** The present bottleneck is qualified bilateral gameplay and exact opponent coverage, well before any plausible estimate of 99.5%. No amount of development-only passed/aborted root counts can substitute for qualified trials. Use the 0.16 total loss budget to prioritize validated catastrophic matchups once actual games are trustworthy. Keep the 598/41280 figures as evidence-planning reference points, never as win-rate claims.
