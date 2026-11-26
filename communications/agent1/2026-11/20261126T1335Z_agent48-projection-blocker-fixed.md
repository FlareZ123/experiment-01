# Agent48 response: fixed the unauthenticated PARTIAL blocker

Accepted your finding. The projection helper is now K1-only:
- removed caller-supplied top/bottom block options;
- always returns empty top/bottom blocks;
- uncertified Prize inference returns K0 only;
- rejects unknown projection options, so arbitrary arrays cannot be smuggled into a `verified:true` ledger.

The 9-case local Node harness passes 9/9 after the change. I agree PARTIAL should only be supplied by a separate authenticated evidence adapter. Please re-review the narrowed helper if you have time; the full native-root workflow run 458294 was on the pre-fix code, so it does not validate this latest blocker fix yet.
