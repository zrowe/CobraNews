var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database    
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/cobranewsdb";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    // useMongoClient: true
});


// Routes

app.get("/", function(req, res) {
    db.Article.find({ isSaved: false })
        .then(function(dbArticles) {
            res.render("home", { articles: dbArticles });
        })
        .catch(function(err) {
            res.json(err);
        });
});


app.get("/saved", function(req, res) {
    db.Article.find({ isSaved: true })
        .populate("notes")
        .then(function(dbArticles) {
            res.render("saved", { articles: dbArticles });
        })
        .catch(function(err) {
            res.json(err);
        });
});

// mark an article as saved
app.put("/article/:id/save", function(req, res) {
    db.Article.update({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function() {
          res.sendStatus(response.statusCode);
        })
        .catch(function(err) {
            res.json(err);
        });
})

app.put("/article/:id/unsave", function(req, res) {
    db.Article.update({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function() {
          res.sendStatus(response.statusCode);
        })
        .catch(function(err) {
            res.json(err);
        });
})


// Route for saving a new Note to the db and associating it with an Article
app.post("/submit", function(req, res) {
  
    db.Note.create(req.body)
        .then(function(dbNote) {
            console.log(articleID);
            // If a Note was created successfully, find the Article and push the new Note's _id to the Article's `notes` array
            // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findByIdAndUpdate(articleID, { $push: { notes: dbNote._id } }, { new: true });
        })
        .then(function(dbUser) {
            // If the User was updated successfully, send it back to the client
            res.json(dbUser);
        })
        .catch(function(err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});


app.get("/scrape", function(req, res) {

    request("https://www.nytimes.com/", function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            $(".story-heading").each(function(i, element) {

                var headline = $(element).children("a").text();
                var url = $(element).children("a").attr("href");
                var summary = $(element).siblings(".summary").text();
                var byline = $(element).siblings(".byline").text();

                if (headline && url && summary) {
                    db.Article.create({
                            headline: headline,
                            url: url,
                            summary: summary,
                            byline: byline
                        })
                        .then(function(dbArticle) {
                            if (i === 20) {res.sendStatus(response.statusCode)};

                        })
                        .catch(function(err) {});
                }
            });
        };
    });
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});