import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { UpdateAdminUserDto } from './update-admin-user.dto';

describe('UpdateAdminUserDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const parse = (body: object) =>
    pipe.transform(body, {
      type: 'body',
      metatype: UpdateAdminUserDto,
    }) as Promise<UpdateAdminUserDto>;

  it('should accept a role and a username together', async () => {
    const dto = await parse({ role: 'ADMIN', username: 'newtag' });

    expect(dto).toEqual({ role: 'ADMIN', username: 'newtag' });
  });

  it('should reject an unknown role', async () => {
    await expect(parse({ role: 'SUPERADMIN' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should trim the username before checking its length', async () => {
    await expect(parse({ username: '  ab  ' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(parse({ username: '  abc  ' })).resolves.toEqual({
      username: 'abc',
    });
  });

  it('should reject a username longer than 30 characters', async () => {
    await expect(parse({ username: 'a'.repeat(31) })).rejects.toThrow(
      BadRequestException,
    );
  });

  it.each(['email', 'name'])(
    'should refuse to change the %s',
    async (field) => {
      await expect(parse({ [field]: 'value@example.com' })).rejects.toThrow(
        BadRequestException,
      );
    },
  );
});
