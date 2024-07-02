import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {

  transform(items: any[], key: string): any[] {
    if (!Array.isArray(items)) {
      console.error('GroupByPipe: The provided value is not an array:', items);
      return [];
    }

    if (!key) {
      console.error('GroupByPipe: The provided key is invalid:', key);
      return items;
    }

    const groupedItems = items.reduce((acc, item) => {
      const property = item[key];
      acc[property] = acc[property] || [];
      acc[property].push(item);
      return acc;
    }, {});

    return Object.keys(groupedItems).map(key => ({ key, value: groupedItems[key] }));
  }

}
