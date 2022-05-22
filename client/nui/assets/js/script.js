'use strict';

angular.module('app', ["firebase"])
    .config(function() {
        var config = {
          apiKey: "AIzaSyDcGbZVKRzwEmaJFe7vzRCFMUp0YMGTH4s",
          authDomain: "trucker-afa14.firebaseapp.com",
          databaseURL: "https://trucker-afa14.firebaseio.com",
          projectId: "trucker-afa14",
          storageBucket: "trucker-afa14.appspot.com",
          messagingSenderId: "20015539434"
        };
        firebase.initializeApp(config);
    })
    .controller('mainController', function(listener, receiver, $rootScope, $scope, $http, $timeout, $firebaseArray) {
        $rootScope.menu = false;
        $rootScope.sections = ['Market', 'Deliveries', 'Auctions'];
        $rootScope.onjob = false;
        $rootScope.deliveries = [];
        $rootScope.auction = {
            'type': 'A place',
            'destination_from': 'From here',
            'destination_to': 'To there',
            'currentBid': 2500,
            'duration': 300,
            'active': true
        };
        $scope.currentSection = 0;
        $scope.currentPage = 0;
        $scope.itemsPerPage = 3;
        $scope.actionHistory = [{
            'section': 0,
            'page': 0
        }];
        $scope.noHistory = true;
        $scope.index = 0;
        $scope.currentBid = 1350;

        var ref = firebase.database().ref().child("jobs");
        $scope.jobs = $firebaseArray(ref);

        // Pages
        $scope.changeView = function(section, page, log = true) {
            $scope.currentSection = section;
            $scope.currentPage = page;
            if (log) {
                $scope.logAction($scope.currentSection, $scope.currentPage);
                $scope.verifyHistory();
                // Maintain a maximum of 100 lines of history
                if ($scope.actionHistory.length > 100)
                    $scope.actionHistory.shift();
            }
        }

        $scope.showDetails = function(index) {
            $scope.changeView(1, 'detail');
            $scope.index = index;
        }

        $scope.logAction = function(type, value) {
            let action = {
                'section': type,
                'page': value
            };
            $scope.actionHistory.push(action);
        }

        $scope.resetHistory = function(type, value) {
            let prevAction = $scope.actionHistory[$scope.actionHistory.length - 1];
            $scope.actionHistory = [{
                'section': prevAction.section,
                'page': prevAction.page
            }];
            $scope.verifyHistory();
        }

        $scope.verifyHistory = function() {
            if ($scope.actionHistory.length == 1) {
                $scope.noHistory = true;
            } else {
                $scope.noHistory = false;
            }
        }

        // Jobs
        $scope.setAdjuncts = function(i) {
            return ((i <= 1) ? "Less than a mile away" : "About " + i + " miles away");
        }

        $scope.getPageCount = function(items) {
            return Math.ceil(items.length / $scope.itemsPerPage);
        }

        $scope.startJob = function(id) {
            $http.post('http://trucking/job', JSON.stringify(id));
        }

        // Deliveries

        $scope.parseDay = function(day) {
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[day];
        }

        // Auctions

        $scope.addBid = function(bid) {
            drone.publish({
              room: 'auction',
              message: {value: bid}
            });
        }

        $scope.updateValues = function(msg) {
            if(msg.data) {
                $scope.auction.currentBid = msg.data.value;
            }
        }

        $scope.updateBid = function(newNumber) {
            var oldNumber = $scope.auction.currentBid;
            var diff = oldNumber - newNumber;
            var i = 0;

            (function change() {
              $timeout(function() {
                  $scope.auction.currentBid = --oldNumber;
                  if (++i < diff) change();
              }, 0)
            })();
        }

        // Nav Buttons

        $scope.back = function() {
            if ($scope.actionHistory.length !== 1) {
                let action = $scope.actionHistory[$scope.actionHistory.length - 2];
                $scope.changeView(action.section, action.page, false);
                $scope.actionHistory.splice($scope.actionHistory.length - 1, 1);
                $scope.verifyHistory();
            }
        }

        $scope.home = function() {
            if ($scope.currentSection != 0) {
                $scope.changeView(0, 0);
            }
        }

        $scope.close = function() {
            $scope.resetHistory();
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
            switch (args.type) {
                // Enable menu
                case "enable":
                    $rootScope.menu = args.data ? true : false;
                    break;
                    // Update jobs list
                case "jobs":
                    var jobs = angular.fromJson(args.data);
                    jobs.sort(function(a, b) {
                        return a.milesAway > b.milesAway
                    });
                    $rootScope.jobs = jobs;
                    break;
                    // Update job status
                case "job_status":
                    $rootScope.onjob = args.data ? true : false;
                    break;
                    // Add delivery report
                case "add_delivery":
                    var delivery = angular.fromJson(args.data);
                    $rootScope.deliveries.unshift(delivery);
                    break;
            }
            $rootScope.$apply();
        });
    })
    .filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    })
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    })
    .filter('leading', function() {
        return function(input) {
            if (input.toString().length == 1) {
                return input = "0" + input;
            } else
                return input;
        };
    });
