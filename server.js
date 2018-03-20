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
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/cobranewsdb", {
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
        .then(function(dbArticles) {
            res.render("saved", { articles: dbArticles });
        })
        .catch(function(err) {
            res.json(err);
        });
});


app.put("/article/:id/save", function(req, res) {
    db.Article.update({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function() {
          
        })
        .catch(function(err) {
            res.json(err);
        });
})

app.put("/article/:id/unsave", function(req, res) {
    db.Article.update({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function() {

        })
        .catch(function(err) {
            res.json(err);
        });
})

// // Route for retrieving all Notes from the db
// app.get("/notes", function (req, res) {
//   // Find all Notes
//   db.Note.find({})
//     .then(function (dbNote) {
//       // If all Notes are successfully found, send them back to the client
//       res.json(dbNote);
//     })
//     .catch(function (err) {
//       // If an error occurs, send the error back to the client
//       res.json(err);
//     });
// });

// Route for retrieving all Aricles from the db
// app.get("/user", function(req, res) {
//     // Find all Users
//     db.User.find({})
//         .then(function(dbUser) {
//             // If all Users are successfully found, send them back to the client
//             res.json(dbUser);
//         })
//         .catch(function(err) {
//             // If an error occurs, send the error back to the client
//             res.json(err);
//         });
// });

// Route for saving a new Note to the db and associating it with a User
app.post("/submit", function(req, res) {
    // Create a new Note in the db
    console.log('tada');
    db.Note.create(req.body)
        .then(function(dbNote) {
            // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.User.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true });
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

// // Route to get all User's and populate them with their notes
// app.get("/populateduser", function (req, res) {
//   // Find all users
//   db.User.find({})
//     // Specify that we want to populate the retrieved users with any associated notes
//     .populate("notes")
//     .then(function (dbUser) {
//       // If able to successfully find and associate all Users and Notes, send them back to the client
//       res.json(dbUser);
//     })
//     .catch(function (err) {
//       // If an error occurs, send it back to the client
//       res.json(err);
//     });
// });

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