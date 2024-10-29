# MoodTrackApp

A RestAPI application which tracks daily moods using emojis and notes.

## Tech stack
* Node
* Express
* MySql instance from aiven.io

Once this repository is cloned, follow these steps to setup this application

1. Run this on root terminal to install dependencies
`npm install`

2. Create `.env` file in root directory with following variables

```console
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=mood_tracker
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Run this to start the server
`npm start`


## API Documentation

There are two API routes available in this application.
### Auth

Auth route exports the following endpoints
1. Register a user

```console
POST /api/auth/register
Body: {"username": "user", "password": "password"}
```

2. Login as a user

```console
POST /api/auth/login
Body: { "username": "user", "password": "pass123" }
```

### Mood

Mood route exports the following endpoints

1. To create/post a mood

```console
POST /api/moods
Header: Authorization: Bearer <token>
Body: { "emoji": "😊", "note": "I'm having a great day!", "date": "2024-10-28" }
```

2. Get statistics of a month

```console
GET /api/moods/monthly/2024/10
Header: Authorization: Bearer <token>
```

3. Updates a mood entry

```console
PUT /api/moods/:id
Header: Authorization: Bearer <token>
Body: { "emoji": "😊", "note": "Updated note" }
```

4. Deletes a mood entry

```console
DELETE /api/moods/:id
Header: Authorization: Bearer <token>
```

5. Statistics of a user filtering by month and emoji

```console
GET /api/moods/stats
Header: Authorization: Bearer <token>
```

6. Sharing mood data of a user

```console
POST /api/moods/share
Header: Authorization: Bearer <token>
```

7. Unshare or disabling sharing of a user's mood data

```console
POST /api/moods/unshare
Header: Authorization: Bearer <token>
```

8. Accessing/retrieving a mood data shared by a user

```console
POST /api/moods/shared/:sharedToken
Header: Authorization: Bearer <token>
```

9. Public mood board

```console
GET /api/moods/public
```

10. Emoji suggestions based on notes provided

```console
POST /api/moods/suggest
Header: Authorization: Bearer <token>
Body: { "note": "feeling happy today" }
```

11. Dashboard/Chart data useful to represent in a chart

```console
GET /api/moods/dashboard
Header: Authorization: Bearer <token>
```


## Technical decisions

1. MySQL
Used MySQL (opensource) instance from aiven.io for it is free(to a limit)
2. Sequalize ORM
Used for database management and migrations
3. JsonWebToken
Used for authentication



## Database/Schema details

### User table
* id(primary key)
* username(unique)
* password
* shareEnabled(boolean)
* createdAt
* updatedAt


### Mood table
* id(primary key)
* userId(foreign key)
* emoji
* note
* date
* createdAt
* updatedAt


## Error codes used

* 201: Created
* 400: Bad request
* 401: Unauthorized
* 403: Forbidden
* 404: Not found