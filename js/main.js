"use strict";


let apiKeys = {};
let uid = "";
let movie = {};

function createLogoutButton() {
  FbAPI.getUser(apiKeys, uid).then(function (userResponse) {
    $('#logout-container').html('');
    let currentUsername = userResponse.username;
    let logoutButton = `<button class="btn btn-danger" id="logoutButton">Logout ${currentUsername}</button>`;
    $('#logout-container').append(logoutButton);
  });
}

function getMovie(searchText) {
	return new Promise((resolve, reject)=>{
			$.ajax({
				method:'GET',
				url:`http://www.omdbapi.com/?t=${searchText}&y=&plot=short&r=json`
			}).then((response)=>{
        let searchedMovie = {
          "name": response.Title,
          "year": response.Year,
          "actors": response.Actors.split(","),
          "rating": Math.round(parseFloat(response.imdbRating) / 2)
        };
				resolve(searchedMovie);
			},(errorResponse)=>{
				reject(errorResponse);
			});
	});
}

$(document).ready(function() {

  FbAPI.firebaseCredentials().then(function (keys) {
    console.log("keys", keys);
    apiKeys = keys;
    firebase.initializeApp(apiKeys);
  });

  $('#search-btn').on('click', ()=>{
    let searchText = $('#search-input').val();
    getMovie(searchText).then(function (searchedMovie) {
      console.log("searchedMovie", searchedMovie);
      movie = searchedMovie;
      let resultHTML = `<div>${searchedMovie.name}</div>`;
      resultHTML += `<div>${searchedMovie.year}</div>`;
      resultHTML += searchedMovie.actors.map((actor)=>{
        return `<div>${actor}</div>`;
      }).join('');
      resultHTML += `<div>${searchedMovie.rating}</div>`;
      $('#movie-result').append(resultHTML);
    });
  });

  $(document).on('click', '#save-btn', ()=>{
    movie.viewed = false;
    FbAPI.addMovie(apiKeys, movie);
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
