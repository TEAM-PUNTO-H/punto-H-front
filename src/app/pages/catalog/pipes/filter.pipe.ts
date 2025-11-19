import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[], filterFn: (item: T) => boolean): T[] {
    if (!items || !filterFn) {
      return items;
    }

    return items.filter(filterFn);
  }
}

