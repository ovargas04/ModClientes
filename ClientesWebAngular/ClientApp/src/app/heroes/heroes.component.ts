import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeroService } from '../hero.service';
import { MessageService } from '../message.service';
import { IHero } from '../model/hero';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent implements OnInit, OnDestroy {
  selectedHero: IHero;
  private destroy$: Subject<void> = new Subject<void>();
  heroes: IHero[];
  hero: IHero = {
    id: 1,
    name: 'Windstorm',
  };

  constructor(private heroService: HeroService, private messageService: MessageService) { }

  getHeroes(): void {
    this.heroService.getHeroes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((heroes) => this.heroes = heroes);
  }

  onSelect(hero: IHero): void {
    this.selectedHero = hero;
  }

  ngOnInit() {
    this.getHeroes();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }
}
