"use strict"

const express         = require("express");
const app             = express();
const PORT            = process.env.PORT || 8080;
const bodyParser      = require("body-parser");
const cookieParser    = require("cookie-parser");
const session         = require("express-session");
const bcrypt          = require("bcrypt");
const saltRounds      = 10;
const dbConfig        = require("./config/db");
const knex            = require('knex')({ client: 'pg', connection: dbConfig });

app.set("view engine", "ejs");
app.set('trust proxy', 1);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser()); // do we need it if we are changing it to express-session from cookie-session??

// app.use(express.static("public"));
app.use((req, res, next) => {
  res.locals.username = req.session.username ? req.session.username : null;

  knex.select('*').from('users').asCallback(function(err, rows) {
    if (err) throw err;

  })
})


// homepage
app.get("/", (req, res) => {
  console.log("Hello world");
  res.render("login");
});

// // temp route for map development purposes for Behzad
// app.get("/renderMap", (req, res) => {
//   res.render("renderMap");
// });

// temp route for map development purposes for Behzad
app.get("/users/:username/create", (req, res) => {
  res.render("createNewMap");
});

// temp route for map development purposes for Behzad
app.post("/users/:username/create", (req, res) => {

  console.log('success on server');
  console.log(req.body);
  //res.send("success");
  let template = {
    center_x: req.body.mapCenterLat,
    center_y: req.body.mapCenterLng,
    user_id: null,
    zoom: req.body.mapZoom,
    region: 'a region',
    keyword: 'a keyword'
  };
  knex('maps').insert(template).asCallback(function (err, rows) {
    if (err) { console.log (err); throw err; }
  });

  knex('maps').select().asCallback(function (err, rows) {
    if (err) console.log(err);
    else console.log(rows);
  });


});

// // temp route for map development purposes for Behzad
// app.get("/users/:username/:mapid", (req, res) => {
//   res.render("editMap");
// });


//         +---------------------+
//         |  user registration  |
//         +---------------------+

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const input = req.body;

  if (input.email === "" || input.username === "" || input.password === "") {
    res.status(400).send("You are missing some inputs man")
  } else {

    knex.select('*').from('users').where('username', input.username).asCallback(function (err, rows) {
      if (err) throw err;
      if (rows.length !== 0) {
        res.status(400).send("Username unavaileble")
      } else {
        knex.select('*').from('users').where('email', input.email).asCallback(function (err, rows) {
          if (err) throw err;
          if (rows.length !== 0) {
            res.status(400).send("Email unavailable")
          } else {
            let enteredUsername   = input.username;
            let enteredEmail      = input.email;
            let enteredPassword   = input.password;
            bcrypt.hash(enteredPassword, saltRounds, (err, hash) => {
              const newUser = {
                username: enteredUsername,
                email:    enteredEmail,
                password: hash
              };
              console.log("newUser data:", newUser);
              knex.insert(newUser).into('users').asCallback(function (err, rows) {
                if (err) { console.log (err); throw err; }
              });
            })
            res.redirect("/");
          }
        });
      }
    });
  }

});

//         +------------------+
//         |  login & logout  |
//         +------------------+

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/", (req, res) => {
  const input = req.body
  var usernameFound    = "";
  var passwordFound    = "";

  knex.select('*').from('users').where('username', input.username).asCallback(function (err, rows) {
    if (err) throw err;
    if (rows.length !== 0) {
      usernameFound = rows[0].username;
      passwordFound = rows[0].password;
      if (input.username === usernameFound) {
        console.log("email found in the db");
        bcrypt.compare(input.password, passwordFound, (err, passwordMatch) => {
          if (passwordMatch) {
            req.session.username = input.username;
            res.redirect(`/users/${input.username}`);
            return;
          }else {
            console.log("wrong password");
            res.status(401).send("Invalid username or password");
            return;
          }
        })
      }else {
        console.log("username not found");
        res.status(401).send("Invalid username or password");
        return;
      }
    }
  });
});

app.post("/logout", (req, res) => {
  req.session.username = undefined;
});


// users page
app.get("/users", (req, res) => {

});

// user page
app.get("/users/:id", (req, res) => {
  res.render("user-homepage")

});

//
app.get("/users/:id/", (req, res) => {

});

// create new post

// edit post
app.post("/users/:id/:postid", (req, res) => {

});


// app.get("/users/:username/create", (req, res) => {
//   res.render('createNewMap');
//   //console.log(req.body);
// });

// app.post("/users/:username/create", (req, res) => {
//   console.log(req.body);
// });





//app.use("/users/behzad/create", coordinatesRoutes);



// const dataHelper = require("./lib/util/data-helpers.js")(req.body);
// dataHelper.saveMaps(req.);
// const coordinatesRoutes = require("./routes/coordinates.js")(dataHelper);



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

