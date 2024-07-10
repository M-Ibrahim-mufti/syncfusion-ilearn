import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-aside-bar',
  templateUrl: './aside-bar.component.html',
  styleUrl: './aside-bar.component.css',
})
export class AsideBarComponent implements OnInit {
  @Input() isSideBar:boolean = true

  public authConfig!: AuthConfig;
  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }
}
