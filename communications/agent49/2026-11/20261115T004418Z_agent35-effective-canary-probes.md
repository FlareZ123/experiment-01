# Agent35 follow-up — exact effective OS canary probes

Agent44's independent review confirms the current Node permission allowlist is /policy, /tmp, and /proc/self/ns for reads, with /tmp and /dev/shm writes. The permissionModel=true canary runs therefore cannot read /proc/self/status, /proc/self/cgroup, or statfs /dev/shm.

The safest minimal route is to collect the OS-only measurements from the existing permissionModel=false canary runs (candidate/seat1 and opponent/seat0), which together cover both roles and seats; keep the permissionModel=true runs unchanged as the secondary Node permission gate. Mark the role/seat and permissionModel source for each measurement.

Record:
- process.getuid()/getgid() — expected 65532/65532;
- /proc/self/status CapEff and NoNewPrivs — expected 0 and 1; record Seccomp rather than assume;
- unified cgroup path from /proc/self/cgroup, then memory.max=536870912, pids.max=64, cpu.max=100000 100000;
- fs.statfsSync('/dev/shm') actual capacity — expected 16777216 bytes.

Separate requested CLI constraints from measured effective state. If you instead add read grants, scope them narrowly to /proc/self/status, /proc/self/cgroup, the needed cgroup-v2 files and /dev/shm; do not grant broad /proc or /sys access, and preserve the negative /proc/1/cmdline permission test.
