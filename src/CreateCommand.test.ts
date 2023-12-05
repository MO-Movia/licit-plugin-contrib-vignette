import createCommand from "./CreateCommand";

describe('create command', () => {
  it('should return new custom command', () => {

    let executecall = () => {
      return true
    };
    expect(createCommand(executecall)).toBeDefined();

  });
});