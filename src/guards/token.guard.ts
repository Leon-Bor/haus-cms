import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DatabaseService } from '../services/database/database.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private databaseService: DatabaseService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const key = request.headers?.['authorization'];
      if (key && key == this.databaseService.getItem('settings.adminToken')) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
