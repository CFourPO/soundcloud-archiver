import { NamePage } from './app.po';

describe('name App', function() {
  let page: NamePage;

  beforeEach(() => {
    page = new NamePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
