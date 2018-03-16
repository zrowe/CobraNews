var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/populatedb2", {
    // useMongoClient: true
});

// // When the server starts, create and save a new User document to the db
// // The "unique" rule in the User model's schema will prevent duplicate users from being added to the server
// db.User.create({ name: "Ernest Hemingway" })
//   .then(function (dbUser) {
//     console.log(dbUser);
//   })
//   .catch(function (err) {
//     console.log(err.message);
//   });

// Routes

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

// Route for retrieving all Users from the db
// app.get("/user", function (req, res) {
//   // Find all Users
//   db.User.find({})
//     .then(function (dbUser) {
//       // If all Users are successfully found, send them back to the client
//       res.json(dbUser);
//     })
//     .catch(function (err) {
//       // If an error occurs, send the error back to the client
//       res.json(err);
//     });
// });

// Route for saving a new Note to the db and associating it with a User
app.post("/submit", function(req, res) {
    // Create a new Note in the db
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


// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Make a request for the news section of ycombinator
    request("https://www.nytimes.com/", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "title" class
        $(".story").each(function(i, element) {
            // Save the text and href of each link enclosed in the current element
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");

            // If this found element had both a title and a link
            if (title && link) {
                // Insert the data in the article collection
                db.Article.create({
                        headline: title,
                        url: link
                    })
                    .then(function(dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        console.log(err.message);
                    });
            }
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});