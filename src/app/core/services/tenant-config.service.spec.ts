import { TestBed } from '@angular/core/testing';
import { TenantConfigService } from './tenant-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TenantConfigService', () => {
  let service: TenantConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TenantConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default tenant as amani', () => {
    expect(service.getCurrentTenant()).toBe('amani');
  });

  it('should return available tenants', () => {
    const tenants = service.getAvailableTenants();
    expect(tenants).toContain('amani');
    expect(tenants).toContain('generic');
    expect(tenants).toContain('demo-ngo');
  });

  it('should generate storage key with tenant prefix', () => {
    const key = service.getStorageKey('test');
    expect(key).toContain('amani');
    expect(key).toContain('test');
  });
});
