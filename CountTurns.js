/*
CountTurns.js

Counts up the number of each kind of turn (right, straight, left, u-turn) for a series of cars passing through an intersection.

Argumens: The path to a file containing an unsorted JSON array of objects in the following format:
[{
    "region": 1-8, representing the east, north, west, south entrance lane, and then east, north, west, south exit lane respectively,
    "time": unix timestamp of the event
    "vehicle": vehicle identifier
  },
  ...
]

Assumptions: Appearances of a vehicle in an exit lane before it has appeared in an entrance lane can be ignored, as will appearances in a second entrance lane while it's still in the intersection.

*/

// In Node.js, the actual command line arguments start at index=2 in process.argv.
// 0 is node, 1 is the file path for the script.
const FIRST_ARGUMENT = 2

// The number of lanes in the intersection. Also, a region > NUM_LANES is an exit, <= is an entrance
const NUM_LANES = 4;

// These constants represent the index of each of the four kinds of turns in our totalTurns data structure.
const U_TURN = 0;
const LEFT_TURN = 1;
const STRAIGHT = 2;
const RIGHT_TURN = 3;

// Load modules to access to the file system, and the data structures we are using
var fs = require('fs')
var RBTree = require('bintrees').RBTree;

//Raw data read from the JSON
var rawData = {}

// Data sorted by timestamp. Use a Red-Black Tree for fast sorted insertion and ordered walk through
var sortedData = new RBTree(function (a, b) {return a.time - b.time})

// A table of events containing vehicles that have entered the intersection, but not yet left it
var inProgressTurns = {}

//The total number of each type of turn
var totalTurns = new Map();

// Initialize our total turn counter
totalTurns.set(U_TURN, 0);		// U-Turns
totalTurns.set(LEFT_TURN, 0);	// Left Turns
totalTurns.set(STRAIGHT, 0);	// Straight
totalTurns.set(RIGHT_TURN, 0);	// Right turns


/******************
	Start
*******************/

// Ensure the path for the data file was included as the first argument
if (process.argv[FIRST_ARGUMENT] == null) {
	console.error("Error: Please provide the location of a file containing the traffic data in JSON format. For example:\n" +
		"    node CountTurns.js data.json")
	return;
}

fs.readFile(process.argv[FIRST_ARGUMENT], processData)

// Handles the results of readFile, parsing the JSON and counting the turns
function processData(error, data) {
	// Ensure the file exists, we have read access, etc..
	if (error) {
		console.error(error);
		return;
	}
	
	// Parse the JSON
	try {
		rawData = JSON.parse(data);
	} catch (error) {
		console.error("Error: '" + process.argv[FIRST_ARGUMENT] + "' does not appear to contain valid JSON.")
		return;
	}

	// Sort our raw data by timestamp
	for (item in rawData) {
		event = rawData[item]
		sortedData.insert(event)
	}
	
	sortedData.each(checkTurnProgress)
	
	// Output results as a concatonated string in this format: "LeftRightStraightUturn"
	console.log(totalTurns.get(LEFT_TURN) + "" + totalTurns.get(STRAIGHT) + "" + totalTurns.get(RIGHT_TURN) + "" + totalTurns.get(U_TURN))
	
	// Vehicles still in intersection, if you want them:
	//console.log("Vehicles still in intersection: ");
	//console.log(Object.keys(inProgressTurns));
}

// Check an event to see if a vehicle is entering the intersection or leaving it. If it's leaving, count the kind of turn
function checkTurnProgress(event) {
		key = event.vehicle;
		// If the vehicle is in the intersection, count the turn
		if (inProgressTurns[key]) {
			if (event.region <= NUM_LANES) {
				console.log("Warning: Vehicle " + key + " entered intersection again before exiting it.");
				return;
			}
			countTurn(inProgressTurns[key].region, event.region, key);
			delete inProgressTurns[key];
		// If not, store the car as in the intersection for when it leaves	
		} else {
			if (event.region > NUM_LANES) {
				console.log("Warning: Vehicle " + key + " exited intersection before having entered it.");
				return;
			}
			inProgressTurns[key] = event;
		}
}

// Calculate what kind of turn a vehicle made
// If you subtract the value of the entrance region from the exit region, mod the number of lanes at the intersection (4)
// you will get 0 for a u-turn, 1 for right, 2 for straight, or 3 for left, which corrisponds to where we store it in totalTurns.
function countTurn(entranceRegion, exitRegion, vehicle) {
	turn = (exitRegion - entranceRegion) % NUM_LANES;
	totalTurns.set(turn, totalTurns.get(turn) + 1)
}