# Sketch Slicer for Framer.js

A gulpfile + Framer module to create an automated workflow for Sketch.app -> Framer respecting Slices, Groups, and Artboards

Any changes made to `*.coffee` or `*.sketch` in `/src` will auto-magically update the Framer prototype. The gulpfile also includes a simple task to deploy and update the prototype as a static site to Github Pages (perfect for client-share). Simply uncomment the extra `watch` call at the top the Gulpfile to activate.

It's faster than Framer Generator, keeps our assets in sync, and fully capitalizes on advanced layout features in Sketch (e.g. responsive design)

*Inspired by Darrin Henein's gulpfile for Sketch -> Framer*  
https://github.com/darrinhenein/framer-sketch-boilerplate

### Requirements

* node
* Sketch.app
* sketchtool CLI
* findModule  
https://github.com/awt2542/Find-for-Framer

### Optional

* AnimaApp Auto-Layout plugin for Sketch

### Installation

1. Install sketchtool CLI
    * via [Bohemian Coding's site](http://www.sketchapp.com/tool/)
    * via [brew](http://brew.sh/):
      1. Make sure you have Homebrew version `0.9.5` or higher. You can check with `$ brew --version`.
      2. If you don't have [Homebrew Cask](http://caskroom.io/), run `brew tap caskroom/cask`
      3. Install sketch-tool with `brew cask install sketch-tool`
2. Run `$ npm install`
3. Download and add findModule to the "modules" folder of your Framer project

### Basic Usage

1. Run `$ gulp`
2. Work on and save either `app.coffee` or `assets.sketch` in the `src` folder.
4. Mark any atomic-level elements inside sketch as Slices (e.g. buttons, fields). Everything is positioned relatively based on hierarchy, from Page down through groups. See the sample Sketch file.
4. Naming a page **"canvas"** will ensure that it actively follows the Canvas element dimensions in Framer and will push those changes to descendants. This is key for supporting responsive layouts.

### Extra-Credit: AnimaApp Auto-Layout

While not required, the AnimaApp Auto-Layout plugin for Sketch will enable you to maximize the potential of this workflow:
* Position and size your Framer elements by percentages
* Maintain Align.top/bottom/etc.
* Add offset values for any Auto-Layout property.

### To Do

* Support for multiple Sketch Pages
* Add ad hoc text styles
* True Flexbox layout in Framer
