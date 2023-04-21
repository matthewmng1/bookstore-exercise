process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const db = require("../db");

// isbn of sample book
let book_isbn;

beforeEach(async () => {
  let res = await db.query(`
  INSERT INTO 
  books (isbn, amazon_url, author, language, pages, publisher, title, year)
  VALUES(
    '11223344', 
    'www.amazon.com/book_url', 
    'Johnny Books', 
    'English', 
    200, 
    'The Book Publisher', 
    'This is a book', 
    2010)
  RETURNING isbn`)
  book_isbn = res.rows[0].isbn
})
describe("POST /books", () => {
  test("Create a new book", async () => {
    const res = await request(app)
      .post(`/books`)
      .send({
        isbn: '12345678',
        amazon_url: "https://newbook.com",
        author: "Senor Book",
        language: "spanish",
        pages: 456,
        publisher: "El Hombre Libro",
        title: "Los Perros Bonitos",
        year: 1997  
      })
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
  })
})

describe('GET /', () => {
  test('Get a list of 1 book', async () => {
    const res = await request(app).get('/books')
    const books = res.body.books;
    expect(books).toHaveLength(1)
    expect(res.body).toEqual({
      "books" : [
        {
          "isbn": "11223344",
          "amazon_url": "www.amazon.com/book_url",
          "author": "Johnny Books",
          "language": "English",
          "pages": 200,
          "publisher": "The Book Publisher", 
          "title": "This is a book",
          "year": 2010
        }
      ]
    })
  })
})

describe("GET /books/:isbn", () => {
  test("Gets one book", async () => {
    const res = await request(app)
      .get(`/books/${book_isbn}`)
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.isbn).toBe(book_isbn);
  }) 
})

describe("PUT /books/:isbn", function () {
  test("Updates a single book", async () => {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
          amazon_url: "https://newbook.com",
          author: "Senor Book",
          language: "spanish",
          pages: 456,
          publisher: "El Hombre Libro",
          title: "Los Perros Bonitos Nuevos",
          year: 1997  
        });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("Los Perros Bonitos Nuevos");
  });
})

describe("DELETE /books/:isbn", function () {
  test("Deletes a single a book", async () => {
    const response = await request(app)
        .delete(`/books/${book_isbn}`)
    expect(response.body).toEqual({message: "Book deleted"});
  });
})

afterEach(async () => {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async () => {
  await db.end()
})