{FirebaseFramer} = require 'firebaseframer'
{Input} = require "inputfield"

WIDTH = Framer.Screen.width
HEIGHT = Framer.Screen.height

lineHeight = 30

Framer.Defaults.Animation =
  curve: 'spring(150, 10, 0)'

demoDB = new FirebaseFramer
	projectID: "framer-sketch-firebase-test" # ... Database → first part of URL
	secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I" # ... Project Settings → Database → Database Secrets
	server: "s-usc1c-nss-134.firebaseio.com" # Get this info by setting `server: undefined´ first

bg = new BackgroundLayer
    backgroundColor: "#fafafa"

footer = new Layer
    x : 0
    y : Canvas.height - 230
    width: Canvas.width
    height: 230
    backgroundColor: "#999"

stream = new Layer
    x: 0
    y: 0
    width: Canvas.width
    height: Canvas.height - 230
    backgroundColor: "transparent"

# circle = new Layer
#   x: WIDTH / 2
#   y: HEIGHT / 2
#   image: 'images/circle.png'
#
# circle.on Events.Click, ->
#   bounce = new Animation
#     layer: circle
#     properties:
#       x: WIDTH * Math.random()
#       y: HEIGHT * Math.random()
#
#   bounce.start()

#input

button = new Layer
    x: 620
    y: Canvas.height - 200
    width: 50
    height: 50
    image: "images/button.png"

button.onMouseDown ->
    button.image = "images/button-down.png"

field = new Layer
    x: 100
    y: Canvas.height - 200
    width: 520
    height: 50
    image: "images/field.png"

textfield = new Input
    setup: false
    type: "text"
    x: 100
    y: Canvas.height - 200
    width: 500
    height: 30

textfield.style =
    fontSize: "14px"
    color: "#333"
    fontFamily: "Helvetica"
    padding: "10px 10px 10px 20px"

# Events + FirebaseFramer --------------------

demoDB.get '/messages', (messages) ->
    # print messages
    messageArray = _.toArray(messages)
    # print message for message in messageArray
    i = 1
    h = lineHeight
    # Get messages on load
    for message in messageArray by -1
        # print message.name + ": " + message.text
        line = new TextLayer
            x: 120
            textAlign: "left"
            y: Canvas.height - 250 - h * i
            text: message.text
            color: "#333"
            font: "14px/1.5 Helvetica"
        line.parent = stream
        i++

post = ->
    if textfield.value.length
        demoDB.post '/messages', {"text": textfield.value}
        for child in stream.children
            child.animate
                y: child.y - lineHeight
        line = new TextLayer
            x: 120
            textAlign: "left"
            y: Canvas.height - 250 - lineHeight
            text: textfield.value
            color: "#333"
            font: "14px/1.5 Helvetica"
        line.parent = stream


button.onMouseUp ->
    button.image = "images/button.png"
    post()

# document.addEventListener 'keyup', (event) ->
#   keyCode = event.which
#   if keyCode === 13
#       post()
