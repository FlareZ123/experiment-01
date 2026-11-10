# Agent46: preregistered original-rank1 donor Treasure paper-payable source A/B

**10 November 2026, frozen before prospective runner creation or execution.**

## Hypothesis and source policy

A historical original rank1 Shadow Rider Calyrex versus rank10 Regidrago paired trial found one actual Mimikyu Copycat after owner-visible Mysterious Treasure paid physical Dialga-GX into the original owner's discard. To rule out a cherry-picked development-only result, run a **fresh prospective** batch with one precisely frozen policy difference: in the treatment, when the opponent has a publicly visible Regidrago, the owner has a real Mimikyu already in play, a real Dialga-GX and Mysterious Treasure in hand, no owner-discard Dialga-GX, and unused GX, the owner's normal Trainer tactic preferentially plays Treasure and its true physical discard prompt selects Dialga-GX. The native Store decides legality, response prompts, actual source printed targets, paid discard and attack. No opponent hidden zone or pre-search own deck knowledge enters the action.

Control: existing source `installMimikyuFundAndPromote`, including Fog, Treasure-search-only, Underworld Door, owner Psychic targeting, and funded promotion. Treatment: `installMimikyuDonorTreasure` installs that identical control stack and adds the donor-discard branch. Every other engine hook, policy, starting deck and native action cap remains equal.

## Frozen prospective source panel

**Eight independently sampled fresh seeds** (executed actual RNG, prior development seeds excluded):

`[1971080544,2098059327,825299264,600907754,1631936219,977618216,200360774,843769183]`.

For each seed, test rank1 in seat 0 and seat 1 versus original rank10. Execute control and treatment for both seats under exactly the same seed and `isolatePolicyRandomness:true`. This yields **16 paired original physical openings and 32 full-native attempts**. `maxActions=180` for all arms; no exclusions of bad or censored status. Preserve physical-source deal matching and 60-card hashes, native engine, source ranks, previous actual Apex, owner actual Copycat, actual accepted Treasure roots, physical discarded donor prompt events, post-Apex physical owner turn-start conditions, final Prize and native terminal/censored outcomes.

**Primary mechanistic measure:** treatment actual Store-reported Mimikyu Copycat attack declarations versus control, unconditionally by physical pair; report donor physical payment and actual Treasure roots as intermediate preconditions. Also report real opponent Apex exposure and all native error/censors. Event callbacks are speculative policy proposals, not accepted actions. Do not reinterpret a failure or natural non-exposure as an omitted attempt.

A copied `Copycat` declaration alone does not establish exact Timeless-GX copy choice, damage resolution, or a game win. The original rank1 deck could be harmed by burning a Mysterious Treasure or donor prematurely. The paper game strength, 32-rank field coverage, and 99.5% objective remain **not qualified** by these weak-bot native outcomes. Do not infer statistical game strength from native terminals or from a selected developmental seed.

**Execution entry point (planned):** `simulation/evaluation/2026-11/agent46-mimikyu-donor-treasure-prospective.cjs` under existing manual `mimikyu-source-counter-policy.yml`.
