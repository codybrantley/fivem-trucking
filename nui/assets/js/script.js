'use strict';

angular.module('app', [])
.controller('mainController', function(listener, receiver, $rootScope, $scope, $http) {
    $rootScope.menu = false;
    $rootScope.sections = ['Market', 'Deliveries', 'Auctions']
    $rootScope.jobs = [];
    $scope.currentSection = 0;
    $scope.currentPage = 0;
    $scope.jobsPerPage = 3;
    $scope.actionHistory = {'prevAction': {'type': 0, 'value': 0}, 'currentAction': {'type': 1, 'value': 0}};

    // Pages
    $scope.isCurrentSection = function(section) {
        return (section == $scope.currentSection) ? true : false;
    }

    $scope.isCurrentPage = function(page) {
        return (page == $scope.currentPage) ? true : false;
    }

    $scope.changeItem = function(type, value) {
        // Section
        if(type == 1) {
            $scope.currentSection = value;
        }
        // Page
        else if(type == 2) {
            $scope.currentPage = value;
        }
        $scope.logAction(type, value);
    }

    $scope.resetMobile = function() {
        $scope.currentSection = 0;
        $scope.currentPage = 0;
        $scope.logAction(1, 0);
    }

    $scope.logAction = function(type, value) {
        if(type == 2 && $scope.actionHistory.currentAction.value == 0) {
            $scope.actionHistory.prevAction.type = 2;
            $scope.actionHistory.prevAction.value = 0;
        } else {
            $scope.actionHistory.prevAction.type = $scope.actionHistory.currentAction.type;
            $scope.actionHistory.prevAction.value = $scope.actionHistory.currentAction.value;
        }
        $scope.actionHistory.currentAction.type = type;
        $scope.actionHistory.currentAction.value = value;
    }

    // Jobs
    $scope.setAdjuncts = function(i) {
        return ((i <= 1) ? "Less than a mile away" : "About " + i + " miles away");
    }

    $scope.getJobsPageCount = function() {
        return Math.ceil($rootScope.jobs.length / $scope.jobsPerPage);
    }

    $scope.startJob = function(id) {
        $http.post('http://trucking/job', JSON.stringify(id));
    }

    // Nav Buttons

    $scope.back = function() {
        $scope.changeItem($scope.actionHistory['prevAction']['type'], $scope.actionHistory['prevAction']['value']);
    }

    $scope.home = function() {
        $scope.resetMobile();
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
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});
