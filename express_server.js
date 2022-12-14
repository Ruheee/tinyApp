const cookieSession = require('cookie-session');
const express = require('express');
const bcrypt = require("bcryptjs");
const getUserByEmail = require('./helper');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['viva portugal'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
const generateRandomString = () => {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters[Math.round(Math.random() * (characters.length - 1))];
  }
  return result;
};


const urlsForUser = (cookieID) => {
  const obj1 = {};
  for (const userID in urlDatabase) {
    if (urlDatabase[userID].userID === cookieID) {
      obj1[userID] = urlDatabase[userID];
    }
  }
  return obj1;
};


// generates random userID and checks to see if email exists and if email / password is an empty string
app.post("/register", (request, response) => {
  const generatedId = generateRandomString();
  const emailCheck = request.body.email;
  const passCheck = request.body.password;
  const hashedPass = bcrypt.hashSync(passCheck, 10);
  
  if (emailCheck === "" || passCheck === "") {
    return response.status(404).send("Error: 404");
  }
  const dataUrlBase = users;
  const userEmail = getUserByEmail(emailCheck, dataUrlBase);
  if (userEmail) {
    return response.status(400).send("Error: 400");
  }
  users[generatedId] = { id: generatedId, email: request.body.email, password: hashedPass};
  request.session.user_id = generatedId;
  response.redirect("/urls");
});

// handles the registration form
app.get("/register", (request, response) => {
  const currentUser = users[request.session.user_id];
  const templateVars = { email: "email", password: "password", user: currentUser };
  if (currentUser) {
    response.redirect("/urls");
  }
  response.render("register", templateVars);
});

// add an endpoint to handle a logout
app.post("/logout", (request, response) => {
  response.clearCookie('session');
  response.redirect("/login");
});

// handles the login ejs page
app.get("/login", (request,response) => {
  const currentUser = users[request.session.user_id];
  const templateVars = { email: "email", password: "password", user: currentUser };
  if (currentUser) {
    response.redirect("/urls");
  }
  response.render("login", templateVars);
});

// add an endpoint to handle a post to login
app.post("/login", (request,response) => {
  const email = request.body.email;
  const password = request.body.password;
  const dataUrlBase = users;
  const user = getUserByEmail(email, dataUrlBase);
  if (!user) {
    return response.status(403).send("Error: 403");
  }
  const passValidation = bcrypt.compareSync(password, user.password);
  if (!passValidation) {
    return response.status(403).send("Error: 403");
  }
  request.session.user_id = user.id;
  // response.cookie('user_id', user.id);
  response.redirect("/urls");
});

// edit the exist long URL to something different
app.post("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const userCookie = request.session['user_id'];
  const urlUserID = urlDatabase[request.params.shortURL].userID;
  if (userCookie === urlUserID) {
    urlDatabase[shortURL] = { longURL: request.body.longURL , userID: request.session.user_id };
  } else {
    response.status(404).send("Need to be logged in order to delete");
  }
  
  response.redirect("/urls");
});

// deletes a url on main apge
app.post("/urls/:id/delete", (request, response) => {
  const userInput = request.params.id;
  const userCookie = request.session['user_id'];
  const urlUserID = urlDatabase[request.params.id].userID;
  if (userCookie === urlUserID) {
    delete urlDatabase[userInput];
  } else {
    response.status(404).send("Need to be logged in order to delete");
  }
  response.redirect("/urls");
});

// takes you to the website assigned to the 6 chatacter key
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send(`Error 404: ${id} not found`);
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

//  generates a random 6 character key for new url inputted
app.post("/urls", (request, response) => {
  let id = generateRandomString();
  urlDatabase[id] = { longURL: request.body.longURL, userID: request.session.user_id };
  const currentUser = users[request.session.user_id];
  if (!currentUser) {
    response.send('You need to be registered and/or logged in for you to have access to shortening urls');
  }
  response.redirect(`/urls/${id}`);
});

// routes to a page where you can input new urls
app.get("/urls/new", (request, response) => {
  const currentUser = users[request.session.user_id];
  templateVars = { user: currentUser };
  if (!currentUser) {
    response.redirect('/login');
  }
  response.render("urls_new", templateVars);
});

// adds the new url inputted to the Urldatabase object
app.get('/urls/:id', (request, response) => {
  const currentUser = users[request.session.user_id];
  const userInput = request.params.id;
  const templateVars = { id: request.params.id, longURL: urlDatabase[userInput].longURL, user: currentUser };
  const userCookie = request.session['user_id'];
  const urlUserID = urlDatabase[request.params.id].userID;
  if (!urlDatabase[userInput] || userCookie !== urlUserID) {
    response.send(`Error 404: ${userInput} not found`);
  }
  response.render("urls_show", templateVars);
});

// renders the urlDatabase on the urls page
app.get("/urls", (request, response) => {
  const currentUser = users[request.session.user_id];
  const userID = request.session.user_id;
  const userIDChecker = urlsForUser(userID);
  const templateVars = { urls: userIDChecker, user: currentUser };
  if (!currentUser) {
    response.send('You need to be registered and/or logged in for you to have access to shortening urls');
  }
  response.render("urls_index", templateVars);
});

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

// what port for the server to listen on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});