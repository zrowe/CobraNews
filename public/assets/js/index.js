$(document).ready(function() {


    $(".scrape-new").on("click", function() {

        event.preventDefault();

        $.ajax("/scrape/", {
            type: "GET"
        }).then(
            function() {

                location.reload();
            }
        );
    });


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
});