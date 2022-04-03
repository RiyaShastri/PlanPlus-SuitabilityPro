import { Input, Component, ChangeDetectionStrategy } from '@angular/core';
import {
    ViewContainerRef,
    NgZone,
    Renderer2,
    HostListener
} from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core';
import { Directive, ElementRef, Injector } from '@angular/core';
import {
    NgbTooltip,
    NgbTooltipConfig,
    Placement
} from '@ng-bootstrap/ng-bootstrap';

@Directive({
    selector: '[appNoOverflowTooltip]'
})
export class NoOverflowTooltipDirective extends NgbTooltip {
    @Input() appNoOverflowTooltip: any;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        injector: Injector,
        componentFactoryResolver: ComponentFactoryResolver,
        viewContainerRef: ViewContainerRef,
        config: NgbTooltipConfig,
        ngZone: NgZone
    ) {
        super(
            el,
            renderer,
            injector,
            componentFactoryResolver,
            viewContainerRef,
            config,
            ngZone
        );
    }

    @HostListener('mouseover')
    onmouseover() {
        this.ngbTooltip = this.appNoOverflowTooltip;
        const e: HTMLSpanElement = this.el.nativeElement;
        if (e.id === 'on-mouseover-tooltip' && e.offsetWidth < e.scrollWidth && !this.isOpen()) {
            super.open(this.appNoOverflowTooltip);
        } else {
            setTimeout(() => {
                super.close();
            }, 0);
        }
    }

    @HostListener('click')
    onclick() {
        this.ngbTooltip = this.appNoOverflowTooltip;
        const e: HTMLSpanElement = this.el.nativeElement;
        if (e.id !== 'on-mouseover-tooltip' && e.offsetWidth < e.scrollWidth && !this.isOpen()) {
            super.open(this.appNoOverflowTooltip);
        } else {
            setTimeout(() => {
                super.close();
            }, 0);
        }
    }

    @HostListener('mouseleave')
    onmouseleave() {
        super.close();
    }
}
