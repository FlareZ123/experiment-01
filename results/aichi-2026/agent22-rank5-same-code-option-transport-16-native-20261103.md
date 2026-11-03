# Agent 22: same-code rank5 option-shape transport, 16 original-Store attempts

**3 November 2026.** Manual CI [41575101335](https://github.com/FlareZ123/experiment-01/actions/runs/41575101335), success; [all native rows and frozen manifest artifact 13203581669](https://github.com/FlareZ123/experiment-01/actions/runs/41575101335/artifacts/13203581669) (zip SHA256 `e64c528a6d486b7811f15606f0421de27d836363cade959936e4c4385f737048`). Native experiment branch [`agent22-rank5-options-transport-20261103`](https://github.com/FlareZ123/experiment-01/tree/agent22-rank5-options-transport-20261103), initial executed revision `d39132fd5006df63b7449b0b951f0477d6f2a99a`. This is a **retrospective mechanistic transport study** reusing all four historical original-source rank5 physical seed groups, not independent prospective win-rate data.

## Actual tested causal contrast

Using the **same pinned joint-v1 runner source blob `15171b5112492d20f0de5b3fdf5f3a6423fee1a4`** and native engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, we ran exactly two policy modes on all eight candidate/seat/deal combinations: historical v3.1 **24-option selection** ported into the joint code revision (with native root cap 260 and rank admission explicit), versus the complete later joint-v1 **92-option selection** on that same runner. All candidate and opponent printed 60s were unchanged. Original opponent roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200` matches the actual authenticated rank5 Mew/Genesect. The frozen new registration `fc0fac1a12b3b1debe45f83c691416f97a1c270f` and underlying joint profile `f6ba98e6a259daa835397689799dc35550a1c14d` were checked before native execution. Both modes used identical `AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=true` ambient receipt recording.

**Eight of eight same-candidate paired rows had identical original-source physical-deal fingerprints and actual starting players**. All 16 native rows were retained, including caps and terminal status. No native errors or missing rows occurred. Source attack events are from the shared native `sourceAttackSettlement.attacks` ledger; all reported attacks were named `Cross Fusion Strike` and marked `settledPromptChain=true`, with no cross-clock-reset settlement. This is a real native attack trace, with neither a fully qualified paper gameplay policy nor a tournament clock.

| Original rank5 trial ID suffix | 24-option Cross Fusion Strikes | 92-option Cross Fusion Strikes | 24-option disposition | 92-option disposition |
| --- | ---: | ---: | --- | --- |
| `0:A:champion-reference` | 0 | 0 | Action cap | Action cap |
| `0:A:new-moon-lockbreaker-v1` | 0 | 0 | Action cap | Action cap |
| `0:B:champion-reference` | 0 | 0 | Engine terminal | Engine terminal |
| `0:B:new-moon-lockbreaker-v1` | 0 | 0 | Engine terminal | Action cap |
| `1:A:champion-reference` | 3 | 3 | Engine terminal | Engine terminal |
| `1:A:new-moon-lockbreaker-v1` | 4 | 5 | Engine terminal | Engine terminal |
| `1:B:champion-reference` | 0 | 4 | Action cap | Engine terminal |
| `1:B:new-moon-lockbreaker-v1` | 1 | 5 | Action cap | Engine terminal |
| **Total** | **8** | **17** | **4 terminals / 4 caps** | **5 terminals / 3 caps** |

The older positive v3.1 study reported 8 historical rank5 source attacks on these seed labels. The ported option selection under the newer **same-code** runner reproduces that per-arm count pattern, although matching counts alone do not prove its historical code's physical states were identical. Source rank5 attacked on three of eight old-shape attempts and on four of eight joint-shape attempts. The newer joint configuration is **not generically unable to attack**. Its preceding selected rank5 two-seed-group, zero-attack study used different source seed groups, so comparing those two studies without deal matching would have led to an incorrect blame assignment.

## Mechanistic root witness from exact matched deal

For original source rank5 `1:B:champion-reference` and `1:B:new-moon-lockbreaker-v1`, the two modes had matching root-ledger prefixes through native action ordinals **182** and **175** respectively. The first differing source-owned root decision occurred at:

- champion reference, action ordinal **183**, global turn **47**, source seat **0**: 24-option `PassTurnAction`, joint `RetreatAction`; joint followed with a native `Cross Fusion Strike` action at ordinal **184** and first settled source attack record
- New Moon, action ordinal **176**, global turn **47**, source seat **0**: 24-option `PassTurnAction`, joint `RetreatAction`; joint followed with `Cross Fusion Strike` at ordinal **177**

Both source players had **Genesect V with Double Colorless Energy Active**, a **Benched Mew VMAX**, and another Benched Genesect V in this period. The baseline repeatedly passed with mobility retained, including held Float Stone or Guzma in the read-only `sourceOwnerPostPassMobility` observer, while joint promoted the DCE-funded Mew VMAX and took native attacks. The joint v1 selected option mix enables `actorDceMewMobilityRoot` and `actorFlexiblePaidRetreatRoot`, which were omitted/off in v3.1. The code for `agent37-dce-mew-paid-retreat.cjs` is specifically conditioned on the Active Genesect V carrying one DCE and a Benched DCE-funded Mew VMAX with a Genesect donor; `agent10-flexible-paid-retreat-frontier.cjs` handles a separate single-printed-retreat-cost condition. This makes a **DCE-specific paid retreat module** the leading *mechanistic hypothesis* for the turn-47 divergence; **option-level causal attribution awaits ablation**.

Other first divergences among matched rows were opponent Underworld Door versus attachment, Moon Press versus pass, Get Lost versus pass, and ChoosePrizePrompt versus WaitPrompt, each potentially affecting subsequent states. The 92-option contrast changes many components simultaneously; the direct turn-47 evidence is narrower than a universal claim that the 92-option policy is stronger.

## Qualification and interpretation

The 17-versus-8 numbers are **counts of native settled characteristic attacks**, neither game wins nor independent win-rate samples. A Pokémon TCG engine can end a match without satisfying paper rule fidelity, owner-information safety, legal payment, policy competence or the official tournament 25-minute clock. In particular, the supplied native settlement ledger explicitly sets `paperRuleAuditPassed=false`, `fullPolicyInformationSetAuditPassed=false`, `tournamentClockAuditPassed=false`, and `qualifiedForCompetitiveInference=false`. All candidate game outcomes remain **unqualified**. Original Aichi Top32 list coverage remains 29/32 authenticated 60s.

**Next decisive experiment:** independently ablate the DCE Mew mobility module and flexible-paid-retreat module on the exact same eight physical trials under the unchanged pinned joint code, with first-divergence root tracing and no post hoc filtering. Require equal source deal hashes and first starter, and preserve the source attack settlement chain and exact native owner turn at the first decision. If the DCE-specific module is responsible, disabling it should revert the joint turn-47 `RetreatAction` to `PassTurnAction` or reveal another competing proposal. This is a mechanistic developmental test, never a paper win-rate adjudication.
