$(document).ready(function() {

    // save the article
    $(".save").on("click", function() {

        event.preventDefault();

        $.ajax("/article/" + this.dataset.id + "/save", {
            type: "PUT"
        }).then(
            function() {

                location.reload();
            }
        );
    });

    // unsave the article
    $(".delete").on("click", function() {

        event.preventDefault();

        $.ajax("/article/" + this.dataset.id + "/unsave", {
            type: "PUT"
        }).then(
            function() {

                location.reload();
            }
        );
    });

    // Add a note
    $("#myBtn").click(function() {

        $("#myModal").modal();
    });
});

function handleArticleNotes() {
    // This function handles opending the notes modal and displaying our notes
    // We grab the id of the article to get notes for from the panel element the delete button sits inside
    var currentArticle = $(this).parents(".panel").data();
    // Grab any notes with this headline/article id
    $.get("/api/notes/" + currentArticle._id).then(function(data) {
        // Constructing our initial HTML to add to the notes modal
        var modalText = [
            "<div class='container-fluid text-center'>",
            "<h4>Notes For Article: ",
            currentArticle._id,
            "</h4>",
            "<hr />",
            "<ul class='list-group note-container'>",
            "</ul>",
            "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
            "<button class='btn btn-success save'>Save Note</button>",
            "</div>"
        ].join("");
        // Adding the formatted HTML to the note modal
        bootbox.dialog({
            message: modalText,
            closeButton: true
        });
        var noteData = {
            _id: currentArticle._id,
            notes: data || []
        };
        // Adding some information about the article and article notes to the save button for easy access
        // When trying to add a new note
        $(".btn.save").data("article", noteData);
        // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
        renderNotesList(noteData);
    });
}