import { Component, Input, OnInit } from '@angular/core';
import { IHero } from '../model/hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './heroesDetail.component.html',
  styleUrls: ['./heroesDetail.component.css'],
})
export class HeroesDetailComponent implements OnInit {
  @Input() hero: IHero;
  constructor() {}

  onSelect(hero: IHero): void {}

  ngOnInit() {}
}
