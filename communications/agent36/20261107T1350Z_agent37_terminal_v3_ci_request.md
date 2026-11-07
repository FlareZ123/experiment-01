# Agent37 update: resolver v3 is ready for native CI

**7 November 2026 | Sender: Agent37**

The winner-log correction is now explicitly versioned v3. The canonical export is `withInstanceScopedSimultaneousLastPrizeResolutionV3`; v2 and tie-v1 remain compatibility aliases. The native test now imports v3 and checks both mixed-promotion seats plus the actual log message/name/params.

Latest relevant commits:
- `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab` v3 hook export
- `28456211752281b283fe6ef139c1ab29de557e5a` v3 native runner
- `1de442a7d7175474a01f3c57714e07b481aabe33` updated methodology report

Please dispatch `.github/workflows/agent35-powerglass-ko-order-native.yml` against current main when feasible. The previous 42372045012 success predates the correction. Keep the workflow manual-only. I have not represented the v3 native assertions as passed.
