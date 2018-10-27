require("dotenv").config();

var keys = require("./keys.js");
var fs= require("fs");
var request = require("request");
var Spotify = require('node-spotify-api');
var moment = require("moment");

var spotify = new Spotify(keys.spotify);
var bit = keys.bit.id;
var omdb = keys.omdb.id;
var logged =[];

function concertThis(artist,callback) {

    
    var bitURL = "https://rest.bandsintown.com/artists/"+artist+"/events?app_id="+bit;
    
    var datetime;

    
    request(bitURL, function(error, response, body) {

        
        if (!error && response.statusCode === 200) {
        
            
            var data = JSON.parse(body);
            
            for (let i=0;i<body.length;i++) {

               
                if(data[i] != undefined) {
                    console.log("\nVenue: "+data[i].venue.name);
                    if(data[i].venue.city != '')
                        console.log("\nCity: "+data[i].venue.city);
                    if(data[i].venue.region != '')
                        console.log("\nRegion: "+data[i].venue.region);
                    if(data[i].venue.country != '')
                        console.log("\nCountry: "+data[i].venue.country);
                    datetime = moment(data[i].datetime,"YYYY-MM-DDtHH:mm:ss").format("MM/DD/YYYY");
                    console.log("\nDate: "+datetime+"\n");
                    
                    logged.push(...[data[i].venue.name,data[i].venue.city,data[i].venue.region,data[i].venue.country,datetime]);
                }
                if(data[i] === undefined && i===0) {
                    console.log("\nSorry we don't see any concerts. :(")
                    logged.push("Sorry we don't see any concerts. :(");
                }
            }
        }
        callback();
    });
    
}


function spotifyThisSong(song,callback) {
       
   
    if(song == undefined) 
        song="\"The+Sign\"%20NOT%20times";
    else
        song= "\""+song+"\"";   
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        console.log("\nArtist(s):");
        for(let i=0; i <data.tracks.items[0].artists.length;i++) {
            console.log(data.tracks.items[0].artists[i].name);
            logged.push(data.tracks.items[0].artists[i].name);
        }
        console.log("\nSong Name:")
        console.log(data.tracks.items[0].name+"\n");
        console.log("Preview Link:")
        console.log(data.tracks.items[0].preview_url+"\n");
        console.log("Song Album:")
        console.log(data.tracks.items[0].album.name);
        logged.push(...[data.tracks.items[0].name,data.tracks.items[0].preview_url,data.tracks.items[0].album.name]);
        callback();
    });
    
}

function movieThis(title,callback) {
    if (!title) 
        title = "Mr. Nobody";
    var omdbURL = "http://www.omdbapi.com/?t="+"\""+title+"\""+"&y=&plot=short&type=movie&tomatoes=true&apikey="+omdb;
  

    request(omdbURL, function(error, response, body) {

        if (!error && response.statusCode === 200) {
    
            var parsed= JSON.parse(body);
            
            console.log("\nMovie Title: "+ parsed.Title);
            console.log("\nYear Released: "+ parsed.Year);
            console.log("\nIMDB Rating: "+ parsed.Ratings[0].Value);
            console.log("\nRotten Tomatoes Rating: "+parsed.Ratings[1].Value);
            console.log("\nCountry Produced: "+parsed.Country );
            console.log("\nMovie Language(s): "+parsed.Language);
            console.log("\nMovie plot: "+parsed.Plot);
            console.log("\nMovie Actors: "+parsed.Actors);
        }
        logged.push(...[parsed.Title,parsed.Year,parsed.Ratings[0].Value,parsed.Ratings[1].Value,parsed.Country,parsed.Language,parsed.Plot,parsed.Actors]);
        

        callback();
    });
   
}


function doWhatItSays() {

    fs.readFile("random.txt","utf8",function(error,data){

    if (error) {
        return console.log(error);
    }

   
    var parsed = data.split(",");

    
    selectCommand(parsed[0],parsed[1]);

    });

}



function logger() {
    
    logged.push('');
    
    fs.appendFile("log.txt",logged,function (err) {

        if (err) {
            return console.log(error);
        }
        console.log('\ncommand logged.')

    });
}

function selectCommand(command,userArg) {
    
    logged.push(command)
    if(userArg)
        logged.push(userArg);
    
    switch(command){
        case "concert-this":
        concertThis(userArg,function(){
            logger();
        });
        break;
        case "spotify-this-song":
        spotifyThisSong(userArg,function(){
            logger();
        });
        break;
        case "movie-this":
        movieThis(userArg,function() {
           
            logger();
        });
        break;
        case "do-what-it-says":
        doWhatItSays();
        break;
        default:
        console.log("Invalid command. Please try again.");
        break;
    }
    
}

var command = process.argv[2];
var userArg = process.argv[3];

selectCommand(command,userArg);