# =======
# This module requires findModule and the gulpfile with all dependencies installed (including sketchtool CLI)
# =======

{ƒ,ƒƒ} = require 'findModule'

# We get Slices from slices.json
# We get Anima data from assets.json (dump)
# We get hierarchy from layers.json
_slices = Utils.domLoadJSONSync "slices.json"
_assets = Utils.domLoadJSONSync "assets.json"
_layers = Utils.domLoadJSONSync "layers.json"

# prepare list of slices
slices = {}
# prepare list of groups
groups = {}
# prepare list of text styles
text_styles = {}

class Slice extends Layer
    constructor: (@options={}) ->
        @options.sketch_id ?= "111"
        @options.constraints = {
        }
        @options.flexprops = {
        }
        super(@options)
        @sketch_id = @options.sketch_id
        @constraints = @options.constraints
        @flexprops = @options.flexprops

class TextStyle
    # TODO: Add support for text shadows
    constructor: (@options={})->
        @name
        @color
        @fontSize
        @fontFamily
        @fontWeight
        @fontStyle
        @lineHeight
        @letterSpacing
        @textAlign
        @textTransform
        @textDecoration
        @name = @options.name
        @color = @options.color
        @fontSize = @options.fontSize
        @fontFamily = @options.fontFamily
        @fontWeight = @options.fontWeight
        @fontStyle = @options.fontStyle
        @lineHeight = @options.lineHeight
        @letterSpacing = @options.letterSpacing
        @textAlign = @options.textAlign
        @textTransform = @options.textTransform
        @textDecoration = @options.textDecoration

getTextStyles = ->
    colorConverter = (val) ->
        convert = (x) ->
            x *= 255
            return x
        # print val.split("rgba(").join("").split(")").join("").split(",")
        split = val.split("rgba(").join("").split(")").join("").split(",")
        new_val = []
        new_val.push(convert(v)) for v in split
        new_val.join(",")
        return "rgba(" + new_val + ")"
    layerTextStyles = _assets.layerTextStyles?.objects
    if layerTextStyles?
        for style in layerTextStyles
            color_val = colorConverter(style.value.textStyle.NSColor.color)
            text_styles[style.name] = new TextStyle
                name: style.name
                color: color_val
                fontSize: style.value.textStyle.NSFont.attributes.NSFontSizeAttribute
                fontFamily: style.value.textStyle.NSFont.family
                fontStyle: style.value.textStyle.NSFont.name.split(" ")[style.value.textStyle.NSFont.name.split(" ").length - 1].toLowerCase()
                lineHeight: style.value.textStyle.NSParagraphStyle.style.minimumLineHeight / style.value.textStyle.NSFont.attributes.NSFontSizeAttribute
                letterSpacing: style.value.textStyle.NSKern


    return text_styles

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
                backgroundColor: "transparent"
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

getConstraints = (s) ->
    # find slice in assets to collect anima data
    asset = getObject(_assets, "objectID", s.sketch_id)
    # check for anima data i.e. kModelPropertiesKey
    anima = asset?.userInfo?["com.animaapp.stc-sketch-plugin"]

# ===== RELATIVE POSITIONING IN ANIMA =======
    constraints = anima?.kModelPropertiesKey?.constraints
    if constraints?
        s.constraints = constraints
        assignConstraints(s)
        # cycle through contraints and match to flexbox properties

# ===== FLEXBOX ======
    # if a stacked group parent object i.e. kViewTypeKey
    if anima?.kViewTypeKey?
        flexprops = anima?.kModelPropertiesKey
        s.flexprops = flexprops
        assignFlexbox(s)

assignConstraints = (s) ->
    # print s.constraints
    # TODO: SUPPORT FOR WIDTH/HEIGHT MIN & MAX
    # TODO: MAKE THIS MORE ELEGANT, FUNCTIONAL INSTEAD OF KLUGY SWITCH LOGIC
    container = s.parent
    for c of s.constraints
        # AnimaApp -> Framer translation
        switch c
            when "top"
                multiplier_top = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_top = s.constraints[c].constant if s.constraints[c].constant?
                if multiplier_top?
                    s.y = Align.top(container.height * multiplier_top)
                    container.on "change:height", ->
                        s.y = Align.top(container.height * multiplier_top)
                if constant_top?
                    s.y = Align.top(constant_top)
                    container.on "change:height", ->
                        s.y = Align.top(constant_top)
            when "bottom"
                multiplier_bottom = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_bottom = s.constraints[c].constant if s.constraints[c].constant?
                if multiplier_bottom?
                    s.y = Align.bottom(container.height * multiplier_bottom)
                    container.on "change:height", ->
                        s.y = Align.bottom(container.height * multiplier_bottom)
                if constant_bottom?
                    s.y = Align.bottom(-constant_bottom)
                    container.on "change:height", ->
                        s.y = Align.bottom(-constant_bottom)
            when "left"
                multiplier_left = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_left = s.constraints[c].constant if s.constraints[c].constant?
                if multiplier_left?
                    s.x = Align.left(container.height * multiplier_left)
                    container.on "change:width", ->
                        s.x = Align.left(container.height * multiplier_left)
                if constant_left?
                    s.x = Align.left(constant_left)
                    container.on "change:width", ->
                        s.x = Align.left(constant_left)
            when "right"
                multiplier_right = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_right = s.constraints[c].constant if s.constraints[c].constant?
                if multiplier_right?
                    s.x = Align.right(container.height * multiplier_right)
                    container.on "change:width", ->
                        s.x = Align.right(container.height * multiplier_right)
                if constant_right?
                    s.x = Align.right(-constant_right)
                    container.on "change:width", ->
                        s.x = Align.right(-constant_right)
            when "width"
                multiplier_width = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_width = s.constraints[c].constant if s.constraints[c].constant?
                if constant_width
                    s.width = (constant_width)
                else
                    s.width = (container.width * multiplier_width)
                    container.on "change:width", ->
                        s.width = (container.width * multiplier_width)
            when "height"
                multiplier_height = s.constraints[c].multiplier if s.constraints[c].multiplier?
                constant_height = s.constraints[c].constant if s.constraints[c].constant?
                if constant_height
                    s.height = (constant_height)
                else
                    s.height = (container.height * multiplier_height)
                    container.on "change:height", ->
                        s.height = (container.height * multiplier_height)
            when "centerHorizontally"
                constant = s.constraints[c].constant ? 0
                s.x = Align.center(constant)
            when "centerVertically"
                constant = s.constraints[c].constant ? 0
                s.y = Align.center(constant)
            else break


# ====== REBUILD FLEXBOX IN FRAMER ======
assignFlexbox = (s) ->

# display: "flex"

# justifyContent

# flexDirection

# alignItems

# space

# ====== TAKE FLEXBOX INSTRUCTIONS FROM ANIMA =======

    # if a stacked group parent object i.e. kViewTypeKey
    # if anima?.kViewTypeKey?
    #     flexprops = anima?.kModelPropertiesKey

        # make this layer a Flexbox container, etc.
    #     setFlexBox = (props, layer) ->
    #         style = layer.style
    #         style.display = "flex"
    #         style.justifyContent = "center"
    #         switch props.type
    #             when 0
    #                 style.flexDirection = "column"
    #             when 1
    #                 style.flexDirection = "row"
    #             else break
    #         switch props.align
    #             when 0
    #                 style.alignItems = "center"
    #             when 1
    #                 style.alignItems = "stretch"
    #             when 2
    #                 style.alignItems = "flex-start"
    #             when 3
    #                 style.alignItems = "flex-end"
    #             else break
    #         for child in layer.children
    #
    #     setFlexBox(flexprops, slices[slice])

# ======= MAIN RETURN FUNCTION ======

exports.textStyles = ->
    getTextStyles()

exports.sketchSlicer = ->
    # TODO: MATCH TEXT STYLES TO LAYERS
    # get Text Styles
    # _textStyles = getTextStyles()

    # catalog each slice, but don't position yet
    # TODO: INCLUDE SUPPORT FOR MULTIPLE PAGES
    for slice in _slices.pages[0].slices
        slices[slice.name] = new Slice
            name: slice.name
            image: "images/" + slice.name + ".png"
            sketch_id: slice.id
            x: slice.relative.x
            y: slice.relative.y
            width: slice.relative.width
            height: slice.relative.height

    # now go through catalog and determine hierarchy and positioning based on groups
    getParents(_layers, slices)

    slices["canvas"].width = Canvas.width
    slices["canvas"].height = Canvas.height
    Canvas.on "change:size", ->
        slices["canvas"].size = Canvas.size
    for child in slices["canvas"].children
        child.size = slices["canvas"].size
        slices["canvas"].on "change:size", ->
            child.size = slices["canvas"].size

    getConstraints(slices[slice]) for slice of slices

    return slices
