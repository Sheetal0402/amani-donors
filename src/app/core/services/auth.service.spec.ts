import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { TenantConfigService } from './tenant-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TenantConfigService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially not be logged in', () => {
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('should have mock users', () => {
    const users = service.getMockUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].email).toBeDefined();
    expect(users[0].role).toBeDefined();
  });

  it('should authenticate valid user', (done) => {
    service.login('admin@amani.org', 'password123').subscribe({
      next: (authState) => {
        expect(authState.isLoggedIn).toBeTruthy();
        expect(authState.user?.email).toBe('admin@amani.org');
        done();
      }
    });
  });

  it('should reject invalid credentials', () => {
    expect(() => {
      service.login('invalid@test.com', 'wrongpassword');
    }).toThrow();
  });
});
