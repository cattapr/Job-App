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
		 return fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=10&yrkesomradeid=3&lanid=1`)
        .then((response) => response.json())
        .then((data) => {
        	//let listings = data.matchningslista;
			 ResponseController.sortResponse(data);
			 ResponseController.getTotalNumberOfJobs(data);
        })
		.catch(error => console.log(error));
	}
}

const ResponseController = {
	sortResponse(data){
		console.log(data);
	},

	getTotalNumberOfJobs(data) {
		console.log(data.matchningslista.antal_platsannonser);
		let totalNumberOfJobs = data.matchningslista.antal_platsannonser;
    let latestJobs = data.matchningslista.matchningdata;
    ResponseController.getLatestJobs(latestJobs);
		View.displayTotalNumberOfJobs(totalNumberOfJobs);

	},

  // Display latest 10 jobs
  getLatestJobs(latestJobs){

    for (let job of latestJobs){

      View.displayLatestJobs(job);
    }

  }
}

const View = {
	output: document.getElementById('output'),
	displayTotalNumberOfJobs(totalNumberOfJobs) {
		output.innerHTML = `<h1>${totalNumberOfJobs}</h1>`;
	},

  displayLatestJobs(job){
    console.log(job);
    console.log(job.annonsrubrik);
  },


}

FetchModel.fetchAll();
