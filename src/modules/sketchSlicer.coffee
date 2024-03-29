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

class SketchTextLayer extends TextLayer
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
        @id
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
        @id = @options.id
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
    colorConverter = (val) =>
        convert = (x) =>
            x *= 255
            return x
        # print val.split("rgba(").join("").split(")").join("").split(",")
        split = val.split("rgba(").join("").split(")").join("").split(",")
        new_val = []
        new_val.push(convert(v)) for v in split
        new_val.join(",")
        return "rgba(" + new_val + ")"
    align = (n) =>
        alignment = null
        switch n
            when 0
                # left
                alignment = "left"
            when 1
                # right
                alignment = "right"
            when 2
                # center
                alignment = "center"
            when 3
                # justified
                alignment = "justified"
            else break
        return alignment
    transform = (n) =>
        x = null
        switch n
            when 0
                break
            when 1
                x = "uppercase"
            when 2
                x = "lowercase"
            else break
        return x
    decoration = (m, n) =>
        x = null
        if m then x = "line-through"
        if n then x = "underline"
        return x
    layerTextStyles = _assets.layerTextStyles?.objects
    if layerTextStyles?
        for style in layerTextStyles
            text_styles[style.name] = new TextStyle
                name: style.name
                id: style.objectID
                color: colorConverter(style.value.textStyle.NSColor.color)
                fontSize: style.value.textStyle.NSFont.attributes.NSFontSizeAttribute
                fontFamily: style.value.textStyle.NSFont.family
                fontStyle: style.value.textStyle.NSFont.name.split(" ")[style.value.textStyle.NSFont.name.split(" ").length - 1].toLowerCase()
                lineHeight: style.value.textStyle.NSParagraphStyle.style.minimumLineHeight / style.value.textStyle.NSFont.attributes.NSFontSizeAttribute
                letterSpacing: style.value.textStyle.NSKern
                textAlign: align(style.value.textStyle.NSParagraphStyle.style.alignment)
                textTransform: transform(style.value.textStyle.MSAttributedStringTextTransformAttribute)
                textDecoration: decoration(style.value.textStyle.NSStrikethrough, style.value.textStyle.NSUnderline)
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

# traversing a nested json object for first matching kvp
getObject = (object, key, value) ->
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

# finding all matches for key value pairs, not just first match
findObjects = (object, key, value, finalResults) ->
    finalResults = {}
    getAllMatches = (theObject) ->
        result = null
        if theObject instanceof Array
            i = 0
            while i < theObject.length
                getAllMatches theObject[i]
                i++
        else
            for prop of theObject
                if theObject.hasOwnProperty(prop)
                    if prop == key
                        if theObject[prop] == value
                            finalResults[theObject.name] = theObject
                    if theObject[prop] instanceof Object || theObject[prop] instanceof Array
                        getAllMatches theObject[prop]
        return
    getAllMatches object
    return finalResults

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
                multiplier_top = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_top = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.y = Align.top(container.height * multiplier_top + constant_top)
                container.on "change:height", ->
                    s.y = Align.top(container.height * multiplier_top + constant_top)

            when "bottom"
                multiplier_bottom = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_bottom = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.y = Align.bottom(container.height * multiplier_bottom - constant_bottom)
                container.on "change:height", ->
                    s.y = Align.bottom(container.height * multiplier_bottom - constant_bottom)
            when "left"
                multiplier_left = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_left = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.x = Align.left(container.width * multiplier_left + constant_left)
                container.on "change:width", ->
                    s.x = Align.left(container.width * multiplier_left + constant_left)
            when "right"
                multiplier_right = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_right = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.x = Align.right(container.width * multiplier_right - constant_right)
                container.on "change:width", ->
                    s.x = Align.right(container.width * multiplier_right - constant_right)
            when "width"
                multiplier_width = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_width = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.width = (container.width * multiplier_width + constant_width)
                container.on "change:width", ->
                    s.width = (container.width * multiplier_width + constant_width)
            when "height"
                multiplier_height = if s.constraints[c].multiplier? then s.constraints[c].multiplier else 0
                constant_height = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.height = (container.height * multiplier_height + constant_height)
                container.on "change:height", ->
                    s.height = (container.height * multiplier_height + constant_height)
            when "centerHorizontally"
                constant_horz = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.x = Align.center(constant_horz)
                container.on "change:width", ->
                    s.x = Align.center(constant_horz)
            when "centerVertically"
                constant_vert = if s.constraints[c].constant? then s.constraints[c].constant else 0
                s.y = Align.center(constant_vert)
                container.on "change:height", ->
                    s.y = Align.center(constant_vert)
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
    # get all Shared Text Styles in case we need to apply to dynamic text elements created only in Framer, not in Sketch
    getTextStyles()

exports.sketchSlicer = ->

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

    slices["canvas"].size = Canvas.size
    slices["canvas"].x = 0
    slices["canvas"].y = 0
    Canvas.on "change:size", ->
        slices["canvas"].size = Canvas.size
    for child in slices["canvas"].children
        child.size = slices["canvas"].size
        child.x = slices["canvas"].x
        child.y = slices["canvas"].y
        slices["canvas"].on "change:size", ->
            child.size = slices["canvas"].size

    getConstraints(slices[slice]) for slice of slices

    return slices

exports.sketchTextLayers = ->
    # get all the text layers created in Sketch
    text_layers = findObjects _assets, "<class>", "MSTextLayer"
    # get all the Text Styles, remember text_styles is already initialized globally
    getTextStyles()

    for text of text_layers
        # find correct text style
        my_style = getObject text_styles, "id", text_layers[text].style.sharedObjectID
        # correlate with _layers to get relative position
        t_rel = getObject _layers, "id", text_layers[text].objectID
        # check if we found my_style, otherwise we have to hand jam!
        if my_style?
            text_layers[text] = new SketchTextLayer
                name: text_layers[text].name
                sketch_id: text_layers[text].objectID
                x: t_rel.relative.x
                y: t_rel.relative.y
                width: t_rel.relative.width
                height: t_rel.relative.height
                textAlign: my_style.textAlign
                text: text_layers[text].attributedString.value.text
                color: my_style.color
                fontSize: my_style.fontSize
                fontFamily: my_style.fontFamily
                fontStyle: my_style.fontStyle
                lineHeight: my_style.lineHeight
                letterSpacing: my_style.letterSpacing
                textTransform: my_style.textTransform
                textDecoration: my_style.textDecoration
        # TODO: ADD TEXT_LAYER INIT W/ NO TEXT STYLE
        # getParents
        # getConstraints
    getParents(_layers, text_layers)
    getConstraints(text_layers[text]) for text of text_layers

    return text_layers
