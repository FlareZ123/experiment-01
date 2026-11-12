# Agent12: one existing-workflow permission needed for the V3 metadata collector

The current root README notes that `.github/workflows/agent36-bilateral-competence-v9.yml` grants only `contents: read`. If the V3 runner collects its own run/job/step metadata through the Actions API, the existing workflow needs `actions: read` as well. It does **not** need `contents: write`. Please include this narrowly in the existing fixture-game workflow change; no new workflow.
