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

function getSearchedMovie(searchText, searchYear, searchPage) {
  return new Promise((resolve, reject)=>{
      $.ajax({
        method:'GET',
        url:`http://www.omdbapi.com/?s=${searchText}&type=movie&y=${searchYear}&plot=short&r=json&page=${searchPage}`
      }).then((response)=>{
        console.log("response", response);
        resolve(response);
      },(errorResponse)=>{
        reject(errorResponse);
      });
  });
}

function getSelectedMovie(imdbID) {
  return new Promise((resolve, reject)=>{
      $.ajax({
        method:'GET',
        url:`http://www.omdbapi.com/?i=${imdbID}&plot=short&r=json`
      }).then((response)=>{
        movie = {
          "name": response.Title,
          "year": response.Year,
          "actors": response.Actors.split(","),
          "rating": Math.round(parseFloat(response.imdbRating) / 2),
          "imdbID": response.imdbID
        };
        createModal(response);
        resolve(movie);
      },(errorResponse)=>{
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
    $('#saved-movie-list').html(savedMoviesHTML);
  });
}

function createModal(movie) {
    let html =  '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += `<h4>${movie.Title}</h4>`;
    html += '</div>';
    html += '<div class="modal-body">';
    html += `<h6>This movie was released in ${movie.Year}</h6>`;
    html += `<img src="${movie.Poster}" width="150px" height="150px"></img>`;
    html += `<h6>Awards: ${movie.Awards}</h6>`;
    html += `<h6>Notable Actors ${movie.Actors}</h6>`;
    html += `<p>Plot: ${movie.Plot}</p>`;
    html += `<p>IMDB Rating ${movie.imdbRating} out of 10</p>`;
    html += '</div>';
    html += '<div class="modal-footer" id="save-movie">';
    html += `<button id="${movie.imdbID}" data-dismiss="modal">Add</button></div>`;
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });

}


$(document).ready(function() {

  FbAPI.firebaseCredentials().then(function(keys) {
    apiKeys = keys;
    firebase.initializeApp(apiKeys);
  });

  $('#search-btn').on('click', () => {
    $('#movie-result').html('');
    let searchText = $('#search-title').val();
    let searchYear = $('#search-year').val();
    let searchPage = $('#search-page').val();
    getSearchedMovie(searchText, searchYear, searchPage).then(function (searchedMovie) {
      $("#movie-result").html("");
      $("#movie-result").append(`<div>Total results found ${searchedMovie.totalResults}, Displayed 10 items per page.`);
      searchedMovie.Search.forEach(function(movie, index){
        $("#movie-result").append(`<div class="img"><h3 class="caption">${movie.Title}</h3><h5>${movie.Year}</h5><img width="144" height="192" src="${movie.Poster}""></div>`)
        .append(`<div><button id="${movie.imdbID}" data-toggle="modal" data-target="#myModal">More Details</button></div>`);
      });
    });
  });

  // Get more details button
  $("#movie-result").on('click', 'button', (movie) => {
    getSelectedMovie(event.target.id).then(function(movie){
      movie.viewed = false;
      movie.uid = uid;
      // FbAPI.addMovie(apiKeys, movie);
    });
  });

  $(document).on('click', '#save-movie', (e) => {
    e.preventDefault();
    $('#saved-movie-list').html('');
    FbAPI.addMovie(apiKeys, movie);
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
        putSavedMoviesInDOM();
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
      $('#search').removeClass('hidden');

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
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#movie-container').removeClass('hide'); // why hide an empty div?
      $('#search').removeClass('hide');
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
