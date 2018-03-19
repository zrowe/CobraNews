var mongoose = require("mongoose");
require('mongoose-type-url');

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
    // `name` must be unique and of type String
    headline: {
        type: String,
        unique: true,
        trim: true
    },

    summary: {
        type: String
    },

    byline: {
        type: String
    },

    url: {
        type: mongoose.SchemaTypes.Url
    },

    isSaved: {
        type: Boolean,
        default: false
    },

    // `notes` is an array that stores ObjectIds
    // The ref property links these ObjectIds to the Note model
    // This allows us to populate the User with any associated Notes
    notes: [{
        // Store ObjectIds in the array
        type: Schema.Types.ObjectId,
        // The ObjectIds will refer to the ids in the Note model
        ref: "Note"
    }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the User model
module.exports = Article;