// Array for savedJobs list
let storedJobs = [];
loadData();

const FetchModel = {
  fetchAll() {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=10&yrkesomradeid=3&lanid=1`
    )
      .then(response => response.json())
      .then(data => {
        //let listings = data.matchningslista;
        ResponseController.sortResponse(data);
        ResponseController.getTotalNumberOfJobs(data);

        const buttons = document.getElementsByClassName("save");

        for (const button of buttons) {
          button.addEventListener("click", function() {
            console.log("its click");
            console.log(this.parentElement.id);
            updateLocalStorage(this.parentElement.id);
          });
        }
      })
      .catch(error => console.log(error));
  },

  fetchById(annonsId) {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`
    )
      .then(response => response.json())
      .then(job => {
        console.log("hej");
        View.displayJobDetails(job);
      })
      .catch(error => console.log(error));
  }
};

const ResponseController = {
  getJobId() {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const jobID = url.searchParams.get("jobDetail");
    console.log("jobid: ", jobID);
    //FetchModel.fetchById(jobID);
    return jobID;
  },
  sortResponse(data) {
    console.log(data);
  },

  getTotalNumberOfJobs(data) {
    console.log(data.matchningslista.antal_platsannonser);
    let totalNumberOfJobs = data.matchningslista.antal_platsannonser;
    let latestJobs = data.matchningslista.matchningdata;
    ResponseController.getLatestJobs(latestJobs);
    View.displayTotalNumberOfJobs(totalNumberOfJobs);
  },

  getLatestJobs(latestJobs) {
    for (let job of latestJobs) {
      View.displayLatestJob(job);
    }
  },

  getJobDetails() {
    const buttons = document.getElementsByClassName("showDetails");
    console.log(buttons);
    for (const button of buttons) {
      console.log(button);
      button.addEventListener("click", function() {
        console.log("Show details button has been clicked");
        console.log(this.parentElement.id);
        FetchModel.fetchById(this.parentElement.id);
        window.location.hash = `?jobDetail=${this.parentElement.id}`;
      });
    }
  }
};

const View = {
  totalNumberOfJobsHeader: document.getElementById("totalNumberOfJobsHeader"),
  displayTotalNumberOfJobs(totalNumberOfJobs) {
    totalNumberOfJobsHeader.innerHTML = `
			<div class="numberOfJobs">
				<h1>${totalNumberOfJobs}</h1>
				<p>Available jobs in Stockholm</p>
			</div>`;
  },

  jobContainer: document.getElementById("jobContainer"),

  displayLatestJob(job) {
    const jobCardHTML = `<div id="${job.annonsid}">
			<h2>${job.annonsrubrik}</h2>
			<p class="profession">${job.yrkesbenamning}</p>
			<p class="company">${job.arbetsplatsnamn}</p>
			<p class="typeOfEmpoloyment">${job.anstallningstyp}</p>
			<p class="municipality">${job.kommunnamn}</p>
			<p class="deadline">Sök före ${job.sista_ansokningsdag}</p>
			<a href="${job.annonsurl}" target="_blank"><p class="link">Läs mer</p></a>
			<button class="save">Spara</button>
			<button class="showDetails">Visa detaljer</button>
		</div>`;

    jobContainer.insertAdjacentHTML("beforeEnd", jobCardHTML);

    //   showDetailsButton.addEventListener("click", function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     e.stopImmediatePropagation();
    //     console.log("reloadeeer");
    //     window.location.hash = `?jobDetail=${this.dataset.id}`;
    //     // Fetch en annons och ersatt: innerHTML
    //   });
    //   const jobID = job.annonsid;
    //   ResponseController.callJobDetailsById(jobID);
  },

  containerJobDetails: document.getElementById("containerJobDetails"),

  displayJobDetails(annonsId) {
    console.log("Job details: ", annonsId);
    console.log(annonsId.platsannons.annons.annonstext);

    const jobDetailsCardHTML = `
		 	<h2>${annonsId.platsannons.annons.annonsrubrik}</h2>
			<p>${annonsId.platsannons.annons.annonstext}</p>
			<button id="go-back"><a href="${
        window.location.href.split("?")[0]
      }">Gå tillbaka</a></button>
		 `;

    containerJobDetails.insertAdjacentHTML("beforeEnd", jobDetailsCardHTML);
  }
}; // End of View module

const NavigationView = {
  header: document.getElementById("header"),
  mySavedJobs: document.getElementById("mySavedJobs"),

  //displaySavedJobs(annonsId){
  //Write out saved jobs here
  //}
  containerLandingPage: document.getElementById("containerLandingPage"),
  containerJobDetails: document.getElementById("containerJobDetails"),
  containerSavedJobs: document.getElementById("containerSavedJobs"),

  goToLandingPage() {
    NavigationView.header.addEventListener("click", function() {
      location.reload();
    });
  },
  goToSavedJobs() {
    NavigationView.mySavedJobs.addEventListener("click", function() {
      NavigationView.containerLandingPage.classList.add("hidden");
      NavigationView.containerJobDetails.classList.add("hidden");
      NavigationView.containerSavedJobs.classList.remove("hidden");

      // 1. Grab the ID's from local storage
      // 2. Loop through IDs and fetch jobs based on IDs
      // 3. Call a view-function from the fetch where we pass in the ID's
      //    and append the jobs to the HTML in #savedJobsList
    });
  }
};

function updateLocalStorage(annonsId) {
  //push the annonsId into the array
  storedJobs.push(annonsId);

  // set the savedJobs on localStorage with the storedJobs data.
  localStorage.setItem("savedJobs", JSON.stringify(storedJobs));
}

function loadData() {
  // Checks if there is anything in local storage,
  // and makes storedJobs equal to savedJobs in localStorage
  if (localStorage.getItem("savedJobs")) {
    storedJobs = JSON.parse(localStorage.getItem("savedJobs"));
  } else {
    storedJobs = [];
  }
}

/***************************************/
/************* CALL FUNCTIONS **********/
/***************************************/
if (!ResponseController.getJobId()) {
  FetchModel.fetchAll();
} else {
  FetchModel.fetchById(ResponseController.getJobId());
}
ResponseController.getJobDetails();
NavigationView.goToLandingPage();
NavigationView.goToSavedJobs();
