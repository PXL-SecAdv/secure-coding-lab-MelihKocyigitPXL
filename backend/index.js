const pg = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');


dotenv.config();

const port=3000;

const corsOptions = {
  origin: 'http://localhost:8080', 
};


const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: 'db',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    connectionTimeoutMillis: 5000
})

console.log("Connecting...:")

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.get('/authenticate/:username/:password', async (request, response) => {
  const username = request.params.username;
  const password = request.params.password;

  const query = `SELECT * FROM users WHERE user_name=$1`;
  const values = [username];
  
  console.log(query, values);

  pool.query(query, values, async (error, results) => {
    if (error) {
      throw error;
    }

    const user = results.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      response.status(200).json({ message: 'Authentication successful' });
    } else {
      response.status(401).json({ message: 'Authentication failed' });
    }
  });
});



app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

