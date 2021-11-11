const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");

const app = express();
const PORT = 8080; // default port 8080

const {
  generateRandomString,
  userEmailExists,
  getUserByEmail,
  urlsForUser,
  urlDatabase,
  users,
} = require("./helpers");

app.set("view engine", "ejs");

// Middleware //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(morgan("dev"));

// GET requests //

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

// POST requests //

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Error: Please login to create a new URL.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res
      .status(401)
      .send("Error: This shortened URL is not associated with your account.");
  }
});

// Edit URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);
  if (Object.keys(userURLs).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect("/urls");
  } else {
    res
      .status(401)
      .send("Error: This shortened URL is not associated with your account.");
  }
});

// Login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = getUserByEmail(userEmail, users);
  if (!userEmailExists(userEmail, users)) {
    return res
      .status(403)
      .send("Error: Email address does not exist. Please create an account.");
  } else if (!bcrypt.compareSync(userPassword, users[userID].password)) {
    return res
      .status(403)
      .send("Error: Incorrect password. Please login again.");
  } else {
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Logout
app.post("/logout", (req, res) => {
  const userID = req.body.userID;
  req.session = null;
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
  } else if (userEmailExists(userEmail, users)) {
    return res
      .status(400)
      .send(
        "Error: Email address already exists. Please login to your account."
      );
  } else {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10),
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Listen //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
