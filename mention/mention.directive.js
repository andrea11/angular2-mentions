"use strict";
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var mention_list_component_1 = require("./mention-list.component");
var mention_utils_1 = require("./mention-utils");
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_SHIFT = 16;
var KEY_ESCAPE = 27;
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_2 = 50;
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
var MentionDirective = (function () {
    function MentionDirective(_element, _componentResolver, _viewContainerRef) {
        var _this = this;
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        this.triggerChar = "@";
        this.mentionSelect = function (item) { return _this.triggerChar + item.value; };
        // option to diable internal filtering. can be used to show the full list returned 
        // from an async operation (or allows a custom filter function to be used - in future)
        this.disableSearch = false;
        // option to limit the number of items shown in the pop-up menu
        this.maxItems = -1;
        // event emitted whenever the search term changes
        this.searchTerm = new core_2.EventEmitter();
    }
    Object.defineProperty(MentionDirective.prototype, "mention", {
        set: function (items) {
            if (items && items.length > 0) {
                this.items = items.sort(function (i1, i2) {
                    if (i1.label && i2.label) {
                        return i1.label < i2.label ? -1 : 1;
                    }
                    else {
                        return i1.value < i2.value ? -1 : 1;
                    }
                });
                this.updateSearchList();
            }
        },
        enumerable: true,
        configurable: true
    });
    MentionDirective.prototype.setIframe = function (iframe) {
        this.iframe = iframe;
    };
    MentionDirective.prototype.stopEvent = function (event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    };
    MentionDirective.prototype.blurHandler = function (event) {
        this.stopEvent(event);
        this.stopSearch = true;
        if (this.searchList) {
            this.searchList.hidden = true;
        }
    };
    MentionDirective.prototype.keyHandler = function (event, nativeElement) {
        if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
        var val = mention_utils_1.getValue(nativeElement);
        var pos = mention_utils_1.getCaretPosition(nativeElement, this.iframe);
        var charPressed = event.key;
        if (!charPressed) {
            var charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            else if (event.shiftKey && charCode === KEY_2) {
                charPressed = this.triggerChar;
            }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode === KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            mention_utils_1.setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        if (charPressed === this.triggerChar) {
            this.startPos = pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.stopSearch = false;
            this.showSearchList(nativeElement);
            this.updateSearchList();
        }
        else if (this.startPos >= 0 && !this.stopSearch) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    this.searchList.hidden = this.stopSearch;
                    pos--;
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        mention_utils_1.insertValue(nativeElement, this.startPos, pos, this.mentionSelect(this.searchList.activeItem), this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("input", false, true);
                            nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.searchList.hidden = true;
                        this.stopSearch = true;
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
                    this.stopEvent(event);
                    return false;
                }
                else {
                    var mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    this.searchTerm.emit(this.searchString);
                    this.updateSearchList();
                }
            }
        }
    };
    MentionDirective.prototype.updateSearchList = function () {
        var matches = [];
        if (this.items) {
            var objects = this.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.disableSearch) {
                if (this.searchString) {
                    var searchStringLowerCase_1 = this.searchString.toLowerCase();
                    matches = this.items.filter(function (e) { return e[e.label ? 'label' : 'value'].toLowerCase().startsWith(searchStringLowerCase_1); });
                }
                else {
                    matches = this.items;
                }
            }
            if (this.maxItems > 0) {
                matches = matches.slice(0, this.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.items = matches;
            this.searchList.hidden = matches.length === 0;
        }
    };
    MentionDirective.prototype.showSearchList = function (nativeElement) {
        var _this = this;
        if (this.searchList === undefined) {
            var componentFactory = this._componentResolver.resolveComponentFactory(mention_list_component_1.MentionListComponent);
            var componentRef = this._viewContainerRef.createComponent(componentFactory);
            this.searchList = componentRef.instance;
            this.searchList.position(nativeElement, this.iframe);
            componentRef.instance['itemClick'].subscribe(function () {
                nativeElement.focus();
                var fakeKeydown = { "keyCode": KEY_ENTER, "wasClick": true };
                _this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        else {
            this.searchList.activeIndex = 0;
            this.searchList.position(nativeElement, this.iframe);
            window.setTimeout(function () { return _this.searchList.resetScroll(); });
        }
        this.searchList.listTemplate = this.listTemplate;
        this.updateSearchList();
    };
    return MentionDirective;
}());
MentionDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[mention]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(blur)': 'blurHandler($event)'
                }
            },] },
];
/** @nocollapse */
MentionDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
    { type: core_1.ComponentFactoryResolver, },
    { type: core_1.ViewContainerRef, },
]; };
MentionDirective.propDecorators = {
    'triggerChar': [{ type: core_1.Input },],
    'mention': [{ type: core_1.Input },],
    'listTemplate': [{ type: core_1.Input },],
    'mentionSelect': [{ type: core_1.Input },],
    'disableSearch': [{ type: core_1.Input },],
    'maxItems': [{ type: core_1.Input },],
    'searchTerm': [{ type: core_2.Output },],
};
exports.MentionDirective = MentionDirective;
