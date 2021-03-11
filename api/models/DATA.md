# matcha

## Tables

### User

-   `id`
-   `email`
-   `username`
-   `lastName`
-   `firstName`
-   `password`
-   `verified`: Has clicked the link in the registration email
-   `gender`
-   `preferences`
-   `biography`
-   `fame`: ??
-   `location`: GPS coordinates
-   `online`: ??
-   `lastLogin`

-   Has many:
    -   UserPicture
    -   UserTag
    -   UserVisit
    -   UserLike
    -   UserChat
    -   UserBlock
    -   UserNotification

#### UserPicture

-   `id`
-   `user`
-   `format`
-   `added`

#### UserTag

-   `id`
-   `user`
-   `tag`: See [#Tags](#Tags)
-   `added`

#### UserLike

-   `id`
-   `user`: User
-   `liked`: User, the other User who `user` like

#### UserBlock

-   `id`
-   `user`: User
-   `blocked`: User, the other blocked User by `user`

#### UserChat

-   `id`
-   `user1`: User
-   `user2`: User
-   `start`: Date ?

##### ChatMessage

-   `id`
-   `chat`: Chat
-   `sender`: User
-   `at`: Date
-   `content`

### UserNotification

-   `id`
-   `user`: User
-   `type`: `likeReceived`, `profileVisited`, `messageReceived`, `likedBack`, `likeRemoved`
-   `content`
-   `at`: Date
-   `read`: boolean

### Tag

-   `id`
-   `name`

## Relations

-   Generated _Interesting_ profiles (Recommended)
    -   `preferences`: One preference will look for only one or both gender
    -   `location`, `tags`, `fame`: Weighted, amount of related between 2 users
    -   `location`: Has priority
-   Advanced Search
    -   `age`, `fame`: how far a value should be from _self_
    -   `location`: A given location instead of the _self_ location
    -   `tags`: A set of tags the users have attached to their profiles
-   Sort by: `age`, `location`, `fame`, `(common) tags`
-   Filter by: `age`, `location`, `fame`, `(common) tags`
