# Atlassian Challenge API Service

##### This is a Node.js/Express.js service that provides a RESTful API for message parsing of Mentions, Emoticons, and Links.

## Getting Started Locally:

#### 1. Install node, npm

#### 2. Install Dependencies: ```npm install```

#### 3a. Build, minifies, and creates artifact (zip) for potential deployment: ```grunt build```

#### 3b. [optional] Run jshint and unit tests: ```grunt test```

#### 4. Run service locally at _localhost:8081_: ```npm start ``` or ```npm dev-start```

#### 5. Demo with Postman or PAW:
- Send body parameters through 'Form URL-Encoded'
 - e.g., Test Locally: POST localhost:8081/v1/message w/key as the _message_ and with value as the message itself (e.g., "Good morning! (megusta) (coffee)")


## Structure And Explanation of Parsing Service:
- _src/server/main.js: Highest level module - starts node cluster. All middleware is injected here. Some middleware is used to help parse the request at the routing level while other middleware is used to provide tracking metrics for logging.
- _src/server/lib/_: Contains all relevant logic with regards to parsing
    -_routes.js_: The 'Express' layer of the stack. There only exists one route - a POST route for _/v1/message_.
    -_/services/messaging-service.js_: Provides all the logic for parsing Mentions, Emoticons, and Links. More info on the implementation of this logic is documented as comments in this file.
- _src/logging/_: Contains files that provide the implementation for daily rotating access and applications logs.


- _logs/_: Contains daily rotating application and access logs. These logs bookkeep incoming requests, which make it useful for future bookkeeping w/other microservices and debugging.
    - example application log entry: ```{"level":"info","message":"Successfully parsed message (Hello)","timestamp":"2016-08-28T08:23:33.151Z"}```
    - example access log entry: ```{"level":"info","message":"{\"url\":\"/v1/message\",\"status\":200,\"time\":1252.401,\"date\":\"2016-08-29T04:44:57.367Z\",\"requestId\":\"80cfe7ad-adba-44a2-9ac6-d57a4581a544\",\"transactionId\":\"bfd92613-8cbc-485d-a5b7-102f7e1f5f66\"}\n","timestamp":"2016-08-29T04:44:58.622Z"}```

- _test/server/lib/services/message-service.spec.js/_: Contains unit tests.


## Test and Edge Cases:

- Mentions:
    - If the are duplicate mentions in the message, then they will show up multiple times in the response.
    - There is an unlikely possibility that a mention (@benson) is also part of a URL (e.g., https://google.com/@benson...or something). Unfortunately this service doesn't differentiate between the two, so @benson will show up both in the URL and as 'benson' in the mention.
        - e.g., https://google.com/@benson -> {
                                                "mentions": [
                                                  "benson"
                                                ],
                                                "links": [
                                                  {
                                                    "url": "https://google.com/@benson",
                                                    "title": "n/a"
                                                  }
                                                ]
                                              }


        - e.g., Hey @benson https://google.com/@benson -> {
                                                            "mentions": [
                                                              "benson",
                                                              "benson"
                                                            ],
                                                            "links": [
                                                              {
                                                                "url": "https://google.com/@benson",
                                                                "title": "n/a"
                                                              }
                                                            ]
                                                          }

    - As stated in the original prompt, all mentions are terminated by a non-word character:
        - e.g., Hey @benson. What's up? Invite @amman. -> {
                                                            "mentions": [
                                                              "benson",
                                                              "amman"
                                                            ]
                                                          }
        - e.g., Hey @@@benson@@amman@@@ellen@raj -> {
                                                      "mentions": [
                                                        "benson",
                                                        "amman",
                                                        "ellen",
                                                        "raj"
                                                      ]
                                                    }

- Emoticons:
    - If the are duplicate emoticons in the message, then they will show up multiple times in the response.
        - e.g., Hey (@benson(sup)), (smiley) (weirdface9) (yo(smiley)yo) (thinking-Face-) (LongerThanFifteenCharacters) -> {
                                                                                                                           "mentions": [
                                                                                                                             "benson"
                                                                                                                           ],
                                                                                                                           "emoticons": [
                                                                                                                             "sup",
                                                                                                                             "smiley",
                                                                                                                             "weirdface9",
                                                                                                                             "smiley"
                                                                                                                           ]
                                                                                                                         }

- Links:
    - Strings prefixed with _http://_, _https://_, _ftp://_, _file://_, and _www._ are considered URLs.
    - In a situation in which a user wants to communicate a nonexistent URL - whether deliberate or not - rather than throwing an error, the string is still parsed, but with 'n/a' as the title.
       - e.g., Real webpages: www.google.com http://www.worldstarhiphop.com/videos/ Obviously Fake Page: http://Thispagedoesnexist.com/DNE19 -> {
                                                                                                                                                  "links": [
                                                                                                                                                    {
                                                                                                                                                      "url": "http://Thispagedoesnexist.com/DNE19",
                                                                                                                                                      "title": "n/a"
                                                                                                                                                    },
                                                                                                                                                    {
                                                                                                                                                      "url": "www.google.com",
                                                                                                                                                      "title": "Google"
                                                                                                                                                    },
                                                                                                                                                    {
                                                                                                                                                      "url": "http://www.worldstarhiphop.com/videos/",
                                                                                                                                                      "title": "Worldstarhiphop: Breaking News | Music Videos | Entertainment News | Hip Hop News"
                                                                                                                                                    }
                                                                                                                                                  ]
                                                                                                                                                }