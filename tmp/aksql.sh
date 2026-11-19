#!/bin/bash
PG() { docker exec authentik-pg psql -U authentik -d authentik -tAc "$1"; }
echo "== scope mappings rows"
PG "select id,managed,name from authentik_providers_oauth2_scopemapping order by managed"
echo "== policybinding rows (app-targeted)"
PG "select pb.policybindingmodel_ptr_id, pb.target, pb.policy, pb.\"group\", pb.enabled from authentik_policies_policybinding pb" | head -20
echo "== groups"
PG "select gid_number, name from authentik_core_group" 2>/dev/null || PG "select id, name from authentik_core_group" 2>/dev/null || PG "select * from authentik_core_group" | head -8