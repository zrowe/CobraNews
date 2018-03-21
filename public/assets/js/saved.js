$(document).ready(function(event) {


    // unsave the article
    $(".delete").on("click", function(event) {
        event.preventDefault();

        $.ajax("/article/" + this.dataset.id + "/unsave", {
            type: "PUT"
        }).then(
            function() {
                location.reload();
            }
        );
    });


    // Launch Modal to add a note
    $("#myBtn").click(function(event) {
        event.preventDefault();
        // console.log($(this).data('id'));
        $("#articleId").val($(this).data('id'));
        $("#myModal").modal();
    });


    // Get form results and send to server to add a note
    $("submitNote").click(function(event) {
        event.preventDefault();

        var newNote = {
            comment: $("#body").val(),
            articleId: $("articleId").val()
        }

        $.post("/submit/", newNote, function(response) {
            console.log(response);
        });
    });
});