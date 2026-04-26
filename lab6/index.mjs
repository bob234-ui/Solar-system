import express from "express";
import mysql from "mysql2";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "x71wqc4m22j8e3ql.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "hrjqrwrd3mlzutyi",
  password: "whn25kq7ke7nx5el",
  database: "u83aetqdespielpz"
});

app.get("/", (req, res) => {
  const { searchType, keyword, category, author, minLikes, maxLikes } = req.query;

  let error = null;
  let quotes = [];

  db.query("SELECT DISTINCT category FROM quotes", (err, categories) => {
    if (err) throw err;

    db.query("SELECT authorId, firstName, lastName FROM authors", (err2, authors) => {
      if (err2) throw err2;

      if (!searchType) {
        return res.render("home", {
          quotes: [],
          categories,
          authors,
          error: null,
          searchType: ""
        });
      }

      let sql = `
        SELECT q.*, a.firstName, a.lastName
        FROM quotes q
        JOIN authors a ON q.authorId = a.authorId
        WHERE 1=1
      `;

      let params = [];

      if (searchType === "keyword") {
        if (!keyword || keyword.trim().length < 3) {
          return res.render("home", {
            quotes: [],
            categories,
            authors,
            error: "Keyword must be at least 3 characters.",
            searchType
          });
        }

        sql += " AND q.quote LIKE ?";
        params.push(`%${keyword}%`);
      }

      if (searchType === "category") {
        sql += " AND q.category = ?";
        params.push(category);
      }

      if (searchType === "author") {
        sql += " AND q.authorId = ?";
        params.push(author);
      }

      if (searchType === "likes") {
        if (minLikes) {
          sql += " AND q.likes >= ?";
          params.push(minLikes);
        }

        if (maxLikes) {
          sql += " AND q.likes <= ?";
          params.push(maxLikes);
        }
      }

      // Female authors section
      // This version uses author names since many school databases
      // do not include a gender column.
      if (searchType === "female") {
        sql += `
          AND CONCAT(a.firstName, ' ', a.lastName) IN (
            'Jane Austen',
            'Maya Angelou',
            'Virginia Woolf',
            'Emily Dickinson',
            'Helen Keller',
            'Mother Teresa',
            'Ayn Rand',
            'Anne Frank',
            'Harper Lee',
            'Louisa May Alcott'
          )
        `;
      }

      db.query(sql, params, (err3, results) => {
        if (err3) throw err3;

        res.render("home", {
          quotes: results,
          categories,
          authors,
          error,
          searchType
        });
      });
    });
  });
});

app.get("/author/:id", (req, res) => {
  const sql = "SELECT * FROM authors WHERE authorId = ?";

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) throw err;
    res.json(rows[0]);
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});