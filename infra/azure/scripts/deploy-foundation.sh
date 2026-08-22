#!/usr/bin/env bash
set -euo pipefail

LOCATION="${LOCATION:-westeurope}"

az deployment sub create \
  --location "$LOCATION" \
  --template-file main.bicep \
  --parameters @parameters.prod.json

