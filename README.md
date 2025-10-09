# SafetySnap

SafetySnap is a PPE (Personal Protective Equipment) detection platform that allows users to upload images, detect safety gear like helmets and vests, and view analytics on uploaded images.

---

## Backend APIs

### Base URL

```
http://localhost:5000/api
```

### Auth

#### Register

**POST** `/auth/register`
**Body:**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "<jwt_token>"
}
```

#### Login

**POST** `/auth/login`
**Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "<jwt_token>"
}
```

---

### Images

#### Upload Image

**POST** `/images`
**Headers:**

```
Authorization: Bearer <token>
Idempotency-Key: <unique-key>
```

**Body (form-data):**

* `file` : image file

**Response:**

```json
{
  "userId": "...",
  "fileUrl": "...",
  "detections": [
    { "label": "helmet", "bbox": [...], "confidence": 0.98 }
  ],
  "uploadedAt": "2025-10-05T05:19:36.000Z"
}
```

#### Get Images

**GET** `/images`
**Headers:**

```
Authorization: Bearer <token>
```

**Query Params (optional):** `limit`, `offset`, `label`, `from`, `to`

**Response:**

```json
{
  "items": [ ... ],
  "next_offset": 10
}
```

#### Get Labels

**GET** `/images/labels`
**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
["helmet", "vest"]
```

---

### Analytics

#### Get Analytics

**GET** `/analytics?from=&to=`
**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "totalImages": 10,
  "labelCounts": { "helmet": 5, "vest": 3 },
  "dailyUploads": [
    { "date": "2025-10-01", "count": 3 }
  ]
}
```

---

## Test User Credentials

```
Email: admin@mail.com
Password: admin123
```

---

## Notes

* Every image upload requires an `Idempotency-Key` to prevent duplicate uploads.
* JWT token is required for all protected endpoints.
* The backend uses Cloudinary for image storage and Google Gemini API for PPE detection.
