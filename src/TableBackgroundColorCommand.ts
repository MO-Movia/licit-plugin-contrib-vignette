import TableColorCommand from './ui/TableColorCommand';

class TableBackgroundColorCommand extends TableColorCommand {
  getAttrName = (): string => {
    return 'background';
  };
}

export default TableBackgroundColorCommand;
