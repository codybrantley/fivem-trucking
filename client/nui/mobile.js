"use strict";

const resource = "trucking";
let currentPlayer = "";

angular.module("app", ["firebase"])
    .config(() => {
        let config = {
          authDomain: "trucker-afa14.firebaseapp.com",
          databaseURL: "https://trucker-afa14.firebaseio.com"
        };
        firebase.initializeApp(config);
    })
    .controller("main", (listener, receiver, $rootScope, $scope, $http, $timeout, $firebaseObject, $firebaseArray) => {
        let db = firebase.database();
        $rootScope.menu = false;
        $rootScope.onjob = false;
        $rootScope.players = $firebaseArray(db.ref("players"));
        $rootScope.jobs = $firebaseArray(db.ref("jobs"));
        $rootScope.auction = $firebaseObject(db.ref("auction"));
        $rootScope.deliveries = [];
        $scope.sections = ["Market", "Deliveries", "Auctions"];
        $scope.currentSection = 0;
        $scope.currentPage = 0;
        $scope.itemsPerPage = 3;
        $scope.index = 0;
        $scope.actionHistory = [{
            "section": 0,
            "page": 0
        }];
        $scope.noHistory = true;
        $scope.timeRemaining = 0;
        $scope.auctionLog = [];
        $scope.bid = "";
        $scope.currentBid = 0;
        $scope.error = false;

        // Players
        $rootScope.players.$loaded(() => {
            $http.get(`http://${resource}/GetIdentifier`).then((object) => {
                let player = $rootScope.players.find(x => x.identifier === object.data);
                currentPlayer = player.$id;
            });
        });

        $rootScope.updatePlayer = (args) => {
            let player = $rootScope.players.$getRecord(currentPlayer);
            player[args[0]] = args[1];
            $rootScope.players.$save(player);
        };

        // Pages
        $scope.changeView = (section, page, log = true) => {
            $scope.currentSection = section;
            $scope.currentPage = page;
            if (log) {
                $scope.logAction($scope.currentSection, $scope.currentPage);
                $scope.verifyHistory();
            }
        };

        $scope.showDetails = (index) => {
            $scope.changeView(1, "detail");
            $scope.index = index;
        };

        $scope.logAction = (type, value) => {
            let action = {
                "section": type,
                "page": value
            };
            $scope.actionHistory.push(action);
        };

        $scope.resetHistory = (type, value) => {
            let prevAction = $scope.actionHistory[$scope.actionHistory.length - 1];
            $scope.actionHistory = [{
                "section": prevAction.section,
                "page": prevAction.page
            }];
            $scope.verifyHistory();
        };

        $scope.verifyHistory = () => {
            if ($scope.actionHistory.length == 1) {
                $scope.noHistory = true;
            } else
                $scope.noHistory = false;
        };

        // Jobs
        $scope.setAdjuncts = (i) => {
            return ((i <= 1) ? "Less than a mile away" : `About ${i} miles away`);
        };

        $scope.getPageCount = (items) => {
            return Math.ceil(items.length / $scope.itemsPerPage);
        };

        $scope.startJob = (id) => {
            let job = $rootScope.jobs.find(x => x.$id === id);
            $http.post(`http://${resource}/StartJob`, job);
        };

        // Deliveries

        $scope.parseDay = (day) => {
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
        };

        // Auctions

        $rootScope.auction.$loaded((data) => {
            $scope.currentBid = data.bid;
        });

        $scope.addBid = (bid) => {
            if(bid >= 100 && bid <= $scope.currentBid - 50) {
                $scope.animateBid(bid);
                $rootScope.auction.bid = bid;
                $rootScope.auction.$save();
                $scope.bid = "";
                $scope.auctionLog.unshift({
                    "time": new Date(),
                    "name": $scope.trimName("Jimtrucking1983"),
                    "bid": bid
                });
            } else
                $scope.error = true;
        };

        $scope.animateBid = (newNumber) => {
            let oldNumber = $scope.currentBid;
            let diff = oldNumber - newNumber;
            let i = 0;

            if(diff < 1000) {
                (function change() {
                    $timeout(() => {
                      $scope.currentBid = --oldNumber;
                      if (++i < diff) change();
                    });
                })();
            } else {
                $scope.currentBid = newNumber;
                var myEl = angular.element( document.querySelector( '#currentBid' ) );
                myEl.addClass('blinker');
            }
        };

        $scope.trimName = (name) => {
            return name[0] + "****" + name.slice(-1);
        }

        // Nav Buttons

        $scope.back = () => {
            if ($scope.actionHistory.length !== 1) {
                let action = $scope.actionHistory[$scope.actionHistory.length - 2];
                $scope.changeView(action.section, action.page, false);
                $scope.actionHistory.splice($scope.actionHistory.length - 1, 1);
                $scope.verifyHistory();
            }
        };

        $scope.home = () => {
            if ($scope.currentSection != 0)
                $scope.changeView(0, 0);
        };

        $scope.close = () => {
            $scope.resetHistory();
            $http.post(`http://${resource}/CloseMenu`);
        };
    })
    .service("listener", function($window, $rootScope) {
        $window.addEventListener("message", function(e) {
            $rootScope.$broadcast("update", e.data);
        });
    })
    .service("receiver", function($rootScope, $http) {
        $rootScope.$on("update", (event, args) => {
            switch (args.type) {
                // Update player
                case "UpdatePlayer":
                    $rootScope.updatePlayer(args.data);
                    break;
                // Enable menu
                case "EnableMenu":
                    $rootScope.menu = args.data ? true : false;
                    break;
                // Update jobs list
                case "UpdateJobs":
                    $http.post(`http://${resource}/UpdateJobs`, $rootScope.jobs).then((jobs) => {
                        let sortedJobs = jobs.sort((a, b) => {
                            return a.milesAway - b.milesAway;
                        });
                        $rootScope.jobs = sortedJobs;
                        $rootScope.jobs.$resolved = true;
                    });
                    break;
                // Update statuses
                case "UpdateStatus":
                    $rootScope.updatePlayer(args.data);
                    break;
                // Add delivery report
                case "LogDelivery":
                    $rootScope.deliveries.unshift(args.data);
                    break;
            }
            $rootScope.$apply();
        });
    })
    .filter("startFrom", () => {
        return (input, start) => {
            start = +start; //parse to int
            return input.slice(start);
        };
    })
    .filter("range", () => {
        return (input, total) => {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    })
    .filter("leading", () => {
        return (input) => {
            if (input.toString().length == 1) {
                return input = "0" + input;
            } else
                return input;
        };
    });
