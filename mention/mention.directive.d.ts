import { ElementRef, ComponentFactoryResolver, ViewContainerRef, TemplateRef } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { MentionListComponent } from './mention-list.component';
import { Mentionable } from './mentionable';
/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular2-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export declare class MentionDirective {
    private _element;
    private _componentResolver;
    private _viewContainerRef;
    searchString: string;
    startPos: number;
    items: Mentionable[];
    startNode: any;
    searchList: MentionListComponent;
    stopSearch: boolean;
    iframe: any;
    constructor(_element: ElementRef, _componentResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef);
    triggerChar: string;
    mention: Mentionable[];
    listTemplate: TemplateRef<any>;
    mentionSelect: (item: Mentionable) => (string);
    disableSearch: boolean;
    maxItems: number;
    searchTerm: EventEmitter<{}>;
    setIframe(iframe: HTMLIFrameElement): void;
    stopEvent(event: any): void;
    blurHandler(event: any): void;
    keyHandler(event: any, nativeElement?: HTMLInputElement): boolean;
    updateSearchList(): void;
    showSearchList(nativeElement: HTMLInputElement): void;
}
