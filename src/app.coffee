# ======= CHAT APP ========
s = require 'sketchSlicer'
{FirebaseFramer} = require 'firebaseframer'
{Input} = require "inputfield"

slices = s.sketchSlicer()
textStyles = s.textStyles()
# print textStyles[style].lineHeight for style of textStyles

lineHeight = 30

Framer.Defaults.Animation =
  curve: 'spring(150, 10, 0)'

demoDB = new FirebaseFramer
	projectID: "framer-sketch-firebase-test" # ... Database → first part of URL
	secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I" # ... Project Settings → Database → Database Secrets
	server: "s-usc1c-nss-134.firebaseio.com" # Get this info by setting `server: undefined´ first

bg = new BackgroundLayer
    backgroundColor: "#fafafa"

#input

slices["button"].onMouseDown ->
    slices["button"].image = "images/button-down.png"

textfield = new Input
    parent: slices["field"]
    setup: false
    type: "text"
    width: slices["field"].width
    height: slices["field"].height

textfield.style =
    fontSize: "14px"
    color: textStyles.chat_message.color
    fontFamily: "Helvetica"
    padding: "0px 0px 0px 20px"

# Events + FirebaseFramer --------------------

post = ->
    if textfield.value.length
        demoDB.post '/messages', {"text": textfield.value}

demoDB.onChange "/messages", (message) ->
    for child in slices["chat_window"].children
        child.animate
            y: child.y - lineHeight
    messageArray = _.toArray(message)
    # print message for message in messageArray
    i = 1
    h = lineHeight
    # Get messages on load
    for m in messageArray by -1
        t = m.text ? m
        line = new TextLayer
            x: 0
            textAlign: "left"
            y: slices["chat_window"].height - h * i
            text: t
            color: textStyles.chat_message.color
            fontSize: textStyles.chat_message.fontSize
            fontFamily: textStyles.chat_message.fontFamily
            fontStyle: textStyles.chat_message.fontStyle
            lineHeight: textStyles.chat_message.lineHeight
            letterSpacing: textStyles.chat_message.letterSpacing
        line.parent = slices.chat_window
        i++

slices["button"].onMouseUp ->
    slices["button"].image = "images/button.png"
    post()
    textfield.value = ""

document.addEventListener 'keypress', (event) ->
    if event.keyCode == 13
        event.preventDefault()
        post()
        textfield.value = ""
