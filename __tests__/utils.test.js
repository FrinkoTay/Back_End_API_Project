const {
  convertTimestampToDate,
  createRef,
  formatComments,
} = require("../db/seeds/utils");
const testData = require("../db/data/test-data/index")
const db = require(`../db/connection`)
const request = require('supertest')
const app = require('../app')
const seed = require('../db/seeds/seed')
const fs = require('fs/promises')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", article_id: 1, name: "name1" }];
    let actual = createRef(input, "title", "article_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "name", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", article_id: 1 },
      { title: "title2", article_id: 2 },
      { title: "title3", article_id: 3 },
    ];
    const actual = createRef(input, "title", "article_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", article_id: 1 }];
    const control = [{ title: "title1", article_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatComments", () => {
  test("returns an empty array, if passed an empty array", () => {
    const comments = [];
    expect(formatComments(comments, {})).toEqual([]);
    expect(formatComments(comments, {})).not.toBe(comments);
  });
  test("converts created_by key to author", () => {
    const comments = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).toEqual("ant");
    expect(formattedComments[0].created_by).toBe(undefined);
    expect(formattedComments[1].author).toEqual("bee");
    expect(formattedComments[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const comments = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).toBe(1);
    expect(formattedComments[1].article_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).toEqual(new Date(timestamp));
  });
});

describe("GET TOPICS", () => {
  test("returns 200 status with array of topics", () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(3)
        response.body.forEach((topic) => {
          expect(Object.keys(topic).length).toBe(2)
          expect(typeof topic.slug).toBe('string')
          expect(typeof topic.description).toBe('string')
        })
      })
  })
  test("return 404 error with error message if endpoint does not exist", () => {
    return request(app)
      .get('/api/bananas')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Route does not exist")
      })
  })
  test("return 404 error with error message if endpoint is misspelt", () => {
    return request(app)
      .get('/api/topicsa')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Route does not exist")
      })
  })
})

describe("GET /api", () => {
  test("returns 200 status code with an object of three initial endpoints", () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then((response) => {
        expect(response.body['GET /api']).toEqual({
            description: 'serves up a json representation of all the available endpoints of the api'
        })
        expect(response.body['GET /api/topics']).toEqual({
          description: 'serves an array of all topics',
          queries: [],
          exampleResponse: { topics: [ { slug: 'football', description: 'Footie!' } ] }
        })
        expect(response.body['GET /api/articles']).toEqual({
          "description": "serves an array of all articles",
          "queries": ["author", "topic", "sort_by", "order"],
          "exampleResponse": {
            "articles": [
              {
                "title": "Seafood substitutions are increasing",
                "topic": "cooking",
                "author": "weegembump",
                "article_id": 1,
                "created_at": "2018-05-30T15:59:13.341Z",
                "votes": 0,
                "article_img_url": "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                "comment_count": 6
              }
            ]
          }
        })
      })
  })
  test("returns 200 status code and stays returns updated object when 'endpoints.json' is updated", () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then((response) => {
        const endpointsfile = fs.readFile(`${__dirname}/../endpoints.json`, 'utf8')
        return Promise.all([response.body, endpointsfile])
      })
      .then((promiseArr) => {
        expect(promiseArr[0]).toEqual(JSON.parse(promiseArr[1]))
      })
  })
})

describe("GET /api/articles/:article_id", () => {
  test("return 200 status with correct article", () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((response) => {
        expect(response.body.article_id).toBe(1)
        expect('author' in response.body).toBe(true)
        expect('title' in response.body).toBe(true)
        expect('body' in response.body).toBe(true)
        expect('topic' in response.body).toBe(true)
        expect('created_at' in response.body).toBe(true)
        expect('votes' in response.body).toBe(true)
        expect('article_img_url' in response.body).toBe(true)
        expect(typeof response.body.comment_count).toBe('number')
      })
    })
    test("returns correct comment count for article with many comments", () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((article) => {
          expect(article.body.comment_count).toBe(11)
        })
    })
    test("returns correct comment count for article with no comments", () => {
      return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then((article) => {
          expect(article.body.comment_count).toBe(0)
        })
    })
  test("return 404 status with error message if given a valid but non-existent article id", () => {
    return request(app)
      .get('/api/articles/9999999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('article does not exist')
      })
  })
  test('return 400 status with error messgae if given an invalid id', () => {
    return request(app)
      .get('/api/articles/not-an-id')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      });
  });
})

describe("GET /api/articles", () => {
  test("return 200 status with array of article objects with correct properties", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(13)
        response.body.forEach((articleObj) => {
          expect(typeof articleObj.author).toBe('string')
          expect(typeof articleObj.title).toBe('string')
          expect(typeof articleObj.article_id).toBe('number')
          expect(typeof articleObj.topic).toBe('string')
          expect(typeof articleObj.created_at).toBe('string')
          expect(typeof articleObj.votes).toBe('number')
          expect(typeof articleObj.article_img_url).toBe('string')
          expect(typeof articleObj.comment_count).toBe('number')
        })
      })
  })
  test("return 200 status with array of articles objects with correct comment counts", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        response.body.forEach((article) => {
          if (article.article_id === 1) {
            expect(article.comment_count).toBe(11)
          } else if (article.article_id === 2) {
            expect(article.comment_count).toBe(0)
          } else if (article.article_id === 3) {
            expect(article.comment_count).toBe(2)
          }
      })
    })
  })
  test("return 200 status with array of articles objects sorted by default descending by created_at", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        expect(response.body).toBeSorted({ key: "created_at", descending: true})
      })
  })
  test("return 200 status with array of articles objects without a body property", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        response.body.forEach((article) => {
          expect('body' in article).toBe(false)
        })
      })
  })
})

describe("GET /api/articles/:article_id/comments", () => {
  test("return 200 status with array of objects with the correct properties", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(11)
        response.body.forEach((comment) => {
          expect(typeof comment.comment_id).toBe('number')
          expect(typeof comment.votes).toBe('number')
          expect(typeof comment.created_at).toBe('string')
          expect(typeof comment.author).toBe('string')
          expect(typeof comment.body).toBe('string')
          expect(typeof comment.article_id).toBe('number')
        })
      })
  })
  test("return 200 status with empty array for article with no comments", () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([])
      })
  })
  test("return 200 status with an array of objects sorted by 'created_at' descending", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .then((response) => {
        expect(response.body).toBeSorted({ key: "created_at", descending: true})
      })
  })
    test("return 404 status with error message if given a valid but non-existent article id", () => {
    return request(app)
      .get('/api/articles/9999999/comments')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('article does not exist')
      })
  })
  test('return 400 status with error messgae if given an invalid id', () => {
    return request(app)
      .get('/api/articles/not-an-id/comments')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
})

describe("POST /api/articles/:article_id/comments", () => {
  test("return 201 status with posted object", () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({
        username: "rogersop",
        body: "This was an interesting read"
      })
      .expect(201)
      .then((response) => {
        expect(typeof response.body[0].article_id).toBe('number')
        expect(typeof response.body[0].author).toBe('string')
        expect(typeof response.body[0].body).toBe('string')
        expect(typeof response.body[0].comment_id).toBe('number')
        expect(typeof response.body[0].created_at).toBe('string')
        expect(typeof response.body[0].votes).toBe('number')
      })
  })
  test("posts the input post to the comments table", () => {
    return request(app)
      .post('/api/articles/1/comments')
      .send({
        username: "butter_bridge",
        body: "I didn't care for this"
      })
      .expect(201)
      .then((post) => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then((response) => {
            expect(post.body[0]).toEqual(response.body[0])
          })
      })
  })
  test("return 404 error with error message if given a valid but non-existent id", () => {
    return request(app)
      .post('/api/articles/999/comments')
      .send({
        username: "butter_bridge",
        body: "I didn't care for this"
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('article does not exist')
      })
  })
  test("return 400 error with error message if given an invalid id", () => {
    return request(app)
      .post('/api/articles/not-an-id/comments')
      .send({
        username: "butter_bridge",
        body: "I didn't care for this"
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
  test("return 404 error with error message if input object doesn't have required keys", () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({
        username: "butter_bridge",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
  test("return 404 error with error message if input object username does not correspond to a valid user", () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({
        username:"jimbob",
        body: "I didn't care for this"
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
})
    
describe("PATCH /api/articles/:article_id", () => {
  test("return 200 status with the updated article", () => {
    return request(app)
      .patch('/api/articles/2')
      .send({
        inc_votes: 5
      })
      .expect(200)
      .then((response) => {
        expect(typeof response.body.article_id).toBe('number')
        expect(typeof response.body.author).toBe('string')
        expect(typeof response.body.body).toBe('string')
        expect(typeof response.body.topic).toBe('string')
        expect(typeof response.body.created_at).toBe('string')
        expect(typeof response.body.votes).toBe('number')
        expect(typeof response.body.title).toBe('string')
        expect(typeof response.body.article_img_url).toBe('string')
      })
  })
  test("returned article is equal to the updated article", () => {
    return request(app)
      .patch('/api/articles/1')
      .send({
        inc_votes: -200
      })
      .expect(200)
      .then((post) => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then((response) => {
            expect(post.body.votes).toEqual(response.body.votes)
          })
      })
  })
  test("updates votes by inc_votes on input object", () => {
    return request(app)
      .get('/api/articles/2')
      .then((articleBefore) => {
        return request(app)
          .patch('/api/articles/2')
          .send({
            inc_votes: 20
          })
          .expect(200)
          .then((article) => {
            return request(app)
              .get('/api/articles/2')
              .then((articleAfter) => {
                expect(articleAfter.body.votes).toBe(articleBefore.body.votes + 20)
              })
          })
      })
  })
  test("return 404 error with error message if given a valid but non-existent id", () => {
    return request(app)
      .patch('/api/articles/999')
      .send({
        inc_votes: 5
            })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('article does not exist')
      })
  })
  test("return 400 error with error message if given an invalid id", () => {
    return request(app)
          .patch('/api/articles/not-an-id')
      .send({
        inc_votes: -10
          })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
  test("return 400 error with error message if input object doesn't have required keys", () => {
    return request(app)
      .patch('/api/articles/2')
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
  test("return 400 error with error message if input object inc_votes is not a number", () => {
    return request(app)
      .patch('/api/articles/2')
      .send({
        inc_votes: "oops"
        })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
  })
})

describe("DELETE /api/comments/:comment_id", () => {
  test("returns 204 status code and deletes the comment from the database", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((commentsBefore) => {
        return request(app)
          .delete('/api/comments/2')
          .expect(204)
          .then(() => {
            return request(app)
              .get('/api/articles/1/comments')
              .expect(200)
              .then((commentsAfter) => {
                // checks a comment has been deleted
                expect(commentsAfter.body.length).toBe(commentsBefore.body.length - 1)
                // checks comment 2 has been deleted
                commentsAfter.body.forEach((comment) => {
                  expect(comment.comment_id).not.toBe(2)
                })
              })
          })
      })
  })
  test("returns 404 status with error message if given a valid but non-existent id", () => {
    return request(app)
      .delete('/api/comments/999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('comment does not exist')
      })
  })
  test("returns 400 status with error message if given an invalid id", () => {
    return request(app)
      .delete('/api/comments/not-an-id')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request')
      })
  })
})
    
describe("GET /api/users", () => {
  test('returns 200 status with array of user objects with correct keys', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(4)
        response.body.forEach((user) => {
          expect(typeof user.username).toBe('string')
          expect(typeof user.name).toBe('string')
          expect(typeof user.avatar_url).toBe('string')
        })
      })
  })
  // error testing for non-existent or misspelt endpoint unnecessary:
  // already completed in "GET /api/topics" tests
})  
  
describe("GET /api/articles (topic query)", () => {
  test("return 200 status with array of all articles with given topic", () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(12)
        response.body.forEach((article) => {
          expect(article.topic).toBe('mitch')
        })
      })
  })
  test("still returns articles descending by time created", () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then((response) => {
        expect(response.body).toBeSorted({ key: "created_at", descending: true})
      })
  })
  test("return 404 status with error message if topic does not exist", () => {
    return request(app)
      .get('/api/articles?topic=balloons')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("topic queried does not exist")
      })
  })
  test("return 200 status with empty array if topic exists but no articles have that topic", () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([])
      })
  })
})

describe("GET /api/articles (sorting queries)", () => {
  test("returns 200 with array of articles sorted by given column", () => {
    return request(app)
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'title', descending: true })
      })
  })
  test("returns 200 with array of articles sorted ascending", () => {
    return request(app)
      .get('/api/articles?order=asc')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'created_at', descending: false })
      })
  })
  test("returns 200 with array of articles sorted ascending by given column", () => {
    return request(app)
      .get('/api/articles?sort_by=title&order=ASC')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'title', descending: false })
      })
  })
  test("returns 200 with array of all articals of a given topic, sorted ascending by given column", () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=title&order=ASC')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'title', descending: false })
        expect(articles.body.length).toBe(12)
        articles.body.forEach((article) => {
          expect(article.topic).toBe('mitch')
        })
      })
  })
  test("returns 200 with array of articles sorted by comment_count descending", () => {
    return request(app)
      .get('/api/articles?sort_by=comment_count')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'comment_count', descending: true })
      })
  })
  test("returns 200 with array of articles sorted by comment_count ascending", () => {
    return request(app)
      .get('/api/articles?sort_by=comment_count&order=asc')
      .expect(200)
      .then((articles) => {
        expect(articles.body).toBeSorted({ key: 'comment_count', descending: false })
      })
  })
  test("return 404 status with error message if sort_by column does not exist", () => {
    return request(app)
      .get('/api/articles?sort_by=balloons')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("sort_by column queried does not exist")
      })
  })
  test("return 404 status with error message if order query is not asc or desc", () => {
    return request(app)
      .get('/api/articles?order=balloons')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("order queried does not exist")
      })
  })
})