import { DOCUMENT, isPlatformServer } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, NgZone, Output, PLATFORM_ID, Renderer2, SecurityContext, ViewEncapsulation } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { defaultModules } from './quill-defaults';
import { getFormat } from './helpers';
import { QuillService } from './quill.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
import * as i2 from "./quill.service";
import * as i3 from "@angular/common";
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class QuillEditorBase {
    constructor(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service) {
        this.elementRef = elementRef;
        this.cd = cd;
        this.domSanitizer = domSanitizer;
        this.platformId = platformId;
        this.renderer = renderer;
        this.zone = zone;
        this.service = service;
        this.required = false;
        this.customToolbarPosition = 'top';
        this.styles = null;
        this.strict = true;
        this.customOptions = [];
        this.customModules = [];
        this.preserveWhitespace = false;
        this.trimOnValidation = false;
        this.compareValues = false;
        this.filterNull = false;
        /*
        https://github.com/KillerCodeMonkey/ngx-quill/issues/1257 - fix null value set
      
        provide default empty value
        by default null
      
        e.g. defaultEmptyValue="" - empty string
      
        <quill-editor
          defaultEmptyValue=""
          formControlName="message"
        ></quill-editor>
        */
        this.defaultEmptyValue = null;
        this.onEditorCreated = new EventEmitter();
        this.onEditorChanged = new EventEmitter();
        this.onContentChanged = new EventEmitter();
        this.onSelectionChanged = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
        this.disabled = false; // used to store initial value before ViewInit
        this.preserve = false;
        this.toolbarPosition = 'top';
        this.subscription = null;
        this.quillSubscription = null;
        this.valueGetter = (quillEditor, editorElement) => {
            let html = editorElement.querySelector('.ql-editor').innerHTML;
            if (html === '<p><br></p>' || html === '<div><br></div>') {
                html = this.defaultEmptyValue;
            }
            let modelValue = html;
            const format = getFormat(this.format, this.service.config.format);
            if (format === 'text') {
                modelValue = quillEditor.getText();
            }
            else if (format === 'object') {
                modelValue = quillEditor.getContents();
            }
            else if (format === 'json') {
                try {
                    modelValue = JSON.stringify(quillEditor.getContents());
                }
                catch (e) {
                    modelValue = quillEditor.getText();
                }
            }
            return modelValue;
        };
        this.valueSetter = (quillEditor, value) => {
            const format = getFormat(this.format, this.service.config.format);
            if (format === 'html') {
                const sanitize = [true, false].includes(this.sanitize) ? this.sanitize : (this.service.config.sanitize || false);
                if (sanitize) {
                    value = this.domSanitizer.sanitize(SecurityContext.HTML, value);
                }
                return quillEditor.clipboard.convert(value);
            }
            else if (format === 'json') {
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    return [{ insert: value }];
                }
            }
            return value;
        };
        this.selectionChangeHandler = (range, oldRange, source) => {
            const shouldTriggerOnModelTouched = !range && !!this.onModelTouched;
            // only emit changes when there's any listener
            if (!this.onBlur.observed &&
                !this.onFocus.observed &&
                !this.onSelectionChanged.observed &&
                !shouldTriggerOnModelTouched) {
                return;
            }
            this.zone.run(() => {
                if (range === null) {
                    this.onBlur.emit({
                        editor: this.quillEditor,
                        source
                    });
                }
                else if (oldRange === null) {
                    this.onFocus.emit({
                        editor: this.quillEditor,
                        source
                    });
                }
                this.onSelectionChanged.emit({
                    editor: this.quillEditor,
                    oldRange,
                    range,
                    source
                });
                if (shouldTriggerOnModelTouched) {
                    this.onModelTouched();
                }
                this.cd.markForCheck();
            });
        };
        this.textChangeHandler = (delta, oldDelta, source) => {
            // only emit changes emitted by user interactions
            const text = this.quillEditor.getText();
            const content = this.quillEditor.getContents();
            let html = this.editorElem.querySelector('.ql-editor').innerHTML;
            if (html === '<p><br></p>' || html === '<div><br></div>') {
                html = this.defaultEmptyValue;
            }
            const trackChanges = this.trackChanges || this.service.config.trackChanges;
            const shouldTriggerOnModelChange = (source === 'user' || trackChanges && trackChanges === 'all') && !!this.onModelChange;
            // only emit changes when there's any listener
            if (!this.onContentChanged.observed && !shouldTriggerOnModelChange) {
                return;
            }
            this.zone.run(() => {
                if (shouldTriggerOnModelChange) {
                    this.onModelChange(this.valueGetter(this.quillEditor, this.editorElem));
                }
                this.onContentChanged.emit({
                    content,
                    delta,
                    editor: this.quillEditor,
                    html,
                    oldDelta,
                    source,
                    text
                });
                this.cd.markForCheck();
            });
        };
        // eslint-disable-next-line max-len
        this.editorChangeHandler = (event, current, old, source) => {
            // only emit changes when there's any listener
            if (!this.onEditorChanged.observed) {
                return;
            }
            // only emit changes emitted by user interactions
            if (event === 'text-change') {
                const text = this.quillEditor.getText();
                const content = this.quillEditor.getContents();
                let html = this.editorElem.querySelector('.ql-editor').innerHTML;
                if (html === '<p><br></p>' || html === '<div><br></div>') {
                    html = this.defaultEmptyValue;
                }
                this.zone.run(() => {
                    this.onEditorChanged.emit({
                        content,
                        delta: current,
                        editor: this.quillEditor,
                        event,
                        html,
                        oldDelta: old,
                        source,
                        text
                    });
                    this.cd.markForCheck();
                });
            }
            else {
                this.zone.run(() => {
                    this.onEditorChanged.emit({
                        editor: this.quillEditor,
                        event,
                        oldRange: old,
                        range: current,
                        source
                    });
                    this.cd.markForCheck();
                });
            }
        };
        this.document = injector.get(DOCUMENT);
    }
    static normalizeClassNames(classes) {
        const classList = classes.trim().split(' ');
        return classList.reduce((prev, cur) => {
            const trimmed = cur.trim();
            if (trimmed) {
                prev.push(trimmed);
            }
            return prev;
        }, []);
    }
    ngOnInit() {
        this.preserve = this.preserveWhitespace;
        this.toolbarPosition = this.customToolbarPosition;
    }
    ngAfterViewInit() {
        if (isPlatformServer(this.platformId)) {
            return;
        }
        // The `quill-editor` component might be destroyed before the `quill` chunk is loaded and its code is executed
        // this will lead to runtime exceptions, since the code will be executed on DOM nodes that don't exist within the tree.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.quillSubscription = this.service.getQuill().subscribe(Quill => {
            this.editorElem = this.elementRef.nativeElement.querySelector('[quill-editor-element]');
            const toolbarElem = this.elementRef.nativeElement.querySelector('[quill-editor-toolbar]');
            const modules = Object.assign({}, this.modules || this.service.config.modules);
            if (toolbarElem) {
                modules.toolbar = toolbarElem;
            }
            else if (modules.toolbar === undefined) {
                modules.toolbar = defaultModules.toolbar;
            }
            let placeholder = this.placeholder !== undefined ? this.placeholder : this.service.config.placeholder;
            if (placeholder === undefined) {
                placeholder = 'Insert text here ...';
            }
            if (this.styles) {
                Object.keys(this.styles).forEach((key) => {
                    this.renderer.setStyle(this.editorElem, key, this.styles[key]);
                });
            }
            if (this.classes) {
                this.addClasses(this.classes);
            }
            this.customOptions.forEach((customOption) => {
                const newCustomOption = Quill.import(customOption.import);
                newCustomOption.whitelist = customOption.whitelist;
                Quill.register(newCustomOption, true);
            });
            this.customModules.forEach(({ implementation, path }) => {
                Quill.register(path, implementation);
            });
            let bounds = this.bounds && this.bounds === 'self' ? this.editorElem : this.bounds;
            if (!bounds) {
                bounds = this.service.config.bounds ? this.service.config.bounds : this.document.body;
            }
            let debug = this.debug;
            if (!debug && debug !== false && this.service.config.debug) {
                debug = this.service.config.debug;
            }
            let readOnly = this.readOnly;
            if (!readOnly && this.readOnly !== false) {
                readOnly = this.service.config.readOnly !== undefined ? this.service.config.readOnly : false;
            }
            let defaultEmptyValue = this.defaultEmptyValue;
            if (this.service.config.hasOwnProperty('defaultEmptyValue')) {
                defaultEmptyValue = this.service.config.defaultEmptyValue;
            }
            let scrollingContainer = this.scrollingContainer;
            if (!scrollingContainer && this.scrollingContainer !== null) {
                scrollingContainer =
                    this.service.config.scrollingContainer === null
                        || this.service.config.scrollingContainer ? this.service.config.scrollingContainer : null;
            }
            let formats = this.formats;
            if (!formats && formats === undefined) {
                formats = this.service.config.formats ? [...this.service.config.formats] : (this.service.config.formats === null ? null : undefined);
            }
            this.zone.runOutsideAngular(() => {
                this.quillEditor = new Quill(this.editorElem, {
                    bounds,
                    debug: debug,
                    formats: formats,
                    modules,
                    placeholder,
                    readOnly,
                    defaultEmptyValue,
                    scrollingContainer: scrollingContainer,
                    strict: this.strict,
                    theme: this.theme || (this.service.config.theme ? this.service.config.theme : 'snow')
                });
                // Set optional link placeholder, Quill has no native API for it so using workaround
                if (this.linkPlaceholder) {
                    const tooltip = this.quillEditor?.theme?.tooltip;
                    const input = tooltip?.root?.querySelector('input[data-link]');
                    if (input?.dataset) {
                        input.dataset.link = this.linkPlaceholder;
                    }
                }
            });
            if (this.content) {
                const format = getFormat(this.format, this.service.config.format);
                if (format === 'text') {
                    this.quillEditor.setText(this.content, 'silent');
                }
                else {
                    const newValue = this.valueSetter(this.quillEditor, this.content);
                    this.quillEditor.setContents(newValue, 'silent');
                }
                this.quillEditor.getModule('history').clear();
            }
            // initialize disabled status based on this.disabled as default value
            this.setDisabledState();
            this.addQuillEventListeners();
            // The `requestAnimationFrame` triggers change detection. There's no sense to invoke the `requestAnimationFrame` if anyone is
            // listening to the `onEditorCreated` event inside the template, for instance `<quill-view (onEditorCreated)="...">`.
            if (!this.onEditorCreated.observed && !this.onValidatorChanged) {
                return;
            }
            // The `requestAnimationFrame` will trigger change detection and `onEditorCreated` will also call `markDirty()`
            // internally, since Angular wraps template event listeners into `listener` instruction. We're using the `requestAnimationFrame`
            // to prevent the frame drop and avoid `ExpressionChangedAfterItHasBeenCheckedError` error.
            requestAnimationFrame(() => {
                if (this.onValidatorChanged) {
                    this.onValidatorChanged();
                }
                this.onEditorCreated.emit(this.quillEditor);
            });
        });
    }
    ngOnDestroy() {
        this.dispose();
        this.quillSubscription?.unsubscribe();
        this.quillSubscription = null;
    }
    ngOnChanges(changes) {
        if (!this.quillEditor) {
            return;
        }
        /* eslint-disable @typescript-eslint/dot-notation */
        if (changes.readOnly) {
            this.quillEditor.enable(!changes.readOnly.currentValue);
        }
        if (changes.placeholder) {
            this.quillEditor.root.dataset.placeholder =
                changes.placeholder.currentValue;
        }
        if (changes.defaultEmptyValue) {
            this.quillEditor.root.dataset.defaultEmptyValue =
                changes.defaultEmptyValue.currentValue;
        }
        if (changes.styles) {
            const currentStyling = changes.styles.currentValue;
            const previousStyling = changes.styles.previousValue;
            if (previousStyling) {
                Object.keys(previousStyling).forEach((key) => {
                    this.renderer.removeStyle(this.editorElem, key);
                });
            }
            if (currentStyling) {
                Object.keys(currentStyling).forEach((key) => {
                    this.renderer.setStyle(this.editorElem, key, this.styles[key]);
                });
            }
        }
        if (changes.classes) {
            const currentClasses = changes.classes.currentValue;
            const previousClasses = changes.classes.previousValue;
            if (previousClasses) {
                this.removeClasses(previousClasses);
            }
            if (currentClasses) {
                this.addClasses(currentClasses);
            }
        }
        // We'd want to re-apply event listeners if the `debounceTime` binding changes to apply the
        // `debounceTime` operator or vice-versa remove it.
        if (changes.debounceTime) {
            this.addQuillEventListeners();
        }
        /* eslint-enable @typescript-eslint/dot-notation */
    }
    addClasses(classList) {
        QuillEditorBase.normalizeClassNames(classList).forEach((c) => {
            this.renderer.addClass(this.editorElem, c);
        });
    }
    removeClasses(classList) {
        QuillEditorBase.normalizeClassNames(classList).forEach((c) => {
            this.renderer.removeClass(this.editorElem, c);
        });
    }
    writeValue(currentValue) {
        // optional fix for https://github.com/angular/angular/issues/14988
        if (this.filterNull && currentValue === null) {
            return;
        }
        this.content = currentValue;
        if (!this.quillEditor) {
            return;
        }
        const format = getFormat(this.format, this.service.config.format);
        const newValue = this.valueSetter(this.quillEditor, currentValue);
        if (this.compareValues) {
            const currentEditorValue = this.quillEditor.getContents();
            if (JSON.stringify(currentEditorValue) === JSON.stringify(newValue)) {
                return;
            }
        }
        if (currentValue) {
            if (format === 'text') {
                this.quillEditor.setText(currentValue);
            }
            else {
                this.quillEditor.setContents(newValue);
            }
            return;
        }
        this.quillEditor.setText('');
    }
    setDisabledState(isDisabled = this.disabled) {
        // store initial value to set appropriate disabled status after ViewInit
        this.disabled = isDisabled;
        if (this.quillEditor) {
            if (isDisabled) {
                this.quillEditor.disable();
                this.renderer.setAttribute(this.elementRef.nativeElement, 'disabled', 'disabled');
            }
            else {
                if (!this.readOnly) {
                    this.quillEditor.enable();
                }
                this.renderer.removeAttribute(this.elementRef.nativeElement, 'disabled');
            }
        }
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    registerOnValidatorChange(fn) {
        this.onValidatorChanged = fn;
    }
    validate() {
        if (!this.quillEditor) {
            return null;
        }
        const err = {};
        let valid = true;
        const text = this.quillEditor.getText();
        // trim text if wanted + handle special case that an empty editor contains a new line
        const textLength = this.trimOnValidation ? text.trim().length : (text.length === 1 && text.trim().length === 0 ? 0 : text.length - 1);
        const deltaOperations = this.quillEditor.getContents().ops;
        const onlyEmptyOperation = deltaOperations && deltaOperations.length === 1 && ['\n', ''].includes(deltaOperations[0].insert);
        if (this.minLength && textLength && textLength < this.minLength) {
            err.minLengthError = {
                given: textLength,
                minLength: this.minLength
            };
            valid = false;
        }
        if (this.maxLength && textLength > this.maxLength) {
            err.maxLengthError = {
                given: textLength,
                maxLength: this.maxLength
            };
            valid = false;
        }
        if (this.required && !textLength && onlyEmptyOperation) {
            err.requiredError = {
                empty: true
            };
            valid = false;
        }
        return valid ? null : err;
    }
    addQuillEventListeners() {
        this.dispose();
        // We have to enter the `<root>` zone when adding event listeners, so `debounceTime` will spawn the
        // `AsyncAction` there w/o triggering change detections. We still re-enter the Angular's zone through
        // `zone.run` when we emit an event to the parent component.
        this.zone.runOutsideAngular(() => {
            this.subscription = new Subscription();
            this.subscription.add(
            // mark model as touched if editor lost focus
            fromEvent(this.quillEditor, 'selection-change').subscribe(([range, oldRange, source]) => {
                this.selectionChangeHandler(range, oldRange, source);
            }));
            // The `fromEvent` supports passing JQuery-style event targets, the editor has `on` and `off` methods which
            // will be invoked upon subscription and teardown.
            let textChange$ = fromEvent(this.quillEditor, 'text-change');
            let editorChange$ = fromEvent(this.quillEditor, 'editor-change');
            if (typeof this.debounceTime === 'number') {
                textChange$ = textChange$.pipe(debounceTime(this.debounceTime));
                editorChange$ = editorChange$.pipe(debounceTime(this.debounceTime));
            }
            this.subscription.add(
            // update model if text changes
            textChange$.subscribe(([delta, oldDelta, source]) => {
                this.textChangeHandler(delta, oldDelta, source);
            }));
            this.subscription.add(
            // triggered if selection or text changed
            editorChange$.subscribe(([event, current, old, source]) => {
                this.editorChangeHandler(event, current, old, source);
            }));
        });
    }
    dispose() {
        if (this.subscription !== null) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
QuillEditorBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillEditorBase, deps: [{ token: i0.Injector }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.DomSanitizer }, { token: PLATFORM_ID }, { token: i0.Renderer2 }, { token: i0.NgZone }, { token: i2.QuillService }], target: i0.ɵɵFactoryTarget.Directive });
QuillEditorBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0", type: QuillEditorBase, inputs: { format: "format", theme: "theme", modules: "modules", debug: "debug", readOnly: "readOnly", placeholder: "placeholder", maxLength: "maxLength", minLength: "minLength", required: "required", formats: "formats", customToolbarPosition: "customToolbarPosition", sanitize: "sanitize", styles: "styles", strict: "strict", scrollingContainer: "scrollingContainer", bounds: "bounds", customOptions: "customOptions", customModules: "customModules", trackChanges: "trackChanges", preserveWhitespace: "preserveWhitespace", classes: "classes", trimOnValidation: "trimOnValidation", linkPlaceholder: "linkPlaceholder", compareValues: "compareValues", filterNull: "filterNull", debounceTime: "debounceTime", defaultEmptyValue: "defaultEmptyValue", valueGetter: "valueGetter", valueSetter: "valueSetter" }, outputs: { onEditorCreated: "onEditorCreated", onEditorChanged: "onEditorChanged", onContentChanged: "onContentChanged", onSelectionChanged: "onSelectionChanged", onFocus: "onFocus", onBlur: "onBlur" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillEditorBase, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.DomSanitizer }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.Renderer2 }, { type: i0.NgZone }, { type: i2.QuillService }]; }, propDecorators: { format: [{
                type: Input
            }], theme: [{
                type: Input
            }], modules: [{
                type: Input
            }], debug: [{
                type: Input
            }], readOnly: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], maxLength: [{
                type: Input
            }], minLength: [{
                type: Input
            }], required: [{
                type: Input
            }], formats: [{
                type: Input
            }], customToolbarPosition: [{
                type: Input
            }], sanitize: [{
                type: Input
            }], styles: [{
                type: Input
            }], strict: [{
                type: Input
            }], scrollingContainer: [{
                type: Input
            }], bounds: [{
                type: Input
            }], customOptions: [{
                type: Input
            }], customModules: [{
                type: Input
            }], trackChanges: [{
                type: Input
            }], preserveWhitespace: [{
                type: Input
            }], classes: [{
                type: Input
            }], trimOnValidation: [{
                type: Input
            }], linkPlaceholder: [{
                type: Input
            }], compareValues: [{
                type: Input
            }], filterNull: [{
                type: Input
            }], debounceTime: [{
                type: Input
            }], defaultEmptyValue: [{
                type: Input
            }], onEditorCreated: [{
                type: Output
            }], onEditorChanged: [{
                type: Output
            }], onContentChanged: [{
                type: Output
            }], onSelectionChanged: [{
                type: Output
            }], onFocus: [{
                type: Output
            }], onBlur: [{
                type: Output
            }], valueGetter: [{
                type: Input
            }], valueSetter: [{
                type: Input
            }] } });
export class QuillEditorComponent extends QuillEditorBase {
    constructor(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service) {
        super(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service);
    }
}
QuillEditorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillEditorComponent, deps: [{ token: i0.Injector }, { token: ElementRef }, { token: ChangeDetectorRef }, { token: DomSanitizer }, { token: PLATFORM_ID }, { token: Renderer2 }, { token: NgZone }, { token: QuillService }], target: i0.ɵɵFactoryTarget.Component });
QuillEditorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.0", type: QuillEditorComponent, selector: "quill-editor", providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            useExisting: forwardRef(() => QuillEditorComponent)
        },
        {
            multi: true,
            provide: NG_VALIDATORS,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            useExisting: forwardRef(() => QuillEditorComponent)
        }
    ], usesInheritance: true, ngImport: i0, template: `
  <ng-container *ngIf="toolbarPosition !== 'top'">
    <div quill-editor-element *ngIf="!preserve"></div>
    <pre quill-editor-element *ngIf="preserve"></pre>
  </ng-container>
  <ng-content select="[quill-editor-toolbar]"></ng-content>
  <ng-container *ngIf="toolbarPosition === 'top'">
    <div quill-editor-element *ngIf="!preserve"></div>
    <pre quill-editor-element *ngIf="preserve"></pre>
  </ng-container>
`, isInline: true, styles: [":host{display:inline-block}\n"], dependencies: [{ kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillEditorComponent, decorators: [{
            type: Component,
            args: [{ encapsulation: ViewEncapsulation.None, providers: [
                        {
                            multi: true,
                            provide: NG_VALUE_ACCESSOR,
                            // eslint-disable-next-line @typescript-eslint/no-use-before-define
                            useExisting: forwardRef(() => QuillEditorComponent)
                        },
                        {
                            multi: true,
                            provide: NG_VALIDATORS,
                            // eslint-disable-next-line @typescript-eslint/no-use-before-define
                            useExisting: forwardRef(() => QuillEditorComponent)
                        }
                    ], selector: 'quill-editor', template: `
  <ng-container *ngIf="toolbarPosition !== 'top'">
    <div quill-editor-element *ngIf="!preserve"></div>
    <pre quill-editor-element *ngIf="preserve"></pre>
  </ng-container>
  <ng-content select="[quill-editor-toolbar]"></ng-content>
  <ng-container *ngIf="toolbarPosition === 'top'">
    <div quill-editor-element *ngIf="!preserve"></div>
    <pre quill-editor-element *ngIf="preserve"></pre>
  </ng-container>
`, styles: [":host{display:inline-block}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ElementRef, decorators: [{
                    type: Inject,
                    args: [ElementRef]
                }] }, { type: i0.ChangeDetectorRef, decorators: [{
                    type: Inject,
                    args: [ChangeDetectorRef]
                }] }, { type: i1.DomSanitizer, decorators: [{
                    type: Inject,
                    args: [DomSanitizer]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.Renderer2, decorators: [{
                    type: Inject,
                    args: [Renderer2]
                }] }, { type: i0.NgZone, decorators: [{
                    type: Inject,
                    args: [NgZone]
                }] }, { type: i2.QuillService, decorators: [{
                    type: Inject,
                    args: [QuillService]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwtZWRpdG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1xdWlsbC9zcmMvbGliL3F1aWxsLWVkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQU14RCxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUVOLEtBQUssRUFDTCxNQUFNLEVBSU4sTUFBTSxFQUNOLFdBQVcsRUFDWCxTQUFTLEVBQ1QsZUFBZSxFQUVmLGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQTtBQUN0QixPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUM5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFN0MsT0FBTyxFQUF3QixhQUFhLEVBQUUsaUJBQWlCLEVBQWEsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFFakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUE7Ozs7O0FBc0M5QyxrRUFBa0U7QUFDbEUsTUFBTSxPQUFnQixlQUFlO0lBZ0VuQyxZQUNFLFFBQWtCLEVBQ1gsVUFBc0IsRUFDbkIsRUFBcUIsRUFDckIsWUFBMEIsRUFDTCxVQUFlLEVBQ3BDLFFBQW1CLEVBQ25CLElBQVksRUFDWixPQUFxQjtRQU54QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ25CLE9BQUUsR0FBRixFQUFF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RSxLQUFLLEVBQUUsSUFBSTtZQUNYLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLG1FQUFtRTtZQUNuRSxXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1NBQ3BEO0tBQ0YsaURBRVM7Ozs7Ozs7Ozs7Q0FVWDsyRkFTWSxvQkFBb0I7a0JBcENoQyxTQUFTO29DQUNPLGlCQUFpQixDQUFDLElBQUksYUFDMUI7d0JBQ1Q7NEJBQ0UsS0FBSyxFQUFFLElBQUk7NEJBQ1gsT0FBTyxFQUFFLGlCQUFpQjs0QkFDMUIsbUVBQW1FOzRCQUNuRSxXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQzt5QkFDcEQ7d0JBQ0Q7NEJBQ0UsS0FBSyxFQUFFLElBQUk7NEJBQ1gsT0FBTyxFQUFFLGFBQWE7NEJBQ3RCLG1FQUFtRTs0QkFDbkUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUM7eUJBQ3BEO3FCQUNGLFlBQ1MsY0FBYyxZQUNkOzs7Ozs7Ozs7O0NBVVg7OzBCQWFJLE1BQU07MkJBQUMsVUFBVTs7MEJBQ2pCLE1BQU07MkJBQUMsaUJBQWlCOzswQkFDeEIsTUFBTTsyQkFBQyxZQUFZOzswQkFDbkIsTUFBTTsyQkFBQyxXQUFXOzswQkFDbEIsTUFBTTsyQkFBQyxTQUFTOzswQkFDaEIsTUFBTTsyQkFBQyxNQUFNOzswQkFDYixNQUFNOzJCQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCwgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbidcbmltcG9ydCB7IERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInXG5cbmltcG9ydCB7IFF1aWxsTW9kdWxlcywgQ3VzdG9tT3B0aW9uLCBDdXN0b21Nb2R1bGUgfSBmcm9tICcuL3F1aWxsLWVkaXRvci5pbnRlcmZhY2VzJ1xuXG5pbXBvcnQgUXVpbGxUeXBlLCB7IERlbHRhIH0gZnJvbSAncXVpbGwnXG5cbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFBMQVRGT1JNX0lELFxuICBSZW5kZXJlcjIsXG4gIFNlY3VyaXR5Q29udGV4dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcbmltcG9ydCB7IGZyb21FdmVudCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcydcbmltcG9ydCB7IGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJ1xuXG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMSURBVE9SUywgTkdfVkFMVUVfQUNDRVNTT1IsIFZhbGlkYXRvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJ1xuaW1wb3J0IHsgZGVmYXVsdE1vZHVsZXMgfSBmcm9tICcuL3F1aWxsLWRlZmF1bHRzJ1xuXG5pbXBvcnQgeyBnZXRGb3JtYXQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgeyBRdWlsbFNlcnZpY2UgfSBmcm9tICcuL3F1aWxsLnNlcnZpY2UnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmFuZ2Uge1xuICBpbmRleDogbnVtYmVyXG4gIGxlbmd0aDogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoYW5nZSB7XG4gIGNvbnRlbnQ6IGFueVxuICBkZWx0YTogRGVsdGFcbiAgZWRpdG9yOiBRdWlsbFR5cGVcbiAgaHRtbDogc3RyaW5nIHwgbnVsbFxuICBvbGREZWx0YTogRGVsdGFcbiAgc291cmNlOiBzdHJpbmdcbiAgdGV4dDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0aW9uQ2hhbmdlIHtcbiAgZWRpdG9yOiBRdWlsbFR5cGVcbiAgb2xkUmFuZ2U6IFJhbmdlIHwgbnVsbFxuICByYW5nZTogUmFuZ2UgfCBudWxsXG4gIHNvdXJjZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmx1ciB7XG4gIGVkaXRvcjogUXVpbGxUeXBlXG4gIHNvdXJjZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXMge1xuICBlZGl0b3I6IFF1aWxsVHlwZVxuICBzb3VyY2U6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBFZGl0b3JDaGFuZ2VDb250ZW50ID0gQ29udGVudENoYW5nZSAmIHsgZXZlbnQ6ICd0ZXh0LWNoYW5nZScgfVxuZXhwb3J0IHR5cGUgRWRpdG9yQ2hhbmdlU2VsZWN0aW9uID0gU2VsZWN0aW9uQ2hhbmdlICYgeyBldmVudDogJ3NlbGVjdGlvbi1jaGFuZ2UnIH1cblxuQERpcmVjdGl2ZSgpXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L2RpcmVjdGl2ZS1jbGFzcy1zdWZmaXhcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBRdWlsbEVkaXRvckJhc2UgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSwgVmFsaWRhdG9yIHtcbiAgQElucHV0KCkgZm9ybWF0PzogJ29iamVjdCcgfCAnaHRtbCcgfCAndGV4dCcgfCAnanNvbidcbiAgQElucHV0KCkgdGhlbWU/OiBzdHJpbmdcbiAgQElucHV0KCkgbW9kdWxlcz86IFF1aWxsTW9kdWxlc1xuICBASW5wdXQoKSBkZWJ1Zz86ICd3YXJuJyB8ICdsb2cnIHwgJ2Vycm9yJyB8IGZhbHNlXG4gIEBJbnB1dCgpIHJlYWRPbmx5PzogYm9vbGVhblxuICBASW5wdXQoKSBwbGFjZWhvbGRlcj86IHN0cmluZ1xuICBASW5wdXQoKSBtYXhMZW5ndGg/OiBudW1iZXJcbiAgQElucHV0KCkgbWluTGVuZ3RoPzogbnVtYmVyXG4gIEBJbnB1dCgpIHJlcXVpcmVkID0gZmFsc2VcbiAgQElucHV0KCkgZm9ybWF0cz86IHN0cmluZ1tdIHwgbnVsbFxuICBASW5wdXQoKSBjdXN0b21Ub29sYmFyUG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbScgPSAndG9wJ1xuICBASW5wdXQoKSBzYW5pdGl6ZT86IGJvb2xlYW5cbiAgQElucHV0KCkgc3R5bGVzOiBhbnkgPSBudWxsXG4gIEBJbnB1dCgpIHN0cmljdCA9IHRydWVcbiAgQElucHV0KCkgc2Nyb2xsaW5nQ29udGFpbmVyPzogSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCBudWxsXG4gIEBJbnB1dCgpIGJvdW5kcz86IEhUTUxFbGVtZW50IHwgc3RyaW5nXG4gIEBJbnB1dCgpIGN1c3RvbU9wdGlvbnM6IEN1c3RvbU9wdGlvbltdID0gW11cbiAgQElucHV0KCkgY3VzdG9tTW9kdWxlczogQ3VzdG9tTW9kdWxlW10gPSBbXVxuICBASW5wdXQoKSB0cmFja0NoYW5nZXM/OiAndXNlcicgfCAnYWxsJ1xuICBASW5wdXQoKSBwcmVzZXJ2ZVdoaXRlc3BhY2UgPSBmYWxzZVxuICBASW5wdXQoKSBjbGFzc2VzPzogc3RyaW5nXG4gIEBJbnB1dCgpIHRyaW1PblZhbGlkYXRpb24gPSBmYWxzZVxuICBASW5wdXQoKSBsaW5rUGxhY2Vob2xkZXI/OiBzdHJpbmdcbiAgQElucHV0KCkgY29tcGFyZVZhbHVlcyA9IGZhbHNlXG4gIEBJbnB1dCgpIGZpbHRlck51bGwgPSBmYWxzZVxuICBASW5wdXQoKSBkZWJvdW5jZVRpbWU/OiBudW1iZXJcbiAgLypcbiAgaHR0cHM6Ly9naXRodWIuY29tL0tpbGxlckNvZGVNb25rZXkvbmd4LXF1aWxsL2lzc3Vlcy8xMjU3IC0gZml4IG51bGwgdmFsdWUgc2V0XG5cbiAgcHJvdmlkZSBkZWZhdWx0IGVtcHR5IHZhbHVlXG4gIGJ5IGRlZmF1bHQgbnVsbFxuXG4gIGUuZy4gZGVmYXVsdEVtcHR5VmFsdWU9XCJcIiAtIGVtcHR5IHN0cmluZ1xuXG4gIDxxdWlsbC1lZGl0b3JcbiAgICBkZWZhdWx0RW1wdHlWYWx1ZT1cIlwiXG4gICAgZm9ybUNvbnRyb2xOYW1lPVwibWVzc2FnZVwiXG4gID48L3F1aWxsLWVkaXRvcj5cbiAgKi9cbiAgQElucHV0KCkgZGVmYXVsdEVtcHR5VmFsdWU/OiBhbnkgPSBudWxsXG5cbiAgQE91dHB1dCgpIG9uRWRpdG9yQ3JlYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uRWRpdG9yQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEVkaXRvckNoYW5nZUNvbnRlbnQgfCBFZGl0b3JDaGFuZ2VTZWxlY3Rpb24+ID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIEBPdXRwdXQoKSBvbkNvbnRlbnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29udGVudENoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxGb2N1cz4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uQmx1cjogRXZlbnRFbWl0dGVyPEJsdXI+ID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbiAgcXVpbGxFZGl0b3IhOiBRdWlsbFR5cGVcbiAgZWRpdG9yRWxlbSE6IEhUTUxFbGVtZW50XG4gIGNvbnRlbnQ6IGFueVxuICBkaXNhYmxlZCA9IGZhbHNlIC8vIHVzZWQgdG8gc3RvcmUgaW5pdGlhbCB2YWx1ZSBiZWZvcmUgVmlld0luaXRcbiAgcHJlc2VydmUgPSBmYWxzZVxuICB0b29sYmFyUG9zaXRpb24gPSAndG9wJ1xuXG4gIG9uTW9kZWxDaGFuZ2U6IChtb2RlbFZhbHVlPzogYW55KSA9PiB2b2lkXG4gIG9uTW9kZWxUb3VjaGVkOiAoKSA9PiB2b2lkXG4gIG9uVmFsaWRhdG9yQ2hhbmdlZDogKCkgPT4gdm9pZFxuXG4gIHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50XG4gIHByaXZhdGUgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsID0gbnVsbFxuICBwcml2YXRlIHF1aWxsU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsID0gbnVsbFxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByb3RlY3RlZCBkb21TYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcm90ZWN0ZWQgcGxhdGZvcm1JZDogYW55LFxuICAgIHByb3RlY3RlZCByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByb3RlY3RlZCB6b25lOiBOZ1pvbmUsXG4gICAgcHJvdGVjdGVkIHNlcnZpY2U6IFF1aWxsU2VydmljZVxuICApIHtcbiAgICB0aGlzLmRvY3VtZW50ID0gaW5qZWN0b3IuZ2V0KERPQ1VNRU5UKVxuICB9XG5cbiAgc3RhdGljIG5vcm1hbGl6ZUNsYXNzTmFtZXMoY2xhc3Nlczogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IGNsYXNzZXMudHJpbSgpLnNwbGl0KCcgJylcbiAgICByZXR1cm4gY2xhc3NMaXN0LnJlZHVjZSgocHJldjogc3RyaW5nW10sIGN1cjogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCB0cmltbWVkID0gY3VyLnRyaW0oKVxuICAgICAgaWYgKHRyaW1tZWQpIHtcbiAgICAgICAgcHJldi5wdXNoKHRyaW1tZWQpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2XG4gICAgfSwgW10pXG4gIH1cblxuICBASW5wdXQoKVxuICB2YWx1ZUdldHRlciA9IChxdWlsbEVkaXRvcjogUXVpbGxUeXBlLCBlZGl0b3JFbGVtZW50OiBIVE1MRWxlbWVudCk6IHN0cmluZyB8IGFueSA9PiB7XG4gICAgbGV0IGh0bWw6IHN0cmluZyB8IG51bGwgPSBlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5xbC1lZGl0b3InKSEuaW5uZXJIVE1MXG4gICAgaWYgKGh0bWwgPT09ICc8cD48YnI+PC9wPicgfHwgaHRtbCA9PT0gJzxkaXY+PGJyPjwvZGl2PicpIHtcbiAgICAgIGh0bWwgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgfVxuICAgIGxldCBtb2RlbFZhbHVlOiBzdHJpbmcgfCBEZWx0YSB8IG51bGwgPSBodG1sXG4gICAgY29uc3QgZm9ybWF0ID0gZ2V0Rm9ybWF0KHRoaXMuZm9ybWF0LCB0aGlzLnNlcnZpY2UuY29uZmlnLmZvcm1hdClcblxuICAgIGlmIChmb3JtYXQgPT09ICd0ZXh0Jykge1xuICAgICAgbW9kZWxWYWx1ZSA9IHF1aWxsRWRpdG9yLmdldFRleHQoKVxuICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSAnb2JqZWN0Jykge1xuICAgICAgbW9kZWxWYWx1ZSA9IHF1aWxsRWRpdG9yLmdldENvbnRlbnRzKClcbiAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ2pzb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBtb2RlbFZhbHVlID0gSlNPTi5zdHJpbmdpZnkocXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbW9kZWxWYWx1ZSA9IHF1aWxsRWRpdG9yLmdldFRleHQoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtb2RlbFZhbHVlXG4gIH1cblxuICBASW5wdXQoKVxuICB2YWx1ZVNldHRlciA9IChxdWlsbEVkaXRvcjogUXVpbGxUeXBlLCB2YWx1ZTogYW55KTogYW55ID0+IHtcbiAgICBjb25zdCBmb3JtYXQgPSBnZXRGb3JtYXQodGhpcy5mb3JtYXQsIHRoaXMuc2VydmljZS5jb25maWcuZm9ybWF0KVxuICAgIGlmIChmb3JtYXQgPT09ICdodG1sJykge1xuICAgICAgY29uc3Qgc2FuaXRpemUgPSBbdHJ1ZSwgZmFsc2VdLmluY2x1ZGVzKHRoaXMuc2FuaXRpemUpID8gdGhpcy5zYW5pdGl6ZSA6ICh0aGlzLnNlcnZpY2UuY29uZmlnLnNhbml0aXplIHx8IGZhbHNlKVxuICAgICAgaWYgKHNhbml0aXplKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5kb21TYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LkhUTUwsIHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHF1aWxsRWRpdG9yLmNsaXBib2FyZC5jb252ZXJ0KHZhbHVlKVxuICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSAnanNvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gW3sgaW5zZXJ0OiB2YWx1ZSB9XVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5wcmVzZXJ2ZSA9IHRoaXMucHJlc2VydmVXaGl0ZXNwYWNlXG4gICAgdGhpcy50b29sYmFyUG9zaXRpb24gPSB0aGlzLmN1c3RvbVRvb2xiYXJQb3NpdGlvblxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIGlmIChpc1BsYXRmb3JtU2VydmVyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFRoZSBgcXVpbGwtZWRpdG9yYCBjb21wb25lbnQgbWlnaHQgYmUgZGVzdHJveWVkIGJlZm9yZSB0aGUgYHF1aWxsYCBjaHVuayBpcyBsb2FkZWQgYW5kIGl0cyBjb2RlIGlzIGV4ZWN1dGVkXG4gICAgLy8gdGhpcyB3aWxsIGxlYWQgdG8gcnVudGltZSBleGNlcHRpb25zLCBzaW5jZSB0aGUgY29kZSB3aWxsIGJlIGV4ZWN1dGVkIG9uIERPTSBub2RlcyB0aGF0IGRvbid0IGV4aXN0IHdpdGhpbiB0aGUgdHJlZS5cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICB0aGlzLnF1aWxsU3Vic2NyaXB0aW9uID0gdGhpcy5zZXJ2aWNlLmdldFF1aWxsKCkuc3Vic2NyaWJlKFF1aWxsID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yRWxlbSA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdbcXVpbGwtZWRpdG9yLWVsZW1lbnRdJ1xuICAgICAgKVxuXG4gICAgICBjb25zdCB0b29sYmFyRWxlbSA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdbcXVpbGwtZWRpdG9yLXRvb2xiYXJdJ1xuICAgICAgKVxuICAgICAgY29uc3QgbW9kdWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubW9kdWxlcyB8fCB0aGlzLnNlcnZpY2UuY29uZmlnLm1vZHVsZXMpXG5cbiAgICAgIGlmICh0b29sYmFyRWxlbSkge1xuICAgICAgICBtb2R1bGVzLnRvb2xiYXIgPSB0b29sYmFyRWxlbVxuICAgICAgfSBlbHNlIGlmIChtb2R1bGVzLnRvb2xiYXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtb2R1bGVzLnRvb2xiYXIgPSBkZWZhdWx0TW9kdWxlcy50b29sYmFyXG4gICAgICB9XG5cbiAgICAgIGxldCBwbGFjZWhvbGRlciA9IHRoaXMucGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCA/IHRoaXMucGxhY2Vob2xkZXIgOiB0aGlzLnNlcnZpY2UuY29uZmlnLnBsYWNlaG9sZGVyXG4gICAgICBpZiAocGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwbGFjZWhvbGRlciA9ICdJbnNlcnQgdGV4dCBoZXJlIC4uLidcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3R5bGVzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3R5bGVzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lZGl0b3JFbGVtLCBrZXksIHRoaXMuc3R5bGVzW2tleV0pXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNsYXNzZXMpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzc2VzKHRoaXMuY2xhc3NlcylcbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXN0b21PcHRpb25zLmZvckVhY2goKGN1c3RvbU9wdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBuZXdDdXN0b21PcHRpb24gPSBRdWlsbC5pbXBvcnQoY3VzdG9tT3B0aW9uLmltcG9ydClcbiAgICAgICAgbmV3Q3VzdG9tT3B0aW9uLndoaXRlbGlzdCA9IGN1c3RvbU9wdGlvbi53aGl0ZWxpc3RcbiAgICAgICAgUXVpbGwucmVnaXN0ZXIobmV3Q3VzdG9tT3B0aW9uLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgdGhpcy5jdXN0b21Nb2R1bGVzLmZvckVhY2goKHsgaW1wbGVtZW50YXRpb24sIHBhdGggfSkgPT4ge1xuICAgICAgICBRdWlsbC5yZWdpc3RlcihwYXRoLCBpbXBsZW1lbnRhdGlvbilcbiAgICAgIH0pXG5cbiAgICAgIGxldCBib3VuZHMgPSB0aGlzLmJvdW5kcyAmJiB0aGlzLmJvdW5kcyA9PT0gJ3NlbGYnID8gdGhpcy5lZGl0b3JFbGVtIDogdGhpcy5ib3VuZHNcbiAgICAgIGlmICghYm91bmRzKSB7XG4gICAgICAgIGJvdW5kcyA9IHRoaXMuc2VydmljZS5jb25maWcuYm91bmRzID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy5ib3VuZHMgOiB0aGlzLmRvY3VtZW50LmJvZHlcbiAgICAgIH1cblxuICAgICAgbGV0IGRlYnVnID0gdGhpcy5kZWJ1Z1xuICAgICAgaWYgKCFkZWJ1ZyAmJiBkZWJ1ZyAhPT0gZmFsc2UgJiYgdGhpcy5zZXJ2aWNlLmNvbmZpZy5kZWJ1Zykge1xuICAgICAgICBkZWJ1ZyA9IHRoaXMuc2VydmljZS5jb25maWcuZGVidWdcbiAgICAgIH1cblxuICAgICAgbGV0IHJlYWRPbmx5ID0gdGhpcy5yZWFkT25seVxuICAgICAgaWYgKCFyZWFkT25seSAmJiB0aGlzLnJlYWRPbmx5ICE9PSBmYWxzZSkge1xuICAgICAgICByZWFkT25seSA9IHRoaXMuc2VydmljZS5jb25maWcucmVhZE9ubHkgIT09IHVuZGVmaW5lZCA/IHRoaXMuc2VydmljZS5jb25maWcucmVhZE9ubHkgOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBsZXQgZGVmYXVsdEVtcHR5VmFsdWUgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgICBpZiAodGhpcy5zZXJ2aWNlLmNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdEVtcHR5VmFsdWUnKSkge1xuICAgICAgICBkZWZhdWx0RW1wdHlWYWx1ZSA9IHRoaXMuc2VydmljZS5jb25maWcuZGVmYXVsdEVtcHR5VmFsdWVcbiAgICAgIH1cblxuICAgICAgbGV0IHNjcm9sbGluZ0NvbnRhaW5lciA9IHRoaXMuc2Nyb2xsaW5nQ29udGFpbmVyXG4gICAgICBpZiAoIXNjcm9sbGluZ0NvbnRhaW5lciAmJiB0aGlzLnNjcm9sbGluZ0NvbnRhaW5lciAhPT0gbnVsbCkge1xuICAgICAgICBzY3JvbGxpbmdDb250YWluZXIgPVxuICAgICAgICAgIHRoaXMuc2VydmljZS5jb25maWcuc2Nyb2xsaW5nQ29udGFpbmVyID09PSBudWxsXG4gICAgICAgICAgICB8fCB0aGlzLnNlcnZpY2UuY29uZmlnLnNjcm9sbGluZ0NvbnRhaW5lciA/IHRoaXMuc2VydmljZS5jb25maWcuc2Nyb2xsaW5nQ29udGFpbmVyIDogbnVsbFxuICAgICAgfVxuXG4gICAgICBsZXQgZm9ybWF0cyA9IHRoaXMuZm9ybWF0c1xuICAgICAgaWYgKCFmb3JtYXRzICYmIGZvcm1hdHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmb3JtYXRzID0gdGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXRzID8gWy4uLnRoaXMuc2VydmljZS5jb25maWcuZm9ybWF0c10gOiAodGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXRzID09PSBudWxsID8gbnVsbCA6IHVuZGVmaW5lZClcbiAgICAgIH1cblxuICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgdGhpcy5xdWlsbEVkaXRvciA9IG5ldyBRdWlsbCh0aGlzLmVkaXRvckVsZW0sIHtcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgZGVidWc6IGRlYnVnIGFzIGFueSxcbiAgICAgICAgICBmb3JtYXRzOiBmb3JtYXRzIGFzIGFueSxcbiAgICAgICAgICBtb2R1bGVzLFxuICAgICAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgICAgIHJlYWRPbmx5LFxuICAgICAgICAgIGRlZmF1bHRFbXB0eVZhbHVlLFxuICAgICAgICAgIHNjcm9sbGluZ0NvbnRhaW5lcjogc2Nyb2xsaW5nQ29udGFpbmVyIGFzIGFueSxcbiAgICAgICAgICBzdHJpY3Q6IHRoaXMuc3RyaWN0LFxuICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lIHx8ICh0aGlzLnNlcnZpY2UuY29uZmlnLnRoZW1lID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy50aGVtZSA6ICdzbm93JylcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBTZXQgb3B0aW9uYWwgbGluayBwbGFjZWhvbGRlciwgUXVpbGwgaGFzIG5vIG5hdGl2ZSBBUEkgZm9yIGl0IHNvIHVzaW5nIHdvcmthcm91bmRcbiAgICAgICAgaWYgKHRoaXMubGlua1BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgY29uc3QgdG9vbHRpcCA9ICh0aGlzLnF1aWxsRWRpdG9yIGFzIGFueSk/LnRoZW1lPy50b29sdGlwXG4gICAgICAgICAgY29uc3QgaW5wdXQgPSB0b29sdGlwPy5yb290Py5xdWVyeVNlbGVjdG9yKCdpbnB1dFtkYXRhLWxpbmtdJylcbiAgICAgICAgICBpZiAoaW5wdXQ/LmRhdGFzZXQpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGFzZXQubGluayA9IHRoaXMubGlua1BsYWNlaG9sZGVyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBpZiAodGhpcy5jb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGZvcm1hdCA9IGdldEZvcm1hdCh0aGlzLmZvcm1hdCwgdGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXQpXG5cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgdGhpcy5xdWlsbEVkaXRvci5zZXRUZXh0KHRoaXMuY29udGVudCwgJ3NpbGVudCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLnZhbHVlU2V0dGVyKHRoaXMucXVpbGxFZGl0b3IsIHRoaXMuY29udGVudClcbiAgICAgICAgICB0aGlzLnF1aWxsRWRpdG9yLnNldENvbnRlbnRzKG5ld1ZhbHVlLCAnc2lsZW50JylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3IuZ2V0TW9kdWxlKCdoaXN0b3J5JykuY2xlYXIoKVxuICAgICAgfVxuXG4gICAgICAvLyBpbml0aWFsaXplIGRpc2FibGVkIHN0YXR1cyBiYXNlZCBvbiB0aGlzLmRpc2FibGVkIGFzIGRlZmF1bHQgdmFsdWVcbiAgICAgIHRoaXMuc2V0RGlzYWJsZWRTdGF0ZSgpXG5cbiAgICAgIHRoaXMuYWRkUXVpbGxFdmVudExpc3RlbmVycygpXG5cbiAgICAgIC8vIFRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB0cmlnZ2VycyBjaGFuZ2UgZGV0ZWN0aW9uLiBUaGVyZSdzIG5vIHNlbnNlIHRvIGludm9rZSB0aGUgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgaWYgYW55b25lIGlzXG4gICAgICAvLyBsaXN0ZW5pbmcgdG8gdGhlIGBvbkVkaXRvckNyZWF0ZWRgIGV2ZW50IGluc2lkZSB0aGUgdGVtcGxhdGUsIGZvciBpbnN0YW5jZSBgPHF1aWxsLXZpZXcgKG9uRWRpdG9yQ3JlYXRlZCk9XCIuLi5cIj5gLlxuICAgICAgaWYgKCF0aGlzLm9uRWRpdG9yQ3JlYXRlZC5vYnNlcnZlZCAmJiAhdGhpcy5vblZhbGlkYXRvckNoYW5nZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB3aWxsIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbiBhbmQgYG9uRWRpdG9yQ3JlYXRlZGAgd2lsbCBhbHNvIGNhbGwgYG1hcmtEaXJ0eSgpYFxuICAgICAgLy8gaW50ZXJuYWxseSwgc2luY2UgQW5ndWxhciB3cmFwcyB0ZW1wbGF0ZSBldmVudCBsaXN0ZW5lcnMgaW50byBgbGlzdGVuZXJgIGluc3RydWN0aW9uLiBXZSdyZSB1c2luZyB0aGUgYHJlcXVlc3RBbmltYXRpb25GcmFtZWBcbiAgICAgIC8vIHRvIHByZXZlbnQgdGhlIGZyYW1lIGRyb3AgYW5kIGF2b2lkIGBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yYCBlcnJvci5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLm9uVmFsaWRhdG9yQ2hhbmdlZCkge1xuICAgICAgICAgIHRoaXMub25WYWxpZGF0b3JDaGFuZ2VkKClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uRWRpdG9yQ3JlYXRlZC5lbWl0KHRoaXMucXVpbGxFZGl0b3IpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBzZWxlY3Rpb25DaGFuZ2VIYW5kbGVyID0gKHJhbmdlOiBSYW5nZSB8IG51bGwsIG9sZFJhbmdlOiBSYW5nZSB8IG51bGwsIHNvdXJjZTogc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgc2hvdWxkVHJpZ2dlck9uTW9kZWxUb3VjaGVkID0gIXJhbmdlICYmICEhdGhpcy5vbk1vZGVsVG91Y2hlZFxuXG4gICAgLy8gb25seSBlbWl0IGNoYW5nZXMgd2hlbiB0aGVyZSdzIGFueSBsaXN0ZW5lclxuICAgIGlmICghdGhpcy5vbkJsdXIub2JzZXJ2ZWQgJiZcbiAgICAgICF0aGlzLm9uRm9jdXMub2JzZXJ2ZWQgJiZcbiAgICAgICF0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlZC5vYnNlcnZlZCAmJlxuICAgICAgIXNob3VsZFRyaWdnZXJPbk1vZGVsVG91Y2hlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICBpZiAocmFuZ2UgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vbkJsdXIuZW1pdCh7XG4gICAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICAgIHNvdXJjZVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChvbGRSYW5nZSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9uRm9jdXMuZW1pdCh7XG4gICAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICAgIHNvdXJjZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlZC5lbWl0KHtcbiAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICBvbGRSYW5nZSxcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIHNvdXJjZVxuICAgICAgfSlcblxuICAgICAgaWYgKHNob3VsZFRyaWdnZXJPbk1vZGVsVG91Y2hlZCkge1xuICAgICAgICB0aGlzLm9uTW9kZWxUb3VjaGVkKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKVxuICAgIH0pXG4gIH1cblxuICB0ZXh0Q2hhbmdlSGFuZGxlciA9IChkZWx0YTogRGVsdGEsIG9sZERlbHRhOiBEZWx0YSwgc291cmNlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAvLyBvbmx5IGVtaXQgY2hhbmdlcyBlbWl0dGVkIGJ5IHVzZXIgaW50ZXJhY3Rpb25zXG4gICAgY29uc3QgdGV4dCA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0VGV4dCgpXG4gICAgY29uc3QgY29udGVudCA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKVxuXG4gICAgbGV0IGh0bWw6IHN0cmluZyB8IG51bGwgPSB0aGlzLmVkaXRvckVsZW0hLnF1ZXJ5U2VsZWN0b3IoJy5xbC1lZGl0b3InKSEuaW5uZXJIVE1MXG4gICAgaWYgKGh0bWwgPT09ICc8cD48YnI+PC9wPicgfHwgaHRtbCA9PT0gJzxkaXY+PGJyPjwvZGl2PicpIHtcbiAgICAgIGh0bWwgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tDaGFuZ2VzID0gdGhpcy50cmFja0NoYW5nZXMgfHwgdGhpcy5zZXJ2aWNlLmNvbmZpZy50cmFja0NoYW5nZXNcbiAgICBjb25zdCBzaG91bGRUcmlnZ2VyT25Nb2RlbENoYW5nZSA9IChzb3VyY2UgPT09ICd1c2VyJyB8fCB0cmFja0NoYW5nZXMgJiYgdHJhY2tDaGFuZ2VzID09PSAnYWxsJykgJiYgISF0aGlzLm9uTW9kZWxDaGFuZ2VcblxuICAgIC8vIG9ubHkgZW1pdCBjaGFuZ2VzIHdoZW4gdGhlcmUncyBhbnkgbGlzdGVuZXJcbiAgICBpZiAoIXRoaXMub25Db250ZW50Q2hhbmdlZC5vYnNlcnZlZCAmJiAhc2hvdWxkVHJpZ2dlck9uTW9kZWxDaGFuZ2UpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgaWYgKHNob3VsZFRyaWdnZXJPbk1vZGVsQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZShcbiAgICAgICAgICB0aGlzLnZhbHVlR2V0dGVyKHRoaXMucXVpbGxFZGl0b3IsIHRoaXMuZWRpdG9yRWxlbSEpXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgdGhpcy5vbkNvbnRlbnRDaGFuZ2VkLmVtaXQoe1xuICAgICAgICBjb250ZW50LFxuICAgICAgICBkZWx0YSxcbiAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICBodG1sLFxuICAgICAgICBvbGREZWx0YSxcbiAgICAgICAgc291cmNlLFxuICAgICAgICB0ZXh0XG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpXG4gICAgfSlcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXG4gIGVkaXRvckNoYW5nZUhhbmRsZXIgPSAoXG4gICAgZXZlbnQ6ICd0ZXh0LWNoYW5nZScgfCAnc2VsZWN0aW9uLWNoYW5nZScsXG4gICAgY3VycmVudDogYW55IHwgUmFuZ2UgfCBudWxsLCBvbGQ6IGFueSB8IFJhbmdlIHwgbnVsbCwgc291cmNlOiBzdHJpbmdcbiAgKTogdm9pZCA9PiB7XG4gICAgLy8gb25seSBlbWl0IGNoYW5nZXMgd2hlbiB0aGVyZSdzIGFueSBsaXN0ZW5lclxuICAgIGlmICghdGhpcy5vbkVkaXRvckNoYW5nZWQub2JzZXJ2ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIG9ubHkgZW1pdCBjaGFuZ2VzIGVtaXR0ZWQgYnkgdXNlciBpbnRlcmFjdGlvbnNcbiAgICBpZiAoZXZlbnQgPT09ICd0ZXh0LWNoYW5nZScpIHtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1aWxsRWRpdG9yLmdldFRleHQoKVxuICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKVxuXG4gICAgICBsZXQgaHRtbDogc3RyaW5nIHwgbnVsbCA9IHRoaXMuZWRpdG9yRWxlbSEucXVlcnlTZWxlY3RvcignLnFsLWVkaXRvcicpIS5pbm5lckhUTUxcbiAgICAgIGlmIChodG1sID09PSAnPHA+PGJyPjwvcD4nIHx8IGh0bWwgPT09ICc8ZGl2Pjxicj48L2Rpdj4nKSB7XG4gICAgICAgIGh0bWwgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICB0aGlzLm9uRWRpdG9yQ2hhbmdlZC5lbWl0KHtcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIGRlbHRhOiBjdXJyZW50LFxuICAgICAgICAgIGVkaXRvcjogdGhpcy5xdWlsbEVkaXRvcixcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBodG1sLFxuICAgICAgICAgIG9sZERlbHRhOiBvbGQsXG4gICAgICAgICAgc291cmNlLFxuICAgICAgICAgIHRleHRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNoYW5nZWQuZW1pdCh7XG4gICAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIG9sZFJhbmdlOiBvbGQsXG4gICAgICAgICAgcmFuZ2U6IGN1cnJlbnQsXG4gICAgICAgICAgc291cmNlXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRpc3Bvc2UoKVxuXG4gICAgdGhpcy5xdWlsbFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKVxuICAgIHRoaXMucXVpbGxTdWJzY3JpcHRpb24gPSBudWxsXG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnF1aWxsRWRpdG9yKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2RvdC1ub3RhdGlvbiAqL1xuICAgIGlmIChjaGFuZ2VzLnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLmVuYWJsZSghY2hhbmdlcy5yZWFkT25seS5jdXJyZW50VmFsdWUpXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLnBsYWNlaG9sZGVyKSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLnJvb3QuZGF0YXNldC5wbGFjZWhvbGRlciA9XG4gICAgICAgIGNoYW5nZXMucGxhY2Vob2xkZXIuY3VycmVudFZhbHVlXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLmRlZmF1bHRFbXB0eVZhbHVlKSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLnJvb3QuZGF0YXNldC5kZWZhdWx0RW1wdHlWYWx1ZSA9XG4gICAgICAgIGNoYW5nZXMuZGVmYXVsdEVtcHR5VmFsdWUuY3VycmVudFZhbHVlXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLnN0eWxlcykge1xuICAgICAgY29uc3QgY3VycmVudFN0eWxpbmcgPSBjaGFuZ2VzLnN0eWxlcy5jdXJyZW50VmFsdWVcbiAgICAgIGNvbnN0IHByZXZpb3VzU3R5bGluZyA9IGNoYW5nZXMuc3R5bGVzLnByZXZpb3VzVmFsdWVcblxuICAgICAgaWYgKHByZXZpb3VzU3R5bGluZykge1xuICAgICAgICBPYmplY3Qua2V5cyhwcmV2aW91c1N0eWxpbmcpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVTdHlsZSh0aGlzLmVkaXRvckVsZW0sIGtleSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50U3R5bGluZykge1xuICAgICAgICBPYmplY3Qua2V5cyhjdXJyZW50U3R5bGluZykuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWRpdG9yRWxlbSwga2V5LCB0aGlzLnN0eWxlc1trZXldKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlcy5jbGFzc2VzKSB7XG4gICAgICBjb25zdCBjdXJyZW50Q2xhc3NlcyA9IGNoYW5nZXMuY2xhc3Nlcy5jdXJyZW50VmFsdWVcbiAgICAgIGNvbnN0IHByZXZpb3VzQ2xhc3NlcyA9IGNoYW5nZXMuY2xhc3Nlcy5wcmV2aW91c1ZhbHVlXG5cbiAgICAgIGlmIChwcmV2aW91c0NsYXNzZXMpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzc2VzKHByZXZpb3VzQ2xhc3NlcylcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRDbGFzc2VzKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NlcyhjdXJyZW50Q2xhc3NlcylcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UnZCB3YW50IHRvIHJlLWFwcGx5IGV2ZW50IGxpc3RlbmVycyBpZiB0aGUgYGRlYm91bmNlVGltZWAgYmluZGluZyBjaGFuZ2VzIHRvIGFwcGx5IHRoZVxuICAgIC8vIGBkZWJvdW5jZVRpbWVgIG9wZXJhdG9yIG9yIHZpY2UtdmVyc2EgcmVtb3ZlIGl0LlxuICAgIGlmIChjaGFuZ2VzLmRlYm91bmNlVGltZSkge1xuICAgICAgdGhpcy5hZGRRdWlsbEV2ZW50TGlzdGVuZXJzKClcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvZG90LW5vdGF0aW9uICovXG4gIH1cblxuICBhZGRDbGFzc2VzKGNsYXNzTGlzdDogc3RyaW5nKTogdm9pZCB7XG4gICAgUXVpbGxFZGl0b3JCYXNlLm5vcm1hbGl6ZUNsYXNzTmFtZXMoY2xhc3NMaXN0KS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lZGl0b3JFbGVtLCBjKVxuICAgIH0pXG4gIH1cblxuICByZW1vdmVDbGFzc2VzKGNsYXNzTGlzdDogc3RyaW5nKTogdm9pZCB7XG4gICAgUXVpbGxFZGl0b3JCYXNlLm5vcm1hbGl6ZUNsYXNzTmFtZXMoY2xhc3NMaXN0KS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lZGl0b3JFbGVtLCBjKVxuICAgIH0pXG4gIH1cblxuICB3cml0ZVZhbHVlKGN1cnJlbnRWYWx1ZTogYW55KSB7XG5cbiAgICAvLyBvcHRpb25hbCBmaXggZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE0OTg4XG4gICAgaWYgKHRoaXMuZmlsdGVyTnVsbCAmJiBjdXJyZW50VmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuY29udGVudCA9IGN1cnJlbnRWYWx1ZVxuXG4gICAgaWYgKCF0aGlzLnF1aWxsRWRpdG9yKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBmb3JtYXQgPSBnZXRGb3JtYXQodGhpcy5mb3JtYXQsIHRoaXMuc2VydmljZS5jb25maWcuZm9ybWF0KVxuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy52YWx1ZVNldHRlcih0aGlzLnF1aWxsRWRpdG9yLCBjdXJyZW50VmFsdWUpXG5cbiAgICBpZiAodGhpcy5jb21wYXJlVmFsdWVzKSB7XG4gICAgICBjb25zdCBjdXJyZW50RWRpdG9yVmFsdWUgPSB0aGlzLnF1aWxsRWRpdG9yLmdldENvbnRlbnRzKClcbiAgICAgIGlmIChKU09OLnN0cmluZ2lmeShjdXJyZW50RWRpdG9yVmFsdWUpID09PSBKU09OLnN0cmluZ2lmeShuZXdWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRWYWx1ZSkge1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3RleHQnKSB7XG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3Iuc2V0VGV4dChjdXJyZW50VmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnF1aWxsRWRpdG9yLnNldENvbnRlbnRzKG5ld1ZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucXVpbGxFZGl0b3Iuc2V0VGV4dCgnJylcblxuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuID0gdGhpcy5kaXNhYmxlZCk6IHZvaWQge1xuICAgIC8vIHN0b3JlIGluaXRpYWwgdmFsdWUgdG8gc2V0IGFwcHJvcHJpYXRlIGRpc2FibGVkIHN0YXR1cyBhZnRlciBWaWV3SW5pdFxuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkXG4gICAgaWYgKHRoaXMucXVpbGxFZGl0b3IpIHtcbiAgICAgIGlmIChpc0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3IuZGlzYWJsZSgpXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlYWRPbmx5KSB7XG4gICAgICAgICAgdGhpcy5xdWlsbEVkaXRvci5lbmFibGUoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnZGlzYWJsZWQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChtb2RlbFZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uTW9kZWxDaGFuZ2UgPSBmblxuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uTW9kZWxUb3VjaGVkID0gZm5cbiAgfVxuXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLm9uVmFsaWRhdG9yQ2hhbmdlZCA9IGZuXG4gIH1cblxuICB2YWxpZGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMucXVpbGxFZGl0b3IpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgZXJyOiB7XG4gICAgICBtaW5MZW5ndGhFcnJvcj86IHtcbiAgICAgICAgZ2l2ZW46IG51bWJlclxuICAgICAgICBtaW5MZW5ndGg6IG51bWJlclxuICAgICAgfVxuICAgICAgbWF4TGVuZ3RoRXJyb3I/OiB7XG4gICAgICAgIGdpdmVuOiBudW1iZXJcbiAgICAgICAgbWF4TGVuZ3RoOiBudW1iZXJcbiAgICAgIH1cbiAgICAgIHJlcXVpcmVkRXJyb3I/OiB7IGVtcHR5OiBib29sZWFuIH1cbiAgICB9ID0ge31cbiAgICBsZXQgdmFsaWQgPSB0cnVlXG5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5xdWlsbEVkaXRvci5nZXRUZXh0KClcbiAgICAvLyB0cmltIHRleHQgaWYgd2FudGVkICsgaGFuZGxlIHNwZWNpYWwgY2FzZSB0aGF0IGFuIGVtcHR5IGVkaXRvciBjb250YWlucyBhIG5ldyBsaW5lXG4gICAgY29uc3QgdGV4dExlbmd0aCA9IHRoaXMudHJpbU9uVmFsaWRhdGlvbiA/IHRleHQudHJpbSgpLmxlbmd0aCA6ICh0ZXh0Lmxlbmd0aCA9PT0gMSAmJiB0ZXh0LnRyaW0oKS5sZW5ndGggPT09IDAgPyAwIDogdGV4dC5sZW5ndGggLSAxKVxuICAgIGNvbnN0IGRlbHRhT3BlcmF0aW9ucyA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKS5vcHNcbiAgICBjb25zdCBvbmx5RW1wdHlPcGVyYXRpb24gPSBkZWx0YU9wZXJhdGlvbnMgJiYgZGVsdGFPcGVyYXRpb25zLmxlbmd0aCA9PT0gMSAmJiBbJ1xcbicsICcnXS5pbmNsdWRlcyhkZWx0YU9wZXJhdGlvbnNbMF0uaW5zZXJ0KVxuXG4gICAgaWYgKHRoaXMubWluTGVuZ3RoICYmIHRleHRMZW5ndGggJiYgdGV4dExlbmd0aCA8IHRoaXMubWluTGVuZ3RoKSB7XG4gICAgICBlcnIubWluTGVuZ3RoRXJyb3IgPSB7XG4gICAgICAgIGdpdmVuOiB0ZXh0TGVuZ3RoLFxuICAgICAgICBtaW5MZW5ndGg6IHRoaXMubWluTGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIHZhbGlkID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXhMZW5ndGggJiYgdGV4dExlbmd0aCA+IHRoaXMubWF4TGVuZ3RoKSB7XG4gICAgICBlcnIubWF4TGVuZ3RoRXJyb3IgPSB7XG4gICAgICAgIGdpdmVuOiB0ZXh0TGVuZ3RoLFxuICAgICAgICBtYXhMZW5ndGg6IHRoaXMubWF4TGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIHZhbGlkID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXF1aXJlZCAmJiAhdGV4dExlbmd0aCAmJiBvbmx5RW1wdHlPcGVyYXRpb24pIHtcbiAgICAgIGVyci5yZXF1aXJlZEVycm9yID0ge1xuICAgICAgICBlbXB0eTogdHJ1ZVxuICAgICAgfVxuXG4gICAgICB2YWxpZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IGVyclxuICB9XG5cbiAgcHJpdmF0ZSBhZGRRdWlsbEV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZSgpXG5cbiAgICAvLyBXZSBoYXZlIHRvIGVudGVyIHRoZSBgPHJvb3Q+YCB6b25lIHdoZW4gYWRkaW5nIGV2ZW50IGxpc3RlbmVycywgc28gYGRlYm91bmNlVGltZWAgd2lsbCBzcGF3biB0aGVcbiAgICAvLyBgQXN5bmNBY3Rpb25gIHRoZXJlIHcvbyB0cmlnZ2VyaW5nIGNoYW5nZSBkZXRlY3Rpb25zLiBXZSBzdGlsbCByZS1lbnRlciB0aGUgQW5ndWxhcidzIHpvbmUgdGhyb3VnaFxuICAgIC8vIGB6b25lLnJ1bmAgd2hlbiB3ZSBlbWl0IGFuIGV2ZW50IHRvIHRoZSBwYXJlbnQgY29tcG9uZW50LlxuICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIG1hcmsgbW9kZWwgYXMgdG91Y2hlZCBpZiBlZGl0b3IgbG9zdCBmb2N1c1xuICAgICAgICBmcm9tRXZlbnQodGhpcy5xdWlsbEVkaXRvciwgJ3NlbGVjdGlvbi1jaGFuZ2UnKS5zdWJzY3JpYmUoXG4gICAgICAgICAgKFtyYW5nZSwgb2xkUmFuZ2UsIHNvdXJjZV0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlSGFuZGxlcihyYW5nZSBhcyBhbnksIG9sZFJhbmdlIGFzIGFueSwgc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuXG4gICAgICAvLyBUaGUgYGZyb21FdmVudGAgc3VwcG9ydHMgcGFzc2luZyBKUXVlcnktc3R5bGUgZXZlbnQgdGFyZ2V0cywgdGhlIGVkaXRvciBoYXMgYG9uYCBhbmQgYG9mZmAgbWV0aG9kcyB3aGljaFxuICAgICAgLy8gd2lsbCBiZSBpbnZva2VkIHVwb24gc3Vic2NyaXB0aW9uIGFuZCB0ZWFyZG93bi5cbiAgICAgIGxldCB0ZXh0Q2hhbmdlJCA9IGZyb21FdmVudCh0aGlzLnF1aWxsRWRpdG9yLCAndGV4dC1jaGFuZ2UnKVxuICAgICAgbGV0IGVkaXRvckNoYW5nZSQgPSBmcm9tRXZlbnQodGhpcy5xdWlsbEVkaXRvciwgJ2VkaXRvci1jaGFuZ2UnKVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuZGVib3VuY2VUaW1lID09PSAnbnVtYmVyJykge1xuICAgICAgICB0ZXh0Q2hhbmdlJCA9IHRleHRDaGFuZ2UkLnBpcGUoZGVib3VuY2VUaW1lKHRoaXMuZGVib3VuY2VUaW1lKSlcbiAgICAgICAgZWRpdG9yQ2hhbmdlJCA9IGVkaXRvckNoYW5nZSQucGlwZShkZWJvdW5jZVRpbWUodGhpcy5kZWJvdW5jZVRpbWUpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIHVwZGF0ZSBtb2RlbCBpZiB0ZXh0IGNoYW5nZXNcbiAgICAgICAgdGV4dENoYW5nZSQuc3Vic2NyaWJlKChbZGVsdGEsIG9sZERlbHRhLCBzb3VyY2VdKSA9PiB7XG4gICAgICAgICAgdGhpcy50ZXh0Q2hhbmdlSGFuZGxlcihkZWx0YSBhcyBhbnksIG9sZERlbHRhIGFzIGFueSwgc291cmNlKVxuICAgICAgICB9KVxuICAgICAgKVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIHRyaWdnZXJlZCBpZiBzZWxlY3Rpb24gb3IgdGV4dCBjaGFuZ2VkXG4gICAgICAgIGVkaXRvckNoYW5nZSQuc3Vic2NyaWJlKChbZXZlbnQsIGN1cnJlbnQsIG9sZCwgc291cmNlXSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWRpdG9yQ2hhbmdlSGFuZGxlcihldmVudCBhcyAndGV4dC1jaGFuZ2UnIHwgJ3NlbGVjdGlvbi1jaGFuZ2UnLCBjdXJyZW50LCBvbGQsIHNvdXJjZSlcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSBudWxsXG4gICAgfVxuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUXVpbGxFZGl0b3JDb21wb25lbnQpXG4gICAgfSxcbiAgICB7XG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBRdWlsbEVkaXRvckNvbXBvbmVudClcbiAgICB9XG4gIF0sXG4gIHNlbGVjdG9yOiAncXVpbGwtZWRpdG9yJyxcbiAgdGVtcGxhdGU6IGBcbiAgPG5nLWNvbnRhaW5lciAqbmdJZj1cInRvb2xiYXJQb3NpdGlvbiAhPT0gJ3RvcCdcIj5cbiAgICA8ZGl2IHF1aWxsLWVkaXRvci1lbGVtZW50ICpuZ0lmPVwiIXByZXNlcnZlXCI+PC9kaXY+XG4gICAgPHByZSBxdWlsbC1lZGl0b3ItZWxlbWVudCAqbmdJZj1cInByZXNlcnZlXCI+PC9wcmU+XG4gIDwvbmctY29udGFpbmVyPlxuICA8bmctY29udGVudCBzZWxlY3Q9XCJbcXVpbGwtZWRpdG9yLXRvb2xiYXJdXCI+PC9uZy1jb250ZW50PlxuICA8bmctY29udGFpbmVyICpuZ0lmPVwidG9vbGJhclBvc2l0aW9uID09PSAndG9wJ1wiPlxuICAgIDxkaXYgcXVpbGwtZWRpdG9yLWVsZW1lbnQgKm5nSWY9XCIhcHJlc2VydmVcIj48L2Rpdj5cbiAgICA8cHJlIHF1aWxsLWVkaXRvci1lbGVtZW50ICpuZ0lmPVwicHJlc2VydmVcIj48L3ByZT5cbiAgPC9uZy1jb250YWluZXI+XG5gLFxuICBzdHlsZXM6IFtcbiAgICBgXG4gICAgOmhvc3Qge1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIH1cbiAgICBgXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUXVpbGxFZGl0b3JDb21wb25lbnQgZXh0ZW5kcyBRdWlsbEVkaXRvckJhc2Uge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBASW5qZWN0KEVsZW1lbnRSZWYpIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgQEluamVjdChDaGFuZ2VEZXRlY3RvclJlZikgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBJbmplY3QoRG9tU2FuaXRpemVyKSBkb21TYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBhbnksXG4gICAgQEluamVjdChSZW5kZXJlcjIpIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgQEluamVjdChOZ1pvbmUpIHpvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KFF1aWxsU2VydmljZSkgc2VydmljZTogUXVpbGxTZXJ2aWNlXG4gICkge1xuICAgIHN1cGVyKFxuICAgICAgaW5qZWN0b3IsXG4gICAgICBlbGVtZW50UmVmLFxuICAgICAgY2QsXG4gICAgICBkb21TYW5pdGl6ZXIsXG4gICAgICBwbGF0Zm9ybUlkLFxuICAgICAgcmVuZGVyZXIsXG4gICAgICB6b25lLFxuICAgICAgc2VydmljZVxuICAgIClcbiAgfVxuXG59XG4iXX0=