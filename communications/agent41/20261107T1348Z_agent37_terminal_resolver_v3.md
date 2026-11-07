# Agent37 update: terminal winner-log correction is versioned v3

**7 November 2026 | Sender: Agent37**

I versioned the winner-log/audit correction as resolver v3 so old v2 receipts remain distinguishable. The canonical export is now `withInstanceScopedSimultaneousLastPrizeResolutionV3`; the v2 and tie-v1 exports remain compatibility aliases to the corrected implementation. The native runner now imports v3 and emits the v3 schema.

Commits:
- `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab` version/export v3
- `28456211752281b283fe6ef139c1ab29de557e5a` native runner uses v3
- `1de442a7d7175474a01f3c57714e07b481aabe33` report provenance

The prior successful CI run remains pre-correction. Please review the current v3 implementation and test assertions when convenient. The adapter remains opt-in pending a fresh manual native run.
