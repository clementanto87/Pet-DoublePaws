targetScope = 'subscription'

param projectName string = 'doublepaws'
param environmentName string = 'prod'
param location string = deployment().location
param tenantId string = tenant().tenantId
param publisherEmail string = 'ops@doublepaws.example'
param publisherName string = 'Double Paws'
@secure()
param postgresAdminPassword string
param postgresAdminUsername string = 'pgadmin'
param tags object = {
  project: projectName
  environment: environmentName
  managedBy: 'codex'
}

param vnetAddressPrefix string = '10.40.0.0/16'
param apimSubnetPrefix string = '10.40.1.0/24'
param appSubnetPrefix string = '10.40.2.0/24'
param privateEndpointSubnetPrefix string = '10.40.3.0/24'
param postgresSubnetPrefix string = '10.40.4.0/24'
param postgresDbName string = 'doublepaws'
param apimName string = 'apim-${projectName}-${environmentName}'
param postgresServerName string = 'pg-${projectName}-${environmentName}'
param frontDoorProfileName string = 'afd-${projectName}-${environmentName}'
param frontDoorEndpointName string = 'afd-${projectName}-${environmentName}-ep'
param frontDoorOriginGroupName string = 'og-${projectName}-${environmentName}-api'

param logAnalyticsName string = 'law-${projectName}-${environmentName}'
param appInsightsName string = 'appi-${projectName}-${environmentName}'
param keyVaultName string = 'kv-${projectName}-${environmentName}'
param resourceGroupName string = 'rg-${projectName}-${environmentName}'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module network './modules/network.bicep' = {
  name: 'network'
  scope: rg
  params: {
    location: location
    projectName: projectName
    environmentName: environmentName
    vnetAddressPrefix: vnetAddressPrefix
    apimSubnetPrefix: apimSubnetPrefix
    appSubnetPrefix: appSubnetPrefix
    privateEndpointSubnetPrefix: privateEndpointSubnetPrefix
    postgresSubnetPrefix: postgresSubnetPrefix
    tags: tags
  }
}

module observability './modules/observability.bicep' = {
  name: 'observability'
  scope: rg
  params: {
    location: location
    logAnalyticsName: logAnalyticsName
    appInsightsName: appInsightsName
    tags: tags
  }
}

module security './modules/security.bicep' = {
  name: 'security'
  scope: rg
  params: {
    location: location
    keyVaultName: keyVaultName
    tenantId: tenantId
    tags: tags
  }
}

module database './modules/database.bicep' = {
  name: 'database'
  scope: rg
  params: {
    location: location
    serverName: postgresServerName
    databaseName: postgresDbName
    adminUsername: postgresAdminUsername
    adminPassword: postgresAdminPassword
    delegatedSubnetId: network.outputs.postgresSubnetId
    privateDnsZoneName: 'privatelink.postgres.database.azure.com'
    vnetId: network.outputs.vnetId
    tags: tags
  }
}

module apim './modules/apim.bicep' = {
  name: 'apim'
  scope: rg
  params: {
    location: location
    apimName: apimName
    publisherEmail: publisherEmail
    publisherName: publisherName
    subnetId: network.outputs.apimSubnetId
    tags: tags
  }
}

module edge './modules/edge.bicep' = {
  name: 'edge'
  scope: rg
  params: {
    location: location
    profileName: frontDoorProfileName
    endpointName: frontDoorEndpointName
    originGroupName: frontDoorOriginGroupName
    originHostName: apim.outputs.gatewayHostName
    originResourceId: apim.outputs.serviceId
    tags: tags
  }
}

output resourceGroup string = rg.name
output vnetName string = network.outputs.vnetName
output apimSubnetId string = network.outputs.apimSubnetId
output appSubnetId string = network.outputs.appSubnetId
output privateEndpointSubnetId string = network.outputs.privateEndpointSubnetId
output postgresSubnetId string = network.outputs.postgresSubnetId
output logAnalyticsWorkspaceId string = observability.outputs.logAnalyticsWorkspaceId
output appInsightsConnectionString string = observability.outputs.appInsightsConnectionString
output keyVaultUri string = security.outputs.keyVaultUri
output postgresServerFqdn string = database.outputs.serverFqdn
output postgresConnectionString string = database.outputs.connectionString
output apimGatewayHostName string = apim.outputs.gatewayHostName
output frontDoorEndpointName string = edge.outputs.endpointName
