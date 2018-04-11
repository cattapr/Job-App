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
		output.innerHTML = `
			<div class="numberOfJobs">
				<h1>${totalNumberOfJobs}</h1>
				<p>avaliable jobs in Stockholm</p>
			</div>`;
	},

	jobContainer: document.getElementById('jobContainer'),

	  displayLatestJobs(job){
		jobContainer.innerHTML += `
		<div>
			<h2>${job.annonsrubrik}</h2>
			<p>${job.anstallningstyp}</p>
			<p>${job.arbetsplatsnamn}</p>
			<p>${job.kommunnamn}</p>
			<p>${job.sista_ansokningsdag}</p>
			<p>${job.yrkesbenamning}</p>
			<p>${job.annonsurl}</p>
		</div>`;

		//Create save-button
		const save = document.createElement('button');
		save.classList.add('save');
		save.id = job.annonsid;
    save.dataset.id = job.annonsid
		save.innerHTML = `Save`;
		jobContainer.appendChild(save);

		save.addEventListener('click',function(){
      console.log('hello');
      this.dataset.id
      updateLocalStorage(this);
      //View.updateLocalStorage();
    });

//		getButton(job.annonsid);
	 }
}



//Create a function that updates the local storage.
function updateLocalStorage(annonsId) {
	localStorage.setItem('savedJobs', JSON.stringify(annonsId));
}
function getButton (element) {
	const save = document.getElementById('element');
	save.addEventListener('click', function(){
		console.log('Hej');
	})
}



//function updateLocalStorage() {
//	localStorage.setItem('todoList', JSON.stringify(allTodoItems));
//}








FetchModel.fetchAll();
