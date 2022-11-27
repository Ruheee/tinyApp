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
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  let length = 6 // Customize the length here.
  for (let i = length; i > 0; --i) {
    result += characters[Math.round(Math.random() * (characters.length - 1))]
  }
  console.log(result)
  return result;
  
};



app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// routes to a page where you can input new urls 
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

// shows a single short URL along with is longURL on a page 
app.get('/urls/:id', (request, response) => {
    const userInput = request.params.id
    const templateVars = { id: userInput, longURL: urlDatabase[userInput]  }
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