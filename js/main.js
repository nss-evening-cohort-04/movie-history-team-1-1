"use strict";


let apiKeys = {};
let uid = "";

function createLogoutButton() {
  FbAPI.getUser(apiKeys, uid).then(function (userResponse) {
    $('#logout-container').html('');
    let currentUsername = userResponse.username;
    let logoutButton = `<button class="btn btn-danger" id="logoutButton">Logout ${currentUsername}</button>`;
    $('#logout-container').append(logoutButton);
  });
}

$(document).ready(function() {

  FbAPI.firebaseCredentials().then(function (keys) {
    console.log("keys", keys);
    apiKeys = keys;
    firebase.initializeApp(apiKeys);
  });

  $('#registerButton').on('click', function () {
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let username = $('#inputUsername').val();
    let user = {
      email: email,
      password: password
    };
    FbAPI.registerUser(user).then(function (registerResponse) {
      let newUser = {
        username,
        uid: registerResponse.uid
      };
      return FbAPI.addUser(apiKeys, newUser);
    })
    .then(function (userResponse) {
      return FbAPI.loginUser(user);
    })
    .then(function (loginResponse) {
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#movie-container').removeClass('hide');
    });
  });

  $('#loginButton').on('click', function () {
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let user = {
      email: email,
      password: password
    };

    FbAPI.loginUser(user).then(function (loginResponse) {
      console.log('loginResponse', loginResponse);
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#movie-container').removeClass('hide');
    });
  });

  $("#logout-container").on('click', '#logoutButton', function () {
    FbAPI.logoutUser();
    uid ="";
    $('#inputEmail').val('');
    $('#inputPassword').val('');
    $('#inputUsername').val('');
    $('#login-container').removeClass('hide');
    $('#movie-container').addClass('hide');
  });
});
