import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeroService } from '../hero.service';
import { IHero } from '../model/hero';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  heroes: IHero[] = [];
  private destroy$: Subject<void> = new Subject<void>();
  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((heroes) => this.heroes = heroes.slice(1, 5));
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }
}
