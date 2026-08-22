# Azure Production Plan

This folder contains the Azure landing-zone scaffold for Double Paws.

## What this plan covers

- A new Azure subscription created through `az account alias create`
- A dedicated resource group for production
- A production VNet with separate subnets for:
  - API Management
  - application hosting
  - private endpoints
  - PostgreSQL
- Observability with Log Analytics and Application Insights
- A secure secret store with Key Vault
- A documented path for Front Door Premium and API Management

## Why this is split into phases

Creating the subscription itself requires a billing scope and the `Azure subscription creator` permission on that billing scope. The current CLI session is authenticated to Azure, but it does not have the billing-scope details required to create a new subscription directly.

## Recommended target architecture

1. Azure Front Door Premium with WAF at the edge.
2. API Management in the production subscription, fronted privately by Front Door.
3. A dedicated VNet with:
   - `snet-apim`
   - `snet-app`
   - `snet-private-endpoints`
   - `snet-postgres`
4. Backend services deployed privately and only reachable from APIM.
5. A managed PostgreSQL database in the same region.
6. Centralized logging and traces through Log Analytics and App Insights.

## Build and deploy

```bash
cd infra/azure
az deployment sub create \
  --location westeurope \
  --template-file main.bicep \
  --parameters @parameters.prod.json
```

## Subscription creation

Set the billing scope from your Azure Cost Management + Billing invoice section, then run:

```bash
export BILLING_SCOPE="/providers/Microsoft.Billing/billingAccounts/..."
./scripts/create-subscription.sh
```

