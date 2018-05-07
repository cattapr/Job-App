const FetchModel = {
  fetchAll(
    numberOfJobs = "10",
    countyID = "1",
    jobCategoryID = "",
    communityID = "",
    page = "1",
    chosenArea = "Stockholm"
  ) {
    //let job = numberOfJobs;
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?antalrader=${numberOfJobs}&yrkesomradeid=${jobCategoryID}&lanid=${countyID}&kommunid=${communityID}&sida=${page}`
    )
      .then(View.showLoader())
      .then(response => response.json())
      .then(data => {
        //let listings = data.matchningslista;
        //ResponseController.sortResponse(data);

        View.hideLoader();
        ResponseController.getTotalNumberOfJobs(data, chosenArea);
        ResponseController.getJobDetails();

        const buttons = document.getElementsByClassName("save");

        for (const button of buttons) {
          button.addEventListener("click", function() {
            LocalStorageModel.updateLocalStorage(this.parentElement.id);
            FeedbackView.saveJob(button);
            //FeedbackView.feedbackPopup('success', 'Job saved!');
            const mySavedJobs = document.getElementById("mySavedJobs");
            FeedbackView.textHighlight(mySavedJobs);
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

  fetchCommunityByCountyId(countyID) {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/kommuner?lanid=${countyID}`
    )
      .then(response => response.json())
      .then(communities => {
        console.log(communities);
        View.displayCommunitiesFromSelectedCounty(
          communities.soklista.sokdata,
          countyID
        );
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

  fetchSearch(yrkesbenamning, countyID = "1", communityID = "") {
    return fetch(
      `http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?nyckelord=${yrkesbenamning}&lanid=${countyID}&kommunid=${communityID}`
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
    if (LocalStorageModel.storedJobs.includes(annonsId) === true) {
      alert("Denna annons har redan sparats.");
      return;
    }
    LocalStorageModel.storedJobs.push(annonsId);
    // set the savedJobs on localStorage with the storedJobs data.
    localStorage.setItem(
      "savedJobs",
      JSON.stringify(LocalStorageModel.storedJobs)
    );
    let numberOfSavedJobs = LocalStorageModel.storedJobs.length;
    View.updateDisplaySavedJobs(numberOfSavedJobs);
  },
  getNumberOfSavedJobs() {
    let numberOfSavedJobs = LocalStorageModel.storedJobs.length;

    return numberOfSavedJobs;
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
    View.updateDisplaySavedJobs();
  }
};

const ResponseController = {
  getJobId() {
    const urlString = window.location.href;
    const url = new URL(urlString);
    console.log(urlString);
    console.log(url.hash.split("=")[1]);
    const jobID = url.hash.split("=")[1];
    return jobID;
  },
  // sortResponse(data) {
  //   console.log(data);
  // },

  getTotalNumberOfJobs(data, chosenArea) {
    let totalNumberOfJobs = data.matchningslista.antal_platsannonser;
    let latestJobs = data.matchningslista.matchningdata;
    ResponseController.getLatestJobs(latestJobs);
    View.displayTotalNumberOfJobs(totalNumberOfJobs, chosenArea);
  },

  getLatestJobs(latestJobs) {
    for (let job of latestJobs) {
      View.displayLatestJob(job);
    }
    FeedbackView.highlightSavedJobButtons();
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
  communityID: "",
  page: "1",
  selectNumberOfJobs() {
    const numberOfJobsInput = document.getElementById("numberOfJobs");

    numberOfJobsInput.addEventListener("change", function() {
      let numberOfJobs = numberOfJobsInput.selectedIndex;
      let filterAmount = document.getElementsByTagName("option")[numberOfJobs]
        .value;
      FilterView.registerNumberOfJobs(filterAmount, FilterController.countyID);
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

      let selectedCountyName = document.getElementsByClassName("county")[
        countyIndex
      ].innerText;

      if (selectedCounty) {
        const communtityContainer = document.getElementById(
          "communityContainer"
        );
        communityContainer.style.display = "block";
      }

      FilterView.registerSelectedCounty(selectedCounty, selectedCountyName);

      return selectedCounty;
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
      FilterView.registerSelectedjobCategory(
        selectedjobCategory,
        FilterController.countyID,
        FilterController.communityID
      );
    });
  },

  searchOccupation() {
    const searchInput = document.getElementById("searchOccupation");

    searchInput.addEventListener("keyup", function() {
      console.log("keyup");

      if (searchInput.value.length === 3) {
        FilterController.yrkesbenamning = searchInput.value;
        FetchModel.fetchSearch(
          FilterController.yrkesbenamning,
          FilterController.countyID,
          FilterController.communityID
        );
      }

      //console.log(searchInput);
      //let searchInputValue = this.value;

      //console.log(FilterController.yrkesbenamning);
    });
  },

  nextPage(nextPageButton) {
    nextPageButton.addEventListener("click", function() {
      window.scrollTo(0, 380);
      FilterController.page++;
      page = FilterController.page;
      View.jobContainer.innerHTML = "";
      FetchModel.fetchAll(
        FilterController.numberOfJobs,
        FilterController.countyID,
        FilterController.jobCategoryID,
        FilterController.communityID,
        page
      );
    });
  },

  previousPage(previousPageButton) {
    previousPageButton.addEventListener("click", function() {
      if (FilterController.page > 1) {
        window.scrollTo(0, 380);
        FilterController.page--;
        console.log("previous page", FilterController.page);
        View.jobContainer.innerHTML = "";
        FetchModel.fetchAll(
          FilterController.numberOfJobs,
          FilterController.countyID,
          FilterController.jobCategoryID,
          FilterController.communityID,
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
          FilterController.communityID,
          FilterController.page
        );
      }
    });
  }
};

const View = {
  totalNumberOfJobsHeader: document.getElementById("totalNumberOfJobsHeader"),
  displayTotalNumberOfJobs(totalNumberOfJobs, chosenCounty) {
    totalNumberOfJobsHeader.innerHTML = `
		<div class="numberOfJobs">
		<h1>${totalNumberOfJobs}</h1>
		<p>Tillgängliga jobb i ${chosenCounty}</p>
		</div>`;
  },

  checkForSavedJobs() {
    if (LocalStorageModel.storedJobs.length === 0) {
      const savedJobsContainer = document.getElementById("savedJobsList");
      let noSavedJobsMessageHTML = `
      <p id="no-saved-jobs-message">Ingenting att se här...</p>
      `;
      savedJobsContainer.insertAdjacentHTML(
        "beforeend",
        noSavedJobsMessageHTML
      );
    }
  },

  updateDisplaySavedJobs() {
    const numberofSavedJobs = LocalStorageModel.getNumberOfSavedJobs();
    const mySavedJobs = document.getElementById("mySavedJobs");
    mySavedJobs.innerHTML = "Mina sparade annonser (" + numberofSavedJobs + ")";
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
  savedJobsList: document.getElementById("savedJobsList"),

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
		<button class="delete" id="savedJob=${job.annons.annonsid}">Delete</button>
		</div>`;

    savedJobsList.insertAdjacentHTML("beforeEnd", savedJobCardHTML);

    //console.log(annonsId.platsannons.annons.annonsid);

    const deleteSavedJobButton = document.getElementById(
      "savedJob=" + annonsId.platsannons.annons.annonsid
    );
    console.log(deleteSavedJobButton);

    deleteSavedJobButton.addEventListener("click", function() {
      const confirmMessage = confirm("Är det ditt slutgiltiga svar???");
      if (confirmMessage) {
        console.log("this.id = ", this.id);
        const idToDelete = this.id;
        console.log("this.parenteELement = ", this.parentElement);
        this.parentElement.parentElement.removeChild(this.parentElement);
        LocalStorageModel.removeSavedJob(idToDelete);
      }
    });
  },

  displayJobDetails(jobDetailsCardHTML) {
    const goBackButton = `
		<button id="goBack" class="goBack">Gå tillbaka</button>
		`;

    const jobDetails = document.createElement("div");
    jobDetails.classList.add("job_details");
    containerJobDetails.appendChild(jobDetails);
    jobDetails.innerHTML = jobDetailsCardHTML;
    containerJobDetails.insertAdjacentHTML("beforeEnd", goBackButton);

    const shareURLButton = `
		<button id="shareURL" class="shareURL">Dela annons</button>
		`;
    containerJobDetails.insertAdjacentHTML("beforeEnd", shareURLButton);

    const shareButton = document.getElementById("shareURL");
    shareButton.addEventListener("click", function() {
      let modalContent = View.displayModalContent();
      containerJobDetails.insertAdjacentHTML("beforeend", modalContent);
      View.hideModalContentOnSpanClick();
    });
  },

  displayCommunitiesFromSelectedCounty(communities, selectedCounty) {
    const communityContainer = document.getElementById("communityContainer");
    const selectCommunity = document.getElementById("community");

    for (const community of communities) {
      const communityOption = document.createElement("option");
      communityOption.innerText = community.namn;
      communityOption.id = community.id;
      communityOption.classList.add("community");

      console.log("community by id:", community.id);

      selectCommunity.appendChild(communityOption);
    }

    selectCommunity.addEventListener("change", function() {
      let communityIndex = selectCommunity.selectedIndex;
      let selectedCommunity = document.getElementsByClassName("community")[
        communityIndex
      ].id;

      selectedCommunityName = document.getElementsByClassName("community")[
        communityIndex
      ].innerText;

      FilterView.registerSelectedCommunity(
        selectedCommunity,
        selectedCounty,
        FilterController.jobCategoryID,
        selectedCommunityName
      );
    });
  },

  displayModalContent() {
    const copyURL = window.location.href;
    const modal = `
      <div id="URLModal" class="modal">

      <div class="modal-content">
        <span id="closeURL_Modal">&times;</span>
        <p>${copyURL}</p>
      </div>
    `;

    return modal;
  },

  hideModalContentOnSpanClick() {
    const modalContent = document.getElementById("URLModal");
    const span = document.getElementById("closeURL_Modal");
    span.addEventListener("click", function() {
      modalContent.style.display = "none";
    });
  },

  displaySearchMatch(searchResults) {
    const searchMatchUl = document.createElement("ul");
    const searchMatchOutput = document.getElementById("searchMatchOutput");
    searchMatchOutput.appendChild(searchMatchUl);

    for (let searchResult of searchResults) {
      const searchMatchLi = document.createElement("li");
      searchMatchLi.id = searchResult.annonsid;
      console.log(searchResult);
      searchMatchLi.innerText = searchResult.annonsrubrik;
      searchMatchUl.appendChild(searchMatchLi);

      searchMatchLi.addEventListener("click", function() {
        FetchModel.fetchByIdHTML(this.id);
        window.location.hash = `?jobDetail=${this.id}`;
        NavigationView.showJobDetails();
      });
    }
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
      window.location.hash = "#";
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
      NavigationView.clearSavedJobs();
      View.checkForSavedJobs();
      NavigationView.containerLandingPage.classList.add("hidden");
      NavigationView.containerJobDetails.classList.add("hidden");
      NavigationView.containerSavedJobs.classList.remove("hidden");

      for (annonsId of LocalStorageModel.storedJobs) {
        FetchModel.fetchByIdJSON(annonsId);
      }
    });
  },

  clearSavedJobs() {
    const savedJobsList = document.getElementById("savedJobsList");
    savedJobsList.innerHTML = "";
  }
}; // End of NavigationView

const FilterView = {
  registerNumberOfJobs(filterAmount) {
    View.jobContainer.innerHTML = "";
    FilterController.numberOfJobs = filterAmount;
    FetchModel.fetchAll(FilterController.numberOfJobs);
  },

  selectCommunity(countyId) {
    console.log("län id som ska användas:", countyId);
    FetchModel.fetchCommunityByCountyId(countyId);
    //return countyId;
  },

  registerSelectedCounty(selectedCounty, chosenCounty) {
    console.log("The one", chosenCounty);
    View.jobContainer.innerHTML = "";
    FilterController.countyID = selectedCounty;
    FilterView.selectCommunity(selectedCounty);
    FetchModel.fetchAll(
      FilterController.numberOfJobs,
      selectedCounty,
      FilterController.jobCategoryID,
      FilterController.communtyID,
      FilterController.page,
      chosenCounty
    );
  },

  registerSelectedCommunity(
    selectedCommunity,
    selectedCounty,
    selectedjobCategory,
    chosenCommunity
  ) {
    FilterController.countyID = selectedCounty;
    FilterController.communityID = selectedCommunity;
    console.log("vald län", selectedCounty);
    console.log("vald kommun", selectedCommunity);
    View.jobContainer.innerHTML = "";

    FetchModel.fetchAll(
      FilterController.numberOfJobs,
      selectedCounty,
      selectedjobCategory,
      selectedCommunity,
      FilterController.page,
      chosenCommunity
    );
  },

  registerSelectedjobCategory(
    selectedjobCategory,
    selectedCounty,
    selectedCommunity
  ) {
    View.jobContainer.innerHTML = "";
    console.log(
      "jobCategory:",
      selectedjobCategory,
      "county;",
      selectedCounty,
      "community:",
      selectedCommunity
    );
    FilterController.jobCategoryID = selectedjobCategory;
    FetchModel.fetchAll(
      FilterController.numberOfJobs,
      selectedCounty,
      selectedjobCategory,
      selectedCommunity
    );
  }
};

const FeedbackView = {
  // feedbackPopup(successOrError, message){
  //   const feedbackPopup = document.getElementById('feedbackPopup');
  //
  //   feedbackPopup.classList.remove('hidden');
  //
  //   if(successOrError === 'success'){
  //     feedbackPopup.classList.add('success');
  //   } else if (successOrError === 'error') {
  //     feedbackPopup.classList.add('error');
  //   }
  //   feedbackPopup.innerText = message;
  //   console.log(feedbackPopup);
  //   //Hide popup when clicking outside of it
  //   // document.addEventListener('click', function(event) {
  //   //   var isClickInside = feedbackPopup.contains(event.target);
  //   //   if (!isClickInside){
  //   //     feedbackPopup.classList.add('hidden');
  //   //   }
  //   // });
  // },
  textHighlight(textToHighlight) {
    textToHighlight.classList.add("textToHighlight");
    setTimeout(function() {
      textToHighlight.classList.remove("textToHighlight");
    }, 1000);
  },
  saveJob(button) {
    button.classList.add("saved");
    button.innerText = "Sparad";
    console.log(button);
  },

  highlightSavedJobButtons() {
    // Get the array of saved jobs
    console.log(LocalStorageModel.storedJobs);

    const buttons = document.getElementsByClassName("save");
    console.log(buttons);
    for (let button of buttons) {
      if (LocalStorageModel.storedJobs.includes(button.parentElement.id)) {
        button.classList.add("saved");
        button.innerText = "Sparad";
      }
    }
    //
    // for (const savedJobID of LocalStorageModel.storedJobs) {
    //   // In a loop: getElementById using all the saved job-ID's
    //   let savedJobDiv = document.getElementById(savedJobID);
    //
    //   console.log(savedJobDiv);

    // In the loop, go into every div to target the save-buttons
    // Add the class .saved and innerText = 'Saved' to each button
    //}
  }
};

/***************************************/
/************* CALL FUNCTIONS **********/
/***************************************/

if (!ResponseController.getJobId()) {
  FetchModel.fetchAll();
} else {
  console.log(ResponseController.getJobId());
  FetchModel.fetchByIdHTML(ResponseController.getJobId());
  NavigationView.showJobDetails();
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
View.updateDisplaySavedJobs();

FeedbackView.highlightSavedJobButtons();
