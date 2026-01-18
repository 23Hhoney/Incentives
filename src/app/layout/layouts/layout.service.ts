import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
  ) { }
}
