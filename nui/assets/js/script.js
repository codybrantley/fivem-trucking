'use strict';

angular.module('app', [])
.controller('mainController', function(listener, receiver, $rootScope, $scope, $http) {
    $rootScope.menu = false;
    $rootScope.jobs = [];
    $scope.currentPage = 0;
    $scope.currentList = 0;

    $scope.setAdjuncts = function(i) {
        return ((i <= 1) ? "Less than 1 mile away" : "Around " + i + " miles away");
    }

    // Start job on play button click
    $scope.startJob = function(id) {
        $http.post('http://trucking/job', JSON.stringify(id));
    }

    $scope.close = function() {
        $http.post('http://trucking/escape', JSON.stringify({}));
    }
})
.service('listener', function($window, $rootScope) {
    $window.addEventListener('message', function(e) {
        $rootScope.$broadcast('update', e.data);
    });
})
.service('receiver', function($rootScope) {
    $rootScope.$on('update', function(event, args) {
        var enabled = args.enable ? true : false;
        $rootScope.menu = enabled;
        if(enabled) {
            $rootScope.jobs = angular.fromJson(args.jobs);
        }
        $rootScope.$apply();
    });
});

/*
function formatNumber(n) {
    return n.toLocaleString('en-US');ww
}

function showPage(id) {
    var top = id * 3 + 1;
    var bottom = top + 2;
    i = 0;
    $(".item").each(function() {
        i++;
        $(this).slideUp(500);
        if(i >= top && i <= bottom) {
            $(this).slideDown(500);
        }
    });
    currentPage = id;
}

function showHomepage() {
    $(".paging li").removeClass("active");
    $(".nav li").removeClass("active");
    $(".page").hide();
    $(".paging li").first().addClass("active");
    $(".nav li").first().addClass("active");
    $(".page").first().show();
    if(currentPage != 0) {
        showPage(0);
    }
    for(i = 0; i < pagecount; i++) {
        if(i == 0) {
            active = ' class="active"';
        } else {
            active = '';
        }
        var template = '<li data-id="' + i + '"' + active + '>&bull;</li>';
        $(".paging ul").append(template);
    }
}

function SortDistance(a, b) {
    return ((a[1] < b[1]) ? -1 : ((a[1] > b[1]) ? 1 : 0));
}

function setAdjuncts(i) {
    if(i <= 1) {
        wording = "Less than 1 mile away";
    } else {
        wording = "Around " + i + " miles away";
    }
    return wording;
}

function showMenu(e) {
    document.body.style.display = e ? "block" : "none";
}

$(function() {
    var ready = false;
    /*
    window.addEventListener('message', function(event) {
        if (event.data.type == "enableui") {
            showMenu(true);
            if(event.data.enable) {
                $(".item").remove();
                $(".paging li").remove();
                jobs = JSON.parse(event.data.jobs);
                jobcount = Object.keys(jobs).length;
                pagecount = Math.ceil(jobcount / 3);
                i = 0;
                $.each(jobs, function(i, job) {
                    i++;
                    var template = [
                        '<div data-item-id="' + job.id + '" class="row item collapse">',
                            '<div class="large-12 columns">',
                                '<div class="info">',
                                    '<div class="trailer">',
                                        '<div class="trip">',
                                            '<span class="trailerType"><span class="orange">' + job.type + '</span></span>',
                                            '<span class="destination">' + job.destination_from + ' ↝ ' + job.destination_to + '</span>',
                                        '</div>',
                                        '<div class="icon logo postop"></div>',
                                    '</div>',
                                    '<div class="offer">',
                                        '<div class="text">',
                                            '<span class="expected">Weight: <b>' + formatNumber(job.pickup_w) + ' lb</b></span><br />',
                                            '<span class="expires">' + setAdjuncts(job.miles) + '</span>',
                                        '</div>',
                                        '<div class="icon play" aria-hidden="true" data-id="' + job.id + '"></div>',
                                        '<div class="offerAmount"><span class="orange" id="payout">$3,546</span><br />$717.81/mi</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        '</div>'
                    ].join("\n");
                    $(".area").append(template);
                    if(i < 3) {
                        $("[data-item-id=" + job.id + "]").show();
                    }
                });
                showHomepage();
            } else {
                // Return to homepage after menu closes
                showHomepage();
            }
        }
    });
    */

$(function() {

    // Start job on play button click
    $(".play").click(function() {
        var id = $(this).data("id")
        $.post('http://trucking/job', JSON.stringify(id));
    });

    // Pagination
    $(".paging li").click(function() {
        if(!$(this).hasClass("active")) {
            $(".paging li").removeClass("active");
            $(this).addClass("active");
            showPage($(this).data('id'));
        }
    });

    // Top navigation
    $(".nav li").click(function() {
        $(".nav li").removeClass("active");
        $(this).addClass("active");
        $(".area > div").hide();
        var show = $(this).data('show');
        $(".page").each(function() {
            if($(this).data('id') == show) {
                $(this).show();
            }
        });
        if(show == 1) {
            showPage(0);
        }
    });

    // Home button
    $(".home").click(function() {
        showHomepage();
    });

    // Close button
    $("#close").click(function() {
        showMenu(false);
        $.post('http://trucking/escape', JSON.stringify({}));
    });

    // Back button
    $("#back").click(function() {

    });

    // Show pointer on hover of links
    $("li, .play").hover(function() {
        $("#cursor").removeAttr("src");
        $("#cursor").attr("src", "./images/cursor_link.png");
    }, function() {
        $("#cursor").removeAttr("src");
        $("#cursor").attr("src", "./images/cursor.png");
    });

    // Close menu on Escape key press
    document.onkeyup = function (data) {
        if (data.which == 27) { // Escape key
            $.post('http://trucking/escape', JSON.stringify({}));
        }
    };

    $("#login-form").submit(function(e) {
        e.preventDefault(); // Prevent form from submitting

        $.post('http://ui-mouse-example/login', JSON.stringify({
            username: $("#username").val(),
            password: $("#password").val()
        }));
    });
});
