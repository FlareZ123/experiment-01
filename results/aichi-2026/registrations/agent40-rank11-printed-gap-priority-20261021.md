# Registered one-line, common-policy printed-cost priority challenge

**Agent40, 21 October 2026. Development-only pre-registration before editing scorer and running native CI.**

## Source and hypothesis

The exact existing [Agent45 source-first rank11 native pair](../agent45-canonical-sourcefirst-recipient-native-negative-20261021.md) shows physical source rank11 / New Moon source-first candidate seat B, seed `482443328`, physical source-deal SHA256 `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and frozen checkout `6f43e03313611b388ba763e72befec3261de129e`. The previous native treatment attached `Psychic Energy MEE` to Active `Galarian Articuno V CRE` at global T22, native ordinal 113. That reduced Psyray's printed remaining Basic-attachment count from three to two, still short of attack; next candidate root was Pass.

Actual visible Bench from the preceding source-settled Psychic: two energyless `Duskull` (Future Sight [Colorless]), energyless `Gengar & Mimikyu-GX` (Horror House-GX [Psychic]), and energyless `Latias ex` (Eon Blade [Psychic,Psychic,Colorless]). The held Basic Psychic could close one Duskull's printed Future Sight cost. Since Bench attacks require promotion before use, this is a candidate policy defect and **not** a demonstrated better play. Source Oranguru V printed Psychic's damage scales with Energy attached to the opposing Active; native Articuno takes 30 at T21 and 80 at T23/T25/T27 with the Energy attached at T22, ending in a two-Prize KO at T27.

The existing `agent44-actor-energy-recipient.cjs` sorts owner-visible candidate attachments by categorical Active preference before the post-attachment shortfall. **Hypothesis:** sorting primarily by remaining printed attack-cost gap, using the existing priority as tiebreak, changes the genuine T22 Energy recipient to a Bench recipient with a zero shortfall. Its effect on active damage, future source reply, attack settlement, Prizes, or bounded terminal is **unknown**; the alternative may be worse and must be retained.

## Frozen experiment contract

1. Fork exactly the previously archived recovery head `6f43e03313611b388ba763e72befec3261de129e` to branch `agent40-sourcefirst-energy-gap-20261021`. Preserve the same canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs`, same source and candidate 60s, same source policy, same seeds and action cap, same paper Supporter discipline and hidden-information settings.
2. Make one scorer policy change: compare `gapAfter` before old `priority` in the existing `possibilities.sort` call. Update existing pure tests to register the old/new decision distinction. No new feature flag or workflow. Do not change attack policies, setup policy, hand visibility, opponent tactics, or card printings.
3. Re-run the existing manually dispatched `agent7-canonical-actor-bilateral.yml` with the prior recipient-ON input package: `source_first_retrospective=true`, `actor_energy_recipient=true`, `energy_frontier=true`, `owner_single_search=true`, `actor_hand_discard=true`, `actor_choose_pokemon=true`, `actor_quick_ball_root=true`, `native_generic_fallback=true`, `special_energy_root=true`, `paper_terminal_attack_ko=true`, remaining toggles at defaults. The underlying runner retains its own mandatory-option and native-pressure settings. Leave original whole-packet strict epoch failures intact; source-first stage already has the minimal independent recovery conditions on the frozen recovery head. Any mismatch in prior observed input flags invalidates the paired outcome claim and must be explicitly reported.
4. Archive all four historical and all four source-first attempted rows, including failure/cap and source-deal fingerprints, even if a specific T22 alternative does not happen. Compare exact first recipient divergence, native Store acceptance, subsequent candidate actual AttackActions, opponent settled attacks and damage, Prize counts, 260-root cap and final terminal. Preserve all outcomes; do not choose a different source seed or scene after seeing results.
5. Report as **retrospective development contrast**, not competitive matched gameplay. A policy that funds a Bench attack may still be strategically inferior because switching, attacker quality and opponent counterplay are not yet modeled. No reported winner counts as a qualified win.

## Expected diagnostic possibilities

- **No divergence:** the actual target condition was absent or a different policy layer dominated; preserve as negative.
- **New Bench attachment and unchanged offense or loss:** the proposed sorting change addressed printed costs, but did not solve the common-policy competitive weakness.
- **Different Store prompt/damage/Prizes:** analyze full actor and source response, including whether changed board interactions rather than Energy location caused an apparent improvement.
- **New rejected action or strict epoch failure:** keep the exact error, halt any strength comparison, and investigate native legality or archival integrity.

This protocol challenges exactly one common policy decision and does not claim that rank11 T22 is representative of any wider meta distribution. 29/32 exact opposing 60s, zero competitively qualified games and no validated 99.5% single deck.
