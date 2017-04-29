### Requirements

* node
* Sketch.app

### Installation

1. Install sketch-tool.
    * via [Bohemian Coding's site](http://www.sketchapp.com/tool/)
    * via [brew](http://brew.sh/):
      1. Make sure you have Homebrew version `0.9.5` or higher. You can check with `$ brew --version`.
      2. If you don't have [Homebrew Cask](http://caskroom.io/), run `brew tap caskroom/cask`
      3. Install sketch-tool with `brew cask install sketch-tool`
2. Run `$ npm install`

### Usage

1. Run `$ gulp`
2. Work on and save either `app.coffee` or `assets.sketch` in the `src` folder.


### Additions
* browserify
* firebaseFramer

### TODO
1. Add Gulp task for uploading images to cloud
    + How to change image pointers? Just hand-jam in code?
2. Setup Firebase database
3. Change Firebase credentials
4. Change demo code in app.coffee

### From Google Groups on why Firebase/storage wasn't working on Node:
"There is no firebase package at the moment, but you can still use it as a standard Google Cloud Storage bucket.

Here is how:
import gcloud from 'gcloud'; // The google cloud nodejs SDK
const gcs = gcloud.storage({
    projectId: gcsProject,
    keyFilename: gcsPrivateKey
});
const bucket = gcs.bucket(`${gcsProject}.appspot.com`);

- gscProject = firebase storage ucket less the '.appspot.com'
- gcsPrivateKey = the service account JSON file you need when accessing firebase from nodejs. You can create one in google console AIM.

Then you can use functions from the gcloud SDK which are very similar to the firebase storage module. (see the docs for the differences)"
