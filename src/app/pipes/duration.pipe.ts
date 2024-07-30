import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    // Total seconds as an integer
    const totalSeconds: number = Math.round(value * 60); // Convert minutes to seconds

    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;

    return `${minutes} min ${seconds} sec`;
  }

}
