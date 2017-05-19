//Niklas Trzaska: 416024
//Jasper Buß: 430423

const myGeOO = GeOO(); // The geometry-help I am using in this file.

/**
 * Delas with the file input.
 * It reads the file, checks its value and returns the length of the polyline, represented by the uploaded points
 * @param {event} event form the browser
 */
document.getElementById("uploadPolylineButton").onchange = function(event) {

    var input = event.target;
    var reader = new FileReader();

    // Callback when the file is loaded
    reader.onload = function() {
        try {
            var filecontent = reader.result; // Loaded content
            
            const coordinateArray = getValidCoordinatesFromTextfile(filecontent);
            const polyline = constructPolyline(coordinateArray);
            const lengthInKm = polyline.getGreatCircleLength_inMeter_ForLatitudeLongitude_PointValues() / 1000;
            
            displayLengthInDivResult(lengthInKm);
        } catch (error) {
            alert(error);
        }

    };


    // Read the file
    reader.readAsText(input.files[0]);
};

/**
 * Updates the html content to display the calculated length.
 * The div with the id "result" will be updated
 * @param {anything} length
 */
function displayLengthInDivResult(length) {
    var resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "The polyline is " + length + " km long.";
}

/**
 * Constructs a polyline from an Array of coordinate values.
 * Expect them to be in lat, lon, ...
 * @param {Array} coordinateArray
 * @return {Polyline2D} the constructed polyline
 */
function constructPolyline(coordinateArray) {
    try {
        const arrayOfLines = constructLineArray(coordinateArray);
        return  myGeOO.newPolyline2D(arrayOfLines);
    } catch (error) {
        alert(error);
    }
}

/**
 * Constructs an Array of Lines, given from an array of coordinates.
 * @param {Array} Array of coordinates
 * @return {Array} Array of lines with type Line2D
 */
function constructLineArray(coordinateArray) {
    const arrayOfLines = [];

    try {
        const arrayOfPoints = constructPointArray(coordinateArray);

        for (let i = 1; i < arrayOfPoints.length ; i++) {
            const line = myGeOO.newLine2D(arrayOfPoints[i-1], arrayOfPoints[i]); // closed lines (no spaces).
            arrayOfLines.push(line);
        }
    } catch (error) {
        alert(error);
    }

    return arrayOfLines;
}

/**
 * Constructs an array of points.
 * @param {type} coordinateArray
 * @return {Array} Array of element with type Point2D
 */
function constructPointArray(coordinateArray) {
    const arrayOfPoints = [];

    try {
        for (let i = 0; i < coordinateArray.length - 1; i += 2) {
            const point = myGeOO.newPoint2D(Number(coordinateArray[i + 1]), Number(coordinateArray[i])); // Keep in mind: First longitude, then latitude
            arrayOfPoints.push(point);
        }
    } catch (error) {
        alert(error);
    }

    return arrayOfPoints;

}
