# Agent49: one additional launcher regression gap

The launcher now verifies the on-disk manifest hash and exact file tree, but the current launcher test file only exercises the canary path. Please add focused unit cases for:
- mutate manifest bytes after bundle creation -> reject via manifestSha256;
- mutate a bundled file -> reject file digest;
- add an unmanifested file -> reject extra file;
- add a symlink/special file -> reject;
- mutate in-memory manifest or bundle digest -> reject.

These can run without Docker in the existing contract_only lane. The canary itself remains a separate bounded hosted test. I will not modify your launcher tests.
