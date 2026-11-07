# Agent35: native Powerglass after Lillie converts a real Pass into a one-Prize KO

**7 November 2026 | Agent35 | Pinned Twinleaf retrospective developmental A/B, full physical deal matched. Zero competitively qualified games.**

## One-deal comparison and reproducibility

The fixed paper Expanded 60-card **New Moon Lockbreaker v1** candidate (seat 1) played the **original Aichi 2026 rank11** 60 (seat 0) on the exact previously exposed registered deal. The comparison uses the earlier Lillie-after-Pass native arm as the control. Cards, 60-card lists, source policy registration and initial physical cards were unchanged. The candidate policy is source-independent and enabled for both physical seats, although only this candidate hand supplied the relevant Powerglass.

- **B control:** [CI 42333343834](https://github.com/FlareZ123/experiment-01/actions/runs/42333343834), extracted issue25-common-v9.json SHA256 **7c9c95e37cf9c466d87e053f8ed481844d7acdbc54a619415e8a9d8ab8e5d659**. Native terminal, original source won, final remaining Prizes **0 / 6**, 186 accepted Store roots, 35 global turns.
- **C Powerglass treatment:** [CI 42343871719](https://github.com/FlareZ123/experiment-01/actions/runs/42343871719), artifact ID **13562577670**, ZIP SHA256 **85d086749ccafadb618a499fb4f69c752cd7fdae70e2d93af6bc03a1476c4e1d**, extracted issue25-powerglass-after-lillie.json SHA256 **3bcff7dab646b44db5d5a9f5599ff9f71a5a4848d55c8638e098ce321935a189**. Native *root-cap-unqualified*, **no winner**, 260 accepted roots and 60 global turns, final remaining Prizes **4 / 5**.
- Both match source physical deal fingerprint **a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317**, full two-player physical deal fingerprint **94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7**, both source and candidate list fingerprints, and printed source registration. The first **98 accepted native root objects, ordinals 0 through 97, are byte-equivalent JSON**, including the earlier owner Lillie at root93. The only first difference is original **Pass** versus C **Powerglass PlayCardAction** at root98.
- The source-protected pinned Twinleaf revision was **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. C research commit **a67c4f01e906940a7b060c694cdb1e43c2f5c091**. Both are post-exposure developmental, have no verified competent opponent policy, complete paper rules validation, official event clock, or competitive win-rate admission. The 99.5% target remains unproven.

## Native causal-action sequence

The previously published [paper-conditional root98 opportunity](agent35-v9-root98-powerglass-conditional-knockout-20261107.md) is **now physically observed through an actual KO and Prize selection**, with the exact intervening roots:

| Native accepted root | Actual event |
| --- | --- |
| **93** | Candidate Lillie's Determination, Store-accepted, same B/C |
| **97** | Candidate Squawkabilly ex to Bench, same B/C |
| **98** | C plays held **Powerglass SFA** to Tool-free Active **Unown AOR**; B instead Passes |
| **99** | C ends the turn |
| **100** | Real owner-discard **AttachEnergyPrompt** moves one **Basic Psychic Energy MEE** physically from discard to Active Unown |
| **103**, source turn15 | Rank11 source really attacks with **Super Poison Breath**, 20 attack damage and Poison |
| **107**, candidate turn16 | One Psychic pays Unown's **Hidden Power**, 10 damage against original Active Trubbish FST with **60 prior damage / 70 HP**; genuine accepted native attack |
| **109** | Powerglass activates a second time at end of attack; second real owner-discard AttachEnergyPrompt attaches another physical Basic Psychic |
| **110–111** | Actual candidate **ChoosePrizePrompt** followed by original source **ChoosePokemonPrompt** |
| **113**, settled attack | Attack-settlement witness: source active has changed from Trubbish FST to Tapu Lele-GX GRI, remaining Prizes **[5,6] → [5,5]**. This proves **one real candidate Prize**. Candidate Active Unown retains Powerglass and two Basic Psychic and has 40 damage after ordinary Poison Checkup |
| **118**, candidate turn18 | Second genuine funded Hidden Power attack on promoted opponent. Its settlement reports source remaining Prizes **5 → 4** while candidate remains at 5, consistent with the Poisoned Unown being Knocked Out during subsequent Checkup |
| **260 / turn60** | Match stops at the *registered action cap*, status **root-cap-unqualified**, unfinished. Source has four Prize cards remaining; candidate has five. **No native game winner.** |

The physical Tool audit independently reports **one accepted Tool root, zero rejected, two accepted owner-discard Energy prompts, two actual Basic Psychic movements**, and no recorded opponent-concealed or owner-deck-identity reads. The pinned staged Powerglass E-21 regression and the new owner-native wrapper/unit regressions also passed. The source rank11 player made **no more AttackAction roots after turn15/root103**, while the candidate attacked at roots107 and118. This is a serious *opponent-policy capability* concern and makes the extended apparent survivability unsuitable for deck-strength inference.

## Causal and rules caveats

The locally matched root98 intervention establishes that the Tool can rescue at least one attack and one Prize on the **already examined physical deal**. Because the intervention changes physical state and subsequent autonomous choices, neither endpoint can be used as a tournament win-rate effect. B is a native terminal source win and C is an **unfinished action-capped game**. The root-cap state is not a tie, victory, or forecast. The exact same-deal prefix and Store acceptances support this tactical result only.

**Potential native/paper ordering discrepancy:** The native accepted root sequence is **Hidden Power107 → Wait108 → Powerglass AttachEnergy109 → ChoosePrize110 → Promote111**. At the original abort just before root109, source Active was already empty and the candidate still had all six Prize cards. The supplied Advanced Player Rulebook v3.4 A-01 and D place Knock Out and Prize resolution at the end of attack; E-21 says end-of-turn Powerglass occurs *after an attack has been completed*. Thus allowing the E-21 Tool prompt to precede Prize selection deserves a pinned engine-vs-paper check. This report flags the interleaving as a **rules-fidelity uncertainty**, not a tournament-legality ruling. If the timing changes decision options or state effects, results may require correction.

Additional qualifications: the continued source policy stops initiating attacks after its Trubbish is removed, and the candidate itself makes 21 Pass roots. Neither constitutes strong bilateral play. One public seed is insufficient for matchups, prevalence, causal effectiveness beyond this trace, or aggregate performance; original Top32 inventories ranks 23/25/28 remain unverified.

## Native implementation

- [Agent35 owner-only Powerglass root and prompt](../../simulation/twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs): reversible Store root on a real Pass, choose using detached own hand/discard and public opponent damage; physically pay and attach Tool, then authenticate and resolve recurring AttachEnergyPrompt from own discard, including legal optional empty responses when no Basic Energy remains.
- [Both-seat Lillie and Powerglass replay](../../simulation/evaluation/agent35-v9-powerglass-after-lillie-development.cjs): same registered trial and printed sixty, pre-Lillie row diagnostics on failures, always restores shared patch descriptors.
- [Native wrapper regression](../../tests/agent35-v9-powerglass-native-wrapper.test.cjs), [pure owner selector regression](../../tests/agent35-v9-owner-powerglass-after-lillie.test.cjs), and [composition regression](../../tests/agent35-v9-powerglass-injection.test.cjs). CI checks all three, plus existing Lillie and paper-conditional certificate tests, before one bounded real game.
- Fail-closed investigation: first early abort at root100 had exact redacted message SHA256 **067100363d61992514e01766b09cc15c168c06a08380a575d8384fc1c6cae313**, matching literal **"prompt is not defined"** and fixed. Next abort at root109 had pending AttachEnergyPrompt and tracked the second endturn activation, fixed by persistent Tool marker and optional empty support. These were engine errors, never reported as game outcomes.

**Next work:** isolate E-21 versus KO Prize prompt timing with a minimal genuine Store case, ensure opponent policies attack/fund after the first attacker falls, and use fresh preregistered unseen deals only after full-game policies consistently finish without root cap. Continue optimizing one legal 60-card list only with validated paper and field-wide evidence.
