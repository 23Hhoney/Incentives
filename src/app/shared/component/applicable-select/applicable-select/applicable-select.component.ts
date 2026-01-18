import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectLabelOption, SelectReturn } from '../applicable-select-contract';

@Component({
  selector: 'app-applicable-select',
  templateUrl: './applicable-select.component.html',
  styleUrls: ['./applicable-select.component.scss']
})
export class ApplicableSelectComponent implements OnInit, OnChanges {

    @Input() containerClasses = '';
    @Input() data: SelectLabelOption[] = [] as SelectLabelOption[];
    activeOption: SelectLabelOption = {} as SelectLabelOption;
    @Input() label = 'Applicable For';
    selectAll = false;

    @Output() emitData = new EventEmitter<SelectReturn>();
    updatedData: SelectReturn;
    searchText = '';

    constructor() { }

    ngOnInit(): void {
        // this.initializeSelect();
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
        if (this.data) {
            if (changes['data'] ) {
                this.initializeSelect();
            }
        }
    }

    initializeSelect(): void {
        if (this.data !== undefined) {
            if (this.data.length > 0) {
                this.data.forEach(obj => {
                    if (obj.selected) {
                        this.activeOption = obj;
                    }
                });
                this.doCheck();
                this.updatedDataEmit();
            }
        }
    }

    resetApplicable(): void {
        this.data = [];
        this.activeOption = {} as SelectLabelOption;
        this.selectAll = false;
    }

    doSelectAll(): void {
        setTimeout(() => {
            if (this.selectAll) {
                this.selectAll = true;
                this.activeOption.options.forEach(obj => {
                    obj.checked = true;
                });
            } else {
                this.selectAll = false;
                this.activeOption.options.forEach(obj => {
                    obj.checked = false;
                });
            }
            this.updatedDataEmit();
        }, 10);
    }

    doCheck(): void {
        if (this.activeOption.options.filter(obj => obj.checked).length === this.activeOption.options.length) {
            this.selectAll = true;
        } else {
            this.selectAll = false;
        }
    }

    labelSelect(ele: SelectLabelOption): void {
        this.searchText = '';
        this.data.forEach(obj => {
            if (obj.label === ele.label) {
                obj.selected = true;
                this.activeOption = obj;
            } else {
                obj.selected = false;
                // obj.options.forEach(element => { element.checked = false; });
            }
        });
        this.doCheck();
        this.updatedDataEmit();
    }
 
    displayFn(obj?): string | undefined {
        return obj ? obj.value : undefined;
    }

    checkboxClicked(): void {
        setTimeout(() => {
            this.doCheck();
            this.updatedDataEmit();
        }, 10);
        
    }

    updatedDataEmit(): void {
        this.updatedData = {type: this.activeOption.label, data: this.activeOption.options.filter(obj => obj.checked)};
        this.emitData.emit(this.updatedData);
    }
}
