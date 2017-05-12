# ======= CHAT APP ========
s = require 'sketchSlicer'
{FirebaseFramer} = require 'firebaseframer'
{Input} = require "inputfield"
words = require "words"

textStyles = s.textStyles()
slices = s.sketchSlicer()
text = s.sketchTextLayers()
# print textStyles.chat_message.id

lineHeight = 30

Framer.Defaults.Animation =
  curve: 'spring(150, 10, 0)'

demoDB = new FirebaseFramer
	projectID: "framer-sketch-firebase-test" # ... Database → first part of URL
	secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I" # ... Project Settings → Database → Database Secrets
	server: "s-usc1c-nss-134.firebaseio.com" # Get this info by setting `server: undefined´ first

bg = new BackgroundLayer
    backgroundColor: "#fafafa"

messageLayers = []

# my unique username
username = words.adjectives[Math.floor Math.random() * words.adjectives.length] + " " + words.nouns[Math.floor Math.random() * words.nouns.length]

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
    fontSize: textStyles.chat_message.fontSize + "px"
    color: textStyles.chat_message.color
    fontFamily: textStyles.chat_message.fontFamily
    padding: "0px 0px 0px 20px"

text.clear_text.onClick ->
    demoDB.delete "/messages"
    layer.destroy() for layer in messageLayers

# Events + FirebaseFramer --------------------

post = ->
    if textfield.value.length
        demoDB.post '/messages', {"username": username, "text": textfield.value}

demoDB.onChange "/messages", (message) ->
    messageArray = []
    for m of message
        if message[m].username?
            messageArray = _.toArray(message)
        else
            messageArray = [message]
    i = 0
    lh = text.chat_message.lineHeight * text.chat_message.fontSize
    # Get messages on load
    for m in messageArray by -1
        # print m
        line = text.chat_message.copy()
        line.text = m.username + " : " + m.text
        line.y = text.chat_message.y - lh * i
        line.parent = slices.chat_window
        line.visible = true
        i++
        messageLayers.push line
    for child in slices["chat_window"].children
        child.animate
            y: child.y - lh

slices["button"].onMouseUp ->
    slices["button"].image = "images/button.png"
    post()
    textfield.value = ""

document.addEventListener 'keypress', (event) ->
    if event.keyCode == 13
        event.preventDefault()
        post()
        textfield.value = ""

# hide our placeholder TextLayer from Sketch
text.chat_message.visible = false
