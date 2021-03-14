$(document).ready(function () {
	var inputCity = $("input");
	var pastSearches = $("#historySection");
	var fiveDayForecast = $("#fiveDayForecast");
	var searchHist = JSON.parse(localStorage.getItem("history")) || [];
	var city;
	var lastSearched = searchHist[searchHist.length - 1];

	// check local storage
	if (localStorage.length != 0) {
		getSearches();
		// load last searched city
		searchCity(lastSearched);
	}

	// enter key to search
	inputCity.on("keydown", function (event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			// city name stored
			city = inputCity.val().trim();
			$("article").show();
			$("h3").show();
			searchCity(city);
		}
	});

	// search on click (same as enter)
	$(".citySearch").on("click", function (event) {
		event.preventDefault();
		city = inputCity.val().trim();
		$("article").show();
		$("h3").show();
		searchCity(city);
	});

	// add cities to DOM
	function prependSearch(city) {
		if (inputCity === null) {
			return;
		} else {
			var searches = $("<div>");
			searches.attr("class", "#historySection");
			searches.text(city);
			pastSearches.prepend(searches);
			storeSearches(searches);
		}
	}

	// store search
	function storeSearches(searches) {
		for (var i = 0; i < searches.length; i++) {
			var city = searches.text();
			if (searchHist.includes(city)) {
				break;
			} else {
				searchHist.push(city);
			}
		}
		localStorage.setItem("history", JSON.stringify(searchHist));
		getSearches();
	}

	// pull searches from local storage
	function getSearches() {
		var storedSearches = JSON.parse(localStorage.getItem("history")) || [];
		renderSearches(storedSearches);
    }
    
	function renderSearches(storedSearches) {
		pastSearches.empty();

		for (var i = 0; i < storedSearches.length; i++) {
			var searches = $("<div>");
			searches.attr("class", "searches");
			searches.text(storedSearches[i]);
			pastSearches.prepend(searches);
		}
		// clear searches button
		var clearSearch = $("<button>");
		clearSearch.attr("class", "clear");
		clearSearch.text("Clear Search History");
		pastSearches.append(clearSearch);
	}
	// view other searches
	$(document).on("click", ".searches", function () {
		var city = $(this).text();
		searchCity(city);
		$("article").show();
		$("h3").show();
	});

	//  openweather api
	function searchCity(city) {
		var queryURL =
			"https://api.openweathermap.org/data/2.5/weather?q=" +
			city +
			"&appid=e90f89da353464dd1dc479b73a3a777e";

		$.ajax({
			url: queryURL,
			method: "GET",
		})
			.then(function (response) {
				// pull city name
				var cityName = response.name;

				// pull latitude and longitude
				var latitude = response.coord.lat;
				var longitude = response.coord.lon;

				oneCall(latitude, longitude, cityName);
				prependSearch(cityName);
			})
			// alert if entry is not a city
			.catch(function (error) {
				alert("Please search a valid city");
				return;
			});

		function oneCall(latitude, longitude, cityName) {
			// Get the URL for the onecall api
			var queryURL =
				"https://api.openweathermap.org/data/2.5/onecall?lat=" +
				latitude +
				"&lon=" +
				longitude +
				"&exclude={part}&appid=e90f89da353464dd1dc479b73a3a777e";

			$.ajax({
				url: queryURL,
				method: "GET",
			}).then(function (response) {
				// clear local weather
				var articleEl = $("article");
				articleEl.empty();

				// add city name and date
				var today = moment().format("(M/D/YY)");
				var newH2 = $("<h2>");
				var icon = response.current.weather[0].icon;
				var iconEl = $("<img>");
                iconEl.attr("class", "mainIcon");
                // use open weather icons
				iconEl.attr(
					"src",
					"https://openweathermap.org/img/wn/" + icon + ".png"
				);
				newH2.html(cityName + " " + today + " ");

				$("article").append(newH2);
				$("article").append(iconEl);

				// add today's weather
				var tempK = response.current.temp;
				var tempF = (tempK - 273.15) * 1.8 + 32;
				var pTemp = $("<p>");
				var fahranheit = "\xB0F";
				pTemp.attr("class", "today");
				pTemp.text("Temperature: " + tempF.toFixed(1) + " " + fahranheit);
				$("article").append(pTemp);

				// current humidity 
				var humidity = response.current.humidity;
				var pHum = $("<p>");
				pHum.attr("class", "today");
				pHum.text("Humidity: " + humidity + "%");
				$("article").append(pHum);

				// wind speed
				var windSpeed = response.current.wind_speed;
				var pWind = $("<p>");
				pWind.attr("class", "today");
				pWind.text("Wind Speed: " + windSpeed.toFixed(1) + " MPH");
				$("article").append(pWind);

				// UV index with color-coding for low, moderate and high (css)
				var uvIndex = response.current.uvi;
				var pIndex = $("<p>");
				var pUV = $("<p>");
				pUV.attr("class", "today uv");
				pIndex.attr("class", "today  uv uvBox");
				pIndex.attr("id", "uvIndex");
		
				if (uvIndex <= 2) {
					pIndex.attr("id", "low");
				} else if (uvIndex > 2 && uvIndex <= 5) {
					pIndex.attr("id", "mod");
				} else {
					pIndex.attr("id", "high");
				}
				pUV.text("UV Index: ");
				pIndex.text(uvIndex.toFixed(2));
				$("article").append(pUV);
				$("article").append(pIndex);

				// empty forcast
				fiveDayForecast.empty();

				// display for 5-day forecast
				h3El = $("<h3>");
				h3El.text("5-Day Forecast:");
				fiveDayForecast.append(h3El);

				// array for next 5 days
				var daily = [];
				daily.push(response.daily[1]);
				daily.push(response.daily[2]);
				daily.push(response.daily[3]);
				daily.push(response.daily[4]);
				daily.push(response.daily[5]);

				// gather forcast info from api
				for (var i = 0; i < daily.length; i++) {
					var dailyDiv = $("<div>");
					dailyDiv.attr("class", "fiveDay");
					// pull the date for next 5 days
					var dateEl = $("<p>");
					dateEl.attr("class", "dates");
					var newDate = moment()
						.add(i + 1, "days")
						.format("M/D/YYYY");
					dateEl.text(newDate);
					// pull icons from openweather api
					var icon = daily[i].weather[0].icon;
					var iconEl = $("<img>");
					iconEl.attr("class", "dailyIcon");
					iconEl.attr(
						"src",
						"https://openweathermap.org/img/wn/" + icon + ".png"
					);
					// high temp
					var tempEl = $("<p>");
					tempEl.attr("class", "days");
					var tempK = daily[i].temp.max;
					var tempF = (tempK - 273.15) * 1.8 + 32;
					var fahranheit = "\xB0F";
					tempEl.text("Temp: " + tempF.toFixed(2) + " " + fahranheit);
					// humidity
					var humEl = $("<p>");
					humEl.attr("class", "days");
					var hum = daily[i].humidity;
					humEl.text("Humidity: " + hum + "%");
					// add to page
					dailyDiv.append(dateEl);
					dailyDiv.append(iconEl);
					dailyDiv.append(tempEl);
					dailyDiv.append(humEl);
					fiveDayForecast.append(dailyDiv);
				}
			});
		}
	}
	// clear search from local storage
	$(document).on("click", ".clear", function () {
		localStorage.clear();
		location.reload();
		searchCity(lastSearched);
	});
});