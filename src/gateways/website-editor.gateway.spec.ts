import { Test, TestingModule } from '@nestjs/testing';
import { WebsiteEditorGateway } from './website-editor.gateway';

describe('WebsiteEditorGateway', () => {
  let gateway: WebsiteEditorGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsiteEditorGateway],
    }).compile();

    gateway = module.get<WebsiteEditorGateway>(WebsiteEditorGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
