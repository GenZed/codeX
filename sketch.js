let myFont
let displayText = "click to begin";
let video; // for video canvas
//data structure
let lines = []; // for cut up generator
let markovChain = {}; // for markov text generator


function preload() {
  //loadStrings() breaks your text on new line character
  lines = loadStrings("sontagsilence.txt"); //text to be loaded in
  myFont = loadFont('Cabin-Medium.ttf'); // open licence font, close in feel to Johnston
  video = createVideo(['WESTtx_web.mp4']) //video to be loaded in (480p web copy of WESTtx.mp4)
  video.hide(); // hide video canvas
}

function setup() {
  createCanvas(500, 500);

  // use the TFL font if a local copy is present. It's not in the repo because
  //it can't be redistributed. Loaded here rather than in preload() because a
  //missing font in preload() stops the sketch from ever starting
  loadFont('Johnston100 W03 Medium.ttf', (f) => myFont = f, () => {});

  generateMarkovModel();
}

function draw() {
  background(0); // clear the last frame so the text doesn't smear before the video plays

  // draw video to canvas as background for text, scaled and cropped from the
  //centre so it fills the square canvas
  let vw = video.elt.videoWidth;
  let vh = video.elt.videoHeight;
  if (vw > 0 && vh > 0) {
    let side = min(vw, vh);
    image(video, 0, 0, width, height, (vw - side) / 2, (vh - side) / 2, side, side);
  }
  
  
  // text styling - re-size, place within canvas, color
  push();
  textFont(myFont);
  let fontSize = map(displayText.length,0,160,30,40,true);
  textSize(fontSize);
  textWrap(WORD);
  textAlign(CENTER);
  fill('yellow');
  text(displayText,50, height/2-120, 400);
  
  pop();

  
}

function mousePressed(){

  //generate markov text
  let keys = getMarkovKeys();
  let randomIndex = int(random(0,keys.length));
  let randomStartWord = keys[randomIndex];
  displayText = generateMarkovText(randomStartWord,6); // start word + 6 = seven words
  
  video.loop(); // loop video when initial click takes place

}


// Generate some text 
function generateMarkovText(startWord,numWords) {
    
  //choose a beginning
  let output = startWord;//we are going to keep adding to this
  let current = startWord;

  // Generate a new token max number of times
  for (let i = 0; i < numWords; i++) {
    
    if (markovChain.hasOwnProperty(current)) {

      // What are all the possible next tokens for the current word?
      let possibleNexts = markovChain[current];

      let next;
      // Pick one randomly out of the "bucket" of all choices if no possibl nexts 
      if(possibleNexts.length == 0){
        possibleNexts = getMarkovKeys();
      }

      let randomIndex = int(random(0,possibleNexts.length));
      next = possibleNexts[randomIndex];

      // Add to the output
      output += " " + next;
      current = next;
    }else{
      // dead end - stop here rather than looping over the same word
      break;
    }

  }
  // Here's what we have
  return output;
}


//Markov generator
function generateMarkovModel(){

  //probably good idea to empty it just in case you generated already
  clearMarkovChain();

  //join the lines back together before adding them to the Markov model.
  //the line breaks in the text fall mid-sentence, so feeding lines in one by one
  //cut the chain at the end of every line
  markovChain = addWordsToMarkov(markovChain,lines.join(" "));
    
}

//remove punctuation, trailing white space and to make it lower case
function cleanLine(line){
  // console.log("With punctuation: " + line);
 
 //regex to replace everything except letters, whitespace & '
  line = line.replace(/[^a-zA-Z ']/g,"");
 //or a regex to replace only certain punctuation characters added between []
 //this one removes \.,?!
 // line = line.replace(/[\.,?!]/g,""); 

  line = line.toLowerCase();// make all lower case
  line = line.trim(); // remove white space at front and end of sentence

  return line;

}

//function returns array of all keys / entries in object
function getMarkovKeys(){
  let keys = Object.keys(markovChain);

  return keys;
}

//easiest way to start again
//function to wipe out previous data 
function clearMarkovChain(){
  markovChain = {};
}

// function to split text 
function tokenise(text,seperator){
  let tokens = text.split(seperator);

  return tokens;
}

// A function to feed in text to the markov chain
function addWordsToMarkov(markovModel,text) {

  text = cleanLine(text);
  let words = tokenise(text," ").filter((w) => w.length > 0); //drop the empty strings left by double spaces

  // Now let's go through everything and create the dictionary
  for (let i = 0; i < words.length; i++) {
    let word = words[i].trim();//trim any whitespace in case we missed it

    // Is this a new entry / word?
    if (!markovModel.hasOwnProperty(word)) {
      markovModel[word] = [];
    }

    //check if we aren't yet on the last one before trying to grab the next to store
    if(i < words.length-1){
      let next = words[i+1];
      // Add to the list of possible next words
      markovModel[word].push(next);
    }

  }

  return markovModel;

}

