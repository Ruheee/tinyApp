var cookieParser = require('cookie-parser');
const { response, request } = require('express');
const express = require('express'); 
const app = express();
const PORT = 8080; // default port is 8080

app.set("view engine", "ejs");// tells the express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
};

function generateRandomString() {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'//characters that will be used in random generated string
  let result = '' //empty string
  for (let i = 0; i < 6; i++) {
    result += characters[Math.round(Math.random() * (characters.length - 1))];
  }
  return result;
};

app.get("/register", (request, response) => {
  const templateVars = { email: "email", password: "password", username: request.cookies["username"] };
  response.render("register", templateVars);
});

// add an endpoint to handle a logout
app.post("/logout", (request, response) => {
  response.clearCookie('username');
  response.redirect("/urls");
});

// add an endpoint to handle a post to login
app.post("/login", (request,response) => {
  const inputtedUsername = request.body.username;
  response.cookie('username', inputtedUsername);
  response.redirect("/urls");
});

// edit the exist long URL to something different 
app.post("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  urlDatabase[shortURL] = request.body.editedLongURL;
  response.redirect("/urls");
});

// 
app.post("/urls/:id/delete", (request, response) => {
  const userInput = request.params.id;
  delete urlDatabase[userInput];
  response.redirect("/urls");
});

// takes you to the website assigned to the 6 chatacter key
app.get("/u/:id", (req, res) => {
  const id = req.params.id;// body, params, query 
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//  generates a random 6 character key for new url inputted
app.post("/urls", (request, response) => {

  let id = generateRandomString()
  urlDatabase[id] = request.body.longURL;
  response.redirect(`/urls/${id}`); 
});

// routes to a page where you can input new urls 
app.get("/urls/new", (request, response) => {
  templateVars = { username: request.cookies["username"] }
  response.render("urls_new", templateVars);
});

// adds the new url inputted to the Urldatabase object
app.get('/urls/:id', (request, response) => {

    const userInput = request.params.id
    const templateVars = { id: request.params.id, longURL: urlDatabase[userInput], username: request.cookies["username"] }  
    response.render("urls_show", templateVars);
});

// renders the urlDatabase on the urls page
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase, username: request.cookies["username"]}
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