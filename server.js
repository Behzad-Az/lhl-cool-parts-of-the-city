"use strict"

const PORT            = process.env.PORT || 8080;
const express         = require("express");
const app             = express();
const bodyParser      = require("body-parser");
const session         = require("express-session");
const bcrypt          = require("bcrypt");
const saltRounds      = 10;
const dbConfig        = require("./config/db");
const knex            = require('knex')({ client: 'pg', connection: dbConfig });
const dataHelpers     = require("./lib/util/data-helpers");   // saveMaps & getMaps

app.set("view engine", "ejs");
app.set('trust proxy', 1);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));


const tempMapId = 129;
// This middleware prints details about each http request to the console. It works, but it also
// prints one for every script request made, which for us means about 6 or 7. If we can find a way
// to blacklist those scripts, we should implement it.
// ===============================
// var morgan = require('morgan')
// app.use(morgan('combined'))
// ===============================

//     +---------------------------+
//     |     locals middleware     |
//     +---------------------------+

app.use((req, res, next) => {

  res.locals.current_user = null;
  if (req.session.username) {
    knex.select('*').from('users').where('username', req.session.username).asCallback(function(err, rows) {
      if (err) {
        console.log(err);
        next();
      }
      if (rows.length) {
        res.locals.current_user = rows[0];
      }
      next();
    })
  } else {
    next();
  }
})

//     +-----------------------------------+
//     |     whitelist page middleware     |
//     +-----------------------------------+

// const WHITELISTED_PAGES = ["/", "/register", "/login", "/users", "/users/:username", "/users/:username/:mapid"]
// app.use(function(req, res, next) {
//   console.log("Authorizing...");
//   console.log("My req.url: " + req.url);
//   if(!WHITELISTED_PAGES.includes(req.url)) {
//     const authorized = req.session.username
//     if(!authorized) {
//       res.redirect("/")
//     }
//   }
//     console.log("I'm working!");
//     next();
// });


// ======================================================

//         +-----------------------+
//         |   user registration   |
//         +-----------------------+

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

//         +------------------------+
//         |     login & logout     |
//         +------------------------+

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
          } else {
            console.log("wrong password");
            res.status(401).send("Invalid username or password");
            return;
          }
        })
      } else {
        console.log("username not found");
        res.status(401).send("Invalid username or password");
        return;
      }
    }
  });
});

app.post("/logout", (req, res) => {
  req.session.username = undefined;
  res.redirect("/")
});







// temp reoute for development purposes for Behzad
app.get("/listMaps", (req, res) => {
  knex('maps').select('id', 'title', 'centre_x', 'centre_y', 'zoom').asCallback((err, rows) => {
    if (err) throw err;
    res.render("listMaps", {data: rows});
    console.log(rows);
  });
});







//         +--------------------------+
//         |Fixes url fron info window|
//         +--------------------------+


function fixURL(originalURL) {
  if (!(originalURL.includes("://"))) {
    originalURL = "http://" + originalURL;
  }
  return originalURL;
}






//         +---------------------+
//         |CREATE GET AND POST |
//         +---------------------+

app.get("/users/:username/create", (req, res) => {
  res.render("createNewMap");
});



app.post("/users/:username/create", (req, res) => {

  if (!req.body) {
    res.status(400).json({ error: 'invalid request: no data in POST body'});
    return;
  }

  let mapData = {
    mapTemplate: [{
      user_id: null,
      centre_x: req.body.mapCentreLat,
      centre_y: req.body.mapCentreLng,
      zoom: req.body.mapZoom,
      region: 'a region',
      title: req.body.mapTitle
    }],
    coordinatesData: req.body.mapPoints
  }
console.log("mapData: ", mapData);
  dataHelpers.saveMaps(mapData, (err) => {
    if (err) {
      res.status(500).json({ err: err.message });
    } else {
      res.status(201).send();
    }
  })

});


//         +---------------------+
//         |   DEVELOPMENT EDIT  |
//         +---------------------+
// temp route for map development purposes for Behzad
app.get("/wipeDatabase", (req, res) => {
  emptyDataTables('coordinates');
  emptyDataTables('maps');
});

app.get("/users/:username/:mapid", (req, res) => {
  let mapData = {};
  let pointsData = {};
  knex('maps').select('id', 'centre_x', 'centre_y', 'zoom', 'title').where('id', tempMapId)

    .asCallback(function (err, rows) {
    if (err) throw err;
    mapData = rows[0];
    knex('coordinates').where('map_id', rows[0].id)
    .asCallback(function (err, rows) {
      if (err) throw err;
      pointsData = rows;
      let dataTemplate = {
          mapData: mapData,
          pointsData: pointsData
      };
      dataTemplate = JSON.stringify(dataTemplate);
      res.render('editMap', {data: dataTemplate});
    });
  });

});


app.post("/users/:username/edit", (req, res) => {
  console.log('Editing map....');
  let map_id = tempMapId;
  let mapTemplate = {
    centre_x: req.body.mapCentreLat,
    centre_y: req.body.mapCentreLng,
    user_id: null,
    zoom: req.body.mapZoom,
    region: 'a region edited',
    title: req.body.mapTitle
  };

  let mapPoints = req.body.mapPoints;

  knex('maps').where('id', map_id).update(mapTemplate).then((resp) => {
    knex('coordinates').where('map_id', map_id).del().then((resp) => {
      mapPoints.forEach((point) => {
        let pointTemplate = {
          lng: point.lng,
          lat: point.lat,
          map_id: map_id,
          name: "edited name",
          description: "edited description",
          img_url: 'eidted url'
        };
        knex('coordinates').insert(pointTemplate).asCallback(function (err, row) {
          if (err) throw err;
        });
      });
    });
  });

});


// temp route for map development purposes for Behzad
app.get("/renderMap", (req, res) => {
  let mapData = {};
  let pointsData = {};
  knex('maps').select('id', 'centre_x', 'centre_y', 'zoom', 'title').where('id', 66)

    .asCallback(function (err, rows) {
    if (err) throw err;
    mapData = rows[0];
    knex('coordinates').where('map_id', rows[0].id)
    .asCallback(function (err, rows) {
      if (err) throw err;
      pointsData = rows;
      let dataTemplate = {
          mapData: mapData,
          pointsData: pointsData
      };
      dataTemplate = JSON.stringify(dataTemplate);
      res.render('renderMap', {data: dataTemplate});
    });
  });

});

// temp reoute for development purposes for Behzad
app.get("/listMaps", (req, res) => {
  knex('maps').select('id', 'title').asCallback((err, rows) => {
    if (err) throw err;
    //console.log(rows);
    res.render("listMaps", {data: rows});
  });

});

app.get("/users/:username/create", (req, res) => {
  res.render("createNewMap");
});


app.post("/users/:username/create", (req, res) => {

  if (!req.body) {
    res.status(400).json({ error: 'invalid request: no data in POST body'});
    return;
  }

  let mapData = {
    mapTemplate: [{
      user_id: null,
      centre_x: req.body.mapCenterLng,
      centre_y: req.body.mapCenterLat,
      zoom: req.body.mapZoom
    }],
    coordinatesData: req.body.mapPoints
  }
  console.log("mapData: ", mapData);
  dataHelpers.saveMaps(mapData, (err) => {
    if (err) {
      res.status(500).json({ err: err.message });
    } else {
      res.status(201).send();
    }
  })

});


// users page
app.get("/users", (req, res) => {

});

// user page
app.get("/users/:username", (req, res) => {

  let mapData = {};
  let pointsData = {};
  knex('maps').select('id', 'centre_x', 'centre_y', 'zoom','title').where('id', tempMapId)
    .asCallback(function (err, rows) {
    if (err) throw err;
    mapData = rows[0];
    knex('coordinates').where('map_id', rows[0].id).asCallback(function (err, rows) {
      if (err) throw err;
      pointsData = rows;
      let dataTemplate = {
          mapData: mapData,
          pointsData: pointsData
      };
      dataTemplate = JSON.stringify(dataTemplate);
      res.render('user-homepage', {data: dataTemplate});
    });
  });
});


// edit post
app.post("/users/:username/:mapid", (req, res) => {

});


app.post("/markers", (req, res) => {
  // Create.marker(res.body)

  res.send({sent: 'from server'});
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function emptyDataTables (dataTable) {
  knex(dataTable).del().asCallback(function (err, rows) {
    if (err) throw err;
    knex(dataTable).select().asCallback(function (err, rows) {
      if (err) throw err;
      else console.log(rows);
    });
  });
}





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
