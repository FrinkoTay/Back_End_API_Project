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
      });
  });
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