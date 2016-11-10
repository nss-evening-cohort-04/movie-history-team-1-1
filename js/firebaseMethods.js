"use strict";

var FbAPI = (function (oldFirebase) {

  oldFirebase.getSavedMovies = function (apiKeys, uid) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'GET',
        url:`${apiKeys.databaseURL}/movies.json?orderBy="uid"&equalTo="${uid}"`
      }).then((response)=>{
        let movies = [];
         Object.keys(response).map(key => {
           response[key].id = key;
           movies.push(response[key]);
         });
        resolve(movies);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.addMovie = function (apiKeys, newMovie) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'POST',
        url:`${apiKeys.databaseURL}/movies.json`,
        data: JSON.stringify(newMovie),
        dataType: 'json'
      }).then((response)=>{
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.deleteMovie = function (apiKeys, itemId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'DELETE',
        url:`${apiKeys.databaseURL}/movies/${itemId}.json`
      }).then((response)=>{
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.getMovie = function (apiKeys, itemId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'GET',
        url:`${apiKeys.databaseURL}/movies/${itemId}.json`
      }).then((response)=>{
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.editMovie = function (apiKeys, itemId, editedMovie) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'PUT',
        url:`${apiKeys.databaseURL}/movies/${itemId}.json`,
        data: JSON.stringify(editedMovie),
        dataType: 'json'
      }).then((response)=>{
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  return oldFirebase;
})(FbAPI || {});
