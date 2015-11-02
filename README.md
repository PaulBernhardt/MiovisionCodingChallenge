# MiovisionCodingChallenge
A repo that solves the [Miovision Coding challenge](http://coding-challenge.miovision.com/), which is, in brief:

When given a list of vehicles entering and leaving an intersection and in what lane, calculate the total number of each left turn, straight, right turn, and u-turn events and output them to the command line.

Instructions:

1. Install [Node.js](https://nodejs.org/en/) (Tested with v5.0.0 Stable)
2. Clone this repo to your desktop, or download it as a zip file and extract it. You need CountTurn.js and the included Node modules.
3. Open a command line to the directory the project is in and run
```
node CountTurns.js data.json
```

The application will output the answer in the console.

Note: The data.json set includes a vehicle (a51b612f) that enters, exits, and then enters again but never leaves. There are no other vehicles that get "stranded" in the intersection.

