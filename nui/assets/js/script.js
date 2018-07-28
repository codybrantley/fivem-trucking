'use strict';

angular.module('app', [])
.controller('mainController', function(listener, receiver, $rootScope, $scope, $http) {
    $rootScope.menu = false;
    $rootScope.sections = ['Market', 'Deliveries', 'Auctions']
    $rootScope.jobs = [];
    $rootScope.onjob = false;
    $scope.currentSection = 0;
    $scope.currentPage = 0;
    $scope.jobsPerPage = 3;
    $scope.actionHistory = [{'section': 0, 'page': 0}];
    $scope.noHistory = true;

    // Pages
    $scope.changeView = function(section, page, log = true) {
        $scope.currentSection = section;
        $scope.currentPage = page;
        if(log) {
            $scope.logAction($scope.currentSection, $scope.currentPage);
            $scope.verifyHistory();
        }
    }

    $scope.logAction = function(type, value) {
        let action = {'section': type, 'page': value};
        $scope.actionHistory.push(action);
    }

    $scope.resetHistory = function(type, value) {
        let prevAction = $scope.actionHistory[$scope.actionHistory.length-1];
        $scope.actionHistory = [{'section': prevAction.section, 'page': prevAction.page}];
        $scope.verifyHistory();
    }

    $scope.verifyHistory = function() {
        if($scope.actionHistory.length == 1) {
            $scope.noHistory = true;
        } else {
            $scope.noHistory = false;
        }
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
        if($scope.actionHistory.length !== 1) {
            let action = $scope.actionHistory[$scope.actionHistory.length-2];
            $scope.changeView(action.section, action.page, false);
            $scope.actionHistory.splice($scope.actionHistory.length-1, 1);
            $scope.verifyHistory();
        }
    }

    $scope.home = function() {
        if($scope.currentSection != 0) {
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
            case "enable":
                $rootScope.menu = args.data ? true : false;
                break;
            case "jobs":
                $rootScope.jobs = angular.fromJson(args.data);
                break;
            case "job_status":
                $rootScope.onjob = args.data ? true : false;
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
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});
