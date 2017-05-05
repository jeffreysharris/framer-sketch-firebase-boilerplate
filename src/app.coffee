{FirebaseFramer} = require 'firebaseframer'
{Input} = require "inputfield"
{ƒ,ƒƒ} = require 'findModule'

# We get Slices from slices.json
# We get Anima data from assets.json (dump)
# We get hierarchy from layers.json
_slices = Utils.domLoadJSONSync "slices.json"
_assets = Utils.domLoadJSONSync "assets.json"
_layers = Utils.domLoadJSONSync "layers.json"

# TODO: INCLUDE PROMISE FOR JSON LOAD

makeLayerFromParent = (item) ->
    # print item.name
    layer = null
    # check if it's already a Layer
    if item.name?
        matches = ƒƒ(item.name)
    else
        return layer
    # see if there's more than one
    switch matches.length
        when 0
        # no matches found
            slices[item.name] = new Slice
                name: item.name
                x: item.relative?.x ? 0
                y: item.relative?.y ? 0
                width: item.relative?.width ? Canvas.width
                height: item.relative?.height ? Canvas.height
                sketch_id: item.id
            layer = slices[item.name]
        when 1
            # print matches[0].name
        # 1 match found
            layer = matches[0]
    return layer

# traversing a nested json object for matching value
getObject = (object, key, value) ->
    result = null
    if object instanceof Array
        i = 0
        while i < object.length
          result = getObject(object[i], key, value)
          if result
            break
          i++
    else
        for prop of object
            if prop == key
                if !value
                    return object
                if object[prop] == value
                    return object
            if object[prop] instanceof Object || object[prop] instanceof Array
                result = getObject(object[prop], key, value)
                if result
                    break
    return result

getParents = (object, list) ->
    # take an object of slices and search for them in each _layers.x.layers array, assign as parents
    for prop of object
        # does this have the layers array?
        if object[prop].hasOwnProperty("layers")
            # go through layers
            layers = object[prop].layers
            # we know layers is an array from the json
            for layer in layers
                # compare to slices
                for slice of list
                    if layer.id == list[slice].sketch_id
                        # parent layer accordingly
                        parent = makeLayerFromParent(object[prop])
                        if parent?
                            list[slice].parent = parent
                            parent_slice_list = {"#{parent.name}" : slices[parent.name]}
                            # print parent_slice_list
                            getParents(_layers, parent_slice_list)
                # head down the descendant chain for each layer
                getParents(layers, list)
        # if not, check children
        else getParents(object[prop], list)

# prepare list of slices
slices = {}
# prepare list of groups
groups = {}
# prepare list of slice ids
slice_ids = []

class Slice extends Layer
    constructor: (@options={}) ->
        @options.sketch_id ?= 111
        super(@options)
        @sketch_id = @options.sketch_id

# catalog each slice, but don't position yet
for slice in _slices.pages[0].slices
    slices[slice.name] = new Slice
        name: slice.name
        image: "images/" + slice.name + ".png"
        sketch_id: slice.id
        x: slice.relative.x
        y: slice.relative.y
        width: slice.relative.width
        height: slice.relative.height
    slice_ids.push(slice.id)

# now go through catalog and determine hierarchy and positioning based on groups
getParents(_layers, slices)

for slice of slices
    # print slices[slice].name + ":"
    # print slices[slice].parent
    # find slice in assets to collect anima data
    asset = getObject(_assets, "objectID", slices[slice].sketch_id)

    # if not, set parent to "Screen"
    container = slices[slice].parent ? Canvas
    # check for anima data i.e. kModelPropertiesKey
    anima = asset?.userInfo?["com.animaapp.stc-sketch-plugin"]

    # check for constraints
    constraints = anima?.kModelPropertiesKey?.constraints
    if constraints
        # cycle through contraints and match to flexbox properties
        for constraint of constraints
            constant = constraint.constant ? 0
            # anima -> Framer translation
            switch constraint
                when "top" then slices[slice].y = Align.top(constant)
                when "bottom" then slices[slice].y = Align.bottom(constant)
                when "left" then slices[slice].x = Align.left(constant)
                when "right" then slices[slice].x = Align.right(constant)
                when "width" then slices[slice].width = container.width - constant
                when "height" then slices[slice].height = container.height - constant
                when "centerHorizontally" then slices[slice].x = Align.center(constant)
                when "centerVertically" then slices[slice].y = Align.center(constant)
                else break

        # Set everything else to relative values from slices

# ====== FLEXBOX =======

    # if a stacked group parent object i.e. kViewTypeKey
    if anima?.kViewTypeKey

        # make this layer a Flexbox container, etc.

        # run getObject and find children from this object's layers property
            # assign each as a flexbox child

        break



# ======= REST OF FILE TO UNCOMMENT AFTER TEST ========
# WIDTH = Framer.Screen.width
# HEIGHT = Framer.Screen.height
#
# lineHeight = 30
#
# Framer.Defaults.Animation =
#   curve: 'spring(150, 10, 0)'
#
# demoDB = new FirebaseFramer
# 	projectID: "framer-sketch-firebase-test" # ... Database → first part of URL
# 	secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I" # ... Project Settings → Database → Database Secrets
# 	server: "s-usc1c-nss-134.firebaseio.com" # Get this info by setting `server: undefined´ first
#
# bg = new BackgroundLayer
#     backgroundColor: "#fafafa"
#
# #input
#
# slices.button.onMouseDown ->
#     slices.button.image = "images/button-down.png"
#
# textfield = new Input
#     setup: false
#     type: "text"
#     x: slices.field.x
#     y: slices.field.y
#     width: slices.field.width
#     height: slices.field.height
#
# textfield.style =
#     fontSize: "14px"
#     color: "#333"
#     fontFamily: "Helvetica"
#     padding: "0px 0px 0px 20px"
#
# # Events + FirebaseFramer --------------------
#
# post = ->
#     if textfield.value.length
#         demoDB.post '/messages', {"text": textfield.value}
#
# demoDB.onChange "/messages", (message) ->
#     for child in slices.chat_window.children
#         child.animate
#             y: child.y - lineHeight
#     messageArray = _.toArray(message)
#     # print message for message in messageArray
#     i = 1
#     h = lineHeight
#     # Get messages on load
#     for m in messageArray by -1
#         t = m.text ? m
#         line = new TextLayer
#             x: 0
#             textAlign: "left"
#             y: slices.chat_window.height - h * i
#             text: t
#             color: "#333"
#             font: "14px/1.5 Helvetica"
#         line.parent = slices.chat_window
#         i++
#
# slices.button.onMouseUp ->
#     slices.button.image = "images/button.png"
#     post()
#     textfield.value = ""
#
# document.addEventListener 'keypress', (event) ->
#     if event.keyCode == 13
#         event.preventDefault()
#         post()
#         textfield.value = ""
