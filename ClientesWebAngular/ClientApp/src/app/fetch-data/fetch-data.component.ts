import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html',
})
export class FetchDataComponent implements OnDestroy {
  public forecasts: IWeatherForecast[];
  private destroy$: Subject<void> = new Subject<void>();
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<IWeatherForecast[]>(baseUrl + 'api/SampleData/WeatherForecasts')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
      this.forecasts = result;
    }, (error) => console.error(error));
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }
}

interface IWeatherForecast {
  dateFormatted: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
