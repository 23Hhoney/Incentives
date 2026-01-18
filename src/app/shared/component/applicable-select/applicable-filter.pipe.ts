import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'applicableFilter'
})
export class ApplicableFilterPipe implements PipeTransform {

    transform(items: any[], searchText: string): any[] {
        if (!items) {return []; }
        if (!searchText) {return items; }
        searchText = searchText.toLowerCase();
        return items.filter( it => {
            return it.value.toLowerCase().includes(searchText);
        });
    }

}
