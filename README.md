# FROMBOS V2

Competitive Intelligence Platform for Wild Rift.

## Estado

A reconstrução completa está sendo desenvolvida na branch:

`rebuild/frombos-v2`

A branch `main` permanece estável até o Release Gate.

## Fundação V2

A primeira fundação já contém:

- Command Center
- Team Workspace + champion pools
- Composition Lab com composições recuperadas
- Draft Room persistente
- Fearless/Series preparado
- Tactical Board com canvas persistente
- VOD Review local com notas por timestamp
- Champion / Matchup / Build routes preparadas
- Scouting / Training / Reports / Competitive routes preparadas
- Data Center com provenance
- Backup / restore do workspace
- PWA manifest
- Service Worker / offline foundation
- responsive desktop/mobile

## Princípio de dados

O FROMBOS diferencia explicitamente:

- OFFICIAL
- OBSERVED
- CURATED
- FROMBOS_STRUCTURAL
- USER_PRIVATE
- UNKNOWN

Recomendação nunca é apresentada como estatística observada.

## Documentação

- `docs/PROJECT-EXECUTION-PLAN.md`
- `docs/recovery/LIVE-SITE-AUDIT-2026-09-14.md`

## Roadmap resumido

Foundation → Team → Compositions → Draft/Fearless → Tactical Board → VOD → Champion/Matchup/Build → Scouting → Training/Reports → Data Pipeline → Production Hardening → Release.

## Segurança de release

O site público atual não deve ser substituído até o novo build superar os fluxos críticos do produto existente e passar pelo checklist de produção.
