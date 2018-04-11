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
        })
		.catch(error => console.log(error));
	}
}

const ResponseController = {
	sortResponse(data){
		console.log(data);
	}
}

const View = {
	output: document.getElementById('output')
}

FetchModel.fetchAll();















