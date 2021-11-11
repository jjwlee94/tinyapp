const urlDatabase = {};
const users = {};

const generateRandomString = function () {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const userEmailExists = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const urlsForUser = function (id) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  userEmailExists,
  getUserByEmail,
  urlsForUser,
  urlDatabase,
  users,
};
