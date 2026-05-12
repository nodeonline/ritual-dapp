// server.js

const express = require("express")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()

const app = express()

app.use(express.json())

app.use(express.static(
  path.join(__dirname, "public")
))

const db =
  new sqlite3.Database(
    "ritual.db"
  )

db.serialize(() => {

  db.run(`

    CREATE TABLE IF NOT EXISTS deploys (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      txHash TEXT,

      contractAddress TEXT,

      wallet TEXT,

      status TEXT,

      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP

    )

  `)

})

app.get("/api/stats", (req, res) => {

  db.get(

    `
    SELECT COUNT(*) as total
    FROM deploys
    `,

    [],

    (err, row) => {

      res.json({
        total: row.total
      })
    }
  )
})

app.get("/api/history", (req, res) => {

  db.all(

    `
    SELECT *
    FROM deploys
    ORDER BY id DESC
    LIMIT 50
    `,

    [],

    (err, rows) => {

      res.json(rows)
    }
  )
})

app.get("/api/success", (req, res) => {

  db.all(

    `
    SELECT *
    FROM deploys
    WHERE status = 'Success'
    ORDER BY id DESC
    LIMIT 50
    `,

    [],

    (err, rows) => {

      res.json(rows)
    }
  )
})

app.post("/api/history", (req, res) => {

  const {

    txHash,
    contractAddress,
    wallet,
    status

  } = req.body

  db.run(

    `
    INSERT INTO deploys (
      txHash,
      contractAddress,
      wallet,
      status
    )

    VALUES (?, ?, ?, ?)
    `,

    [
      txHash,
      contractAddress,
      wallet,
      status
    ],

    () => {

      res.json({
        success: true
      })
    }
  )
})

app.listen(3000, () => {

  console.log(
    "server running on 3000"
  )
})