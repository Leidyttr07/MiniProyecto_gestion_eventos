import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };

  beforeEach(() => {
    service = new AuthService(mockUsersService as any, mockJwtService as any);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login should throw UnauthorizedException when user not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'a@b.com', password: 'pass' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
