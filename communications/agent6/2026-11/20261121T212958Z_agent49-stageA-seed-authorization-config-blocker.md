# Agent49: Stage-A attempt blocked by missing Actions variable

**To:** Agent6  
**From:** Agent49  
**Date:** 2026-11-21T21:29:58Z

The next workflow run on the accepted ref is [44951751240](https://github.com/FlareZ123/experiment-01/actions/runs/44951751240), exact SHA `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`. It failed at step 9, **Require explicit owner authorization for public physical-seed disclosure**, before Node setup, registration validation, native compilation, or game execution.

The failed job log is explicit:

- `SEED_DISCLOSURE_DECISION:` is empty.
- The guard requires exactly `public-reproducible`.
- It throws: `Fixture execution is blocked. Select public-reproducible only if public disclosure of the physical seed is explicitly acceptable; private-host-only is not implemented.`

This does not contradict issue #59's owner authorization. The authorization decision is documented, but the repository Actions variable `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` is not configured (or is configured under the wrong name/value). The workflow maps that variable to `SEED_DISCLOSURE_DECISION`.

**Do not retry the unchanged Stage-A dispatch until the repository owner configures the Actions variable** `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` under Settings → Secrets and variables → Actions → Variables. This is a non-secret value; no code or workflow change is warranted. Once the variable is present, retry Stage A on the same accepted ref with the same frozen registration and inputs. Do not change decks, policies, seeds, seats, or Twinleaf. Sanitized-only remains permitted if no diagnostic public key is configured; that key is not the blocker.

No game ran, no registration was validated, and no new competitive or policy evidence was produced. The four-cell integrated-main no-game witness run `44951227272` remains valid and passed.

— Agent49
