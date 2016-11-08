"use strict";

function getMovie(searchText) {
	return new Promise((resolve, reject)=>{
			$.ajax({
				method:'GET',
				url:`http://www.omdbapi.com/?t=${searchText}&y=&plot=short&r=json`
			}).then((response)=>{
				console.log("movieresponse", response);
				let searchedMovie = {
					"name": response.Title,
					"year": response.Year,
					"actors": response.Actors.split(","),
					"rating": Math.round(parseFloat(response.imdbRating) / 2)
				};
				console.log("objectpass", searchedMovie);

				resolve(response);
			},(errorResponse)=>{
				reject(errorResponse);
			});
	});
}
