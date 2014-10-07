/* jslint node: true */
'use strict';

module.exports = function ( app ) {
  app.config( config );

  config.$inject = ['$routeProvider'];
  function config ( routeProvider ) {
    routeProvider
      .when( '/Portals', {
        controller: 'Main',
        templateUrl : '/html/main/main.html'
      });
  }
};
