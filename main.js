const FetchModel = {
  fetchAll(
    numberOfJobs = "10",
    countyID = "1",
    jobCategoryID = "",
    page = "1"
  ) {
    //let job = numberOfJobs;
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?antalrader=${numberOfJobs}&yrkesomradeid=${jobCategoryID}&lanid=${countyID}&sida=${page}`
    )
      .then(View.showLoader())
      .then(response => response.json())
      .then(data => {
        //let listings = data.matchningslista;
        //ResponseController.sortResponse(data);
        View.hideLoader();
        ResponseController.getTotalNumberOfJobs(data);
        ResponseController.getJobDetails();

        const buttons = document.getElementsByClassName("save");

        for (const button of buttons) {
          button.addEventListener("click", function() {
            LocalStorageModel.updateLocalStorage(this.parentElement.id);
          });
        }
      })

      .catch(error => console.log(error));
  },
  //detailed
  fetchByIdHTML(annonsId) {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}/typ=html`
    )
      .then(View.showLoader())
      .then(response => response.text())
      .then(job => {
        View.hideLoader();
        View.displayJobDetails(job);

        const goBackButton = document.getElementById("goBack");
        goBackButton.addEventListener("click", function() {
          location.reload();
          window.location = "";
        });
      })
      .catch(error => console.log(error));
  },
  //summary
  fetchByIdJSON(annonsId) {
    return (
      fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`)
        // .then(View.showLoader())
        .then(response => response.json())
        .then(job => {
          View.hideLoader();
          View.displaySavedJobCard(job);
        })
        .catch(error => console.log(error))
    );
  },

  fetchAllCounties() {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/lan`
    )
      .then(response => response.json())
      .then(counties => {
        const countiesArray = counties.soklista.sokdata;
        console.log(counties.soklista.sokdata);
        FilterController.selectCounty(countiesArray);
      })
      .catch(error => console.log(error));
  },

  fetchAllJobCategory() {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/yrkesomraden`
    )
      .then(response => response.json())
      .then(jobCategories => {
        FilterController.selectJobCategory(jobCategories.soklista.sokdata);
      })
      .catch(error => console.log(error));
  },

  fetchSearch(yrkesbenamning) {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?nyckelord=${yrkesbenamning}`
    )
      .then(response => response.json())
      .then(occupations => {
        View.displaySearchMatch(occupations.matchningslista.matchningdata);
        //FilterController.searchOccupation(occupations.soklista.sokdata);
        console.log(occupations);
        console.log(occupations.matchningslista.matchningdata);
      })
      .catch(error => console.log(error));
  }
};

const LocalStorageModel = {
  // Array for savedJobs list
  storedJobs: [],
  updateLocalStorage(annonsId) {
    //push the annonsId into the array
    LocalStorageModel.storedJobs.push(annonsId);

    // set the savedJobs on localStorage with the storedJobs data.
    localStorage.setItem(
      "savedJobs",
      JSON.stringify(LocalStorageModel.storedJobs)
    );
  },

  loadData() {
    // Checks if there is anything in local storage,
    // and makes storedJobs equal to savedJobs in localStorage
    if (localStorage.getItem("savedJobs")) {
      LocalStorageModel.storedJobs = JSON.parse(
        localStorage.getItem("savedJobs")
      );
    } else {
      LocalStorageModel.storedJobs = [];
    }
  },
  removeSavedJob(idToDelete) {
    console.log(idToDelete);
    LocalStorageModel.storedJobs = JSON.parse(
      localStorage.getItem("savedJobs")
    );
    LocalStorageModel.storedJobs.splice(
      LocalStorageModel.storedJobs.indexOf(idToDelete),
      1
    );
    localStorage.setItem(
      "savedJobs",
      JSON.stringify(LocalStorageModel.storedJobs)
    );
    console.log(LocalStorageModel.storedJobs);
  }
};

const ResponseController = {
  getJobId() {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const jobID = url.searchParams.get("jobDetail");
    //FetchModel.fetchById(jobID);
    return jobID;
  },
  // sortResponse(data) {
  //   console.log(data);
  // },

  getTotalNumberOfJobs(data) {
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
    for (const button of buttons) {
      button.addEventListener("click", function() {
        FetchModel.fetchByIdHTML(this.parentElement.id);
        window.location.hash = `?jobDetail=${this.parentElement.id}`;
        NavigationView.showJobDetails();
      });
    }
  }
};

const FilterController = {
  numberOfJobs: "10",
  countyID: "1",
  jobCategoryID: "",
  yrkesbenamning: "",
  selectNumberOfJobs() {
    const numberOfJobsInput = document.getElementById("numberOfJobs");

    numberOfJobsInput.addEventListener("change", function() {
      let numberOfJobs = numberOfJobsInput.selectedIndex;
      let filterAmount = document.getElementsByTagName("option")[numberOfJobs]
        .value;
      FilterView.registerNumberOfJobs(filterAmount, FilterController.countyID);
    });
  },

  numberOfJobs: "10",
  countyID: "1",
  jobCategoryID: "",
  yrkesbenamning: "",
  page: "1",

  selectNumberOfJobs() {
    const numberOfJobsInput = document.getElementById("numberOfJobs");

    numberOfJobsInput.addEventListener("change", function() {
      let numberOfJobs = numberOfJobsInput.selectedIndex;
      let filterAmount = document.getElementsByTagName("option")[numberOfJobs]
        .value;
      FilterView.registerNumberOfJobs(filterAmount);
    });
  },

  selectCounty(counties) {
    const countyFilter = document.getElementById("county");
    for (const county of counties) {
      //console.log(county);
      const countyOption = document.createElement("option");
      countyOption.innerText = county.namn;
      countyOption.id = county.id;
      countyOption.classList.add("county");
      countyFilter.appendChild(countyOption);
    }
    countyFilter.addEventListener("change", function() {
      //console.log(thi);

      let countyIndex = countyFilter.selectedIndex;
      let selectedCounty = document.getElementsByClassName("county")[
        countyIndex
      ].id;

      FilterView.registerSelectedCounty(selectedCounty);
    });
  },

  selectJobCategory(jobCategories) {
    const jobCategoryFilter = document.getElementById("jobCategory");
    for (const jobCategory of jobCategories) {
      //console.log(county);
      const jobCategoryOption = document.createElement("option");
      jobCategoryOption.innerText = jobCategory.namn;
      jobCategoryOption.id = jobCategory.id;
      jobCategoryOption.classList.add("jobCategory");
      //console.log("jobCategory id: ", jobCategory.id);
      jobCategoryFilter.appendChild(jobCategoryOption);
    }

    jobCategoryFilter.addEventListener("change", function() {
      let jobCategoryIndex = jobCategoryFilter.selectedIndex;
      let selectedjobCategory = document.getElementsByClassName("jobCategory")[
        jobCategoryIndex
      ].id;

      FilterView.registerSelectedjobCategory(selectedjobCategory);
    });
  },

  searchOccupation() {
    const searchInput = document.getElementById("searchOccupation");

    searchInput.addEventListener("keyup", function() {
      console.log("keyup");

    	if(searchInput.value.length === 3){
    		
    		FilterController.yrkesbenamning = searchInput.value;
      		FetchModel.fetchSearch(FilterController.yrkesbenamning);
    	}

      //console.log(searchInput);
      //let searchInputValue = this.value;

      //console.log(FilterController.yrkesbenamning);
    });
  },

  nextPage(nextPageButton) {
    nextPageButton.addEventListener("click", function() {
      FilterController.page++;
      console.log("next page", FilterController.page);
      View.jobContainer.innerHTML = "";
      FetchModel.fetchAll(
        FilterController.numberOfJobs,
        FilterController.countyID,
        FilterController.jobCategoryID,
        FilterController.yrkesbenamning,
        FilterController.page
      );
    });
  },

  previousPage(previousPageButton) {
    previousPageButton.addEventListener("click", function() {
      if (FilterController.page > 1) {
        FilterController.page--;
        console.log("previous page", FilterController.page);
        View.jobContainer.innerHTML = "";
        FetchModel.fetchAll(
          FilterController.numberOfJobs,
          FilterController.countyID,
          FilterController.jobCategoryID,
          FilterController.yrkesbenamning,
          FilterController.page
        );
      } else {
        FilterController.page = 1;
        console.log("page", FilterController.page);
        View.jobContainer.innerHTML = "";
        FetchModel.fetchAll(
          FilterController.numberOfJobs,
          FilterController.countyID,
          FilterController.jobCategoryID,
          FilterController.yrkesbenamning,
          FilterController.page
        );
      }
    });
  }
};

const View = {
  totalNumberOfJobsHeader: document.getElementById("totalNumberOfJobsHeader"),
  displayTotalNumberOfJobs(totalNumberOfJobs) {
    totalNumberOfJobsHeader.innerHTML = `
		<div class="numberOfJobs">
		<h1>${totalNumberOfJobs}</h1>
		<p>Available jobs</p>
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
  },

  containerJobDetails: document.getElementById("containerJobDetails"),
  containerSavedJobs: document.getElementById("containerSavedJobs"),

  displaySavedJobCard(annonsId) {
    let job = annonsId.platsannons;

    const savedJobCardHTML = `<div>
		<h2>${job.annons.annonsrubrik}</h2>
		<p class="profession">${job.annons.yrkesbenamning}</p>
		<p class="company">${job.arbetsplats.arbetsplatsnamn}</p>
		<p class="typeOfEmpoloyment">${job.annons.anstallningstyp}</p>
		<p class="municipality">${job.annons.kommunnamn}</p>
		<p class="deadline">Sök före ${job.ansokan.sista_ansokningsdag}</p>
		<p class="link"><a href="${
      job.annons.platsannonsUrl
    }" target="_blank">Läs mer på Arbetsförmedlingens webbsida </a>↗</p>
		<button class="delete" id="${job.annons.annonsid}">Delete</button>
		</div>`;

    containerSavedJobs.insertAdjacentHTML("beforeEnd", savedJobCardHTML);

    //console.log(annonsId);
    //console.log(annonsId.platsannons.annons.annonsid);
    //let jobAdId = job.annons.annonsid;

    const deleteSavedJobButton = document.getElementById(
      annonsId.platsannons.annons.annonsid
    );

    deleteSavedJobButton.addEventListener("click", function() {
      console.log("this.id = ", this.id);
      const idToDelete = this.id;
      console.log("this.parenteELement = ", this.parentElement);
      this.parentElement.parentElement.removeChild(this.parentElement);
      //LocalStorageModel.removeSavedJob(idToDelete);
      //View.removeSavedJobCard(idToDelete);
    });
  },
  // removeSavedJobCard(idToDelete) {
  //   let clicked = document.getElementById(idToDelete);
  //   console.log(clicked.parentElement);
  // },
  displayJobDetails(jobDetailsCardHTML) {
    const goBackButton = `
		<button id="goBack" class="goBack">Gå tillbaka</button>
		`;

    const jobDetails = document.createElement("div");
    jobDetails.classList.add("job_details");
    containerJobDetails.appendChild(jobDetails);
    jobDetails.innerHTML = jobDetailsCardHTML;
    containerJobDetails.insertAdjacentHTML("beforeEnd", goBackButton);
  },

  displaySearchMatch(searchResults){
  const searchMatchUl = document.createElement('ul');
  const searchMatchOutput = document.getElementById('searchMatchOutput');
  searchMatchOutput.appendChild(searchMatchUl);

  	for (let searchResult of searchResults){
  	  	const searchMatchLi = document.createElement('li');
  	  	searchMatchLi.id = searchResult.annonsid;
  		console.log(searchResult);
  		searchMatchLi.innerText = searchResult.annonsrubrik;
		searchMatchUl.appendChild(searchMatchLi);

		searchMatchLi.addEventListener('click', function() {
			FetchModel.fetchByIdHTML(this.id);
			window.location.hash = `?jobDetail=${this.id}`;
			NavigationView.showJobDetails();
		});
  	};

  },

  showLoader() {
    const loaderContainer = document.getElementById("loaderContainer");
    const loader = `<div class="loader__container" id="loaderContainer"><div class="loader" id="loader"></div></div>`;
    jobContainer.innerHTML = loader;
    //jobContainer.insertAdjacentHTML("beforeBegin", loader);
  },

  hideLoader() {
    const loaderContainer = document.getElementById("loaderContainer");
    loaderContainer.classList.add("hidden");
  }
}; // End of View module

const PaginationView = {
  paginationContainer: document.getElementById("pagination"),
  createNextPageElements() {
    const nextPageButton = document.createElement("button");
    nextPageButton.id = "next";
    nextPageButton.innerText = "Nästa →";
    PaginationView.paginationContainer.appendChild(nextPageButton);

    FilterController.nextPage(nextPageButton);
  },

  createPreviousPageElements() {
    const previousPageDiv = document.createElement("div");
    const previousPageButton = document.createElement("button");
    previousPageButton.id = "previous";
    previousPageButton.innerText = "← Föregående";
    PaginationView.paginationContainer.appendChild(previousPageButton);

    FilterController.previousPage(previousPageButton);
  }
};

const NavigationView = {
  header: document.getElementById("header"),
  mySavedJobs: document.getElementById("mySavedJobs"),

  containerLandingPage: document.getElementById("containerLandingPage"),
  containerJobDetails: document.getElementById("containerJobDetails"),
  containerSavedJobs: document.getElementById("containerSavedJobs"),

  refreshLandingPage() {
    NavigationView.header.addEventListener("click", function() {
      location.reload();
      window.location = "";
      //Clear URL here
    });
  },
  showLandingPage() {
    NavigationView.containerLandingPage.classList.remove("hidden");
    NavigationView.containerJobDetails.classList.add("hidden");
    NavigationView.containerSavedJobs.classList.add("hidden");
  },
  showJobDetails() {
    NavigationView.containerLandingPage.classList.add("hidden");
    NavigationView.containerJobDetails.classList.remove("hidden");
    NavigationView.containerSavedJobs.classList.add("hidden");
  },
  showSavedJobs() {
    NavigationView.mySavedJobs.addEventListener("click", function() {
      NavigationView.containerLandingPage.classList.add("hidden");
      NavigationView.containerJobDetails.classList.add("hidden");
      NavigationView.containerSavedJobs.classList.remove("hidden");

      for (annonsId of LocalStorageModel.storedJobs) {
        FetchModel.fetchByIdJSON(annonsId);
      }
    });
  }
}; // End of NavigationView

const FilterView = {
  registerNumberOfJobs(filterAmount) {
    View.jobContainer.innerHTML = "";
    FilterController.numberOfJobs = filterAmount;
    FetchModel.fetchAll(FilterController.numberOfJobs);
  },

  registerSelectedCounty(selectedCounty) {
    View.jobContainer.innerHTML = "";
    FilterController.countyID = selectedCounty;
    FetchModel.fetchAll(FilterController.numberOfJobs, selectedCounty);
  },

  registerSelectedjobCategory(selectedjobCategory) {
    View.jobContainer.innerHTML = "";
    FilterController.jobCategoryID = selectedjobCategory;
    FetchModel.fetchAll(
      FilterController.numberOfJobs,
      FilterController.countyID,
      selectedjobCategory
    );
  }
};

/***************************************/
/************* CALL FUNCTIONS **********/
/***************************************/
if (!ResponseController.getJobId()) {
  FetchModel.fetchAll();
} else {
  FetchModel.fetchByIdHTML(ResponseController.getJobId());
}
NavigationView.refreshLandingPage();
NavigationView.showSavedJobs();

FilterController.selectNumberOfJobs();
FilterController.searchOccupation();
FetchModel.fetchAllCounties();

FetchModel.fetchAllJobCategory();

PaginationView.createPreviousPageElements();
PaginationView.createNextPageElements();
LocalStorageModel.loadData();
