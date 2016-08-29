# Atlassian Challenge API Service

##### This is a Node.js/Express.js service that provides a RESTful API for message parsing of Mentions, Emoticons, and Links.

## Getting Started Locally:

#### 1. Install node & npm

#### 2. Install Dependencies: ```npm install```

#### 3. _[optional]_ Run jshint and unit tests: ```npm test```

#### 4. Run service locally at _localhost:8081_: ```npm start ```

#### 5. Demo with Postman or PAW:
- Send body parameters through 'Form URL-Encoded':
 - _e.g._, Test Locally: __POST__ _localhost:8081/v1/message_ w/key as _message_ and with value as the message itself (_e.g., "Good morning @bigFella! (megusta) (coffee) This is hilarious https://www.reddit.com/r/funny/comments/501e5f/she_became_a_seal/ (gg)"_).


![alt text](https://github.com/bewallyt/AtlassianCodingChallenge/blob/master/Postman%20Example%20.png)



## Structure And Explanation of Parsing Service:

- __src/server/main.js__: Highest level module - starts Node cluster. All middleware is injected here. Some middleware is used to help parse the request at the routing level, while other middleware is used to provide tracking metrics for logging.


* __src/server/lib/__: Contains all relevant logic with regards to parsing.
 * __routes.js__: The 'Express' layer of the stack. The API is defined here, and there only exists one route - a POST route: _/v1/message_.
 * __services/messaging-service.js__: Provides all the logic for parsing Mentions, Emoticons, and Links. More info on the implementation of this logic is documented as comments in this file.


- __src/logging/__: Contains files that provide the implementation for daily rotating access and applications logs.


- __logs/__: Contains daily rotating application and access logs. These logs bookkeep incoming requests, which are useful for future bookkeeping w/other microservices and debugging.
    - example application log entry: 
     - ```{"level":"info","message":"Successfully parsed message (Hello)","timestamp":"2016-08-28T08:23:33.151Z"}```
    - example access log entry: 
     - ```{"level":"info","message":"{\"url\":\"/v1/message\",\"status\":200,\"time\":1252.401,\"date\":\"2016-08-29T04:44:57.367Z\",\"requestId\":\"80cfe7ad-adba-44a2-9ac6-d57a4581a544\",\"transactionId\":\"bfd92613-8cbc-485d-a5b7-102f7e1f5f66\"}\n","timestamp":"2016-08-29T04:44:58.622Z"}```

- __test/server/lib/services/message-service.spec.js__: _message-service.js_ unit testing suite.


## Test and Edge Cases:

- __Mentions__:
    - If there are duplicate Mentions in the message, then they will show up multiple times in the response.
    - Given the unlikely possibility that a Mention (_@benson_) is also part of a URL (_e.g.,_ https://google.com/@benson), this service - unfortunately - doesn't differentiate between the two. _@benson_ will be parsed both in the URL and as 'benson' in the Mention.
        - _e.g.,_ _https://google.com/@benson_ -> ```{
                                                "mentions": [
                                                  "benson"
                                                ],
                                                "links": [
                                                  {
                                                    "url": "https://google.com/@benson",
                                                    "title": "n/a"
                                                  }
                                                ]
                                              }```


        - _e.g.,_ _Hey @benson https://google.com/@benson_ -> ```{
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
                                                          }```

    - As stated in the original prompt, all mentions are terminated by a non-word character:
        - _e.g.,_ _Hey @benson. What's up? Invite @amman._ -> ```{
                                                            "mentions": [
                                                              "benson",
                                                              "amman"
                                                            ]
                                                          }```
        - _e.g.,_ _Hey @@@benson@@amman@@@ellen@raj_ -> ```{
                                                      "mentions": [
                                                        "benson",
                                                        "amman",
                                                        "ellen",
                                                        "raj"
                                                      ]
                                                    }```

- __Emoticons__:
    - If the are duplicate Emoticons in the message, then they will show up multiple times in the response.
        - _e.g.,_ _Hey (@benson(sup)), (smiley) (weirdface9) (yo(smiley)yo) (thinking-Face-) (LongerThanFifteenCharacters)_ -> ```{
                                                                                                                           "mentions": [
                                                                                                                             "benson"
                                                                                                                           ],
                                                                                                                           "emoticons": [
                                                                                                                             "sup",
                                                                                                                             "smiley",
                                                                                                                             "weirdface9",
                                                                                                                             "smiley"
                                                                                                                           ]
                                                                                                                         }```

- __Links__:
    - Strings prefixed with _http://_, _https://_, _ftp://_, _file://_, and _www._ are considered URLs.
    - Given a situation in which a user wants to communicate a nonexistent URL - whether deliberate or not - rather than throwing an error, the string is still parsed but with 'n/a' as the title.
       - _e.g.,_ _Real webpages: www.google.com http://www.worldstarhiphop.com/videos/ Obviously Fake Page: http://Thispagedoesnexist.com/DNE19_ -> ```{
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
                                                                                                                                                }```
