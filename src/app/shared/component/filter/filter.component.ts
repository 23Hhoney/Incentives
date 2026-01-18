import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from 'app/shared/HttpService';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnChanges {
  filterFormGroup: FormGroup;
  @Input() filterOptionsArry: any;
  
  @Input() selectedFilters: any[];
  @Input() isCheckBoxVertical: any = false;
  @Input() itemFlag: any = false;
  @Input() closeOnClickOutside = true;
  appliedFilters: any[];
  @Output() updateFiltersAction = new EventEmitter<{
    selectedFilters: any[];
    hidePopOver: any;
  }>();
  @Output() closeAction = new EventEmitter<{}>();
  @Output() clearAction = new EventEmitter<{}>();
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    const matSelect = this._elementRef.nativeElement.querySelector('.mat-select');
    const matOption = document.querySelector('.mat-option');
    const target = event.target as Node;
    
    const isMatSelectClick = matSelect?.contains(target);
    const isMatOptionClick = matOption?.contains(target);
    
    if (this.closeOnClickOutside && !isMatSelectClick && !isMatOptionClick) {
      const clickedInside = this._elementRef.nativeElement.contains(target);
      if (!clickedInside) {
        this.close();
      }
    }
  }

  flag: boolean;
  isDropdownOpen = false;

  constructor(
    private _fb: FormBuilder,
    private _httpService: HttpService,
    private _translateService: TranslateService,
    private _datePipe: DatePipe,
    private _elementRef: ElementRef 
  ) {}
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.stopPropagation();
  }

  onDropdownOpen() {
    this.isDropdownOpen = true;
  }

  onDropdownClose() {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 150);
  }
  ngOnInit(): void {
  // this.flag = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterOptionsArry'] && this.filterOptionsArry.length > 0) {
      this.initFilterForm();
    }
  }
  
   onOutsideClick(event: any,flag): void {
  //   console.log('console.log chek item', this.itemFlag)
  //   // //this.closeAction.emit();
  //   // // console.log('console.logo chek sdjfkasdf', event)
  //   // var element = document.getElementById("cb");
  //   // console.log('console.log chek item', element)
  //   // // element.classList.remove("ShowDiv");
    }

  initFilterForm() {
   

    this.filterFormGroup = this._fb.group({
      appliedFilters: [[]],
    });

    this.filterOptionsArry.forEach((option) => {
      switch (option.type) {

        case "checkbox":
          let selectedCheckBoxVal = null;
          
          if (!this.filterFormGroup.controls[option.oid]) {
            this.filterFormGroup.addControl(option.oid, new FormArray([]));
          }
          const formArray = this.filterFormGroup.get(option.oid) as FormArray;
          if (option.fieldOptions && option.fieldOptions.length > 0) {
            option.fieldOptions.forEach((fieldOption,index) => {
             
              selectedCheckBoxVal = null;
              if(this.selectedFilters && this.selectedFilters.length>0)  {
                const valList = this.selectedFilters.filter(x=> x.oid == option.oid && index == x.index);
                if(valList.length>0 ) selectedCheckBoxVal = valList[0];
              }
              formArray.push(this._fb.control(selectedCheckBoxVal));
            });
          } else {
            if (option.optionsAPI) {
              option.fieldOptions = [];

              let param = option.optionsAPIParam;

              if(option.isIdentityService) {
               
              } else {
                this._httpService.post(option.optionsAPI, param).subscribe((result) => {
                  if (result && result.length > 0) {
                    result.forEach((element) => {
                      option.fieldOptions.push({
                        value: element.value,
                        id: element.id,
                      });
                    });
                  }

                  option.fieldOptions.forEach((fieldOption) => {
                    const control = this._fb.control(null);
                    formArray.push(control);
                  });

                  option.isLoading = false;
                });
              }
            }
          }
          break;
        case "text":
          let selectedValue = '';
          if(this.selectedFilters && this.selectedFilters.length>0)  {
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(valList.length>0) selectedValue = valList[0].value;
          }
          this.filterFormGroup.addControl(option.oid, new FormControl(selectedValue));
          break;
          case "texts":
          let selectedValues = '';
          if(this.selectedFilters && this.selectedFilters.length>0)  {
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(valList.length>0) selectedValues = valList[0].value;
          }
          this.filterFormGroup.addControl(option.oid, new FormControl(selectedValues));
          break;
          case "number":

            let selecteValue = '';
            if(this.selectedFilters && this.selectedFilters.length>0)  {
              const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
              if(valList.length>0) selecteValue = valList[0].value;
            }
         

            this.filterFormGroup.addControl(option.oid, new FormControl(selecteValue));
            break;
            case "toggle":
              let selectedToggleValue = false;
              if (this.selectedFilters && this.selectedFilters.length > 0) {
                const valList = this.selectedFilters.filter(x => x.oid == option.oid);
                if (valList.length > 0) {
                  selectedToggleValue = valList[0].value === 'Yes';
                }
              }
              this.filterFormGroup.addControl(option.oid, new FormControl(selectedToggleValue));
              break;
        case "dropdown":
          let selectedDropDownVal = null;
          if(this.selectedFilters && this.selectedFilters.length>0)  {
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(valList.length>0) selectedDropDownVal = valList[0].value;
          }

          this.filterFormGroup.addControl(
            option.oid,
            new FormControl(selectedDropDownVal)
          );
         

          if (option.optionsAPI) {
            option.fieldOptions = [];
            let param = option.optionsAPIParam;

            if(option.isIdentityService) {
            
            } else {
              this._httpService.post(option.optionsAPI, param)
              .subscribe((result) => {
                if (result && result.length > 0) {
                  result.forEach((element) => {
                    option.fieldOptions.push({
                      value: element.value,
                      id: element.id,
                    });
                  });
                }
                option.isLoading = false;
              });
            }
            
          }
          break;
        case "date":
          let selectedDate = '';
          if(this.selectedFilters && this.selectedFilters.length>0)  {
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(valList.length>0) selectedDate = valList[0].value;
          }
          this.filterFormGroup.addControl(option.oid, new FormControl(selectedDate));
          break;
        case 'date-range':
          let prevSelectedDate = [];
          if(this.selectedFilters && this.selectedFilters.length>0)  {
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(valList && valList.length>0 ) {
              const selectedDate = valList[0].value;
              prevSelectedDate.push(selectedDate.startDate);
              prevSelectedDate.push(selectedDate.endDate);
            }
          }
          this.filterFormGroup.addControl(option.oid, new FormControl(prevSelectedDate));
          break;
        case 'range':
          let prevSelectedRange = [];
          if(this.selectedFilters && this.selectedFilters.length>0) {
            let minValue;
            let maxValue;
            if(option.oid === 'salestotal') {
              minValue = this.selectedFilters.filter(x=> x.oid == 'SalesTotalMin')
              maxValue = this.selectedFilters.filter(x=> x.oid == 'SalesTotalMax')
            }
            if(option.oid === 'pointbalance') {
              minValue = this.selectedFilters.filter(x=> x.oid == 'PointBalanceMin')
              maxValue = this.selectedFilters.filter(x=> x.oid == 'PointBalanceMax')
            }
            const valList = this.selectedFilters.filter(x=> x.oid == option.oid);
            if(minValue || maxValue) {
              prevSelectedRange.push({
                min: minValue[0]?.value,
                max: maxValue[0]?.value,
              });
            }
          }
          this.filterFormGroup.addControl(option.oid, new FormControl(prevSelectedRange));
      }
    });
    
  }

  saveRange(item, value, type) {
    let range = this.filterFormGroup.controls[item].value
    if (range === null) {
      range = [{}]
    } else if(range.length === 0) {
      range.push({})
    }
    type === 'min' ? range[0]['min'] = value : range[0].max = value
    this.filterFormGroup.controls[item].setValue(range)
    this.updateFilters('range', item)
  }
  checkRangeValue(item, type) {
    const rangeValues = this.filterFormGroup.controls[item].value;
    if (rangeValues && rangeValues.length > 0) {
      if (type === 'min') {
        return rangeValues[0].min ? rangeValues[0].min : null
      } else{
        return rangeValues[0].max ? rangeValues[0].max : null
      }
    } else {
      return null;
    }
  }
  parentFilterOpen() {
    console.log("Parent filter open called!");
  }
 
  
  applyFilters() {
    if (!this.selectedFilters) this.selectedFilters = [];

    this.appliedFilters = [];

    this.selectedFilters.forEach((filter) => {
      console.log('console.log chek item value test', filter)
      this.appliedFilters.push(filter);
    });
    this.updateFiltersAction.emit({ selectedFilters: this.appliedFilters,hidePopOver:true });
   
    this.close();
  }

  updateFilters(type, oid, fieldOptions = null) {
    if (!this.selectedFilters) this.selectedFilters = [];

    switch (type) {
      case "text":
        let textValue = this.filterFormGroup.controls[oid].value;
        // console.log('textValue',textValue.length)

        if (textValue && textValue.length > 0) {
          let filterExists = false;

          this.selectedFilters.forEach((filter) => {
            if (filter.oid === oid) {
              filterExists = true;
              filter.value = textValue;
            }
          });

          if (!filterExists) {
            this.selectedFilters.push({
              oid: oid,
              value: textValue,
            });

          }
        } else {
          this.selectedFilters = this.selectedFilters.filter((filter) => {
            return filter.oid != oid;
          });
        }
        break;
        case "texts":
          let textValues = this.filterFormGroup.controls[oid].value;
          // console.log('textValue',textValue.length)
  
          if (textValues && textValues.length > 0) {
            let filterExistsd = false;
  
            this.selectedFilters.forEach((filter) => {
              if (filter.oid === oid) {
                filterExistsd = true;
                filter.value = textValues;
              }
            });
  
            if (!filterExistsd) {
              this.selectedFilters.push({
                oid: oid,
                value: textValues,
              });
  
            }
          } else {
            this.selectedFilters = this.selectedFilters.filter((filter) => {
              return filter.oid != oid;
            });
          }
          break;
        case "number":
          let numberValue = this.filterFormGroup.controls[oid].value;
          // console.log('numberValue',numberValue.length)

          if (numberValue) {
            let filterExists = false;
  
            this.selectedFilters.forEach((filter) => {
              if (filter.oid === oid) {
                filterExists = true;
                filter.value = numberValue+ '';
              }
            });
  
            if (!filterExists) {
              this.selectedFilters.push({
                oid: oid,
                value: numberValue,
              });

            }
          } else {
            this.selectedFilters = this.selectedFilters.filter((filter) => {
              return filter.oid != oid;
            });
          }
          break;
      case "dropdown":
        console.log("dropdown");
        let dropdownValue = this.filterFormGroup.controls[oid];

        if (dropdownValue) {
          let filterExists = false;

          this.selectedFilters.forEach((filter) => {
            if (filter.oid === oid) {
              filterExists = true;
              filter.value = dropdownValue.value;
            }
          });

          if (!filterExists) {
            this.selectedFilters.push({
              oid: oid,
              value: dropdownValue.value
            });
          }
        } else {
          this.selectedFilters = this.selectedFilters.filter((filter) => {
            let isFilterToRemove = filter.oid === oid;
            let isDependentOnFilter = false;

            this.selectedFilters.forEach((selectedFilter) => {
              if (
                selectedFilter.value.getItemsOnSelect &&
                selectedFilter.value.getItemsOnSelect === filter.oid
              ) {
                isDependentOnFilter = true;
              }
            });

            return !isFilterToRemove && !isDependentOnFilter;
          });
        }
        break;
      case "date":
        let dateVal = this.filterFormGroup.controls[oid ].value;
        if (dateVal && dateVal.toDate()) {
          let filterExists = false;

          this.selectedFilters.forEach((filter) => {
            if (filter.oid === oid) {
              filterExists = true;
              filter.value = dateVal.toDate();
            }
          });

          if (!filterExists) {
            this.selectedFilters.push({
              oid: oid,
              value: dateVal.toDate(),
            });

          }
        } else {
          this.selectedFilters = this.selectedFilters.filter((filter) => {
            return filter.oid != oid;
          });
        }
        break;
      case "range":
        let selectedRange = this.filterFormGroup.controls[oid].value;
        let minrangeFilterExists = false;
        let maxrangeFilterExists = false;
        if(oid === 'pointbalance') {
          if(selectedRange && selectedRange.length>0) {
            const minValue = selectedRange[0].min;
            const maxValue = selectedRange[0].max;
            if (!minValue) {
              this.selectedFilters = this.selectedFilters.filter(filter => filter.oid !== 'PointBalanceMin');
            } else {
              this.selectedFilters.forEach((filter) => {
                if (filter.oid === 'PointBalanceMin') {
                  minrangeFilterExists = true;
                  filter.value = minValue;
                }})
                if (!minrangeFilterExists) {
                  this.selectedFilters.push({
                    oid: 'PointBalanceMin',
                    value: minValue
                  });
                }
            }
            if (!maxValue) {
              this.selectedFilters = this.selectedFilters.filter(filter => filter.oid !== 'PointBalanceMax');
            } else {
              this.selectedFilters.forEach((filter) => {
                if (filter.oid === 'PointBalanceMax') {
                  maxrangeFilterExists = true;
                  filter.value = maxValue;
                }})
                if (!maxrangeFilterExists) {
                  this.selectedFilters.push({
                    oid: 'PointBalanceMax',
                    value: maxValue
                  });
                }
            }
          }
        }
        if(oid === 'salestotal') {
          if(selectedRange && selectedRange.length > 0) {
              const minValue = selectedRange[0].min;
              const maxValue = selectedRange[0].max;
              if (!minValue) {
                this.selectedFilters = this.selectedFilters.filter(filter => filter.oid !== 'SalesTotalMin');
              } else {
                this.selectedFilters.forEach((filter) => {
                  if (filter.oid === 'SalesTotalMin') {
                    minrangeFilterExists = true;
                    filter.value = minValue;
                  }})
                  if (!minrangeFilterExists) {
                    this.selectedFilters.push({
                      oid: 'SalesTotalMin',
                      value: minValue
                    });
                  }
              }
              if (!maxValue) {
                this.selectedFilters = this.selectedFilters.filter(filter => filter.oid !== 'SalesTotalMax');
              } else {
                this.selectedFilters.forEach((filter) => {
                  if (filter.oid === 'SalesTotalMax') {
                    maxrangeFilterExists = true;
                    filter.value = maxValue;
                  }})
                  if (!maxrangeFilterExists) {
                    this.selectedFilters.push({
                      oid: 'SalesTotalMax',
                      value: maxValue
                    });
                  }
              }
            }
          }
        break;
      case "date-range":
        let dateValue = this.filterFormGroup.controls[oid ].value;
        if(dateValue && dateValue.length>0) {
          let startValue = dateValue[0];
          let endValue = dateValue[1];

          fieldOptions = [];
          if (startValue && endValue) {
            let filterExists = false;

            this.selectedFilters.forEach((filter) => {
              if (filter.oid === oid) {
                filterExists = true;

                filter.value = {
                  startDate:startValue,
                  endDate:endValue
                };

              }
            });

            if (!filterExists) {

              this.selectedFilters.push({
                oid: oid,
                value: {
                  startDate:startValue,
                  endDate:endValue
                },
              });
            }
          }
        }
        break;
      case "checkbox":
        // must set timeout here because the value from the checkbox doesn't update before running this code.
        setTimeout(() => {
          let checkboxArray = this.filterFormGroup.get(oid) as FormArray;

          Object.keys(checkboxArray.controls).forEach((key, keyIndex) => {
            let filterExists = false;

            if (checkboxArray.controls[key].value) {
              this.selectedFilters.forEach((filter) => {
                if (
                  filter.oid === oid &&
                  filter.index === keyIndex
                ) {
                  filterExists = true;
                }
              });

              if (!filterExists) {
                // console.log('=====', this.filterFormGroup.get(oid));
                if (this.selectedFilters.filter(obj => obj.oid === oid).length > 0 && checkboxArray.controls[key].value) {
                  const existedCheckboxIndex: number = this.selectedFilters.findIndex(obj => obj.oid === oid);
                  checkboxArray.controls[this.selectedFilters[existedCheckboxIndex].index].setValue(false);
                  this.selectedFilters.splice(existedCheckboxIndex, 1);
                }
                this.selectedFilters.push({
                  oid: oid,
                  value: fieldOptions.id,
                  label: fieldOptions.value,
                  index:keyIndex
                });
              }
            } else {
              this.selectedFilters = this.selectedFilters.filter((filter) => {
                return filter.oid != oid || filter.index != keyIndex;
              });
            }
          });
        });
      case "toggle":
        const toggleValue = this.filterFormGroup.controls[oid].value;

        if (toggleValue !== null) {
          let filterExists = false;

          this.selectedFilters.forEach((filter) => {
            if (filter.oid === oid) {
              filterExists = true;
              filter.value = toggleValue ? 'Yes' : 'No';
            }
          });

          if (!filterExists) {
            this.selectedFilters.push({
              oid: oid,
              value: toggleValue ? 'Yes' : 'No',
              label: toggleValue ? 'Yes' : 'No'
            });
          }
        } else {
          this.selectedFilters = this.selectedFilters.filter((filter) => {
            return filter.oid != oid;
          });
        }
        break;
    }
  }

  clearFilters() {
    this.selectedFilters = [];

    Object.keys(this.filterFormGroup.controls).forEach(key => {
      // If the control has nested controls, it is a form array, used for checkbox type filters.
      if (!this.filterFormGroup.controls[key]['controls']) {
        this.filterFormGroup.controls[key].setValue(null);
      } else {
        let formArray = this.filterFormGroup.get(key) as FormArray;

        Object.keys(formArray.controls).forEach(arrKey => {
          formArray.controls[arrKey].setValue(false);
        });
      }
    });

    this.appliedFilters = [];

    this.selectedFilters.forEach(filter => {
      this.appliedFilters.push(filter);
    });


    this.updateFiltersAction.emit({ selectedFilters: this.selectedFilters,hidePopOver:false });
  }

  ClearFilterAction()
  {
    this.clearAction.emit();
  }
  close(){
    this.closeAction.emit();
  }

}

