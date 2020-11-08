import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-strategy';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { LOGIN_ACCESS_TOKEN } from '../tokens/tokens.constants';
import { TokensService } from '../tokens/tokens.service';
import { AccessTokenClaims, AccessTokenParsed } from './auth.interface';
import minimatch from 'minimatch';

class StaartStrategy extends Strategy {
  name = 'jwt';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(StaartStrategy) {
  constructor(
    private apiKeyService: ApiKeysService,
    private tokensService: TokensService,
  ) {
    super();
  }

  private safeSuccess(result: AccessTokenParsed) {
    return this.success(result);
  }

  async authenticate(request: Request) {
    /** API key authorization */
    let apiKey =
      request.query['api_key'] ??
      request.headers['x-api-key'] ??
      request.headers.authorization;
    if (typeof apiKey === 'string') {
      if (apiKey.startsWith('Bearer ')) apiKey = apiKey.replace('Bearer ', '');
      try {
        const apiKeyDetails = await this.apiKeyService.getApiKeyFromKey(apiKey);
        const referer = request.headers.referer;
        if (Array.isArray(apiKeyDetails.referrerRestrictions) && referer) {
          let referrerRestrictionsMet = !apiKeyDetails.referrerRestrictions
            .length;
          apiKeyDetails.referrerRestrictions.forEach((restriction) => {
            referrerRestrictionsMet =
              referrerRestrictionsMet ||
              minimatch(referer, restriction as string);
          });
          if (!referrerRestrictionsMet)
            return this.fail('Referrer restrictions not met', 401);
        }
        return this.safeSuccess({
          type: 'api-key',
          id: apiKeyDetails.id,
          scopes: apiKeyDetails.scopes as string[],
        });
      } catch (error) {}
    }

    /** Bearer JWT authorization */
    let bearerToken = request.headers.authorization;
    if (typeof bearerToken !== 'string')
      return this.fail('No token found', 401);
    if (bearerToken.startsWith('Bearer '))
      bearerToken = bearerToken.replace('Bearer ', '');
    try {
      const payload = this.tokensService.verify(
        LOGIN_ACCESS_TOKEN,
        bearerToken,
      ) as AccessTokenClaims;
      const { sub, id, scopes } = payload;
      return this.safeSuccess({ type: 'user', id, scopes });
    } catch (error) {}

    return this.fail('Invalid token', 401);
  }
}
