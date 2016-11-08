"use strict";

let apiKeys = {};
let uid = "";
let movie = {};

function createLogoutButton() {
  FbAPI.getUser(apiKeys, uid).then(function(userResponse) {
    $('#logout-container').html('');
    let currentUsername = userResponse.username;
    let logoutButton = `<button class="btn btn-danger" id="logoutButton">Logout ${currentUsername}</button>`;
    $('#logout-container').append(logoutButton);
  });
}

function getMovie(searchText) {
  return new Promise((resolve, reject) => {
    $.ajax({method: 'GET', url: `http://www.omdbapi.com/?t=${searchText}&y=&plot=short&r=json`}).then((response) => {
      let searchedMovie = {
        "name": response.Title,
        "year": response.Year,
        "actors": response.Actors.split(","),
        "rating": Math.round(parseFloat(response.imdbRating) / 2)
      };
      resolve(searchedMovie);
    }, (errorResponse) => {
      reject(errorResponse);
    });
  });
}

function putSavedMoviesInDOM() {
  FbAPI.getSavedMovies(apiKeys, uid).then(function(movies) {
    let savedMoviesHTML = movies.map((movie) => {
      let newMovieItem = `<li data-viewed="${movie.viewed}">`;
      newMovieItem += `<div class="col-xs-8" data-fbid="${movie.id}">`;
      newMovieItem += `<label>${movie.name}</label>`;
      newMovieItem += '</div>';
      newMovieItem += '<div class="col-xs-4">';
      newMovieItem += `<button class="btn btn-default col-xs-6 edit" data-fbid="${movie.id}">Edit</button>`;
      newMovieItem += `<button class="btn btn-danger col-xs-6 delete" data-fbid="${movie.id}">Delete</button> `;
      newMovieItem += '</div>';
      newMovieItem += '</li>';
      return newMovieItem;
    }).join('');
    console.log('savedMoviesHTML', savedMoviesHTML);
    $('#saved-movie-list').html(savedMoviesHTML);
  }
}

$(document).ready(function() {

  FbAPI.firebaseCredentials().then(function(keys) {
    console.log("keys", keys);
    apiKeys = keys;
    firebase.initializeApp(apiKeys);
  });

  $('#search-btn').on('click', () => {
    $('#movie-result').html('');
    let searchText = $('#search-input').val();
    getMovie(searchText).then(function(searchedMovie) {
      console.log("searchedMovie", searchedMovie);
      movie = searchedMovie;
      let resultHTML = `<div>${searchedMovie.name}</div>`;
      resultHTML += `<div>${searchedMovie.year}</div>`;
      resultHTML += searchedMovie.actors.map((actor) => {
        return `<div>${actor}</div>`;
      }).join('');
      resultHTML += `<div>${searchedMovie.rating}</div>`;
      $('#movie-result').append(resultHTML);
    });
  });

  $(document).on('click', '#save-btn', () => {
    movie.viewed = false;
    movie.uid = uid;
    FbAPI.addMovie(apiKeys, movie);
  });

  $(document).on('click', '#view-saved-movies-link', (e) => {
    e.preventDefault();
    $('#saved-movie-list').html('');
    FbAPI.getSavedMovies(apiKeys, uid).then(() => putSavedMoviesInDOM());
  });

  $("ul").on('click', '.delete', function() {
    let itemId = $(this).data("fbid");
    FbAPI.deleteMovie(apiKeys, itemId).then(function() {
      putSavedMoviesInDOM();
    });
  });

  $("ul").on('click', '.edit', function() {
    let itemId = $(this).data("fbid");
    let parent = $(this).closest("li");
    if (!parent.hasClass("editMode")) {
      parent.addClass("editMode");
    } else {
      let editedItem = {
        "uid": uid,
        "task": parent.find(".inputTask").val(),
        "isCompleted": false
      };

      FbAPI.editTodo(apiKeys, itemId, editedItem).then(function(response) {
        parent.removeClass("editMode");
        console.log(response);
        putTodoInDOM();
      });
    }
  });

  $('#registerButton').on('click', function() {
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let username = $('#inputUsername').val();
    let user = {
      email: email,
      password: password
    };
    FbAPI.registerUser(user).then(function(registerResponse) {
      let newUser = {
        username,
        uid: registerResponse.uid
      };
      return FbAPI.addUser(apiKeys, newUser);
    }).then(function(userResponse) {
      return FbAPI.loginUser(user);
    }).then(function(loginResponse) {
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#movie-container').removeClass('hide');
    });
  });

  $('#loginButton').on('click', function() {
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let user = {
      email: email,
      password: password
    };

    FbAPI.loginUser(user).then(function(loginResponse) {
      console.log('loginResponse', loginResponse);
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#movie-container').removeClass('hide');
    });
  });

  $("#logout-container").on('click', '#logoutButton', function() {
    FbAPI.logoutUser();
    uid = "";
    $('#inputEmail').val('');
    $('#inputPassword').val('');
    $('#inputUsername').val('');
    $('#login-container').removeClass('hide');
    $('#movie-container').addClass('hide');
  });
});
