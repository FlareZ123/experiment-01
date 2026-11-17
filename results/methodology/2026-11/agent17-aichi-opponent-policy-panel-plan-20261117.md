# Aichi Top 32 opponent-policy panel: rank coverage and admission plan

**Agent 17 · 17 November 2026**

## Purpose and decision

The next competitive bottleneck after the canonical V3 acceptance and first rank-1 natural-terminal trace is not another generic bot or a larger 24-rank replay. It is a **rank-complete, independently competent opponent-policy panel** for the owner's unchanged original Aichi Top 32 field.

This note converts the source-field composition into a concrete coverage plan. It does not change the candidate 60, worker policies, seed, V3 branch, or acceptance sequence. It authorizes no fixture or gameplay before the existing gates and first-trace review.

## Benchmark and coverage facts

The primary estimand is the custom cross-format challenge selected by the owner: one English-language international-Expanded-legal candidate against the **unchanged original Japanese Extra Aichi lists**. Do not normalize, substitute, or exclude the five source lists containing Japanese-only promos. Strict Expanded-vs-Expanded is a separate secondary comparison.

Current source coverage:

- 29/32 exact source 60-card lists are transcribed; ranks **23, 25 and 28** remain unavailable.
- Five authenticated lists (ranks **3, 6, 7, 24 and 29**) are not international-Expanded-legal unchanged, but remain in the primary cross-format field.
- The 24 English Expanded-normalized reconstructions are a diagnostic secondary subset, not the primary 32-rank field.
- No original physical-source opponent is paper-admitted, no matchup game is competitively paper-qualified, and no final fixed 60 is selected.
- The current shared status identifies only three opponent-policy prototypes: ranks **1, 2 and 10**. That is 3/32 rank coverage, not a field panel.

Sources: [current fixed-60 decision board](../../README.md), [24-rank diagnostic field composition](../../aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md), [identity-normalized diagnostic field](../../aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md), and [Critic's 17 November field-evidence direction](../../../communications/broadcast/2026-11/20261117T170523Z_critic-stop-gate-drift-and-return-to-field-evidence.md).

## Rank coverage map

"Prototype" below means the current shared status identifies a policy prototype for that source rank; it is not a claim that the policy is independently competent or competitively qualified. All other available ranks need an explicit policy owner, exact-list binding, and competence evidence before they enter the panel.

| Source rank(s) | Source archetype | Source-list status | Current panel status / required direction |
|---|---|---|---|
| 1 | Shadow Rider Calyrex | Exact list available | Prototype; preserve as the first post-acceptance trace opponent |
| 2 | Vileplume Control | Exact list available | Prototype; validate independently before field use |
| 3 | Snorlax Stall | Exact list; Japanese-Extra-incompatible | No prototype identified; preserve original promo identities and validate the lock/escape plan |
| 4, 17 | Raichu Electrode Combo | Exact lists available | No prototype identified; share a family core only if each exact list/config is bound and tested |
| 5 | Mew Genesect | Exact list available | No prototype identified; validate Fusion Strike setup, attack selection, and source response lines |
| 6, 24, 29 | Iron Thorns | Exact lists; Japanese-Extra-incompatible | No prototype identified; preserve Player's Ceremony / Palace Book / Palace Belt identities and implement only research-owned compatibility hooks required by the pinned engine |
| 7 | Snorlax Stall | Exact list; Japanese-Extra-incompatible | No prototype identified; separately cover the denser Tool-removal / recovery configuration |
| 8, 11, 16, 22 | Absol Garbodor | Exact lists available | No prototype identified; shared family core may be reused, with rank-specific counts and lock/attacker priorities |
| 9 | Absol Electrode | Exact list available | No prototype identified; do not collapse into Absol Garbodor without a demonstrated shared policy |
| 10, 12, 13, 14, 18, 20, 21, 27, 32 | Regidrago | Exact lists available | Rank 10 prototype only; remaining ranks need rank-specific deck binding and a validated shared Regidrago policy core |
| 15 | Lopunny Vileplume | Exact list available | No prototype identified; keep distinct from rank 2 Vileplume Control |
| 19 | Raging Bolt | Exact list available | No prototype identified; individual policy |
| 23, 28 | Regidrago | Exact lists unavailable | Blocked; do not synthesize a 60 or treat either as a bye |
| 25 | Raichu Electrode / Electric Rain | Exact list unavailable | Blocked; do not infer contents from rank 4 or 17 |
| 26 | Meloetta Donk | Exact list available | No prototype identified; individual policy |
| 30 | Lillie's Clefairy | Exact list available | No prototype identified; individual policy |
| 31 | Dusknoir Chimecho | Exact list available | No prototype identified; individual policy |

The full Top 32 skeleton is materially different from the 24-list diagnostic subset:

| Field family | Full Top 32 | Current 24-list diagnostic subset |
|---|---:|---:|
| Regidrago | 11 (34.4%) | 9 (37.5%) |
| Absol Garbodor | 4 (12.5%) | 4 (16.7%) |
| Raichu Electrode | 3 (9.4%) | 2 (8.3%) |
| Iron Thorns | 3 (9.4%) | 0 |
| Snorlax Stall | 2 (6.25%) | 0 |
| Singleton strategies | 9 (28.1%) | 9 (37.5%) |

A policy panel trained or evaluated only on the 24 normalized lists entirely omits the five Iron Thorns/Snorlax source lists and all three unavailable ranks. It cannot stand in for the primary field.

## Policy architecture: shared core, rank-specific contract

Avoid both extremes: 32 unrelated hand-written bots are wasteful, but one generic bot or one archetype label is not evidence of competent play.

Use a shared decision core with **rank-specific, immutable configuration**:

1. Exact source 60 identity and hash; original Japanese print identities remain distinct from any engine-only alias or hook.
2. Rank-specific setup and mulligan priorities, including the exact starting-Pokémon and first-turn constraints.
3. Archetype engine plan: resource acceleration, primary attacker/lock, key search/discard lines, and the conditions under which the deck should pivot.
4. Rank-specific counterplay priorities: gust, Tool/Stadium removal, Ability/Item lock, hand disruption, prize denial, and recovery where those cards actually occur in that list.
5. Explicit endgame and prize plan; avoid a policy that can set up but cannot convert its board into a terminal win.
6. Actor-only observation discipline. A policy must not receive opponent hidden zones, native engine state, or physical RNG/seed as decision inputs.

A shared archetype module is acceptable only when the exact list-specific differences are data/configuration and the same core passes rank-specific tests. Rank 2 and rank 15 must not be merged merely because both contain Vileplume; rank 9 must not be silently folded into Absol Garbodor; rank 3 and rank 7 need separate configurations despite both being Snorlax Stall.

## Minimum competence evidence before a rank enters the panel

For each exact rank policy, preserve a short, reviewable competence packet:

- **Deck binding:** the constructed native deck is proven to match the exact registered 60 and pinned source identity. For Japanese-only promos, retain the original identity and separately document the research-owned engine mapping/hook.
- **Core-line witnesses:** native Store traces show the policy can execute the deck's defining setup and at least one intended attack or lock line, including the real prompts, payments, and follow-up effects. A source-text or prompt-mock test alone is insufficient.
- **Counterplay witnesses:** at least one source-relevant response line is exercised against a controlled public board state. This tests that the policy does not ignore the deck's actual interaction package.
- **Decision quality review:** an independent reviewer checks that choices are strategically coherent, legal, and based only on the acting player's observations. A legal-action rate by itself is not competence.
- **Natural-terminal evidence:** the policy completes full games without action caps, unresolved prompts, illegal actions, or unexplained abstentions. Preserve losses and censored/error outcomes; never convert them into wins or byes.

These are policy-admission diagnostics, not matchup wins. Passing them does not qualify the candidate's competitive performance.

## Field evaluation contract after acceptance

Keep the candidate's 60 and candidate-policy version fixed across the field. For every source rank, cover:

- candidate physical seat 0 and seat 1; and
- candidate actually going first and actually going second.

That produces **128 rank/seat/first-player strata** (32 × 2 × 2). Report each rank separately with sample count, wins/losses/draws, incomplete/error count, uncertainty, and concrete failure modes. Use matched physical deals when comparing candidate architectures or policy versions, and bind every receipt to the exact candidate/source list hashes, policy versions, research SHA, and Twinleaf revision.

Available-rank diagnostics may proceed after the current acceptance/trace sequence with explicit labels: 29 source ranks × 4 strata = 116 possible strata before any rank-specific engine blockers. The three missing ranks remain absent, not byes. Do not publish a full-field aggregate until all 32 exact lists and the required rank-policy coverage are valid. Do not substitute the 24-rank English-normalized secondary field for the owner-selected primary field.

## Sequencing and ownership boundaries

1. **Now:** Agent49 remains the sole PR #58 implementation/dispatch owner. Agent6 owns the first unchanged rank-1 natural-terminal trace after exact-head acceptance. Do not create a competing worker, runner, branch, workflow, or fixture.
2. **After the first trace is reviewed:** freeze its candidate/policy/seed provenance, then begin the rank-policy panel work in parallel by archetype. The first trace is an engineering and policy-diagnostic checkpoint, not a reason to tune the deck from one outcome.
3. **Parallel policy work:** assign shared archetype cores only where useful; keep exact rank configs, source deck hashes, and per-rank competence packets separate. Coordinate to avoid duplicating the existing rank 1/2/10 prototypes.
4. **Field completion:** continue only targeted primary-source recovery for 23/25/28 and evidence needed for physical-print admission. No archetype-based reconstruction or closed-search repetition.
5. **Deck decision:** compare structurally distinct fixed 60s only under the same competent rank policies and matched conditions. No candidate is selected by list similarity, a single trace, or a narrow favorable subset.

## Explicit non-goals

- No new workflow, runner, seed, fixture, or candidate/policy change is proposed by this note.
- No source list is normalized to international Expanded to make the primary field easier.
- No policy is called competent because it completes a few legal actions or wins against a weak generic bot.
- No 24-rank aggregate is presented as a Top 32 result.
- No 99.5% claim is supported by this plan.

## Reusable source references

- [Agent39's 24-rank field composition and full Top 32 archetype skeleton](../../aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md)
- [Agent39's normalized diagnostic field and explicit transformations](../../aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md)
- [Agent17's two-Hood deployment / rank-specific Tool-removal synthesis](../../aichi-2026/2026-11/agent17-two-hood-deployment-rule-20261117.md)
- [Current decision board](../../README.md)

**Evidence classification:** source archetype/rank counts are repository source-list facts; current prototype coverage and sequencing are shared project status; the policy architecture and competence packet are proposed methodology; no new game, matchup, win-rate, or 99.5% result is claimed.
