$(document).ready(function() {


    $(".scrape-new").on("click", function() {

        event.preventDefault();

        $.ajax("/scrape/", {
            type: "GET"
        }).then(
            function(data) {
                location.reload(false);
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

});