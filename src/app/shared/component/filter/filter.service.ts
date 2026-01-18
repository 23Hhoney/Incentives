import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  highlightFilter: boolean;
  appliedFilters: any;
  filterOptions:any;
  filterShowing = false;

  constructor() { }

  applyFilter(event,filterElement,apiRequest){
    this.highlightFilter = false;
    const filters = event.selectedFilters;
    this.appliedFilters = filters;
    filterElement.popover = "";
    if(event.hidePopOver)
    filterElement.hide();

    apiRequest.filterBody.filters = this.appliedFilters;

    if(filters && filters.length>0) this.highlightFilter = true;

    this.fetchGridData()
  }


  fetchGridData() {
  }
  showFilter(filterContainer, filterElement) {
    this.filterOptions = this.configureFilters();
    if (filterContainer && filterContainer.popover && filterContainer.popover != '' && this.filterShowing) {
      this.closeFilter(filterContainer);
    } else {
      this.closeFilter(filterContainer);
      filterContainer.show();
      // filterContainer.setOpen(true);
      filterContainer.popover = filterElement;
      this.filterShowing = true;
    }
    
  }
  configureFilters(): any {
   
  }

  closeFilter(filterElement) {
    if (filterElement)  {
      filterElement.popover = "";
      filterElement.hide();
      this.filterShowing = false;
    }
  }
}
