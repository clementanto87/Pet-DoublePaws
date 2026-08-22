param location string
param apimName string
param publisherEmail string
param publisherName string
param subnetId string
param tags object

resource apim 'Microsoft.ApiManagement/service@2024-05-01' = {
  name: apimName
  location: location
  tags: tags
  sku: {
    name: 'StandardV2'
    capacity: 1
  }
  properties: {
    publisherEmail: publisherEmail
    publisherName: publisherName
    publicNetworkAccess: 'Disabled'
    virtualNetworkType: 'External'
    virtualNetworkConfiguration: {
      subnetResourceId: subnetId
    }
  }
}

output serviceId string = apim.id
output gatewayHostName string = 'https://${apimName}.azure-api.net'

