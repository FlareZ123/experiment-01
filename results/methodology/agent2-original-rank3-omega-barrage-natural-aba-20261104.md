# Agent 2: Original-field rank-3 Ω Barrage second Burrow, authentic owner-prompt A/B/A counterfactual

**4 November 2026 | source-specific developmental policy experiment, zero competitively qualified games.**

## Question

A [prospectively registered 32-original-deal source audit](agent2-rank3-fss-float-natural-32-exposure-20261104.md) discovered a native rank-3 Snorlax Stall source-seat-0 terminal involving Bunnelby PRC 121, while [exact Store evidence](agent2-original-rank3-bunnelby-native-burrow-terminal-20261104.md) confirmed twelve singly executed Burrow `AttackAction` reducers, each removing precisely one opponent deck card, and separate opponent compulsory turn-start draws. The original bot repeatedly chose only the first printed Burrow per turn.

The physical card database `cards/en/xy5.json`, `xy5-121`, has the **Ω Barrage** Ancient Trait: “This Pokémon may attack twice a turn.” Its printed **Burrow** attack costs one Colorless Energy and discards the top card of the opponent's deck. The original rank-3 Bunnelby was already Active, with Water Energy MEE attached, so the second attack can be a real owner choice; it requires no Forest Seal Stone, Float Stone, attacker search, or additional Energy in this observed board. This paper/card-text baseline must still be checked against actual opponent response.

The first registered question was: **On the exact original physical deal that already produces a rank-3 native deck-out, does accepting the native second-attack prompt and choosing printed Burrow have a measurable real-Store payoff, and can the untreated result be reproduced byte-for-byte?**

## Registered source and implementation

- Original Aichi rank-3 Snorlax Stall 60 versus original rank-1 Shadow Rider Calyrex 60, canonical converted printings.
- Source seat **0** and original physical **seed 290134**, action limit 260, existing bilateral canonical actor/root policy and paper-Supporter and Energy-attachment guards unchanged.
- Full physical initial deal SHA-256 `e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb`; source original initial deal SHA-256 `ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a`; both matched the independent historical 32-game observation and **all three new A/B/A arms**.
- Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact source script [`simulation/evaluation/agent2-rank3-original-omega-burrow-aba.cjs`](../../simulation/evaluation/agent2-rank3-original-omega-burrow-aba.cjs), preregistration commit `fad590031fc3ca9fa0f34c88165104e3c2314b08`.
- Reversible `SimpleTacticsAi.prototype.decodeNextAction` and `Store.prototype.dispatch` adapters operate *inside* the existing owner decision pipeline. Only for source physical seat0, after its own actually issued `Burrow` root and when **own** Active Bunnelby PRC holds its Water Energy, owner pending `ConfirmPrompt` has printed `GameMessage.WANT_TO_USE_ABILITY`, and the opponent deck's **public card count** is greater than zero, the treatment chooses `true`. Only the matching subsequent owner `ChooseAttackPrompt` for Bunnelby's actual printed `Burrow` is then selected and validated by native `prompt.validate`. All other actions and prompt resolutions delegate to the existing bot. No hidden identities or opponent hand/Prize information enter the choice. The policy is **default-off**, source-seat-specific, and does not modify upstream vendor code.
- Three arms explicitly ordered `control`, `treatment`, `control-repeat`. All three use the identical 60s and seed, with a common initial physical deal. The two baseline root-action ledger SHA-256 hashes matched exactly.
- [Native GitHub Actions **run 41933647347**](https://github.com/FlareZ123/experiment-01/actions/runs/41933647347) **SUCCESS**, existing manual CI workflow, [raw result artifact **13373760245**](https://github.com/FlareZ123/experiment-01/actions/runs/41933647347/artifacts/13373760245), ZIP digest `sha256:ca58d271f7b426e05b079e4b091ed2f8ab9f827de126d30cfcc3084f53193fd1`, uncompressed `agent2-rank3-original-omega-aba.json` SHA-256 `acee4932a655917e6acef7e44cb7df7f12452f8fab4dea4141b52ee358f6ed1a`, 19,762 bytes.

## Native control, treatment, repeated control

| Measured dimension | Control A | Treatment B | Repeated control A |
| --- | ---: | ---: | ---: |
| Exact physical initial deal matched | Yes | Yes | Yes |
| Native game terminal | Yes | Yes | Yes |
| Winner | Source seat 0 | Source seat 0 | Source seat 0 |
| Source actual Burrow declarations | **12** | **19** | **12** |
| Source actual settled Burrow transitions | 12 | 19 | 12 |
| Owner optional second-Burrow accepted `ConfirmPrompt` | 0 | **9** | 0 |
| Owner printed `ChooseAttackPrompt` Burrow selections | 0 | **9** | 0 |
| Ending global turn | **25** | **21** | **25** |
| Total native actions before terminal | **133** | **130** | **133** |
| Opponent native Filch attack declarations | 11 | 9 | 11 |
| Both players still hold all six Prize cards | Yes | Yes | Yes |
| Terminal opponent deck | 0 | 0 | 0 |
| Competitive-paper-qualified game | No | No | No |

Treatment selected optional second Burrow at source turns **2, 4, 6, 8, 10, 12, 14, 16 and 18**, confirmed by nine typed, native accepted `ConfirmPrompt` decisions and nine separate native accepted `ChooseAttackPrompt` selections. The treatment logged nineteen real Burrows, with one of the first attacks per turn and nine second attacks. The game ended at global turn **21** instead of **25**, with source win and opponent deck out in both variants. The two untreated baselines reproduced the exact same original-action-ledger digest, terminal winner and action count. The non-treatment objective of **source win** was already satisfied by the baseline; the experimentally observed improvement was a **shorter native route to the same deck-out outcome**.

The treatment created a changed physical game history after the first decision, as expected from a real counterfactual. Card shuffles, opponent action counts and later board states must be read as the consequence of a new play sequence. No unexposed future hand or Prize configuration was supplied to the bot. The observed opponent repeatedly used Mimikyu's **Filch** to draw additional cards and failed to develop an effective attacker; this matters materially to the apparent speed of deck-out.

## Interpretation and limits

**Supported:** A Bunnelby already established in the original rank-3 full 60 can exercise the real printed optional Ω Barrage two-attacks capability during a genuine complete native replay with native prompt legality validation. The previously default bot declined the extra attacks in the frozen natural game. A local, owner-visible prompt improvement added nine printed second Burrows, and made the already existing native source win occur four global turns earlier in this same physical game. The treatment's objective was directly observed; its baseline A/B/A repeat remained stable.

**Unproven:** No claim of increased win probability, additional game win, universal early-game value, a 99.5% field result, paper-timed competitive success, or beneficial integration across all original source opponents. The source active status, attached Water Energy, and publicly observed rival deck count were favorable. Different opponents could punish repeatedly choosing Burrow, race Prizes, gust Bunnelby, or demand Rototiller and other more valuable second attacks. The rank-1 opponent decision policy was weak in this particular continuation; its repeated Filch likely accelerated its own deck exhaustion. The treatment's exact extra-turn savings are conditional on **one previously outcome-selected physical deal** and cannot be generalized to rates across matchups.

**Release handoff:** The [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25) shared selected baseline needs actual opponent-strong prompt resolution, symmetric active-state checks, all legal alternatives, and genuine game-outcome evidence. This fixture is well suited as an original-source tactical regression for card-game ability-aware owner policy. Do not install this restricted development hook globally or count its A/B/A as three independent matches.

**Overall objective:** Still **29/32** authenticated original Aichi Top32 lists, three missing ranks23/25/28, **zero qualified games**, no selected final fixed60 and no demonstrated 99.5% field win rate.
