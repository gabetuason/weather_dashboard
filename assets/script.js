
var citiesList = []; // array for city list
var myAPIkey = 'ca74ea97729994a90fe6474ed91c93c2'; // default key: 9a16d5f97155a353e435c35464b84930;

$(document).ready(function () {

    $(".bttn-search").on("click", function (event) {
        event.preventDefault();
        // find the city entered and match
        var cityName = $('#value-search').val().trim();

        if (cityName) {
            if (!citiesList.includes(cityName)) {
                citiesList.push(cityName);
                localStorage.setItem("cities", JSON.stringify(citiesList));
            }
            // call functions after search is clicked
            // value of city name is carried to the function
            createButtons();
            requestURLdata(cityName);
        }
        else {
            alert("The search bar is empty! Please enter a city");
        }
    });

    // added a clear button to remove list from search history
    $(".bttn-clear").on("click", function (event) {
        event.preventDefault();
        localStorage.clear();
        $(".search-history").remove();

    });

    // find weather data, match cityName
    function requestURLdata(cityName) {
        var urlWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + myAPIkey;

        // chosen ajax method to get url 
        $.ajax({
            url: urlWeather,
            method: "GET"
        }).then(function (response) {
            console.log('city weather data \n-------------');
            console.log(response);

            //acquiring latitude and longitude of the city
            latitude = response.coord.lat
            longitude = response.coord.lon

            // display the information for today's weather
            $('.tdy-city').text(response.name);
            // show users today's date which corresponds to the weather happening now in the city viewed
            var presentDate = dayjs().format(" MMMM DD, YYYY"); // dayjs()format for date
            var presentTime = dayjs().format(" HH");
            var utcTime = dayjs().format("Z");
            $('.tdy-date').text(presentDate + " Time:" + presentTime + "Hour");
            $('.utc').text("Your UTC timezone: " + utcTime); // show user timezone
            var icons = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"; // from https://openweathermap.org/weather-conditions
            $('.tdy-icon').attr("src", icons);

            var tempFarenheit = parseFloat(((response.main.temp) - 273.15) * 1.8 + 32).toFixed(2) // default: kelvin, converted to Farenheit and round it
            $('.tdy-temp').text("Temp: " + tempFarenheit + " °F");

            var windSpeed = parseFloat((response.wind.speed) * 2.237).toFixed(1) // default: meters per sec, converted to miles per hour and round it
            $('.tdy-wind-condition').text("Wind: " + windSpeed + " MPH");
            // display humidity
            $('.tdy-humidity').text("Humidity: " + response.main.humidity + "%");

            // using latitude and longitude for location, then using it to forecast the 5-days
            var urlWeather = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + myAPIkey;
            $.ajax({
                url: urlWeather,
                method: "GET"
            }).then(function (response) {
                var wthrData = response.list;
                showfivedays(wthrData); // 40 arrays total for the city (taken from different timeframes) for future weather data
            });
        });
    }

    function showfivedays(wthrData) {
        var wtherDay = [];
        // Take every 8th object starting from the 6th array, where weather is measured appropriately for time/day.
        for (var i = 6; i < wthrData.length; i = i + 8) {
            var forecastDates = wthrData[i];
            console.log(forecastDates);
            wtherDay.push(forecastDates);
        }
        // with the five arrays taken, use for loop to extract info for each starting with the dates.
        for (var i = 0; i < wtherDay.length; i++) {
            var arrayDates = wtherDay[i].dt_txt.split(" ");
            arrayDates = arrayDates[0].split("-");

            // taking the dates from the arrays and formating with month, day and year
            var months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            var month = arrayDates[1];
            var day = arrayDates[2];
            var year = arrayDates[0];
            $('.date' + i).text(months[parseInt(month) - 1] + " " + day + ", " + year);

            // from https://openweathermap.org/weather-conditions
            var icons = "http://openweathermap.org/img/wn/" + wtherDay[i].weather[0].icon + "@2x.png";
            $('.img' + i).attr("src", icons);


            var tempFarenheit = parseFloat(((wtherDay[i].main.temp) - 273.15) * 1.8 + 32).toFixed(2) // Temperature for each day
            $('.temperature' + i).text("Temp: " + tempFarenheit + " °F");

            var windSpeed = parseFloat((wtherDay[i].wind.speed) * 2.237).toFixed(1) // WindSpeed for each day
            $('.windsp' + i).text("Wind: " + windSpeed + " MPH");

            $('.humid' + i).text("Humidity: " + wtherDay[i].main.humidity + " %"); // Humidity for each day
        }
    }

    function createButtons() {
        // see if there are data stored
        var dataSaved = JSON.parse(localStorage.getItem("cities"));
        if (dataSaved) { citiesList = dataSaved; }
        $(".search-history").empty();
        //make the buttons for each city in the array
        for (var i = 0; i < citiesList.length; i++) {
            var cityButton = $("<button>");
            cityButton.addClass("bttn-city");
            cityButton.attr("data-name", citiesList[i]);
            cityButton.text(citiesList[i]);
            $(".search-history").append(cityButton);
        }
        // Event listener for buttons that are created from cityList 
        $(".bttn-city").on("click", function (event) {
            event.preventDefault();
            var cityViewed = $(this).attr("data-name");
            requestURLdata(cityViewed);
        });
    }
});
