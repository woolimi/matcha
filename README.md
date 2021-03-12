# matcha

## Overview

`matcha` is one of web-project in école 42. The purpose of this project is to create a dating website like tinder. Usage of `ORM`, `validators`, `User Accounts Manager`, `NoSQL Database` is **strictly forbidden** in this project.

|       light mode        |          dark mode           |
| :---------------------: | :--------------------------: |
| ![](./demo/search.png)  | ![](./demo/search-dark.png)  |
| ![](./demo/profile.png) | ![](./demo/profile-dark.png) |

|         chat         |         notification         |
| :------------------: | :--------------------------: |
| ![](./demo/chat.png) | ![](./demo/notification.png) |

|         mobile         |
| :--------------------: |
| ![](./demo/mobile.jpg) |

## Feature

-   Dark mode
-   Realtime Chat
-   Google Oauth2 login
-   Interactive Google Map
-   Mobile support responsive UI
-   Mailing service(verification email / reset password)
-   Tracking location based on IP address if user don't allow browser gps.
-   Suggestion based on user's interest, age, language, sexual orientation(hetrosexual, bisexual, homosexual).
-   pagination with scroll event
-   Auto generated 500 seed users
-   jwt authentication flow (access token, refresh token)

## Stack

-   Nuxt (Server Side Rendering) with vuetify
-   Express (API server)
-   Dockerized MySQL

## How to launch

Make sure you already have docker and docker-compose(>= 1.27). And then change the name of dotenv file we prepared(.env.example) to .env in both folder(api, app).

Theae are the API key list that you need to prepare in advance.

-   Google Map API key (Place API)
-   Google Oauth API key
-   Mailgun API key

We prepared a script for making your life easy, so you just need to type following command.

```
> sh ./eval.sh
```

## Contributer

-   [ncolomer](https://github.com/glagan)
-   [wpark](https://github.com/woolimi)
