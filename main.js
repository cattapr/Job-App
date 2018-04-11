//function fetchAllEmploymentAds() {
//   		return fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=20&yrkesomradeid=3&lanid=1`)
//        .then((response) => response.json())
//        .then((data) => {
//        	let listings = data.matchningslista;
//        })
//}

//let listings2 = fetchAllEmploymentAds();
//console.log(listings2);


const FetchModel = {
	fetchAll(){
		 return fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=20&yrkesomradeid=3&lanid=1`)
        .then((response) => response.json())
        .then((data) => {
        	//let listings = data.matchningslista;
			 ResponseController.sortResponse(data);
			 ResponseController.getAllListings(data);
        })
		.catch(error => console.log(error));
	}
}

const ResponseController = {
	sortResponse(data){
		console.log(data);
	},

	getAllListings(data) {
		console.log(data.matchningslista.antal_platsannonser);
		let totalNumberOfJobs = data.matchningslista.antal_platsannonser;
		
		View.displayTotalNumberOfJobs(totalNumberOfJobs);

	}
}


const View = {
	output: document.getElementById('output'),
	displayTotalNumberOfJobs(totalNumberOfJobs) {
		output.innerHTML = `<h1>${totalNumberOfJobs}</h1>`;
	}
}

FetchModel.fetchAll();

















