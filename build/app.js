(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var FirebaseFramer, Input, bg, demoDB, lineHeight, post, s, slices, text, textStyles, textfield;

s = require('sketchSlicer');

FirebaseFramer = require('firebaseframer').FirebaseFramer;

Input = require("inputfield").Input;

textStyles = s.textStyles();

slices = s.sketchSlicer();

text = s.sketchTextLayers();

lineHeight = 30;

Framer.Defaults.Animation = {
  curve: 'spring(150, 10, 0)'
};

demoDB = new FirebaseFramer({
  projectID: "framer-sketch-firebase-test",
  secret: "lHwsK4ljhwUmMt3EU1ybrMPQcSDgbKhvTIwuqJ9I",
  server: "s-usc1c-nss-134.firebaseio.com"
});

bg = new BackgroundLayer({
  backgroundColor: "#fafafa"
});

slices["button"].onMouseDown(function() {
  return slices["button"].image = "images/button-down.png";
});

textfield = new Input({
  parent: slices["field"],
  setup: false,
  type: "text",
  width: slices["field"].width,
  height: slices["field"].height
});

textfield.style = {
  fontSize: "14px",
  color: textStyles.chat_message.color,
  fontFamily: "Helvetica",
  padding: "0px 0px 0px 20px"
};

post = function() {
  if (textfield.value.length) {
    return demoDB.post('/messages', {
      "text": textfield.value
    });
  }
};

demoDB.onChange("/messages", function(message) {
  var child, h, i, j, k, len, line, m, messageArray, ref, ref1, results, t;
  ref = slices["chat_window"].children;
  for (j = 0, len = ref.length; j < len; j++) {
    child = ref[j];
    child.animate({
      y: child.y - lineHeight
    });
  }
  messageArray = _.toArray(message);
  i = 1;
  h = lineHeight;
  results = [];
  for (k = messageArray.length - 1; k >= 0; k += -1) {
    m = messageArray[k];
    t = (ref1 = m.text) != null ? ref1 : m;
    line = text.chat_message.copy();
    line.text = t;
    line.y = slices.chat_window.height - text.chat_message.lineHeight * text.chat_message.fontSize * i;
    line.parent = slices.chat_window;
    results.push(i++);
  }
  return results;
});

slices["button"].onMouseUp(function() {
  slices["button"].image = "images/button.png";
  post();
  return textfield.value = "";
});

document.addEventListener('keypress', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    post();
    return textfield.value = "";
  }
});


},{"firebaseframer":3,"inputfield":4,"sketchSlicer":5}],2:[function(require,module,exports){
var _findAll, _getHierarchy, _match;

_getHierarchy = function(layer) {
  var a, i, len, ref, string;
  string = '';
  ref = layer.ancestors();
  for (i = 0, len = ref.length; i < len; i++) {
    a = ref[i];
    string = a.name + '>' + string;
  }
  return string = string + layer.name;
};

_match = function(hierarchy, string) {
  var regExp, regexString;
  string = string.replace(/\s*>\s*/g, '>');
  string = string.split('*').join('[^>]*');
  string = string.split(' ').join('(?:.*)>');
  string = string.split(',').join('$|');
  regexString = "(^|>)" + string + "$";
  regExp = new RegExp(regexString);
  return hierarchy.match(regExp);
};

_findAll = function(selector, fromLayer) {
  var layers, stringNeedsRegex;
  layers = Framer.CurrentContext._layers;
  if (selector != null) {
    stringNeedsRegex = _.find(['*', ' ', '>', ','], function(c) {
      return _.includes(selector, c);
    });
    if (!(stringNeedsRegex || fromLayer)) {
      return layers = _.filter(layers, function(layer) {
        if (layer.name === selector) {
          return true;
        }
      });
    } else {
      return layers = _.filter(layers, function(layer) {
        var hierarchy;
        hierarchy = _getHierarchy(layer);
        if (fromLayer != null) {
          return _match(hierarchy, fromLayer.name + ' ' + selector);
        } else {
          return _match(hierarchy, selector);
        }
      });
    }
  } else {
    return layers;
  }
};

exports.Find = function(selector, fromLayer) {
  return _findAll(selector, fromLayer)[0];
};

exports.ƒ = function(selector, fromLayer) {
  return _findAll(selector, fromLayer)[0];
};

exports.FindAll = function(selector, fromLayer) {
  return _findAll(selector, fromLayer);
};

exports.ƒƒ = function(selector, fromLayer) {
  return _findAll(selector, fromLayer);
};

Layer.prototype.find = function(selector, fromLayer) {
  return _findAll(selector, this)[0];
};

Layer.prototype.ƒ = function(selector, fromLayer) {
  return _findAll(selector, this)[0];
};

Layer.prototype.findAll = function(selector, fromLayer) {
  return _findAll(selector, this);
};

Layer.prototype.ƒƒ = function(selector, fromLayer) {
  return _findAll(selector, this);
};


},{}],3:[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.FirebaseFramer = (function(superClass) {
  var getCORSurl, request;

  extend(FirebaseFramer, superClass);

  getCORSurl = function(server, path, secret, project) {
    var url;
    switch (Utils.isWebKit()) {
      case true:
        url = "https://" + server + path + ".json?auth=" + secret + "&ns=" + project + "&sse=true";
        break;
      default:
        url = "https://" + project + ".firebaseio.com" + path + ".json?auth=" + secret;
    }
    return url;
  };

  FirebaseFramer.define("status", {
    get: function() {
      return this._status;
    }
  });

  function FirebaseFramer(options) {
    var base, base1, base2, base3;
    this.options = options != null ? options : {};
    this.projectID = (base = this.options).projectID != null ? base.projectID : base.projectID = null;
    this.secret = (base1 = this.options).secret != null ? base1.secret : base1.secret = null;
    this.server = (base2 = this.options).server != null ? base2.server : base2.server = void 0;
    this.debug = (base3 = this.options).debug != null ? base3.debug : base3.debug = false;
    if (this._status == null) {
      this._status = "disconnected";
    }
    FirebaseFramer.__super__.constructor.apply(this, arguments);
    if (this.server === void 0) {
      Utils.domLoadJSON("https://" + this.projectID + ".firebaseio.com/.settings/owner.json", function(a, server) {
        var msg;
        print(msg = "Add ______ server:" + '   "' + server + '"' + " _____ to your instance of Firebase.");
        if (this.debug) {
          return console.log("Firebase: " + msg);
        }
      });
    }
    if (this.debug) {
      console.log("Firebase: Connecting to Firebase Project '" + this.projectID + "' ... \n URL: '" + (getCORSurl(this.server, "/", this.secret, this.projectID)) + "'");
    }
    this.onChange("connection");
  }

  request = function(project, secret, path, callback, method, data, parameters, debug) {
    var url, xhttp;
    url = "https://" + project + ".firebaseio.com" + path + ".json?auth=" + secret;
    if (parameters !== void 0) {
      if (parameters.shallow) {
        url += "&shallow=true";
      }
      if (parameters.format === "export") {
        url += "&format=export";
      }
      switch (parameters.print) {
        case "pretty":
          url += "&print=pretty";
          break;
        case "silent":
          url += "&print=silent";
      }
      if (typeof parameters.download === "string") {
        url += "&download=" + parameters.download;
        window.open(url, "_self");
      }
      if (typeof parameters.orderBy === "string") {
        url += "&orderBy=" + '"' + parameters.orderBy + '"';
      }
      if (typeof parameters.limitToFirst === "number") {
        url += "&limitToFirst=" + parameters.limitToFirst;
      }
      if (typeof parameters.limitToLast === "number") {
        url += "&limitToLast=" + parameters.limitToLast;
      }
      if (typeof parameters.startAt === "number") {
        url += "&startAt=" + parameters.startAt;
      }
      if (typeof parameters.endAt === "number") {
        url += "&endAt=" + parameters.endAt;
      }
      if (typeof parameters.equalTo === "number") {
        url += "&equalTo=" + parameters.equalTo;
      }
    }
    xhttp = new XMLHttpRequest;
    if (debug) {
      console.log("Firebase: New '" + method + "'-request with data: '" + (JSON.stringify(data)) + "' \n URL: '" + url + "'");
    }
    xhttp.onreadystatechange = (function(_this) {
      return function() {
        if (parameters !== void 0) {
          if (parameters.print === "silent" || typeof parameters.download === "string") {
            return;
          }
        }
        switch (xhttp.readyState) {
          case 0:
            if (debug) {
              console.log("Firebase: Request not initialized \n URL: '" + url + "'");
            }
            break;
          case 1:
            if (debug) {
              console.log("Firebase: Server connection established \n URL: '" + url + "'");
            }
            break;
          case 2:
            if (debug) {
              console.log("Firebase: Request received \n URL: '" + url + "'");
            }
            break;
          case 3:
            if (debug) {
              console.log("Firebase: Processing request \n URL: '" + url + "'");
            }
            break;
          case 4:
            if (callback != null) {
              callback(JSON.parse(xhttp.responseText));
            }
            if (debug) {
              console.log("Firebase: Request finished, response: '" + (JSON.parse(xhttp.responseText)) + "' \n URL: '" + url + "'");
            }
        }
        if (xhttp.status === "404") {
          if (debug) {
            return console.warn("Firebase: Invalid request, page not found \n URL: '" + url + "'");
          }
        }
      };
    })(this);
    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    return xhttp.send(data = "" + (JSON.stringify(data)));
  };

  FirebaseFramer.prototype.get = function(path, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "GET", null, parameters, this.debug);
  };

  FirebaseFramer.prototype.put = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "PUT", data, parameters, this.debug);
  };

  FirebaseFramer.prototype.post = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "POST", data, parameters, this.debug);
  };

  FirebaseFramer.prototype.patch = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "PATCH", data, parameters, this.debug);
  };

  FirebaseFramer.prototype["delete"] = function(path, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "DELETE", null, parameters, this.debug);
  };

  FirebaseFramer.prototype.onChange = function(path, callback) {
    var currentStatus, source, url;
    if (path === "connection") {
      url = getCORSurl(this.server, "/", this.secret, this.projectID);
      currentStatus = "disconnected";
      source = new EventSource(url);
      source.addEventListener("open", (function(_this) {
        return function() {
          if (currentStatus === "disconnected") {
            _this._status = "connected";
            if (callback != null) {
              callback("connected");
            }
            if (_this.debug) {
              console.log("Firebase: Connection to Firebase Project '" + _this.projectID + "' established");
            }
          }
          return currentStatus = "connected";
        };
      })(this));
      return source.addEventListener("error", (function(_this) {
        return function() {
          if (currentStatus === "connected") {
            _this._status = "disconnected";
            if (callback != null) {
              callback("disconnected");
            }
            if (_this.debug) {
              console.warn("Firebase: Connection to Firebase Project '" + _this.projectID + "' closed");
            }
          }
          return currentStatus = "disconnected";
        };
      })(this));
    } else {
      url = getCORSurl(this.server, path, this.secret, this.projectID);
      source = new EventSource(url);
      if (this.debug) {
        console.log("Firebase: Listening to changes made to '" + path + "' \n URL: '" + url + "'");
      }
      source.addEventListener("put", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "put", JSON.parse(ev.data).patch);
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PUT': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
      return source.addEventListener("patch", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "patch", JSON.parse(ev.data).patch);
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PATCH': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
    }
  };

  return FirebaseFramer;

})(Framer.BaseClass);


},{}],4:[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.Input = (function(superClass) {
  extend(Input, superClass);

  Input.define("style", {
    get: function() {
      return this.input.style;
    },
    set: function(value) {
      return _.extend(this.input.style, value);
    }
  });

  Input.define("value", {
    get: function() {
      return this.input.value;
    },
    set: function(value) {
      return this.input.value = value;
    }
  });

  function Input(options) {
    if (options == null) {
      options = {};
    }
    if (options.setup == null) {
      options.setup = false;
    }
    if (options.width == null) {
      options.width = Screen.width;
    }
    if (options.clip == null) {
      options.clip = false;
    }
    if (options.height == null) {
      options.height = 60;
    }
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "rgba(255, 60, 47, .5)" : "transparent";
    }
    if (options.fontSize == null) {
      options.fontSize = 30;
    }
    if (options.lineHeight == null) {
      options.lineHeight = 30;
    }
    if (options.padding == null) {
      options.padding = 10;
    }
    if (options.fontFamily == null) {
      options.fontFamily = "";
    }
    if (options.opacity == null) {
      options.opacity = 1;
    }
    if (options.text == null) {
      options.text = "";
    }
    if (options.placeholder == null) {
      options.placeholder = "";
    }
    if (options.type == null) {
      options.type = "text";
    }
    Input.__super__.constructor.call(this, options);
    if (options.placeholderColor != null) {
      this.placeholderColor = options.placeholderColor;
    }
    this.input = document.createElement("input");
    this.input.id = "input-" + (_.now());
    this.input.style.cssText = "font-size: " + options.fontSize + "px; line-height: " + options.lineHeight + "px; padding: " + options.padding + "px; width: " + options.width + "px; height: " + options.height + "px; border: none; outline-width: 0; background-image: url(about:blank); background-color: " + options.backgroundColor + "; font-family: " + options.fontFamily + "; opacity: " + options.opacity + ";";
    this.input.value = options.text;
    this.input.type = options.type;
    this.input.placeholder = options.placeholder;
    this.form = document.createElement("form");
    this.form.appendChild(this.input);
    this._element.appendChild(this.form);
    this.backgroundColor = "transparent";
    if (this.placeholderColor) {
      this.updatePlaceholderColor(options.placeholderColor);
    }
  }

  Input.prototype.updatePlaceholderColor = function(color) {
    var css;
    this.placeholderColor = color;
    if (this.pageStyle != null) {
      document.head.removeChild(this.pageStyle);
    }
    this.pageStyle = document.createElement("style");
    this.pageStyle.type = "text/css";
    css = "#" + this.input.id + "::-webkit-input-placeholder { color: " + this.placeholderColor + "; }";
    this.pageStyle.appendChild(document.createTextNode(css));
    return document.head.appendChild(this.pageStyle);
  };

  Input.prototype.focus = function() {
    return this.input.focus();
  };

  return Input;

})(Layer);


},{}],5:[function(require,module,exports){
var SketchTextLayer, Slice, TextStyle, _assets, _layers, _slices, assignConstraints, assignFlexbox, findObjects, getConstraints, getObject, getParents, getTextStyles, groups, makeLayerFromParent, ref, slices, text_styles, ƒ, ƒƒ,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ref = require('findModule'), ƒ = ref.ƒ, ƒƒ = ref.ƒƒ;

_slices = Utils.domLoadJSONSync("slices.json");

_assets = Utils.domLoadJSONSync("assets.json");

_layers = Utils.domLoadJSONSync("layers.json");

slices = {};

groups = {};

text_styles = {};

Slice = (function(superClass) {
  extend(Slice, superClass);

  function Slice(options) {
    var base;
    this.options = options != null ? options : {};
    if ((base = this.options).sketch_id == null) {
      base.sketch_id = "111";
    }
    this.options.constraints = {};
    this.options.flexprops = {};
    Slice.__super__.constructor.call(this, this.options);
    this.sketch_id = this.options.sketch_id;
    this.constraints = this.options.constraints;
    this.flexprops = this.options.flexprops;
  }

  return Slice;

})(Layer);

SketchTextLayer = (function(superClass) {
  extend(SketchTextLayer, superClass);

  function SketchTextLayer(options) {
    var base;
    this.options = options != null ? options : {};
    if ((base = this.options).sketch_id == null) {
      base.sketch_id = "111";
    }
    this.options.constraints = {};
    this.options.flexprops = {};
    SketchTextLayer.__super__.constructor.call(this, this.options);
    this.sketch_id = this.options.sketch_id;
    this.constraints = this.options.constraints;
    this.flexprops = this.options.flexprops;
  }

  return SketchTextLayer;

})(TextLayer);

TextStyle = (function() {
  function TextStyle(options) {
    this.options = options != null ? options : {};
    this.name;
    this.id;
    this.color;
    this.fontSize;
    this.fontFamily;
    this.fontWeight;
    this.fontStyle;
    this.lineHeight;
    this.letterSpacing;
    this.textAlign;
    this.textTransform;
    this.textDecoration;
    this.name = this.options.name;
    this.id = this.options.id;
    this.color = this.options.color;
    this.fontSize = this.options.fontSize;
    this.fontFamily = this.options.fontFamily;
    this.fontWeight = this.options.fontWeight;
    this.fontStyle = this.options.fontStyle;
    this.lineHeight = this.options.lineHeight;
    this.letterSpacing = this.options.letterSpacing;
    this.textAlign = this.options.textAlign;
    this.textTransform = this.options.textTransform;
    this.textDecoration = this.options.textDecoration;
  }

  return TextStyle;

})();

getTextStyles = function() {
  var align, colorConverter, decoration, j, layerTextStyles, len, ref1, style, transform;
  colorConverter = (function(_this) {
    return function(val) {
      var convert, j, len, new_val, split, v;
      convert = function(x) {
        x *= 255;
        return x;
      };
      split = val.split("rgba(").join("").split(")").join("").split(",");
      new_val = [];
      for (j = 0, len = split.length; j < len; j++) {
        v = split[j];
        new_val.push(convert(v));
      }
      new_val.join(",");
      return "rgba(" + new_val + ")";
    };
  })(this);
  align = (function(_this) {
    return function(n) {
      var alignment;
      alignment = null;
      switch (n) {
        case 0:
          alignment = "left";
          break;
        case 1:
          alignment = "right";
          break;
        case 2:
          alignment = "center";
          break;
        case 3:
          alignment = "justified";
          break;
        default:
          break;
      }
      return alignment;
    };
  })(this);
  transform = (function(_this) {
    return function(n) {
      var x;
      x = null;
      switch (n) {
        case 0:
          break;
        case 1:
          x = "uppercase";
          break;
        case 2:
          x = "lowercase";
          break;
        default:
          break;
      }
      return x;
    };
  })(this);
  decoration = (function(_this) {
    return function(m, n) {
      var x;
      x = null;
      if (m) {
        x = "line-through";
      }
      if (n) {
        x = "underline";
      }
      return x;
    };
  })(this);
  layerTextStyles = (ref1 = _assets.layerTextStyles) != null ? ref1.objects : void 0;
  if (layerTextStyles != null) {
    for (j = 0, len = layerTextStyles.length; j < len; j++) {
      style = layerTextStyles[j];
      text_styles[style.name] = new TextStyle({
        name: style.name,
        id: style.objectID,
        color: colorConverter(style.value.textStyle.NSColor.color),
        fontSize: style.value.textStyle.NSFont.attributes.NSFontSizeAttribute,
        fontFamily: style.value.textStyle.NSFont.family,
        fontStyle: style.value.textStyle.NSFont.name.split(" ")[style.value.textStyle.NSFont.name.split(" ").length - 1].toLowerCase(),
        lineHeight: style.value.textStyle.NSParagraphStyle.style.minimumLineHeight / style.value.textStyle.NSFont.attributes.NSFontSizeAttribute,
        letterSpacing: style.value.textStyle.NSKern,
        textAlign: align(style.value.textStyle.NSParagraphStyle.style.alignment),
        textTransform: transform(style.value.textStyle.MSAttributedStringTextTransformAttribute),
        textDecoration: decoration(style.value.textStyle.NSStrikethrough, style.value.textStyle.NSUnderline)
      });
    }
  }
  return text_styles;
};

makeLayerFromParent = function(item) {
  var layer, matches, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  layer = null;
  if (item.name != null) {
    matches = ƒƒ(item.name);
  } else {
    return layer;
  }
  switch (matches.length) {
    case 0:
      slices[item.name] = new Slice({
        name: item.name,
        x: (ref1 = (ref2 = item.relative) != null ? ref2.x : void 0) != null ? ref1 : 0,
        y: (ref3 = (ref4 = item.relative) != null ? ref4.y : void 0) != null ? ref3 : 0,
        width: (ref5 = (ref6 = item.relative) != null ? ref6.width : void 0) != null ? ref5 : Canvas.width,
        height: (ref7 = (ref8 = item.relative) != null ? ref8.height : void 0) != null ? ref7 : Canvas.height,
        sketch_id: item.id,
        backgroundColor: "transparent"
      });
      layer = slices[item.name];
      break;
    case 1:
      layer = matches[0];
  }
  return layer;
};

getObject = function(object, key, value) {
  var i, prop, result;
  if (object instanceof Array) {
    i = 0;
    while (i < object.length) {
      result = getObject(object[i], key, value);
      if (result) {
        break;
      }
      i++;
    }
  } else {
    for (prop in object) {
      if (prop === key) {
        if (!value) {
          return object;
        }
        if (object[prop] === value) {
          return object;
        }
      }
      if (object[prop] instanceof Object || object[prop] instanceof Array) {
        result = getObject(object[prop], key, value);
        if (result) {
          break;
        }
      }
    }
  }
  return result;
};

findObjects = function(object, key, value, finalResults) {
  var getAllMatches;
  finalResults = {};
  getAllMatches = function(theObject) {
    var i, prop, result;
    result = null;
    if (theObject instanceof Array) {
      i = 0;
      while (i < theObject.length) {
        getAllMatches(theObject[i]);
        i++;
      }
    } else {
      for (prop in theObject) {
        if (theObject.hasOwnProperty(prop)) {
          if (prop === key) {
            if (theObject[prop] === value) {
              finalResults[theObject.name] = theObject;
            }
          }
          if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
            getAllMatches(theObject[prop]);
          }
        }
      }
    }
  };
  getAllMatches(object);
  return finalResults;
};

getParents = function(object, list) {
  var layer, layers, parent, parent_slice_list, prop, results, slice;
  results = [];
  for (prop in object) {
    if (object[prop].hasOwnProperty("layers")) {
      layers = object[prop].layers;
      results.push((function() {
        var j, len, obj, results1;
        results1 = [];
        for (j = 0, len = layers.length; j < len; j++) {
          layer = layers[j];
          for (slice in list) {
            if (layer.id === list[slice].sketch_id) {
              parent = makeLayerFromParent(object[prop]);
              if (parent != null) {
                list[slice].parent = parent;
                parent_slice_list = (
                  obj = {},
                  obj["" + parent.name] = slices[parent.name],
                  obj
                );
                getParents(_layers, parent_slice_list);
              }
            }
          }
          results1.push(getParents(layers, list));
        }
        return results1;
      })());
    } else {
      results.push(getParents(object[prop], list));
    }
  }
  return results;
};

getConstraints = function(s) {
  var anima, asset, constraints, flexprops, ref1, ref2;
  asset = getObject(_assets, "objectID", s.sketch_id);
  anima = asset != null ? (ref1 = asset.userInfo) != null ? ref1["com.animaapp.stc-sketch-plugin"] : void 0 : void 0;
  constraints = anima != null ? (ref2 = anima.kModelPropertiesKey) != null ? ref2.constraints : void 0 : void 0;
  if (constraints != null) {
    s.constraints = constraints;
    assignConstraints(s);
  }
  if ((anima != null ? anima.kViewTypeKey : void 0) != null) {
    flexprops = anima != null ? anima.kModelPropertiesKey : void 0;
    s.flexprops = flexprops;
    return assignFlexbox(s);
  }
};

assignConstraints = function(s) {
  var c, constant, constant_bottom, constant_height, constant_left, constant_right, constant_top, constant_width, container, multiplier_bottom, multiplier_height, multiplier_left, multiplier_right, multiplier_top, multiplier_width, ref1, ref2, results;
  container = s.parent;
  results = [];
  for (c in s.constraints) {
    switch (c) {
      case "top":
        if (s.constraints[c].multiplier != null) {
          multiplier_top = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_top = s.constraints[c].constant;
        }
        if (multiplier_top != null) {
          s.y = Align.top(container.height * multiplier_top);
          container.on("change:height", function() {
            return s.y = Align.top(container.height * multiplier_top);
          });
        }
        if (constant_top != null) {
          s.y = Align.top(constant_top);
          results.push(container.on("change:height", function() {
            return s.y = Align.top(constant_top);
          }));
        } else {
          results.push(void 0);
        }
        break;
      case "bottom":
        if (s.constraints[c].multiplier != null) {
          multiplier_bottom = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_bottom = s.constraints[c].constant;
        }
        if (multiplier_bottom != null) {
          s.y = Align.bottom(container.height * multiplier_bottom);
          container.on("change:height", function() {
            return s.y = Align.bottom(container.height * multiplier_bottom);
          });
        }
        if (constant_bottom != null) {
          s.y = Align.bottom(-constant_bottom);
          results.push(container.on("change:height", function() {
            return s.y = Align.bottom(-constant_bottom);
          }));
        } else {
          results.push(void 0);
        }
        break;
      case "left":
        if (s.constraints[c].multiplier != null) {
          multiplier_left = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_left = s.constraints[c].constant;
        }
        if (multiplier_left != null) {
          s.x = Align.left(container.height * multiplier_left);
          container.on("change:width", function() {
            return s.x = Align.left(container.height * multiplier_left);
          });
        }
        if (constant_left != null) {
          s.x = Align.left(constant_left);
          results.push(container.on("change:width", function() {
            return s.x = Align.left(constant_left);
          }));
        } else {
          results.push(void 0);
        }
        break;
      case "right":
        if (s.constraints[c].multiplier != null) {
          multiplier_right = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_right = s.constraints[c].constant;
        }
        if (multiplier_right != null) {
          s.x = Align.right(container.height * multiplier_right);
          container.on("change:width", function() {
            return s.x = Align.right(container.height * multiplier_right);
          });
        }
        if (constant_right != null) {
          s.x = Align.right(-constant_right);
          results.push(container.on("change:width", function() {
            return s.x = Align.right(-constant_right);
          }));
        } else {
          results.push(void 0);
        }
        break;
      case "width":
        if (s.constraints[c].multiplier != null) {
          multiplier_width = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_width = s.constraints[c].constant;
        }
        if (constant_width) {
          results.push(s.width = constant_width);
        } else {
          s.width = container.width * multiplier_width;
          results.push(container.on("change:width", function() {
            return s.width = container.width * multiplier_width;
          }));
        }
        break;
      case "height":
        if (s.constraints[c].multiplier != null) {
          multiplier_height = s.constraints[c].multiplier;
        }
        if (s.constraints[c].constant != null) {
          constant_height = s.constraints[c].constant;
        }
        if (constant_height) {
          results.push(s.height = constant_height);
        } else {
          s.height = container.height * multiplier_height;
          results.push(container.on("change:height", function() {
            return s.height = container.height * multiplier_height;
          }));
        }
        break;
      case "centerHorizontally":
        constant = (ref1 = s.constraints[c].constant) != null ? ref1 : 0;
        results.push(s.x = Align.center(constant));
        break;
      case "centerVertically":
        constant = (ref2 = s.constraints[c].constant) != null ? ref2 : 0;
        results.push(s.y = Align.center(constant));
        break;
      default:
        break;
    }
  }
  return results;
};

assignFlexbox = function(s) {};

exports.textStyles = function() {
  return getTextStyles();
};

exports.sketchSlicer = function() {
  var child, j, k, len, len1, ref1, ref2, slice;
  ref1 = _slices.pages[0].slices;
  for (j = 0, len = ref1.length; j < len; j++) {
    slice = ref1[j];
    slices[slice.name] = new Slice({
      name: slice.name,
      image: "images/" + slice.name + ".png",
      sketch_id: slice.id,
      x: slice.relative.x,
      y: slice.relative.y,
      width: slice.relative.width,
      height: slice.relative.height
    });
  }
  getParents(_layers, slices);
  slices["canvas"].width = Canvas.width;
  slices["canvas"].height = Canvas.height;
  Canvas.on("change:size", function() {
    return slices["canvas"].size = Canvas.size;
  });
  ref2 = slices["canvas"].children;
  for (k = 0, len1 = ref2.length; k < len1; k++) {
    child = ref2[k];
    child.size = slices["canvas"].size;
    slices["canvas"].on("change:size", function() {
      return child.size = slices["canvas"].size;
    });
  }
  for (slice in slices) {
    getConstraints(slices[slice]);
  }
  return slices;
};

exports.sketchTextLayers = function() {
  var my_style, t_rel, text, text_layers;
  text_layers = findObjects(_assets, "<class>", "MSTextLayer");
  getTextStyles();
  for (text in text_layers) {
    my_style = getObject(text_styles, "id", text_layers[text].style.sharedObjectID);
    t_rel = getObject(_layers, "id", text_layers[text].objectID);
    if (my_style != null) {
      text_layers[text] = new SketchTextLayer({
        name: text_layers[text].name,
        sketch_id: text_layers[text].objectID,
        x: t_rel.relative.x,
        y: t_rel.relative.y,
        width: t_rel.relative.width,
        height: t_rel.relative.height,
        textAlign: my_style.textAlign,
        text: my_style.text,
        color: my_style.color,
        fontSize: my_style.fontSize,
        fontFamily: my_style.fontFamily,
        fontStyle: my_style.fontStyle,
        lineHeight: my_style.lineHeight,
        letterSpacing: my_style.letterSpacing,
        textTransform: my_style.textTransform,
        textDecoration: my_style.textDecoration
      });
    }
  }
  getParents(_layers, text_layers);
  for (text in text_layers) {
    print(text_layers[text].sketch_id);
  }
  for (text in text_layers) {
    getConstraints(text_layers[text]);
  }
  return text_layers;
};


},{"findModule":2}]},{},[1])

//# sourceMappingURL=app.js.map
