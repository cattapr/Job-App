
function fetchAllEmploymentAds() {
   		fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=20&yrkesomradeid=3&lanid=1')
        .then((response) => response.json())
        .then((data) => {
          let listings = data.matchningslista;

        })


}



let listings2 = fetchAllEmploymentAds();
console.log(listings2);