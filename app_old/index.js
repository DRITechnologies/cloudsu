'use strict';

var angular = require('angular');
require('jquery');

require('bootstrap');
require('angular-bootstrap-npm');

var _ = require('underscore');

var bootbox = require('bootbox');

require('angular-route');
require('ngstorage');

var ace = require('brace');
require('brace/mode/json');
require('brace/theme/solarized_dark');

require('angular-moment');


var stacks = angular.module('stacks', ['ngRoute', 'ngStorage', 'angularMoment', 'ui.bootstrap']);
