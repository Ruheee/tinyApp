const { request, response } = require('express');
const express = require('express'); 
const app = express();
const PORT = 8080; // default port is 8080

app.set("view engine", "ejs");// tells the express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); 


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'//characters that will be used in random generated string
  let result = '' //empty string
  for (let i = 0; i < 6; i++) {
    result += characters[Math.round(Math.random() * (characters.length - 1))]
  }
  return result;
};

app.get("/u/:id", (req, res) => {
  const id = req.params.id;// body, params, query 
  const longURL = urlDatabase[id];
  console.log(longURL);
  res.redirect(longURL);
});



app.post("/urls", (request, response) => {
  let id = generateRandomString()
  urlDatabase[id] = request.body.longURL;
  response.redirect(`/urls/${id}`); 
});

// routes to a page where you can input new urls 
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});


app.get('/urls/:id', (request, response) => {
    const userInput = request.params.id
    const templateVars = { id: request.params.id, longURL: urlDatabase[userInput]  }
    response.render("urls_show", templateVars);
});

// renders the urlDatabase on the urls page
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase}
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