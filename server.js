const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const request = require('request');

const port = process.env.PORT || 3000;
const app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n');
  next();
});

/* app.use((req, res, next) => {
  res.render('maintenance.hbs');
});
 */

app.use(express.static(__dirname + "/public"));

hbs.registerHelper("getCurrentYear", () => {
  return new Date().getFullYear();
});

hbs.registerHelper("screamIt", (text) => {
  return text.toUpperCase();
});

hbs.registerHelper("projects", (userName) => {
  const encodedUserName = encodeURIComponent(userName);
  request({
    url: `https://api.github.com/users/${encodedUserName}/repos`,
    json: true,
    headers: {
      "User-Agent": "request"
    }
  }, (error, response, body) => {
    if (error) {
      return 'Unable to connect to Github.com server.';
    } else if (response.statusCode === 400 || response.statusCode === 403) {
      console.log(`Unable to fetch repos of ${userName}.`);
      return `Unable to fetch repos of ${userName}.`;
    } else if (response.statusCode === 200) {
      const resultat = [];
      body.map(element => {
        resultat.push({
          name: element.name,
          full_name: element.full_name,
          owner: element.owner.login
        })
      });
      return JSON.stringify(resultat, undefined, 2);
    }
  });
})

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'Welcome to my website'
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page',
    blablaMessage: 'Some text here, i don\'t know yet what to say...'
  });
});

app.get('/projects', (req, res) => {
  res.render('projects.hbs', {
    pageTitle: 'Portfolio Page',
    blablaMessage: 'These are some projects i want to show'
  });
});

// /bad - send back json with errorMessage
app.get('/bad', (req, res) => {
  res.render('error.hbs', {
    pageTitle: 'Error Page',
    errorMessage: 'Got some error... What did you mess ??!!!!'
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});