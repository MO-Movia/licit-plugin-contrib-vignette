import TableColorCommand from './ui/TableColorCommand';

class TableBorderColorCommand extends TableColorCommand {
  getAttrName = (): string => {
    return 'borderColor';
  };
}

export default TableBorderColorCommand;
