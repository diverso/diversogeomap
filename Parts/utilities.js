/* 
 This file was generated by Dashcode and is covered by the 
 license.txt included in the project.  You may edit this file, 
 however it is recommended to first turn off the Dashcode 
 code generator otherwise the changes will be lost.
 */

if (!window.dashcode) {
    dashcode = new Object();
}

//
// setupParts(string)
// Uses the dashcodePartsSpec dictionary, declared in the automatically generated file setup.js to instantiate 
// all the parts in the project.
//
dashcode.setupParts = function () {
    if (dashcode.setupParts.called) return;
    dashcode.setupParts.called = true;
    var partsToGetFinishLoading = [];
    for (var id in dashcodePartSpecs) {
        var specDict = dashcodePartSpecs[id];
        var createFunc = window[specDict.creationFunction];
        var object = createFunc(id, specDict);
        if (object && object.finishLoading) {
            partsToGetFinishLoading[partsToGetFinishLoading.length] = object;
        }
    }
    // Call finishedLoading callbacks.
    for (var i=0; i<partsToGetFinishLoading.length; i++) {
        partsToGetFinishLoading[i].finishLoading();
    }
}
window.addEventListener('load', dashcode.setupParts, false);

//
// getLocalizedString(string)
// Pulls a string out an array named localizedStrings.  Each language project directory in this widget
// contains a file named "localizedStrings.js", which, in turn, contains an array called localizedStrings.
// This method queries the array of the file of whichever language has highest precedence, according to
// your preference set in the language toolbar item
//
// string: the key to the array
//
dashcode.getLocalizedString = function (string) {
    try { string = localizedStrings[string] || string; } catch (e) {}
    return string;
}

//
// createInstancePreferenceKey(key)
// Returns a unique preference key that is based on a instance of an opened widget.
// The returned value can then be used in widget.setPreferenceForKey()
// and widget.preferenceForKey() so that the value that is set or retrieved is
// only for a particular opened widget.
//
// key: preference key
//
dashcode.createInstancePreferenceKey = function (key) {
    return widget.identifier + "-" + key;
}

//
// getElementHeight(mainElement)
// Get the height of a part even if it's hidden (by 'display: none').
//
// mainElement: Part element
//
dashcode.getElementHeight = function (mainElement) {
    var height = mainElement.offsetHeight;
    
    if (!height || height == 0) {
        height = dashcode.getElementSize(mainElement).height;
    }
    
    return height;
}

//
// getElementWidth(mainElement)
// Get the width of a part even if it's hidden (by 'display: none').
//
// mainElement: Part element
//
dashcode.getElementWidth = function (mainElement) {
    var width = mainElement.offsetWidth;
    
    if (!width || width == 0) {
        width = dashcode.getElementSize(mainElement).width;
    }
    
    return width;
}

//
// getElementSize(mainElement)
// Get the size of a DOM element even if it's hidden (by 'display: none').
//
// mainElement: DOM element
//
dashcode.getElementSize = function (mainElement) {
    var sizes = dashcode.getElementSizesWithAncestor([mainElement], mainElement);
    return sizes[0];
}

//
// getElementSizesWithAncestor(elements, ancestor)
// Get the size of an array of DOM elements under a common ancestor even if they're hidden (by 'display: none').
//
// elements: Array of DOM element
// ancestor: Common DOM ancestor. 'display' will temporarily be flipped to 'block' for all hidden ancestors of this element.
//
dashcode.getElementSizesWithAncestor = function (elements, ancestor) {
    if (elements.length < 1) return [];

    var displayNoneElements = new Array();
    var width = elements[0].offsetWidth;
    
    if (!width || width == 0) {        
        var parentNode = ancestor;
        while (parentNode && (parentNode != document)) {
            var style = document.defaultView.getComputedStyle(parentNode, null);
            var displayValue = style ? style.getPropertyValue("display") : parentNode.style.display;        
            if ((style && displayValue == "none") || (!style && displayValue != "block")) {
                displayNoneElements.push({node:parentNode, display:parentNode.style.display});
                parentNode.style.display = "block";
            }
            parentNode = parentNode.parentNode;
        }
    }

    var sizes = new Array();    
    for (var i=0; i<elements.length; i++) {
        sizes.push({width: elements[i].offsetWidth, height: elements[i].offsetHeight});
    }

    for (var i=0; i<displayNoneElements.length; i++) {
        var element = displayNoneElements[i].node;
        element.style.display = displayNoneElements[i].display;
        // clean up
        if (element.getAttribute("style") == "") {
            element.removeAttribute("style");
        }
    }
    
    return sizes;
}

dashcode.getElementDocumentOffset = function(element)
{   
    var parent = element.offsetParent;
    var offset = {x:element.offsetLeft,y:element.offsetTop};
    
    if( parent ){
        var parentOffset = dashcode.getElementDocumentOffset(parent);
        
        offset.x += parentOffset.x;
        offset.y += parentOffset.y;
    }
    
    return offset;
}

dashcode.pointInElement = function (x,y,element)
{
    var size = dashcode.getElementSize(element);
    var origin = dashcode.getElementDocumentOffset(element);
    
    // Check horizontally
    if( x >= origin.x ){
        if( x > origin.x + size.width )
            return false;
        
        if( y >= origin.y ){
            if( y > origin.y + size.height )
                return false;
        }else
            return false;
    }else
        return false;
    
    return true;
}

//
// cloneTemplateElement(element, isTemplate)
// Clone an element and initialize the parts it contains. The new element is simply returned and not added to the DOM.
//
// element: element to clone
// isTemplate: true if this is the template element
//
dashcode.cloneTemplateElement = function (element, isTemplate) {
    // clone the node and its subtree
    var newElement = isTemplate ? element : element.cloneNode(true);
    var templateElements = new Object();
    this.processClonedTemplateElement(newElement, templateElements, isTemplate);
    
    if( !newElement.object ) newElement.object = {};
    
    newElement.object.templateElements = templateElements;
    
    // finish loading parts that need post-processing
    for (var key in templateElements) {
        if (templateElements[key].object && templateElements[key].object.finishLoading) {
            templateElements[key].object.finishLoading();
        }
    }
    
    return newElement;
}

//
// processClonedTemplateElement(element, templateElements, isTemplate, preserveIds)
// Recursively process a newly cloned template element to remove IDs and initialize parts.
//
// element: element to process
// templateElements: list of references to template objects to populate
// isTemplate: true if this is the template element
// preserveIds: true to preserve the original id in a tempId attribute
//
dashcode.processClonedTemplateElement = function (element, templateElements, isTemplate, preserveIds) {
    var originalID = element.id;
    if (!originalID && element.getAttribute) {
        if (originalID = element.getAttribute("tempId")) {
            element.removeAttribute("tempId");
        }
    }
    var partSpec = null;
    if (originalID) {
        partSpec = dashcodePartSpecs[originalID];
    }
    // process the children first
    var preserveChildIds = preserveIds || (partSpec && partSpec.preserveChildIdsWhenCloning);
    var children = element.childNodes;
    for (var f=0; f<children.length; f++) {
        arguments.callee(children[f], templateElements, isTemplate, preserveChildIds);
    }
    if (originalID) {
        templateElements[originalID] = element;
        if (!isTemplate) { 
            element.removeAttribute("id");
            if (preserveIds) {
                element.setAttribute("tempId", originalID);
            }
            // if it's a 'part', initialize it
            if (partSpec) {
                partSpec.originalID = originalID;
                var createFunc = window[partSpec.creationFunction];
                if (createFunc && createFunc instanceof Function) {
                    createFunc(element, partSpec);
                }
            }
        }
    }
}

// Old function names for backwards compatibility
var setupParts = dashcode.setupParts;
var getLocalizedString = dashcode.getLocalizedString;
var createInstancePreferenceKey = dashcode.createInstancePreferenceKey;
var getElementHeight = dashcode.getElementHeight;
var getElementWidth = dashcode.getElementWidth;
var getElementSize = dashcode.getElementSize;
