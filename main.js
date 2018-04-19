// Array for savedJobs list
let storedJobs = [];
loadData();

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
	},

	fetchById(annonsId){
		return fetch(`http://api.arbetsformedlingen.se/af//v0/platsannonser/${annonsId}`)
			 .then((response) => response.json())
			 .then((job) => {
			 	console.log('hej');
			View.displayJobDetails(job);
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

  getLatestJobs(latestJobs){
    for (let job of latestJobs){
      View.displayLatestJob(job);
    }
  },

	getJobDetails(annonsId){
		console.log('new', annonsId);
		FetchModel.fetchById(annonsId);
	}

}

const View = {
	output: document.getElementById('output'),
	displayTotalNumberOfJobs(totalNumberOfJobs) {
		output.innerHTML = `
			<div class="numberOfJobs">
				<h1>${totalNumberOfJobs}</h1>
				<p>Available jobs in Stockholm</p>
			</div>`;
	},

	jobContainer: document.getElementById('jobContainer'),

	  displayLatestJob(job){

    const jobCardHTML = `<div>
			<h2>${job.annonsrubrik}</h2>
			<p class="profession">${job.yrkesbenamning}</p>
			<p class="company">${job.arbetsplatsnamn}</p>
			<p class="typeOfEmpoloyment">${job.anstallningstyp}</p>
			<p class="municipality">${job.kommunnamn}</p>
			<p class="deadline">Sök före ${job.sista_ansokningsdag}</p>
			<a href="${job.annonsurl}" target="_blank"><p class="link">Läs mer</p></a>
			<button class="save" id="${job.annonsid}">Spara</button>
			<button class="show-details id="show-details-${job.annonsid}"><a href=?jobDetail=${job.annonsid}>Visa detaljer</a></button>
		</div>`;

    jobContainer.insertAdjacentHTML('beforeEnd', jobCardHTML);

		const save = document.getElementById(job.annonsid);
    save.addEventListener('click',function(){
      	//console.log(job.annonsid);
      	this.dataset.id;
      	updateLocalStorage(job.annonsid);
    });

    	const urlString = window.location.href;
		const url = new URL(urlString);
		const jobID = url.searchParams.get('jobDetail');

		if(jobID){
			ResponseController.getJobDetails(jobID);
			jobContainer.style.display = "none";
			output.style.display = "none";	
		}
	},

	 jobDetailsContainer: document.getElementById('jobDetailsContainer'),

	 displayJobDetails(annonsId){
		 console.log('Job details: ' , annonsId);
		 console.log(annonsId.platsannons.annons.annonstext);

		 const jobDetailsCardHTML = `
		 	<h2>${annonsId.platsannons.annons.annonsrubrik}</h2>
			<p>${annonsId.platsannons.annons.annonstext}</p>
			<button id="go-back"><a href="${window.location.href.split("?")[0]}">Go back</a></button>
		 `;

		 jobDetailsContainer.insertAdjacentHTML('beforeEnd', jobDetailsCardHTML);
	 }
}

function updateLocalStorage(annonsId) {
  //push the annonsId into the array
  storedJobs.push(annonsId);

  // set the savedJobs on localStorage with the storedJobs data.
	localStorage.setItem('savedJobs', JSON.stringify(storedJobs));
}


function loadData(){
    // Checks if there is anything in local storage,
    // and makes storedJobs equal to savedJobs in localStorage
    if (localStorage.getItem('savedJobs')){
            storedJobs = JSON.parse(localStorage.getItem('savedJobs'));
    }else{
            storedJobs = [];
    }
}


FetchModel.fetchAll();
