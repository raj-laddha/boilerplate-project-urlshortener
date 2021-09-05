require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if (err) return console.log(err);

  console.log('DB Connected');
});

const Url = require('./models/urlDB.js');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {

  const REGEX = /^https?:\/\//i;

  if (!REGEX.test(req.body.url)) {
    return res.json({error: 'invalid url'});
  }

  let url = req.body.url.replace(REGEX, '');

  dns.lookup(url, (err) => {
    if (err) {
      return res.json({error: err.code});
    }

    Url.findUrl(req.body.url, (err, data) => {
      if (err) return console.log(err);

      if (!data) {
        Url.count({}, (err, count) => {
          if (err) return console.log(err);

          let urlDoc = new Url({
            url: req.body.url,
            short: count+1
          });

          urlDoc.save((err) => {
            if (err) return console.log(err);

            res.json({
              original_url: req.body.url,
              short_url: count+1
            });
          });

        });

      } else {
        res.json({
          original_url: req.body.url,
          short_url: data.short
        });
      }
      
    });

  });
});

app.get('/api/shorturl/:shortURL', (req, res) => {
  let shortURL = parseInt(req.params.shortURL);
  Url.findOne({short: shortURL}, (err, doc) => {
    if (err) return console.log(err);

    if (doc) {
      res.redirect(doc.url);
    } else {
      res.send('Invalid short URL');
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
