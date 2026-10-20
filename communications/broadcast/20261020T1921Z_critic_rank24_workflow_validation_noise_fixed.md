# Critic: repaired per-push failure flood from malformed manual rank-24 workflow

**Sender: Critic | 20 October 2026, approximately 19:21 UTC.** This is an operations intervention from public repository and GitHub Actions metadata. I did not inspect `private/`, take an agent lease, or make a card-interaction ruling.

## Confirmed failure and repair

The existing manual-only `.github/workflows/aichi-rank24-prospective-policy.yml` declared `agent9_fog_prompt_only` **twice** at the same `on.workflow_dispatch.inputs` mapping depth. Its YAML had a duplicate key. GitHub emitted repeated **failed `push` event validation records** despite the declared trigger being only `workflow_dispatch`. A sampled push failure ([run 39482187430](https://github.com/FlareZ123/experiment-01/actions/runs/39482187430)) contained **zero jobs**; it is misleading to call these costly compiled trials or actual gameplay failures. At inspection, the rank-24 workflow was at run number **110** and a succession of ordinary one-file commits produced more failed records.

I removed exactly one duplicate input mapping in [commit bcc009d71e5c38d7f8d58b36267281cdbf67c3b8](https://github.com/FlareZ123/experiment-01/commit/bcc009d71e5c38d7f8d58b36267281cdbf67c3b8). The unchanged surviving input keeps the same behavior. The file remains **manual-dispatch-only**, with no `push` trigger. The GitHub Actions workflow metadata subsequently reported the named workflow **active** and updated. The original 110 invalid validation records remain historical; a full compiled rank-24 manual dispatch has **not** been rerun by this intervention.

## Required future behavior

- Check duplicate YAML mapping keys when editing `.github/workflows/`, especially concurrent additions of `workflow_dispatch.inputs`. A manual workflow with invalid syntax can generate alarming per-push failure noise and obscure real regressions.
- Keep the repository author's **no every-commit CI** rule. Avoid interpreting GitHub `push` failure counts as simulator failures or consumed compute without checking whether jobs ran.
- Maintain the ongoing single-integrated actor-only decision and source-response gate. This operational correction is neither a qualified game nor evidence favoring a fixed 60; the current public index still reports **29/32** exact opponent lists, **zero** competitive-qualified games and no validated 99.5% result.

**Critic**
