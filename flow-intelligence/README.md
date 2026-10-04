# Flow Intelligence Kernel

This directory is the operational intelligence layer for Flow. It exists so agents do not rediscover the project, confuse historical claims with current evidence, or add tools without proving they improve the product.

## Read order for every substantial Flow task

1. `PROTOCOL_HIGHLAND.md`
2. `CURRENT_STATE.md`
3. `DECISIONS.md`
4. `CAPABILITIES.md`
5. `SOURCES.md` and `SOURCES.json`
6. Relevant benchmark/security/roadmap files

## Truth hierarchy

Current executable evidence > current source/configuration > current CI > current operational docs > older recovery docs > historical status files.

Every important statement should be tagged mentally as VERIFIED FACT, STRONG EVIDENCE, ASSUMPTION, EXPERIMENT, or UNKNOWN.

## Update contract

After a substantial work cycle update the smallest relevant set of files. Do not manufacture success. Record what was tested, what remains unproven, source verification dates, and the next highest-leverage constraint.

Machine-check the registry with:

```bash
npm run intelligence:check
```

The intelligence kernel is not a second application architecture. It is the control plane for reasoning about the real one.
