{Firebase} = require 'firebase/app'

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

demoDB = new Firebase
	projectID: "framer-demo"                           # ... Database → first part of URL
	secret: "K2ZJjo4RXG5nlHEWgjgwBzNkeVJCz9YZAQF8dk9g" # ... Project Settings → Database → Database Secrets
	server: "s-usc1c-nss-110.firebaseio.com"           # Get this info by setting `server: undefined´ first

slider = new SliderComponent
slider.center()

slider.knob.backgroundColor = "grey"
slider.knob.draggable.momentum = false


# Events + Firebase --------------------

slider.knob.onDragEnd ->
	demoDB.put("/sliderValue",slider.value) # `put´ writes data to Firebase,
											 # see http://bit.ly/firebasePut

demoDB.onChange "/sliderValue", (value) -> # Retreives data onLoad and when it was changed
											# see http://bit.ly/firebaseOnChange
	slider.animateToValue(value) unless slider.knob.isDragging
