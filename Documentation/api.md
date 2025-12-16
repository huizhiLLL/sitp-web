# API Documentation

## Overview

The FC-Catalyst Prediction Tool provides a RESTful API for programmatic access to catalyst performance predictions. This API allows developers to integrate catalyst prediction capabilities into their own applications and workflows.

## Base URL

```
https://api.fc-catalyst.example.com/v1
```

::: warning
The API is currently in development. The base URL shown above is a placeholder for the production endpoint.
:::

## Authentication

API requests require authentication using an API key. Include your API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Obtaining an API Key

Contact the project administrators to request an API key for your application.

## Endpoints

### POST /predict

Generate a catalyst performance prediction based on input parameters.

#### Request

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Body Parameters:**

| Parameter | Type | Required | Description | Valid Range |
|-----------|------|----------|-------------|-------------|
| `composition` | string | Yes | Catalyst composition (e.g., "Pt/C", "PtRu/C") | - |
| `loadingAmount` | number | Yes | Catalyst loading amount in mg/cm² | 0.1 - 10.0 |
| `temperature` | number | Yes | Operating temperature in °C | 20 - 100 |
| `pressure` | number | Yes | Operating pressure in atm | 1 - 5 |
| `humidity` | number | Yes | Relative humidity in % | 0 - 100 |

**Example Request:**

```javascript
const response = await fetch('https://api.fc-catalyst.example.com/v1/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    composition: "Pt/C",
    loadingAmount: 0.4,
    temperature: 80,
    pressure: 3,
    humidity: 50
  })
});

const data = await response.json();
console.log(data);
```

```python
import requests

url = "https://api.fc-catalyst.example.com/v1/predict"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = {
    "composition": "Pt/C",
    "loadingAmount": 0.4,
    "temperature": 80,
    "pressure": 3,
    "humidity": 50
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "prediction": {
    "efficiency": 87.45,
    "confidence": 92.3,
    "recommendations": [
      "Operating conditions are within optimal range",
      "Consider increasing temperature by 5°C for improved efficiency"
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "modelVersion": "1.2.0",
    "processingTime": 145
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the prediction was successful |
| `prediction.efficiency` | number | Predicted catalyst efficiency (%) |
| `prediction.confidence` | number | Model confidence level (%) |
| `prediction.recommendations` | array | Array of recommendation strings |
| `prediction.timestamp` | string | ISO 8601 timestamp of prediction |
| `metadata.modelVersion` | string | Version of the ML model used |
| `metadata.processingTime` | number | Processing time in milliseconds |

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Temperature must be between 20 and 100°C",
    "field": "temperature"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

**Error Response (429 Too Many Requests):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Free tier**: 100 requests per hour
- **Standard tier**: 1,000 requests per hour
- **Enterprise tier**: Custom limits

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | One or more input parameters are invalid |
| `UNAUTHORIZED` | Missing or invalid API key |
| `RATE_LIMIT_EXCEEDED` | Too many requests in the time window |
| `SERVER_ERROR` | Internal server error occurred |
| `MODEL_UNAVAILABLE` | ML model is temporarily unavailable |

## Code Examples

### cURL

```bash
curl -X POST https://api.fc-catalyst.example.com/v1/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "composition": "Pt/C",
    "loadingAmount": 0.4,
    "temperature": 80,
    "pressure": 3,
    "humidity": 50
  }'
```

### Node.js (with axios)

```javascript
const axios = require('axios');

async function predictCatalyst(params) {
  try {
    const response = await axios.post(
      'https://api.fc-catalyst.example.com/v1/predict',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Prediction failed:', error.response.data);
    throw error;
  }
}

// Usage
predictCatalyst({
  composition: "Pt/C",
  loadingAmount: 0.4,
  temperature: 80,
  pressure: 3,
  humidity: 50
}).then(result => {
  console.log('Efficiency:', result.prediction.efficiency);
  console.log('Confidence:', result.prediction.confidence);
});
```

### Python (with requests)

```python
import requests
from typing import Dict, Any

class CatalystAPI:
    def __init__(self, api_key: str):
        self.base_url = "https://api.fc-catalyst.example.com/v1"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    
    def predict(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make a catalyst prediction."""
        response = requests.post(
            f"{self.base_url}/predict",
            json=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
api = CatalystAPI("YOUR_API_KEY")
result = api.predict({
    "composition": "Pt/C",
    "loadingAmount": 0.4,
    "temperature": 80,
    "pressure": 3,
    "humidity": 50
})

print(f"Efficiency: {result['prediction']['efficiency']}%")
print(f"Confidence: {result['prediction']['confidence']}%")
```

## Best Practices

1. **Cache Results**: Cache prediction results when appropriate to reduce API calls
2. **Handle Errors Gracefully**: Always implement proper error handling
3. **Validate Input**: Validate parameters client-side before making API calls
4. **Monitor Rate Limits**: Track rate limit headers to avoid throttling
5. **Use HTTPS**: Always use HTTPS for secure communication

## Support

For API support, bug reports, or feature requests:
- Email: api-support@fc-catalyst.example.com
- GitHub Issues: [github.com/fc-catalyst/issues](https://github.com/fc-catalyst/issues)
