const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { response } = require("express");

const generateRandomString = function () {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const userEmailExists = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

// Middleware //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// GET requests //

// Check cookies
app.get("/", (req, res) => {
  console.log("Cookies: ", req.cookies);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// POST requests //

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("Error: Please login to create a new URL.");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
  // console.log(urlDatabase); --> Test which URLs belong to which users
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Edit URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = userEmailExists(userEmail);
  if (!userEmailExists(userEmail)) {
    return res
      .status(403)
      .send("Error: Email address does not exist. Please create an account.");
  }
  if (users[userID].password !== userPassword) {
    return res
      .status(403)
      .send("Error: Incorrect password. Please login again.");
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  const userID = req.body.userID;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = generateRandomString();
  if (!userEmail || !userPassword) {
    return res
      .status(400)
      .send("Error: No email address and/or password submitted.");
  }
  if (userEmailExists(userEmail)) {
    return res.status(400).send("Error: Email address already exists.");
  }
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword,
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Listen //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
