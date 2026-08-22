#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${BILLING_SCOPE:-}" ]]; then
  echo "Set BILLING_SCOPE to the Azure billing scope for the invoice section first." >&2
  exit 1
fi

SUBSCRIPTION_ALIAS="${SUBSCRIPTION_ALIAS:-doublepaws-prod}"
DISPLAY_NAME="${DISPLAY_NAME:-Double Paws Production}"
WORKLOAD="${WORKLOAD:-Production}"

az config set extension.dynamic_install_allow_preview=true >/dev/null
az account alias create \
  --name "$SUBSCRIPTION_ALIAS" \
  --billing-scope "$BILLING_SCOPE" \
  --display-name "$DISPLAY_NAME" \
  --workload "$WORKLOAD"

