var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
var NoteSchema = new Schema({
   comment: String
});

var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;