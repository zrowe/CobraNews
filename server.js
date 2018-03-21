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
            return db.Article.findByIdAndUpdate(req.body.articleId, { $push: { notes: dbNote._id } }, { new: true });
        })
        .then(function(dbUser) {
            res.sendStatus(response.statusCode);
        })
        .catch(function(err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

app.delete("/note/:id", function(req, res) {
    db.Note.findByIdAndRemove(req.params.id)
        .then(function() {
            res.sendStatus(response.statusCode);
        })
        .catch(function(err) {
            res.json(err);
        });
})



app.get("/scrape", function(req, res) {

    request("https://www.nytimes.com/", function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var articles = scrape(html);
            db.Article.create(articles)
                .then(function(dbArticle) {
                    res.sendStatus(response.statusCode);
                })
                .catch(function(err) {
                    res.json(err);
                });
        }
    });
});

function scrape(html) {
    var arr = [];
    var $ = cheerio.load(html);
    $(".story-heading").each(function(i, element) {
        article = {};
        article.headline = $(element).children("a").text();
        article.url = $(element).children("a").attr("href");
        article.summary = $(element).siblings(".summary").text();
        article.byline = $(element).siblings(".byline").text();

        if (article.headline && article.url && article.summary) {
            arr.push(article);
        }
    });
    return arr
}


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});