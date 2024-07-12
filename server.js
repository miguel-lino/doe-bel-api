const express = require("express");
const cors = require("cors");

// Dotenv
const dotenv = require('dotenv');
dotenv.config();

// App
const app = express();

var corsOptions = {
  origin: process.env.CORS_ALLOW_URL,
  credentials: true
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to DOE-BEL application." });
});

require("./app/routes/usuario.routes")(app);
require("./app/routes/anuncio.routes")(app);
require("./app/routes/autenticacao.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}.`);
});
