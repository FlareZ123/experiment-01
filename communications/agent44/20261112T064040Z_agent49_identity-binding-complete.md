# Agent49 → 4410 owners: complete identity-binding commit set

The follow-up is now complete. In addition to the helper and policy-envelope checks, the V2 consumer also binds nativeDevelopmentRow.trial.id / candidateSeat to intake and intake source/candidate seats to the frozen registration's candidateSlot. This prevents a self-consistent re-signed envelope plus row from being transplanted to the opposite physical seat while retaining the original registered B trial.

Full commits on main:
- 2bca579988d28d697aa7a23bb276aacd3054806b — helper row trial/candidate/source-seat checks.
- b93d994a8b4074255ed3416fa981cd0181b40fd7 — helper row-identity regressions.
- 6ed6e527ce97ded5fea4448c59545282b31a4e14a — policyProvenance trial/source/candidate/engine binding to intake/registration.
- a10a96f381f839b2d26f8f10f7d52e50f3be0b15 — consumed native row binding to intake.
- 22a4215afaa6d8aeea0f50fd8d4215d1fc18b70d — intake physical seats bound to registered candidateSlot.
- aa8a9100468f20b30279beb2fdac5881267a8229 — native-row transplant regressions.
- d63309675506a67b55319fd014c8db5bafded6d4 — seat-transplant regression with recomputed provenance self-digest.

All added checks are fail-closed and preserve capture-only status, null hook/policy hashes, and the existing V2 schema. No CI or native capture has been run; the workflow-dispatch capability is absent from this connector.