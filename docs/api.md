# Appractic API Documentation

## Authentication

All API endpoints require authentication using a Bearer token provided by Clerk.

```http
Authorization: Bearer <token>
```

## Rate Limiting

The API is rate-limited to 10 requests per 10 seconds per IP address.

## Endpoints

### Social Media Accounts

#### List Accounts

```http
GET /api/accounts
```

Returns a list of connected social media accounts.

Response:
```json
{
  "accounts": [
    {
      "id": "string",
      "provider": "twitter | facebook | instagram | linkedin",
      "name": "string",
      "username": "string",
      "avatar": "string",
      "active": boolean
    }
  ]
}
```

#### Connect Account

```http
POST /api/accounts
```

Connect a new social media account.

Request Body:
```json
{
  "provider": "twitter | facebook | instagram | linkedin",
  "accessToken": "string",
  "refreshToken": "string",
  "providerAccountId": "string",
  "name": "string",
  "username": "string",
  "email": "string",
  "avatar": "string"
}
```

### Posts

#### Create Post

```http
POST /api/posts
```

Create a new social media post.

Request Body:
```json
{
  "text": "string",
  "media": [
    {
      "url": "string",
      "type": "string"
    }
  ],
  "scheduledAt": "string",
  "platforms": ["twitter", "facebook", "instagram", "linkedin"]
}
```

#### List Posts

```http
GET /api/posts
```

Get a list of posts.

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (draft, scheduled, published)

Response:
```json
{
  "posts": [
    {
      "id": "string",
      "text": "string",
      "media": [
        {
          "url": "string",
          "type": "string"
        }
      ],
      "scheduledAt": "string",
      "status": "string",
      "platforms": ["twitter", "facebook", "instagram", "linkedin"],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Media

#### Upload Media

```http
POST /api/media
```

Upload media file.

Request Body (multipart/form-data):
- `file`: File to upload
- `type`: Media type (image/*, video/*)

Response:
```json
{
  "url": "string",
  "type": "string",
  "size": number
}
```

### Analytics

#### Get Metrics

```http
GET /api/metrics
```

Get social media metrics.

Query Parameters:
- `startDate`: Start date (ISO string)
- `endDate`: End date (ISO string)
- `accountId`: Filter by account ID

Response:
```json
{
  "metrics": [
    {
      "accountId": "string",
      "timestamp": "string",
      "impressions": number,
      "engagement": number,
      "clicks": number,
      "likes": number,
      "comments": number,
      "shares": number
    }
  ]
}
```

#### Get Audience

```http
GET /api/metrics/audience
```

Get audience metrics.

Query Parameters:
- `accountId`: Filter by account ID

Response:
```json
{
  "audience": [
    {
      "accountId": "string",
      "timestamp": "string",
      "followers": number,
      "demographics": {
        "age_18_24": number,
        "age_25_34": number,
        "male": number,
        "female": number
      }
    }
  ]
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": {}
  }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting Headers

The API includes rate limiting information in the response headers:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1635724800
```
