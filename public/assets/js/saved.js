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
        console.log($(this).data('id'));
          $("#articleId").val($(this).data('id'));
        $("#myModal").modal();
    });
});

