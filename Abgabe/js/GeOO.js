//Niklas Trzaska: 416024
//Benjamin Karic: 429331
//
////This library is intended to force information hiding.
// Per default, js-Objects do not protect attributes. The downside is, that I can never be sure abut the propper
// representation of my model. I have always to check my stuff before I can work further on.
// This does flood code with a lot of boilerplate code. It becomes ugly, cohesion is reduced and so on => the code is less expressive

// For this purpose I encapsulate my the information in an object, so they can only be accessable with getters and setters.
// By this means, no crazy stuff can (should) happen.
// We realize this by using closures returning in interface to the creation of objects.

const GeOO = () => {

    /**
     * Object, describing an point in the plain
     */
    function Point2D() {
        let horizontalValue;
        let verticalValue;
        let coordinateReferenceSystem;

        /**
         * @param {number} newHorizontalValue
         * @throws {TypeError} If the new horizontal value is not a number
         */
        this.setHorizontalValue = newHorizontalValue => {
            if (newValueIsNumber(newHorizontalValue)) {
                horizontalValue = newHorizontalValue;
            } else {
                throw new TypeError("Given value -> " + newHorizontalValue + " <- is not a number.");
            }
        };

        /**
         * @return {number} current horizontal value
         */
        this.getHorizontalValue = () => {
            return horizontalValue;
        };


        /**
         * @param {number} newVerticalValue
         * @throws {TypeError} If the new vertical value is not a number.
         */
        this.setVerticalValue = newVerticalValue => {
            if (newValueIsNumber(newVerticalValue)) {
                verticalValue = newVerticalValue;
            } else {
                throw new TypeError("Given value -> " + newVerticalValue + " <- is not a number.");
            }
        };

        /**
         * @return {number}
         */
        this.getVerticalValue = () => {
            return verticalValue;
        };


        /**
         * A coordinateReferenceSystem is optional. It can be anything in this context, number, string ect. 
         * @param {any type} newCoordinateReferenceSystem
         */
        this.setCoordinateReferenceSystem = newCoordinateReferenceSystem => {
            coordinateReferenceSystem = newCoordinateReferenceSystem;
        };

        /**
         * 
         * @return {newCoordinateReferenceSystem} The current representation number, stirng ect. of a crs.
         */
        this.getCoordinateReferenceSystem = () => {
            return coordinateReferenceSystem;
        };
    }
//*************************************************************************************************************************

    /**
     * Representating a line in the plain
     */
    function Line2D() {
        let startPoint;
        let endPoint;

        /**
         * 
         * @param {Point2D} newStartPoint
         * @throws {TypeError} If the given point is not of the type Point2D. 
         */
        this.setStart = newStartPoint => {
            if (isPoint2D(newStartPoint)) {
                startPoint = newStartPoint;
            } else {
                throw new TypeError("Given value -> " + newStartPoint + " <- is not a Point2D.");
            }
        };

        /**
         * @return {Point2D} The startpoint of the line
         */
        this.getStart = () => {
            return startPoint;
        };

        /**
         * 
         * @param {Point2D} newEndPoint
         * @throws {TypeError} If the given point is not of the type Point2D. 
         */
        this.setEnd = newEndPoint => {
            if (isPoint2D(newEndPoint)) {
                endPoint = newEndPoint;
            } else {
                throw new TypeError("Given value -> " + newEndPoint + " <- is not a Point2D.");
            }
        };

        /**
         * @return {Point2D} The startpoint of the line
         */
        this.getEnd = () => {
            return endPoint;
        };



        /**
         * @return {number} Length of the line in meter.
         */
        this.getGreatCircleLength_inMeter_ForLatitudeLongitude_PointValues = () => {
            const startPointVerticalValue = degrees2radians(startPoint.getVerticalValue());
            const endPointVerticalValue = degrees2radians(endPoint.getVerticalValue());
            const differenceVerticalValuesEndStart = degrees2radians(endPoint.getVerticalValue() - startPoint.getVerticalValue());
            const differenceHorizontalValuesEndStart = degrees2radians(endPoint.getHorizontalValue() - startPoint.getHorizontalValue());

            return calculateMeterDistanceForPointsWithRadianValues(startPointVerticalValue, endPointVerticalValue, differenceVerticalValuesEndStart, differenceHorizontalValuesEndStart);
        };
    }

    //*************************************************************************************************************************

    function Polyline2D() {
        let linesegments = [];

        this.isEmpty = () => {
            return linesegments.length <= 0;
        };

        this.getSegmentAtPosition = position => {
            if (validPositionInArray(position, linesegments)) {
                return linesegments[position];
            } else {
                throw new RangeError("Requested position is not an index for a segment. Valid indexes are currently integers from the interval [0,+" + linesegments.length - 1 + "].");
            }
        };

        this.getNumberOfSegments = () => {
            return linesegments.length;
        };

        this.reset = () => {
            linesegments = [];
        };

        this.addLinesegmentToEnd = line2DSegment => {
            if (isLine2D(line2DSegment)) {
                linesegments.push(line2DSegment);
            } else {
                throw new TypeError("Given value -> " + line2DSegment + " <- is not a Line2D.");
            }
        };


        this.getGreatCircleLength_inMeter_ForLatitudeLongitude_PointValues = () => {
            return linesegments.reduce((sumOfLength, lineLength) => sumOfLength + lineLength.getGreatCircleLength_inMeter_ForLatitudeLongitude_PointValues(), 0);
        };
    }
//*************************************************************************************************************************

    /*
     * Assertions
     */

    function newValueIsNumber(newValue) {
        return (typeof newValue === "number");
    }

    function isPoint2D(newElement) {
        return newElement instanceof Point2D;
    }

    /**
     * @param {number} position
     * @param {array} array
     * @return {Boolean} true if position in [0, array.length], else false
     */
    function validPositionInArray(position, array) {
        return -1 < position && position < array.length;
    }

    function isLine2D(newElement) {
        return newElement instanceof Line2D;
    }

//*************************************************************************************************************************

    /*
     * Calculate length of line
     */

    /**
     * Converts units (degree -> radians)
     * @param {number} degrees
     * @return {Number}
     */
    function degrees2radians(degrees) {
        const pi = Math.PI;
        return degrees * (pi / 180);
    }

    /**
     * Calculating disance by
     * Haversine
     * formula:
     * d = R ⋅ c
     * Formular for small distances, taken from http://www.movable-type.co.uk/scripts/latlong.html and http://andrew.hedges.name/experiments/haversine/
     * @param {number} startPointHorizontalValue
     * @param {number} endPointHorizontalValue
     * @param {number} differenceHorizontalValuesEndStart
     * @param {number} differenceVerticalValuesEndStart
     * @return {number} Great circle distance between two points in meter.
     * @throws {error} 
     */
    function calculateMeterDistanceForPointsWithRadianValues(startPointHorizontalValue, endPointHorizontalValue, differenceHorizontalValuesEndStart, differenceVerticalValuesEndStart) {
        const EarthRadiusInMeters = 6371000;
        try {
            const a = squareOfHalfTheChordLengthBetweenThePoints(startPointHorizontalValue, endPointHorizontalValue, differenceHorizontalValuesEndStart, differenceVerticalValuesEndStart);
            const b = angularDistanceInRadians(a);
            const distanceInMeter = b * EarthRadiusInMeters;
            return Math.round(distanceInMeter, -1); // Rounding to km with two decimalplaces.   
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calculating the a-Value, needed in calculateMeterDistanceForPointsWithRadianValues
     * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
     * @param {number} startPointHorizontalValue
     * @param {number} endPointHorizontalValue
     * @param {number} differenceHorizontalValuesEndStart
     * @param {number} differenceVerticalValuesEndStart
     * @return {Number} 
     * @throws {error} 
     */
    function squareOfHalfTheChordLengthBetweenThePoints(startPointHorizontalValue, endPointHorizontalValue, differenceHorizontalValuesEndStart, differenceVerticalValuesEndStart) {
        try {
            return Math.pow(Math.sin(differenceHorizontalValuesEndStart / 2), 2) + Math.cos(startPointHorizontalValue) * Math.cos(endPointHorizontalValue) * Math.pow(Math.sin(differenceVerticalValuesEndStart / 2), 2);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calculating the c-Value, needed in calculateMeterDistanceForPointsWithRadianValues
     * c = 2 ⋅ atan2( √a, √(1−a) )
     * @param {type} squareOfHalfTheChordLengthBetweenThePoints
     * @return {Number}
     * @throws {error} 
     */
    function angularDistanceInRadians(squareOfHalfTheChordLengthBetweenThePoints) {
        try {
            return 2 * Math.atan2(Math.sqrt(squareOfHalfTheChordLengthBetweenThePoints), Math.sqrt(1 - squareOfHalfTheChordLengthBetweenThePoints));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Interface for the instanciation of Objects. With this, the encapsulation is realized.
     */

    return {
        newPoint2D: (horizontalValue, verticalValue, coordinateReferenceSystem) => {
            try {
                return instanciatePoint2D(horizontalValue, verticalValue, coordinateReferenceSystem);
            } catch (error) {
                throw error;
            }
        },

        newLine2D: (start, end) => {
            try {
                return instanciateLine2D(start, end);
            } catch (error) {
                throw error;
            }
        },

        newPolyline2D: (...lines2D) => {
            try {
                // If first argument is an Array. Only this one with its content will be processed. Otherwisw all commaseperated arguments.
                let result = lines2D[0] instanceof Array ? instanciatePolyline2DwithArray(lines2D[0]) : instanciatePolyline2DwithArray(lines2D);
                return result;
            } catch (error) {
                throw error;
            }

        }
    };

    /*
     * Instanciate objects
     */

    /**
     * 
     * @param {number} horizontalValue
     * @param {number} verticalValue
     * @param {any} coordinateReferenceSystem
     * @return {Point2D}
     * @throws {type Error} 
     */
    function instanciatePoint2D(horizontalValue, verticalValue, coordinateReferenceSystem) {
        try {
            let point = new Point2D();
            point.setHorizontalValue(horizontalValue);
            point.setVerticalValue(verticalValue);
            point.setCoordinateReferenceSystem(coordinateReferenceSystem);
            return point;
        } catch (error) {
            throw error;
        }
    }


    /**
     * 
     * @param {Point2D} start
     * @param {Point2D} end
     * @return {Line2D}
     */
    function instanciateLine2D(start, end) {
        try {
            let line = new Line2D();
            line.setStart(start);
            line.setEnd(end);
            return line;
        } catch (error) {
            throw error;
        }
    }
    
    
    /**
     * 
     * @param {type} lines2D
     * @return {GeOO.instanciatePolyline2DwithArray.polyline|GeOO.Polyline2D}
     */
    function instanciatePolyline2DwithArray(lines2D) {
        try {
            let polyline = new Polyline2D();
            lines2D.forEach(line => {
                polyline.addLinesegmentToEnd(line);
            });
            return polyline;
        } catch (error) {
            throw error;
        }
    }



};
