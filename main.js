
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
	fetchById(annonsId, viewType){
		return fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`)
			 .then((response) => response.json())
			 .then((job) => {
				 switch(viewType) {
					 	case 'summary':
							 View.displaySavedJobCard(job);
							 break;
				    case 'detailed':
				        View.displayJobDetails(job);
				        break;
						}
			 })
	 .catch(error => console.log(error));
	}

/*	fetchById(annonsId){
		return fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`)
			 .then((response) => response.json())
			 .then((job) => {
				 View.displayJobDetails(job);
			 })
	 .catch(error => console.log(error));
 } */

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
		FetchModel.fetchById(annonsId, 'detailed');
	}

	}

const View = {
	totalNumberOfJobsHeader: document.getElementById('totalNumberOfJobsHeader'),
	displayTotalNumberOfJobs(totalNumberOfJobs) {
		totalNumberOfJobsHeader.innerHTML = `
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
			<button class="show-details" id="show-details-${job.annonsid}">Visa detaljer</button>
		</div>`;

    jobContainer.insertAdjacentHTML('beforeEnd', jobCardHTML);

		const save = document.getElementById(job.annonsid);
    save.addEventListener('click',function(){
      	//console.log(job.annonsid);
      	this.dataset.id;
      	updateLocalStorage(job.annonsid);
    });

		const showDetailsButton = document.getElementById('show-details-' + job.annonsid);
		showDetailsButton.addEventListener('click', function(){
				ResponseController.getJobDetails(job.annonsid);
				jobContainer.style.display = "none";
			  totalNumberOfJobsHeader.style.display = "none";
		});
	},
	containerSavedJobs: document.getElementById('containerSavedJobs'),
	displaySavedJobCard(annonsId){
		let job = annonsId.platsannons;
		console.log(job);

 //TODO: Need to fix the undefined objects
		const savedJobCardHTML = `<div>
			<h2>${job.annons.annonsrubrik}</h2>
			<p class="profession">${job.annons.yrkesbenamning}</p>
			<p class="company">${job.arbetsplats.arbetsplatsnamn}</p>
			<p class="typeOfEmpoloyment">${job.annons.anstallningstyp}</p>
			<p class="municipality">${job.annons.kommunnamn}</p>
			<p class="deadline">Sök före ${job.annons.sista_ansokning}</p>
			<a href="${job.annons.platsannonsUrl}" target="_blank"><p class="link">Läs mer</p></a>
			<button class="delete" id="${job.annons.annonsid}">Delete</button>
		</div>`;

		containerSavedJobs.insertAdjacentHTML('beforeEnd', savedJobCardHTML);

	},

	 containerJobDetails: document.getElementById('containerJobDetails'),
	 displayJobDetails(annonsId){
		 console.log('Job details: ' , annonsId);
		 console.log(annonsId.platsannons.annons.annonstext);

		 const jobDetailsCardHTML = `
		 	<h2>${annonsId.platsannons.annons.annonsrubrik}</h2>
			<p>${annonsId.platsannons.annons.annonstext}</p>
		 `;

		 containerJobDetails.insertAdjacentHTML('beforeEnd', jobDetailsCardHTML);

	 }
}// End of View module


const NavigationView = {
	header: document.getElementById('header'),
	mySavedJobs: document.getElementById('mySavedJobs'),

	//displaySavedJobs(annonsId){
		//Write out saved jobs here
	//}
	containerLandingPage: document.getElementById('containerLandingPage'),
	containerJobDetails: document.getElementById('containerJobDetails'),
	containerSavedJobs: document.getElementById('containerSavedJobs'),

	goToLandingPage(){
		NavigationView.header.addEventListener('click', function(){
			location.reload();
		});
	},
	goToSavedJobs(){
		NavigationView.mySavedJobs.addEventListener('click', function(){
			NavigationView.containerLandingPage.classList.add('hidden');
			NavigationView.containerJobDetails.classList.add('hidden');
			NavigationView.containerSavedJobs.classList.remove('hidden');
			console.log(storedJobs);

			for (annonsId of storedJobs){
				console.log(annonsId);
				FetchModel.fetchById(annonsId, 'summary');
			}


			// 1. Grab the ID's from local storage
			// 2. Loop through IDs and fetch jobs based on IDs
			// 3. Call a view-function from the fetch where we pass in the ID's
			//    and append the jobs to the HTML in #savedJobsList
		});
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


/***************************************/
/************* CALL FUNCTIONS **********/
/***************************************/

FetchModel.fetchAll();

NavigationView.goToLandingPage();
NavigationView.goToSavedJobs();
