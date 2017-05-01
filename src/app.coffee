{FirebaseFramer} = require 'firebaseframer'

WIDTH = Framer.Screen.width
HEIGHT = Framer.Screen.height

Framer.Defaults.Animation =
  curve: 'spring(150, 10, 0)'

circle = new Layer
  x: WIDTH / 2
  y: HEIGHT / 2
  image: 'images/circle.png'

circle.on Events.Click, ->
  bounce = new Animation
    layer: circle
    properties:
      x: WIDTH * Math.random()
      y: HEIGHT * Math.random()

  bounce.start()

demoDB = new FirebaseFramer
	projectID: "framer-sketch-firebase-test" # ... Database → first part of URL
	secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I" # ... Project Settings → Database → Database Secrets
	server: "s-usc1c-nss-134.firebaseio.com" # Get this info by setting `server: undefined´ first

# slider = new SliderComponent
# slider.center()
#
# slider.knob.backgroundColor = "grey"
# slider.knob.draggable.momentum = false


# Events + FirebaseFramer --------------------

demoDB.get '/messages', (messages) ->
    # print messages
    messageArray = _.toArray(messages)
    # print message for message in messageArray
    h = 30
    i = 1
    for message in messageArray
        # print message.name + ": " + message.text
        line = new TextLayer
            x: 50
            textAlign: "left"
            y: h * i
            text: message.name + ": " + message.text
            color: "#d0d0d0"
            font: "14px/1.5 Helvetica"
        i++
#Text to load chats into

# slider.knob.onDragEnd ->
# 	demoDB.put("/sliderValue",slider.value) # `put´ writes data to FirebaseFramer,
# 											 # see http://bit.ly/FirebasePut
#
# demoDB.onChange "/sliderValue", (value) -> # Retreives data onLoad and when it was changed
# 											# see http://bit.ly/FirebaseOnChange
# 	slider.animateToValue(value) unless slider.knob.isDragging
