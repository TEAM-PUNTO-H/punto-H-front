import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform<T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[] {
    if (!items || !searchTerm || !searchFields.length) {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(term);
      });
    });
  }
}

