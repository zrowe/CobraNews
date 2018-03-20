$(document).ready(function() {


    $(".scrape-new").on("click", function() {

        event.preventDefault();

        $.ajax("/scrape/", {
            type: "GET"
        }).then(
            function(data) {
                console.log(data);
   // bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
      bootbox.alert("<h3 class='text-center m-top-80'>" + "<h3>");
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