export class EditorSettings {
  constructor(obj = {} as any) {}
}

export class Settings {
  title: string;
  adminToken: string;
  adminPath: string;
  domain: string;
  enableAnalytics: boolean;
  enableAutoUpdates: boolean;
  editor: EditorSettings;

  constructor(obj: Settings = {} as any) {
    this.title = obj?.title;
    this.adminToken = obj?.adminToken;
    this.adminPath = obj?.adminPath;
    this.domain = obj?.domain;
    this.enableAnalytics = obj?.enableAnalytics;
    this.enableAutoUpdates = obj?.enableAutoUpdates;
    this.editor = obj?.editor ? new EditorSettings(obj.editor) : new EditorSettings();
  }
}
